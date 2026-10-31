import React from "react";
import GooeyNav from "./GooeyNav";

const MOBILE_GOOEY_ITEMS = [
  { id: "inicio", label: "Inicio", href: "#inicio" },
  { id: "servicios", label: "Soluciones", href: "#servicios" },
  { id: "planes", label: "Planes", href: "#planes" },
  { id: "resultados", label: "Proyectos", href: "#resultados" },
  { id: "contacto", label: "Contacto", href: "#contacto" },
];

export default function MobileBottomNav({ activeSectionId, onNavigate }) {
  const resolveMobileActiveIndex = (secId) => {
    if (secId === "inicio" || secId === "nosotros") return 0;
    if (secId === "servicios") return 1;
    if (secId === "planes" || secId === "proceso") return 2;
    if (secId === "resultados" || secId === "asesoramiento" || secId === "faq") {
      return 3;
    }
    if (secId === "contacto") return 4;
    return 0;
  };

  const activeIdx = resolveMobileActiveIndex(activeSectionId);

  return (
    <div className="fixed bottom-2.5 inset-x-0 z-40 md:hidden flex justify-center px-2.5 pb-[env(safe-area-inset-bottom)] pointer-events-none">
      <div className="pointer-events-auto max-w-full">
        <GooeyNav
          items={MOBILE_GOOEY_ITEMS}
          theme="light"
          size="sm"
          frame={true}
          particleCount={12}
          spread={34}
          animationTime={500}
          timeVariance={200}
          gooeyness={0.4}
          wobble={0.3}
          hoverEffect={true}
          activeIndex={activeIdx}
          ariaLabel="Navegación principal móvil"
          onSelect={(_, item) => {
            if (item?.href) {
              onNavigate?.(item.href.replace("#", ""));
            }
          }}
        />
      </div>
    </div>
  );
}
