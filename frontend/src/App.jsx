import React, { useState, useEffect, useRef, useCallback } from "react";
import Navbar from "./components/Navbar";
import MobileBottomNav from "./components/MobileBottomNav";
import Hero from "./components/Hero";
import AboutSection from "./components/AboutSection";
import ServicesSection from "./components/ServicesSection";
import PlansSection from "./components/PlansSection";
import ProcessSection from "./components/ProcessSection";
import ResultsSection from "./components/ResultsSection";
import FreeConsultationSection from "./components/FreeConsultationSection";
import FaqSection from "./components/FaqSection";
import CtaContactSection from "./components/CtaContactSection";
import Footer from "./components/Footer";
import InteractiveContactModal from "./components/InteractiveContactModal";
import PlanFinderModal from "./components/PlanFinderModal";
import VirtualAssistantChat from "./components/VirtualAssistantChat";
import CookieConsentBanner from "./components/CookieConsentBanner";
import LegalPagesModal from "./components/LegalPagesModal";
import { getConsentPreferences, saveConsentPreferences } from "./utils/cookieConsent";
import { getCsrfToken } from "./utils/securityClient";

const TRACKED_SECTION_IDS = [
  "inicio",
  "nosotros",
  "servicios",
  "planes",
  "proceso",
  "resultados",
  "asesoramiento",
  "faq",
  "contacto",
];

export default function App() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState("");
  const [planFinderOpen, setPlanFinderOpen] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState("inicio");
  const [consent, setConsent] = useState(() => getConsentPreferences());
  const [cookieSettingsOpen, setCookieSettingsOpen] = useState(false);
  const [activeLegalDoc, setActiveLegalDoc] = useState(null);
  const scrollLockUntilRef = useRef(0);

  const handleNavigateSection = useCallback((sectionId) => {
    scrollLockUntilRef.current = Date.now() + 900;
    setActiveSectionId((prev) => (prev !== sectionId ? sectionId : prev));
  }, []);

  const handleOpenModal = useCallback((service = "") => {
    setSelectedService(service || "Publicidad Digital (Meta Ads)");
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
        <ServicesSection onOpenConsultationModal={handleOpenModal} />
        <PlansSection
          onOpenConsultationModal={handleOpenModal}
          onOpenPlanFinder={handleOpenPlanFinder}
        />
        <ProcessSection />
        <ResultsSection />
        <FreeConsultationSection onOpenModal={handleOpenModal} />
        <FaqSection />
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

      <CookieConsentBanner
        consent={consent}
        isSettingsOpen={cookieSettingsOpen}
        onOpenSettings={() => setCookieSettingsOpen(true)}
        onCloseSettings={() => setCookieSettingsOpen(false)}
        onSavePreferences={handleSaveCookiePreferences}
        onOpenLegalDoc={handleOpenLegalDoc}
      />

      <LegalPagesModal
        activeDocId={activeLegalDoc}
        onSelectDoc={handleOpenLegalDoc}
        onClose={handleCloseLegalDoc}
        onOpenCookieSettings={() => setCookieSettingsOpen(true)}
      />
    </div>
  );
}
