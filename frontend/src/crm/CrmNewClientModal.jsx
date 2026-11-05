import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X, Briefcase, Check, ArrowRight, ArrowLeft, DollarSign } from "lucide-react";

function getInitialDates() {
  const now = Date.now();
  return {
    startDate: new Date(now).toISOString().slice(0, 10),
    renewalDate: new Date(now + 30 * 86400000).toISOString().slice(0, 10),
  };
}

const STEPS = [
  { id: 1, number: "01", title: "Cliente & Servicio", subtitle: "Negocio, servicio contratado y estado", icon: Briefcase },
  { id: 2, number: "02", title: "Acuerdo & Fechas", subtitle: "Honorarios mensuales, pauta y renovación", icon: DollarSign },
];

export default function CrmNewClientModal({ isOpen, onClose, onCreateClient }) {
  const prefersReducedMotion = useReducedMotion();
  const [step, setStep] = useState(1);
  const [stepError, setStepError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState(() => {
    const dates = getInitialDates();
    return {
      clientName: "",
      service: "Publicidad Digital (Meta Ads)",
      responsible: "Mateo Díaz",
      startDate: dates.startDate,
      renewalDate: dates.renewalDate,
      feeARS: 190000,
      adBudget: 100000,
      status: "activo",
      contact: "",
      notes: "",
    };
  });

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setStepError("");
    }
  }, [isOpen]);

  const validateCurrentStep = () => {
    if (step === 1 && !formData.clientName.trim()) {
      setStepError("Ingresá el nombre del cliente o negocio.");
      return false;
    }
    setStepError("");
    return true;
  };

  const handleNextStep = () => {
    if (!validateCurrentStep()) return;
    if (step < 2) setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step < 2) {
      handleNextStep();
      return;
    }
    if (!validateCurrentStep() || submitting) return;

    setSubmitting(true);
    await onCreateClient({
      ...formData,
      feeARS: Number(formData.feeARS) || 0,
      adBudget: Number(formData.adBudget) || 0,
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
            className="relative z-10 w-full max-w-lg h-dvh bg-[#0d0f12] border-l border-white/12 shadow-2xl flex flex-col text-white overflow-hidden"
          >
            {/* Cabecera */}
            <div className="px-5 sm:px-7 py-4 bg-[#141519] border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#16A34A]/15 border border-[#16A34A]/30 flex items-center justify-center text-[#22C55E]">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm sm:text-base font-black text-white tracking-tight">
                      Nuevo Cliente Activo
                    </h2>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-gray-300">
                      Etapa {step} de 2
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
              <div className="grid grid-cols-2 gap-2">
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
                  style={{ width: `${(step / 2) * 100}%` }}
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
                    <div>
                      <label className="block font-bold text-gray-300 mb-1.5">
                        Cliente / Nombre del Negocio <span className="text-[#22C55E]">*</span>
                      </label>
                      <input
                        type="text"
                        autoFocus
                        value={formData.clientName}
                        onChange={(e) => {
                          setFormData({ ...formData, clientName: e.target.value });
                          if (stepError) setStepError("");
                        }}
                        placeholder="Ej. Clínica Dental San Lucas"
                        className="w-full bg-[#141519] border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#16A34A]"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-300 mb-1.5">
                        Servicio Contratado
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
                        <option value="Gestión de Redes Sociales">Gestión de Redes Sociales</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block font-bold text-gray-300 mb-1.5">
                          WhatsApp / Teléfono
                        </label>
                        <input
                          type="tel"
                          value={formData.contact}
                          onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                          placeholder="+54 9 11 ..."
                          className="w-full bg-[#141519] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#16A34A]"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-gray-300 mb-1.5">
                          Estado
                        </label>
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                          className="w-full bg-[#141519] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#16A34A]"
                        >
                          <option value="activo">Activo</option>
                          <option value="por_renovar">Por Renovar</option>
                          <option value="pausado">Pausado</option>
                          <option value="finalizado">Finalizado</option>
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="p-3.5 rounded-xl bg-[#141519] border border-[#16A34A]/30">
                        <label className="block font-bold text-[#22C55E] mb-1.5">
                          Honorarios Mensuales (ARS) *
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="5000"
                          autoFocus
                          value={formData.feeARS}
                          onChange={(e) => setFormData({ ...formData, feeARS: e.target.value })}
                          className="w-full bg-[#0d0f12] border border-white/10 rounded-xl px-3.5 py-2 text-[#22C55E] font-mono font-bold text-sm focus:outline-none focus:border-[#16A34A]"
                        />
                      </div>

                      <div className="p-3.5 rounded-xl bg-[#141519] border border-white/10">
                        <label className="block font-bold text-gray-300 mb-1.5">
                          Inversión Pauta (ARS)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="5000"
                          value={formData.adBudget}
                          onChange={(e) => setFormData({ ...formData, adBudget: e.target.value })}
                          className="w-full bg-[#0d0f12] border border-white/10 rounded-xl px-3.5 py-2 text-white font-mono text-sm focus:outline-none focus:border-[#16A34A]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block font-bold text-gray-300 mb-1.5">
                          Fecha de Inicio
                        </label>
                        <input
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                          className="w-full bg-[#141519] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#16A34A]"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-gray-300 mb-1.5">
                          Próxima Renovación / Cobro
                        </label>
                        <input
                          type="date"
                          value={formData.renewalDate}
                          onChange={(e) => setFormData({ ...formData, renewalDate: e.target.value })}
                          className="w-full bg-[#141519] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#16A34A]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-gray-300 mb-1.5">
                        Notas Operativas / Enlaces
                      </label>
                      <textarea
                        rows={3}
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Campañas activas, enlaces a Drive o carpetas compartidas..."
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
                    onClick={() => setStep(1)}
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

                {step < 2 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-black transition-[background-color,transform] duration-150 active:scale-97 cursor-pointer shadow-sm"
                  >
                    <span>Continuar a Etapa 2</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-black transition-[background-color,transform] duration-150 active:scale-97 cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    <span>{submitting ? "Guardando..." : "Guardar Cliente"}</span>
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
