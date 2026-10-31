import React, { useState, useEffect, useRef } from "react";
import { NEXO_CONFIG } from "../data/nexoData";
import { X, AlertCircle, ArrowRight, ShieldCheck } from "lucide-react";
import { WhatsAppIcon } from "./Icons";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { playSound } from "../utils/sound";
import { securePost, sanitizeClientText } from "../utils/securityClient";

export default function InteractiveContactModal({
  isOpen,
  onClose,
  initialService = "",
  onOpenLegalDoc,
}) {
  const prefersReducedMotion = useReducedMotion();
  const formLoadedAtRef = useRef(0);

  const [formData, setFormData] = useState({
    fullName: "",
    businessName: "",
    email: "",
    phone: "",
    service: initialService || "Publicidad Digital (Meta Ads)",
    message: "",
    privacyConsent: false,
    website_url: "",
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
      errs.message = "Describí brevemente tu proyecto o consulta (mínimo 10 caracteres).";
    }
    if (!formData.privacyConsent) {
      errs.privacyConsent =
        "Debés prestar tu consentimiento informado para el tratamiento de tus datos.";
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
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (serverError) {
      setServerError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    if (!validate()) {
      playSound("close", false);
      return;
    }

    setStatus("loading");
    playSound("send", false);

    const payload = {
      fullName: formData.fullName.trim(),
      businessName: formData.businessName.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      service: formData.service,
      message: formData.message.trim(),
      privacyConsent: Boolean(formData.privacyConsent),
      website_url: formData.website_url,
      formLoadedAt: formLoadedAtRef.current,
    };

    const result = await securePost("/api/contact", payload);

    if (!result.ok) {
      setStatus("idle");
      playSound("close", false);
      if (result.data?.fieldErrors) {
        setErrors((prev) => ({ ...prev, ...result.data.fieldErrors }));
      }
      setServerError(
        result.data?.error ||
          "No se pudo completar el envío en este momento. Revisá los datos e intentá nuevamente."
      );
      return;
    }

    const refId = result.data.refId || "NEXO-OK";
    const sData = result.data.sanitizedData || payload;
    setReferenceId(refId);

    const cleanPhone = NEXO_CONFIG.whatsappNumber.replace(/[^0-9]/g, "");
    const fullText = `*SOLICITUD DE ASESORAMIENTO (${refId}) — NEXO CREATIVE*
----------------------------------------
*Cliente:* ${sData.fullName}
*Negocio:* ${sData.businessName || "No especificado"}
*Email:* ${sData.email}
*WhatsApp:* ${sData.phone}
*Servicio:* ${sData.service}
*Consulta:*
${sData.message}
----------------------------------------`;

    setWhatsAppFollowUpUrl(
      `https://wa.me/${cleanPhone}?text=${encodeURIComponent(fullText)}`
    );

    setStatus("success");
    playSound("success", false);
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
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-modal-title"
            className="relative w-full max-w-xl bg-[#141519] border border-white/10 rounded-2xl p-5 sm:p-8 text-white shadow-2xl z-10 my-auto overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#BCE838]/60 to-transparent" />

            <button
              type="button"
              onClick={handleClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Cerrar formulario"
            >
              <X className="w-4 h-4" />
            </button>

            {status === "success" ? (
              <div className="py-8 sm:py-10 text-center space-y-5">
                <div className="w-16 h-16 mx-auto rounded-full bg-[#BCE838]/12 border border-[#BCE838]/35 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-[#BCE838]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <motion.path
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
                      d="M20 6L9 17L4 12"
                    />
                  </svg>
                </div>

                <div className="space-y-1.5">
                  <span className="inline-block px-2.5 py-0.5 rounded-md bg-white/[0.06] border border-white/10 text-[11px] font-bold text-[#BCE838]">
                    Solicitud registrada: {referenceId}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white pt-1">
                    ¡Formulario enviado correctamente!
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-300 max-w-md mx-auto leading-relaxed">
                    Tus datos fueron validados y registrados de forma segura. El equipo de{" "}
                    <strong className="text-white">NEXO Creative</strong> se pondrá en contacto a la brevedad.
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  {whatsAppFollowUpUrl && (
                    <a
                      href={whatsAppFollowUpUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#BCE838] hover:bg-[#add92b] text-[#111111] font-extrabold rounded-xl text-xs sm:text-sm transition-colors cursor-pointer"
                    >
                      <WhatsAppIcon className="w-4 h-4 fill-[#111111]" />
                      <span>Continuar por WhatsApp</span>
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={handleClose}
                    className="w-full sm:w-auto px-6 py-3 bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/10 font-bold rounded-xl text-xs sm:text-sm transition-colors cursor-pointer"
                  >
                    Cerrar ventana
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="pr-8">
                  <h3
                    id="contact-modal-title"
                    className="text-xl sm:text-2xl font-black text-white tracking-tight"
                  >
                    Solicitar asesoramiento gratuito
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-400 mt-1">
                    Completá tus datos para analizar tu negocio y enviarte una propuesta a medida.
                  </p>
                </div>

                {serverError && (
                  <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 flex items-start gap-2.5 text-xs text-rose-300">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
                    <span>{serverError}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
                  <div className="hidden" aria-hidden="true">
                    <label htmlFor="website_url">No completar este campo</label>
                    <input
                      id="website_url"
                      type="text"
                      name="website_url"
                      tabIndex={-1}
                      autoComplete="off"
                      value={formData.website_url}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label
                        htmlFor="field-fullName"
                        className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1"
                      >
                        Nombre y apellido <span className="text-[#BCE838]">*</span>
                      </label>
                      <input
                        id="field-fullName"
                        type="text"
                        name="fullName"
                        maxLength={80}
                        autoComplete="name"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="Tu nombre completo"
                        className={`w-full bg-[#0d0f12] border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none transition-colors ${
                          errors.fullName
                            ? "border-rose-500 ring-1 ring-rose-500"
                            : "border-white/10 focus:border-[#BCE838]"
                        }`}
                      />
                      {errors.fullName && (
                        <p className="flex items-center gap-1 text-[11px] text-rose-400 mt-1">
                          <AlertCircle className="w-3 h-3 flex-shrink-0" />
                          <span>{errors.fullName}</span>
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="field-businessName"
                        className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1"
                      >
                        Negocio o empresa
                      </label>
                      <input
                        id="field-businessName"
                        type="text"
                        name="businessName"
                        maxLength={80}
                        autoComplete="organization"
                        value={formData.businessName}
                        onChange={handleChange}
                        placeholder="Nombre o rubro (opcional)"
                        className="w-full bg-[#0d0f12] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#BCE838] transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label
                        htmlFor="field-email"
                        className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1"
                      >
                        Correo electrónico <span className="text-[#BCE838]">*</span>
                      </label>
                      <input
                        id="field-email"
                        type="email"
                        name="email"
                        maxLength={120}
                        autoComplete="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="correo@ejemplo.com"
                        className={`w-full bg-[#0d0f12] border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none transition-colors ${
                          errors.email
                            ? "border-rose-500 ring-1 ring-rose-500"
                            : "border-white/10 focus:border-[#BCE838]"
                        }`}
                      />
                      {errors.email && (
                        <p className="flex items-center gap-1 text-[11px] text-rose-400 mt-1">
                          <AlertCircle className="w-3 h-3 flex-shrink-0" />
                          <span>{errors.email}</span>
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="field-phone"
                        className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1"
                      >
                        WhatsApp <span className="text-[#BCE838]">*</span>
                      </label>
                      <input
                        id="field-phone"
                        type="tel"
                        name="phone"
                        maxLength={25}
                        autoComplete="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+54 9 11 ..."
                        className={`w-full bg-[#0d0f12] border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none transition-colors ${
                          errors.phone
                            ? "border-rose-500 ring-1 ring-rose-500"
                            : "border-white/10 focus:border-[#BCE838]"
                        }`}
                      />
                      {errors.phone && (
                        <p className="flex items-center gap-1 text-[11px] text-rose-400 mt-1">
                          <AlertCircle className="w-3 h-3 flex-shrink-0" />
                          <span>{errors.phone}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="field-service"
                      className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1"
                    >
                      Servicio que necesitás
                    </label>
                    <select
                      id="field-service"
                      name="service"
                      value={formData.service || initialService || "Publicidad Digital (Meta Ads)"}
                      onChange={handleChange}
                      className="w-full bg-[#0d0f12] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-[#BCE838] transition-colors"
                    >
                      <option value="Publicidad Digital (Meta Ads)">Publicidad Digital (Meta Ads)</option>
                      <option value="Gestión de Redes Sociales">Gestión de Redes Sociales</option>
                      <option value="Diseño de Contenido">Diseño de Contenido</option>
                      <option value="Estrategia Digital">Estrategia Digital</option>
                      <option value="Plan Presencia & Contenido">Plan Presencia &amp; Contenido</option>
                      <option value="Plan Captación Meta Ads">Plan Captación Meta Ads</option>
                      <option value="Plan Crecimiento Integral">Plan Crecimiento Integral</option>
                      <option value="Asesoramiento Gratuito General">Asesoramiento Gratuito General</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="field-message"
                      className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1"
                    >
                      Proyecto o consulta <span className="text-[#BCE838]">*</span>
                    </label>
                    <textarea
                      id="field-message"
                      rows={3}
                      name="message"
                      maxLength={800}
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Contanos qué vendés y qué objetivo buscás alcanzar."
                      className={`w-full bg-[#0d0f12] border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none transition-colors resize-none ${
                        errors.message
                           ? "border-rose-500 ring-1 ring-rose-500"
                          : "border-white/10 focus:border-[#BCE838]"
                      }`}
                    />
                    {errors.message && (
                      <p className="flex items-center gap-1 text-[11px] text-rose-400 mt-1">
                        <AlertCircle className="w-3 h-3 flex-shrink-0" />
                        <span>{errors.message}</span>
                      </p>
                    )}
                  </div>

                  <div className="pt-0.5">
                    <label className="flex items-start gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        name="privacyConsent"
                        checked={formData.privacyConsent}
                        onChange={handleChange}
                        className="mt-0.5 w-4 h-4 rounded border-white/20 bg-[#0d0f12] accent-[#BCE838] cursor-pointer flex-shrink-0"
                      />
                      <span className="text-[11px] text-gray-300 leading-relaxed">
                        He leído y acepto la{" "}
                        <button
                          type="button"
                          onClick={() => onOpenLegalDoc?.("privacidad")}
                          className="text-white underline underline-offset-2 hover:text-[#BCE838] transition-colors cursor-pointer"
                        >
                          Política de Privacidad
                        </button>{" "}
                        y los{" "}
                        <button
                          type="button"
                          onClick={() => onOpenLegalDoc?.("terminos")}
                          className="text-white underline underline-offset-2 hover:text-[#BCE838] transition-colors cursor-pointer"
                        >
                          Términos y Condiciones
                        </button>
                        , prestando mi consentimiento para el tratamiento de mis datos con el fin de responder esta consulta (Ley N° 25.326).
                      </span>
                    </label>
                    {errors.privacyConsent && (
                      <p className="flex items-center gap-1 text-[11px] text-rose-400 mt-1">
                        <AlertCircle className="w-3 h-3 flex-shrink-0" />
                        <span>{errors.privacyConsent}</span>
                      </p>
                    )}
                  </div>

                  <div className="pt-1">
                    <button
                      type="submit"
                      disabled={status === "loading"}
                      className="w-full bg-[#BCE838] hover:bg-[#add92b] disabled:opacity-75 text-[#111111] font-extrabold py-3.5 px-6 rounded-xl text-xs sm:text-sm transition-all flex items-center justify-center gap-2 group cursor-pointer shadow-sm"
                    >
                      {status === "loading" ? (
                        <>
                          <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                          <span>Validando y enviando solicitud...</span>
                        </>
                      ) : (
                        <>
                          <span>Enviar solicitud</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </>
                      )}
                    </button>

                    <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400 mt-2.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#BCE838]" />
                      <span>Protegido contra envíos automatizados · Derechos ARCO garantizados</span>
                    </div>
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
