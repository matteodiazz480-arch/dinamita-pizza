import React, { useRef, useEffect, useState, useCallback } from "react";
import { useReducedMotion } from "framer-motion";
import "./GooeyNav.css";

export default function GooeyNav({
  items = [],
  theme = "light",
  size = "md",
  frame = true,
  particleCount = 12,
  spread = 40,
  animationTime = 500,
  timeVariance = 200,
  wobble = 0.3,
  hoverEffect = true,
  activeIndex: controlledActiveIndex,
  onSelect,
  ariaLabel = "Navegación principal",
}) {
  const prefersReducedMotion = useReducedMotion();
  const navRef = useRef(null);
  const pillRef = useRef(null);
  const hasMeasuredRef = useRef(false);
  const [internalActive, setInternalActive] = useState(0);
  const [pillStyle, setPillStyle] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    ready: false,
    animated: false,
  });

  const activeIndex =
    controlledActiveIndex !== undefined && controlledActiveIndex >= 0
      ? controlledActiveIndex
      : internalActive;

  const updatePillPosition = useCallback((index, shouldAnimate = true) => {
    if (!navRef.current) return;
    const listItems = navRef.current.querySelectorAll(".gooey-nav-item");
    const safeIdx = Math.max(0, Math.min(index, listItems.length - 1));
    const targetEl = listItems[safeIdx];
    if (!targetEl) return;

    const x = targetEl.offsetLeft;
    const y = targetEl.offsetTop;
    const width = targetEl.offsetWidth;
    const height = targetEl.offsetHeight;

    if (width === 0 || height === 0) return;

    const enableAnim = hasMeasuredRef.current && shouldAnimate;
    hasMeasuredRef.current = true;

    setPillStyle({
      x,
      y,
      width,
      height,
      ready: true,
      animated: enableAnim,
    });
  }, []);

  useEffect(() => {
    updatePillPosition(activeIndex, true);
  }, [activeIndex, updatePillPosition, items.length]);

  useEffect(() => {
    const handleResize = () => updatePillPosition(activeIndex, false);
    window.addEventListener("resize", handleResize);

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        updatePillPosition(activeIndex, false);
      });
    }

    let resizeObserver;
    if (typeof ResizeObserver !== "undefined" && navRef.current) {
      resizeObserver = new ResizeObserver(() => {
        updatePillPosition(activeIndex, false);
      });
      resizeObserver.observe(navRef.current);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [activeIndex, updatePillPosition]);

  const spawnParticles = useCallback(() => {
    if (prefersReducedMotion || !pillRef.current || particleCount <= 0) return;
    const holder = pillRef.current;

    const existing = holder.querySelectorAll(".gooey-nav-particle");
    existing.forEach((p) => p.remove());

    const colors = ["#BCE838", "#d4f269", "#ffffff"];

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement("span");
      particle.className = "gooey-nav-particle";

      const angle =
        ((Math.PI * 2) / particleCount) * i + (i % 2 === 0 ? wobble : -wobble);
      const radius = spread * (0.42 + (i % 3) * 0.18);
      const tx = Math.cos(angle) * (radius * 0.6);
      const ty = Math.sin(angle) * (radius * 0.5);
      const txEnd = Math.cos(angle) * radius;
      const tyEnd = Math.sin(angle) * (radius * 0.78);
      const duration =
        animationTime + ((i % 3) - 1) * (timeVariance * 0.45);
      const dotSize = size === "sm" ? 4 + (i % 2) * 2 : 5 + (i % 3) * 2;

      particle.style.width = `${dotSize}px`;
      particle.style.height = `${dotSize}px`;
      particle.style.background = colors[i % colors.length];
      particle.style.setProperty("--tx", `${tx.toFixed(1)}px`);
      particle.style.setProperty("--ty", `${ty.toFixed(1)}px`);
      particle.style.setProperty("--tx-end", `${txEnd.toFixed(1)}px`);
      particle.style.setProperty("--ty-end", `${tyEnd.toFixed(1)}px`);
      particle.style.setProperty(
        "--particle-duration",
        `${Math.max(240, duration)}ms`
      );

      holder.appendChild(particle);
      setTimeout(() => {
        particle.remove();
      }, duration + 60);
    }
  }, [
    prefersReducedMotion,
    particleCount,
    spread,
    animationTime,
    timeVariance,
    wobble,
    size,
  ]);

  const handleClick = (e, index, item) => {
    e.preventDefault();
    setInternalActive(index);
    updatePillPosition(index, true);
    spawnParticles();

    if (onSelect) {
      onSelect(index, item);
    }

    if (item?.href && item.href.startsWith("#")) {
      const target = document.querySelector(item.href);
      if (target) {
        const headerOffset = 72;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - headerOffset;

        window.scrollTo({
          top: Math.max(0, offsetPosition),
          behavior: prefersReducedMotion ? "auto" : "smooth",
        });
      }
    }
  };

  return (
    <div
      className={[
        "gooey-nav-container",
        frame ? "gooey-nav-frame" : "",
        `gooey-nav-theme-${theme}`,
        `gooey-nav-size-${size}`,
        hoverEffect ? "gooey-nav-hover-enabled" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <nav aria-label={ariaLabel} className="gooey-nav-nav">
        <ul ref={navRef} className="gooey-nav-list">
          {pillStyle.ready && (
            <li
              ref={pillRef}
              aria-hidden="true"
              className={`gooey-nav-effect filter-layer ${
                pillStyle.animated && !prefersReducedMotion ? "animated" : ""
              }`}
              style={{
                transform: `translate3d(${pillStyle.x}px, ${pillStyle.y}px, 0)`,
                width: `${pillStyle.width}px`,
                height: `${pillStyle.height}px`,
              }}
            />
          )}

          {items.map((item, idx) => {
            const isActive = activeIndex === idx;
            return (
              <li
                key={item.href || item.label}
                className={`gooey-nav-item ${isActive ? "active" : ""}`}
              >
                <a
                  href={item.href}
                  onClick={(e) => handleClick(e, idx, item)}
                  aria-current={isActive ? "page" : undefined}
                  className="gooey-nav-link"
                >
                  <span>{item.label}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
