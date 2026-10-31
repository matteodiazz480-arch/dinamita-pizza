import React from "react";
import { NEXO_CONFIG } from "../data/nexoData";
import { Megaphone, Palette, BarChart3, ArrowUpRight } from "lucide-react";
import { InstagramIcon } from "./Icons";
import { motion, useReducedMotion } from "framer-motion";
import socialShowcaseImg from "../assets/nexo-social-showcase.jpg";

export default function ServicesSection({ onOpenConsultationModal }) {
  const prefersReducedMotion = useReducedMotion();

  const getServiceIcon = (iconName) => {
    switch (iconName) {
      case "Megaphone":
        return <Megaphone className="w-4 h-4 sm:w-5 sm:h-5 text-[#111111]" />;
      case "Instagram":
        return <InstagramIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />;
      case "Palette":
        return <Palette className="w-4 h-4 sm:w-5 sm:h-5 text-[#111111]" />;
      case "BarChart3":
        return <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />;
      default:
        return <Megaphone className="w-4 h-4 sm:w-5 sm:h-5 text-[#111111]" />;
    }
  };

  return (
    <section
      id="servicios"
      className="surface-services text-[#111111] py-9 sm:py-16 relative overflow-hidden"
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
              {NEXO_CONFIG.services.title}{" "}
              <span className="font-editorial-serif italic font-normal text-[#9333EA]">
                a medida
              </span>
            </h2>
          </div>
          <p className="text-xs sm:text-sm lg:text-base text-gray-600 font-medium lg:max-w-md lg:text-right leading-relaxed">
            {NEXO_CONFIG.services.subtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 lg:gap-8 items-center">
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.45, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-4 w-full order-2 lg:order-1"
          >
            <img
              src={socialShowcaseImg}
              alt="Diseño de contenido y gestión de redes sociales para marcas"
              className="w-full aspect-[4/3] sm:aspect-[5/4] lg:aspect-[4/5] rounded-2xl object-cover object-center block"
              loading="lazy"
              decoding="async"
            />
          </motion.div>

          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-5 order-1 lg:order-2">
            {NEXO_CONFIG.services.items.map((service, index) => {
              const isDark = service.theme === "dark";
              return (
                <motion.button
                  type="button"
                  key={service.id}
                  onClick={() => onOpenConsultationModal?.(service.title)}
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{
                    duration: 0.4,
                    delay: index * 0.06,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  whileHover={prefersReducedMotion ? {} : { y: -2 }}
                  className={`w-full text-left rounded-2xl p-4 sm:p-6 flex flex-col justify-between transition-shadow group cursor-pointer relative overflow-hidden ${
                    isDark
                      ? "bg-[#111111] text-white shadow-md hover:shadow-lg border border-white/5"
                      : "bg-[#F4F5F7]/90 text-[#111111] border border-black/[0.06] shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${
                        service.badgeTheme === "lime"
                          ? "bg-[#BCE838] text-[#111111]"
                          : "bg-[#9333EA] text-white"
                      }`}
                    >
                      {getServiceIcon(service.icon)}
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`font-display-condensed text-xl sm:text-2xl leading-none tracking-wider ${
                          isDark ? "text-white/25" : "text-black/20"
                        }`}
                      >
                        {service.number}
                      </span>
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center opacity-70 group-hover:opacity-100 transition-opacity ${
                          isDark
                            ? "bg-white/10 text-white"
                            : "bg-black/5 text-[#111111]"
                        }`}
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>

                  <div className="pt-3.5 sm:pt-5 space-y-1.5">
                    <p
                      className={`text-[11px] font-bold leading-snug ${
                        isDark ? "text-[#BCE838]" : "text-[#9333EA]"
                      }`}
                    >
                      {service.problemSolved}
                    </p>

                    <h3
                      className={`text-sm sm:text-lg font-extrabold tracking-tight leading-snug ${
                        isDark ? "text-white" : "text-[#111111]"
                      }`}
                    >
                      {service.title}
                    </h3>

                    <p
                      className={`text-xs sm:text-sm leading-relaxed ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {service.description}
                    </p>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        <div className="mt-10 sm:mt-14 h-px w-full max-w-4xl mx-auto bg-gradient-to-r from-transparent via-black/[0.06] to-transparent" />
      </div>
    </section>
  );
}
