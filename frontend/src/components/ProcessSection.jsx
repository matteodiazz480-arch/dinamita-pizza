import React, { useRef, useState, useEffect, useCallback } from "react";
import { NEXO_CONFIG } from "../data/nexoData";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { Check } from "lucide-react";

export default function ProcessSection() {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const stepRefs = useRef([]);
  const prefersReducedMotion = useReducedMotion();

  const progressMotionValue = useMotionValue(prefersReducedMotion ? 1 : 0);

  const smoothProgress = useSpring(progressMotionValue, {
    stiffness: 140,
    damping: 28,
    restDelta: 0.001,
  });

  const [activeStep, setActiveStep] = useState(prefersReducedMotion ? 4 : 1);
  const [completedSteps, setCompletedSteps] = useState(
    prefersReducedMotion ? [1, 2, 3, 4] : []
  );
  const [lineBounds, setLineBounds] = useState({ top: 68, bottom: 68 });

  const travelerTop = useTransform(smoothProgress, [0, 1], ["0%", "100%"]);

  const updateProgress = useCallback(() => {
    if (!stepRefs.current || stepRefs.current.length < 4) return;
    const steps = stepRefs.current;
    if (!steps[0] || !steps[3]) return;

    const r0 = steps[0].getBoundingClientRect();
    const r1 = steps[1]?.getBoundingClientRect();
    const r2 = steps[2]?.getBoundingClientRect();
    const r3 = steps[3].getBoundingClientRect();

    const y0 = r0.top + r0.height * 0.5;
    const y1 = r1 ? r1.top + r1.height * 0.5 : y0 + 100;
    const y2 = r2 ? r2.top + r2.height * 0.5 : y1 + 100;
    const y3 = r3.top + r3.height * 0.5;

    if (trackRef.current) {
      const trackRect = trackRef.current.getBoundingClientRect();
      const topOffset = Math.max(20, Math.round(y0 - trackRect.top));
      const bottomOffset = Math.max(20, Math.round(trackRect.bottom - y3));
      setLineBounds((prev) => {
        if (
          Math.abs(prev.top - topOffset) > 2 ||
          Math.abs(prev.bottom - bottomOffset) > 2
        ) {
          return { top: topOffset, bottom: bottomOffset };
        }
        return prev;
      });
    }

    const windowH = window.innerHeight;
    const triggerY = windowH * 0.56;

    const totalDist = y3 - y0;
    if (totalDist <= 0) return;

    let progress = 0;
    if (triggerY <= y0) {
      progress = 0;
    } else if (triggerY >= y3) {
      progress = 1;
    } else {
      progress = (triggerY - y0) / totalDist;
    }

    progressMotionValue.set(progress);

    let current = 1;
    const completed = [];

    if (triggerY >= y0) {
      current = 1;
    }
    if (triggerY >= y1) {
      current = 2;
      completed.push(1);
    }
    if (triggerY >= y2) {
      current = 3;
      completed.push(1, 2);
    }
    if (triggerY >= y3) {
      current = 4;
      completed.push(1, 2, 3);
    }
    if (triggerY >= y3 + 40) {
      completed.push(4);
    }

    setActiveStep((prev) => (prev !== current ? current : prev));
    setCompletedSteps((prev) => {
      if (
        prev.length === completed.length &&
        prev.every((v, i) => v === completed[i])
      ) {
        return prev;
      }
      return completed;
    });
  }, [progressMotionValue]);

  useEffect(() => {
    if (prefersReducedMotion) {
      progressMotionValue.set(1);
      return;
    }

    let rafId = null;

    const handleScroll = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        updateProgress();
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    updateProgress();

    const timer1 = setTimeout(updateProgress, 150);
    const timer2 = setTimeout(updateProgress, 600);

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(updateProgress);
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [prefersReducedMotion, updateProgress, progressMotionValue]);

  return (
    <section
      id="proceso"
      ref={sectionRef}
      className="surface-process text-[#111111] py-9 sm:py-14 lg:py-16 relative overflow-hidden"
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.22] mask-fade-vertical"
        style={{
          backgroundImage:
            "radial-gradient(rgba(17, 17, 17, 0.08) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 sm:gap-6 mb-8 sm:mb-14">
          <div className="max-w-xl">
            <h2 className="text-2xl sm:text-4xl font-black text-[#111111] tracking-tight leading-tight">
              {NEXO_CONFIG.process.title}
            </h2>
            <p className="text-xs sm:text-base text-gray-600 font-medium mt-1.5">
              {NEXO_CONFIG.process.subtitle}
            </p>
          </div>

          <div className="bg-white border border-black/[0.06] rounded-xl p-3 sm:px-5 sm:py-3.5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col gap-2 min-w-[220px] sm:min-w-[300px]">
            <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-bold tracking-wider uppercase">
              <span className="text-gray-400">Etapa activa</span>
              <span className="text-[#111111] tabular-nums font-black">
                0{Math.max(1, activeStep)} <span className="text-gray-300">/ 04</span>
              </span>
            </div>

            <div className="relative flex items-center justify-between pt-0.5">
              <div className="absolute left-3 right-3 top-1/2 -translate-y-1/2 h-[2px] bg-gray-200 rounded-full" />

              <motion.div
                className="absolute left-3 right-3 top-1/2 -translate-y-1/2 h-[2px] bg-[#111111] rounded-full origin-left"
                style={{
                  scaleX: prefersReducedMotion ? 1 : smoothProgress,
                }}
              />

              {NEXO_CONFIG.process.steps.map((s) => {
                const reached = activeStep >= s.step;
                const isLast = s.step === 4;
                return (
                  <div
                    key={s.step}
                    className="relative z-10 flex items-center gap-1"
                  >
                    <div
                      className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full text-[10px] sm:text-[11px] font-black flex items-center justify-center transition-all duration-300 ${
                        reached
                          ? isLast
                            ? "bg-[#9333EA] text-white scale-105"
                            : "bg-[#111111] text-[#BCE838] scale-105"
                          : "bg-white border border-gray-300 text-gray-400"
                      }`}
                    >
                      {s.step}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div ref={trackRef} className="relative">
          <div
            className="absolute left-4 sm:left-7 lg:left-1/2 -translate-x-1/2 w-[2px] z-0 pointer-events-none"
            style={{
              top: `${lineBounds.top}px`,
              bottom: `${lineBounds.bottom}px`,
            }}
          >
            <div className="w-full h-full bg-gray-300/75 rounded-full" />

            <motion.div
              className="absolute top-0 left-0 w-full h-full rounded-full origin-top"
              style={{
                scaleY: prefersReducedMotion ? 1 : smoothProgress,
                background:
                  "linear-gradient(180deg, #111111 0%, #111111 65%, #4d6b1a 88%, #9333EA 100%)",
              }}
            />

            {!prefersReducedMotion && (
              <motion.div
                style={{ top: travelerTop }}
                className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-[#BCE838] border-2 border-[#111111] pointer-events-none z-20 shadow-xs"
              />
            )}
          </div>

          <div className="space-y-4 sm:space-y-8 lg:space-y-11 relative z-10">
            {NEXO_CONFIG.process.steps.map((step, index) => {
              const isActivated = activeStep >= step.step;
              const isCompleted = completedSteps.includes(step.step);
              const isCurrent = activeStep === step.step;

              const isEven = index % 2 === 1;
              const isFinalStep = step.step === 4;

              return (
                <div
                  key={step.step}
                  ref={(el) => (stepRefs.current[index] = el)}
                  className="relative grid grid-cols-1 lg:grid-cols-12 items-center gap-3 lg:gap-0"
                >
                  <div className="hidden lg:flex lg:col-span-5 justify-end pr-12">
                    {!isEven ? (
                      <StageCard
                        step={step}
                        isActivated={isActivated}
                        isCompleted={isCompleted}
                        isCurrent={isCurrent}
                        isFinalStep={isFinalStep}
                      />
                    ) : (
                      <EditorialStageMeta
                        step={step}
                        isActivated={isActivated}
                        isFinalStep={isFinalStep}
                        align="right"
                      />
                    )}
                  </div>

                  <div className="lg:col-span-2 flex items-center lg:justify-center relative pl-11 sm:pl-16 lg:pl-0">
                    <div
                      className={`hidden lg:block absolute top-1/2 -translate-y-1/2 h-[2px] w-1/2 ${
                        !isEven ? "left-0" : "right-0"
                      }`}
                    >
                      <div className="w-full h-full bg-gray-300/65" />
                      <div
                        className={`absolute top-0 h-full transition-all duration-300 ease-out ${
                          isFinalStep ? "bg-[#9333EA]" : "bg-[#111111]"
                        } ${!isEven ? "right-0 origin-right" : "left-0 origin-left"}`}
                        style={{
                          width: isActivated ? "100%" : "0%",
                        }}
                      />
                    </div>

                    <div className="lg:hidden absolute left-4 sm:left-7 top-1/2 -translate-y-1/2 w-8 sm:w-10 h-[2px] z-10 pointer-events-none">
                      <div className="w-full h-full bg-gray-300/65" />
                      <div
                        className={`absolute top-0 left-0 h-full transition-all duration-300 ease-out ${
                          isFinalStep ? "bg-[#9333EA]" : "bg-[#111111]"
                        }`}
                        style={{
                          width: isActivated ? "100%" : "0%",
                        }}
                      />
                    </div>

                    <div
                      className={`absolute left-4 sm:left-7 top-1/2 -translate-y-1/2 -translate-x-1/2 lg:translate-y-0 lg:translate-x-0 lg:static w-9 h-9 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-300 z-20 ${
                        isActivated
                          ? isFinalStep
                            ? "bg-[#111111] text-white ring-4 ring-[#9333EA]/15 shadow-sm scale-105"
                            : "bg-[#111111] text-[#BCE838] ring-4 ring-black/[0.06] shadow-sm scale-105"
                          : "bg-white text-gray-400 border-2 border-gray-300 scale-100"
                      }`}
                    >
                      <span
                        className={`text-xs sm:text-base font-black tabular-nums transition-colors duration-300 ${
                          isActivated
                            ? isFinalStep
                              ? "text-[#a855f7]"
                              : "text-[#BCE838]"
                            : "text-gray-400"
                        }`}
                      >
                        {step.step}
                      </span>
                    </div>

                    <div className="w-full lg:hidden">
                      <StageCard
                        step={step}
                        isActivated={isActivated}
                        isCompleted={isCompleted}
                        isCurrent={isCurrent}
                        isFinalStep={isFinalStep}
                      />
                    </div>
                  </div>

                  <div className="hidden lg:flex lg:col-span-5 justify-start pl-12">
                    {isEven ? (
                      <StageCard
                        step={step}
                        isActivated={isActivated}
                        isCompleted={isCompleted}
                        isCurrent={isCurrent}
                        isFinalStep={isFinalStep}
                      />
                    ) : (
                      <EditorialStageMeta
                        step={step}
                        isActivated={isActivated}
                        isFinalStep={isFinalStep}
                        align="left"
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-10 sm:mt-14 h-px w-full max-w-4xl mx-auto bg-gradient-to-r from-transparent via-black/[0.06] to-transparent" />
      </div>
    </section>
  );
}

function EditorialStageMeta({ step, isActivated, isFinalStep, align }) {
  return (
    <div
      className={`flex flex-col transition-all duration-300 select-none ${
        align === "right" ? "items-end text-right" : "items-start text-left"
      } ${isActivated ? "opacity-100 translate-y-0" : "opacity-35 translate-y-1.5"}`}
    >
      <span
        className={`text-5xl xl:text-6xl font-black tracking-tighter leading-none tabular-nums transition-colors duration-300 ${
          isActivated
            ? isFinalStep
              ? "text-[#9333EA]"
              : "text-[#111111]"
            : "text-gray-300"
        }`}
      >
        {step.number}
      </span>
      <div className="flex items-center gap-2 mt-1.5">
        <span
          className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
            isActivated
              ? isFinalStep
                ? "bg-[#9333EA]"
                : "bg-[#BCE838]"
              : "bg-gray-300"
          }`}
        />
        <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500">
          Etapa {step.number}
        </span>
      </div>
    </div>
  );
}

function StageCard({
  step,
  isActivated,
  isCompleted,
  isCurrent,
  isFinalStep,
}) {
  const useDarkSurface = isFinalStep && isActivated;

  return (
    <div
      className={`w-full rounded-2xl p-4 sm:p-6 transition-all duration-300 relative overflow-hidden ${
        useDarkSurface
          ? "bg-[#111111] text-white shadow-lg border border-white/10 translate-y-0 opacity-100"
          : isActivated
          ? "bg-white text-[#111111] shadow-[0_6px_24px_rgba(0,0,0,0.04)] border border-black/[0.08] translate-y-0 opacity-100"
          : "bg-white/70 text-gray-400 border border-black/[0.04] shadow-none translate-y-1 opacity-65"
      }`}
    >
      <div className="flex items-center justify-between gap-3 mb-2">
        <span
          className={`text-[10px] font-black uppercase tracking-[0.16em] px-2 py-0.5 rounded-md transition-colors duration-300 ${
            useDarkSurface
              ? "bg-[#9333EA]/20 text-[#c084fc]"
              : isActivated
              ? "bg-[#111111] text-[#BCE838]"
              : "bg-gray-100 text-gray-400"
          }`}
        >
          Paso {step.number}
        </span>

        <div className="flex items-center">
          {isCompleted ? (
            <span
              className={`w-4 h-4 rounded-full flex items-center justify-center transition-transform duration-300 ${
                useDarkSurface
                  ? "bg-[#9333EA] text-white"
                  : "bg-[#BCE838] text-[#111111]"
              }`}
            >
              <Check className="w-2.5 h-2.5 stroke-[3]" />
            </span>
          ) : (
            <span
              className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                isActivated
                  ? isFinalStep
                    ? "bg-[#9333EA]"
                    : "bg-[#BCE838]"
                  : "bg-gray-300"
              }`}
            />
          )}
        </div>
      </div>

      <h3
        className={`text-base sm:text-xl font-black tracking-tight transition-colors duration-300 ${
          useDarkSurface
            ? "text-white"
            : isActivated
            ? "text-[#111111]"
            : "text-gray-400"
        }`}
      >
        {step.title}
      </h3>

      <p
        className={`text-xs sm:text-sm font-medium leading-relaxed mt-1 transition-colors duration-300 ${
          useDarkSurface
            ? "text-gray-300"
            : isActivated
            ? "text-gray-600"
            : "text-gray-400"
        }`}
      >
        {step.desc}
      </p>

      <div
        className={`w-full h-[2px] mt-3.5 rounded-full overflow-hidden ${
          useDarkSurface ? "bg-white/10" : "bg-gray-100"
        }`}
      >
        <div
          className={`h-full transition-all duration-300 ease-out origin-left ${
            isFinalStep ? "bg-[#9333EA]" : "bg-[#111111]"
          }`}
          style={{
            width: isCompleted ? "100%" : isCurrent ? "65%" : "0%",
          }}
        />
      </div>
    </div>
  );
}
