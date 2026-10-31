import React from "react";
import { NEXO_CONFIG } from "../data/nexoData";
import { Zap, Users, BarChart3, Star, ArrowRight, Compass } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import RotatingText from "./RotatingText";
import heroCreativeImg from "../assets/hero-creative.jpg";

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
      <div className="relative min-h-[78vh] sm:min-h-[84vh] lg:min-h-[90vh] w-full pt-24 sm:pt-32 pb-8 sm:pb-14 flex flex-col justify-between overflow-hidden">
        <div className="absolute inset-0 w-full h-full z-0 overflow-hidden pointer-events-none">
          <img
            src={heroCreativeImg}
            alt="NEXO Creative — Agencia de Marketing y Comunicación"
            className="w-full h-full object-cover object-[62%_center] sm:object-center scale-[1.01]"
            loading="eager"
            decoding="async"
          />
          <div className="absolute inset-0 bg-[#111111]/45" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#111111]/92 via-[#111111]/72 md:via-[#111111]/58 to-[#111111]/25" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-[#111111]/75" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full my-auto py-6 sm:py-10">
          <div className="max-w-2xl space-y-4 sm:space-y-6">
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1 className="text-[1.85rem] sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] text-white drop-shadow-xs">
                <span className="block">{NEXO_CONFIG.hero.fixedHeadline}</span>
                <span className="flex items-baseline min-h-[1.22em] mt-1 text-[#BCE838]">
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
              className="text-xs sm:text-base lg:text-lg text-gray-200 font-medium max-w-lg leading-relaxed"
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
