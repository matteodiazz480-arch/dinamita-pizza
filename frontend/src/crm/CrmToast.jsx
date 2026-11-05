import React, { useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CrmToast({ toast, onDismiss }) {
  useEffect(() => {
    if (!toast) return;
    const duration = toast.duration || 3500;
    const timer = setTimeout(() => {
      onDismiss();
    }, duration);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  return (
    <div className="fixed z-50 pointer-events-none bottom-20 md:bottom-6 inset-x-4 md:inset-x-auto md:right-6 flex justify-center md:justify-end">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 sm:p-4 rounded-2xl border shadow-2xl max-w-md w-full backdrop-blur-md select-none ${
              toast.type === "error"
                ? "bg-[#181214]/95 border-red-500/30 text-white"
                : toast.type === "info"
                ? "bg-[#101522]/95 border-blue-500/30 text-white"
                : "bg-[#101913]/95 border-emerald-500/30 text-white"
            }`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {toast.type === "error" ? (
                <AlertCircle className="w-4 h-4 text-red-400" />
              ) : toast.type === "info" ? (
                <Info className="w-4 h-4 text-blue-400" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
              )}
            </div>

            <div className="flex-1 min-w-0 pr-1">
              <span className="text-xs font-black text-white block leading-tight">
                {toast.title}
              </span>
              {toast.message && (
                <span className="text-[11px] text-gray-300 block mt-0.5 leading-snug">
                  {toast.message}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={onDismiss}
              className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer flex-shrink-0"
              aria-label="Cerrar notificación"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
