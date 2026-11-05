import React, { useState } from "react";
import { X, Megaphone, Plus, Trash2, CheckCircle2 } from "lucide-react";

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
    objective: "Mensajes directos a WhatsApp",
    budgetARS: "100000",
    strategy: "",
    status: "activa",
  });

  const [deliverables, setDeliverables] = useState([
    { text: "Diseño de creativos y videos", completed: false },
    { text: "Configuración de segmentación y públicos", completed: false },
    { text: "Redacción de copies y llamados a la acción", completed: false },
    { text: "Lanzamiento de campaña y testeo de métricas", completed: false },
  ]);

  const [newTaskText, setNewTaskText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleClientSelect = (e) => {
    const selectedName = e.target.value;
    const profile = customerProfiles.find(
      (p) => (p.businessName || p.fullName) === selectedName
    );

    if (profile) {
      setFormData((prev) => ({
        ...prev,
        clientName: selectedName,
        budgetARS: profile.adBudget || prev.budgetARS,
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
    if (!formData.title.trim()) {
      alert("Por favor ingresá un título para la campaña.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await onCreateCampaign({
        ...formData,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#141519] border border-white/15 rounded-3xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto text-xs">
        <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#16A34A]/15 text-[#22C55E]">
              <Megaphone className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">
                Nueva Campaña Publicitaria
              </h2>
              <p className="text-[11px] text-gray-400">
                Marketing: Configuración de anuncios, objetivos y entregables.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          <div>
            <label className="text-gray-300 block mb-1 font-semibold">Cliente Asociado</label>
            <div className="flex gap-2">
              <select
                value={formData.clientName}
                onChange={handleClientSelect}
                className="flex-1 px-3 py-2 bg-[#0d0f12] border border-white/10 rounded-xl text-white text-xs cursor-pointer"
              >
                <option value="">Seleccionar cliente registrado o escribir nombre...</option>
                {customerProfiles.map((p) => (
                  <option key={p.id} value={p.businessName || p.fullName}>
                    {p.businessName || p.fullName} ({p.planName || "Cliente"})
                  </option>
                ))}
                {clients.map((c) => (
                  <option key={c.id} value={c.clientName}>
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
                className="w-full mt-2 px-3 py-2 bg-[#0d0f12] border border-white/10 rounded-xl text-white text-xs"
              />
            )}
          </div>

          <div>
            <label className="text-gray-300 block mb-1 font-semibold">Título de la Campaña *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ej: Anuncios WhatsApp - Captación Comercios"
              className="w-full px-3 py-2 bg-[#0d0f12] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-[#16A34A]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-gray-300 block mb-1 font-semibold">Plataforma</label>
              <select
                value={formData.platform}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                className="w-full px-3 py-2 bg-[#0d0f12] border border-white/10 rounded-xl text-white text-xs cursor-pointer"
              >
                <option value="Meta Ads (Instagram & Facebook)">Meta Ads (Instagram & Facebook)</option>
                <option value="Google Ads (Búsqueda / Red)">Google Ads (Búsqueda / Red)</option>
                <option value="TikTok Ads">TikTok Ads</option>
                <option value="Multi-Plataforma">Multi-Plataforma</option>
              </select>
            </div>

            <div>
              <label className="text-gray-300 block mb-1 font-semibold">Presupuesto de Pauta (ARS)</label>
              <input
                type="number"
                value={formData.budgetARS}
                onChange={(e) => setFormData({ ...formData, budgetARS: e.target.value })}
                placeholder="Monto mensual"
                className="w-full px-3 py-2 bg-[#0d0f12] border border-white/10 rounded-xl text-white text-xs font-mono"
              />
            </div>

            <div>
              <label className="text-gray-300 block mb-1 font-semibold">Objetivo de la Campaña</label>
              <input
                type="text"
                value={formData.objective}
                onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                placeholder="Ej: Conversaciones WhatsApp, Formularios, Ventas"
                className="w-full px-3 py-2 bg-[#0d0f12] border border-white/10 rounded-xl text-white text-xs"
              />
            </div>

            <div>
              <label className="text-gray-300 block mb-1 font-semibold">Estado Inicial</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 bg-[#0d0f12] border border-white/10 rounded-xl text-white text-xs cursor-pointer"
              >
                <option value="activa">Activa</option>
                <option value="optimizacion">En Optimización</option>
                <option value="pausada">Pausada</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-gray-300 block mb-1 font-semibold">Estrategia, Segmentación y Copies</label>
            <textarea
              rows={2}
              value={formData.strategy}
              onChange={(e) => setFormData({ ...formData, strategy: e.target.value })}
              placeholder="Detalle del público objetivo, propuesta de valor, intereses y llamados a la acción..."
              className="w-full px-3 py-2 bg-[#0d0f12] border border-white/10 rounded-xl text-white text-xs"
            />
          </div>

          {/* Checklist de Entregables */}
          <div className="border-t border-white/10 pt-3 space-y-2">
            <span className="text-gray-300 block font-semibold">Entregables y Tareas de la Campaña</span>
            <div className="space-y-1.5">
              {deliverables.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-[#0d0f12] rounded-xl border border-white/5">
                  <span className="text-gray-300">{item.text}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTask(idx)}
                    className="text-gray-500 hover:text-red-400 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-1">
              <input
                type="text"
                placeholder="Añadir nueva tarea o entregable..."
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTask();
                  }
                }}
                className="flex-1 px-3 py-1.5 bg-[#0d0f12] border border-white/10 rounded-xl text-white text-xs"
              />
              <button
                type="button"
                onClick={handleAddTask}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/15 text-white rounded-xl font-bold text-xs"
              >
                Añadir
              </button>
            </div>
          </div>

          <div className="border-t border-white/10 pt-4 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold transition-colors cursor-pointer shadow-sm disabled:opacity-50"
            >
              {submitting ? "Guardando..." : "Crear Campaña"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
