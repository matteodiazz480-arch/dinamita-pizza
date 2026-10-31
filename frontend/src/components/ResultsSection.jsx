import React from "react";
import { NEXO_CONFIG } from "../data/nexoData";
import { motion, useReducedMotion } from "framer-motion";
import campaignBillboardImg from "../assets/nexo-campaign-billboard.jpg";

export default function ResultsSection() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      id="resultados"
      className="surface-results text-[#111111] py-9 sm:py-14 relative overflow-hidden"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col lg:flex-row lg:items-end justify-between gap-3 sm:gap-4 mb-6 sm:mb-10 border-b border-black/[0.07] pb-4 sm:pb-5"
        >
          <div>
            <h2 className="text-2xl sm:text-4xl lg:text-[2.6rem] font-black text-[#111111] tracking-tight leading-tight">
              {NEXO_CONFIG.results.title}{" "}
              <span className="font-editorial-serif italic font-normal text-[#9333EA]">
                en cada campaña
              </span>
            </h2>
          </div>
          <p className="text-xs sm:text-sm lg:text-base text-gray-600 font-medium lg:max-w-md lg:text-right leading-relaxed">
            {NEXO_CONFIG.results.subtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 lg:gap-8 items-center">
          <div className="lg:col-span-8 grid grid-cols-2 gap-3 sm:gap-5">
            {NEXO_CONFIG.results.stats.map((stat, idx) => (
              <motion.div
                key={idx}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  duration: 0.45,
                  delay: idx * 0.08,
                  ease: [0.16, 1, 0.3, 1],
                }}
                whileHover={prefersReducedMotion ? {} : { y: -2 }}
                className="bg-[#111111] text-white rounded-2xl p-4 sm:p-7 flex flex-col justify-between shadow-md border border-white/5 relative overflow-hidden transition-shadow min-h-[180px] sm:min-h-[240px]"
              >
                <div>
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] sm:text-xs font-black tracking-wider ${
                      stat.tagType === "purple"
                        ? "bg-[#9333EA] text-white"
                        : "bg-[#BCE838] text-[#111111]"
                    }`}
                  >
                    {stat.tag}
                  </span>

                  <h3 className="text-[11px] sm:text-sm font-extrabold text-white tracking-wide uppercase mt-2.5 sm:mt-3.5 leading-snug">
                    {stat.title}
                  </h3>
                </div>

                <div className="my-3.5 sm:my-6">
                  <span className="text-3xl sm:text-5xl font-black text-[#BCE838] tracking-tight block tabular-nums">
                    {stat.metric}
                  </span>
                </div>

                <div className="text-[11px] sm:text-xs text-gray-400 font-medium border-t border-white/10 pt-2.5 leading-snug">
                  {stat.footer}
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-4 w-full"
          >
            <img
              src={campaignBillboardImg}
              alt="Posicionamiento y alcance de marca NEXO Creative"
              className="w-full aspect-[4/3] sm:aspect-[16/10] lg:aspect-[4/5] rounded-2xl object-cover object-[center_50%] block"
              loading="lazy"
              decoding="async"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
