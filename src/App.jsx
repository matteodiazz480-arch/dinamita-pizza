import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import CheckeredDivider from './components/CheckeredDivider';
import MenuSection from './components/MenuSection';
import InfoSection from './components/InfoSection';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import { PIZZA_CATEGORIES } from './data/pizzas';
import { ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function App() {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');

  const currentCatObj = PIZZA_CATEGORIES.find((c) => c.id === activeCategory) || PIZZA_CATEGORIES[0];
  const currentMenuBg = currentCatObj.bgColor;

  // Cart Handlers
  const handleAddToCart = (pizza) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === pizza.id);
      if (existing) {
        return prevCart.map((item) =>
          item.id === pizza.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...pizza, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (id, newQty) => {
    if (newQty <= 0) {
      handleRemoveItem(id);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) => (item.id === id ? { ...item, quantity: newQty } : item))
    );
  };

  const handleRemoveItem = (id) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF7] relative selection:bg-[#EC4A13] selection:text-white">
      
      {/* Top Navigation */}
      <Navbar
        cartCount={totalItems}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Main Content with Checkered Transitions at Every Stage */}
      <main className="flex-1">
        {/* Etapa 1: Hero */}
        <Hero />

        {/* Transición Damero: Hero (#FFFDF7) -> Carta (currentMenuBg) */}
        <CheckeredDivider fromColor="#FFFDF7" toColor={currentMenuBg} />

        {/* Etapa 2: Apartado de la Carta (Cambia de color por categoría y en tarjetas) */}
        <MenuSection
          onAddToCart={handleAddToCart}
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
        />

        {/* Transición Damero: Carta (currentMenuBg) -> Horarios & WhatsApp (#D8EEFB) */}
        <CheckeredDivider fromColor={currentMenuBg} toColor="#D8EEFB" />

        {/* Etapa 3: Horarios & WhatsApp */}
        <InfoSection />

        {/* Transición Damero: Horarios & WhatsApp (#D8EEFB) -> Footer (#0F172A) */}
        <CheckeredDivider fromColor="#D8EEFB" toColor="#0F172A" />
      </main>

      {/* Etapa 4: Footer */}
      <Footer />

      {/* Slide-out Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
      />

      {/* Floating Sticky Cart Button */}
      <AnimatePresence>
        {totalItems > 0 && !isCartOpen && (
          <motion.button
            initial={{ scale: 0, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0, y: 30 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsCartOpen(true)}
            className="brand-btn fixed bottom-6 right-6 z-40 bg-[#EC4A13] hover:bg-[#d83f0d] text-white px-5 py-3.5 rounded-full font-black text-base flex items-center gap-3 shadow-[5px_5px_0_#0F172A] cursor-pointer"
          >
            <div className="relative">
              <ShoppingBag className="w-6 h-6" />
              <span className="absolute -top-2 -right-2 bg-white text-[#EC4A13] text-xs font-black w-5 h-5 rounded-full border border-[#0F172A] flex items-center justify-center">
                {totalItems}
              </span>
            </div>
            <span>VER PEDIDO</span>
          </motion.button>
        )}
      </AnimatePresence>

    </div>
  );
}
