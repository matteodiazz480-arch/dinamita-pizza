import React from 'react';
import { Clock, Phone, Calendar, ArrowUpRight } from 'lucide-react';

export default function InfoSection() {
  return (
    <section id="horarios" className="py-16 sm:py-20 bg-[#D8EEFB] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="brand-card bg-white rounded-3xl p-8 sm:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left: Horarios & Botón de WhatsApp */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 bg-[#FFF1EB] text-[#EC4A13] border-2 border-[#0F172A] px-3.5 py-1 rounded-xl text-xs font-black uppercase shadow-[2px_2px_0_#0F172A]">
                <Clock className="w-4 h-4" />
                <span>HORARIOS Y CONTACTO</span>
              </div>

              <h3 className="text-3xl sm:text-5xl font-brand text-[#0F172A] leading-tight">
                PEDÍ TU DINAMITA POR WHATSAPP
              </h3>

              {/* Schedule boxes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-[#F0FDF4] border-2 border-[#0F172A] shadow-[3px_3px_0_#0F172A]">
                  <div className="flex items-center gap-2 text-[#16A34A] font-bold text-sm mb-1">
                    <Calendar className="w-4 h-4" />
                    <span>Jueves a Lunes</span>
                  </div>
                  <span className="font-brand text-xl sm:text-2xl text-[#0F172A]">
                    21:00 - 01:00hs
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#FEF2F2] border-2 border-[#0F172A] shadow-[3px_3px_0_#0F172A]">
                  <div className="flex items-center gap-2 text-[#DC2626] font-bold text-sm mb-1">
                    <Calendar className="w-4 h-4" />
                    <span>Martes y Miércoles</span>
                  </div>
                  <span className="font-brand text-xl sm:text-2xl text-[#DC2626]">
                    CERRADO
                  </span>
                </div>
              </div>

              {/* WhatsApp CTA Button */}
              <div className="pt-2">
                <a
                  href="https://wa.me/3804322180"
                  target="_blank"
                  rel="noreferrer"
                  className="brand-btn w-full sm:w-auto inline-flex bg-[#25D366] hover:bg-[#1fb858] text-white py-4 px-8 rounded-2xl font-brand text-xl sm:text-2xl items-center justify-center gap-3 shadow-[5px_5px_0_#0F172A] cursor-pointer"
                >
                  <Phone className="w-6 h-6 fill-current" />
                  <span>NUESTRO WHATSAPP</span>
                  <ArrowUpRight className="w-6 h-6 stroke-[3]" />
                </a>
              </div>
            </div>

            {/* Right: Character 2 (Holding the whole pizza) */}
            <div className="lg:col-span-5 flex justify-center items-center">
              <div className="relative w-64 sm:w-76 flex justify-center items-center">
                <div className="absolute w-56 h-56 sm:w-68 sm:h-68 bg-[#FFF1EB] rounded-full border-3 border-dashed border-[#EC4A13]/40 pointer-events-none" />
                <img
                  src="/images/char-hold.png"
                  alt="Personaje Dinamita con Pizza"
                  className="w-60 sm:w-72 h-auto object-contain relative z-10 drop-shadow-[0_12px_18px_rgba(15,23,42,0.2)] transition-transform duration-300 hover:scale-105 select-none pointer-events-none"
                />
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
