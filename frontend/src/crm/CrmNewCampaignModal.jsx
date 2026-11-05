import React, { useState, useEffect } from "react";
import { X, Megaphone, Plus, Trash2, CheckCircle2, DollarSign, Target, Calendar } from "lucide-react";

const PLATFORMS = [
  "Meta Ads (Instagram & Facebook)",
  "Instagram Ads",
  "Facebook Ads",
  "Google Ads (Búsqueda & Maps)",
  "TikTok Ads",
  "LinkedIn Ads",
  "Email Marketing",
  "Otra",
];

const OBJECTIVES = [
  "Consultas directas a WhatsApp",
  "Generación de Clientes Potenciales (Formularios)",
  "Ventas en Tienda Online",
  "Tráfico Web Local",
  "Reconocimiento de Marca",
];

export default function CrmNewCampaignModal({
  isOpen,
  onClose,
  onCreateCampaign,
  customerProfiles = [],
  clients = [],
}) {
  const [formData, setFormData] = useState({
    clientName: "",
    title: "",
    platform: "Meta Ads (Instagram & Facebook)",
    objective: "Consultas directas a WhatsApp",
    clientBudget: "250000",
    adSpend: "150000",
    agencyFee: "100000",
    extraExpenses: "0",
    clientPaysAdDirect: true,
    startDate: new Date().toISOString().slice(0, 10),
    endDate: "",
    status: "activa",
    results: "",
    strategy: "",
    notes: "",
  });

  const [deliverables, setDeliverables] = useState([
    { text: "Diseño de creativos y videos", completed: false },
    { text: "Configuración de segmentación y públicos", completed: false },
    { text: "Redacción de copies y llamados a la acción", completed: false },
    { text: "Lanzamiento de campaña y optimización", completed: false },
  ]);

  const [newTaskText, setNewTaskText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Cálculos dinámicos
  const adSpend = Number(formData.adSpend) || 0;
  const agencyFee = Number(formData.agencyFee) || 0;
  const extraExpenses = Number(formData.extraExpenses) || 0;
  const totalBilled = agencyFee + (formData.clientPaysAdDirect ? 0 : adSpend) + extraExpenses;
  const netProfit = Math.max(0, agencyFee - extraExpenses);

  if (!isOpen) return null;

  const handleClientSelect = (e) => {
    const selectedName = e.target.value;
    const profile = customerProfiles.find(
      (p) => (p.businessName || p.fullName) === selectedName
    );

    if (profile) {
      const budget = Number(profile.adBudget) || 150000;
      const fee = Number(profile.planPrice) || 100000;
      setFormData((prev) => ({
        ...prev,
        clientName: selectedName,
        adSpend: String(budget),
        agencyFee: String(fee),
        clientBudget: String(budget + fee),
        strategy: profile.adStrategy || prev.strategy,
        title: `Campaña ${profile.businessName || profile.fullName} - ${new Date().toLocaleDateString("es-AR", { month: "short", year: "numeric" })}`,
      }));
    } else {
      setFormData((prev) => ({ ...prev, clientName: selectedName }));
    }
  };

  const handleAddTask = () => {
    if (!newTaskText.trim()) return;
    setDeliverables([...deliverables, { text: newTaskText.trim(), completed: false }]);
    setNewTaskText("");
  };

  const handleRemoveTask = (idx) => {
    setDeliverables(deliverables.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setSubmitting(true);
    try {
      const res = await onCreateCampaign({
        ...formData,
        adSpend,
        agencyFee,
        extraExpenses,
        totalBilled,
        netProfit,
        budgetARS: adSpend, // compatibilidad
        deliverables,
      });
      if (res !== false) {
        onClose();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto select-none">
      <div className="bg-[#141519] border border-white/10 rounded-2xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-y-auto no-scrollbar my-auto text-xs">
        {/* Cabecera */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#141519] z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#16A34A]/15 border border-[#16A34A]/30 flex items-center justify-center text-[#22C55E]">
              <Megaphone className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-white">
                Nueva Campaña de Cliente
              </h2>
              <p className="text-[11px] text-gray-400">
                Gestión de pauta publicitaria, honorarios y rentabilidad neta
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
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          {/* Cliente vinculado */}
          <div>
            <label className="block font-bold text-gray-300 mb-1">
              Cliente Asignado
            </label>
            <div className="flex gap-2">
              <select
                value={formData.clientName}
                onChange={handleClientSelect}
                className="flex-1 bg-[#181a20] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#16A34A] transition-colors"
              >
                <option value="">-- Seleccionar de clientes / fichas registradas --</option>
                {customerProfiles.map((p) => {
                  const name = p.businessName || p.fullName;
                  return (
                    <option key={p.id || p.refId} value={name}>
                      {name} {p.planName ? `(${p.planName})` : ""}
                    </option>
                  );
                })}
                {clients.map((c) => (
                  <option key={c.id || c.refId} value={c.clientName}>
                    {c.clientName} (Cliente Activo)
                  </option>
                ))}
              </select>
            </div>
            {!formData.clientName && (
              <input
                type="text"
                placeholder="O escribí el nombre del cliente directamente..."
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                className="w-full mt-2 bg-[#181a20] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#16A34A]"
              />
            )}
          </div>

          {/* Nombre de la campaña */}
          <div>
            <label className="block font-bold text-gray-300 mb-1">
              Nombre de la Campaña *
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Lanzamiento Anuncios Meta - Mensajes WhatsApp"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-[#181a20] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#16A34A]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-bold text-gray-300 mb-1">
                Plataforma
              </label>
              <select
                value={formData.platform}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                className="w-full bg-[#181a20] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#16A34A]"
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
                className="w-full bg-[#181a20] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#16A34A]"
              >
                {OBJECTIVES.map((obj) => (
                  <option key={obj} value={obj}>
                    {obj}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* CONTROL FINANCIERO DIFERENCIADO (Requisito Clave) */}
          <div className="p-4 rounded-xl bg-[#101115] border border-white/8 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/6">
              <span className="text-[11px] font-black uppercase tracking-wider text-gray-300">
                Desglose Financiero de la Campaña
              </span>
              <span className="text-[10px] text-gray-400">
                Separación clara: Pauta vs. Honorarios
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-gray-400 font-semibold mb-1">
                  1. Inversión en Pauta (ARS)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  placeholder="Va a Meta/Google"
                  value={formData.adSpend}
                  onChange={(e) => setFormData({ ...formData, adSpend: e.target.value })}
                  className="w-full bg-[#181a20] border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-[#16A34A]"
                />
                <span className="text-[10px] text-gray-500 block mt-0.5">Destinado a anuncios</span>
              </div>

              <div>
                <label className="block text-gray-400 font-semibold mb-1">
                  2. Honorarios Agencia (ARS)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  placeholder="Cobrado por servicio"
                  value={formData.agencyFee}
                  onChange={(e) => setFormData({ ...formData, agencyFee: e.target.value })}
                  className="w-full bg-[#181a20] border border-white/10 rounded-xl px-3 py-2 text-[#22C55E] font-mono font-bold focus:outline-none focus:border-[#16A34A]"
                />
                <span className="text-[10px] text-gray-500 block mt-0.5">Ingreso de NEXO</span>
              </div>

              <div>
                <label className="block text-gray-400 font-semibold mb-1">
                  3. Gastos Extras (ARS)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  placeholder="0"
                  value={formData.extraExpenses}
                  onChange={(e) => setFormData({ ...formData, extraExpenses: e.target.value })}
                  className="w-full bg-[#181a20] border border-white/10 rounded-xl px-3 py-2 text-amber-400 font-mono focus:outline-none focus:border-[#16A34A]"
                />
                <span className="text-[10px] text-gray-500 block mt-0.5">Diseños, software, etc.</span>
              </div>
            </div>

            {/* Modalidad de pago de pauta */}
            <div className="pt-2 flex items-center justify-between text-[11px] text-gray-300">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.clientPaysAdDirect}
                  onChange={(e) => setFormData({ ...formData, clientPaysAdDirect: e.target.checked })}
                  className="rounded border-white/20 bg-[#181a20] text-[#16A34A] focus:ring-0"
                />
                <span>El cliente paga la pauta directo con su tarjeta en Meta/Google</span>
              </label>
            </div>

            {/* Resumen de ganancia neta */}
            <div className="pt-2 border-t border-white/6 flex items-center justify-between text-xs">
              <div>
                <span className="text-gray-400">Total cobrado al cliente: </span>
                <span className="font-mono font-bold text-white">
                  ${totalBilled.toLocaleString("es-AR")}
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-[#16A34A]/15 border border-[#16A34A]/30 px-2.5 py-1 rounded-lg">
                <span className="text-gray-300">Ganancia Neta Empresa: </span>
                <span className="font-mono font-black text-[#22C55E]">
                  ${netProfit.toLocaleString("es-AR")}
                </span>
              </div>
            </div>
          </div>

          {/* Fechas y Estado */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-gray-300 mb-1">
                Fecha Inicio
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full bg-[#181a20] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#16A34A]"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-300 mb-1">
                Fecha Fin
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full bg-[#181a20] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#16A34A]"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-300 mb-1">
                Estado
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-[#181a20] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#16A34A]"
              >
                <option value="activa">Activa</option>
                <option value="optimizacion">En Optimización</option>
                <option value="pausada">Pausada</option>
                <option value="finalizada">Finalizada</option>
              </select>
            </div>
          </div>

          {/* Checklist de Entregables */}
          <div>
            <label className="block font-bold text-gray-300 mb-1.5">
              Entregables y Tareas de Campaña
            </label>
            <div className="space-y-1.5 mb-2">
              {deliverables.map((d, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-xl bg-[#181a20] border border-white/6"
                >
                  <span className="text-white text-xs">{d.text}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTask(idx)}
                    className="p-1 text-gray-400 hover:text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nueva tarea (ej: Subir reels, revisión de métricas)..."
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTask();
                  }
                }}
                className="flex-1 bg-[#181a20] border border-white/10 rounded-xl px-3 py-1.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#16A34A]"
              />
              <button
                type="button"
                onClick={handleAddTask}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition-colors cursor-pointer"
              >
                Agregar
              </button>
            </div>
          </div>

          {/* Observaciones y Rendimiento */}
          <div>
            <label className="block font-bold text-gray-300 mb-1">
              Observaciones y Resultados
            </label>
            <textarea
              rows="2"
              placeholder="Resultados obtenidos (CPL, conversiones), feedback del cliente..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full bg-[#181a20] border border-white/10 rounded-xl p-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#16A34A] resize-none"
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
              disabled={submitting || !formData.title.trim()}
              className="px-5 py-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white font-black transition-[background-color,transform] active:scale-98 disabled:opacity-40 cursor-pointer shadow-sm flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{submitting ? "Guardando..." : "Guardar Campaña de Cliente"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
