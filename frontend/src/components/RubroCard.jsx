import React from "react";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

export default function RubroCard({ card, image, index, onSelect }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.article
      initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration: 0.4,
        delay: index * 0.08,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="bg-white/95 backdrop-blur-xl border border-white/80 rounded-3xl p-4 sm:p-5 flex flex-col justify-between shadow-[0_8px_24px_-10px_rgba(0,0,0,0.05),0_2px_6px_rgba(0,0,0,0.02)] hover:shadow-[0_18px_36px_-10px_rgba(0,0,0,0.09)] hover:-translate-y-1 transition-all duration-300 group"
    >
      <div>
        {/* Imagen representativa limpia y proporcional (sin textos encima) */}
        <div className="relative w-full h-36 sm:h-44 md:h-48 rounded-2xl overflow-hidden bg-gray-100 border border-black/[0.05] mb-4">
          <img
            src={image}
            alt={card.headline}
            className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-500"
            loading="lazy"
            decoding="async"
          />
        </div>

        {/* Título y descripción sintetizada */}
        <h3 className="text-lg sm:text-xl font-black text-[#111111] tracking-tight leading-snug">
          {card.headline}
        </h3>
        
        <p className="text-xs sm:text-sm text-gray-600 font-medium leading-relaxed mt-1.5">
          {card.desc}
        </p>

        {/* Chips de rubros representativos */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {card.tags.slice(0, 4).map((tag, tIdx) => (
            <span
              key={tIdx}
              className="inline-flex items-center text-[10px] sm:text-[11px] font-semibold bg-black/[0.04] border border-black/[0.05] text-gray-700 px-2 py-0.5 rounded-md"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Botón de acción */}
      <div className="pt-4 mt-3 border-t border-black/[0.05]">
        <button
          type="button"
          onClick={() => onSelect(card.serviceName)}
          className="w-full inline-flex items-center justify-center gap-2 bg-[#111111] hover:bg-[#202227] text-white font-extrabold py-2.5 sm:py-3 px-4 rounded-xl text-xs sm:text-sm tracking-wide transition-colors cursor-pointer group/btn shadow-xs active:scale-[0.99]"
        >
          <span>{card.ctaText}</span>
          <ArrowRight className="w-4 h-4 text-white group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>
    </motion.article>
  );
}
