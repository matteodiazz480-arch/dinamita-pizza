import React from "react";
import { NEXO_CONFIG } from "../data/nexoData";
import { motion, useReducedMotion } from "framer-motion";
import RubroCard from "./RubroCard";
import nexoComerciosImg from "../assets/nexo-comercios.jpg";
import nexoOficiosImg from "../assets/nexo-oficios.jpg";
import nexoProfesionalesImg from "../assets/nexo-profesionales.jpg";

export default function RubrosSection({ onOpenConsultationModal }) {
  const prefersReducedMotion = useReducedMotion();
  const { rubros } = NEXO_CONFIG;

  const getImageForCard = (id) => {
    switch (id) {
      case "comercios":
        return nexoComerciosImg;
      case "oficios":
        return nexoOficiosImg;
      case "profesionales":
        return nexoProfesionalesImg;
      default:
        return nexoComerciosImg;
    }
  };

  return (
    <section
      id="rubros"
      className="surface-rubros text-[#111111] py-12 sm:py-16 lg:py-20 relative overflow-hidden"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Cabecera limpia sin textos adicionales sobre las imágenes */}
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col lg:flex-row lg:items-end justify-between gap-3 sm:gap-4 border-b border-black/[0.07] pb-4 sm:pb-5 mb-7 sm:mb-9"
        >
          <div>
            <h2 className="text-2xl sm:text-4xl lg:text-[2.6rem] font-black text-[#111111] tracking-tight leading-tight">
              Soluciones para{" "}
              <span className="font-editorial-serif italic font-normal text-[#9333EA]">
                tu negocio
              </span>
            </h2>
          </div>
          <p className="text-xs sm:text-sm lg:text-base text-gray-600 font-medium lg:max-w-md lg:text-right leading-relaxed">
            {rubros.subtitle}
          </p>
        </motion.div>

        {/* Cuadrícula uniforme y compacta de 3 tarjetas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 items-stretch">
          {rubros.cards.map((card, idx) => (
            <RubroCard
              key={card.id}
              card={card}
              image={getImageForCard(card.id)}
              index={idx}
              onSelect={onOpenConsultationModal}
            />
          ))}
        </div>
      </div>

      {/* Separador de sección sutil */}
      <div className="mt-12 sm:mt-16 h-px w-full max-w-4xl mx-auto bg-gradient-to-r from-transparent via-black/[0.06] to-transparent" />
    </section>
  );
}
