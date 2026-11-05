import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  X,
  Check,
  AlertTriangle,
  User,
  Stethoscope,
  Megaphone,
  ArrowRight,
  ArrowLeft,
  Headset,
} from "lucide-react";

const STEPS = [
  { id: 1, number: "01", title: "Contacto", subtitle: "Datos del cliente y negocio", icon: User },
  { id: 2, number: "02", title: "Diagnóstico", subtitle: "Situación y objetivos", icon: Stethoscope },
  { id: 3, number: "03", title: "Plan & Pauta", subtitle: "Servicio, honorarios y estrategia", icon: Megaphone },
];

export default function CrmNewCustomerModal({
  isOpen,
  onClose,
  onCreateCustomer,
  existingProfiles = [],
  initialLeadData = null,
}) {
  const prefersReducedMotion = useReducedMotion();
  const [step, setStep] = useState(1);
  const [stepError, setStepError] = useState("");
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    businessName: "",
    phone: "",
    email: "",
    city: "",
    socials: "",
    rubro: "",
    status: "nuevo",
    // Diagnóstico
    businessSituation: "",
    needsDetected: "",
    problems: "",
    businessGoals: "",
    // Plan
    planName: "Plan Captación Meta Ads",
    planPrice: "180000",
    includedServices: "",
    startDate: new Date().toISOString().slice(0, 10),
    renewalDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    // Publicidad
    adStrategy: "Captación de Consultas en WhatsApp",
    adPlatforms: "Meta Ads (Instagram & Facebook)",
    adCampaigns: "",
    adBudget: "100000",
    strategyDetails: "",
    // Observaciones
    observations: "",
  });

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setStepError("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialLeadData) {
      setFormData((prev) => ({
        ...prev,
        fullName: initialLeadData.fullName || "",
        businessName: initialLeadData.businessName || "",
        phone: initialLeadData.phone || "",
        email: initialLeadData.email || "",
        rubro: initialLeadData.rubro || "",
        planName: initialLeadData.service || "Plan Captación Meta Ads",
        observations: initialLeadData.message || initialLeadData.notes || "",
        businessSituation: initialLeadData.message ? `Consulta web inicial: ${initialLeadData.message}` : "",
      }));
    }
  }, [initialLeadData]);

  // Detector de duplicados en tiempo real por teléfono o email
  useEffect(() => {
    const cleanPhone = (formData.phone || "").replace(/[^0-9]/g, "");
    const cleanEmail = (formData.email || "").trim().toLowerCase();

    if (cleanPhone.length >= 8 || (cleanEmail && cleanEmail.includes("@"))) {
      const match = existingProfiles.find((p) => {
        const pPhone = (p.phone || "").replace(/[^0-9]/g, "");
        const pEmail = (p.email || "").trim().toLowerCase();
        return (
          (cleanPhone.length >= 8 && pPhone && pPhone === cleanPhone) ||
          (cleanEmail && pEmail && pEmail === cleanEmail)
        );
      });

      if (match) {
        setDuplicateWarning({
          name: match.fullName || match.businessName,
          refId: match.refId || match.id,
          phone: match.phone,
        });
      } else {
        setDuplicateWarning(null);
      }
    } else {
      setDuplicateWarning(null);
    }
  }, [formData.phone, formData.email, existingProfiles]);

  const validateCurrentStep = () => {
    if (step === 1) {
      if (!formData.fullName.trim() && !formData.businessName.trim()) {
        setStepError("Ingresá el nombre del cliente o de su negocio para avanzar.");
        return false;
      }
      if (!formData.phone.trim()) {
        setStepError("Ingresá un número de WhatsApp o teléfono de contacto.");
        return false;
      }
    }
    setStepError("");
    return true;
  };

  const handleNextStep = () => {
    if (!validateCurrentStep()) return;
    if (step < 3) setStep(step + 1);
  };

  const handlePrevStep = () => {
    setStepError("");
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step < 3) {
      handleNextStep();
      return;
    }
    if (!validateCurrentStep() || submitting) return;

    setSubmitting(true);
    try {
      const res = await onCreateCustomer(formData);
      if (res !== false) {
        onClose();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end select-none">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
          />

          {/* Panel Lateral de Altura Completa (Drawer por Etapas) */}
          <motion.aside
            initial={prefersReducedMotion ? false : { x: "100%" }}
            animate={{ x: 0 }}
            exit={prefersReducedMotion ? false : { x: "100%" }}
            transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
            className="relative z-10 w-full max-w-xl h-dvh bg-[#0d0f12] border-l border-white/12 shadow-2xl flex flex-col text-white overflow-hidden"
          >
            {/* Cabecera del Panel */}
            <div className="px-5 sm:px-7 py-4 bg-[#141519] border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#16A34A]/15 border border-[#16A34A]/30 flex items-center justify-center text-[#22C55E]">
                  <Headset className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm sm:text-base font-black text-white tracking-tight">
                      Nueva Ficha de Cliente
                    </h2>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-gray-300">
                      Etapa {step} de 3
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400">
                    {STEPS[step - 1].subtitle}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-[background-color,transform] duration-150 active:scale-95 cursor-pointer"
                aria-label="Cerrar panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Barra de Progreso y Selector de Etapas */}
            <div className="px-5 sm:px-7 py-3.5 bg-[#111318] border-b border-white/8">
              <div className="grid grid-cols-3 gap-2">
                {STEPS.map((s) => {
                  const isActive = step === s.id;
                  const isDone = step > s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        if (s.id < step || validateCurrentStep()) {
                          setStep(s.id);
                        }
                      }}
                      className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all cursor-pointer ${
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
                        <div className="text-[11px] font-bold leading-tight truncate">
                          {s.title}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Barra lineal de avance */}
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-3">
                <div
                  className="h-full bg-[#16A34A] transition-all duration-300 ease-out"
                  style={{ width: `${(step / 3) * 100}%` }}
                />
              </div>
            </div>

            {/* Alerta de duplicado */}
            {duplicateWarning && (
              <div className="bg-amber-500/15 border-b border-amber-500/30 py-2.5 px-6 flex items-center gap-2.5 text-xs text-amber-300">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>
                  Ya existe una ficha con este contacto:{" "}
                  <strong>{duplicateWarning.name}</strong> ({duplicateWarning.refId}).
                </span>
              </div>
            )}

            {/* Mensaje de validación de etapa */}
            {stepError && (
              <div className="bg-red-500/15 border-b border-red-500/30 py-2.5 px-6 text-xs text-red-300 font-semibold">
                {stepError}
              </div>
            )}

            {/* Cuerpo del Formulario por Etapas */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 sm:px-7 py-6 text-xs flex flex-col justify-between">
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="text-gray-300 font-bold block mb-1.5">
                          Nombre y Apellido <span className="text-[#22C55E]">*</span>
                        </label>
                        <input
                          type="text"
                          autoFocus
                          value={formData.fullName}
                          onChange={(e) => {
                            setFormData({ ...formData, fullName: e.target.value });
                            if (stepError) setStepError("");
                          }}
                          placeholder="Ej: Mateo Díaz"
                          className="w-full px-3.5 py-2.5 bg-[#141519] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-[#16A34A]"
                        />
                      </div>

                      <div>
                        <label className="text-gray-300 font-bold block mb-1.5">
                          Negocio / Marca
                        </label>
                        <input
                          type="text"
                          value={formData.businessName}
                          onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                          placeholder="Ej: Estudio Jurídico Díaz"
                          className="w-full px-3.5 py-2.5 bg-[#141519] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-[#16A34A]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="text-gray-300 font-bold block mb-1.5">
                          Teléfono / WhatsApp <span className="text-[#22C55E]">*</span>
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => {
                            setFormData({ ...formData, phone: e.target.value });
                            if (stepError) setStepError("");
                          }}
                          placeholder="Ej: +54 9 11 1234-5678"
                          className="w-full px-3.5 py-2.5 bg-[#141519] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-[#16A34A]"
                        />
                      </div>

                      <div>
                        <label className="text-gray-300 font-bold block mb-1.5">
                          Correo Electrónico
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="cliente@ejemplo.com"
                          className="w-full px-3.5 py-2.5 bg-[#141519] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-[#16A34A]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="text-gray-300 font-bold block mb-1.5">
                          Ciudad / Ubicación
                        </label>
                        <input
                          type="text"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          placeholder="Ej: CABA / Buenos Aires"
                          className="w-full px-3.5 py-2.5 bg-[#141519] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-[#16A34A]"
                        />
                      </div>

                      <div>
                        <label className="text-gray-300 font-bold block mb-1.5">
                          Estado Inicial
                        </label>
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-[#141519] border border-white/10 rounded-xl text-white text-xs cursor-pointer focus:outline-none focus:border-[#16A34A]"
                        >
                          <option value="nuevo">Nuevo</option>
                          <option value="en_evaluacion">En evaluación</option>
                          <option value="pendiente">Pendiente</option>
                          <option value="activo">Activo</option>
                        </select>
                      </div>
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
                      <label className="text-gray-300 font-bold block mb-1.5">
                        Situación Actual del Negocio
                      </label>
                      <textarea
                        rows={3}
                        autoFocus
                        value={formData.businessSituation}
                        onChange={(e) => setFormData({ ...formData, businessSituation: e.target.value })}
                        placeholder="Cómo se encuentra el negocio hoy, qué canales de venta utiliza..."
                        className="w-full px-3.5 py-2.5 bg-[#141519] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-[#16A34A] resize-none"
                      />
                    </div>

                    <div>
                      <label className="text-gray-300 font-bold block mb-1.5">
                        Necesidades y Problemas Detectados
                      </label>
                      <textarea
                        rows={3}
                        value={formData.needsDetected}
                        onChange={(e) => setFormData({ ...formData, needsDetected: e.target.value })}
                        placeholder="Falta de consultas diarias, redes desactualizadas, anuncios sin retorno..."
                        className="w-full px-3.5 py-2.5 bg-[#141519] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-[#16A34A] resize-none"
                      />
                    </div>

                    <div>
                      <label className="text-gray-300 font-bold block mb-1.5">
                        Objetivos Comerciales del Cliente
                      </label>
                      <input
                        type="text"
                        value={formData.businessGoals}
                        onChange={(e) => setFormData({ ...formData, businessGoals: e.target.value })}
                        placeholder="Ej: Recibir 15 consultas calificadas por semana en WhatsApp"
                        className="w-full px-3.5 py-2.5 bg-[#141519] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-[#16A34A]"
                      />
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={prefersReducedMotion ? false : { opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={prefersReducedMotion ? false : { opacity: 0, x: -12 }}
                    transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="text-gray-300 font-bold block mb-1.5">
                          Plan Elegido
                        </label>
                        <select
                          value={formData.planName}
                          onChange={(e) => setFormData({ ...formData, planName: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-[#141519] border border-white/10 rounded-xl text-white text-xs cursor-pointer focus:outline-none focus:border-[#16A34A]"
                        >
                          <option value="Plan Presencia & Contenido">Plan Presencia &amp; Contenido</option>
                          <option value="Plan Captación Meta Ads">Plan Captación Meta Ads</option>
                          <option value="Plan Crecimiento Integral">Plan Crecimiento Integral</option>
                          <option value="Páginas Web Totalmente Personalizables">Páginas Web Totalmente Personalizables</option>
                          <option value="Servicio Personalizado">Servicio Personalizado</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-gray-300 font-bold block mb-1.5">
                          Honorarios Acordados (ARS)
                        </label>
                        <input
                          type="number"
                          value={formData.planPrice}
                          onChange={(e) => setFormData({ ...formData, planPrice: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-[#141519] border border-white/10 rounded-xl text-[#22C55E] font-bold text-xs font-mono focus:outline-none focus:border-[#16A34A]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="text-gray-300 font-bold block mb-1.5">
                          Estrategia Publicitaria
                        </label>
                        <input
                          type="text"
                          value={formData.adStrategy}
                          onChange={(e) => setFormData({ ...formData, adStrategy: e.target.value })}
                          placeholder="Ej: Anuncios a WhatsApp con filtro"
                          className="w-full px-3.5 py-2.5 bg-[#141519] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-[#16A34A]"
                        />
                      </div>

                      <div>
                        <label className="text-gray-300 font-bold block mb-1.5">
                          Presupuesto en Pauta (ARS)
                        </label>
                        <input
                          type="number"
                          value={formData.adBudget}
                          onChange={(e) => setFormData({ ...formData, adBudget: e.target.value })}
                          placeholder="Monto destinado a anuncios"
                          className="w-full px-3.5 py-2.5 bg-[#141519] border border-white/10 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-[#16A34A]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-gray-300 font-bold block mb-1.5">
                        Observaciones / Indicaciones para el Equipo
                      </label>
                      <textarea
                        rows={3}
                        value={formData.observations}
                        onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                        placeholder="Preferencias de horario, accesos entregados, notas importantes..."
                        className="w-full px-3.5 py-2.5 bg-[#141519] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-[#16A34A] resize-none"
                      />
                    </div>

                    {/* Resumen previo al guardado */}
                    <div className="p-3.5 rounded-xl bg-[#141519] border border-white/8 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold block">
                          Cliente a registrar
                        </span>
                        <span className="text-xs font-black text-white">
                          {formData.fullName || formData.businessName || "Sin nombre"}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold block">
                          Plan &amp; Honorarios
                        </span>
                        <span className="text-xs font-mono font-bold text-[#22C55E]">
                          ${(Number(formData.planPrice) || 0).toLocaleString("es-AR")} ARS
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Barra Inferior Fija de Navegación entre Etapas */}
              <div className="pt-5 mt-6 border-t border-white/10 flex items-center justify-between gap-3">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-200 text-xs font-bold transition-[background-color,transform] duration-150 active:scale-97 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Etapa anterior</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                )}

                {step < 3 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-black transition-[background-color,transform] duration-150 active:scale-97 cursor-pointer shadow-sm"
                  >
                    <span>Continuar a Etapa {step + 1}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-black transition-[background-color,transform] duration-150 active:scale-97 cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    <span>{submitting ? "Guardando..." : "Crear Ficha de Cliente"}</span>
                  </button>
                )}
              </div>
            </form>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
