import React, { useState } from 'react';
import { PIZZAS, PIZZA_CATEGORIES } from '../data/pizzas';
import { Plus, Star, Search, Check, Flame, Pizza, Sparkles, Shield, Utensils } from 'lucide-react';
import confetti from 'canvas-confetti';

const categoryIconMap = {
  Sparkles: Sparkles,
  Flame: Flame,
  Pizza: Pizza,
  Shield: Shield,
  Utensils: Utensils
};

export default function MenuSection({ onAddToCart, activeCategory, onSelectCategory }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [addedItemMap, setAddedItemMap] = useState({});
  const [hoveredCardId, setHoveredCardId] = useState(null);

  const currentCatObj = PIZZA_CATEGORIES.find(c => c.id === activeCategory) || PIZZA_CATEGORIES[0];

  const filteredPizzas = PIZZAS.filter(pizza => {
    const matchesCategory = activeCategory === 'all' || pizza.category === activeCategory;
    const matchesSearch = pizza.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          pizza.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          pizza.ingredients.some(i => i.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleAdd = (pizza) => {
    onAddToCart(pizza);
    setAddedItemMap(prev => ({ ...prev, [pizza.id]: true }));
    setTimeout(() => {
      setAddedItemMap(prev => ({ ...prev, [pizza.id]: false }));
    }, 1200);

    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#EC4A13', '#ACD8F1', '#0F172A']
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(price);
  };

  return (
    <section
      id="menu"
      className="py-16 sm:py-22 relative transition-colors duration-500"
      style={{ backgroundColor: currentCatObj.bgColor }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header (Clean, without character inside the Carta) */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-brand text-[#0F172A] mb-3">
            NUESTRAS VARIEDADES
          </h2>
          <p className="text-base sm:text-lg text-[#475569] font-medium">
            Elegí tu categoría favorita. Cada variedad se prepara en el momento con abundante mozzarella y el sello único de Dinamita.
          </p>

          {/* Search Input */}
          <div className="mt-7 max-w-md mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Buscar por nombre o ingrediente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border-3 border-[#0F172A] rounded-2xl font-medium text-sm sm:text-base focus:outline-none shadow-[4px_4px_0_#0F172A] placeholder-[#94A3B8] text-[#0F172A]"
            />
          </div>
        </div>

        {/* Category Filter Buttons (Clicking changes the section & card colors!) */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
          {PIZZA_CATEGORIES.map(cat => {
            const isActive = activeCategory === cat.id;
            const IconComponent = categoryIconMap[cat.icon] || Sparkles;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                style={{
                  backgroundColor: isActive ? cat.accentColor : '#FFFFFF',
                  color: isActive ? '#FFFFFF' : '#0F172A'
                }}
                className="brand-btn px-5 py-2.5 rounded-xl font-bold text-sm sm:text-base cursor-pointer flex items-center gap-2 transition-all duration-300"
              >
                <IconComponent className="w-4 h-4" style={{ color: isActive ? '#FFFFFF' : cat.accentColor }} />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Pizzas Grid - Cards change color on hover */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPizzas.map((pizza) => {
            const isAdded = addedItemMap[pizza.id];
            const isHovered = hoveredCardId === pizza.id;
            return (
              <div
                key={pizza.id}
                onMouseEnter={() => setHoveredCardId(pizza.id)}
                onMouseLeave={() => setHoveredCardId(null)}
                style={{
                  backgroundColor: isHovered ? pizza.cardHoverBg : '#FFFFFF'
                }}
                className="brand-card rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden group transition-colors duration-300"
              >
                {/* Top Badge */}
                {pizza.badge && (
                  <div
                    style={{ backgroundColor: pizza.accentHex }}
                    className="absolute top-4 left-4 z-20 text-white border-2 border-[#0F172A] px-3 py-0.5 rounded-full text-xs font-black uppercase shadow-[2px_2px_0_#0F172A]"
                  >
                    {pizza.badge}
                  </div>
                )}

                {/* Spicy indicator */}
                {pizza.spicyLevel > 0 && (
                  <div className="absolute top-4 right-4 z-20 bg-white border-2 border-[#0F172A] px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-[2px_2px_0_#0F172A] text-[#EC4A13]">
                    <Flame className="w-3.5 h-3.5 fill-current" />
                    <span>Nivel {pizza.spicyLevel}</span>
                  </div>
                )}

                {/* Visual Preview */}
                <div className="relative mt-8 mb-6 flex justify-center items-center h-52">
                  <div
                    style={{ backgroundColor: pizza.circleBg }}
                    className="absolute w-44 h-44 rounded-full border-3 border-dashed border-[#0F172A]/25 group-hover:scale-105 transition-all duration-300"
                  />
                  <img
                    src={pizza.image}
                    alt={pizza.name}
                    className="w-44 h-44 object-contain relative z-10 drop-shadow-[0_10px_14px_rgba(15,23,42,0.22)] select-none group-hover:scale-110 transition-transform duration-300"
                  />
                </div>

                {/* Pizza Info */}
                <div className="flex-1 flex flex-col">
                  <h3 className="text-xl sm:text-2xl font-brand text-[#0F172A] group-hover:text-[#EC4A13] transition-colors leading-tight mb-2">
                    {pizza.name}
                  </h3>

                  {/* Rating & Reviews */}
                  <div className="flex items-center gap-1.5 mb-3 text-xs font-bold text-[#64748B]">
                    <div className="flex text-[#EC4A13]">
                      <Star className="w-3.5 h-3.5 fill-current" />
                    </div>
                    <span className="text-[#0F172A]">{pizza.rating}</span>
                    <span>({pizza.reviews} pedidos)</span>
                  </div>

                  <p className="text-sm text-[#334155] font-medium mb-4 leading-relaxed line-clamp-3">
                    {pizza.description}
                  </p>

                  {/* Ingredients chips */}
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {pizza.ingredients.slice(0, 4).map((ing, i) => (
                      <span key={i} className="text-[11px] font-semibold bg-white/90 text-[#0F172A] px-2.5 py-0.5 rounded-md border border-[#0F172A]/20">
                        {ing}
                      </span>
                    ))}
                    {pizza.ingredients.length > 4 && (
                      <span className="text-[11px] font-semibold text-[#475569] px-1 py-0.5">
                        +{pizza.ingredients.length - 4} más
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Bottom: Price & Add Button */}
                <div className="pt-4 border-t-2 border-[#0F172A]/10 flex items-center justify-between">
                  <div>
                    {pizza.oldPrice && (
                      <span className="block text-xs line-through text-[#64748B] font-bold">
                        {formatPrice(pizza.oldPrice)}
                      </span>
                    )}
                    <span className="text-2xl font-brand" style={{ color: pizza.accentHex }}>
                      {formatPrice(pizza.price)}
                    </span>
                  </div>

                  <button
                    onClick={() => handleAdd(pizza)}
                    style={{
                      backgroundColor: isAdded ? '#10B981' : pizza.accentHex
                    }}
                    className="brand-btn px-4 py-2.5 rounded-xl font-black text-sm text-white flex items-center gap-2 cursor-pointer"
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>AGREGADO</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 stroke-[3]" />
                        <span>PEDIR</span>
                      </>
                    )}
                  </button>
                </div>

              </div>
            );
          })}
        </div>

        {filteredPizzas.length === 0 && (
          <div className="brand-card bg-white p-12 text-center rounded-3xl max-w-md mx-auto my-12">
            <h3 className="text-2xl font-brand text-[#0F172A] mb-2">No se encontró esa variedad</h3>
            <p className="text-sm text-[#64748B] mb-5">Probá buscando con otro nombre o limpiando el filtro.</p>
            <button
              onClick={() => { setSearchQuery(''); onSelectCategory('all'); }}
              className="brand-btn bg-[#EC4A13] text-white px-5 py-2.5 rounded-xl font-bold text-sm"
            >
              Ver todo el menú
            </button>
          </div>
        )}

      </div>
    </section>
  );
}
