import React from "react";
import { NEXO_CONFIG, getWhatsAppUrl } from "../data/nexoData";
import { ArrowRight } from "lucide-react";
import { WhatsAppIcon } from "./Icons";
import { motion, useReducedMotion } from "framer-motion";

export default function CtaContactSection({ onOpenConsultationModal }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      id="contacto"
      className="bg-gradient-to-b from-[#111111] to-[#0b0c0e] text-white relative overflow-hidden"
    >
      <div className="w-full h-20 sm:h-32 lg:h-40 section-light-to-dark pointer-events-none" />

      <div className="py-10 sm:py-16 lg:py-20 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.h2
            initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="text-2xl sm:text-5xl font-black text-white tracking-tight leading-tight max-w-3xl mx-auto"
          >
            {NEXO_CONFIG.cta.title}
          </motion.h2>

          <motion.p
            initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.45, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="text-xs sm:text-base lg:text-lg text-[#9CA3AF] font-normal max-w-xl mx-auto mt-3 sm:mt-4 leading-relaxed"
          >
            {NEXO_CONFIG.cta.description}
          </motion.p>

          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.45, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            <motion.button
              whileHover={prefersReducedMotion ? {} : { scale: 1.015 }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.985 }}
              onClick={() => onOpenConsultationModal?.("Asesoramiento Gratuito General")}
              className="inline-flex items-center justify-center gap-2 bg-[#BCE838] hover:bg-[#add92b] text-[#111111] font-extrabold px-5 sm:px-7 py-3 sm:py-4 rounded-xl text-xs sm:text-sm tracking-wide transition-colors cursor-pointer shadow-sm group"
            >
              <span>{NEXO_CONFIG.cta.buttonText}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </motion.button>

            <motion.a
              whileHover={prefersReducedMotion ? {} : { scale: 1.015 }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.985 }}
              href={getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/10 px-5 sm:px-6 py-3 sm:py-4 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer"
            >
              <WhatsAppIcon className="w-4 h-4 fill-[#BCE838]" />
              <span>WhatsApp directo</span>
            </motion.a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
