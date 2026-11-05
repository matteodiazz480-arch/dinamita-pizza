import React, { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X, Check } from "lucide-react";

const INCOME_CATEGORIES = [
  "Honorarios Mensuales",
  "Campaña Publicitaria",
  "Desarrollo Web / Landing",
  "Diseño & Branding",
  "Consultoría / Diagnóstico",
  "Otro Ingreso",
];

function getTodayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function CrmNewIncomeModal({ isOpen, onClose, onCreateIncome }) {
  const prefersReducedMotion = useReducedMotion();
  const [formData, setFormData] = useState(() => ({
    date: getTodayIso(),
    category: "Honorarios Mensuales",
    amount: "",
    clientName: "",
    description: "",
  }));
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const amt = Number(formData.amount);
    if (!amt || amt <= 0 || submitting) return;
    setSubmitting(true);
    await onCreateIncome({
      ...formData,
      amount: amt,
      clientName: formData.clientName.trim(),
      description:
        formData.description.trim() ||
        (formData.clientName.trim()
          ? `${formData.category} — ${formData.clientName.trim()}`
          : formData.category),
    });
    setSubmitting(false);
    setFormData((prev) => ({ ...prev, amount: "", clientName: "", description: "" }));
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
            className="relative z-10 w-full max-w-md h-dvh bg-[#0d0f12] border-l border-white/10 shadow-2xl flex flex-col text-white overflow-hidden"
          >
            {/* Cabecera limpia sin iconos decorativos */}
            <div className="px-5 sm:px-6 py-4 bg-[#141519] border-b border-white/8 flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Registrar Ganancia / Ingreso
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 text-xs flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div>
                  <label className="block font-semibold text-gray-300 mb-1.5">
                    Monto Cobrado (ARS) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#22C55E] font-mono font-bold text-sm">
                      $
                    </span>
                    <input
                      type="number"
                      min="1"
                      step="500"
                      required
                      autoFocus
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="180000"
                      className="w-full bg-[#141519] border border-white/10 rounded-lg pl-8 pr-4 py-2.5 text-white font-mono text-base sm:text-sm tabular-nums focus:outline-none focus:border-[#16A34A]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-gray-300 mb-1.5">
                    Concepto / Categoría
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-[#141519] border border-white/10 rounded-lg px-3.5 py-2.5 text-base sm:text-xs text-white focus:outline-none focus:border-[#16A34A]"
                  >
                    {INCOME_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-300 mb-1.5">
                    Cliente o Negocio (Opcional)
                  </label>
                  <input
                    type="text"
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    placeholder="Ej. Estética Lumina, Inmobiliaria Del Sur..."
                    className="w-full bg-[#141519] border border-white/10 rounded-lg px-3.5 py-2.5 text-base sm:text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#16A34A]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-300 mb-1.5">
                    Fecha del Cobro
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-[#141519] border border-white/10 rounded-lg px-3.5 py-2.5 text-base sm:text-xs text-white focus:outline-none focus:border-[#16A34A]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-300 mb-1.5">
                    Nota o Detalle
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Ej. Abono mensual + optimización de anuncios"
                    className="w-full bg-[#141519] border border-white/10 rounded-lg px-3.5 py-2.5 text-base sm:text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#16A34A]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-5 mt-6 border-t border-white/8">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white font-semibold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-[#16A34A] hover:bg-[#15803D] text-white font-bold transition-[background-color,transform] duration-150 active:scale-97 cursor-pointer"
                >
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>{submitting ? "Guardando..." : "Guardar Ganancia"}</span>
                </button>
              </div>
            </form>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
