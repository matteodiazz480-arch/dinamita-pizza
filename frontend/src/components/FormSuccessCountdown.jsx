import React, { useState, useEffect, useRef } from "react";
import { WhatsAppIcon } from "./Icons";
import { motion, useReducedMotion } from "framer-motion";
import { playSound } from "../utils/sound";

export default function FormSuccessCountdown({
  referenceId = "",
  title = "¡Formulario enviado con éxito!",
  subtitle = "Tus datos fueron registrados en nuestro CRM de forma segura.",
  whatsAppUrl = "",
  onClose,
  autoRedirectSeconds = 3,
}) {
  const prefersReducedMotion = useReducedMotion();
  const [countdown, setCountdown] = useState(autoRedirectSeconds);
  const [redirected, setRedirected] = useState(false);
  const [popupBlocked, setPopupBlocked] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    playSound("success", false);
  }, []);

  useEffect(() => {
    if (!whatsAppUrl || redirected) return;

    if (countdown > 0) {
      timerRef.current = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0 && !redirected) {
      setRedirected(true);
      try {
        const opened = window.open(whatsAppUrl, "_blank", "noopener,noreferrer");
        if (!opened || opened.closed || typeof opened.closed === "undefined") {
          setPopupBlocked(true);
        }
      } catch {
        setPopupBlocked(true);
      }
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [countdown, whatsAppUrl, redirected]);

  const handleManualOpenWhatsApp = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setRedirected(true);
    window.open(whatsAppUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="py-6 sm:py-8 text-center space-y-5">
      {/* Check Icon animado con SVG pathLength */}
      <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-[#16A34A]/15 border border-[#16A34A]/35 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-[#22C55E]"
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
              transition={{ duration: 0.5, ease: "easeOut" }}
              d="M20 6L9 17L4 12"
            />
          </svg>
        </div>
      </div>

      {/* Referencia y Textos */}
      <div className="space-y-1.5">
        {referenceId && (
          <span className="inline-block px-3 py-1 rounded-md bg-[#16A34A]/15 border border-[#16A34A]/30 text-[11px] font-mono font-bold text-[#22C55E]">
            {referenceId}
          </span>
        )}
        <h3 className="text-xl sm:text-2xl font-black text-white pt-1">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-gray-300 max-w-md mx-auto leading-relaxed">
          {subtitle}
        </p>
      </div>

      {/* Bloque de Cuenta Regresiva a WhatsApp */}
      <div className="bg-[#181a20] border border-white/10 rounded-2xl p-4 max-w-md mx-auto space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400 font-medium">
            {countdown > 0
              ? `Enviando a WhatsApp en ${countdown}...`
              : redirected
              ? "Redirigido a WhatsApp"
              : "Abriendo WhatsApp..."}
          </span>
          <span className="font-mono font-black text-base text-[#22C55E]">
            {countdown > 0 ? `${countdown}s` : "✓"}
          </span>
        </div>

        {/* Barra de progreso de cuenta regresiva */}
        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: "100%" }}
            animate={{ width: "0%" }}
            transition={{
              duration: autoRedirectSeconds,
              ease: "linear",
            }}
            className="h-full bg-[#22C55E]"
          />
        </div>

        {popupBlocked && (
          <p className="text-[11px] text-amber-300/90 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
            Tu navegador bloqueó la apertura automática. Hacé clic en el botón verde abajo para abrir WhatsApp.
          </p>
        )}
      </div>

      {/* Botones de acción */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
        <button
          type="button"
          onClick={handleManualOpenWhatsApp}
          className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.98] text-white font-extrabold rounded-xl text-xs sm:text-sm transition-all shadow-md cursor-pointer"
        >
          <WhatsAppIcon className="w-4 h-4 fill-white" />
          <span>Abrir WhatsApp ahora</span>
        </button>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-3 bg-white/[0.06] hover:bg-white/[0.12] active:scale-[0.98] text-white border border-white/10 font-bold rounded-xl text-xs sm:text-sm transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        )}
      </div>
    </div>
  );
}
