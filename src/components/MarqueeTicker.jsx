import React from 'react';
import { Star } from 'lucide-react';

export default function MarqueeTicker() {
  const items = [
    'PIZZERÍA DINAMITA',
    'PURA MOZZARELLA FUNDIDA',
    'PEDIDOS POR WHATSAPP',
    'SABORES EXPLOSIVOS',
    'DELIVERY RÁPIDO Y CALIENTE',
    'PIZZAS BIEN CARGADAS',
    'CALIDAD GARANTIZADA',
    'HAZ TU PEDIDO AHORA'
  ];

  return (
    <div className="bg-[#EC4A13] text-white py-3.5 border-y-4 border-[#0A1938] overflow-hidden select-none relative z-20 shadow-[0_4px_0_#0A1938]">
      <div className="animate-marquee gap-8 items-center">
        {[...items, ...items, ...items, ...items].map((text, idx) => (
          <div key={idx} className="flex items-center gap-6 font-brand text-base sm:text-lg tracking-wider uppercase whitespace-nowrap">
            <span>{text}</span>
            <Star className="w-4 h-4 text-white fill-current opacity-80" />
          </div>
        ))}
      </div>
    </div>
  );
}
