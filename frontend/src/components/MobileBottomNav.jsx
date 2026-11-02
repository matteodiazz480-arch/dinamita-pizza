import React from "react";
import GooeyNav from "./GooeyNav";

const MOBILE_GOOEY_ITEMS = [
  { id: "inicio", label: "Inicio", href: "#inicio" },
  { id: "nosotros", label: "Nosotros", href: "#nosotros" },
  { id: "rubros", label: "Rubros", href: "#rubros" },
  { id: "planes", label: "Planes", href: "#planes" },
  { id: "proceso", label: "Proceso", href: "#proceso" },
  { id: "contacto", label: "Contacto", href: "#contacto" },
];

export default function MobileBottomNav({ activeSectionId, onNavigate }) {
  const resolveMobileActiveIndex = (secId) => {
    if (secId === "inicio") return 0;
    if (secId === "nosotros") return 1;
    if (secId === "rubros") return 2;
    if (secId === "planes") return 3;
    if (
      secId === "proceso" ||
      secId === "asesoramiento" ||
      secId === "faq" ||
      secId === "agenda"
    ) {
      return 4;
    }
    if (secId === "contacto") return 5;
    return 0;
  };

  const activeIdx = resolveMobileActiveIndex(activeSectionId);

  return (
    <nav
      aria-label="Barra de navegación móvil inferior"
      className="fixed bottom-3 inset-x-0 z-40 md:hidden flex justify-center px-2 pb-[env(safe-area-inset-bottom)] pointer-events-none"
    >
      <div className="pointer-events-auto max-w-[calc(100vw-0.75rem)] overflow-x-auto no-scrollbar py-0.5">
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
    </nav>
  );
}
