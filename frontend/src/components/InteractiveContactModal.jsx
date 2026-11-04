import React, { useState, useEffect, useRef } from "react";
import { NEXO_CONFIG } from "../data/nexoData";
import { X, AlertCircle, ArrowRight, Sparkles } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { playSound } from "../utils/sound";
import { submitLeadRecord, sanitizeClientText } from "../utils/securityClient";
import FormSuccessCountdown from "./FormSuccessCountdown";

const RUBRO_OPTIONS = [
  "Comercios y Locales",
  "Oficios y Servicios Técnicos",
  "Profesionales y Consultorios",
  "Gastronomía y Eventos",
  "Empresas y Corporativo",
  "Otro Rubro",
];

export default function InteractiveContactModal({
  isOpen,
  onClose,
  onOpenLegalDoc,
}) {
  const prefersReducedMotion = useReducedMotion();
  const formLoadedAtRef = useRef(0);

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
      setErrors({});
      setServerError("");
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

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
      errs.phone = "Ingresá tu número de WhatsApp.";
    } else if (phoneDigits.length < 6 || phoneDigits.length > 16) {
      errs.phone = "Ingresá un teléfono válido con código de área.";
    }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    // Honeypot check
    if (formData.website_url && formData.website_url.trim() !== "") {
      setStatus("success");
      setReferenceId("NEXO-ASES-" + Date.now().toString(36).toUpperCase().slice(-5));
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
      // 1. Guardar primero en la base de datos Firestore
      const result = await submitLeadRecord(payload);

      const refId = result.refId || "NEXO-ASES-OK";
      setReferenceId(refId);

      // 2. Preparar mensaje específico para WhatsApp
      const cleanPhone = (NEXO_CONFIG.whatsappNumber || "5491136450011").replace(/[^0-9]/g, "");
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
            aria-labelledby="consultation-modal-title"
            className="relative w-full max-w-xl bg-[#141519] border border-white/10 rounded-2xl p-5 sm:p-8 text-white shadow-2xl z-10 my-auto overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-px bg-white/10" />

            <button
              type="button"
              onClick={handleClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Cerrar formulario"
            >
              <X className="w-4 h-4" />
            </button>

            {status === "success" ? (
              <FormSuccessCountdown
                referenceId={referenceId}
                title="¡Solicitud de asesoramiento enviada!"
                subtitle="Tus datos ya están registrados en nuestro sistema. El equipo de NEXO Creative analizará tu caso a la brevedad."
                whatsAppUrl={whatsAppFollowUpUrl}
                onClose={handleClose}
                autoRedirectSeconds={3}
              />
            ) : (
              <div className="space-y-4">
                <div className="pr-8 space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#16A34A]/15 border border-[#16A34A]/30 text-[11px] font-bold text-[#22C55E]">
                    <Sparkles className="w-3 h-3" />
                    <span>ASESORAMIENTO ESTRATÉGICO GRATUITO</span>
                  </div>
                  <h3
                    id="consultation-modal-title"
                    className="text-xl sm:text-2xl font-black text-white tracking-tight"
                  >
                    Diagnóstico inicial para tu negocio
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                    Completá este formulario y analizaremos tu situación actual sin costo ni compromiso comercial.
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
                        placeholder="Ej. Lucas Benítez"
                        className={`w-full bg-[#181a20] border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none transition-colors ${
                          errors.fullName ? "border-red-500 focus:border-red-400" : "border-white/10 focus:border-[#16A34A]"
                        }`}
                      />
                      {errors.fullName && <p className="text-[11px] text-red-400 mt-1">{errors.fullName}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1">
                        Nombre de tu Negocio / Marca
                      </label>
                      <input
                        type="text"
                        name="businessName"
                        value={formData.businessName}
                        onChange={handleChange}
                        placeholder="Ej. Barbería Rossi"
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
                        placeholder="Ej. +54 9 11 4455-6677"
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
                        placeholder="contacto@tunegocio.com"
                        className={`w-full bg-[#181a20] border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none transition-colors ${
                          errors.email ? "border-red-500 focus:border-red-400" : "border-white/10 focus:border-[#16A34A]"
                        }`}
                      />
                      {errors.email && <p className="text-[11px] text-red-400 mt-1">{errors.email}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Rubro o Actividad Principal
                    </label>
                    <select
                      name="rubro"
                      value={formData.rubro}
                      onChange={handleChange}
                      className="w-full bg-[#181a20] border border-white/10 focus:border-[#16A34A] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none transition-colors"
                    >
                      {RUBRO_OPTIONS.map((opt) => (
                        <option key={opt} value={opt} className="bg-[#181a20] text-white">
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      ¿Cuál es tu principal desafío o qué te gustaría mejorar? <span className="text-[#22C55E]">*</span>
                    </label>
                    <textarea
                      name="message"
                      rows={3}
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Contanos brevemente qué vendés, cómo conseguís clientes hoy y qué querés lograr..."
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
                        className="mt-0.5 w-4 h-4 rounded bg-[#181a20] border-white/20 text-[#16A34A] focus:ring-0 focus:ring-offset-0 cursor-pointer"
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

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={status === "loading"}
                      className="w-full bg-[#16A34A] hover:bg-[#15803D] active:scale-[0.98] disabled:opacity-50 text-white font-extrabold py-3.5 px-6 rounded-xl text-xs sm:text-sm inline-flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                    >
                      {status === "loading" ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Registrando consulta...</span>
                        </>
                      ) : (
                        <>
                          <span>Enviar solicitud de asesoramiento</span>
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
