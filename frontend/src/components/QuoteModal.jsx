import React, { useState, useEffect, useRef } from "react";
import { NEXO_CONFIG } from "../data/nexoData";
import { X, AlertCircle, ArrowRight, ArrowLeft, FileText, Check } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { playSound } from "../utils/sound";
import { submitLeadRecord, sanitizeClientText } from "../utils/securityClient";
import FormSuccessCountdown from "./FormSuccessCountdown";

const SERVICE_OPTIONS = [
  "Páginas Web Totalmente Personalizables & Landing Pages",
  "Plan Lanzamiento (Desde $190.000 ARS/mes)",
  "Plan Crecimiento Integral (Desde $290.000 ARS/mes)",
  "Plan Escala & Expansión (Desde $480.000 ARS/mes)",
  "Publicidad Digital (Meta Ads - Instagram & Facebook)",
  "Gestión de Redes & Contenido Visual",
  "Fotografía y Producción Audiovisual",
  "Solución Integral para Comercios & Locales",
  "Solución Integral para Oficios y Servicios",
  "Solución Integral para Profesionales de la Salud",
  "Proyecto Personalizado a Medida",
];

const TIMEFRAME_OPTIONS = [
  "Inmediato (esta misma semana)",
  "En las próximas 2 semanas",
  "El próximo mes",
  "Solo estoy evaluando presupuestos",
];

const STEPS = [
  { id: 1, number: "01", title: "Tus Datos", subtitle: "Contacto directo y empresa" },
  { id: 2, number: "02", title: "Cotización", subtitle: "Servicio, plazo y detalles" },
];

export default function QuoteModal({
  isOpen,
  onClose,
  initialService = "",
  onOpenLegalDoc,
}) {
  const prefersReducedMotion = useReducedMotion();
  const formLoadedAtRef = useRef(0);
  const [step, setStep] = useState(1);

  const getMatchedService = (svc) => {
    if (!svc) return SERVICE_OPTIONS[1];
    const found = SERVICE_OPTIONS.find((opt) =>
      opt.toLowerCase().includes(svc.toLowerCase()) || svc.toLowerCase().includes(opt.toLowerCase())
    );
    return found || svc || SERVICE_OPTIONS[1];
  };

  const [formData, setFormData] = useState({
    fullName: "",
    businessName: "",
    email: "",
    phone: "",
    service: getMatchedService(initialService),
    timeframe: TIMEFRAME_OPTIONS[0],
    message: "",
    privacyConsent: false,
    website_url: "", // honeypot
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [status, setStatus] = useState("idle");
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
      if (initialService) {
        setFormData((prev) => ({ ...prev, service: getMatchedService(initialService) }));
      }
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, initialService]);

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
      errs.phone = "Ingresá tu WhatsApp con código de área.";
    } else if (phoneDigits.length < 6 || phoneDigits.length > 16) {
      errs.phone = "Ingresá un teléfono válido.";
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
    if (cleanMsg.length < 5) {
      errs.message = "Especificá brevemente qué estás buscando o el objetivo de tu negocio.";
    }
    if (!formData.privacyConsent) {
      errs.privacyConsent = "Debés prestar tu consentimiento para recibir el presupuesto.";
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

    if (formData.website_url && formData.website_url.trim() !== "") {
      setStatus("success");
      setReferenceId("NEXO-PRES-" + Date.now().toString(36).toUpperCase().slice(-5));
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
      service: formData.service,
      timeframe: formData.timeframe,
      origin: "Solicitar Presupuesto",
      formType: "presupuesto",
      status: "nuevo",
      priority: "alta",
      responsible: "Mateo Díaz",
      message: `Plazo deseado: ${formData.timeframe}. Requisitos: ${formData.message.trim()}`,
      privacyConsent: Boolean(formData.privacyConsent),
    };

    try {
      const result = await submitLeadRecord(payload);
      const refId = result.refId || "NEXO-PRES-OK";
      setReferenceId(refId);

      const cleanPhone = (NEXO_CONFIG.whatsappNumber || "5491164444159").replace(/[^0-9]/g, "");
      const fullText = `*SOLICITUD DE PRESUPUESTO — NEXO CREATIVE*
Ref: ${refId}
----------------------------------------
*Cliente:* ${payload.fullName}
*Negocio:* ${payload.businessName}
*Servicio / Plan:* ${payload.service}
*Fecha estimada de inicio:* ${payload.timeframe}
*WhatsApp:* ${payload.phone}
*Email:* ${payload.email}

*Detalles del proyecto:*
${formData.message.trim()}
----------------------------------------
Hola Mateo, quisiera recibir la cotización formal para este servicio. ¡Muchas gracias!`;

      setWhatsAppFollowUpUrl(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(fullText)}`);
      setStatus("success");
    } catch (err) {
      console.error("Error al procesar solicitud de presupuesto:", err);
      setStatus("idle");
      playSound("close", false);
      setServerError("Ocurrió un error al guardar tu solicitud. Podés escribirnos directamente por WhatsApp.");
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
            aria-labelledby="quote-modal-title"
            className="relative z-10 w-full max-w-lg h-dvh bg-[#0d0f12] border-l border-white/12 text-white shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Cabecera del Panel */}
            <div className="px-5 sm:px-7 py-5 bg-[#141519] border-b border-white/10 flex items-center justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#16A34A]/15 border border-[#16A34A]/30 text-[10px] font-bold text-[#22C55E] mb-1">
                  <FileText className="w-3 h-3" />
                  <span>COTIZACIÓN FORMAL A MEDIDA</span>
                </div>
                <h3
                  id="quote-modal-title"
                  className="text-lg sm:text-xl font-black text-white tracking-tight"
                >
                  Solicitar Presupuesto
                </h3>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer flex-shrink-0"
                aria-label="Cerrar formulario de presupuesto"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {status === "success" ? (
              <div className="flex-1 overflow-y-auto p-6 sm:p-8 flex items-center justify-center">
                <FormSuccessCountdown
                  referenceId={referenceId}
                  title="¡Solicitud de presupuesto enviada!"
                  subtitle="Tu cotización fue registrada en nuestro CRM. Te enviaremos la propuesta personalizada a la brevedad."
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
                  <div className="hidden" aria-hidden="true">
                    <input
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
                            placeholder="Ej. Martín Gómez"
                            className={`w-full bg-[#141519] border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none transition-colors ${
                              errors.fullName ? "border-red-500 focus:border-red-400" : "border-white/10 focus:border-[#16A34A]"
                            }`}
                          />
                          {errors.fullName && <p className="text-[11px] text-red-400 mt-1">{errors.fullName}</p>}
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-300 mb-1.5">
                            Nombre de tu Negocio / Empresa
                          </label>
                          <input
                            type="text"
                            name="businessName"
                            value={formData.businessName}
                            onChange={handleChange}
                            placeholder="Ej. Distribuidora Sur"
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
                            placeholder="Ej. +54 9 11 9988-7766"
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
                            placeholder="martin@empresa.com"
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
                            Servicio o Plan Requerido
                          </label>
                          <select
                            name="service"
                            value={formData.service}
                            onChange={handleChange}
                            className="w-full bg-[#141519] border border-white/10 focus:border-[#16A34A] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none transition-colors"
                          >
                            {SERVICE_OPTIONS.map((srv) => (
                              <option key={srv} value={srv} className="bg-[#141519] text-white">
                                {srv}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-300 mb-1.5">
                            ¿Cuándo te gustaría comenzar?
                          </label>
                          <select
                            name="timeframe"
                            value={formData.timeframe}
                            onChange={handleChange}
                            className="w-full bg-[#141519] border border-white/10 focus:border-[#16A34A] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none transition-colors"
                          >
                            {TIMEFRAME_OPTIONS.map((t) => (
                              <option key={t} value={t} className="bg-[#141519] text-white">
                                {t}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-300 mb-1.5">
                            Detalles o necesidades específicas <span className="text-[#22C55E]">*</span>
                          </label>
                          <textarea
                            name="message"
                            rows={3}
                            autoFocus
                            value={formData.message}
                            onChange={handleChange}
                            placeholder="Describí brevemente qué necesitás (ej. cuánto invertís hoy, qué servicios te interesan)..."
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
                              className="mt-0.5 w-4 h-4 rounded bg-[#141519] border-white/20 text-[#16A34A] focus:ring-0 cursor-pointer"
                            />
                            <span className="text-[11px] text-gray-400 group-hover:text-gray-300 leading-snug">
                              Autorizo a NEXO Creative a procesar mis datos para elaborar el presupuesto solicitado conforme a la{" "}
                              <button
                                type="button"
                                onClick={() => onOpenLegalDoc?.("privacidad")}
                                className="text-[#22C55E] underline hover:text-white"
                              >
                                Política de Privacidad
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
                            <span>Enviando...</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4 stroke-[2.5]" />
                            <span>Solicitar Presupuesto</span>
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
