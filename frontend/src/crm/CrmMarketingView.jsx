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
  Wallet,
  ArrowUpRight,
  PieChart,
  BarChart3,
  ShieldAlert,
  Percent,
  Receipt,
  Headset,
} from "lucide-react";

const STATUS_CONFIG = {
  activa: { label: "Activa", badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
  optimizacion: { label: "En Optimización", badge: "bg-blue-500/15 text-blue-300 border-blue-500/30" },
  pausada: { label: "Pausada", badge: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
  finalizada: { label: "Finalizada", badge: "bg-gray-500/15 text-gray-400 border-gray-500/30" },
};

export default function CrmMarketingView({
  clientCampaigns = [],
  companyCampaigns = [],
  expenses = [],
  customerProfiles = [],
  clients = [],
  currentUser,
  onUpdateClientCampaign,
  onDeleteClientCampaign,
  onOpenNewClientCampaign,
  onUpdateCompanyCampaign,
  onDeleteCompanyCampaign,
  onOpenNewCompanyCampaign,
  onOpenNewExpense,
  onDeleteExpense,
  onViewCustomerDetail,
}) {
  const isMarketingRole = currentUser?.role === "marketing";

  // Sub-pestañas: "client_ads" | "own_ads" | "financial_control"
  const [activeSection, setActiveSection] = useState("client_ads");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("all");

  // Estados de edición rápida
  const [editingClientCamp, setEditingClientCamp] = useState(null);
  const [editingCompanyCamp, setEditingCompanyCamp] = useState(null);
  const [selectedProfileDetail, setSelectedProfileDetail] = useState(null);

  // --------------------------------------------------------------------------
  // CÁLCULOS FINANCIEROS REALES (100% de Firestore)
  // --------------------------------------------------------------------------
  const financialMetrics = useMemo(() => {
    // 1. Publicidad propia de la empresa
    const totalOwnSpent = companyCampaigns.reduce(
      (acc, c) => acc + (Number(c.spentAmount) || 0),
      0
    );
    const totalOwnLeads = companyCampaigns.reduce(
      (acc, c) => acc + (Number(c.leadsAcquired) || 0),
      0
    );
    const avgCpl = totalOwnLeads > 0 ? Math.round(totalOwnSpent / totalOwnLeads) : 0;

    // 2. Campañas de clientes
    const totalClientAdSpend = clientCampaigns.reduce(
      (acc, c) => acc + (Number(c.adSpend) || Number(c.budgetARS) || 0),
      0
    );
    const totalAgencyFees = clientCampaigns.reduce(
      (acc, c) => acc + (Number(c.agencyFee) || 0),
      0
    );
    const totalClientExtraExpenses = clientCampaigns.reduce(
      (acc, c) => acc + (Number(c.extraExpenses) || 0),
      0
    );
    const totalClientBilled = clientCampaigns.reduce(
      (acc, c) => acc + (Number(c.totalBilled) || 0),
      0
    );

    // 3. Gastos operativos
    const totalOperatingExpenses = expenses.reduce(
      (acc, e) => acc + (Number(e.amount) || 0),
      0
    );

    // 4. Ganancia neta real de la empresa = Honorarios cobrados - Gastos extras de campañas - Publicidad propia invertida
    const netProfit = totalAgencyFees - totalClientExtraExpenses - totalOwnSpent;
    const isProfitable = netProfit >= 0;

    // 5. Retorno / Rentabilidad
    const roi = totalOwnSpent > 0 ? Math.round((netProfit / totalOwnSpent) * 100) : 100;

    return {
      totalOwnSpent,
      totalOwnLeads,
      avgCpl,
      totalClientAdSpend,
      totalAgencyFees,
      totalClientExtraExpenses,
      totalClientBilled,
      totalOperatingExpenses,
      netProfit,
      isProfitable,
      roi,
    };
  }, [clientCampaigns, companyCampaigns, expenses]);

  // Filtrado de campañas de clientes
  const filteredClientCampaigns = useMemo(() => {
    return clientCampaigns.filter((c) => {
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
  }, [clientCampaigns, searchTerm, statusFilter, platformFilter]);

  // Filtrado de campañas propias
  const filteredCompanyCampaigns = useMemo(() => {
    return companyCampaigns.filter((c) => {
      const q = searchTerm.toLowerCase().trim();
      const matchSearch =
        !q ||
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.platform && c.platform.toLowerCase().includes(q)) ||
        (c.objective && c.objective.toLowerCase().includes(q));

      const matchStatus = statusFilter === "all" || c.status === statusFilter;
      const matchPlatform =
        platformFilter === "all" ||
        (c.platform && c.platform.toLowerCase().includes(platformFilter.toLowerCase()));

      return matchSearch && matchStatus && matchPlatform;
    });
  }, [companyCampaigns, searchTerm, statusFilter, platformFilter]);

  const handleToggleTask = async (campaign, taskIndex) => {
    const deliverables = Array.isArray(campaign.deliverables) ? [...campaign.deliverables] : [];
    if (deliverables[taskIndex]) {
      deliverables[taskIndex].completed = !deliverables[taskIndex].completed;
      await onUpdateClientCampaign(campaign.id, { deliverables });
    }
  };

  const handleShowClientContext = (clientName) => {
    const profile = customerProfiles.find(
      (p) =>
        (p.fullName && p.fullName.toLowerCase() === (clientName || "").toLowerCase()) ||
        (p.businessName && p.businessName.toLowerCase() === (clientName || "").toLowerCase())
    );
    if (profile) {
      setSelectedProfileDetail(profile);
    } else {
      const basicClient = clients.find(
        (c) => c.clientName && c.clientName.toLowerCase() === (clientName || "").toLowerCase()
      );
      if (basicClient) {
        setSelectedProfileDetail({
          fullName: basicClient.clientName,
          businessName: basicClient.clientName,
          phone: basicClient.contact,
          planName: basicClient.service,
          planPrice: basicClient.feeARS,
          adBudget: basicClient.adBudget,
          status: basicClient.status,
          notes: basicClient.notes,
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------------ */}
      {/* 1. CABECERA Y SELECTOR DE SECCIONES INDEPENDIENTES                */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/8">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Megaphone className="w-6 h-6 text-purple-400" />
            <span>Marketing &amp; Control Financiero</span>
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Gestión independiente de campañas para clientes y publicidad propia
          </p>
        </div>

        {/* Selector de Sección */}
        <div className="flex items-center gap-1.5 p-1 bg-[#141519] border border-white/10 rounded-xl overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveSection("client_ads")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
              activeSection === "client_ads"
                ? "bg-[#16A34A] text-white shadow-sm"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Publicidad de Clientes ({clientCampaigns.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveSection("own_ads")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
              activeSection === "own_ads"
                ? "bg-[#16A34A] text-white shadow-sm"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Publicidad Propia ({companyCampaigns.length})
          </button>

          {isMarketingRole && (
            <button
              type="button"
              onClick={() => setActiveSection("financial_control")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                activeSection === "financial_control"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-purple-300 hover:text-white"
              }`}
            >
              Control Financiero &amp; Balances
            </button>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* SECCIÓN 1: PUBLICIDAD DE NUESTROS CLIENTES                        */}
      {/* ------------------------------------------------------------------ */}
      {activeSection === "client_ads" && (
        <div className="space-y-5">
          {/* Barra de Búsqueda, Filtros y Botón Nueva */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar por cliente, campaña o plataforma..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#141519] border border-white/10 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#16A34A] transition-colors"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-[#141519] border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-[#16A34A] transition-colors"
              >
                <option value="all">Todos los estados</option>
                <option value="activa">Activas</option>
                <option value="optimizacion">En Optimización</option>
                <option value="pausada">Pausadas</option>
                <option value="finalizada">Finalizadas</option>
              </select>
            </div>

            <button
              type="button"
              onClick={onOpenNewClientCampaign}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-black transition-colors cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Nueva Campaña de Cliente</span>
            </button>
          </div>

          {/* Listado de Campañas de Clientes */}
          {filteredClientCampaigns.length === 0 ? (
            <div className="bg-[#141519] border border-white/10 rounded-2xl p-8 text-center">
              <Megaphone className="w-8 h-8 text-gray-500 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-white">No hay campañas de clientes registradas</h3>
              <p className="text-xs text-gray-400 mt-1">
                Creá la primera campaña indicando pauta publicitaria y honorarios de la empresa.
              </p>
              <button
                type="button"
                onClick={onOpenNewClientCampaign}
                className="mt-4 px-4 py-2 rounded-xl bg-[#16A34A] text-white text-xs font-bold inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Registrar Campaña</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredClientCampaigns.map((c) => {
                const statusInfo = STATUS_CONFIG[c.status] || STATUS_CONFIG.activa;
                const isEditing = editingClientCamp?.id === c.id;

                return (
                  <div
                    key={c.id}
                    className="bg-[#141519] border border-white/10 hover:border-white/15 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col justify-between transition-all"
                  >
                    <div>
                      {/* Cabecera de la Tarjeta */}
                      <div className="flex items-start justify-between gap-3 pb-3 border-b border-white/6">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-extrabold text-white text-sm">
                              {c.title}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase tracking-wider ${statusInfo.badge}`}>
                              {statusInfo.label}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-gray-400 mt-1 flex-wrap">
                            <span className="font-semibold text-[#22C55E]">
                              {c.clientName || "Cliente general"}
                            </span>
                            {c.clientName && (
                              <button
                                type="button"
                                onClick={() => handleShowClientContext(c.clientName)}
                                className="text-[10px] text-gray-400 hover:text-white underline cursor-pointer"
                              >
                                Ver Ficha
                              </button>
                            )}
                            <span>·</span>
                            <span>{c.platform || "Meta Ads"}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setEditingClientCamp(isEditing ? null : { ...c })}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                            title="Editar campaña"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`¿Eliminar la campaña "${c.title}"?`)) {
                                onDeleteClientCampaign(c.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Eliminar campaña"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Bloque Financiero Diferenciado */}
                      <div className="mt-3.5 p-3 rounded-xl bg-[#101115] border border-white/5 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <div>
                          <span className="text-[10px] text-gray-400 uppercase tracking-wider block">
                            Pauta Publicitaria
                          </span>
                          <span className="font-mono font-bold text-white text-sm mt-0.5 block">
                            ${(Number(c.adSpend) || Number(c.budgetARS) || 0).toLocaleString("es-AR")}
                          </span>
                          <span className="text-[9px] text-gray-500">
                            {c.clientPaysAdDirect ? "Tarjeta cliente" : "Transferido"}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] text-gray-400 uppercase tracking-wider block">
                            Honorarios Agencia
                          </span>
                          <span className="font-mono font-bold text-[#22C55E] text-sm mt-0.5 block">
                            ${(Number(c.agencyFee) || 0).toLocaleString("es-AR")}
                          </span>
                          <span className="text-[9px] text-gray-500">Cobro por servicio</span>
                        </div>

                        <div>
                          <span className="text-[10px] text-gray-400 uppercase tracking-wider block">
                            Gastos Extras
                          </span>
                          <span className="font-mono font-bold text-amber-400 text-sm mt-0.5 block">
                            ${(Number(c.extraExpenses) || 0).toLocaleString("es-AR")}
                          </span>
                          <span className="text-[9px] text-gray-500">Diseños/software</span>
                        </div>

                        <div>
                          <span className="text-[10px] text-gray-400 uppercase tracking-wider block">
                            Ganancia Neta
                          </span>
                          <span className="font-mono font-black text-emerald-400 text-sm mt-0.5 block">
                            ${(Number(c.netProfit) || Math.max(0, (Number(c.agencyFee) || 0) - (Number(c.extraExpenses) || 0))).toLocaleString("es-AR")}
                          </span>
                          <span className="text-[9px] text-emerald-500/80 font-bold">NEXO</span>
                        </div>
                      </div>

                      {/* Objetivo y Fechas */}
                      <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                        <div className="flex items-center gap-1.5">
                          <Target className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                          <span className="truncate max-w-[200px]">{c.objective || "Consultas a WhatsApp"}</span>
                        </div>
                        <div className="flex items-center gap-1 font-mono text-[11px]">
                          <Calendar className="w-3 h-3 text-gray-500" />
                          <span>{c.startDate || "Inicio"} {c.endDate ? `al ${c.endDate}` : ""}</span>
                        </div>
                      </div>

                      {/* Checklist de Entregables */}
                      {Array.isArray(c.deliverables) && c.deliverables.length > 0 && (
                        <div className="mt-3.5 pt-3 border-t border-white/5 space-y-1.5">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                            Entregables y Tareas:
                          </span>
                          {c.deliverables.map((task, idx) => (
                            <div
                              key={idx}
                              onClick={() => handleToggleTask(c, idx)}
                              className="flex items-center gap-2 text-xs text-gray-300 hover:text-white cursor-pointer select-none"
                            >
                              {task.completed ? (
                                <CheckSquare className="w-3.5 h-3.5 text-[#22C55E] flex-shrink-0" />
                              ) : (
                                <Square className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                              )}
                              <span className={task.completed ? "line-through text-gray-500" : ""}>
                                {task.text}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Observaciones */}
                      {c.notes && (
                        <div className="mt-3 pt-2 border-t border-white/5 text-[11px] text-gray-400 italic">
                          "{c.notes}"
                        </div>
                      )}
                    </div>

                    {/* Selector de estado inferior */}
                    <div className="mt-4 pt-3 border-t border-white/6 flex items-center justify-between text-xs">
                      <span className="text-[10px] text-gray-500">Cambiar estado:</span>
                      <div className="flex items-center gap-1">
                        {["activa", "optimizacion", "pausada", "finalizada"].map((st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => onUpdateClientCampaign(c.id, { status: st })}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                              c.status === st ? "bg-white/20 text-white" : "text-gray-500 hover:text-gray-300"
                            }`}
                          >
                            {st === "optimizacion" ? "optim." : st}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* SECCIÓN 2: PUBLICIDAD PROPIA DE LA EMPRESA (NEXO CREATIVE)        */}
      {/* ------------------------------------------------------------------ */}
      {activeSection === "own_ads" && (
        <div className="space-y-5">
          {/* Métricas Rápidas de Captación Propia */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
            <div className="bg-[#141519] border border-white/10 rounded-2xl p-4 shadow-lg">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
                Total Invertido en Anuncios Propios
              </span>
              <div className="text-2xl font-black text-white font-mono mt-1">
                ${financialMetrics.totalOwnSpent.toLocaleString("es-AR")}
              </div>
              <span className="text-[11px] text-gray-400 mt-0.5 block">
                {companyCampaigns.length} campañas registradas
              </span>
            </div>

            <div className="bg-[#141519] border border-white/10 rounded-2xl p-4 shadow-lg">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
                Leads / Clientes Potenciales Captados
              </span>
              <div className="text-2xl font-black text-[#22C55E] font-mono mt-1">
                {financialMetrics.totalOwnLeads}
              </div>
              <span className="text-[11px] text-gray-400 mt-0.5 block">
                Consultas directas para NEXO
              </span>
            </div>

            <div className="bg-[#141519] border border-white/10 rounded-2xl p-4 shadow-lg">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
                Costo Promedio por Consulta (CPL)
              </span>
              <div className="text-2xl font-black text-purple-300 font-mono mt-1">
                ${financialMetrics.avgCpl.toLocaleString("es-AR")}
              </div>
              <span className="text-[11px] text-gray-400 mt-0.5 block">
                Inversión / Consultas captadas
              </span>
            </div>
          </div>

          {/* Barra de Acciones */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar campañas propias..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#141519] border border-white/10 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#16A34A]"
              />
            </div>

            <button
              type="button"
              onClick={onOpenNewCompanyCampaign}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-black transition-colors cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Nueva Campaña Propia</span>
            </button>
          </div>

          {/* Listado de Campañas Propias */}
          {filteredCompanyCampaigns.length === 0 ? (
            <div className="bg-[#141519] border border-white/10 rounded-2xl p-8 text-center">
              <Target className="w-8 h-8 text-gray-500 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-white">No hay campañas propias registradas</h3>
              <p className="text-xs text-gray-400 mt-1">
                Registrá cuánto invertís en publicitar tu agencia y cuántos clientes conseguís.
              </p>
              <button
                type="button"
                onClick={onOpenNewCompanyCampaign}
                className="mt-4 px-4 py-2 rounded-xl bg-[#16A34A] text-white text-xs font-bold inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Registrar Campaña Propia</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredCompanyCampaigns.map((c) => {
                const statusInfo = STATUS_CONFIG[c.status] || STATUS_CONFIG.activa;
                const cpl = Number(c.cpl) || (c.leadsAcquired > 0 ? Math.round(c.spentAmount / c.leadsAcquired) : 0);

                return (
                  <div
                    key={c.id}
                    className="bg-[#141519] border border-white/10 hover:border-white/15 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 pb-3 border-b border-white/6">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-extrabold text-white text-sm">
                              {c.name}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase tracking-wider ${statusInfo.badge}`}>
                              {statusInfo.label}
                            </span>
                          </div>
                          <span className="text-xs text-gray-400 block mt-0.5">
                            {c.platform} · {c.objective}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`¿Eliminar la campaña propia "${c.name}"?`)) {
                              onDeleteCompanyCampaign(c.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Métricas de Gasto y Rendimiento */}
                      <div className="mt-3.5 p-3 rounded-xl bg-[#101115] border border-white/5 grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <span className="text-[10px] text-gray-400 uppercase tracking-wider block">
                            Dinero Invertido
                          </span>
                          <span className="font-mono font-bold text-white text-sm mt-0.5 block">
                            ${(Number(c.spentAmount) || 0).toLocaleString("es-AR")}
                          </span>
                          <span className="text-[9px] text-gray-500">
                            Presupuesto: ${(Number(c.allocatedBudget) || 0).toLocaleString("es-AR")}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] text-gray-400 uppercase tracking-wider block">
                            Leads Captados
                          </span>
                          <span className="font-mono font-black text-[#22C55E] text-sm mt-0.5 block">
                            {c.leadsAcquired || 0}
                          </span>
                          <span className="text-[9px] text-gray-500">
                            {c.clicks ? `${c.clicks} clics` : "WhatsApp"}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] text-gray-400 uppercase tracking-wider block">
                            Costo por Lead (CPL)
                          </span>
                          <span className="font-mono font-bold text-purple-300 text-sm mt-0.5 block">
                            ${cpl.toLocaleString("es-AR")}
                          </span>
                          <span className="text-[9px] text-gray-500">Por consulta</span>
                        </div>
                      </div>

                      {/* Fechas y Enlaces */}
                      <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                        <span className="font-mono text-[11px]">
                          {c.startDate || "Inicio"} {c.endDate ? `al ${c.endDate}` : ""}
                        </span>
                        {c.links && (
                          <a
                            href={c.links}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#22C55E] hover:underline flex items-center gap-1 font-semibold"
                          >
                            <span>Ver anuncios</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>

                      {c.notes && (
                        <div className="mt-3 pt-2 border-t border-white/5 text-[11px] text-gray-400 italic">
                          "{c.notes}"
                        </div>
                      )}
                    </div>

                    {/* Selector de estado */}
                    <div className="mt-4 pt-3 border-t border-white/6 flex items-center justify-between text-xs">
                      <span className="text-[10px] text-gray-500">Cambiar estado:</span>
                      <div className="flex items-center gap-1">
                        {["activa", "optimizacion", "pausada", "finalizada"].map((st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => onUpdateCompanyCampaign(c.id, { status: st })}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                              c.status === st ? "bg-white/20 text-white" : "text-gray-500 hover:text-gray-300"
                            }`}
                          >
                            {st === "optimizacion" ? "optim." : st}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* SECCIÓN 3: CONTROL FINANCIERO & RENTABILIDAD (EXCLUSIVO MARKETING) */}
      {/* ------------------------------------------------------------------ */}
      {activeSection === "financial_control" && isMarketingRole && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Alerta de Privacidad Restringida */}
          <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/30 flex items-center justify-between text-xs text-purple-200">
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="w-4 h-4 text-purple-400 flex-shrink-0" />
              <span>
                <strong>Área Financiera Restringida:</strong> Estos totales económicos y ganancias reales son visibles exclusivamente para el rol de Marketing.
              </span>
            </div>
            {onOpenNewExpense && (
              <button
                type="button"
                onClick={onOpenNewExpense}
                className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold cursor-pointer"
              >
                + Registrar Gasto
              </button>
            )}
          </div>

          {/* 4 Métricas Clave de Negocio */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
            {/* Ganancia Real Obtenida */}
            <div className="bg-[#141519] border border-emerald-500/30 rounded-2xl p-4 sm:p-5 shadow-lg">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400 block">
                Ganancia Neta Real (NEXO)
              </span>
              <div className="text-2xl sm:text-3xl font-black text-[#22C55E] font-mono mt-1">
                ${financialMetrics.netProfit.toLocaleString("es-AR")}
              </div>
              <span className="text-[11px] text-gray-400 mt-0.5 block">
                Honorarios - Gastos extras - Inversión propia
              </span>
            </div>

            {/* Total Cobrado en Honorarios */}
            <div className="bg-[#141519] border border-white/10 rounded-2xl p-4 sm:p-5 shadow-lg">
              <span className="text-[11px] font-black uppercase tracking-wider text-gray-400 block">
                Honorarios Cobrados
              </span>
              <div className="text-2xl sm:text-3xl font-black text-white font-mono mt-1">
                ${financialMetrics.totalAgencyFees.toLocaleString("es-AR")}
              </div>
              <span className="text-[11px] text-gray-400 mt-0.5 block">
                Facturación por servicios de marketing
              </span>
            </div>

            {/* Inversión en Publicidad Propia */}
            <div className="bg-[#141519] border border-white/10 rounded-2xl p-4 sm:p-5 shadow-lg">
              <span className="text-[11px] font-black uppercase tracking-wider text-gray-400 block">
                Invertido en Anuncios Propios
              </span>
              <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono mt-1">
                ${financialMetrics.totalOwnSpent.toLocaleString("es-AR")}
              </div>
              <span className="text-[11px] text-gray-400 mt-0.5 block">
                Gasto para captar nuestros clientes
              </span>
            </div>

            {/* Inversión en Pauta de Clientes */}
            <div className="bg-[#141519] border border-white/10 rounded-2xl p-4 sm:p-5 shadow-lg">
              <span className="text-[11px] font-black uppercase tracking-wider text-gray-400 block">
                Pauta Gestionada (Clientes)
              </span>
              <div className="text-2xl sm:text-3xl font-black text-blue-400 font-mono mt-1">
                ${financialMetrics.totalClientAdSpend.toLocaleString("es-AR")}
              </div>
              <span className="text-[11px] text-gray-400 mt-0.5 block">
                Presupuesto publicitario en plataformas
              </span>
            </div>
          </div>

          {/* Comparación y Rentabilidad por Campaña de Cliente */}
          <div className="bg-[#141519] border border-white/10 rounded-2xl p-4 sm:p-6 shadow-lg">
            <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-white/8">
              <div>
                <h3 className="text-sm sm:text-base font-black text-white">
                  Rentabilidad por Campaña de Cliente
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Diferenciación exacta entre honorarios ganados y gastos operativos
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-gray-400">
                {clientCampaigns.length} campañas analizadas
              </span>
            </div>

            {clientCampaigns.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-500">
                No hay campañas de clientes registradas para comparar.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/8 text-[10px] uppercase tracking-wider text-gray-400">
                      <th className="pb-2.5 font-bold">Cliente / Campaña</th>
                      <th className="pb-2.5 font-bold">Plataforma</th>
                      <th className="pb-2.5 font-bold">Pauta Cliente</th>
                      <th className="pb-2.5 font-bold">Honorarios</th>
                      <th className="pb-2.5 font-bold">Gastos Extras</th>
                      <th className="pb-2.5 font-bold text-right">Ganancia Neta</th>
                      <th className="pb-2.5 font-bold text-right">Margen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {clientCampaigns.map((c) => {
                      const fee = Number(c.agencyFee) || 0;
                      const extra = Number(c.extraExpenses) || 0;
                      const net = Number(c.netProfit) || Math.max(0, fee - extra);
                      const margin = fee > 0 ? Math.round((net / fee) * 100) : 0;

                      return (
                        <tr key={c.id} className="hover:bg-white/3 transition-colors">
                          <td className="py-3">
                            <span className="font-extrabold text-white block">
                              {c.clientName || "Cliente"}
                            </span>
                            <span className="text-[11px] text-gray-400 block">
                              {c.title}
                            </span>
                          </td>
                          <td className="py-3 text-gray-300">
                            {c.platform}
                          </td>
                          <td className="py-3 font-mono text-gray-400">
                            ${(Number(c.adSpend) || Number(c.budgetARS) || 0).toLocaleString("es-AR")}
                          </td>
                          <td className="py-3 font-mono font-bold text-[#22C55E]">
                            ${fee.toLocaleString("es-AR")}
                          </td>
                          <td className="py-3 font-mono text-amber-400">
                            ${extra.toLocaleString("es-AR")}
                          </td>
                          <td className="py-3 font-mono font-black text-right text-emerald-400">
                            ${net.toLocaleString("es-AR")}
                          </td>
                          <td className="py-3 font-mono font-bold text-right text-gray-300">
                            {margin}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Gastos Operativos Adicionales (Exclusivos para Marketing) */}
          <div className="bg-[#141519] border border-white/10 rounded-2xl p-4 sm:p-5 shadow-lg">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/8">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-purple-400" />
                <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white">
                  Gastos Operativos &amp; Herramientas de Marketing
                </h4>
              </div>
              {onOpenNewExpense && (
                <button
                  type="button"
                  onClick={onOpenNewExpense}
                  className="text-xs font-bold text-[#22C55E] hover:underline cursor-pointer"
                >
                  + Agregar Gasto
                </button>
              )}
            </div>

            {expenses.length === 0 ? (
              <div className="py-6 text-center text-xs text-gray-500">
                No hay gastos adicionales registrados este mes.
              </div>
            ) : (
              <div className="space-y-2">
                {expenses.map((e) => (
                  <div
                    key={e.id}
                    className="p-2.5 rounded-xl bg-[#181a20] border border-white/6 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <span className="font-bold text-white block">{e.description || e.category}</span>
                      <span className="text-[10px] text-gray-400">{e.date || "Este mes"} · {e.category}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-white">
                        ${(Number(e.amount) || 0).toLocaleString("es-AR")}
                      </span>
                      {onDeleteExpense && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm("¿Eliminar este gasto operativo?")) {
                              onDeleteExpense(e.id);
                            }
                          }}
                          className="p-1 text-gray-500 hover:text-red-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal / Drawer de contexto de cliente */}
      {selectedProfileDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
          <div className="bg-[#141519] border border-white/10 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-3.5 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div>
                <h3 className="text-sm font-black text-white">{selectedProfileDetail.fullName}</h3>
                <span className="text-[11px] text-gray-400">{selectedProfileDetail.businessName}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProfileDetail(null)}
                className="p-1 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Teléfono:</span>
                <span className="text-white font-mono">{selectedProfileDetail.phone || "No registrado"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Plan contratado:</span>
                <span className="text-white font-bold">{selectedProfileDetail.planName || "A medida"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Pauta acordada:</span>
                <span className="text-[#22C55E] font-mono font-bold">
                  ${(Number(selectedProfileDetail.adBudget) || 0).toLocaleString("es-AR")}
                </span>
              </div>
              {selectedProfileDetail.notes && (
                <div className="pt-2 border-t border-white/6 text-gray-300">
                  <span className="block text-gray-500 text-[10px] uppercase font-bold">Notas:</span>
                  <p className="mt-0.5">{selectedProfileDetail.notes}</p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-white/10 text-right">
              <button
                type="button"
                onClick={() => setSelectedProfileDetail(null)}
                className="px-4 py-2 rounded-xl bg-white/10 text-white font-bold"
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
