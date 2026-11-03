import React, { useState, useEffect, useRef, useCallback, lazy, Suspense, memo } from "react";
import Navbar from "./components/Navbar";
import MobileBottomNav from "./components/MobileBottomNav";
import HeroBase from "./components/Hero";
import AboutSectionBase from "./components/AboutSection";
import PlansSectionBase from "./components/PlansSection";
import ProcessSection from "./components/ProcessSection";
import RubrosSectionBase from "./components/RubrosSection";
import FreeConsultationSectionBase from "./components/FreeConsultationSection";
import FaqSectionBase from "./components/FaqSection";
import CtaContactSectionBase from "./components/CtaContactSection";
import Footer from "./components/Footer";
import CookieConsentBanner from "./components/CookieConsentBanner";
import { getConsentPreferences, saveConsentPreferences } from "./utils/cookieConsent";
import { getCsrfToken } from "./utils/securityClient";

const InteractiveContactModal = lazy(() => import("./components/InteractiveContactModal"));
const PlanFinderModal = lazy(() => import("./components/PlanFinderModal"));
const VirtualAssistantChat = lazy(() => import("./components/VirtualAssistantChat"));
const LegalPagesModal = lazy(() => import("./components/LegalPagesModal"));
const CrmApp = lazy(() => import("./crm/CrmApp"));

const Hero = memo(HeroBase);
const AboutSection = memo(AboutSectionBase);
const PlansSection = memo(PlansSectionBase);
const RubrosSection = memo(RubrosSectionBase);
const FreeConsultationSection = memo(FreeConsultationSectionBase);
const FaqSection = memo(FaqSectionBase);
const CtaContactSection = memo(CtaContactSectionBase);

const TRACKED_SECTION_IDS = [
  "inicio",
  "nosotros",
  "rubros",
  "planes",
  "proceso",
  "asesoramiento",
  "faq",
  "contacto",
];

export default function App() {
  const [currentRoute, setCurrentRoute] = useState(() => {
    const path = window.location.pathname;
    const hash = window.location.hash;
    return path === "/crm" || path === "/admin" || hash.startsWith("#/crm") || hash.startsWith("#/admin")
      ? "crm"
      : "landing";
  });

  const [activeSectionId, setActiveSectionId] = useState("inicio");
  const [modalOpen, setModalOpen] = useState(false);
  const [planFinderOpen, setPlanFinderOpen] = useState(false);
  const [selectedService, setSelectedService] = useState("");
  const [activeLegalDoc, setActiveLegalDoc] = useState(null);
  const [cookieSettingsOpen, setCookieSettingsOpen] = useState(false);
  const [consent, setConsent] = useState(() => getConsentPreferences());
  const [idleReady, setIdleReady] = useState(false);
  const overlaysReady = idleReady || modalOpen || planFinderOpen || activeLegalDoc !== null;

  const scrollLockUntilRef = useRef(0);

  useEffect(() => {
    const checkRoute = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      if (path === "/crm" || path === "/admin" || hash.startsWith("#/crm") || hash.startsWith("#/admin")) {
        setCurrentRoute("crm");
      } else {
        setCurrentRoute("landing");
      }
    };
    window.addEventListener("popstate", checkRoute);
    window.addEventListener("hashchange", checkRoute);
    return () => {
      window.removeEventListener("popstate", checkRoute);
      window.removeEventListener("hashchange", checkRoute);
    };
  }, []);

  const handleNavigateSection = useCallback((secId) => {
    setActiveSectionId(secId);
    scrollLockUntilRef.current = Date.now() + 850;
    const target = document.getElementById(secId);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const handleOpenModal = useCallback((serviceName) => {
    setSelectedService(serviceName || "Asesoramiento Gratuito General");
    setModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
  }, []);

  const handleOpenPlanFinder = useCallback(() => {
    setPlanFinderOpen(true);
  }, []);

  const handleClosePlanFinder = useCallback(() => {
    setPlanFinderOpen(false);
    if (window.location.hash === "#encontra-tu-plan") {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  const handleSaveCookiePreferences = useCallback((prefs) => {
    const updated = saveConsentPreferences(prefs);
    setConsent(updated);
  }, []);

  const handleOpenLegalDoc = useCallback((docId) => {
    setActiveLegalDoc(docId);
  }, []);

  const handleCloseLegalDoc = useCallback(() => {
    setActiveLegalDoc(null);
    if (window.location.hash.startsWith("#legal/")) {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (currentRoute === "crm") return;

    const arm = () => setIdleReady(true);
    const idleId =
      typeof window.requestIdleCallback === "function"
        ? window.requestIdleCallback(arm, { timeout: 2500 })
        : window.setTimeout(arm, 1800);
    return () => {
      if (typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(idleId);
      else window.clearTimeout(idleId);
    };
  }, [currentRoute]);

  useEffect(() => {
    if (currentRoute === "crm") return;

    getCsrfToken();

    const syncFromHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith("#legal/")) {
        const docKey = hash.replace("#legal/", "").trim();
        if (["privacidad", "cookies", "terminos", "seguridad"].includes(docKey)) {
          setActiveLegalDoc(docKey);
        }
      } else if (hash === "#encontra-tu-plan") {
        setPlanFinderOpen(true);
      }
    };

    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);

    let scrollRafId = null;
    let cachedSections = [];
    let cachedScrollHeight = 0;

    const measureSections = () => {
      cachedScrollHeight = document.documentElement.scrollHeight;
      cachedSections = TRACKED_SECTION_IDS.map((id) => {
        const el = document.getElementById(id);
        return el ? { id, top: el.offsetTop } : null;
      }).filter(Boolean);
    };

    const handleScrollSpy = () => {
      if (scrollRafId !== null) return;

      scrollRafId = requestAnimationFrame(() => {
        scrollRafId = null;

        if (Date.now() < scrollLockUntilRef.current) return;
        if (cachedSections.length === 0) measureSections();

        const scrollY = window.scrollY;
        const windowH = window.innerHeight;

        if (cachedScrollHeight > 0 && windowH + scrollY >= cachedScrollHeight - 140) {
          setActiveSectionId((prev) => (prev === "contacto" ? prev : "contacto"));
          return;
        }

        const scrollTriggerY = scrollY + windowH * 0.36;
        let currentId = "inicio";

        for (let i = 0; i < cachedSections.length; i++) {
          if (scrollTriggerY >= cachedSections[i].top) {
            currentId = cachedSections[i].id;
          }
        }

        setActiveSectionId((prev) => (prev === currentId ? prev : currentId));
      });
    };

    measureSections();
    window.addEventListener("scroll", handleScrollSpy, { passive: true });
    window.addEventListener("resize", measureSections, { passive: true });
    handleScrollSpy();

    let bodyRo;
    if (typeof ResizeObserver !== "undefined") {
      bodyRo = new ResizeObserver(measureSections);
      bodyRo.observe(document.body);
    }

    return () => {
      window.removeEventListener("hashchange", syncFromHash);
      window.removeEventListener("scroll", handleScrollSpy);
      window.removeEventListener("resize", measureSections);
      if (bodyRo) bodyRo.disconnect();
      if (scrollRafId !== null) cancelAnimationFrame(scrollRafId);
    };
  }, [currentRoute]);

  if (currentRoute === "crm") {
    return (
      <Suspense
        fallback={
          <div className="min-h-screen bg-[#0d0f12] text-white flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        <CrmApp
          onNavigateLanding={() => {
            window.history.pushState(null, "", "/");
            setCurrentRoute("landing");
          }}
        />
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen bg-[#111111] text-white flex flex-col selection:bg-white selection:text-black">
      <Navbar
        activeSectionId={activeSectionId}
        onNavigateSection={handleNavigateSection}
        onOpenConsultationModal={handleOpenModal}
      />

      <main className="flex-grow">
        <Hero
          onOpenConsultationModal={handleOpenModal}
          onOpenPlanFinder={handleOpenPlanFinder}
        />
        <AboutSection />
        <RubrosSection onOpenConsultationModal={handleOpenModal} />
        <PlansSection
          onOpenConsultationModal={handleOpenModal}
          onOpenPlanFinder={handleOpenPlanFinder}
        />
        <ProcessSection />
        <FreeConsultationSection onOpenModal={handleOpenModal} />
        <FaqSection />
        <CtaContactSection onOpenLegalDoc={handleOpenLegalDoc} />
      </main>

      <Footer
        onOpenLegalDoc={handleOpenLegalDoc}
        onOpenCookieSettings={() => setCookieSettingsOpen(true)}
      />

      <MobileBottomNav
        activeSectionId={activeSectionId}
        onNavigate={handleNavigateSection}
      />

      {overlaysReady && (
        <Suspense fallback={null}>
          <VirtualAssistantChat
            onOpenConsultationModal={handleOpenModal}
            onOpenLegalDoc={handleOpenLegalDoc}
          />

          <InteractiveContactModal
            key={selectedService}
            isOpen={modalOpen}
            onClose={handleCloseModal}
            initialService={selectedService}
            onOpenLegalDoc={handleOpenLegalDoc}
          />

          <PlanFinderModal
            isOpen={planFinderOpen}
            onClose={handleClosePlanFinder}
            onSelectPlanForConsultation={handleOpenModal}
          />

          <LegalPagesModal
            activeDocId={activeLegalDoc}
            onSelectDoc={handleOpenLegalDoc}
            onClose={handleCloseLegalDoc}
            onOpenCookieSettings={() => setCookieSettingsOpen(true)}
          />
        </Suspense>
      )}

      <CookieConsentBanner
        consent={consent}
        isSettingsOpen={cookieSettingsOpen}
        onOpenSettings={() => setCookieSettingsOpen(true)}
        onCloseSettings={() => setCookieSettingsOpen(false)}
        onSavePreferences={handleSaveCookiePreferences}
        onOpenLegalDoc={handleOpenLegalDoc}
      />
    </div>
  );
}
