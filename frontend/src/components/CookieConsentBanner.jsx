import React, { useState } from "react";
import { Shield, SlidersHorizontal, X, Check } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

export default function CookieConsentBanner({
  consent,
  isSettingsOpen,
  onOpenSettings,
  onCloseSettings,
  onSavePreferences,
  onOpenLegalDoc,
}) {
  const prefersReducedMotion = useReducedMotion();

  const [draftAnalytics, setDraftAnalytics] = useState(Boolean(consent?.analytics));
  const [draftMarketing, setDraftMarketing] = useState(Boolean(consent?.marketing));

  const handleOpenPreferences = () => {
    setDraftAnalytics(Boolean(consent?.analytics));
    setDraftMarketing(Boolean(consent?.marketing));
    onOpenSettings();
  };

  const handleAcceptAll = () => {
    onSavePreferences({ analytics: true, marketing: true });
    onCloseSettings();
  };

  const handleRejectOptional = () => {
    onSavePreferences({ analytics: false, marketing: false });
    onCloseSettings();
  };

  const handleSaveCustom = () => {
    onSavePreferences({
      analytics: draftAnalytics,
      marketing: draftMarketing,
    });
    onCloseSettings();
  };

  const showBanner = !consent?.decided && !isSettingsOpen;

  return (
    <>
      <AnimatePresence>
        {showBanner && (
          <motion.aside
            initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            aria-label="Aviso de privacidad y cookies"
            className="fixed bottom-18 md:bottom-4 left-4 right-4 sm:right-auto sm:max-w-md z-40 bg-[#141519]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-5 text-white shadow-2xl"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#BCE838] flex-shrink-0" />
                  <h3 className="text-xs sm:text-sm font-extrabold tracking-tight text-white">
                    Privacidad y uso de cookies
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleOpenPreferences}
                  className="text-[11px] font-semibold text-gray-400 hover:text-white inline-flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <SlidersHorizontal className="w-3 h-3" />
                  <span>Configurar</span>
                </button>
              </div>

              <p className="text-xs text-gray-300 leading-relaxed">
                Utilizamos cookies técnicas necesarias para la seguridad del sitio. Las cookies analíticas y de marketing permanecen desactivadas hasta que nos des tu consentimiento. Podés consultar nuestra{" "}
                <button
                  type="button"
                  onClick={() => onOpenLegalDoc?.("cookies")}
                  className="text-white underline underline-offset-2 hover:text-[#BCE838] transition-colors cursor-pointer"
                >
                  Política de Cookies
                </button>
                .
              </p>

              <div className="pt-1 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="flex-1 bg-[#BCE838] hover:bg-[#add92b] text-[#111111] font-extrabold px-3.5 py-2 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Aceptar todas
                </button>
                <button
                  type="button"
                  onClick={handleRejectOptional}
                  className="flex-1 bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/10 font-bold px-3.5 py-2 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Rechazar opcionales
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseSettings}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={prefersReducedMotion ? false : { opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="cookie-modal-title"
              className="relative w-full max-w-lg bg-[#141519] border border-white/10 rounded-2xl p-5 sm:p-7 text-white shadow-2xl z-10 my-auto"
            >
              <button
                type="button"
                onClick={onCloseSettings}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer"
                aria-label="Cerrar preferencias de cookies"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-4">
                <div className="pr-8">
                  <h3
                    id="cookie-modal-title"
                    className="text-lg sm:text-xl font-black text-white tracking-tight"
                  >
                    Preferencias de privacidad y cookies
                  </h3>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                    Administrá qué categorías de cookies permitís en este navegador. Al desactivar una categoría opcional, se bloquea su ejecución y se eliminan las cookies asociadas.
                  </p>
                </div>

                <div className="rounded-xl bg-[#0d0f12] border border-white/[0.08] p-4 space-y-1.5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs sm:text-sm font-extrabold text-white">
                      1. Cookies estrictamente necesarias
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/10 text-[10px] font-bold text-[#BCE838] uppercase tracking-wider">
                      <Check className="w-3 h-3" />
                      Siempre activas
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Indispensables para proteger los formularios contra ataques CSRF (`nexo_csrf_secret`) y recordar tu decisión de privacidad (`nexo_cookie_consent`). No almacenan datos comerciales ni de seguimiento.
                  </p>
                </div>

                <div className="rounded-xl bg-[#0d0f12] border border-white/[0.08] p-4 space-y-1.5">
                  <div className="flex items-center justify-between gap-3">
                    <label
                      htmlFor="toggle-analytics"
                      className="text-xs sm:text-sm font-extrabold text-white cursor-pointer"
                    >
                      2. Cookies analíticas (Opcionales)
                    </label>
                    <button
                      id="toggle-analytics"
                      type="button"
                      role="switch"
                      aria-checked={draftAnalytics}
                      onClick={() => setDraftAnalytics((v) => !v)}
                      className={`w-11 h-6 rounded-full transition-colors p-0.5 cursor-pointer flex items-center ${
                        draftAnalytics ? "bg-[#BCE838]" : "bg-white/15"
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full transition-transform ${
                          draftAnalytics
                            ? "translate-x-5 bg-[#111111]"
                            : "translate-x-0 bg-gray-300"
                        }`}
                      />
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Permiten medir de manera estadística y agregada el uso de las secciones del sitio para optimizar su rendimiento y experiencia de lectura.
                  </p>
                </div>

                <div className="rounded-xl bg-[#0d0f12] border border-white/[0.08] p-4 space-y-1.5">
                  <div className="flex items-center justify-between gap-3">
                    <label
                      htmlFor="toggle-marketing"
                      className="text-xs sm:text-sm font-extrabold text-white cursor-pointer"
                    >
                      3. Cookies de marketing (Opcionales)
                    </label>
                    <button
                      id="toggle-marketing"
                      type="button"
                      role="switch"
                      aria-checked={draftMarketing}
                      onClick={() => setDraftMarketing((v) => !v)}
                      className={`w-11 h-6 rounded-full transition-colors p-0.5 cursor-pointer flex items-center ${
                        draftMarketing ? "bg-[#BCE838]" : "bg-white/15"
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full transition-transform ${
                          draftMarketing
                            ? "translate-x-5 bg-[#111111]"
                            : "translate-x-0 bg-gray-300"
                        }`}
                      />
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Se utilizan para atribución de campañas publicitarias en plataformas como Meta Ads (Facebook e Instagram). Permanecen bloqueadas si no las habilitás.
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleSaveCustom}
                    className="w-full sm:flex-1 bg-[#BCE838] hover:bg-[#add92b] text-[#111111] font-extrabold py-2.5 px-4 rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Guardar preferencias
                  </button>
                  <button
                    type="button"
                    onClick={handleAcceptAll}
                    className="w-full sm:w-auto bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/10 font-bold py-2.5 px-4 rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Aceptar todas
                  </button>
                  <button
                    type="button"
                    onClick={handleRejectOptional}
                    className="w-full sm:w-auto bg-transparent hover:bg-white/[0.05] text-gray-400 hover:text-white font-semibold py-2.5 px-3 rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Rechazar opcionales
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
