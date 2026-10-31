import React, { useState } from "react";
import { NEXO_CONFIG } from "../data/nexoData";
import { Plus, Minus } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import editorialLuxuryImg from "../assets/nexo-editorial-luxury.jpg";

export default function FaqSection() {
  const [openIds, setOpenIds] = useState([1]);
  const prefersReducedMotion = useReducedMotion();

  const toggleFaq = (id) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <section
      id="faq"
      className="surface-faq text-[#111111] pt-6 sm:pt-8 pb-9 sm:pb-14 relative"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="mb-5 sm:mb-8"
        >
          <h2 className="text-2xl sm:text-4xl font-black text-[#111111] tracking-tight">
            {NEXO_CONFIG.faq.title}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 lg:gap-8 items-center">
          <div className="lg:col-span-8 grid grid-cols-1 gap-3 sm:gap-4 items-start">
            {NEXO_CONFIG.faq.items.map((item, index) => {
              const isOpen = openIds.includes(item.id);

              return (
                <motion.div
                  key={item.id}
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{
                    duration: 0.35,
                    delay: index * 0.05,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  onClick={() => toggleFaq(item.id)}
                  className="bg-white/90 backdrop-blur-xs rounded-2xl p-4 sm:p-5 border border-black/[0.06] shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all hover:shadow-xs cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#9333EA]/[0.08] flex items-center justify-center flex-shrink-0 mt-0.5 text-[#9333EA]">
                      {isOpen ? (
                        <Minus className="w-3.5 h-3.5 stroke-[3]" />
                      ) : (
                        <Plus className="w-3.5 h-3.5 stroke-[3]" />
                      )}
                    </div>

                    <div className="space-y-1.5 flex-1">
                      <h3 className="text-xs sm:text-base font-extrabold text-[#111111] leading-snug">
                        {item.question}
                      </h3>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="text-xs sm:text-sm text-gray-500 font-medium leading-relaxed pt-1 overflow-hidden"
                          >
                            {item.answer}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.45, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-4 w-full"
          >
            <img
              src={editorialLuxuryImg}
              alt="Identidad y comunicación visual de marca"
              className="w-full aspect-[4/4] sm:aspect-[4/5] lg:aspect-[3/4] max-h-[310px] sm:max-h-[360px] lg:max-h-[410px] rounded-2xl object-cover object-[center_36%] block"
              loading="lazy"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
