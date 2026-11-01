import React from "react";
import { NEXO_CONFIG } from "../data/nexoData";
import { Zap, Users, BarChart3, Star, ArrowRight, Compass } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import RotatingText from "./RotatingText";
import heroGrowthImg from "../assets/hero-growth.jpg";

export default function Hero({ onOpenConsultationModal, onOpenPlanFinder }) {
  const prefersReducedMotion = useReducedMotion();

  const getIcon = (name) => {
    switch (name) {
      case "Zap":
        return <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#BCE838] fill-[#BCE838]" />;
      case "Users":
        return <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#BCE838]" />;
      case "BarChart3":
        return <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#BCE838]" />;
      case "Star":
        return <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#BCE838] fill-[#BCE838]" />;
      default:
        return <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#BCE838]" />;
    }
  };

  return (
    <section id="inicio" className="relative w-full bg-[#111111] text-white overflow-hidden">
      <div className="relative min-h-[78vh] sm:min-h-[84vh] lg:min-h-[90vh] w-full pt-20 sm:pt-28 lg:pt-32 pb-8 sm:pb-14 flex flex-col justify-between overflow-hidden">
        {/* Foto de fondo en el título, encuadrada de forma totalmente responsive para móvil y desktop */}
        <div className="absolute top-0 inset-x-0 h-[380px] sm:h-[460px] md:h-full z-0 overflow-hidden pointer-events-none">
          <img
            src={heroGrowthImg}
            alt="NEXO Creative — Estrategias y Crecimiento"
            className="w-full h-full object-cover object-[52%_14%] sm:object-[58%_16%] md:object-[66%_16%] lg:object-[68%_12%] scale-[1.01]"
            loading="eager"
            decoding="async"
          />
          {/* Overlays móvil: gradientes suaves que permiten ver claramente el casco amarillo, los rostros y la flecha verde, fusionando abajo */}
          <div className="md:hidden absolute inset-0 bg-gradient-to-b from-[#111111]/45 via-transparent to-[#111111]" />
          <div className="md:hidden absolute inset-0 bg-gradient-to-t from-[#111111] via-[#111111]/70 to-transparent" />

          {/* Overlays desktop: oscurecido progresivo a la izquierda para máxima legibilidad del texto */}
          <div className="hidden md:block absolute inset-0 bg-[#111111]/40" />
          <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-[#111111]/95 via-[#111111]/70 to-transparent" />
          <div className="hidden md:block absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-[#111111]/70" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full my-auto py-5 sm:py-10">
          <div className="max-w-2xl space-y-4 sm:space-y-6">
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]">
                <span className="block">{NEXO_CONFIG.hero.fixedHeadline}</span>
                <span className="flex items-baseline min-h-[1.22em] mt-1 text-[#BCE838] drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]">
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
                    mainClassName="text-[#BCE838] font-black tracking-tight"
                    splitLevelClassName="overflow-hidden pb-0.5"
                  />
                </span>
              </h1>
            </motion.div>

            <motion.p
              initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="text-xs sm:text-base lg:text-lg text-gray-200 font-medium max-w-lg leading-relaxed drop-shadow-sm"
            >
              {NEXO_CONFIG.hero.description}
            </motion.p>

            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
              className="pt-1 flex flex-wrap items-center gap-2.5 sm:gap-3"
            >
              <motion.button
                type="button"
                whileHover={prefersReducedMotion ? {} : { scale: 1.015 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.985 }}
                onClick={() =>
                  onOpenConsultationModal?.("Asesoramiento Gratuito General")
                }
                className="inline-flex items-center gap-2 bg-[#BCE838] hover:bg-[#add92b] text-[#111111] font-extrabold px-5 sm:px-7 py-3 sm:py-3.5 rounded-xl text-xs sm:text-sm tracking-wide transition-colors cursor-pointer group shadow-md"
              >
                <span>{NEXO_CONFIG.hero.ctaText}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </motion.button>

              <motion.button
                type="button"
                whileHover={prefersReducedMotion ? {} : { scale: 1.015 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.985 }}
                onClick={() => onOpenPlanFinder?.()}
                className="inline-flex items-center gap-2 bg-[#111111]/70 hover:bg-[#111111]/90 backdrop-blur-md text-white border border-white/15 px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer"
              >
                <Compass className="w-4 h-4 text-[#BCE838]" />
                <span>Encontrá tu plan</span>
              </motion.button>
            </motion.div>
          </div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full mt-4 sm:mt-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3.5">
            {NEXO_CONFIG.hero.pills.map((pill, index) => (
              <motion.div
                key={index}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  delay: 0.18 + 0.05 * index,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="bg-[#111111]/80 backdrop-blur-md border border-white/10 hover:border-[#BCE838]/30 px-3 py-2 sm:px-4 sm:py-3 rounded-xl text-white text-xs sm:text-sm font-semibold flex items-center gap-2 transition-colors"
              >
                <div className="flex-shrink-0">{getIcon(pill.icon)}</div>
                <span className="truncate">{pill.text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full h-20 sm:h-32 lg:h-40 section-dark-to-light pointer-events-none" />
    </section>
  );
}
