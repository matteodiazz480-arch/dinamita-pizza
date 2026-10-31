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
      secId === "asesoramiento" || secId === "faq" ? "resultados" : secId;
    const found = navItems.findIndex((item) => item.href === `#${normalized}`);
    return found >= 0 ? found : 0;
  };

  const activeIdx = resolveDesktopActiveIndex(activeSectionId);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-colors duration-300 ${
        isScrolled
          ? "bg-[#111111]/90 backdrop-blur-md border-b border-white/[0.07] py-2.5 shadow-md shadow-black/25"
          : "bg-gradient-to-b from-[#111111]/85 to-transparent py-3"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <a
            href="#inicio"
            onClick={(e) => {
              e.preventDefault();
              onNavigateSection?.("inicio");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="transition-opacity duration-200 hover:opacity-90 flex-shrink-0"
            aria-label="NEXO Creative Inicio"
          >
            <BrandLogo />
          </a>

          <div className="hidden md:flex items-center justify-center">
            <GooeyNav
              items={navItems}
              theme="light"
              size="md"
              frame={true}
              particleCount={12}
              spread={40}
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
              className="text-[11px] sm:text-xs font-extrabold tracking-wide text-[#111111] bg-[#BCE838] hover:bg-[#add92b] md:text-white md:bg-transparent md:hover:text-[#111111] md:hover:bg-[#BCE838] border border-[#BCE838] md:border-white/20 md:hover:border-[#BCE838] px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full transition-all cursor-pointer"
            >
              Asesoramiento
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
