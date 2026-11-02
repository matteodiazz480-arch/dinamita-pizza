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
import BookingCalendarSectionBase from "./components/BookingCalendarSection";
import CtaContactSectionBase from "./components/CtaContactSection";
import Footer from "./components/Footer";
import CookieConsentBanner from "./components/CookieConsentBanner";
import { getConsentPreferences, saveConsentPreferences } from "./utils/cookieConsent";
import { getCsrfToken } from "./utils/securityClient";

const InteractiveContactModal = lazy(() => import("./components/InteractiveContactModal"));
const PlanFinderModal = lazy(() => import("./components/PlanFinderModal"));
const VirtualAssistantChat = lazy(() => import("./components/VirtualAssistantChat"));
const LegalPagesModal = lazy(() => import("./components/LegalPagesModal"));

const Hero = memo(HeroBase);
const AboutSection = memo(AboutSectionBase);
const PlansSection = memo(PlansSectionBase);
const RubrosSection = memo(RubrosSectionBase);
const FreeConsultationSection = memo(FreeConsultationSectionBase);
const FaqSection = memo(FaqSectionBase);
const BookingCalendarSection = memo(BookingCalendarSectionBase);
const CtaContactSection = memo(CtaContactSectionBase);

const TRACKED_SECTION_IDS = [
  "inicio",
  "nosotros",
  "rubros",
  "planes",
  "proceso",
  "asesoramiento",
  "faq",
  "agenda",
  "contacto",
];

export default function App() {
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
    const arm = () => setIdleReady(true);
    const idleId =
      typeof window.requestIdleCallback === "function"
        ? window.requestIdleCallback(arm, { timeout: 2500 })
        : window.setTimeout(arm, 1800);
    return () => {
      if (typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(idleId);
      else window.clearTimeout(idleId);
    };
  }, []);

  useEffect(() => {
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

    const handleScrollSpy = () => {
      if (scrollRafId !== null) return;

      scrollRafId = requestAnimationFrame(() => {
        scrollRafId = null;

        if (Date.now() < scrollLockUntilRef.current) return;

        const scrollY = window.scrollY;
        const windowH = window.innerHeight;
        const scrollHeight = document.documentElement.scrollHeight;

        if (windowH + scrollY >= scrollHeight - 140) {
          setActiveSectionId((prev) => (prev === "contacto" ? prev : "contacto"));
          return;
        }

        const scrollTriggerY = scrollY + windowH * 0.36;
        let currentId = "inicio";

        for (const id of TRACKED_SECTION_IDS) {
          const el = document.getElementById(id);
          if (el) {
            const top = el.offsetTop;
            if (scrollTriggerY >= top) {
              currentId = id;
            }
          }
        }

        setActiveSectionId((prev) => (prev === currentId ? prev : currentId));
      });
    };

    window.addEventListener("scroll", handleScrollSpy, { passive: true });
    handleScrollSpy();

    return () => {
      window.removeEventListener("hashchange", syncFromHash);
      window.removeEventListener("scroll", handleScrollSpy);
      if (scrollRafId !== null) cancelAnimationFrame(scrollRafId);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#111111] text-white flex flex-col selection:bg-[#BCE838] selection:text-black">
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
        <BookingCalendarSection onOpenLegalDoc={handleOpenLegalDoc} />
        <CtaContactSection onOpenConsultationModal={handleOpenModal} />
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
