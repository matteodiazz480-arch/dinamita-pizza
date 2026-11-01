import React, { useState, useEffect, useCallback, useRef } from "react";
import { NEXO_CONFIG } from "../data/nexoData";
import {
  Wrench,
  Briefcase,
  Image as ImageIcon,
  MapPin,
  MessageCircle,
  TrendingUp,
  UserCheck,
  Calendar,
  BookOpen,
  PieChart,
  ArrowRight,
  Check,
  Layers,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import nexoOficiosImg from "../assets/nexo-oficios.jpg";
import nexoProfesionalesImg from "../assets/nexo-profesionales.jpg";

export default function RubrosSection({ onOpenConsultationModal }) {
  const prefersReducedMotion = useReducedMotion();
  const { title, subtitle, oficios, profesionales } = NEXO_CONFIG.rubros;
  const containerRef = useRef(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [containerWidth, setContainerWidth] = useState(1200);

  const cardsData = [
    {
      id: "oficios",
      ...oficios,
      image: nexoOficiosImg,
    },
    {
      id: "profesionales",
      ...profesionales,
      image: nexoProfesionalesImg,
    },
  ];

  // Medición de ancho responsivo
  useEffect(() => {
    if (!containerRef.current) return;
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth || 1200);
      }
    };
    updateWidth();
    const el = containerRef.current;
    if (typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver(updateWidth);
      ro.observe(el);
      return () => ro.disconnect();
    }
  }, []);

  const isMobile = containerWidth < 640;
  const isTablet = containerWidth >= 640 && containerWidth < 1024;

  // Parámetros de abanico (FanCardCarousel)
  const responsiveFanSpread = isMobile ? 32 : isTablet ? 90 : 160;
  const responsiveRotation = isMobile ? 3.5 : isTablet ? 5 : 7;
  const responsiveYCurve = isMobile ? 18 : isTablet ? 26 : 34;

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev < cardsData.length - 1 ? prev + 1 : 0));
  }, [cardsData.length]);

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : cardsData.length - 1));
  }, [cardsData.length]);

  // Soporte de navegación por teclado
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev]);

  const handleDragEnd = (_event, info) => {
    const threshold = isMobile ? 25 : 45;
    if (info.offset.x > threshold && activeIndex > 0) {
      setActiveIndex((prev) => prev - 1);
    } else if (info.offset.x < -threshold && activeIndex < cardsData.length - 1) {
      setActiveIndex((prev) => prev + 1);
    }
  };

  const getPillarIcon = (iconName) => {
    const iconClass = "w-4 h-4 text-[#BCE838]";
    switch (iconName) {
      case "Image":
        return <ImageIcon className={iconClass} />;
      case "MapPin":
        return <MapPin className={iconClass} />;
      case "MessageCircle":
        return <MessageCircle className={iconClass} />;
      case "TrendingUp":
        return <TrendingUp className={iconClass} />;
      case "UserCheck":
        return <UserCheck className={iconClass} />;
      case "Calendar":
        return <Calendar className={iconClass} />;
      case "BookOpen":
        return <BookOpen className={iconClass} />;
      case "PieChart":
        return <PieChart className={iconClass} />;
      default:
        return <Check className={iconClass} />;
    }
  };

  return (
    <section
      id="rubros"
      className="surface-rubros text-[#111111] py-12 sm:py-16 lg:py-20 relative overflow-hidden"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Cabecera de sección */}
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col lg:flex-row lg:items-end justify-between gap-3 sm:gap-4 border-b border-black/[0.07] pb-4 sm:pb-5 mb-6 sm:mb-8"
        >
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#9333EA] uppercase tracking-wider mb-1">
              <Layers className="w-3.5 h-3.5" />
              <span>Soluciones especializadas</span>
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-[2.6rem] font-black text-[#111111] tracking-tight leading-tight">
              {title}{" "}
              <span className="font-editorial-serif italic font-normal text-[#9333EA]">
                a tu medida
              </span>
            </h2>
          </div>
          <p className="text-xs sm:text-sm lg:text-base text-gray-600 font-medium lg:max-w-md lg:text-right leading-relaxed">
            {subtitle}
          </p>
        </motion.div>

        {/* Pestañas de alternancia rápida estilo blur */}
        <div className="flex items-center justify-center gap-2 mb-6 sm:mb-8">
          {cardsData.map((card, idx) => {
            const isActive = activeIndex === idx;
            const isOficios = card.id === "oficios";
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  isActive
                    ? "bg-[#111111] text-white shadow-md scale-102"
                    : "bg-white/80 hover:bg-white text-gray-700 hover:text-black border border-black/10 backdrop-blur-md"
                }`}
              >
                {isOficios ? (
                  <Wrench
                    className={`w-3.5 h-3.5 ${
                      isActive ? "text-[#BCE838]" : "text-[#111111]"
                    }`}
                  />
                ) : (
                  <Briefcase
                    className={`w-3.5 h-3.5 ${
                      isActive ? "text-[#BCE838]" : "text-[#9333EA]"
                    }`}
                  />
                )}
                <span>{card.badge}</span>
              </button>
            );
          })}
        </div>

        {/* Escenario del FanCardCarousel con tarjetas estilo Blur Blanco */}
        <div
          ref={containerRef}
          className="relative w-full h-[620px] sm:h-[560px] lg:h-[520px] flex items-center justify-center select-none"
        >
          {cardsData.map((card, index) => {
            const distance = index - activeIndex;
            const absDistance = Math.abs(distance);
            const xOffset = distance * responsiveFanSpread;
            const yOffset = absDistance * responsiveYCurve;
            const rotation = distance * responsiveRotation;
            const isActive = index === activeIndex;
            const isHovered = hoveredIndex === index;
            const scale = isActive ? 1 : Math.max(0.88, 0.94 - absDistance * 0.05);
            const zIndex = 20 - absDistance;
            const isOficios = card.id === "oficios";

            return (
              <motion.div
                key={card.id}
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  width: "100%",
                  maxWidth: isMobile ? "92%" : isTablet ? "780px" : "860px",
                  cursor: "pointer",
                  zIndex,
                  touchAction: "pan-y",
                }}
                animate={
                  prefersReducedMotion
                    ? { opacity: isActive ? 1 : 0, pointerEvents: isActive ? "auto" : "none" }
                    : {
                        x: `calc(-50% + ${xOffset}px)`,
                        y: `calc(-50% + ${yOffset}px)`,
                        rotate: rotation,
                        scale: isHovered && !isActive ? scale * 1.02 : scale,
                      }
                }
                transition={{
                  type: "spring",
                  stiffness: 280,
                  damping: 26,
                  mass: 0.9,
                }}
                drag={isMobile || !prefersReducedMotion ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.25}
                onDragEnd={handleDragEnd}
                onClick={() => {
                  if (!isActive) setActiveIndex(index);
                }}
                onMouseEnter={() => !isMobile && setHoveredIndex(index)}
                onMouseLeave={() => !isMobile && setHoveredIndex(null)}
                className="will-change-transform"
              >
                {/* Tarjeta con estilo efecto blur blanco */}
                <div
                  className={`w-full rounded-3xl p-5 sm:p-7 lg:p-8 transition-shadow duration-300 relative overflow-hidden ${
                    isActive
                      ? "bg-white/85 backdrop-blur-2xl border border-white/80 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.05]"
                      : "bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_15px_35px_-10px_rgba(0,0,0,0.06)] hover:bg-white/80"
                  }`}
                >
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6 lg:gap-8 items-center">
                    {/* Fotografía del rubro */}
                    <div className="md:col-span-5 w-full">
                      <div className="relative rounded-2xl overflow-hidden aspect-[4/3] sm:aspect-[16/11] md:aspect-[4/5] bg-gray-100 border border-black/[0.06] shadow-xs group">
                        <img
                          src={card.image}
                          alt={card.headline}
                          className="w-full h-full object-cover object-[center_28%] group-hover:scale-102 transition-transform duration-500"
                          loading="lazy"
                          decoding="async"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                        <div className="absolute bottom-3 left-3 right-3 bg-white/90 backdrop-blur-md rounded-xl px-3 py-1.5 border border-white/60 flex items-center justify-between shadow-xs">
                          <span
                            className={`text-[11px] font-extrabold ${
                              isOficios ? "text-[#111111]" : "text-[#9333EA]"
                            }`}
                          >
                            {card.badge}
                          </span>
                          <span className="text-[10px] text-gray-600 font-semibold">
                            {isOficios ? "Zona Local" : "Marca Personal"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Contenido descriptivo y características */}
                    <div className="md:col-span-7 flex flex-col justify-between space-y-3.5">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                              isOficios
                                ? "bg-[#BCE838]/20 text-[#111111]"
                                : "bg-[#9333EA]/10 text-[#9333EA]"
                            }`}
                          >
                            {isOficios ? (
                              <Wrench className="w-3.5 h-3.5" />
                            ) : (
                              <Briefcase className="w-3.5 h-3.5" />
                            )}
                          </div>
                          <span
                            className={`text-xs font-black uppercase tracking-wider ${
                              isOficios ? "text-[#111111]" : "text-[#9333EA]"
                            }`}
                          >
                            {card.badge}
                          </span>
                        </div>

                        <h3 className="text-xl sm:text-2xl font-black text-[#111111] tracking-tight leading-tight">
                          {card.headline}
                        </h3>

                        <p className="text-xs sm:text-sm text-gray-600 font-medium mt-0.5">
                          {card.tagline}
                        </p>

                        {/* Etiquetas de especialidades */}
                        <div className="flex flex-wrap gap-1.5 pt-2.5">
                          {card.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 bg-black/[0.04] border border-black/[0.06] text-gray-800 text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-md"
                            >
                              <Check className="w-3 h-3 text-[#BCE838] stroke-[3]" />
                              <span>{tag}</span>
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* 4 Ejes de valor en mini bloques blur suaves */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                        {card.pillars.map((pillar, idx) => (
                          <div
                            key={idx}
                            className="bg-white/60 hover:bg-white/90 border border-black/[0.05] rounded-xl p-2.5 transition-colors"
                          >
                            <div className="flex items-center gap-2 mb-0.5">
                              <div className="w-5 h-5 rounded-md bg-[#111111] text-[#BCE838] flex items-center justify-center flex-shrink-0">
                                {getPillarIcon(pillar.icon)}
                              </div>
                              <h4 className="text-xs font-bold text-[#111111]">
                                {pillar.title}
                              </h4>
                            </div>
                            <p className="text-[11px] text-gray-600 font-medium leading-snug pl-7">
                              {pillar.desc}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Botón de acción */}
                      <div className="pt-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenConsultationModal?.(
                              isOficios
                                ? "Planes NEXO Oficios"
                                : "Planes NEXO Profesionales"
                            );
                          }}
                          className="inline-flex items-center gap-2 bg-[#111111] hover:bg-[#202227] text-white font-extrabold px-6 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm tracking-wide transition-colors cursor-pointer group shadow-sm"
                        >
                          <span>{card.ctaText}</span>
                          <ArrowRight className="w-4 h-4 text-[#BCE838] group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* Botones laterales de navegación */}
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/80 hover:bg-white text-gray-800 border border-black/10 backdrop-blur-md flex items-center justify-center shadow-md transition-all cursor-pointer hover:scale-105"
            aria-label="Rubro anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/80 hover:bg-white text-gray-800 border border-black/10 backdrop-blur-md flex items-center justify-center shadow-md transition-all cursor-pointer hover:scale-105"
            aria-label="Siguiente rubro"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Separador inferior sutil */}
      <div className="mt-10 sm:mt-14 h-px w-full max-w-4xl mx-auto bg-gradient-to-r from-transparent via-black/[0.06] to-transparent" />
    </section>
  );
}
