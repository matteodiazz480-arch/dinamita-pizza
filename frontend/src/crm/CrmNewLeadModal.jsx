import React, { useState } from "react";
import { X, UserPlus, ArrowRight } from "lucide-react";

const STAGES = [
  { value: "nuevo", label: "Nuevo" },
  { value: "contactado", label: "Contactado" },
  { value: "reunion_agendada", label: "Reunión Agendada" },
  { value: "propuesta_enviada", label: "Propuesta Enviada" },
  { value: "negociacion", label: "En Negociación" },
  { value: "ganado", label: "Ganado (Cliente)" },
  { value: "perdido", label: "Perdido" },
];

const RUBROS = [
  "Comercios y Locales",
  "Oficios y Servicios Técnicos",
  "Profesionales de la Salud",
  "Servicios Profesionales & Legales",
  "Gastronomía y Bares",
  "Inmobiliarias & Construcción",
  "Estética y Bienestar",
  "Otro rubro",
];

export default function CrmNewLeadModal({ isOpen, onClose, onCreateLead }) {
  const [formData, setFormData] = useState({
    fullName: "",
    businessName: "",
    rubro: "Comercios y Locales",
    phone: "",
    email: "",
    socials: "",
    service: "Publicidad Digital (Meta Ads)",
    origin: "Carga Manual",
    meetingDate: "",
    meetingTime: "15:30",
    status: "nuevo",
    priority: "media",
    responsible: "Mateo Díaz",
    nextContactDate: "",
    adBudget: 80000,
    feeARS: 180000,
    probability: 50,
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName.trim() || submitting) return;
    setSubmitting(true);
    const fee = Number(formData.feeARS) || 0;
    const prob = Number(formData.probability) || 50;
    await onCreateLead({
      ...formData,
      feeARS: fee,
      adBudget: Number(formData.adBudget) || 0,
      probability: prob,
      estimatedRevenue: Math.round(fee * (prob / 100)),
    });
    setSubmitting(false);
    onClose();
  };

  const calculatedEstimate = Math.round(
    (Number(formData.feeARS) || 0) * ((Number(formData.probability) || 0) / 100)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm select-none overflow-y-auto">
      <div className="bg-[#141519] border border-white/10 rounded-2xl w-full max-w-xl p-5 sm:p-6 shadow-2xl relative text-white my-auto">
        <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-white/8">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-[#22C55E]" />
            <h3 className="text-base font-black text-white">Nueva Oportunidad Comercial (Lead)</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs max-h-[75vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-300 mb-1">Nombre y Apellido *</label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Ej. Martín Pérez"
                className="w-full bg-[#181a20] border border-white/10 rounded-xl px-3.5 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#16A34A]"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-300 mb-1">Nombre del Negocio</label>
              <input
                type="text"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                placeholder="Ej. Inmobiliaria Pérez"
                className="w-full bg-[#181a20] border border-white/10 rounded-xl px-3.5 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#16A34A]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-gray-300 mb-1">Rubro</label>
              <select
                value={formData.rubro}
                onChange={(e) => setFormData({ ...formData, rubro: e.target.value })}
                className="w-full bg-[#181a20] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#16A34A]"
              >
                {RUBROS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-gray-300 mb-1">WhatsApp / Teléfono *</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+54 9 11 ..."
                className="w-full bg-[#181a20] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#16A34A]"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-300 mb-1">Instagram / Redes</label>
              <input
                type="text"
                value={formData.socials}
                onChange={(e) => setFormData({ ...formData, socials: e.target.value })}
                placeholder="@usuario_instagram"
                className="w-full bg-[#181a20] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#16A34A]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-300 mb-1">Servicio de Interés</label>
              <select
                value={formData.service}
                onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                className="w-full bg-[#181a20] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#16A34A]"
              >
                <option value="Publicidad Digital (Meta Ads)">Publicidad Digital (Meta Ads)</option>
                <option value="Planes Comercios y Negocios">Planes Comercios y Negocios</option>
                <option value="Planes NEXO Oficios">Planes NEXO Oficios</option>
                <option value="Planes NEXO Profesionales">Planes NEXO Profesionales</option>
                <option value="Plan Presencia & Contenido">Plan Presencia &amp; Contenido</option>
                <option value="Plan Captación Meta Ads">Plan Captación Meta Ads</option>
                <option value="Plan Crecimiento Integral">Plan Crecimiento Integral</option>
                <option value="Reunión Gratuita 20 min">Reunión Gratuita 20 min</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-gray-300 mb-1">Origen del Lead</label>
              <select
                value={formData.origin}
                onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                className="w-full bg-[#181a20] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#16A34A]"
              >
                <option value="Carga Manual">Carga Manual</option>
                <option value="Formulario Web">Formulario Web</option>
                <option value="Reunión 20 min Web">Reunión 20 min Web</option>
                <option value="WhatsApp Directo">WhatsApp Directo</option>
                <option value="Recomendación / Referido">Recomendación / Referido</option>
                <option value="Prospección / Redes">Prospección / Redes</option>
              </select>
            </div>
          </div>

          {/* Etapa comercial, Prioridad y Responsable */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-gray-300 mb-1">Etapa Comercial</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-[#181a20] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#16A34A]"
              >
                {STAGES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-gray-300 mb-1">Prioridad</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full bg-[#181a20] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#16A34A]"
              >
                <option value="alta">Alta</option>
                <option value="media">Media</option>
                <option value="baja">Baja</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-gray-300 mb-1">Próximo Contacto</label>
              <input
                type="date"
                value={formData.nextContactDate}
                onChange={(e) => setFormData({ ...formData, nextContactDate: e.target.value })}
                className="w-full bg-[#181a20] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#16A34A]"
              />
            </div>
          </div>

          {/* Finanzas comerciales: Honorarios, Probabilidad e Ingreso estimado */}
          <div className="p-3 bg-[#181a20] border border-[#16A34A]/30 rounded-xl space-y-2.5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block font-bold text-[#22C55E] mb-1">Honorarios ARS</label>
                <input
                  type="number"
                  min="0"
                  step="5000"
                  value={formData.feeARS}
                  onChange={(e) => setFormData({ ...formData, feeARS: e.target.value })}
                  placeholder="180000"
                  className="w-full bg-[#141519] border border-white/10 rounded-lg px-2.5 py-1.5 text-white font-mono focus:outline-none focus:border-[#16A34A]"
                />
              </div>
              <div>
                <label className="block font-bold text-[#22C55E] mb-1">Probabilidad %</label>
                <select
                  value={formData.probability}
                  onChange={(e) => setFormData({ ...formData, probability: e.target.value })}
                  className="w-full bg-[#141519] border border-white/10 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-[#16A34A]"
                >
                  <option value="20">20% - Inicial</option>
                  <option value="40">40% - Contactado</option>
                  <option value="60">60% - Reunión hecha</option>
                  <option value="80">80% - Negociación</option>
                  <option value="100">100% - Ganado</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-gray-400 mb-1">Ingreso Estimado</label>
                <div className="bg-[#141519] border border-white/5 rounded-lg px-2.5 py-1.5 text-white font-mono font-bold text-xs">
                  ${calculatedEstimate.toLocaleString("es-AR")}
                </div>
              </div>
            </div>
          </div>

          {formData.service === "Reunión Gratuita 20 min" && (
            <div className="grid grid-cols-2 gap-3 p-3 bg-[#181a20] border border-[#16A34A]/30 rounded-xl">
              <div>
                <label className="block font-bold text-[#22C55E] mb-1">Fecha de Reunión</label>
                <input
                  type="date"
                  value={formData.meetingDate}
                  onChange={(e) => setFormData({ ...formData, meetingDate: e.target.value })}
                  className="w-full bg-[#141519] border border-white/10 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-[#16A34A]"
                />
              </div>
              <div>
                <label className="block font-bold text-[#22C55E] mb-1">Horario (hs)</label>
                <input
                  type="text"
                  value={formData.meetingTime}
                  onChange={(e) => setFormData({ ...formData, meetingTime: e.target.value })}
                  placeholder="15:30"
                  className="w-full bg-[#141519] border border-white/10 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-[#16A34A]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block font-bold text-gray-300 mb-1">Observaciones / Seguimiento</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Detalles de la conversación, objeciones, requisitos..."
              className="w-full bg-[#181a20] border border-white/10 rounded-xl px-3.5 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#16A34A]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white font-black transition-colors cursor-pointer"
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
