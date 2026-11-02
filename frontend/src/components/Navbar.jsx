import React, { useState, useEffect } from "react";
import { NEXO_CONFIG } from "../data/nexoData";
import { BrandLogo } from "./Icons";
import GooeyNav from "./GooeyNav";

export default function Navbar({
  activeSectionId,
  onNavigateSection,
  onOpenConsultationModal,
}) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    let rafId = null;
    const handleScroll = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        const scrolled = window.scrollY > 20;
        setIsScrolled((prev) => (prev !== scrolled ? scrolled : prev));
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  const navItems = NEXO_CONFIG.navLinks;

  const resolveDesktopActiveIndex = (secId) => {
    const normalized =
      secId === "asesoramiento" || secId === "faq" || secId === "agenda"
        ? "proceso"
        : secId;
    const found = navItems.findIndex((item) => item.href === `#${normalized}`);
    return found >= 0 ? found : 0;
  };

  const activeIdx = resolveDesktopActiveIndex(activeSectionId);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? "bg-[#0d0f12]/95 backdrop-blur-xl border-b border-white/12 py-2 sm:py-3.5 shadow-[0_12px_32px_rgba(0,0,0,0.55)]"
          : "bg-gradient-to-b from-[#0d0f12]/90 via-[#0d0f12]/35 to-transparent py-2 sm:py-4 border-b-0"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3 sm:gap-4">
          <a
            href="#inicio"
            onClick={(e) => {
              e.preventDefault();
              onNavigateSection?.("inicio");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="transition-transform duration-200 hover:scale-103 flex-shrink-0"
            aria-label="NEXO Creative Inicio"
          >
            <BrandLogo size="large" />
          </a>

          <div className="hidden md:flex items-center justify-center">
            <GooeyNav
              items={navItems}
              theme="light"
              size="md"
              frame={true}
              particleCount={12}
              spread={44}
              animationTime={500}
              timeVariance={200}
              gooeyness={0.4}
              wobble={0.3}
              hoverEffect={true}
              activeIndex={activeIdx}
              ariaLabel="Navegación principal de escritorio"
              onSelect={(_, item) => {
                if (item?.href) {
                  onNavigateSection?.(item.href.replace("#", ""));
                }
              }}
            />
          </div>

          <div className="flex items-center flex-shrink-0">
            <button
              type="button"
              onClick={() =>
                onOpenConsultationModal?.("Asesoramiento Gratuito General")
              }
              className="text-[11px] sm:text-sm font-black tracking-wide text-[#111111] bg-[#BCE838] hover:bg-[#cbf446] px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-full sm:rounded-xl transition-all cursor-pointer shadow-[0_0_14px_rgba(188,232,56,0.25)] hover:shadow-[0_0_26px_rgba(188,232,56,0.45)] hover:scale-102 active:scale-95"
            >
              Diagnóstico gratis
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
