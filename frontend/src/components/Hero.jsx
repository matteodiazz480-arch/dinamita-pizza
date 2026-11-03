import React from "react";
import { NEXO_CONFIG } from "../data/nexoData";
import { ArrowRight, Compass } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import RotatingText from "./RotatingText";
import heroGrowthWebp from "../assets/hero-growth.webp";
import heroGrowthMobileWebp from "../assets/hero-growth-mobile.webp";

export default function Hero({ onOpenConsultationModal, onOpenPlanFinder }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section id="inicio" className="relative w-full bg-[#111111] text-white overflow-hidden">
      <div className="relative md:min-h-[78vh] lg:min-h-[82vh] w-full pt-[205px] sm:pt-[260px] md:pt-28 lg:pt-32 pb-6 sm:pb-12 md:pb-16 flex flex-col justify-end md:justify-center overflow-hidden">
        {/* Fotografía encuadrada debajo del header móvil para que los protagonistas se vean completos */}
        <div className="absolute top-12 sm:top-14 md:top-0 inset-x-0 h-[255px] sm:h-[360px] md:h-full z-0 overflow-hidden pointer-events-none">
          <img
            src={heroGrowthWebp}
            srcSet={`${heroGrowthMobileWebp} 640w, ${heroGrowthWebp} 1024w`}
            sizes="(max-width: 640px) 100vw, 1024px"
            width={1024}
            height={764}
            alt="NEXO Creative — Estrategias y Crecimiento"
            className="w-full h-full object-cover object-[52%_0%] sm:object-[56%_8%] md:object-[66%_16%] lg:object-[68%_12%]"
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
          {/* Overlays móvil: despejado arriba para ver los rostros y fundido suave abajo para el texto */}
          <div className="md:hidden absolute inset-0 bg-[#111111]/25" />
          <div className="md:hidden absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t from-[#111111] via-[#111111]/85 to-transparent" />

          {/* Overlays desktop: oscurecido progresivo para máxima legibilidad del texto */}
          <div className="hidden md:block absolute inset-0 bg-[#111111]/40" />
          <div className="hidden md:block absolute inset-0 bg-[#111111]/60" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-2 sm:pt-6 md:py-12">
          <div className="max-w-2xl space-y-3 sm:space-y-5">
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
            >
              <h1 className="text-[1.75rem] sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]">
                <span className="block">{NEXO_CONFIG.hero.fixedHeadline}</span>
                <span className="flex items-baseline min-h-[1.2em] mt-0.5 sm:mt-1 text-[#22C55E] drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]">
                  <RotatingText
                    texts={NEXO_CONFIG.hero.rotatingWords}
                    effect="slide"
                    direction="up"
                    highlight={false}
                    rotationInterval={2500}
                    staggerDuration={0.025}
                    staggerFrom="last"
                    loop={true}
                    animatePresenceMode="wait"
                    mainClassName="text-[#22C55E] font-black tracking-tight"
                    splitLevelClassName="overflow-hidden pb-0.5"
                  />
                </span>
              </h1>
            </motion.div>

            <motion.p
              initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.06, ease: [0.23, 1, 0.32, 1] }}
              className="text-xs sm:text-base lg:text-lg text-gray-200 font-medium max-w-md sm:max-w-lg leading-relaxed drop-shadow-sm"
            >
              {NEXO_CONFIG.hero.description}
            </motion.p>

            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.12, ease: [0.23, 1, 0.32, 1] }}
              className="pt-1 sm:pt-2 flex flex-wrap items-center gap-2.5 sm:gap-4"
            >
              <motion.button
                whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
                onClick={() =>
                  onOpenConsultationModal?.("Asesoramiento Gratuito General")
                }
                className="inline-flex items-center justify-center gap-2 bg-[#16A34A] hover:bg-[#15803D] text-white font-extrabold px-4 sm:px-7 py-2.5 sm:py-4 rounded-xl text-xs sm:text-sm tracking-wide transition-colors duration-150 cursor-pointer shadow-sm group"
              >
                <span>{NEXO_CONFIG.hero.ctaText}</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-0.5 transition-transform" />
              </motion.button>

              <motion.button
                whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
                onClick={onOpenPlanFinder}
                className="inline-flex items-center justify-center gap-1.5 sm:gap-2 bg-white/10 hover:bg-white/15 text-white font-bold px-3.5 sm:px-6 py-2.5 sm:py-4 rounded-xl text-xs sm:text-sm transition-colors duration-150 cursor-pointer border border-white/15 backdrop-blur-sm"
              >
                <Compass className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#22C55E]" />
                <span>Encontrá tu plan</span>
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
