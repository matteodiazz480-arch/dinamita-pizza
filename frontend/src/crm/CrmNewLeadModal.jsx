import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  X,
  UserPlus,
  Check,
  User,
  Briefcase,
  DollarSign,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

const STAGES = [
  { value: "nuevo", label: "Nuevo" },
  { value: "contactado", label: "Contactado" },
  { value: "reunion_agendada", label: "Reunión Agendada" },
  { value: "propuesta_enviada", label: "Propuesta Enviada" },
  { value: "negociacion", label: "En Negociación" },
  { value: "ganado", label: "Ganado (Cliente)" },
  { value: "perdido", label: "Perdido" },
];

const RUBROS = [
  "Comercios y Locales",
  "Oficios y Servicios Técnicos",
  "Profesionales de la Salud",
  "Servicios Profesionales & Legales",
  "Gastronomía y Bares",
  "Inmobiliarias & Construcción",
  "Estética y Bienestar",
  "Otro rubro",
];

const STEPS = [
  { id: 1, number: "01", title: "Prospecto", subtitle: "Datos del contacto y negocio", icon: User },
  { id: 2, number: "02", title: "Seguimiento", subtitle: "Servicio de interés y etapa comercial", icon: Briefcase },
  { id: 3, number: "03", title: "Propuesta", subtitle: "Honorarios estimados y notas", icon: DollarSign },
];

export default function CrmNewLeadModal({ isOpen, onClose, onCreateLead }) {
  const prefersReducedMotion = useReducedMotion();
  const [step, setStep] = useState(1);
  const [stepError, setStepError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    businessName: "",
    rubro: "Comercios y Locales",
    phone: "",
    email: "",
    socials: "",
    service: "Publicidad Digital (Meta Ads)",
    origin: "Carga Manual",
    meetingDate: "",
    meetingTime: "15:30",
    status: "nuevo",
    priority: "media",
    responsible: "Mateo Díaz",
    nextContactDate: "",
    adBudget: 80000,
    feeARS: 180000,
    probability: 50,
    notes: "",
  });

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setStepError("");
    }
  }, [isOpen]);

  const calculatedEstimate = Math.round(
    (Number(formData.feeARS) || 0) * ((Number(formData.probability) || 0) / 100)
  );

  const validateCurrentStep = () => {
    if (step === 1) {
      if (!formData.fullName.trim()) {
        setStepError("Ingresá el nombre y apellido del prospecto.");
        return false;
      }
      if (!formData.phone.trim()) {
        setStepError("Ingresá un número de WhatsApp o teléfono.");
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
    const fee = Number(formData.feeARS) || 0;
    const prob = Number(formData.probability) || 50;
    await onCreateLead({
      ...formData,
      feeARS: fee,
      adBudget: Number(formData.adBudget) || 0,
      probability: prob,
      estimatedRevenue: Math.round(fee * (prob / 100)),
    });
    setSubmitting(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end select-none">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
          />

          <motion.aside
            initial={prefersReducedMotion ? false : { x: "100%" }}
            animate={{ x: 0 }}
            exit={prefersReducedMotion ? false : { x: "100%" }}
            transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
            className="relative z-10 w-full max-w-xl h-dvh bg-[#0d0f12] border-l border-white/12 shadow-2xl flex flex-col text-white overflow-hidden"
          >
            {/* Cabecera */}
            <div className="px-5 sm:px-7 py-4 bg-[#141519] border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#16A34A]/15 border border-[#16A34A]/30 flex items-center justify-center text-[#22C55E]">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm sm:text-base font-black text-white tracking-tight">
                      Nueva Oportunidad Comercial
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

            {/* Selector de Etapas */}
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

              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-3">
                <div
                  className="h-full bg-[#16A34A] transition-all duration-300 ease-out"
                  style={{ width: `${(step / 3) * 100}%` }}
                />
              </div>
            </div>

            {stepError && (
              <div className="bg-red-500/15 border-b border-red-500/30 py-2.5 px-6 text-xs text-red-300 font-semibold">
                {stepError}
              </div>
            )}

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
                        <label className="block font-bold text-gray-300 mb-1.5">
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
                          placeholder="Ej. Martín Pérez"
                          className="w-full bg-[#141519] border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#16A34A]"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-gray-300 mb-1.5">
                          Nombre del Negocio
                        </label>
                        <input
                          type="text"
                          value={formData.businessName}
                          onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                          placeholder="Ej. Inmobiliaria Pérez"
                          className="w-full bg-[#141519] border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#16A34A]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block font-bold text-gray-300 mb-1.5">
                          WhatsApp / Teléfono <span className="text-[#22C55E]">*</span>
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => {
                            setFormData({ ...formData, phone: e.target.value });
                            if (stepError) setStepError("");
                          }}
                          placeholder="+54 9 11 ..."
                          className="w-full bg-[#141519] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#16A34A]"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-gray-300 mb-1.5">
                          Instagram / Redes
                        </label>
                        <input
                          type="text"
                          value={formData.socials}
                          onChange={(e) => setFormData({ ...formData, socials: e.target.value })}
                          placeholder="@usuario_instagram"
                          className="w-full bg-[#141519] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#16A34A]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-gray-300 mb-1.5">
                        Rubro Principal
                      </label>
                      <select
                        value={formData.rubro}
                        onChange={(e) => setFormData({ ...formData, rubro: e.target.value })}
                        className="w-full bg-[#141519] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#16A34A]"
                      >
                        {RUBROS.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block font-bold text-gray-300 mb-1.5">
                          Servicio de Interés
                        </label>
                        <select
                          value={formData.service}
                          onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                          className="w-full bg-[#141519] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#16A34A]"
                        >
                          <option value="Publicidad Digital (Meta Ads)">Publicidad Digital (Meta Ads)</option>
                          <option value="Páginas Web Totalmente Personalizables">Páginas Web Totalmente Personalizables</option>
                          <option value="Planes Comercios y Negocios">Planes Comercios y Negocios</option>
                          <option value="Planes NEXO Oficios">Planes NEXO Oficios</option>
                          <option value="Planes NEXO Profesionales">Planes NEXO Profesionales</option>
                          <option value="Plan Presencia & Contenido">Plan Presencia &amp; Contenido</option>
                          <option value="Plan Captación Meta Ads">Plan Captación Meta Ads</option>
                          <option value="Plan Crecimiento Integral">Plan Crecimiento Integral</option>
                          <option value="Reunión Gratuita 20 min">Reunión Gratuita 20 min</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-bold text-gray-300 mb-1.5">
                          Origen del Lead
                        </label>
                        <select
                          value={formData.origin}
                          onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                          className="w-full bg-[#141519] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#16A34A]"
                        >
                          <option value="Carga Manual">Carga Manual</option>
                          <option value="Formulario Web">Formulario Web</option>
                          <option value="Reunión 20 min Web">Reunión 20 min Web</option>
                          <option value="WhatsApp Directo">WhatsApp Directo</option>
                          <option value="Recomendación / Referido">Recomendación / Referido</option>
                          <option value="Prospección / Redes">Prospección / Redes</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block font-bold text-gray-300 mb-1.5">
                          Etapa Comercial
                        </label>
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                          className="w-full bg-[#141519] border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#16A34A]"
                        >
                          {STAGES.map((s) => (
                            <option key={s.value} value={s.value}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block font-bold text-gray-300 mb-1.5">
                          Prioridad
                        </label>
                        <select
                          value={formData.priority}
                          onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                          className="w-full bg-[#141519] border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#16A34A]"
                        >
                          <option value="alta">Alta</option>
                          <option value="media">Media</option>
                          <option value="baja">Baja</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-bold text-gray-300 mb-1.5">
                          Próximo Contacto
                        </label>
                        <input
                          type="date"
                          value={formData.nextContactDate}
                          onChange={(e) => setFormData({ ...formData, nextContactDate: e.target.value })}
                          className="w-full bg-[#141519] border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#16A34A]"
                        />
                      </div>
                    </div>

                    {formData.service === "Reunión Gratuita 20 min" && (
                      <div className="grid grid-cols-2 gap-3.5 p-3.5 bg-[#141519] border border-[#16A34A]/30 rounded-xl">
                        <div>
                          <label className="block font-bold text-[#22C55E] mb-1">
                            Fecha de Reunión
                          </label>
                          <input
                            type="date"
                            value={formData.meetingDate}
                            onChange={(e) => setFormData({ ...formData, meetingDate: e.target.value })}
                            className="w-full bg-[#0d0f12] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#16A34A]"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-[#22C55E] mb-1">
                            Horario (hs)
                          </label>
                          <input
                            type="text"
                            value={formData.meetingTime}
                            onChange={(e) => setFormData({ ...formData, meetingTime: e.target.value })}
                            placeholder="15:30"
                            className="w-full bg-[#0d0f12] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#16A34A]"
                          />
                        </div>
                      </div>
                    )}
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
                    <div className="p-4 bg-[#141519] border border-[#16A34A]/30 rounded-2xl space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                          <label className="block font-bold text-[#22C55E] mb-1.5">
                            Honorarios Estimados (ARS)
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="5000"
                            autoFocus
                            value={formData.feeARS}
                            onChange={(e) => setFormData({ ...formData, feeARS: e.target.value })}
                            placeholder="180000"
                            className="w-full bg-[#0d0f12] border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-[#16A34A]"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-[#22C55E] mb-1.5">
                            Probabilidad de Cierre %
                          </label>
                          <select
                            value={formData.probability}
                            onChange={(e) => setFormData({ ...formData, probability: e.target.value })}
                            className="w-full bg-[#0d0f12] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#16A34A]"
                          >
                            <option value="20">20% - Inicial</option>
                            <option value="40">40% - Contactado</option>
                            <option value="60">60% - Reunión hecha</option>
                            <option value="80">80% - Negociación</option>
                            <option value="100">100% - Ganado</option>
                          </select>
                        </div>
                      </div>

                      <div className="pt-2.5 border-t border-white/8 flex items-center justify-between">
                        <span className="text-gray-400 font-semibold">Valor Ponderado en Pipeline:</span>
                        <span className="font-mono font-black text-base text-[#22C55E]">
                          ${calculatedEstimate.toLocaleString("es-AR")} ARS
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-gray-300 mb-1.5">
                        Observaciones / Notas de Seguimiento
                      </label>
                      <textarea
                        rows={3}
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Detalles de la conversación, objeciones, requisitos..."
                        className="w-full bg-[#141519] border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#16A34A] resize-none"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Barra Inferior Fija */}
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
                    <span>{submitting ? "Guardando..." : "Guardar Oportunidad"}</span>
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
