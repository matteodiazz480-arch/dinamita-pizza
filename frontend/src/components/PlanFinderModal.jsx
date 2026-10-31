import React, { useState, useEffect } from "react";
import { NEXO_CONFIG } from "../data/nexoData";
import { X, ArrowRight, RotateCcw, Check, Compass } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { playSound } from "../utils/sound";

export default function PlanFinderModal({
  isOpen,
  onClose,
  onSelectPlanForConsultation,
}) {
  const prefersReducedMotion = useReducedMotion();
  const questions = NEXO_CONFIG.planFinder.questions;
  const plans = NEXO_CONFIG.plans.items;

  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [recommendedPlan, setRecommendedPlan] = useState(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
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
  };

  const handleClose = () => {
    playSound("close", false);
    handleReset();
    onClose();
  };

  const handleRequestPlan = (planName) => {
    handleReset();
    onClose();
    onSelectPlanForConsultation?.(planName);
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
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="plan-finder-title"
            className="relative w-full max-w-xl bg-[#141519] border border-white/10 rounded-2xl p-5 sm:p-8 text-white shadow-2xl z-10 my-auto overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#BCE838]/60 to-transparent" />

            <button
              type="button"
              onClick={handleClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Cerrar recomendador de planes"
            >
              <X className="w-4 h-4" />
            </button>

            {recommendedPlan ? (
              <div className="space-y-5">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#BCE838]">
                  <Compass className="w-4 h-4" />
                  <span>Resultado para tu negocio</span>
                </div>

                <div>
                  <h3
                    id="plan-finder-title"
                    className="text-2xl sm:text-3xl font-black text-white tracking-tight"
                  >
                    {recommendedPlan.name}
                  </h3>
                  <p className="text-xs sm:text-sm font-semibold text-[#BCE838] mt-1">
                    {recommendedPlan.tagline}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-300 mt-2 leading-relaxed">
                    {recommendedPlan.description}
                  </p>
                </div>

                <div className="rounded-xl bg-[#0d0f12] border border-white/10 p-4 sm:p-5 space-y-3">
                  <div className="flex items-center justify-between border-b border-white/[0.07] pb-2.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                      Qué incluye este plan
                    </span>
                    <span className="text-xs font-extrabold text-white">
                      {recommendedPlan.priceInfo}
                    </span>
                  </div>

                  <ul className="space-y-2">
                    {recommendedPlan.includedServices.map((srv, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-200"
                      >
                        <span className="w-4 h-4 rounded-full bg-[#BCE838] text-[#111111] flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </span>
                        <span>{srv}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-1 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleRequestPlan(recommendedPlan.name)}
                    className="w-full sm:flex-1 bg-[#BCE838] hover:bg-[#add92b] text-[#111111] font-extrabold py-3.5 px-5 rounded-xl text-xs sm:text-sm inline-flex items-center justify-center gap-2 transition-colors cursor-pointer group"
                  >
                    <span>Solicitar cotización de este plan</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </button>

                  <button
                    type="button"
                    onClick={handleReset}
                    className="w-full sm:w-auto bg-white/[0.05] hover:bg-white/[0.1] text-gray-300 hover:text-white border border-white/10 font-bold py-3.5 px-4 rounded-xl text-xs sm:text-sm inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Volver a responder</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="pr-8">
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                    <span className="text-[#BCE838]">Encontrá tu plan</span>
                    <span>
                      Paso 0{stepIndex + 1} / 0{questions.length}
                    </span>
                  </div>

                  <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mb-4">
                    <div
                      className="h-full bg-[#BCE838] transition-all duration-300"
                      style={{
                        width: `${((stepIndex + 1) / questions.length) * 100}%`,
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
                      className="w-full text-left rounded-xl bg-[#0d0f12] hover:bg-[#1a1c22] border border-white/10 hover:border-[#BCE838]/50 p-4 transition-all flex items-center justify-between gap-3 group cursor-pointer"
                    >
                      <span className="text-xs sm:text-sm font-semibold text-gray-200 group-hover:text-white leading-snug">
                        {opt.label}
                      </span>
                      <span className="w-7 h-7 rounded-lg bg-white/5 group-hover:bg-[#BCE838] text-gray-400 group-hover:text-[#111111] flex items-center justify-center flex-shrink-0 transition-colors">
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
