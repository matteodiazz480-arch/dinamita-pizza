import React, { useState } from "react";
import { X, Megaphone, Plus, Link, Calendar, DollarSign, Target, CheckCircle2 } from "lucide-react";

const PLATFORMS = [
  "Meta Ads (Instagram & Facebook)",
  "Instagram Ads",
  "Facebook Ads",
  "Google Ads (Búsqueda)",
  "TikTok Ads",
  "LinkedIn Ads",
  "Email Marketing",
  "Otra",
];

const OBJECTIVES = [
  "Captación de Clientes (WhatsApp)",
  "Generación de Clientes Potenciales (Formularios)",
  "Tráfico a Landing Page",
  "Reconocimiento de Marca / Alcance",
  "Venta Directa de Servicios",
];

export default function CrmNewCompanyCampaignModal({
  isOpen,
  onClose,
  onCreateCampaign,
}) {
  const [formData, setFormData] = useState({
    name: "",
    platform: "Meta Ads (Instagram & Facebook)",
    objective: "Captación de Clientes (WhatsApp)",
    allocatedBudget: "120000",
    spentAmount: "0",
    startDate: new Date().toISOString().slice(0, 10),
    endDate: "",
    leadsAcquired: "0",
    clicks: "0",
    impressions: "0",
    status: "activa",
    links: "",
    notes: "",
  });

  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setSubmitting(true);
    try {
      const spent = Number(formData.spentAmount) || 0;
      const leads = Number(formData.leadsAcquired) || 0;
      const cpl = leads > 0 ? Math.round(spent / leads) : 0;

      await onCreateCampaign({
        name: formData.name.trim(),
        platform: formData.platform,
        objective: formData.objective,
        allocatedBudget: Number(formData.allocatedBudget) || 0,
        spentAmount: spent,
        startDate: formData.startDate,
        endDate: formData.endDate || "",
        leadsAcquired: leads,
        clicks: Number(formData.clicks) || 0,
        impressions: Number(formData.impressions) || 0,
        cpl,
        status: formData.status,
        links: formData.links.trim(),
        notes: formData.notes.trim(),
      });

      onClose();
    } catch (err) {
      console.error("Error al crear campaña propia:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm select-none animate-in fade-in duration-150">
      <div className="bg-[#141519] border border-white/10 rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto no-scrollbar shadow-2xl flex flex-col">
        {/* Cabecera */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#141519] z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Megaphone className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-white tracking-tight">
                Nueva Campaña Propia (NEXO)
              </h2>
              <p className="text-[11px] text-gray-400">
                Inversión publicitaria para captación de clientes de nuestra empresa
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-gray-300 mb-1">
              Nombre de la Campaña *
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Captación Meta Ads - Dueños de Negocio Noviembre"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-[#181a20] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#16A34A] transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-bold text-gray-300 mb-1">
                Plataforma Publicitaria
              </label>
              <select
                value={formData.platform}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                className="w-full bg-[#181a20] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#16A34A] transition-colors"
              >
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-300 mb-1">
                Objetivo
              </label>
              <select
                value={formData.objective}
                onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                className="w-full bg-[#181a20] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#16A34A] transition-colors"
              >
                {OBJECTIVES.map((obj) => (
                  <option key={obj} value={obj}>
                    {obj}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Presupuesto y Gasto */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-3.5 rounded-xl bg-[#101115] border border-white/6">
            <div>
              <label className="block font-bold text-gray-300 mb-1">
                Presupuesto Asignado (ARS)
              </label>
              <input
                type="number"
                min="0"
                step="1000"
                value={formData.allocatedBudget}
                onChange={(e) => setFormData({ ...formData, allocatedBudget: e.target.value })}
                className="w-full bg-[#181a20] border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-[#16A34A] transition-colors"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-300 mb-1">
                Gasto Invertido Acumulado (ARS)
              </label>
              <input
                type="number"
                min="0"
                step="1000"
                value={formData.spentAmount}
                onChange={(e) => setFormData({ ...formData, spentAmount: e.target.value })}
                className="w-full bg-[#181a20] border border-white/10 rounded-xl px-3 py-2 text-[#22C55E] font-mono font-bold focus:outline-none focus:border-[#16A34A] transition-colors"
              />
            </div>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-bold text-gray-300 mb-1">
                Fecha de Inicio
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full bg-[#181a20] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#16A34A] transition-colors"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-300 mb-1">
                Fecha de Finalización (Opcional)
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full bg-[#181a20] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#16A34A] transition-colors"
              />
            </div>
          </div>

          {/* Rendimiento */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-gray-300 mb-1">
                Leads / Consultas Captadas
              </label>
              <input
                type="number"
                min="0"
                value={formData.leadsAcquired}
                onChange={(e) => setFormData({ ...formData, leadsAcquired: e.target.value })}
                className="w-full bg-[#181a20] border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-[#16A34A] transition-colors"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-300 mb-1">
                Clics en Anuncios
              </label>
              <input
                type="number"
                min="0"
                value={formData.clicks}
                onChange={(e) => setFormData({ ...formData, clicks: e.target.value })}
                className="w-full bg-[#181a20] border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-[#16A34A] transition-colors"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-300 mb-1">
                Estado
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-[#181a20] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#16A34A] transition-colors"
              >
                <option value="activa">Activa</option>
                <option value="optimizacion">En Optimización</option>
                <option value="pausada">Pausada</option>
                <option value="finalizada">Finalizada</option>
              </select>
            </div>
          </div>

          {/* Enlaces y Observaciones */}
          <div>
            <label className="block font-bold text-gray-300 mb-1">
              Enlaces (Anuncio, Creativo o Business Manager)
            </label>
            <input
              type="text"
              placeholder="https://..."
              value={formData.links}
              onChange={(e) => setFormData({ ...formData, links: e.target.value })}
              className="w-full bg-[#181a20] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#16A34A] transition-colors"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-300 mb-1">
              Observaciones y Rendimiento
            </label>
            <textarea
              rows="2"
              placeholder="Detalles sobre creativos ganadores, audiencias probadas o resultados..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full bg-[#181a20] border border-white/10 rounded-xl p-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#16A34A] transition-colors resize-none"
            />
          </div>

          {/* Botones de acción */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting || !formData.name.trim()}
              className="px-5 py-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white font-black transition-[background-color,transform] active:scale-98 disabled:opacity-40 cursor-pointer shadow-sm flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{submitting ? "Guardando..." : "Registrar Campaña Propia"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
