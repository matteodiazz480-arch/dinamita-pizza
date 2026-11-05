import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  X,
  Megaphone,
  Check,
  Target,
  DollarSign,
  TrendingUp,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

const PLATFORMS = [
  "Meta Ads (Instagram & Facebook)",
  "Instagram Ads",
  "Facebook Ads",
  "Google Ads (Búsqueda)",
  "TikTok Ads",
  "LinkedIn Ads",
  "Email Marketing",
  "Otra",
];

const OBJECTIVES = [
  "Captación de Clientes (WhatsApp)",
  "Generación de Clientes Potenciales (Formularios)",
  "Tráfico a Landing Page",
  "Reconocimiento de Marca / Alcance",
  "Venta Directa de Servicios",
];

const STEPS = [
  { id: 1, number: "01", title: "Campaña & Canal", subtitle: "Plataforma, objetivo y fechas", icon: Target },
  { id: 2, number: "02", title: "Inversión Propia", subtitle: "Presupuesto asignado y gasto real", icon: DollarSign },
  { id: 3, number: "03", title: "Resultados & Links", subtitle: "Leads captados, CPL y enlaces", icon: TrendingUp },
];

export default function CrmNewCompanyCampaignModal({
  isOpen,
  onClose,
  onCreateCampaign,
}) {
  const prefersReducedMotion = useReducedMotion();
  const [step, setStep] = useState(1);
  const [stepError, setStepError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    platform: "Meta Ads (Instagram & Facebook)",
    objective: "Captación de Clientes (WhatsApp)",
    allocatedBudget: "120000",
    spentAmount: "0",
    startDate: new Date().toISOString().slice(0, 10),
    endDate: "",
    leadsAcquired: "0",
    clicks: "0",
    impressions: "0",
    status: "activa",
    links: "",
    notes: "",
  });

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setStepError("");
    }
  }, [isOpen]);

  const spent = Number(formData.spentAmount) || 0;
  const budget = Number(formData.allocatedBudget) || 0;
  const leads = Number(formData.leadsAcquired) || 0;
  const cpl = leads > 0 ? Math.round(spent / leads) : 0;
  const burnPct = budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0;

  const validateCurrentStep = () => {
    if (step === 1) {
      if (!formData.name.trim()) {
        setStepError("Ingresá un nombre para identificar la campaña propia.");
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
      await onCreateCampaign({
        name: formData.name.trim(),
        platform: formData.platform,
        objective: formData.objective,
        allocatedBudget: budget,
        spentAmount: spent,
        startDate: formData.startDate,
        endDate: formData.endDate || "",
        leadsAcquired: leads,
        clicks: Number(formData.clicks) || 0,
        impressions: Number(formData.impressions) || 0,
        cpl,
        status: formData.status,
        links: formData.links.trim(),
        notes: formData.notes.trim(),
      });
      onClose();
    } catch (err) {
      console.error("Error al crear campaña propia:", err);
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

          {/* Panel Lateral de Altura Completa */}
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
                <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Megaphone className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm sm:text-base font-black text-white tracking-tight">
                      Nueva Campaña Propia (NEXO)
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
                          ? "bg-purple-500/15 border-purple-500/50 text-white"
                          : isDone
                          ? "bg-white/5 border-white/10 text-gray-200 hover:bg-white/8"
                          : "bg-[#141519]/60 border-white/5 text-gray-500"
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black flex-shrink-0 ${
                          isActive
                            ? "bg-purple-600 text-white"
                            : isDone
                            ? "bg-purple-500/25 text-purple-300"
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
                  className="h-full bg-purple-500 transition-all duration-300 ease-out"
                  style={{ width: `${(step / 3) * 100}%` }}
                />
              </div>
            </div>

            {stepError && (
              <div className="bg-red-500/15 border-b border-red-500/30 py-2.5 px-6 text-xs text-red-300 font-semibold">
                {stepError}
              </div>
            )}

            {/* Formulario por Etapas */}
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
                    <div>
                      <label className="block font-bold text-gray-300 mb-1.5">
                        Nombre de la Campaña <span className="text-purple-400">*</span>
                      </label>
                      <input
                        type="text"
                        autoFocus
                        placeholder="Ej: Captación Meta Ads - Dueños de Negocio Noviembre"
                        value={formData.name}
                        onChange={(e) => {
                          setFormData({ ...formData, name: e.target.value });
                          if (stepError) setStepError("");
                        }}
                        className="w-full bg-[#141519] border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block font-bold text-gray-300 mb-1.5">
                          Plataforma Publicitaria
                        </label>
                        <select
                          value={formData.platform}
                          onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                          className="w-full bg-[#141519] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-purple-500 transition-colors"
                        >
                          {PLATFORMS.map((p) => (
                            <option key={p} value={p}>
                              {p}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-gray-300 mb-1.5">
                          Objetivo de la Campaña
                        </label>
                        <select
                          value={formData.objective}
                          onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                          className="w-full bg-[#141519] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-purple-500 transition-colors"
                        >
                          {OBJECTIVES.map((obj) => (
                            <option key={obj} value={obj}>
                              {obj}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block font-bold text-gray-300 mb-1.5">
                          Fecha de Inicio
                        </label>
                        <input
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                          className="w-full bg-[#141519] border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-gray-300 mb-1.5">
                          Fecha de Fin
                        </label>
                        <input
                          type="date"
                          value={formData.endDate}
                          onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                          className="w-full bg-[#141519] border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-gray-300 mb-1.5">
                          Estado
                        </label>
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                          className="w-full bg-[#141519] border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-purple-500"
                        >
                          <option value="activa">Activa</option>
                          <option value="optimizacion">En Optimización</option>
                          <option value="pausada">Pausada</option>
                          <option value="finalizada">Finalizada</option>
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-[#141519] border border-white/10">
                        <label className="block font-bold text-gray-300 mb-1.5">
                          Presupuesto Asignado (ARS)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="1000"
                          autoFocus
                          value={formData.allocatedBudget}
                          onChange={(e) => setFormData({ ...formData, allocatedBudget: e.target.value })}
                          className="w-full bg-[#0d0f12] border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-purple-500"
                        />
                        <span className="text-[10px] text-gray-400 block mt-1.5">
                          Tope previsto para esta campaña
                        </span>
                      </div>

                      <div className="p-4 rounded-xl bg-[#141519] border border-purple-500/30">
                        <label className="block font-bold text-purple-300 mb-1.5">
                          Dinero Invertido Acumulado (ARS)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="1000"
                          value={formData.spentAmount}
                          onChange={(e) => setFormData({ ...formData, spentAmount: e.target.value })}
                          className="w-full bg-[#0d0f12] border border-white/10 rounded-xl px-3.5 py-2.5 text-[#22C55E] font-mono font-bold text-sm focus:outline-none focus:border-purple-500"
                        />
                        <span className="text-[10px] text-gray-400 block mt-1.5">
                          Gasto real consumido hasta hoy
                        </span>
                      </div>
                    </div>

                    {/* Indicador de consumo presupuestario */}
                    <div className="p-4 rounded-xl bg-[#141519] border border-white/8 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400 font-semibold">Ejecución del presupuesto:</span>
                        <span className="font-mono font-bold text-white">{burnPct}% consumido</span>
                      </div>
                      <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-500 transition-all duration-300"
                          style={{ width: `${burnPct}%` }}
                        />
                      </div>
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
                        <label className="block font-bold text-gray-300 mb-1.5">
                          Leads / Consultas Captadas
                        </label>
                        <input
                          type="number"
                          min="0"
                          autoFocus
                          value={formData.leadsAcquired}
                          onChange={(e) => setFormData({ ...formData, leadsAcquired: e.target.value })}
                          className="w-full bg-[#141519] border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-purple-500"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-gray-300 mb-1.5">
                          Clics en el Anuncio
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formData.clicks}
                          onChange={(e) => setFormData({ ...formData, clicks: e.target.value })}
                          className="w-full bg-[#141519] border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>

                    {/* Cálculo en vivo de CPL */}
                    <div className="p-3.5 rounded-xl bg-[#141519] border border-purple-500/30 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-white block">
                          Costo por Lead (CPL Calculado)
                        </span>
                        <span className="text-[10px] text-gray-400">
                          Inversión (${spent.toLocaleString("es-AR")}) ÷ Leads ({leads})
                        </span>
                      </div>
                      <span className="text-base font-mono font-black text-purple-300">
                        ${cpl.toLocaleString("es-AR")} ARS
                      </span>
                    </div>

                    <div>
                      <label className="block font-bold text-gray-300 mb-1.5">
                        Enlaces Relacionados (Anuncio, Creativo o Business Manager)
                      </label>
                      <input
                        type="text"
                        placeholder="https://..."
                        value={formData.links}
                        onChange={(e) => setFormData({ ...formData, links: e.target.value })}
                        className="w-full bg-[#141519] border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-300 mb-1.5">
                        Observaciones y Rendimiento
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Detalles sobre creativos ganadores, audiencias probadas o resultados..."
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="w-full bg-[#141519] border border-white/10 rounded-xl p-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none"
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
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black transition-[background-color,transform] duration-150 active:scale-97 cursor-pointer shadow-sm"
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
                    <span>{submitting ? "Guardando..." : "Registrar Campaña Propia"}</span>
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
