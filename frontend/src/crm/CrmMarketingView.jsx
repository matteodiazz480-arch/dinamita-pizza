import React, { useState, useMemo } from "react";
import {
  Search,
  Plus,
  Megaphone,
  TrendingUp,
  Target,
  DollarSign,
  Calendar,
  CheckSquare,
  Square,
  Edit2,
  Trash2,
  ExternalLink,
  Layers,
  Building,
  User,
  X,
  Save,
  CheckCircle2,
} from "lucide-react";

const STATUS_CONFIG = {
  activa: { label: "Activa", badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
  optimizacion: { label: "En Optimización", badge: "bg-blue-500/15 text-blue-300 border-blue-500/30" },
  pausada: { label: "Pausada", badge: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
  finalizada: { label: "Finalizada", badge: "bg-gray-500/15 text-gray-400 border-gray-500/30" },
};

export default function CrmMarketingView({
  campaigns = [],
  customerProfiles = [],
  clients = [],
  onUpdateCampaign,
  onDeleteCampaign,
  onOpenNewCampaign,
  onViewCustomerDetail,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [selectedClientDetail, setSelectedClientDetail] = useState(null);

  // Filtrado de campañas
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((c) => {
      const q = searchTerm.toLowerCase().trim();
      const matchSearch =
        !q ||
        (c.title && c.title.toLowerCase().includes(q)) ||
        (c.clientName && c.clientName.toLowerCase().includes(q)) ||
        (c.platform && c.platform.toLowerCase().includes(q)) ||
        (c.objective && c.objective.toLowerCase().includes(q));

      const matchStatus = statusFilter === "all" || c.status === statusFilter;
      const matchPlatform =
        platformFilter === "all" ||
        (c.platform && c.platform.toLowerCase().includes(platformFilter.toLowerCase()));

      return matchSearch && matchStatus && matchPlatform;
    });
  }, [campaigns, searchTerm, statusFilter, platformFilter]);

  // Métricas
  const activeCount = campaigns.filter((c) => c.status === "activa").length;
  const optimCount = campaigns.filter((c) => c.status === "optimizacion").length;
  const pausedCount = campaigns.filter((c) => c.status === "pausada").length;
  const totalBudget = campaigns
    .filter((c) => c.status === "activa" || c.status === "optimizacion")
    .reduce((acc, c) => acc + (Number(c.budgetARS) || 0), 0);

  const handleToggleTask = async (campaign, taskIndex) => {
    const deliverables = Array.isArray(campaign.deliverables) ? [...campaign.deliverables] : [];
    if (deliverables[taskIndex]) {
      deliverables[taskIndex].completed = !deliverables[taskIndex].completed;
      await onUpdateCampaign(campaign.id, { deliverables });
    }
  };

  const handleStatusChange = async (campaignId, newStatus) => {
    await onUpdateCampaign(campaignId, { status: newStatus });
  };

  const handleShowClientContext = (clientName) => {
    const profile = customerProfiles.find(
      (p) =>
        (p.fullName && p.fullName.toLowerCase() === (clientName || "").toLowerCase()) ||
        (p.businessName && p.businessName.toLowerCase() === (clientName || "").toLowerCase())
    );
    if (profile) {
      setSelectedClientDetail(profile);
    } else {
      const basicClient = clients.find(
        (c) => c.clientName && c.clientName.toLowerCase() === (clientName || "").toLowerCase()
      );
      if (basicClient) {
        setSelectedClientDetail({
          fullName: basicClient.clientName,
          businessName: basicClient.clientName,
          planName: basicClient.service,
          planPrice: basicClient.feeARS,
          adBudget: basicClient.adBudget,
          phone: basicClient.contact,
          observations: basicClient.notes,
        });
      } else {
        alert("No se encontró ficha registrada para este cliente.");
      }
    }
  };

  return (
    <div className="space-y-5">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Marketing &amp; Campañas
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Gestión estratégica de anuncios, plataformas, objetivos y entregables.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenNewCampaign}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold transition-all duration-150 cursor-pointer shadow-sm active:scale-98"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Nueva Campaña</span>
        </button>
      </div>

      {/* Métricas del Área de Marketing */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#141519] border border-emerald-500/20 rounded-2xl p-4">
          <span className="text-[11px] font-bold text-emerald-400 block uppercase tracking-wider">
            Campañas Activas
          </span>
          <span className="text-2xl font-black text-[#22C55E] mt-1 block">
            {activeCount}
          </span>
        </div>

        <div className="bg-[#141519] border border-blue-500/20 rounded-2xl p-4">
          <span className="text-[11px] font-bold text-blue-400 block uppercase tracking-wider">
            En Optimización
          </span>
          <span className="text-2xl font-black text-blue-400 mt-1 block">
            {optimCount}
          </span>
        </div>

        <div className="bg-[#141519] border border-amber-500/20 rounded-2xl p-4">
          <span className="text-[11px] font-bold text-amber-300 block uppercase tracking-wider">
            Pausadas / Pendientes
          </span>
          <span className="text-2xl font-black text-amber-300 mt-1 block">
            {pausedCount}
          </span>
        </div>

        <div className="bg-[#141519] border border-white/10 rounded-2xl p-4">
          <span className="text-[11px] font-bold text-gray-400 block uppercase tracking-wider">
            Pauta en Gestión (ARS)
          </span>
          <span className="text-2xl font-black text-white font-mono mt-1 block">
            ${totalBudget.toLocaleString("es-AR")}
          </span>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-[#141519] border border-white/10 rounded-2xl p-3 sm:p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por cliente, título de campaña, plataforma u objetivo..."
            className="w-full pl-9 pr-3 py-2 bg-[#0d0f12] border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#16A34A] transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-[#0d0f12] border border-white/10 rounded-xl text-xs text-gray-300 focus:outline-none focus:border-[#16A34A] cursor-pointer"
          >
            <option value="all">Todos los estados</option>
            <option value="activa">Activa</option>
            <option value="optimizacion">En optimización</option>
            <option value="pausada">Pausada</option>
            <option value="finalizada">Finalizada</option>
          </select>

          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="px-3 py-2 bg-[#0d0f12] border border-white/10 rounded-xl text-xs text-gray-300 focus:outline-none focus:border-[#16A34A] cursor-pointer"
          >
            <option value="all">Todas las plataformas</option>
            <option value="meta">Meta Ads</option>
            <option value="google">Google Ads</option>
            <option value="tiktok">TikTok Ads</option>
          </select>
        </div>
      </div>

      {/* Lista de Campañas */}
      {filteredCampaigns.length === 0 ? (
        <div className="bg-[#141519] border border-white/10 rounded-2xl p-8 sm:p-12 text-center">
          <Megaphone className="w-8 h-8 text-gray-500 mx-auto mb-3" />
          <h2 className="text-base font-bold text-white">
            No se encontraron campañas publicitarias
          </h2>
          <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
            {searchTerm || statusFilter !== "all" || platformFilter !== "all"
              ? "No hay resultados para los filtros seleccionados."
              : "Aún no hay campañas registradas. Creá una nueva campaña para asignar tareas y objetivos."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredCampaigns.map((camp) => {
            const statusInfo = STATUS_CONFIG[camp.status] || STATUS_CONFIG.activa;
            const deliverables = Array.isArray(camp.deliverables) ? camp.deliverables : [];
            const completedTasks = deliverables.filter((t) => t.completed).length;

            return (
              <div
                key={camp.id}
                className="bg-[#141519] border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col justify-between hover:border-white/20 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-gray-400 block">
                        {camp.refId || camp.id}
                      </span>
                      <h2 className="text-sm sm:text-base font-black text-white mt-0.5">
                        {camp.title || "Campaña sin título"}
                      </h2>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <button
                          type="button"
                          onClick={() => handleShowClientContext(camp.clientName)}
                          className="text-xs text-[#22C55E] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                          title="Consultar diagnóstico del cliente"
                        >
                          <Building className="w-3 h-3" />
                          <span>{camp.clientName || "Cliente general"}</span>
                        </button>
                      </div>
                    </div>

                    <select
                      value={camp.status}
                      onChange={(e) => handleStatusChange(camp.id, e.target.value)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border bg-transparent cursor-pointer ${statusInfo.badge}`}
                    >
                      <option value="activa" className="bg-[#141519] text-white">Activa</option>
                      <option value="optimizacion" className="bg-[#141519] text-white">En Optimización</option>
                      <option value="pausada" className="bg-[#141519] text-white">Pausada</option>
                      <option value="finalizada" className="bg-[#141519] text-white">Finalizada</option>
                    </select>
                  </div>

                  {/* Detalles Técnicos */}
                  <div className="space-y-1.5 text-xs text-gray-300 border-t border-white/5 pt-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-[11px]">Plataforma:</span>
                      <span className="font-semibold text-white">
                        {camp.platform || "Meta Ads"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-[11px]">Objetivo:</span>
                      <span className="text-gray-200">
                        {camp.objective || "Mensajes a WhatsApp"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-[11px]">Presupuesto Pauta:</span>
                      <span className="font-mono font-bold text-[#22C55E]">
                        {camp.budgetARS ? `$${Number(camp.budgetARS).toLocaleString("es-AR")}` : "No asignado"}
                      </span>
                    </div>

                    {camp.strategy && (
                      <div className="pt-1">
                        <span className="text-gray-400 text-[10px] block">Estrategia &amp; Públicos:</span>
                        <p className="text-[11px] text-gray-300 leading-relaxed bg-[#0d0f12] p-2 rounded-lg border border-white/5 mt-0.5">
                          {camp.strategy}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Checklist de Entregables / Tareas */}
                  {deliverables.length > 0 && (
                    <div className="border-t border-white/5 pt-2 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-gray-400">Entregables &amp; Tareas:</span>
                        <span className="text-[10px] text-gray-400 font-mono">
                          {completedTasks}/{deliverables.length} completados
                        </span>
                      </div>

                      <div className="space-y-1">
                        {deliverables.map((task, idx) => (
                          <div
                            key={idx}
                            onClick={() => handleToggleTask(camp, idx)}
                            className="flex items-center gap-2 text-[11px] cursor-pointer hover:text-white transition-colors"
                          >
                            {task.completed ? (
                              <CheckSquare className="w-3.5 h-3.5 text-[#22C55E] flex-shrink-0" />
                            ) : (
                              <Square className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                            )}
                            <span className={task.completed ? "line-through text-gray-500" : "text-gray-300"}>
                              {task.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t border-white/5 pt-3 mt-3 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleShowClientContext(camp.clientName)}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition-colors cursor-pointer text-center"
                  >
                    Ficha del Cliente
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm("¿Seguro que deseás eliminar esta campaña de marketing?")) {
                        onDeleteCampaign(camp.id);
                      }
                    }}
                    className="p-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer"
                    title="Eliminar campaña"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Consulta de Contexto de Cliente */}
      {selectedClientDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#141519] border border-white/15 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl my-auto space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-mono text-gray-400 block">Contexto para Estrategia</span>
                <h3 className="text-base font-black text-white mt-0.5">
                  {selectedClientDetail.fullName || selectedClientDetail.businessName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedClientDetail(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-gray-300">
              {selectedClientDetail.planName && (
                <div>
                  <span className="text-gray-400 text-[11px] block">Plan Contratado:</span>
                  <span className="text-white font-bold">{selectedClientDetail.planName}</span>
                </div>
              )}

              {selectedClientDetail.businessSituation && (
                <div>
                  <span className="text-gray-400 text-[11px] block">Situación del Negocio:</span>
                  <p className="bg-[#0d0f12] p-2.5 rounded-xl border border-white/5 text-white mt-0.5 leading-relaxed">
                    {selectedClientDetail.businessSituation}
                  </p>
                </div>
              )}

              {selectedClientDetail.businessGoals && (
                <div>
                  <span className="text-gray-400 text-[11px] block">Objetivos Comerciales:</span>
                  <p className="bg-[#0d0f12] p-2.5 rounded-xl border border-white/5 text-white mt-0.5 leading-relaxed">
                    {selectedClientDetail.businessGoals}
                  </p>
                </div>
              )}

              {selectedClientDetail.adStrategy && (
                <div>
                  <span className="text-gray-400 text-[11px] block">Estrategia Publicitaria Acordada:</span>
                  <p className="bg-[#0d0f12] p-2.5 rounded-xl border border-white/5 text-[#22C55E] mt-0.5 leading-relaxed">
                    {selectedClientDetail.adStrategy}
                  </p>
                </div>
              )}
            </div>

            <div className="border-t border-white/10 pt-3 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedClientDetail(null)}
                className="px-4 py-2 rounded-xl bg-white/10 text-white font-bold text-xs"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
