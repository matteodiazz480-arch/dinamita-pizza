import React, { useState, useEffect, useRef } from "react";
import { NEXO_CONFIG } from "../data/nexoData";
import { X, AlertCircle, ArrowRight, ArrowLeft, Sparkles, Check } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { playSound } from "../utils/sound";
import { submitLeadRecord, sanitizeClientText } from "../utils/securityClient";
import FormSuccessCountdown from "./FormSuccessCountdown";

const RUBRO_OPTIONS = [
  "Comercios y Locales",
  "Oficios y Servicios Técnicos",
  "Profesionales y Consultorios",
  "Desarrollo Web & Landing Pages",
  "Gastronomía y Eventos",
  "Empresas y Corporativo",
  "Otro Rubro",
];

const STEPS = [
  { id: 1, number: "01", title: "Tus Datos", subtitle: "Contacto directo y negocio" },
  { id: 2, number: "02", title: "Tu Objetivo", subtitle: "Rubro y desafío a resolver" },
];

export default function InteractiveContactModal({
  isOpen,
  onClose,
  onOpenLegalDoc,
}) {
  const prefersReducedMotion = useReducedMotion();
  const formLoadedAtRef = useRef(0);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    fullName: "",
    businessName: "",
    email: "",
    phone: "",
    rubro: "Comercios y Locales",
    message: "",
    privacyConsent: false,
    website_url: "", // honeypot
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [status, setStatus] = useState("idle"); // "idle" | "loading" | "success"
  const [referenceId, setReferenceId] = useState("");
  const [whatsAppFollowUpUrl, setWhatsAppFollowUpUrl] = useState("");

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      formLoadedAtRef.current = Date.now();
      setStatus("idle");
      setStep(1);
      setErrors({});
      setServerError("");
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const validateStep1 = () => {
    const errs = {};
    const cleanName = sanitizeClientText(formData.fullName, 80).trim();
    const cleanEmail = sanitizeClientText(formData.email, 120).trim();
    const cleanPhone = sanitizeClientText(formData.phone, 30).trim();

    if (cleanName.length < 2) {
      errs.fullName = "Ingresá tu nombre y apellido (mínimo 2 caracteres).";
    }
    if (!cleanEmail) {
      errs.email = "Ingresá tu correo electrónico.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(cleanEmail)) {
      errs.email = "Ingresá un correo electrónico válido.";
    }
    const phoneDigits = cleanPhone.replace(/[^0-9]/g, "");
    if (!cleanPhone) {
      errs.phone = "Ingresá tu número de WhatsApp.";
    } else if (phoneDigits.length < 6 || phoneDigits.length > 16) {
      errs.phone = "Ingresá un teléfono válido con código de área.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateAll = () => {
    if (!validateStep1()) {
      setStep(1);
      return false;
    }
    const errs = {};
    const cleanMsg = sanitizeClientText(formData.message, 800).trim();
    if (cleanMsg.length < 10) {
      errs.message = "Describí brevemente tu consulta o qué objetivo querés alcanzar (mínimo 10 caracteres).";
    }
    if (!formData.privacyConsent) {
      errs.privacyConsent = "Debés prestar tu consentimiento informado para procesar tu consulta.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const nextVal =
      type === "checkbox"
        ? checked
        : sanitizeClientText(value, name === "message" ? 800 : 120);

    setFormData((prev) => ({ ...prev, [name]: nextVal }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (serverError) setServerError("");
  };

  const handleNextStep = () => {
    if (!validateStep1()) {
      playSound("close", false);
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step === 1) {
      handleNextStep();
      return;
    }
    setServerError("");

    // Honeypot check
    if (formData.website_url && formData.website_url.trim() !== "") {
      setStatus("success");
      setReferenceId("NEXO-ASES-" + Date.now().toString(36).toUpperCase().slice(-5));
      return;
    }

    if (!validateAll()) {
      playSound("close", false);
      return;
    }

    setStatus("loading");
    playSound("send", false);

    const payload = {
      fullName: formData.fullName.trim(),
      businessName: formData.businessName.trim() || "No especificado",
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      rubro: formData.rubro,
      service: `Asesoramiento Gratuito (${formData.rubro})`,
      origin: "Solicitar Asesoramiento",
      formType: "asesoramiento",
      status: "nuevo",
      priority: "media",
      responsible: "Mateo Díaz",
      message: formData.message.trim(),
      privacyConsent: Boolean(formData.privacyConsent),
    };

    try {
      const result = await submitLeadRecord(payload);
      const refId = result.refId || "NEXO-ASES-OK";
      setReferenceId(refId);

      const cleanPhone = (NEXO_CONFIG.whatsappNumber || "5491164444159").replace(/[^0-9]/g, "");
      const fullText = `*SOLICITUD DE ASESORAMIENTO — NEXO CREATIVE*
Ref: ${refId}
----------------------------------------
*Cliente:* ${payload.fullName}
*Negocio / Marca:* ${payload.businessName}
*Rubro:* ${payload.rubro}
*WhatsApp:* ${payload.phone}
*Email:* ${payload.email}

*Consulta / Objetivo:*
${payload.message}
----------------------------------------
Hola Mateo, acabo de enviar mi solicitud de asesoramiento gratuito desde la web. ¿Cuándo podríamos coordinar el diagnóstico?`;

      setWhatsAppFollowUpUrl(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(fullText)}`);
      setStatus("success");
    } catch (err) {
      console.error("Error al procesar solicitud de asesoramiento:", err);
      setStatus("idle");
      playSound("close", false);
      setServerError("Ocurrió un error al registrar tu consulta. Podés escribirnos directamente por WhatsApp.");
    }
  };

  const handleClose = () => {
    playSound("close", false);
    setStatus("idle");
    setErrors({});
    setServerError("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
          />

          <motion.aside
            initial={prefersReducedMotion ? false : { x: "100%" }}
            animate={{ x: 0 }}
            exit={prefersReducedMotion ? false : { x: "100%" }}
            transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="consultation-modal-title"
            className="relative z-10 w-full max-w-lg h-dvh bg-[#0d0f12] border-l border-white/12 text-white shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Cabecera del Panel */}
            <div className="px-5 sm:px-7 py-5 bg-[#141519] border-b border-white/10 flex items-center justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#16A34A]/15 border border-[#16A34A]/30 text-[10px] font-bold text-[#22C55E] mb-1">
                  <Sparkles className="w-3 h-3" />
                  <span>ASESORAMIENTO ESTRATÉGICO GRATUITO</span>
                </div>
                <h3
                  id="consultation-modal-title"
                  className="text-lg sm:text-xl font-black text-white tracking-tight"
                >
                  Diagnóstico inicial para tu negocio
                </h3>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer flex-shrink-0"
                aria-label="Cerrar formulario"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {status === "success" ? (
              <div className="flex-1 overflow-y-auto p-6 sm:p-8 flex items-center justify-center">
                <FormSuccessCountdown
                  referenceId={referenceId}
                  title="¡Solicitud de asesoramiento enviada!"
                  subtitle="Tus datos ya están registrados en nuestro sistema. El equipo de NEXO Creative analizará tu caso a la brevedad."
                  whatsAppUrl={whatsAppFollowUpUrl}
                  onClose={handleClose}
                  autoRedirectSeconds={3}
                />
              </div>
            ) : (
              <>
                {/* Indicador de Etapas */}
                <div className="px-5 sm:px-7 py-3.5 bg-[#111318] border-b border-white/8">
                  <div className="grid grid-cols-2 gap-2.5">
                    {STEPS.map((s) => {
                      const isActive = step === s.id;
                      const isDone = step > s.id;
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => {
                            if (s.id < step || validateStep1()) setStep(s.id);
                          }}
                          className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            isActive
                              ? "bg-[#16A34A]/15 border-[#16A34A]/50 text-white"
                              : isDone
                              ? "bg-white/5 border-white/10 text-gray-200 hover:bg-white/8"
                              : "bg-[#141519]/60 border-white/5 text-gray-500"
                          }`}
                        >
                          <div
                            className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black flex-shrink-0 ${
                              isActive
                                ? "bg-[#16A34A] text-white"
                                : isDone
                                ? "bg-[#16A34A]/25 text-[#22C55E]"
                                : "bg-white/5 text-gray-500"
                            }`}
                          >
                            {isDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : s.number}
                          </div>
                          <div className="truncate">
                            <div className="text-xs font-bold leading-tight truncate">{s.title}</div>
                            <div className="text-[10px] text-gray-400 truncate">{s.subtitle}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-3">
                    <div
                      className="h-full bg-[#16A34A] transition-all duration-300 ease-out"
                      style={{ width: `${(step / 2) * 100}%` }}
                    />
                  </div>
                </div>

                {serverError && (
                  <div
                    role="alert"
                    className="mx-5 sm:mx-7 mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-2"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{serverError}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} noValidate className="flex-1 overflow-y-auto px-5 sm:px-7 py-6 flex flex-col justify-between">
                  {/* Honeypot anti-spam */}
                  <div className="hidden" aria-hidden="true">
                    <label htmlFor="modal_website_url">Sitio Web</label>
                    <input
                      id="modal_website_url"
                      type="text"
                      name="website_url"
                      tabIndex={-1}
                      autoComplete="off"
                      value={formData.website_url}
                      onChange={handleChange}
                    />
                  </div>

                  <AnimatePresence mode="wait">
                    {step === 1 && (
                      <motion.div
                        key="step1"
                        initial={prefersReducedMotion ? false : { opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={prefersReducedMotion ? false : { opacity: 0, x: -12 }}
                        transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
                        className="space-y-4"
                      >
                        <div>
                          <label className="block text-xs font-bold text-gray-300 mb-1.5">
                            Nombre y Apellido <span className="text-[#22C55E]">*</span>
                          </label>
                          <input
                            type="text"
                            name="fullName"
                            autoFocus
                            value={formData.fullName}
                            onChange={handleChange}
                            placeholder="Ej. Lucas Benítez"
                            className={`w-full bg-[#141519] border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none transition-colors ${
                              errors.fullName ? "border-red-500 focus:border-red-400" : "border-white/10 focus:border-[#16A34A]"
                            }`}
                          />
                          {errors.fullName && <p className="text-[11px] text-red-400 mt-1">{errors.fullName}</p>}
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-300 mb-1.5">
                            Nombre de tu Negocio / Marca
                          </label>
                          <input
                            type="text"
                            name="businessName"
                            value={formData.businessName}
                            onChange={handleChange}
                            placeholder="Ej. Barbería Rossi"
                            className="w-full bg-[#141519] border border-white/10 focus:border-[#16A34A] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-300 mb-1.5">
                            WhatsApp de Contacto <span className="text-[#22C55E]">*</span>
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="Ej. +54 9 11 4455-6677"
                            className={`w-full bg-[#141519] border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none transition-colors ${
                              errors.phone ? "border-red-500 focus:border-red-400" : "border-white/10 focus:border-[#16A34A]"
                            }`}
                          />
                          {errors.phone && <p className="text-[11px] text-red-400 mt-1">{errors.phone}</p>}
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-300 mb-1.5">
                            Correo Electrónico <span className="text-[#22C55E]">*</span>
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="contacto@tunegocio.com"
                            className={`w-full bg-[#141519] border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none transition-colors ${
                              errors.email ? "border-red-500 focus:border-red-400" : "border-white/10 focus:border-[#16A34A]"
                            }`}
                          />
                          {errors.email && <p className="text-[11px] text-red-400 mt-1">{errors.email}</p>}
                        </div>
                      </motion.div>
                    )}

                    {step === 2 && (
                      <motion.div
                        key="step2"
                        initial={prefersReducedMotion ? false : { opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={prefersReducedMotion ? false : { opacity: 0, x: -12 }}
                        transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
                        className="space-y-4"
                      >
                        <div>
                          <label className="block text-xs font-bold text-gray-300 mb-1.5">
                            Rubro o Actividad Principal
                          </label>
                          <select
                            name="rubro"
                            value={formData.rubro}
                            onChange={handleChange}
                            className="w-full bg-[#141519] border border-white/10 focus:border-[#16A34A] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none transition-colors"
                          >
                            {RUBRO_OPTIONS.map((opt) => (
                              <option key={opt} value={opt} className="bg-[#141519] text-white">
                                {opt}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-300 mb-1.5">
                            ¿Cuál es tu principal desafío o qué te gustaría mejorar? <span className="text-[#22C55E]">*</span>
                          </label>
                          <textarea
                            name="message"
                            rows={4}
                            autoFocus
                            value={formData.message}
                            onChange={handleChange}
                            placeholder="Contanos brevemente qué vendés, cómo conseguís clientes hoy y qué querés lograr..."
                            className={`w-full bg-[#141519] border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none transition-colors resize-none ${
                              errors.message ? "border-red-500 focus:border-red-400" : "border-white/10 focus:border-[#16A34A]"
                            }`}
                          />
                          {errors.message && <p className="text-[11px] text-red-400 mt-1">{errors.message}</p>}
                        </div>

                        <div className="pt-1">
                          <label className="flex items-start gap-2.5 cursor-pointer text-left group">
                            <input
                              type="checkbox"
                              name="privacyConsent"
                              checked={formData.privacyConsent}
                              onChange={handleChange}
                              className="mt-0.5 w-4 h-4 rounded bg-[#141519] border-white/20 text-[#16A34A] focus:ring-0 focus:ring-offset-0 cursor-pointer"
                            />
                            <span className="text-[11px] text-gray-400 group-hover:text-gray-300 leading-snug">
                              Autorizo a NEXO Creative a procesar mis datos para coordinar el diagnóstico comercial conforme a la{" "}
                              <button
                                type="button"
                                onClick={() => onOpenLegalDoc?.("privacidad")}
                                className="text-[#22C55E] underline hover:text-white"
                              >
                                Política de Privacidad (Ley 25.326)
                              </button>.
                            </span>
                          </label>
                          {errors.privacyConsent && (
                            <p className="text-[11px] text-red-400 mt-1">{errors.privacyConsent}</p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Barra Inferior Fija */}
                  <div className="pt-5 mt-6 border-t border-white/10 flex items-center justify-between gap-3">
                    {step > 1 ? (
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="inline-flex items-center gap-1.5 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-200 text-xs font-bold transition-[background-color,transform] duration-150 active:scale-97 cursor-pointer"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Etapa anterior</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleClose}
                        className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs font-bold transition-colors cursor-pointer"
                      >
                        Cancelar
                      </button>
                    )}

                    {step < 2 ? (
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs sm:text-sm font-extrabold transition-[background-color,transform] duration-150 active:scale-97 cursor-pointer shadow-md"
                      >
                        <span>Continuar a Etapa 2</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={status === "loading"}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#16A34A] hover:bg-[#15803D] active:scale-97 disabled:opacity-50 text-white text-xs sm:text-sm font-extrabold transition-[background-color,transform] duration-150 cursor-pointer shadow-md"
                      >
                        {status === "loading" ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Registrando...</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4 stroke-[2.5]" />
                            <span>Enviar Solicitud</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </form>
              </>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
