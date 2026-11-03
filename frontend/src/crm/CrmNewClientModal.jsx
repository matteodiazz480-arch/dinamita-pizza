import React, { useState } from "react";
import { X, Briefcase, ArrowRight } from "lucide-react";

export default function CrmNewClientModal({ isOpen, onClose, onCreateClient }) {
  const [formData, setFormData] = useState({
    clientName: "",
    service: "Publicidad Digital (Meta Ads)",
    responsible: "Mateo Díaz",
    startDate: new Date().toISOString().slice(0, 10),
    renewalDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    feeARS: 190000,
    adBudget: 100000,
    status: "activo",
    contact: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.clientName.trim() || submitting) return;
    setSubmitting(true);
    await onCreateClient({
      ...formData,
      feeARS: Number(formData.feeARS) || 0,
      adBudget: Number(formData.adBudget) || 0,
    });
    setSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm select-none overflow-y-auto">
      <div className="bg-[#141519] border border-white/10 rounded-2xl w-full max-w-lg p-5 sm:p-6 shadow-2xl relative text-white my-auto">
        <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-white/8">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-[#22C55E]" />
            <h3 className="text-base font-black text-white">Nuevo Cliente Activo</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-bold text-gray-300 mb-1">Cliente / Nombre del Negocio *</label>
            <input
              type="text"
              required
              value={formData.clientName}
              onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
              placeholder="Ej. Clínica Dental San Lucas"
              className="w-full bg-[#181a20] border border-white/10 rounded-xl px-3.5 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#16A34A]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-300 mb-1">Servicio Contratado</label>
              <select
                value={formData.service}
                onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                className="w-full bg-[#181a20] border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-[#16A34A]"
              >
                <option value="Publicidad Digital (Meta Ads)">Publicidad Digital (Meta Ads)</option>
                <option value="Planes Comercios y Negocios">Planes Comercios y Negocios</option>
                <option value="Planes NEXO Oficios">Planes NEXO Oficios</option>
                <option value="Planes NEXO Profesionales">Planes NEXO Profesionales</option>
                <option value="Plan Presencia & Contenido">Plan Presencia &amp; Contenido</option>
                <option value="Plan Captación Meta Ads">Plan Captación Meta Ads</option>
                <option value="Plan Crecimiento Integral">Plan Crecimiento Integral</option>
                <option value="Gestión de Redes Sociales">Gestión de Redes Sociales</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-300 mb-1">Responsable</label>
              <input
                type="text"
                value={formData.responsible}
                onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
                placeholder="Mateo Díaz"
                className="w-full bg-[#181a20] border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-[#16A34A]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-300 mb-1">Honorarios Mensuales (ARS) *</label>
              <input
                type="number"
                min="0"
                step="5000"
                required
                value={formData.feeARS}
                onChange={(e) => setFormData({ ...formData, feeARS: e.target.value })}
                placeholder="190000"
                className="w-full bg-[#181a20] border border-white/10 rounded-xl px-3.5 py-2 text-white font-mono focus:outline-none focus:border-[#16A34A]"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-300 mb-1">Inversión Anuncios Pauta (ARS)</label>
              <input
                type="number"
                min="0"
                step="5000"
                value={formData.adBudget}
                onChange={(e) => setFormData({ ...formData, adBudget: e.target.value })}
                placeholder="100000"
                className="w-full bg-[#181a20] border border-white/10 rounded-xl px-3.5 py-2 text-white font-mono focus:outline-none focus:border-[#16A34A]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-300 mb-1">Fecha de Inicio</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full bg-[#181a20] border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-[#16A34A]"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-300 mb-1">Próxima Renovación / Cobro</label>
              <input
                type="date"
                value={formData.renewalDate}
                onChange={(e) => setFormData({ ...formData, renewalDate: e.target.value })}
                className="w-full bg-[#181a20] border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-[#16A34A]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-300 mb-1">Contacto WhatsApp / Teléfono</label>
              <input
                type="tel"
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                placeholder="+54 9 11 ..."
                className="w-full bg-[#181a20] border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-[#16A34A]"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-300 mb-1">Estado</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-[#181a20] border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-[#16A34A]"
              >
                <option value="activo">Activo</option>
                <option value="por_renovar">Por Renovar</option>
                <option value="pausado">Pausado</option>
                <option value="finalizado">Finalizado</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-300 mb-1">Notas operativas / Enlaces</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Campañas activas, enlaces a Drive o carpetas compartidas..."
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
              <span>Guardar Cliente</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
