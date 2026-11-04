import React, { useState, useEffect } from "react";
import { NEXO_CONFIG } from "../data/nexoData";
import { X, ArrowRight, Check, Compass, AlertCircle } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { playSound } from "../utils/sound";
import { submitLeadRecord, sanitizeClientText } from "../utils/securityClient";
import FormSuccessCountdown from "./FormSuccessCountdown";

export default function PlanFinderModal({
  isOpen,
  onClose,
}) {
  const prefersReducedMotion = useReducedMotion();
  const questions = NEXO_CONFIG.planFinder.questions;
  const plans = NEXO_CONFIG.plans.items;

  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [recommendedPlan, setRecommendedPlan] = useState(null);

  // Estado del formulario de contacto para el plan encontrado
  const [formData, setFormData] = useState({
    fullName: "",
    businessName: "",
    phone: "",
    email: "",
    privacyConsent: true,
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [status, setStatus] = useState("idle"); // "idle" | "submitting" | "success"
  const [referenceId, setReferenceId] = useState("");
  const [whatsAppFollowUpUrl, setWhatsAppFollowUpUrl] = useState("");

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
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

  const handleSelectOption = (targetPlanId) => {
    playSound("send", false);
    const updatedAnswers = [...answers, targetPlanId];
    setAnswers(updatedAnswers);

    if (stepIndex + 1 < questions.length) {
      setStepIndex(stepIndex + 1);
    } else {
      const counts = {};
      updatedAnswers.forEach((id) => {
        counts[id] = (counts[id] || 0) + 1;
      });
      let bestId = updatedAnswers[0];
      let maxCount = 0;
      Object.entries(counts).forEach(([id, count]) => {
        if (count > maxCount) {
          maxCount = count;
          bestId = id;
        }
      });

      const found = plans.find((p) => p.id === bestId) || plans[1];
      setRecommendedPlan(found);
      playSound("success", false);
    }
  };

  const handleReset = () => {
    setStepIndex(0);
    setAnswers([]);
    setRecommendedPlan(null);
    setStatus("idle");
    setErrors({});
    setServerError("");
  };

  const handleClose = () => {
    playSound("close", false);
    handleReset();
    onClose();
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const nextVal =
      type === "checkbox" ? checked : sanitizeClientText(value, 100);
    setFormData((prev) => ({ ...prev, [name]: nextVal }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (serverError) setServerError("");
  };

  const validate = () => {
    const errs = {};
    const cleanName = sanitizeClientText(formData.fullName, 80).trim();
    const cleanPhone = sanitizeClientText(formData.phone, 30).trim();
    const cleanEmail = sanitizeClientText(formData.email, 120).trim();

    if (cleanName.length < 2) {
      errs.fullName = "Ingresá tu nombre (mínimo 2 letras).";
    }
    const phoneDigits = cleanPhone.replace(/[^0-9]/g, "");
    if (!cleanPhone || phoneDigits.length < 6) {
      errs.phone = "Ingresá tu WhatsApp con código de área.";
    }
    if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(cleanEmail)) {
      errs.email = "Ingresá un correo electrónico válido.";
    }
    if (!formData.privacyConsent) {
      errs.privacyConsent = "Debés prestar tu consentimiento para contactarte.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    if (!validate()) {
      playSound("close", false);
      return;
    }

    setStatus("submitting");
    playSound("send", false);

    const payload = {
      fullName: formData.fullName.trim(),
      businessName: formData.businessName.trim() || "No especificado",
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      service: `Plan Recomendado: ${recommendedPlan?.name || "Plan NEXO"}`,
      origin: "Encontrá tu plan",
      formType: "encontra_tu_plan",
      status: "nuevo",
      priority: "media",
      responsible: "Mateo Díaz",
      message: `Resultado del test 'Encontrá tu plan': ${recommendedPlan?.name} (${recommendedPlan?.priceInfo}).`,
      privacyConsent: Boolean(formData.privacyConsent),
    };

    try {
      // 1. Guardar en base de datos Firestore
      const result = await submitLeadRecord(payload);
      const refId = result.refId || "NEXO-PLAN-OK";
      setReferenceId(refId);

      // 2. Preparar mensaje para WhatsApp
      const cleanPhone = (NEXO_CONFIG.whatsappNumber || "5491164444159").replace(/[^0-9]/g, "");
      const fullText = `*TEST 'ENCONTRÁ TU PLAN' — NEXO CREATIVE*
Ref: ${refId}
----------------------------------------
*Plan Recomendado:* ${recommendedPlan?.name} (${recommendedPlan?.priceInfo})
*Cliente:* ${payload.fullName}
*Negocio:* ${payload.businessName}
*WhatsApp:* ${payload.phone}
${payload.email ? `*Email:* ${payload.email}\n` : ""}
Hola Mateo, completé el test en la web y el plan sugerido fue *${recommendedPlan?.name}*. Me gustaría conversar para implementarlo en mi negocio.`;

      setWhatsAppFollowUpUrl(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(fullText)}`);
      setStatus("success");
    } catch (err) {
      console.error("Error al procesar test Encontrá tu plan:", err);
      setStatus("idle");
      playSound("close", false);
      setServerError("Ocurrió un error al guardar tu selección. Podés escribirnos por WhatsApp.");
    }
  };

  const currentQuestion = questions[stepIndex];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
          />

          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.96, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={prefersReducedMotion ? false : { opacity: 0, scale: 0.96, y: 14 }}
            transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="plan-finder-title"
            className="relative w-full max-w-xl bg-[#141519] border border-white/10 rounded-2xl p-5 sm:p-8 text-white shadow-2xl z-10 my-auto overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-px bg-white/10" />

            <button
              type="button"
              onClick={handleClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Cerrar recomendador de planes"
            >
              <X className="w-4 h-4" />
            </button>

            {status === "success" ? (
              <FormSuccessCountdown
                referenceId={referenceId}
                title="¡Plan registrado con éxito!"
                subtitle={`Tu plan recomendado (${recommendedPlan?.name}) quedó registrado en nuestro sistema. Te contactaremos a la brevedad.`}
                whatsAppUrl={whatsAppFollowUpUrl}
                onClose={handleClose}
                autoRedirectSeconds={3}
              />
            ) : recommendedPlan ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#22C55E] border-b border-white/10 pb-3">
                  <Compass className="w-4 h-4" />
                  <span>Plan recomendado para tu negocio</span>
                </div>

                <div>
                  <h3
                    id="plan-finder-title"
                    className="text-2xl font-black text-white tracking-tight"
                  >
                    {recommendedPlan.name}
                  </h3>
                  <p className="text-xs sm:text-sm font-semibold text-[#22C55E] mt-0.5">
                    {recommendedPlan.tagline} · {recommendedPlan.priceInfo}
                  </p>
                </div>

                <div className="rounded-xl bg-[#0d0f12] border border-white/10 p-3.5 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
                    Qué incluye este plan:
                  </span>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {recommendedPlan.includedServices.slice(0, 4).map((srv, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-xs text-gray-200"
                      >
                        <span className="w-3.5 h-3.5 rounded-full bg-[#16A34A] text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-2 h-2 stroke-[3]" />
                        </span>
                        <span className="leading-tight">{srv}</span>
                      </li>
                    ))}
                  </ul>
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

                {/* Formulario de contacto integrado para este plan */}
                <form onSubmit={handleSubmit} noValidate className="space-y-3 pt-1">
                  <p className="text-xs text-gray-300 font-semibold">
                    Completá tus datos para recibir la propuesta de este plan:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="Tu Nombre y Apellido *"
                        className={`w-full bg-[#181a20] border rounded-xl px-3 py-2 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none transition-colors ${
                          errors.fullName ? "border-red-500 focus:border-red-400" : "border-white/10 focus:border-[#16A34A]"
                        }`}
                      />
                      {errors.fullName && <p className="text-[10px] text-red-400 mt-0.5">{errors.fullName}</p>}
                    </div>

                    <div>
                      <input
                        type="text"
                        name="businessName"
                        value={formData.businessName}
                        onChange={handleChange}
                        placeholder="Nombre de tu Negocio / Marca"
                        className="w-full bg-[#181a20] border border-white/10 focus:border-[#16A34A] rounded-xl px-3 py-2 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="WhatsApp (con código de área) *"
                        className={`w-full bg-[#181a20] border rounded-xl px-3 py-2 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none transition-colors ${
                          errors.phone ? "border-red-500 focus:border-red-400" : "border-white/10 focus:border-[#16A34A]"
                        }`}
                      />
                      {errors.phone && <p className="text-[10px] text-red-400 mt-0.5">{errors.phone}</p>}
                    </div>

                    <div>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Correo electrónico (opcional)"
                        className="w-full bg-[#181a20] border border-white/10 focus:border-[#16A34A] rounded-xl px-3 py-2 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="pt-1">
                    <label className="flex items-start gap-2 cursor-pointer text-left">
                      <input
                        type="checkbox"
                        name="privacyConsent"
                        checked={formData.privacyConsent}
                        onChange={handleChange}
                        className="mt-0.5 w-3.5 h-3.5 rounded bg-[#181a20] border-white/20 text-[#16A34A] focus:ring-0 cursor-pointer"
                      />
                      <span className="text-[10px] text-gray-400 leading-snug">
                        Acepto el tratamiento de datos para recibir la propuesta de este plan.
                      </span>
                    </label>
                    {errors.privacyConsent && (
                      <p className="text-[10px] text-red-400 mt-0.5">{errors.privacyConsent}</p>
                    )}
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={status === "submitting"}
                      className="w-full bg-[#16A34A] hover:bg-[#15803D] active:scale-[0.98] disabled:opacity-50 text-white font-extrabold py-3 px-5 rounded-xl text-xs sm:text-sm inline-flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                    >
                      {status === "submitting" ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Guardando recomendación...</span>
                        </>
                      ) : (
                        <>
                          <span>Solicitar cotización de {recommendedPlan.name}</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="pr-8">
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                    <span className="text-[#22C55E]">Encontrá tu plan</span>
                    <span>
                      Paso 0{stepIndex + 1} / 0{questions.length}
                    </span>
                  </div>

                  <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mb-4">
                    <div
                      className="h-full bg-[#16A34A] origin-left transition-transform duration-300"
                      style={{
                        transform: `scaleX(${(stepIndex + 1) / questions.length})`,
                      }}
                    />
                  </div>

                  <h3
                    id="plan-finder-title"
                    className="text-lg sm:text-2xl font-black text-white tracking-tight leading-snug"
                  >
                    {currentQuestion.title}
                  </h3>
                </div>

                <div className="space-y-2.5">
                  {currentQuestion.options.map((opt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectOption(opt.targetPlan)}
                      className="w-full text-left rounded-xl bg-[#0d0f12] hover:bg-[#1a1c22] border border-white/10 hover:border-[#16A34A]/50 p-4 transition-[background-color,border-color,transform] duration-150 active:scale-98 flex items-center justify-between gap-3 group cursor-pointer"
                    >
                      <span className="text-xs sm:text-sm font-semibold text-gray-200 group-hover:text-white leading-snug">
                        {opt.label}
                      </span>
                      <span className="w-7 h-7 rounded-lg bg-white/5 group-hover:bg-[#16A34A] text-gray-400 group-hover:text-white flex items-center justify-center flex-shrink-0 transition-colors">
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
