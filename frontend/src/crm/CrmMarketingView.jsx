import React, { useState, useMemo } from "react";
import {
  Search,
  Plus,
  Calendar,
  CheckSquare,
  Square,
  Edit2,
  Trash2,
  ExternalLink,
  X,
} from "lucide-react";

const STATUS_CONFIG = {
  activa: { label: "Activa", badge: "bg-emerald-500/12 text-emerald-300 border-emerald-500/25" },
  optimizacion: { label: "Optimización", badge: "bg-white/8 text-gray-200 border-white/15" },
  pausada: { label: "Pausada", badge: "bg-amber-500/12 text-amber-300 border-amber-500/25" },
  finalizada: { label: "Finalizada", badge: "bg-white/5 text-gray-400 border-white/10" },
};

export default function CrmMarketingView({
  clientCampaigns = [],
  companyCampaigns = [],
  expenses = [],
  incomes = [],
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
  onOpenNewIncome,
  onDeleteIncome,
}) {
  const canViewFinances =
    !currentUser?.role ||
    currentUser?.role === "admin" ||
    currentUser?.role === "marketing";

  // "client_ads" | "own_ads" | "financial_control"
  const [activeSection, setActiveSection] = useState("client_ads");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedProfileDetail, setSelectedProfileDetail] = useState(null);

  // --------------------------------------------------------------------------
  // CÁLCULOS FINANCIEROS REALES (100% de Firestore)
  // --------------------------------------------------------------------------
  const financialMetrics = useMemo(() => {
    const totalOwnSpent = companyCampaigns.reduce(
      (acc, c) => acc + (Number(c.spentAmount) || 0),
      0
    );
    const totalOwnLeads = companyCampaigns.reduce(
      (acc, c) => acc + (Number(c.leadsAcquired) || 0),
      0
    );
    const avgCpl = totalOwnLeads > 0 ? Math.round(totalOwnSpent / totalOwnLeads) : 0;

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

    const totalManualIncomes = incomes.reduce(
      (acc, i) => acc + (Number(i.amount) || 0),
      0
    );

    const totalOperatingExpenses = expenses.reduce(
      (acc, e) => acc + (Number(e.amount) || 0),
      0
    );

    const totalRevenues = totalAgencyFees + totalManualIncomes;
    const totalAllExpenses = totalClientExtraExpenses + totalOwnSpent + totalOperatingExpenses;
    const netProfit = totalRevenues - totalAllExpenses;

    return {
      totalOwnSpent,
      totalOwnLeads,
      avgCpl,
      totalClientAdSpend,
      totalAgencyFees,
      totalManualIncomes,
      totalRevenues,
      totalClientExtraExpenses,
      totalOperatingExpenses,
      totalAllExpenses,
      netProfit,
    };
  }, [clientCampaigns, companyCampaigns, expenses, incomes]);

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
      return matchSearch && matchStatus;
    });
  }, [clientCampaigns, searchTerm, statusFilter]);

  const filteredCompanyCampaigns = useMemo(() => {
    return companyCampaigns.filter((c) => {
      const q = searchTerm.toLowerCase().trim();
      const matchSearch =
        !q ||
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.platform && c.platform.toLowerCase().includes(q)) ||
        (c.objective && c.objective.toLowerCase().includes(q));
      const matchStatus = statusFilter === "all" || c.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [companyCampaigns, searchTerm, statusFilter]);

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
          observations: basicClient.notes,
        });
      }
    }
  };

  return (
    <div className="space-y-5">
      {/* ------------------------------------------------------------------ */}
      {/* CABECERA COMPACTA + SELECTOR RESPONSIVE (SIN OVERFLOW MÓVIL)       */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/8">
        <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
          Marketing &amp; Campañas
        </h1>

        <div
          className={`grid ${
            canViewFinances ? "grid-cols-3" : "grid-cols-2"
          } w-full sm:w-auto gap-1 p-1 bg-[#141519] border border-white/8 rounded-lg`}
        >
          <button
            type="button"
            onClick={() => setActiveSection("client_ads")}
            className={`px-2.5 sm:px-3.5 py-1.5 rounded-md text-[11px] sm:text-xs font-semibold text-center transition-colors truncate cursor-pointer ${
              activeSection === "client_ads"
                ? "bg-[#16A34A] text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Clientes ({clientCampaigns.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveSection("own_ads")}
            className={`px-2.5 sm:px-3.5 py-1.5 rounded-md text-[11px] sm:text-xs font-semibold text-center transition-colors truncate cursor-pointer ${
              activeSection === "own_ads"
                ? "bg-[#16A34A] text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Propia ({companyCampaigns.length})
          </button>

          {canViewFinances && (
            <button
              type="button"
              onClick={() => setActiveSection("financial_control")}
              className={`px-2.5 sm:px-3.5 py-1.5 rounded-md text-[11px] sm:text-xs font-semibold text-center transition-colors truncate cursor-pointer ${
                activeSection === "financial_control"
                  ? "bg-[#16A34A] text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Finanzas
            </button>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* SECCIÓN 1: PUBLICIDAD DE CLIENTES                                  */}
      {/* ------------------------------------------------------------------ */}
      {activeSection === "client_ads" && (
        <div className="space-y-4">
          {/* Resumen rápido en 2x2 móvil / 4 escritorio */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
            <div className="bg-[#141519] border border-white/8 rounded-xl p-3.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block">
                Campañas Activas
              </span>
              <span className="text-lg sm:text-xl font-bold text-white font-mono tabular-nums mt-1 block">
                {clientCampaigns.filter((c) => c.status === "activa" || c.status === "optimizacion").length}
              </span>
            </div>

            <div className="bg-[#141519] border border-white/8 rounded-xl p-3.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block">
                Pauta Clientes
              </span>
              <span className="text-lg sm:text-xl font-bold text-white font-mono tabular-nums mt-1 block">
                ${financialMetrics.totalClientAdSpend.toLocaleString("es-AR")}
              </span>
            </div>

            <div className="bg-[#141519] border border-white/8 rounded-xl p-3.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block">
                Honorarios Agencia
              </span>
              <span className="text-lg sm:text-xl font-bold text-white font-mono tabular-nums mt-1 block">
                ${financialMetrics.totalAgencyFees.toLocaleString("es-AR")}
              </span>
            </div>

            <div className="bg-[#141519] border border-white/8 rounded-xl p-3.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block">
                Margen Campañas
              </span>
              <span className="text-lg sm:text-xl font-bold text-[#22C55E] font-mono tabular-nums mt-1 block">
                ${Math.max(0, financialMetrics.totalAgencyFees - financialMetrics.totalClientExtraExpenses).toLocaleString("es-AR")}
              </span>
            </div>
          </div>

          {/* Barra de búsqueda y acción */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 flex-1">
              <div className="relative flex-1 sm:max-w-xs">
                <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar cliente o campaña..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#141519] border border-white/8 rounded-lg pl-8 pr-3 py-2 text-base sm:text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#16A34A]"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-[#141519] border border-white/8 rounded-lg px-2.5 py-2 text-base sm:text-xs text-gray-200 focus:outline-none focus:border-[#16A34A]"
              >
                <option value="all">Todos</option>
                <option value="activa">Activas</option>
                <option value="optimizacion">Optimización</option>
                <option value="pausada">Pausadas</option>
                <option value="finalizada">Finalizadas</option>
              </select>
            </div>

            <button
              type="button"
              onClick={onOpenNewClientCampaign}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Nueva Campaña</span>
            </button>
          </div>

          {/* Listado de campañas */}
          {filteredClientCampaigns.length === 0 ? (
            <div className="bg-[#141519] border border-white/8 rounded-xl p-8 text-center">
              <p className="text-xs text-gray-400">
                No hay campañas de clientes registradas.
              </p>
              <button
                type="button"
                onClick={onOpenNewClientCampaign}
                className="mt-3 px-3.5 py-2 rounded-lg bg-[#16A34A] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Crear Campaña</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
              {filteredClientCampaigns.map((c) => {
                const statusInfo = STATUS_CONFIG[c.status] || STATUS_CONFIG.activa;
                const fee = Number(c.agencyFee) || 0;
                const extra = Number(c.extraExpenses) || 0;
                const net = Number(c.netProfit) || Math.max(0, fee - extra);

                return (
                  <div
                    key={c.id}
                    className="bg-[#141519] border border-white/8 rounded-xl p-4 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 pb-3 border-b border-white/6">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-white text-sm truncate">
                              {c.title}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${statusInfo.badge}`}
                            >
                              {statusInfo.label}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-gray-400 mt-1 flex-wrap">
                            <span className="font-medium text-gray-200">
                              {c.clientName || "Cliente"}
                            </span>
                            {c.clientName && (
                              <button
                                type="button"
                                onClick={() => handleShowClientContext(c.clientName)}
                                className="text-[11px] text-[#22C55E] hover:underline cursor-pointer"
                              >
                                Ver ficha
                              </button>
                            )}
                            <span>·</span>
                            <span>{c.platform || "Meta Ads"}</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`¿Eliminar la campaña "${c.title}"?`)) {
                              onDeleteClientCampaign(c.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                          title="Eliminar campaña"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Cifras separadas con tabular-nums */}
                      <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 p-2.5 rounded-lg bg-[#0d0f12] border border-white/5 text-xs">
                        <div>
                          <span className="text-[10px] text-gray-500 block">Pauta</span>
                          <span className="font-mono font-semibold text-white tabular-nums">
                            ${(Number(c.adSpend) || Number(c.budgetARS) || 0).toLocaleString("es-AR")}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-500 block">Honorarios</span>
                          <span className="font-mono font-semibold text-white tabular-nums">
                            ${fee.toLocaleString("es-AR")}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-500 block">Gastos Ext.</span>
                          <span className="font-mono font-semibold text-gray-300 tabular-nums">
                            ${extra.toLocaleString("es-AR")}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-500 block">Ganancia</span>
                          <span className="font-mono font-bold text-[#22C55E] tabular-nums">
                            ${net.toLocaleString("es-AR")}
                          </span>
                        </div>
                      </div>

                      <div className="mt-2.5 flex items-center justify-between text-[11px] text-gray-400">
                        <span className="truncate">{c.objective || "Consultas WhatsApp"}</span>
                        <span className="font-mono tabular-nums text-gray-500">
                          {c.startDate || "-"} {c.endDate ? `→ ${c.endDate}` : ""}
                        </span>
                      </div>

                      {Array.isArray(c.deliverables) && c.deliverables.length > 0 && (
                        <div className="mt-3 pt-2.5 border-t border-white/5 space-y-1">
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
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-white/6 flex items-center justify-between text-xs">
                      <span className="text-[10px] text-gray-500">Estado</span>
                      <div className="flex items-center gap-1">
                        {["activa", "optimizacion", "pausada", "finalizada"].map((st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => onUpdateClientCampaign(c.id, { status: st })}
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
                              c.status === st
                                ? "bg-white/15 text-white"
                                : "text-gray-500 hover:text-gray-300"
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
      {/* SECCIÓN 2: PUBLICIDAD PROPIA DE LA EMPRESA                        */}
      {/* ------------------------------------------------------------------ */}
      {activeSection === "own_ads" && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
            <div className="bg-[#141519] border border-white/8 rounded-xl p-3.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block">
                Invertido
              </span>
              <div className="text-base sm:text-xl font-bold text-white font-mono tabular-nums mt-1">
                ${financialMetrics.totalOwnSpent.toLocaleString("es-AR")}
              </div>
            </div>

            <div className="bg-[#141519] border border-white/8 rounded-xl p-3.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block">
                Leads Captados
              </span>
              <div className="text-base sm:text-xl font-bold text-[#22C55E] font-mono tabular-nums mt-1">
                {financialMetrics.totalOwnLeads}
              </div>
            </div>

            <div className="bg-[#141519] border border-white/8 rounded-xl p-3.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block">
                CPL Promedio
              </span>
              <div className="text-base sm:text-xl font-bold text-white font-mono tabular-nums mt-1">
                ${financialMetrics.avgCpl.toLocaleString("es-AR")}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar campañas propias..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#141519] border border-white/8 rounded-lg pl-8 pr-3 py-2 text-base sm:text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#16A34A]"
              />
            </div>

            <button
              type="button"
              onClick={onOpenNewCompanyCampaign}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Nueva Campaña Propia</span>
            </button>
          </div>

          {filteredCompanyCampaigns.length === 0 ? (
            <div className="bg-[#141519] border border-white/8 rounded-xl p-8 text-center">
              <p className="text-xs text-gray-400">
                No hay campañas propias registradas.
              </p>
              <button
                type="button"
                onClick={onOpenNewCompanyCampaign}
                className="mt-3 px-3.5 py-2 rounded-lg bg-[#16A34A] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Registrar Campaña Propia</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
              {filteredCompanyCampaigns.map((c) => {
                const statusInfo = STATUS_CONFIG[c.status] || STATUS_CONFIG.activa;
                const cpl =
                  Number(c.cpl) ||
                  (c.leadsAcquired > 0 ? Math.round(c.spentAmount / c.leadsAcquired) : 0);

                return (
                  <div
                    key={c.id}
                    className="bg-[#141519] border border-white/8 rounded-xl p-4 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 pb-3 border-b border-white/6">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-white text-sm">{c.name}</span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${statusInfo.badge}`}
                            >
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
                          className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="mt-3 p-2.5 rounded-lg bg-[#0d0f12] border border-white/5 grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <span className="text-[10px] text-gray-500 block">Invertido</span>
                          <span className="font-mono font-semibold text-white tabular-nums">
                            ${(Number(c.spentAmount) || 0).toLocaleString("es-AR")}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-500 block">Leads</span>
                          <span className="font-mono font-bold text-[#22C55E] tabular-nums">
                            {c.leadsAcquired || 0}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-500 block">CPL</span>
                          <span className="font-mono font-semibold text-white tabular-nums">
                            ${cpl.toLocaleString("es-AR")}
                          </span>
                        </div>
                      </div>

                      <div className="mt-2.5 flex items-center justify-between text-[11px] text-gray-400">
                        <span className="font-mono tabular-nums text-gray-500">
                          {c.startDate || "-"} {c.endDate ? `→ ${c.endDate}` : ""}
                        </span>
                        {c.links && (
                          <a
                            href={c.links}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#22C55E] hover:underline flex items-center gap-1 font-medium"
                          >
                            <span>Enlace</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-white/6 flex items-center justify-between text-xs">
                      <span className="text-[10px] text-gray-500">Estado</span>
                      <div className="flex items-center gap-1">
                        {["activa", "optimizacion", "pausada", "finalizada"].map((st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => onUpdateCompanyCampaign(c.id, { status: st })}
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
                              c.status === st
                                ? "bg-white/15 text-white"
                                : "text-gray-500 hover:text-gray-300"
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
      {/* SECCIÓN 3: FINANZAS (SIN AVISO DE RESTRICCIÓN + REGISTRAR GANANCIA) */}
      {/* ------------------------------------------------------------------ */}
      {activeSection === "financial_control" && canViewFinances && (
        <div className="space-y-4">
          {/* Acciones rápidas de caja */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-gray-400">
              Balance real de campañas, honorarios, ingresos y gastos
            </span>
            <div className="flex items-center gap-2">
              {onOpenNewIncome && (
                <button
                  type="button"
                  onClick={onOpenNewIncome}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Registrar Ganancia</span>
                </button>
              )}
              {onOpenNewExpense && (
                <button
                  type="button"
                  onClick={onOpenNewExpense}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/8 hover:bg-white/12 border border-white/10 text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Registrar Gasto</span>
                </button>
              )}
            </div>
          </div>

          {/* 4 Métricas en grilla 2x2 móvil / 4 columnas escritorio — sin colores arcoíris */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
            <div className="bg-[#141519] border border-white/8 rounded-xl p-3.5 sm:p-4">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block">
                Ganancia Neta Real
              </span>
              <div
                className={`text-lg sm:text-2xl font-bold font-mono tabular-nums mt-1 ${
                  financialMetrics.netProfit >= 0 ? "text-[#22C55E]" : "text-red-400"
                }`}
              >
                ${financialMetrics.netProfit.toLocaleString("es-AR")}
              </div>
            </div>

            <div className="bg-[#141519] border border-white/8 rounded-xl p-3.5 sm:p-4">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block">
                Ingresos &amp; Honorarios
              </span>
              <div className="text-lg sm:text-2xl font-bold text-white font-mono tabular-nums mt-1">
                ${financialMetrics.totalRevenues.toLocaleString("es-AR")}
              </div>
            </div>

            <div className="bg-[#141519] border border-white/8 rounded-xl p-3.5 sm:p-4">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block">
                Anuncios Propios
              </span>
              <div className="text-lg sm:text-2xl font-bold text-white font-mono tabular-nums mt-1">
                ${financialMetrics.totalOwnSpent.toLocaleString("es-AR")}
              </div>
            </div>

            <div className="bg-[#141519] border border-white/8 rounded-xl p-3.5 sm:p-4">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block">
                Pauta Clientes
              </span>
              <div className="text-lg sm:text-2xl font-bold text-white font-mono tabular-nums mt-1">
                ${financialMetrics.totalClientAdSpend.toLocaleString("es-AR")}
              </div>
            </div>
          </div>

          {/* Dos columnas: Ganancias Registradas y Gastos Operativos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Ganancias / Ingresos */}
            <div className="bg-[#141519] border border-white/8 rounded-xl p-4">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/8">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-300">
                  Ganancias Registradas ({incomes.length})
                </h3>
                {onOpenNewIncome && (
                  <button
                    type="button"
                    onClick={onOpenNewIncome}
                    className="text-xs font-semibold text-[#22C55E] hover:underline cursor-pointer"
                  >
                    + Agregar
                  </button>
                )}
              </div>

              {incomes.length === 0 ? (
                <div className="py-6 text-center text-xs text-gray-500">
                  No hay ganancias manuales registradas.
                </div>
              ) : (
                <div className="divide-y divide-white/6">
                  {incomes.slice(0, 8).map((inc) => (
                    <div
                      key={inc.id}
                      className="py-2.5 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0">
                        <span className="font-semibold text-white block truncate">
                          {inc.description || inc.category}
                        </span>
                        <span className="text-[11px] text-gray-500">
                          {inc.date || "-"} · {inc.category}
                          {inc.clientName ? ` · ${inc.clientName}` : ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5 flex-shrink-0">
                        <span className="font-mono font-bold text-[#22C55E] tabular-nums">
                          +${(Number(inc.amount) || 0).toLocaleString("es-AR")}
                        </span>
                        {onDeleteIncome && (
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm("¿Eliminar este registro de ganancia?")) {
                                onDeleteIncome(inc.id);
                              }
                            }}
                            className="p-1 text-gray-500 hover:text-red-400 cursor-pointer"
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

            {/* Gastos Operativos */}
            <div className="bg-[#141519] border border-white/8 rounded-xl p-4">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/8">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-300">
                  Gastos Operativos ({expenses.length})
                </h3>
                {onOpenNewExpense && (
                  <button
                    type="button"
                    onClick={onOpenNewExpense}
                    className="text-xs font-semibold text-gray-300 hover:text-white cursor-pointer"
                  >
                    + Agregar
                  </button>
                )}
              </div>

              {expenses.length === 0 ? (
                <div className="py-6 text-center text-xs text-gray-500">
                  No hay gastos operativos registrados.
                </div>
              ) : (
                <div className="divide-y divide-white/6">
                  {expenses.slice(0, 8).map((e) => (
                    <div
                      key={e.id}
                      className="py-2.5 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0">
                        <span className="font-semibold text-white block truncate">
                          {e.description || e.category}
                        </span>
                        <span className="text-[11px] text-gray-500">
                          {e.date || "-"} · {e.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5 flex-shrink-0">
                        <span className="font-mono font-semibold text-white tabular-nums">
                          -${(Number(e.amount) || 0).toLocaleString("es-AR")}
                        </span>
                        {onDeleteExpense && (
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm("¿Eliminar este gasto operativo?")) {
                                onDeleteExpense(e.id);
                              }
                            }}
                            className="p-1 text-gray-500 hover:text-red-400 cursor-pointer"
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

          {/* Tabla de Rentabilidad por Campaña */}
          <div className="bg-[#141519] border border-white/8 rounded-xl p-4">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/8">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-300">
                Rentabilidad por Campaña
              </h3>
              <span className="text-xs font-mono text-gray-500 tabular-nums">
                {clientCampaigns.length} campañas
              </span>
            </div>

            {clientCampaigns.length === 0 ? (
              <div className="py-6 text-center text-xs text-gray-500">
                Sin campañas registradas para desglosar.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/8 text-[10px] uppercase tracking-wider text-gray-500">
                      <th className="pb-2.5 font-semibold">Cliente / Campaña</th>
                      <th className="pb-2.5 font-semibold">Plataforma</th>
                      <th className="pb-2.5 font-semibold text-right">Pauta</th>
                      <th className="pb-2.5 font-semibold text-right">Honorarios</th>
                      <th className="pb-2.5 font-semibold text-right">Extras</th>
                      <th className="pb-2.5 font-semibold text-right">Ganancia</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/6">
                    {clientCampaigns.map((c) => {
                      const fee = Number(c.agencyFee) || 0;
                      const extra = Number(c.extraExpenses) || 0;
                      const net = Number(c.netProfit) || Math.max(0, fee - extra);

                      return (
                        <tr key={c.id} className="hover:bg-white/[0.02]">
                          <td className="py-2.5 pr-3">
                            <span className="font-semibold text-white block">
                              {c.clientName || "Cliente"}
                            </span>
                            <span className="text-[11px] text-gray-500 block">{c.title}</span>
                          </td>
                          <td className="py-2.5 pr-3 text-gray-400">{c.platform}</td>
                          <td className="py-2.5 px-2 font-mono tabular-nums text-right text-gray-300">
                            ${(Number(c.adSpend) || Number(c.budgetARS) || 0).toLocaleString("es-AR")}
                          </td>
                          <td className="py-2.5 px-2 font-mono tabular-nums text-right text-white">
                            ${fee.toLocaleString("es-AR")}
                          </td>
                          <td className="py-2.5 px-2 font-mono tabular-nums text-right text-gray-400">
                            ${extra.toLocaleString("es-AR")}
                          </td>
                          <td className="py-2.5 pl-2 font-mono tabular-nums font-bold text-right text-[#22C55E]">
                            ${net.toLocaleString("es-AR")}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Panel lateral de contexto de cliente */}
      {selectedProfileDetail && (
        <div className="fixed inset-0 z-50 flex justify-end select-none">
          <div
            onClick={() => setSelectedProfileDetail(null)}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
          />
          <div className="relative z-10 bg-[#141519] border-l border-white/10 max-w-md w-full h-dvh p-6 shadow-2xl flex flex-col justify-between text-xs">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/8">
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {selectedProfileDetail.fullName}
                  </h3>
                  <span className="text-[11px] text-gray-400">
                    {selectedProfileDetail.businessName}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedProfileDetail(null)}
                  className="p-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="divide-y divide-white/6 border-y border-white/6">
                <div className="flex justify-between py-2.5">
                  <span className="text-gray-400">Teléfono</span>
                  <span className="text-white font-mono tabular-nums">
                    {selectedProfileDetail.phone || "No registrado"}
                  </span>
                </div>
                <div className="flex justify-between py-2.5">
                  <span className="text-gray-400">Plan contratado</span>
                  <span className="text-white font-semibold">
                    {selectedProfileDetail.planName || "A medida"}
                  </span>
                </div>
                <div className="flex justify-between py-2.5">
                  <span className="text-gray-400">Pauta acordada</span>
                  <span className="text-[#22C55E] font-mono font-bold tabular-nums">
                    ${(Number(selectedProfileDetail.adBudget) || 0).toLocaleString("es-AR")}
                  </span>
                </div>
              </div>

              {selectedProfileDetail.observations && (
                <div className="p-3 rounded-lg bg-[#0d0f12] border border-white/6 text-gray-300">
                  <span className="block text-gray-500 text-[10px] uppercase font-semibold mb-1">
                    Observaciones
                  </span>
                  <p>{selectedProfileDetail.observations}</p>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setSelectedProfileDetail(null)}
              className="w-full py-2.5 rounded-lg bg-white/8 hover:bg-white/12 text-white font-semibold cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
