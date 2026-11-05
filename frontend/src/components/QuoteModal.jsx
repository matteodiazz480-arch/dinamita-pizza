import React, { useState, useEffect, useRef } from "react";
import { NEXO_CONFIG } from "../data/nexoData";
import { X, AlertCircle, ArrowRight, FileText } from "lucide-react";
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

export default function QuoteModal({
  isOpen,
  onClose,
  initialService = "",
  onOpenLegalDoc,
}) {
  const prefersReducedMotion = useReducedMotion();
  const formLoadedAtRef = useRef(0);

  // Determinar valor inicial del servicio coincidente
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
  const [status, setStatus] = useState("idle"); // "idle" | "loading" | "success"
  const [referenceId, setReferenceId] = useState("");
  const [whatsAppFollowUpUrl, setWhatsAppFollowUpUrl] = useState("");

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      formLoadedAtRef.current = Date.now();
      setStatus("idle");
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

  const validate = () => {
    const errs = {};
    const cleanName = sanitizeClientText(formData.fullName, 80).trim();
    const cleanEmail = sanitizeClientText(formData.email, 120).trim();
    const cleanPhone = sanitizeClientText(formData.phone, 30).trim();
    const cleanMsg = sanitizeClientText(formData.message, 800).trim();

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    if (formData.website_url && formData.website_url.trim() !== "") {
      setStatus("success");
      setReferenceId("NEXO-PRES-" + Date.now().toString(36).toUpperCase().slice(-5));
      return;
    }

    if (!validate()) {
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={prefersReducedMotion ? false : { opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="quote-modal-title"
            className="relative w-full max-w-xl bg-[#141519] border border-white/10 rounded-2xl p-5 sm:p-8 text-white shadow-2xl z-10 my-auto overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-px bg-white/10" />

            <button
              type="button"
              onClick={handleClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Cerrar formulario de presupuesto"
            >
              <X className="w-4 h-4" />
            </button>

            {status === "success" ? (
              <FormSuccessCountdown
                referenceId={referenceId}
                title="¡Solicitud de presupuesto enviada!"
                subtitle="Tu cotización fue registrada en nuestro CRM. Te enviaremos la propuesta personalizada a la brevedad."
                whatsAppUrl={whatsAppFollowUpUrl}
                onClose={handleClose}
                autoRedirectSeconds={3}
              />
            ) : (
              <div className="space-y-4">
                <div className="pr-8 space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#16A34A]/15 border border-[#16A34A]/30 text-[11px] font-bold text-[#22C55E]">
                    <FileText className="w-3 h-3" />
                    <span>COTIZACIÓN FORMAL A MEDIDA</span>
                  </div>
                  <h3
                    id="quote-modal-title"
                    className="text-xl sm:text-2xl font-black text-white tracking-tight"
                  >
                    Solicitar Presupuesto
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                    Elegí el plan o servicio que te interesa y prepararemos una cotización adaptada a tu escala.
                  </p>
                </div>

                {serverError && (
                  <div
                    role="alert"
                    className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-2"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{serverError}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} noValidate className="space-y-3.5">
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1">
                        Nombre y Apellido <span className="text-[#22C55E]">*</span>
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="Ej. Martín Gómez"
                        className={`w-full bg-[#181a20] border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none transition-colors ${
                          errors.fullName ? "border-red-500 focus:border-red-400" : "border-white/10 focus:border-[#16A34A]"
                        }`}
                      />
                      {errors.fullName && <p className="text-[11px] text-red-400 mt-1">{errors.fullName}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1">
                        Nombre de tu Negocio / Empresa
                      </label>
                      <input
                        type="text"
                        name="businessName"
                        value={formData.businessName}
                        onChange={handleChange}
                        placeholder="Ej. Distribuidora Sur"
                        className="w-full bg-[#181a20] border border-white/10 focus:border-[#16A34A] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1">
                        WhatsApp de Contacto <span className="text-[#22C55E]">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Ej. +54 9 11 9988-7766"
                        className={`w-full bg-[#181a20] border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none transition-colors ${
                          errors.phone ? "border-red-500 focus:border-red-400" : "border-white/10 focus:border-[#16A34A]"
                        }`}
                      />
                      {errors.phone && <p className="text-[11px] text-red-400 mt-1">{errors.phone}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1">
                        Correo Electrónico <span className="text-[#22C55E]">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="martin@empresa.com"
                        className={`w-full bg-[#181a20] border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none transition-colors ${
                          errors.email ? "border-red-500 focus:border-red-400" : "border-white/10 focus:border-[#16A34A]"
                        }`}
                      />
                      {errors.email && <p className="text-[11px] text-red-400 mt-1">{errors.email}</p>}
                    </div>
                  </div>

                  {/* Servicio o Plan requerido */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Servicio o Plan Requerido
                    </label>
                    <select
                      name="service"
                      value={formData.service}
                      onChange={handleChange}
                      className="w-full bg-[#181a20] border border-white/10 focus:border-[#16A34A] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none transition-colors"
                    >
                      {SERVICE_OPTIONS.map((srv) => (
                        <option key={srv} value={srv} className="bg-[#181a20] text-white">
                          {srv}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Plazo estimado */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      ¿Cuándo te gustaría comenzar?
                    </label>
                    <select
                      name="timeframe"
                      value={formData.timeframe}
                      onChange={handleChange}
                      className="w-full bg-[#181a20] border border-white/10 focus:border-[#16A34A] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none transition-colors"
                    >
                      {TIMEFRAME_OPTIONS.map((t) => (
                        <option key={t} value={t} className="bg-[#181a20] text-white">
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Requisitos / Mensaje */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Detalles o necesidades específicas <span className="text-[#22C55E]">*</span>
                    </label>
                    <textarea
                      name="message"
                      rows={3}
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Describí brevemente qué necesitás (ej. cuánto invertís hoy, qué servicios te interesan)..."
                      className={`w-full bg-[#181a20] border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none transition-colors resize-none ${
                        errors.message ? "border-red-500 focus:border-red-400" : "border-white/10 focus:border-[#16A34A]"
                      }`}
                    />
                    {errors.message && <p className="text-[11px] text-red-400 mt-1">{errors.message}</p>}
                  </div>

                  {/* Consentimiento */}
                  <div className="pt-1">
                    <label className="flex items-start gap-2.5 cursor-pointer text-left group">
                      <input
                        type="checkbox"
                        name="privacyConsent"
                        checked={formData.privacyConsent}
                        onChange={handleChange}
                        className="mt-0.5 w-4 h-4 rounded bg-[#181a20] border-white/20 text-[#16A34A] focus:ring-0 cursor-pointer"
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

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={status === "loading"}
                      className="w-full bg-[#16A34A] hover:bg-[#15803D] active:scale-[0.98] disabled:opacity-50 text-white font-extrabold py-3.5 px-6 rounded-xl text-xs sm:text-sm inline-flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                    >
                      {status === "loading" ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Generando solicitud de presupuesto...</span>
                        </>
                      ) : (
                        <>
                          <span>Enviar solicitud de presupuesto</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
