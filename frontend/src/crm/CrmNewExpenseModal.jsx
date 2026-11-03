import React, { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X, Receipt, ArrowRight } from "lucide-react";

const EXPENSE_CATEGORIES = [
  "Herramientas & Software",
  "Infraestructura & Servidores",
  "Diseño & Creatividad",
  "Publicidad Propia",
  "Freelancers & Equipo",
  "Impuestos & Bancarios",
  "Varios",
];

function getTodayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function CrmNewExpenseModal({ isOpen, onClose, onCreateExpense }) {
  const prefersReducedMotion = useReducedMotion();
  const [formData, setFormData] = useState(() => ({
    date: getTodayIso(),
    category: "Herramientas & Software",
    amount: "",
    description: "",
  }));
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const amt = Number(formData.amount);
    if (!amt || amt <= 0 || submitting) return;
    setSubmitting(true);
    await onCreateExpense({
      ...formData,
      amount: amt,
      description: formData.description.trim() || formData.category,
    });
    setSubmitting(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm select-none overflow-y-auto"
        >
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={prefersReducedMotion ? false : { opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#141519] border border-white/10 rounded-2xl w-full max-w-md p-5 sm:p-6 shadow-2xl relative text-white my-auto"
          >
        <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-white/8">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-black text-white">Registrar Gasto Operativo</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-bold text-gray-300 mb-1">Monto del Gasto (ARS) *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-mono font-bold">$</span>
              <input
                type="number"
                min="1"
                step="500"
                required
                autoFocus
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="45000"
                className="w-full bg-[#181a20] border border-white/10 rounded-xl pl-8 pr-4 py-2 text-white font-mono text-sm focus:outline-none focus:border-[#16A34A]"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-300 mb-1">Categoría</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full bg-[#181a20] border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-[#16A34A]"
            >
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-gray-300 mb-1">Fecha</label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full bg-[#181a20] border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-[#16A34A]"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-300 mb-1">Detalle / Proveedor</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Ej. Canva Pro, Servidor Vercel, Meta Ads saldo..."
              className="w-full bg-[#181a20] border border-white/10 rounded-xl px-3.5 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#16A34A]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white font-black transition-colors cursor-pointer"
            >
              <span>Guardar Gasto</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
