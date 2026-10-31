import React, { useState } from "react";
import { NEXO_CONFIG } from "../data/nexoData";
import { Check, ArrowRight, Compass } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

function PlanCard({ plan, onOpenConsultationModal, prefersReducedMotion }) {
  const isFeatured = plan.featured;

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={prefersReducedMotion ? undefined : { opacity: 0, y: -8 }}
      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
      className={`rounded-2xl p-4 sm:p-6 flex flex-col justify-between relative overflow-hidden transition-shadow h-full ${
        isFeatured
          ? "bg-[#111111] text-white shadow-lg border border-white/10"
          : "bg-white text-[#111111] border border-black/[0.07] shadow-[0_4px_20px_rgba(0,0,0,0.03)]"
      }`}
    >
      <div className="space-y-3 sm:space-y-3.5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`font-display-condensed text-xl sm:text-2xl leading-none tracking-wider ${
                  isFeatured ? "text-[#BCE838]" : "text-black/25"
                }`}
              >
                {plan.code}
              </span>
              <h3
                className={`text-base sm:text-xl font-black tracking-tight ${
                  isFeatured ? "text-white" : "text-[#111111]"
                }`}
              >
                {plan.name}
              </h3>
            </div>
            <p
              className={`text-[11px] sm:text-xs font-bold mt-0.5 ${
                isFeatured ? "text-[#BCE838]" : "text-[#9333EA]"
              }`}
            >
              {plan.tagline}
            </p>
          </div>

          {isFeatured && (
            <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-[#BCE838] text-[#111111] flex-shrink-0">
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
          className={`py-2.5 px-3.5 rounded-xl border flex flex-wrap items-baseline justify-between gap-1 ${
            isFeatured
              ? "bg-[#17181c] border-white/[0.08]"
              : "bg-[#F4F5F7] border-black/[0.05]"
          }`}
        >
          <span
            className={`text-xs sm:text-sm font-extrabold ${
              isFeatured ? "text-white" : "text-[#111111]"
            }`}
          >
            {plan.priceInfo}
          </span>
          <span
            className={`text-[11px] ${
              isFeatured ? "text-gray-400" : "text-gray-500"
            }`}
          >
            {plan.priceDetail}
          </span>
        </div>

        <div className="space-y-1.5 pt-0.5">
          <span
            className={`block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider ${
              isFeatured ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Servicios incluidos:
          </span>
          <ul className="space-y-1.5">
            {plan.includedServices.map((srv, idx) => (
              <li
                key={idx}
                className={`flex items-start gap-2 text-xs ${
                  isFeatured ? "text-gray-200" : "text-gray-700"
                }`}
              >
                <span
                  className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    isFeatured
                      ? "bg-[#BCE838]/20 text-[#BCE838]"
                      : "bg-[#111111] text-[#BCE838]"
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
          className={`w-full py-2.5 sm:py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer group ${
            isFeatured
              ? "bg-[#BCE838] hover:bg-[#add92b] text-[#111111]"
              : "bg-[#111111] hover:bg-[#1e2026] text-white"
          }`}
        >
          <span>Consultar por este plan</span>
          <ArrowRight
            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-0.5 transition-transform ${
              isFeatured ? "text-[#111111]" : "text-[#BCE838]"
            }`}
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

  const mobileTabLabels = ["01 Presencia", "02 Meta Ads ★", "03 Integral"];

  return (
    <section
      id="planes"
      className="surface-plans text-[#111111] py-9 sm:py-16 relative overflow-hidden"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col lg:flex-row lg:items-end justify-between gap-3 sm:gap-4 mb-5 sm:mb-10 border-b border-black/[0.07] pb-4 sm:pb-5"
        >
          <div>
            <h2 className="text-2xl sm:text-4xl lg:text-[2.6rem] font-black text-[#111111] tracking-tight leading-tight">
              {title}{" "}
              <span className="font-editorial-serif italic font-normal text-[#111111]/75">
                de trabajo
              </span>
            </h2>
          </div>
          <p className="text-xs sm:text-sm lg:text-base text-gray-600 font-medium lg:max-w-md lg:text-right leading-relaxed">
            {subtitle}
          </p>
        </motion.div>

        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="lg:hidden mb-4"
        >
          <div
            role="tablist"
            aria-label="Seleccionar plan"
            className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-[#111111] text-white"
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
                  className={`py-2 px-2 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer truncate ${
                    isSelected
                      ? "bg-[#BCE838] text-[#111111] shadow-xs"
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
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#BCE838]/15 border border-[#BCE838]/30 flex items-center justify-center flex-shrink-0 text-[#BCE838]">
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
            className="w-full sm:w-auto flex-shrink-0 inline-flex items-center justify-center gap-2 bg-[#BCE838] hover:bg-[#add92b] text-[#111111] font-extrabold px-5 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm transition-colors cursor-pointer group"
          >
            <span>{NEXO_CONFIG.planFinder.buttonLabel}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </motion.div>

        <div className="mt-10 sm:mt-14 h-px w-full max-w-4xl mx-auto bg-gradient-to-r from-transparent via-black/[0.06] to-transparent" />
      </div>
    </section>
  );
}
