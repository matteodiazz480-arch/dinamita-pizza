import React from 'react';
import { ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function Hero() {
  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#EC4A13', '#ACD8F1', '#0F172A', '#FFFFFF']
    });
  };

  return (
    <section id="home" className="relative overflow-hidden pt-12 pb-18 lg:pt-18 lg:pb-24 bg-[#FFFDF7]">
      {/* Soft celestial dots pattern */}
      <div className="absolute inset-0 dots-soft-blue pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column: Brand Pitch */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-brand text-[#0F172A] leading-[1.08] mb-6">
              EL SABOR QUE <br />
              <span className="text-[#EC4A13] inline-block relative">
                EXPLOTA EN TU BOCA
                <svg className="absolute -bottom-2 left-0 w-full h-3 text-[#ACD8F1]" viewBox="0 0 100 20" preserveAspectRatio="none">
                  <path d="M0,15 Q50,0 100,15" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round"/>
                </svg>
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-xl text-[#475569] font-medium max-w-xl mb-8 leading-relaxed">
              Masa crocante dorada en su punto justo, abundante mozzarella fundida y las combinaciones más ricas listas para compartir.
            </p>

            {/* Single Action Button: ONLY Ver la Carta */}
            <div className="flex items-center w-full sm:w-auto">
              <a
                href="#menu"
                onClick={triggerConfetti}
                className="brand-btn bg-[#EC4A13] hover:bg-[#d83f0d] text-white text-base sm:text-lg font-black px-8 py-4 rounded-2xl flex items-center justify-center gap-3 w-full sm:w-auto cursor-pointer"
              >
                <span>VER LA CARTA</span>
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>

          </div>

          {/* Right Column: Character 1 (Jumping with Pizza Slice) */}
          <div className="lg:col-span-5 flex justify-center items-center">
            <div className="relative w-full max-w-md flex justify-center items-center">
              
              {/* Soft background halo */}
              <div className="absolute w-72 h-72 sm:w-88 sm:h-88 bg-[#ACD8F1]/50 rounded-full border-3 border-dashed border-[#0F172A]/20 pointer-events-none" />

              {/* Character 1 Illustration */}
              <div className="relative z-10 transition-transform duration-300 hover:scale-105">
                <img
                  src="/images/char-jump.png"
                  alt="Personaje Dinamita Pizza"
                  className="w-80 sm:w-104 h-auto object-contain drop-shadow-[0_14px_20px_rgba(15,23,42,0.18)] select-none pointer-events-none"
                />
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
