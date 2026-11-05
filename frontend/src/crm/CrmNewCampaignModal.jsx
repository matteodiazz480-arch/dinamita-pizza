import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  X,
  Megaphone,
  Trash2,
  Check,
  DollarSign,
  Target,
  ListChecks,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

const PLATFORMS = [
  "Meta Ads (Instagram & Facebook)",
  "Instagram Ads",
  "Facebook Ads",
  "Google Ads (Búsqueda & Maps)",
  "TikTok Ads",
  "LinkedIn Ads",
  "Email Marketing",
  "Otra",
];

const OBJECTIVES = [
  "Consultas directas a WhatsApp",
  "Generación de Clientes Potenciales (Formularios)",
  "Ventas en Tienda Online",
  "Tráfico Web Local",
  "Reconocimiento de Marca",
];

const STEPS = [
  { id: 1, number: "01", title: "Cliente & Canal", subtitle: "Cliente asignado, plataforma y objetivo", icon: Target },
  { id: 2, number: "02", title: "Finanzas", subtitle: "Separación de pauta, honorarios y ganancia", icon: DollarSign },
  { id: 3, number: "03", title: "Entregables", subtitle: "Tareas del equipo y observaciones", icon: ListChecks },
];

export default function CrmNewCampaignModal({
  isOpen,
  onClose,
  onCreateCampaign,
  customerProfiles = [],
  clients = [],
}) {
  const prefersReducedMotion = useReducedMotion();
  const [step, setStep] = useState(1);
  const [stepError, setStepError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    clientName: "",
    title: "",
    platform: "Meta Ads (Instagram & Facebook)",
    objective: "Consultas directas a WhatsApp",
    clientBudget: "250000",
    adSpend: "150000",
    agencyFee: "100000",
    extraExpenses: "0",
    clientPaysAdDirect: true,
    startDate: new Date().toISOString().slice(0, 10),
    endDate: "",
    status: "activa",
    results: "",
    strategy: "",
    notes: "",
  });

  const [deliverables, setDeliverables] = useState([
    { text: "Diseño de creativos y videos", completed: false },
    { text: "Configuración de segmentación y públicos", completed: false },
    { text: "Redacción de copies y llamados a la acción", completed: false },
    { text: "Lanzamiento de campaña y optimización", completed: false },
  ]);

  const [newTaskText, setNewTaskText] = useState("");

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setStepError("");
    }
  }, [isOpen]);

  // Cálculos dinámicos
  const adSpend = Number(formData.adSpend) || 0;
  const agencyFee = Number(formData.agencyFee) || 0;
  const extraExpenses = Number(formData.extraExpenses) || 0;
  const totalBilled = agencyFee + (formData.clientPaysAdDirect ? 0 : adSpend) + extraExpenses;
  const netProfit = Math.max(0, agencyFee - extraExpenses);

  const handleClientSelect = (e) => {
    const selectedName = e.target.value;
    const profile = customerProfiles.find(
      (p) => (p.businessName || p.fullName) === selectedName
    );

    if (profile) {
      const budget = Number(profile.adBudget) || 150000;
      const fee = Number(profile.planPrice) || 100000;
      setFormData((prev) => ({
        ...prev,
        clientName: selectedName,
        adSpend: String(budget),
        agencyFee: String(fee),
        clientBudget: String(budget + fee),
        strategy: profile.adStrategy || prev.strategy,
        title: `Campaña ${profile.businessName || profile.fullName} - ${new Date().toLocaleDateString("es-AR", { month: "short", year: "numeric" })}`,
      }));
      setStepError("");
    } else {
      setFormData((prev) => ({ ...prev, clientName: selectedName }));
    }
  };

  const handleAddTask = () => {
    if (!newTaskText.trim()) return;
    setDeliverables([...deliverables, { text: newTaskText.trim(), completed: false }]);
    setNewTaskText("");
  };

  const handleRemoveTask = (idx) => {
    setDeliverables(deliverables.filter((_, i) => i !== idx));
  };

  const validateCurrentStep = () => {
    if (step === 1) {
      if (!formData.title.trim()) {
        setStepError("Ingresá un nombre para identificar la campaña antes de continuar.");
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
      const res = await onCreateCampaign({
        ...formData,
        adSpend,
        agencyFee,
        extraExpenses,
        totalBilled,
        netProfit,
        budgetARS: adSpend,
        deliverables,
      });
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
                <div className="w-9 h-9 rounded-xl bg-[#16A34A]/15 border border-[#16A34A]/30 flex items-center justify-center text-[#22C55E]">
                  <Megaphone className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm sm:text-base font-black text-white tracking-tight">
                      Nueva Campaña de Cliente
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

            {/* Cuerpo por Etapas */}
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
                        Seleccionar de Fichas / Clientes Registrados
                      </label>
                      <select
                        onChange={handleClientSelect}
                        value={formData.clientName}
                        className="w-full bg-[#141519] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#16A34A] transition-colors cursor-pointer"
                      >
                        <option value="">-- Elegir cliente existente o escribir abajo --</option>
                        {customerProfiles.map((p) => {
                          const name = p.businessName || p.fullName;
                          return (
                            <option key={p.id || p.refId} value={name}>
                              {name} {p.planName ? `(${p.planName})` : ""}
                            </option>
                          );
                        })}
                        {clients.map((c) => (
                          <option key={c.id || c.refId} value={c.clientName}>
                            {c.clientName} (Cliente Activo)
                          </option>
                        ))}
                      </select>

                      <input
                        type="text"
                        placeholder="O escribí el nombre del cliente manualmente..."
                        value={formData.clientName}
                        onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                        className="w-full mt-2 bg-[#141519] border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#16A34A]"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-300 mb-1.5">
                        Nombre de la Campaña <span className="text-[#22C55E]">*</span>
                      </label>
                      <input
                        type="text"
                        autoFocus
                        placeholder="Ej: Lanzamiento Anuncios Meta - Mensajes WhatsApp"
                        value={formData.title}
                        onChange={(e) => {
                          setFormData({ ...formData, title: e.target.value });
                          if (stepError) setStepError("");
                        }}
                        className="w-full bg-[#141519] border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#16A34A]"
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
                          className="w-full bg-[#141519] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#16A34A]"
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
                          Objetivo Principal
                        </label>
                        <select
                          value={formData.objective}
                          onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                          className="w-full bg-[#141519] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#16A34A]"
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
                          Fecha Inicio
                        </label>
                        <input
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                          className="w-full bg-[#141519] border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#16A34A]"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-gray-300 mb-1.5">
                          Fecha Fin
                        </label>
                        <input
                          type="date"
                          value={formData.endDate}
                          onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                          className="w-full bg-[#141519] border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#16A34A]"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-gray-300 mb-1.5">
                          Estado
                        </label>
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                          className="w-full bg-[#141519] border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#16A34A]"
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
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                      <div className="p-3.5 rounded-xl bg-[#141519] border border-white/10">
                        <label className="block text-gray-300 font-bold mb-1.5">
                          1. Pauta Publicitaria (ARS)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="1000"
                          autoFocus
                          value={formData.adSpend}
                          onChange={(e) => setFormData({ ...formData, adSpend: e.target.value })}
                          className="w-full bg-[#0d0f12] border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-[#16A34A]"
                        />
                        <span className="text-[10px] text-gray-400 block mt-1.5">
                          Dinero invertido en anuncios
                        </span>
                      </div>

                      <div className="p-3.5 rounded-xl bg-[#141519] border border-[#16A34A]/30">
                        <label className="block text-[#22C55E] font-bold mb-1.5">
                          2. Honorarios NEXO (ARS)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="1000"
                          value={formData.agencyFee}
                          onChange={(e) => setFormData({ ...formData, agencyFee: e.target.value })}
                          className="w-full bg-[#0d0f12] border border-white/10 rounded-xl px-3 py-2 text-[#22C55E] font-mono font-bold text-sm focus:outline-none focus:border-[#16A34A]"
                        />
                        <span className="text-[10px] text-gray-400 block mt-1.5">
                          Cobrado por nuestro servicio
                        </span>
                      </div>

                      <div className="p-3.5 rounded-xl bg-[#141519] border border-white/10">
                        <label className="block text-amber-400 font-bold mb-1.5">
                          3. Gastos Extras (ARS)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="1000"
                          value={formData.extraExpenses}
                          onChange={(e) => setFormData({ ...formData, extraExpenses: e.target.value })}
                          className="w-full bg-[#0d0f12] border border-white/10 rounded-xl px-3 py-2 text-amber-400 font-mono text-sm focus:outline-none focus:border-[#16A34A]"
                        />
                        <span className="text-[10px] text-gray-400 block mt-1.5">
                          Costos adicionales asociados
                        </span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#141519] border border-white/8">
                      <label className="flex items-center gap-2.5 cursor-pointer text-gray-200 font-semibold">
                        <input
                          type="checkbox"
                          checked={formData.clientPaysAdDirect}
                          onChange={(e) => setFormData({ ...formData, clientPaysAdDirect: e.target.checked })}
                          className="rounded border-white/20 bg-[#0d0f12] text-[#16A34A] focus:ring-0"
                        />
                        <span>El cliente abona la pauta directamente con su tarjeta en Meta / Google</span>
                      </label>
                    </div>

                    {/* Tarjeta de Balance en Vivo */}
                    <div className="p-4 rounded-2xl bg-[#141519] border border-[#16A34A]/30 space-y-3">
                      <div className="flex items-center justify-between text-xs pb-2.5 border-b border-white/8">
                        <span className="text-gray-400 font-semibold">Importe Total Cobrado al Cliente:</span>
                        <span className="font-mono font-bold text-white text-sm">
                          ${totalBilled.toLocaleString("es-AR")} ARS
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-black text-white block">
                            Ganancia Neta de Nuestra Empresa
                          </span>
                          <span className="text-[10px] text-gray-400">
                            Honorarios (${agencyFee.toLocaleString("es-AR")}) − Extras (${extraExpenses.toLocaleString("es-AR")})
                          </span>
                        </div>
                        <span className="text-lg font-mono font-black text-[#22C55E]">
                          ${netProfit.toLocaleString("es-AR")} ARS
                        </span>
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
                    <div>
                      <label className="block font-bold text-gray-300 mb-2">
                        Checklist de Entregables y Tareas
                      </label>
                      <div className="space-y-2 mb-3 max-h-48 overflow-y-auto pr-1">
                        {deliverables.map((d, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#141519] border border-white/8"
                          >
                            <span className="text-white text-xs">{d.text}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveTask(idx)}
                              className="p-1 text-gray-400 hover:text-red-400 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Sumar tarea (ej: Configurar Pixel, subir creativos)..."
                          value={newTaskText}
                          onChange={(e) => setNewTaskText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddTask();
                            }
                          }}
                          className="flex-1 bg-[#141519] border border-white/10 rounded-xl px-3.5 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#16A34A]"
                        />
                        <button
                          type="button"
                          onClick={handleAddTask}
                          className="px-4 py-2 rounded-xl bg-white/8 hover:bg-white/12 text-white font-bold transition-colors cursor-pointer"
                        >
                          Agregar
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-gray-300 mb-1.5">
                        Observaciones, Resultados y Seguimiento
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Resultados obtenidos (CPL, conversiones), enlaces a carpeta de anuncios o notas..."
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="w-full bg-[#141519] border border-white/10 rounded-xl p-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#16A34A] resize-none"
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
                    <span>{submitting ? "Guardando..." : "Guardar Campaña"}</span>
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
