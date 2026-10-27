import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Plus, Minus, Send, ShoppingBag, Bike, Store, Banknote, CreditCard } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CartDrawer({ isOpen, onClose, cart, onUpdateQuantity, onRemoveItem }) {
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [deliveryType, setDeliveryType] = useState('delivery');
  const [paymentMethod, setPaymentMethod] = useState('efectivo'); // 'efectivo' | 'transferencia'

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = deliveryType === 'delivery' && subtotal > 0 ? 1500 : 0;
  const total = subtotal + deliveryFee;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(price);
  };

  const handleSendWhatsApp = () => {
    if (cart.length === 0) return;

    let message = `*PIZZERIA DINAMITA - NUEVO PEDIDO*\n\n`;
    message += `*DETALLE:*\n`;
    
    cart.forEach(item => {
      message += `• ${item.quantity}x ${item.name} - ${formatPrice(item.price * item.quantity)}\n`;
    });

    message += `\n*Subtotal:* ${formatPrice(subtotal)}`;
    if (deliveryType === 'delivery') {
      message += `\n*Envío:* ${formatPrice(deliveryFee)}`;
    }
    message += `\n*TOTAL:* ${formatPrice(total)}\n\n`;

    message += `*Modalidad:* ${deliveryType === 'delivery' ? 'Delivery a domicilio' : 'Retiro por el local'}\n`;
    message += `*Forma de pago:* ${paymentMethod === 'efectivo' ? 'Efectivo' : 'Transferencia'}\n`;
    if (deliveryType === 'delivery' && address.trim()) {
      message += `*Dirección:* ${address.trim()}\n`;
    }
    if (notes.trim()) {
      message += `*Aclaraciones:* ${notes.trim()}\n`;
    }

    message += `\n¡Muchas gracias! Aguardo confirmación.`;

    confetti({
      particleCount: 80,
      spread: 80,
      origin: { y: 0.5 },
      colors: ['#EC4A13', '#ACD8F1', '#0F172A']
    });

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/3804322180?text=${encoded}`, '_blank');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-xs"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="fixed top-0 right-0 h-full w-full sm:max-w-md bg-[#F8FAFC] z-50 shadow-2xl flex flex-col border-l-4 border-[#0F172A]"
          >
            {/* Header in Brand Orange */}
            <div className="p-5 bg-[#EC4A13] border-b-4 border-[#0F172A] flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl border-2 border-[#0F172A] p-1 flex items-center justify-center shadow-[2px_2px_0_#0F172A]">
                  <img src="/images/logo.png" alt="Dinamita" className="w-full h-full object-contain" />
                </div>
                <h3 className="font-brand text-xl text-white">TU PEDIDO</h3>
              </div>
              <button
                onClick={onClose}
                className="brand-btn bg-white hover:bg-[#F1F5F9] p-2 rounded-xl text-[#0F172A] cursor-pointer"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <ShoppingBag className="w-16 h-16 text-[#94A3B8] mb-3 stroke-[1.5]" />
                  <h4 className="font-brand text-2xl text-[#0F172A] mb-2">Tu pedido está vacío</h4>
                  <p className="text-sm text-[#64748B] max-w-xs mb-6">
                    Agregá tus pizzas favoritas del menú para continuar con tu pedido.
                  </p>
                  <button
                    onClick={onClose}
                    className="brand-btn bg-[#EC4A13] text-white font-bold px-6 py-2.5 rounded-xl text-sm"
                  >
                    Ver Variedades
                  </button>
                </div>
              ) : (
                cart.map(item => (
                  <div
                    key={item.id}
                    className="brand-card bg-white p-4 rounded-2xl flex items-center gap-3.5"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-contain drop-shadow"
                    />

                    <div className="flex-1 min-w-0">
                      <h4 className="font-brand text-sm text-[#0F172A] truncate">{item.name}</h4>
                      <span className="text-xs font-bold text-[#EC4A13] block">
                        {formatPrice(item.price)}
                      </span>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 rounded-lg bg-[#F1F5F9] border border-[#0F172A] flex items-center justify-center text-xs font-bold hover:bg-[#EC4A13] hover:text-white"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-brand text-sm px-1 text-[#0F172A]">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 rounded-lg bg-[#F1F5F9] border border-[#0F172A] flex items-center justify-center text-xs font-bold hover:bg-[#EC4A13] hover:text-white"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="text-[#94A3B8] hover:text-[#EF4444] p-2 transition-colors cursor-pointer"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Bottom Checkout Controls */}
            {cart.length > 0 && (
              <div className="p-5 bg-white border-t-4 border-[#0F172A] space-y-3.5">
                
                {/* Delivery Type Toggle */}
                <div>
                  <span className="block text-[11px] font-black uppercase text-[#475569] mb-1">
                    Modalidad de entrega
                  </span>
                  <div className="grid grid-cols-2 gap-2 p-1 bg-[#F1F5F9] rounded-xl border-2 border-[#0F172A]">
                    <button
                      type="button"
                      onClick={() => setDeliveryType('delivery')}
                      className={`py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        deliveryType === 'delivery'
                          ? 'bg-[#EC4A13] text-white border border-[#0F172A] shadow-[2px_2px_0_#0F172A]'
                          : 'text-[#64748B]'
                      }`}
                    >
                      <Bike className="w-4 h-4" />
                      <span>Delivery</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeliveryType('takeaway')}
                      className={`py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        deliveryType === 'takeaway'
                          ? 'bg-[#EC4A13] text-white border border-[#0F172A] shadow-[2px_2px_0_#0F172A]'
                          : 'text-[#64748B]'
                      }`}
                    >
                      <Store className="w-4 h-4" />
                      <span>Retiro en Local</span>
                    </button>
                  </div>
                </div>

                {/* Payment Method Toggle: Efectivo o Transferencia */}
                <div>
                  <span className="block text-[11px] font-black uppercase text-[#475569] mb-1">
                    Forma de pago
                  </span>
                  <div className="grid grid-cols-2 gap-2 p-1 bg-[#F1F5F9] rounded-xl border-2 border-[#0F172A]">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('efectivo')}
                      className={`py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        paymentMethod === 'efectivo'
                          ? 'bg-[#0284C7] text-white border border-[#0F172A] shadow-[2px_2px_0_#0F172A]'
                          : 'text-[#64748B]'
                      }`}
                    >
                      <Banknote className="w-4 h-4" />
                      <span>Efectivo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('transferencia')}
                      className={`py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        paymentMethod === 'transferencia'
                          ? 'bg-[#0284C7] text-white border border-[#0F172A] shadow-[2px_2px_0_#0F172A]'
                          : 'text-[#64748B]'
                      }`}
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Transferencia</span>
                    </button>
                  </div>
                </div>

                {/* Address & Notes inputs */}
                {deliveryType === 'delivery' && (
                  <input
                    type="text"
                    placeholder="Dirección de entrega (ej: Av. San Martín 1234, 2B)"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-[#F8FAFC] border-2 border-[#0F172A] rounded-xl font-medium focus:outline-none"
                  />
                )}

                <input
                  type="text"
                  placeholder="Aclaraciones (ej: timbre roto, bien cocida)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-[#F8FAFC] border-2 border-[#0F172A] rounded-xl font-medium focus:outline-none"
                />

                {/* Subtotals & Total */}
                <div className="pt-2 border-t border-[#0F172A]/10 space-y-1 text-xs font-bold text-[#475569]">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  {deliveryType === 'delivery' && (
                    <div className="flex justify-between">
                      <span>Costo de envío:</span>
                      <span>{formatPrice(deliveryFee)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-brand text-[#0F172A] pt-1.5 border-t border-[#0F172A]/15">
                    <span>TOTAL:</span>
                    <span className="text-[#EC4A13] text-xl">{formatPrice(total)}</span>
                  </div>
                </div>

                {/* Send WhatsApp Button */}
                <button
                  onClick={handleSendWhatsApp}
                  className="brand-btn w-full bg-[#25D366] hover:bg-[#20bd5a] text-white py-3.5 rounded-2xl font-black text-base flex items-center justify-center gap-2 cursor-pointer shadow-[4px_4px_0_#0F172A]"
                >
                  <Send className="w-5 h-5 fill-current" />
                  <span>PEDIR POR WHATSAPP</span>
                </button>

              </div>
            )}

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
