import React from 'react';
import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer id="contacto" className="bg-[#0F172A] text-white py-10 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white rounded-xl border-2 border-white p-1 flex items-center justify-center shadow-[2px_2px_0_#EC4A13]">
            <img src="/images/logo-hd.png" alt="Pizzería Dinamita" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-brand text-white leading-none">DINAMITA</span>
            <span className="text-[10px] font-bold text-[#EC4A13] tracking-widest uppercase mt-0.5">PIZZERÍA & DELIVERY</span>
          </div>
        </div>

        {/* Copyright */}
        <div className="flex flex-col sm:flex-row items-center gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} Pizzería Dinamita. Todos los derechos reservados.</p>
          <span className="hidden sm:inline">•</span>
          <p className="flex items-center gap-1">
            Hecho con <Heart className="w-3.5 h-3.5 text-[#EC4A13] fill-current" /> para los fanáticos de la pizza
          </p>
        </div>

      </div>
    </footer>
  );
}
