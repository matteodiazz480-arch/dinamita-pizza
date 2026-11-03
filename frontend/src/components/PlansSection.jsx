import React, { useState } from "react";
import { NEXO_CONFIG } from "../data/nexoData";
import { ArrowRight, Check, Compass } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

function PlanCard({ plan, onOpenConsultationModal, prefersReducedMotion }) {
  const isFeatured = plan.highlighted;

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
      className={`rounded-3xl p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden h-full ${
        isFeatured
          ? "bg-[#111111] text-white shadow-xl border border-white/12"
          : "bg-white text-[#111111] border border-black/[0.07] shadow-[0_8px_24px_rgba(0,0,0,0.04)]"
      }`}
    >
      <div className="space-y-3.5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`font-display-condensed text-xl sm:text-2xl leading-none tracking-wider ${
                  isFeatured ? "text-[#22C55E]" : "text-black/30"
                }`}
              >
                {plan.code}
              </span>
              <h3
                className={`text-lg sm:text-xl font-black tracking-tight ${
                  isFeatured ? "text-white" : "text-[#111111]"
                }`}
              >
                {plan.name}
              </h3>
            </div>
            <p
              className={`text-xs font-bold mt-1 ${
                isFeatured ? "text-[#22C55E]" : "text-[#16A34A]"
              }`}
            >
              {plan.tagline}
            </p>
          </div>

          {isFeatured && (
            <span className="px-2.5 py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-[#16A34A] text-white flex-shrink-0 shadow-xs">
              Más elegido
            </span>
          )}
        </div>

        <p
          className={`text-xs sm:text-sm leading-relaxed ${
            isFeatured ? "text-gray-300" : "text-gray-600"
          }`}
        >
          {plan.description}
        </p>

        <div
          className={`py-2 px-3 rounded-xl border inline-flex items-center gap-2 ${
            isFeatured
              ? "bg-[#17181c] border-white/[0.08]"
              : "bg-[#F4F5F7] border-black/[0.05]"
          }`}
        >
          <span
            className={`text-xs font-extrabold ${
              isFeatured ? "text-[#22C55E]" : "text-[#111111]"
            }`}
          >
            {plan.priceInfo}
          </span>
          <span
            className={`text-[11px] ${
              isFeatured ? "text-gray-400" : "text-gray-500"
            }`}
          >
            · Ajustado a tus objetivos
          </span>
        </div>

        <div className="space-y-2 pt-1 border-t border-current/10">
          <ul className="space-y-1.5">
            {plan.includedServices.slice(0, 3).map((srv, idx) => (
              <li
                key={idx}
                className={`flex items-start gap-2 text-xs font-medium ${
                  isFeatured ? "text-gray-200" : "text-gray-700"
                }`}
              >
                <span
                  className={`w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    isFeatured
                      ? "bg-[#16A34A] text-white"
                      : "bg-[#16A34A]/10 text-[#16A34A]"
                  }`}
                >
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </span>
                <span className="leading-snug">{srv}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="pt-4 mt-4 border-t border-current/10">
        <button
          type="button"
          onClick={() => onOpenConsultationModal?.(plan.name)}
          className={`w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer group shadow-xs active:scale-[0.99] ${
            isFeatured
              ? "bg-[#16A34A] hover:bg-[#15803D] text-white"
              : "bg-[#111111] hover:bg-[#1e2026] text-white"
          }`}
        >
          <span>Consultar por este plan</span>
          <ArrowRight
            className="w-4 h-4 group-hover:translate-x-0.5 transition-transform text-white"
          />
        </button>
      </div>
    </motion.div>
  );
}

export default function PlansSection({ onOpenConsultationModal, onOpenPlanFinder }) {
  const prefersReducedMotion = useReducedMotion();
  const { title, subtitle, items } = NEXO_CONFIG.plans;
  const [selectedMobileIdx, setSelectedMobileIdx] = useState(1);

  const mobileTabLabels = ["Esencial", "Crecimiento", "Avanzado"];

  return (
    <section
      id="planes"
      className="py-12 sm:py-20 lg:py-24 surface-plans text-[#111111]"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#111111]">
              {title}
            </h2>
            <p className="mt-2 sm:mt-3 text-xs sm:text-base text-gray-600 font-medium">
              {subtitle}
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="lg:hidden"
        >
          <div
            role="tablist"
            aria-label="Planes de inversión"
            className="grid grid-cols-3 gap-1 bg-[#111111] p-1 rounded-xl max-w-sm mx-auto shadow-sm"
          >
            {items.map((plan, idx) => {
              const isSelected = selectedMobileIdx === idx;
              return (
                <button
                  key={plan.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setSelectedMobileIdx(idx)}
                  className={`py-2 px-2 rounded-lg text-[11px] font-extrabold transition-colors duration-150 cursor-pointer truncate ${
                    isSelected
                      ? "bg-[#16A34A] text-white shadow-xs"
                      : "text-gray-300 hover:text-white"
                  }`}
                >
                  {mobileTabLabels[idx] || plan.name}
                </button>
              );
            })}
          </div>

          <div className="mt-3">
            <AnimatePresence mode="wait">
              <PlanCard
                key={items[selectedMobileIdx].id}
                plan={items[selectedMobileIdx]}
                onOpenConsultationModal={onOpenConsultationModal}
                prefersReducedMotion={prefersReducedMotion}
              />
            </AnimatePresence>
          </div>
        </motion.div>

        <div className="hidden lg:grid lg:grid-cols-3 gap-5 sm:gap-6 items-stretch">
          {items.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{
                duration: 0.45,
                delay: index * 0.08,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="h-full"
            >
              <PlanCard
                plan={plan}
                onOpenConsultationModal={onOpenConsultationModal}
                prefersReducedMotion={prefersReducedMotion}
              />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.45, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
          className="mt-5 sm:mt-8 rounded-2xl bg-[#111111] text-white p-4 sm:px-7 sm:py-5 border border-white/10 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5"
        >
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#16A34A]/15 border border-[#16A34A]/30 flex items-center justify-center flex-shrink-0 text-[#22C55E]">
              <Compass className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-base font-extrabold text-white">
                ¿No sabés qué plan elegir para tu etapa actual?
              </h3>
              <p className="text-[11px] sm:text-sm text-gray-400 mt-0.5">
                {NEXO_CONFIG.planFinder.buttonSub}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onOpenPlanFinder?.()}
            className="w-full sm:w-auto flex-shrink-0 inline-flex items-center justify-center gap-2 bg-[#16A34A] hover:bg-[#15803D] text-white font-extrabold px-5 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm transition-colors cursor-pointer group shadow-sm"
          >
            <span>{NEXO_CONFIG.planFinder.buttonLabel}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}
