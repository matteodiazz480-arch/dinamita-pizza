import React from 'react';
import { ShoppingBag } from 'lucide-react';

export default function Navbar({ cartCount, onOpenCart }) {
  return (
    <header className="sticky top-0 z-50 bg-white border-b-4 border-[#0F172A] shadow-[0_4px_0_#0F172A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-22 sm:h-24 flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <a href="#home" className="flex items-center gap-3.5 group">
          <img 
            src="/images/logo-hd.png" 
            alt="Pizzería Dinamita Logo" 
            className="h-16 sm:h-20 w-auto object-contain transition-transform group-hover:scale-105 drop-shadow-[0_2px_4px_rgba(15,23,42,0.15)]"
          />
          <div className="flex flex-col">
            <span className="text-2xl sm:text-3xl font-brand tracking-wide text-[#0F172A] leading-none group-hover:text-[#EC4A13] transition-colors">
              DINAMITA
            </span>
            <span className="text-[11px] sm:text-xs font-extrabold tracking-widest text-[#EC4A13] uppercase bg-[#FFF1EB] px-2 py-0.5 rounded border border-[#0F172A] w-max mt-1">
              PIZZERÍA & DELIVERY
            </span>
          </div>
        </a>

        {/* Right Action: Only Cart at the exact same distance */}
        <div className="flex items-center">
          <button
            onClick={onOpenCart}
            className="brand-btn relative bg-[#EC4A13] hover:bg-[#d83f0d] text-white px-4 py-2.5 rounded-xl font-bold flex items-center gap-2.5 text-sm sm:text-base cursor-pointer"
          >
            <ShoppingBag className="w-5 h-5" />
            <span className="hidden sm:inline">Tu Pedido</span>
            <span className="bg-white text-[#EC4A13] text-xs px-2 py-0.5 rounded-full border border-[#0F172A] font-black">
              {cartCount}
            </span>
          </button>
        </div>

      </div>
    </header>
  );
}
