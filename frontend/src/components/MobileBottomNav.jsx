import React from "react";
import {
  Home,
  Users,
  Briefcase,
  Layers,
  GitBranch,
  MessageSquare,
} from "lucide-react";
import GooeyNav from "./GooeyNav";

const MOBILE_GOOEY_ITEMS = [
  { id: "inicio", label: "Inicio", href: "#inicio", icon: Home },
  { id: "nosotros", label: "Nosotros", href: "#nosotros", icon: Users },
  { id: "rubros", label: "Rubros", href: "#rubros", icon: Briefcase },
  { id: "planes", label: "Planes", href: "#planes", icon: Layers },
  { id: "proceso", label: "Proceso", href: "#proceso", icon: GitBranch },
  { id: "contacto", label: "Contacto", href: "#contacto", icon: MessageSquare },
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
      className="fixed bottom-2.5 inset-x-0 z-40 md:hidden flex justify-center px-2.5 pb-[env(safe-area-inset-bottom,0px)] pointer-events-none"
    >
      <div className="pointer-events-auto w-full max-w-md">
        <GooeyNav
          items={MOBILE_GOOEY_ITEMS}
          theme="light"
          size="sm"
          frame={true}
          particleCount={10}
          spread={32}
          animationTime={420}
          timeVariance={160}
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
