import React, { useState } from "react";
import { X, UserPlus, ArrowRight } from "lucide-react";

export default function CrmNewLeadModal({ isOpen, onClose, onCreateLead }) {
  const [formData, setFormData] = useState({
    fullName: "",
    businessName: "",
    phone: "",
    email: "",
    service: "Reunión Gratuita 20 min",
    meetingDate: "",
    meetingTime: "15:30",
    message: "",
    notes: "",
    status: "nuevo",
  });
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName || submitting) return;
    setSubmitting(true);
    await onCreateLead(formData);
    setSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
      <div className="bg-[#141519] border border-white/10 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative text-white">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/8">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-[#BCE838]" />
            <h3 className="text-base font-black text-white">Registrar Nuevo Contacto / Lead</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-bold text-gray-300 mb-1">Nombre y Apellido *</label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="Ej. Martín Pérez"
              className="w-full bg-[#181a20] border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-[#BCE838]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-300 mb-1">WhatsApp / Teléfono *</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+54 9 11 ..."
                className="w-full bg-[#181a20] border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-[#BCE838]"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-300 mb-1">Negocio / Rubro</label>
              <input
                type="text"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                placeholder="Ej. Inmobiliaria, Taller..."
                className="w-full bg-[#181a20] border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-[#BCE838]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-300 mb-1">Correo Electrónico</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="cliente@ejemplo.com"
                className="w-full bg-[#181a20] border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-[#BCE838]"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-300 mb-1">Tipo de Servicio</label>
              <select
                value={formData.service}
                onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                className="w-full bg-[#181a20] border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-[#BCE838]"
              >
                <option value="Reunión Gratuita 20 min">Reunión Gratuita 20 min</option>
                <option value="Publicidad Digital (Meta Ads)">Publicidad Digital (Meta Ads)</option>
                <option value="Planes Comercios y Negocios">Planes Comercios y Negocios</option>
                <option value="Planes NEXO Oficios">Planes NEXO Oficios</option>
                <option value="Planes NEXO Profesionales">Planes NEXO Profesionales</option>
                <option value="Asesoramiento Gratuito General">Asesoramiento Gratuito General</option>
              </select>
            </div>
          </div>

          {formData.service === "Reunión Gratuita 20 min" && (
            <div className="grid grid-cols-2 gap-3 p-3 bg-[#181a20] border border-[#BCE838]/20 rounded-xl">
              <div>
                <label className="block font-bold text-[#BCE838] mb-1">Fecha de Reunión</label>
                <input
                  type="date"
                  value={formData.meetingDate}
                  onChange={(e) => setFormData({ ...formData, meetingDate: e.target.value })}
                  className="w-full bg-[#141519] border border-white/10 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-[#BCE838]"
                />
              </div>
              <div>
                <label className="block font-bold text-[#BCE838] mb-1">Horario (hs)</label>
                <input
                  type="text"
                  value={formData.meetingTime}
                  onChange={(e) => setFormData({ ...formData, meetingTime: e.target.value })}
                  placeholder="15:30"
                  className="w-full bg-[#141519] border border-white/10 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-[#BCE838]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block font-bold text-gray-300 mb-1">Notas internas iniciales</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Detalles de la conversación..."
              className="w-full bg-[#181a20] border border-white/10 rounded-xl px-3.5 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#BCE838]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#BCE838] hover:bg-[#add92b] text-[#111111] font-black transition-colors"
            >
              <span>Guardar en CRM</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
