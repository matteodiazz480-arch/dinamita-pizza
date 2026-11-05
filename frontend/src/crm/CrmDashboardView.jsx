import React from "react";
import { ArrowRight, Plus } from "lucide-react";
import { WhatsAppIcon } from "../components/Icons";

function getCurrentYearMonth() {
  return new Date().toISOString().slice(0, 7);
}

function getFormattedMonth() {
  return new Date().toLocaleDateString("es-AR", { month: "long", year: "numeric" });
}

export default function CrmDashboardView({
  leads = [],
  clients = [],
  customerProfiles = [],
  campaigns = [],
  clientCampaigns = [],
  companyCampaigns = [],
  expenses = [],
  incomes = [],
  onNavigateTab,
  onOpenNewLead,
  onOpenNewCustomer,
  onOpenNewCampaign,
  onOpenNewClientCampaign,
  onOpenNewExpense,
  onOpenNewIncome,
}) {
  const effectiveCampaigns = clientCampaigns.length > 0 ? clientCampaigns : campaigns;
  const handleOpenCampaign = onOpenNewClientCampaign || onOpenNewCampaign;
  const currentYearMonth = getCurrentYearMonth();

  // Clientes activos y honorarios mensuales
  const activeClients = clients.filter(
    (c) => c.status === "activo" || c.status === "por_renovar"
  );
  const monthlyClientsRevenue = activeClients.reduce(
    (acc, c) => acc + (Number(c.feeARS) || 0),
    0
  );
  const campaignFeesRevenue = effectiveCampaigns.reduce(
    (acc, c) => acc + (Number(c.agencyFee) || 0),
    0
  );
  const manualIncomesMonth = incomes
    .filter((i) => !i.date || (i.date || "").startsWith(currentYearMonth))
    .reduce((acc, i) => acc + (Number(i.amount) || 0), 0);

  const baseServiceRevenue =
    monthlyClientsRevenue > 0 ? monthlyClientsRevenue : campaignFeesRevenue;
  const monthlyRevenue = baseServiceRevenue + manualIncomesMonth;

  // Total de gastos del mes actual + publicidad propia
  const monthlyExpensesOnly = expenses
    .filter((e) => !e.date || (e.date || "").startsWith(currentYearMonth))
    .reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
  const ownAdSpend = companyCampaigns.reduce(
    (acc, c) => acc + (Number(c.spentAmount) || 0),
    0
  );
  const monthlyExpenses = monthlyExpensesOnly + ownAdSpend;

  // Balance mensual
  const monthlyBalance = monthlyRevenue - monthlyExpenses;

  // Pipeline Comercial
  const activeLeads = leads.filter(
    (l) => l.status !== "ganado" && l.status !== "perdido" && l.status !== "archivado"
  );
  const pipelineValue = leads.reduce((acc, l) => {
    if (l.status === "ganado" || l.status === "perdido" || l.status === "archivado") {
      return acc;
    }
    const fee = Number(l.feeARS) || 0;
    const prob = Number(l.probability) || 50;
    return acc + Math.round(fee * (prob / 100));
  }, 0);

  // Campañas de Marketing
  const activeCampaigns = effectiveCampaigns.filter(
    (c) => c.status === "activa" || c.status === "optimizacion"
  );
  const totalMarketingBudget = effectiveCampaigns.reduce(
    (acc, c) => acc + (Number(c.adSpend) || Number(c.budgetARS) || 0),
    0
  );

  const renewingClients = activeClients.slice(0, 5);
  const upcomingMeetings = leads
    .filter(
      (l) =>
        (l.service === "Reunión Gratuita 20 min" || l.meetingDate) &&
        l.status === "reunion_agendada"
    )
    .slice(0, 4);

  const getWhatsAppQuickUrl = (lead) => {
    const cleanNumber = (lead.phone || "").replace(/[^0-9]/g, "");
    const msg = `Hola ${lead.fullName || ""}, te contacto de NEXO Creative para coordinar nuestra reunión de 20 minutos. ¿Te queda bien el horario agendado?`;
    return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="space-y-5">
      {/* ------------------------------------------------------------------ */}
      {/* 1. CABECERA EJECUTIVA SIMPLIFICADA                                 */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/8">
        <div className="flex items-baseline gap-2.5">
          <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            Resumen General
          </h1>
          <span className="text-xs text-gray-500 capitalize">
            {getFormattedMonth()}
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {onOpenNewIncome && (
            <button
              type="button"
              onClick={onOpenNewIncome}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Ganancia</span>
            </button>
          )}

          {onOpenNewExpense && (
            <button
              type="button"
              onClick={onOpenNewExpense}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/6 hover:bg-white/10 text-gray-200 text-xs font-medium border border-white/8 transition-colors cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Gasto</span>
            </button>
          )}

          {onOpenNewCustomer && (
            <button
              type="button"
              onClick={onOpenNewCustomer}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/6 hover:bg-white/10 text-gray-200 text-xs font-medium border border-white/8 transition-colors cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Ficha</span>
            </button>
          )}

          {handleOpenCampaign && (
            <button
              type="button"
              onClick={handleOpenCampaign}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/6 hover:bg-white/10 text-gray-200 text-xs font-medium border border-white/8 transition-colors cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Campaña</span>
            </button>
          )}

          {onOpenNewLead && (
            <button
              type="button"
              onClick={onOpenNewLead}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/6 hover:bg-white/10 text-gray-200 text-xs font-medium border border-white/8 transition-colors cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Lead</span>
            </button>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 2. CAJA & FINANZAS: 3 CELDAS LIMPIAS SIN ICONOS DECORATIVOS        */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
        <div
          onClick={() => onNavigateTab("expenses")}
          className="bg-[#141519] border border-white/8 hover:border-white/15 rounded-xl p-4 cursor-pointer transition-colors"
        >
          <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block">
            Balance Neto del Mes
          </span>
          <div
            className={`text-xl sm:text-2xl font-bold font-mono tabular-nums mt-1 ${
              monthlyBalance >= 0 ? "text-[#22C55E]" : "text-red-400"
            }`}
          >
            ${monthlyBalance.toLocaleString("es-AR")}
          </div>
        </div>

        <div
          onClick={() => onNavigateTab("expenses")}
          className="bg-[#141519] border border-white/8 hover:border-white/15 rounded-xl p-4 cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              Ganancias &amp; Ingresos
            </span>
            <span className="text-[11px] text-gray-500">
              {activeClients.length} clientes · {incomes.length} cobros
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white font-mono tabular-nums mt-1">
            ${monthlyRevenue.toLocaleString("es-AR")}
          </div>
        </div>

        <div
          onClick={() => onNavigateTab("expenses")}
          className="bg-[#141519] border border-white/8 hover:border-white/15 rounded-xl p-4 cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              Gastos &amp; Pauta Propia
            </span>
            <span className="text-[11px] text-gray-500">
              {expenses.length} gastos
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white font-mono tabular-nums mt-1">
            ${monthlyExpenses.toLocaleString("es-AR")}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 3. LAS 3 ÁREAS DE TRABAJO ( ACCESO DIRECTO COMPACTO )              */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3">
        <div
          onClick={() => onNavigateTab("commercial")}
          className="bg-[#141519] border border-white/8 hover:border-white/15 rounded-xl p-4 flex flex-col justify-between cursor-pointer group transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-white">Pipeline Comercial</span>
            <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
          </div>
          <div className="pt-3 mt-3 border-t border-white/6 flex items-baseline justify-between text-xs">
            <span className="text-gray-400">{activeLeads.length} en seguimiento</span>
            <span className="font-mono font-semibold text-white tabular-nums">
              ${pipelineValue.toLocaleString("es-AR")}
            </span>
          </div>
        </div>

        <div
          onClick={() => onNavigateTab("customer_service")}
          className="bg-[#141519] border border-white/8 hover:border-white/15 rounded-xl p-4 flex flex-col justify-between cursor-pointer group transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-white">Atención al Cliente</span>
            <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
          </div>
          <div className="pt-3 mt-3 border-t border-white/6 flex items-baseline justify-between text-xs">
            <span className="text-gray-400">{customerProfiles.length} fichas registradas</span>
            <span className="font-mono font-semibold text-[#22C55E] tabular-nums">
              {customerProfiles.filter((p) => p.status === "activo").length} activos
            </span>
          </div>
        </div>

        <div
          onClick={() => onNavigateTab("marketing")}
          className="bg-[#141519] border border-white/8 hover:border-white/15 rounded-xl p-4 flex flex-col justify-between cursor-pointer group transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-white">Marketing &amp; Campañas</span>
            <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
          </div>
          <div className="pt-3 mt-3 border-t border-white/6 flex items-baseline justify-between text-xs">
            <span className="text-gray-400">
              {activeCampaigns.length} clientes · {companyCampaigns.length} propias
            </span>
            <span className="font-mono font-semibold text-white tabular-nums">
              ${totalMarketingBudget.toLocaleString("es-AR")}
            </span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 4. AGENDA Y CLIENTES ACTIVOS (LISTAS LIMPIAS CON DIVISORES 1PX)    */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
        {/* Próximas Reuniones */}
        <div className="bg-[#141519] border border-white/8 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-white/8">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-300">
                Próximas Reuniones ({upcomingMeetings.length})
              </h3>
              <button
                type="button"
                onClick={() => onNavigateTab("meetings")}
                className="text-xs font-medium text-gray-400 hover:text-white cursor-pointer"
              >
                Ver agenda →
              </button>
            </div>

            {upcomingMeetings.length === 0 ? (
              <div className="py-6 text-center text-xs text-gray-500">
                Sin reuniones agendadas.
              </div>
            ) : (
              <div className="divide-y divide-white/6">
                {upcomingMeetings.map((m) => (
                  <div
                    key={m.id || m.refId}
                    className="py-2.5 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-white truncate">{m.fullName}</div>
                      <div className="text-[11px] text-gray-500 truncate">
                        {m.businessName || "Negocio"}
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 flex-shrink-0">
                      <div className="text-right font-mono tabular-nums">
                        <div className="font-semibold text-white">
                          {m.meetingTime ? `${m.meetingTime} hs` : "20 min"}
                        </div>
                        <div className="text-[10px] text-gray-500">
                          {m.meetingDate || "Pendiente"}
                        </div>
                      </div>
                      {m.phone && (
                        <a
                          href={getWhatsAppQuickUrl(m)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-[#16A34A] hover:bg-[#15803D] text-white transition-colors"
                          title="WhatsApp"
                        >
                          <WhatsAppIcon className="w-3.5 h-3.5 fill-current" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Clientes Activos / Renovaciones */}
        <div className="bg-[#141519] border border-white/8 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-white/8">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-300">
                Clientes Activos ({activeClients.length})
              </h3>
              <button
                type="button"
                onClick={() => onNavigateTab("clients")}
                className="text-xs font-medium text-gray-400 hover:text-white cursor-pointer"
              >
                Ver todos →
              </button>
            </div>

            {renewingClients.length === 0 ? (
              <div className="py-6 text-center text-xs text-gray-500">
                Sin clientes activos registrados.
              </div>
            ) : (
              <div className="divide-y divide-white/6">
                {renewingClients.map((c) => (
                  <div
                    key={c.id || c.refId}
                    className="py-2.5 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-white truncate">{c.clientName}</div>
                      <div className="text-[11px] text-gray-500 truncate">{c.service}</div>
                    </div>
                    <div className="text-right font-mono tabular-nums flex-shrink-0">
                      <div className="font-semibold text-[#22C55E]">
                        ${(Number(c.feeARS) || 0).toLocaleString("es-AR")}
                      </div>
                      <div className="text-[10px] text-gray-500">
                        {c.renewalDate || "Mensual"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
