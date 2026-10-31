import React from "react";
import { NEXO_CONFIG } from "../data/nexoData";
import { Shield, Handshake, Clock, TrendingUp, ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import creativeDirectionImg from "../assets/nexo-creative-direction.jpg";

export default function AboutSection() {
  const prefersReducedMotion = useReducedMotion();

  const getIcon = (iconName, color) => {
    const isPurple = color === "purple";
    const iconClass = `w-4 h-4 sm:w-5 sm:h-5 ${isPurple ? "text-[#9333EA]" : "text-[#111111]"}`;

    switch (iconName) {
      case "Shield":
        return <Shield className={iconClass} />;
      case "Handshake":
        return <Handshake className={iconClass} />;
      case "Clock":
        return <Clock className={iconClass} />;
      case "TrendingUp":
        return <TrendingUp className={iconClass} />;
      default:
        return <Shield className={iconClass} />;
    }
  };

  return (
    <section
      id="nosotros"
      className="surface-about text-[#111111] pt-8 sm:pt-14 pb-10 sm:pb-16 relative overflow-hidden"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10 items-center">
          <div className="lg:col-span-8 space-y-5 sm:space-y-6">
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-2.5"
            >
              <h2 className="text-2xl sm:text-4xl lg:text-[2.65rem] font-black text-[#111111] leading-tight tracking-tight">
                Conectamos ideas.{" "}
                <span className="font-editorial-serif italic font-normal text-[#111111]/85 block sm:inline">
                  Impulsamos negocios.
                </span>
              </h2>
              <p className="text-xs sm:text-base text-gray-600 leading-relaxed max-w-2xl">
                {NEXO_CONFIG.about.description}
              </p>
            </motion.div>

            <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
              {NEXO_CONFIG.about.cards.map((card, index) => (
                <motion.div
                  key={index}
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{
                    duration: 0.4,
                    delay: index * 0.06,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="bg-white/90 backdrop-blur-xs rounded-2xl p-3.5 sm:p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-sm border border-black/[0.05] transition-shadow"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center ${
                        card.color === "purple"
                          ? "bg-[#9333EA]/[0.08]"
                          : "bg-gray-100/90"
                      }`}
                    >
                      {getIcon(card.icon, card.color)}
                    </div>
                    <span className="font-display-condensed text-base sm:text-lg text-black/15">
                      0{index + 1}
                    </span>
                  </div>

                  <h3 className="text-xs sm:text-base font-extrabold text-[#111111] mb-0.5 leading-snug">
                    {card.title}
                  </h3>

                  <p className="text-[11px] sm:text-xs text-gray-500 font-medium leading-snug">
                    {card.desc}
                  </p>
                </motion.div>
              ))}
            </div>

            <motion.a
              initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
              whileHover={prefersReducedMotion ? {} : { y: -2 }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.99 }}
              href="#servicios"
              className="group block bg-[#111111] hover:bg-[#1a1c22] text-white rounded-2xl p-4 sm:p-6 shadow-sm transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="text-sm sm:text-lg font-extrabold text-[#BCE838] transition-colors">
                    {NEXO_CONFIG.about.highlightCard.tag}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-300 font-medium">
                    {NEXO_CONFIG.about.highlightCard.sub}
                  </div>
                </div>

                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/10 group-hover:bg-[#BCE838] flex items-center justify-center flex-shrink-0 transition-colors">
                  <ArrowRight className="w-4 h-4 text-white group-hover:text-[#111111] group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            </motion.a>
          </div>

          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-4 w-full"
          >
            <img
              src={creativeDirectionImg}
              alt="Dirección creativa y producción visual NEXO Creative"
              className="w-full aspect-[4/3] sm:aspect-[16/10] lg:aspect-[3/4] rounded-2xl object-cover object-[center_64%] lg:object-[center_60%] block"
              loading="lazy"
            />
          </motion.div>
        </div>

        <div className="mt-10 sm:mt-14 h-px w-full max-w-4xl mx-auto bg-gradient-to-r from-transparent via-black/[0.06] to-transparent" />
      </div>
    </section>
  );
}
