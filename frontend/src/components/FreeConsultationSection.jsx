import React from "react";
import { NEXO_CONFIG } from "../data/nexoData";
import { ArrowRight, Check } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

export default function FreeConsultationSection({ onOpenModal }) {
  const prefersReducedMotion = useReducedMotion();
  const info = NEXO_CONFIG.freeConsultation;

  return (
    <section
      id="asesoramiento"
      className="surface-consultation text-[#111111] py-6 sm:py-10 relative"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-2xl bg-white border border-black/[0.07] p-4 sm:p-7 lg:px-9 lg:py-7 shadow-[0_4px_24px_rgba(17,17,17,0.03)]"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 lg:gap-10">
            <div className="space-y-2.5 max-w-2xl">
              <h3 className="text-base sm:text-2xl font-extrabold text-[#111111] tracking-tight leading-snug">
                {info.title}
              </h3>

              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                {info.description}
              </p>

              <div className="pt-1 flex flex-wrap items-center gap-x-4 gap-y-2">
                {info.points.map((point, index) => (
                  <motion.div
                    key={index}
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-30px" }}
                    transition={{
                      duration: 0.35,
                      delay: index * 0.05,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs text-gray-600 font-semibold"
                  >
                    <span className="w-4 h-4 rounded-full bg-[#111111] text-[#BCE838] flex items-center justify-center flex-shrink-0">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </span>
                    <span>{point}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="flex-shrink-0">
              <motion.button
                whileHover={prefersReducedMotion ? {} : { y: -1 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.99 }}
                onClick={() => onOpenModal?.("Asesoramiento Gratuito General")}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#111111] hover:bg-[#1e2026] text-white font-bold px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl text-xs sm:text-sm tracking-wide transition-colors cursor-pointer group shadow-xs"
              >
                <span>{info.ctaText}</span>
                <ArrowRight className="w-4 h-4 text-[#BCE838] group-hover:translate-x-0.5 transition-transform" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        <div className="mt-8 sm:mt-12 h-px w-full max-w-4xl mx-auto bg-gradient-to-r from-transparent via-black/[0.06] to-transparent" />
      </div>
    </section>
  );
}
