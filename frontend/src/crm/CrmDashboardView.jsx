import React from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wallet,
  Users,
  Briefcase,
  Calendar,
  ArrowRight,
  Clock,
  Megaphone,
  Plus,
  Headset,
} from "lucide-react";
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
  expenses = [],
  onNavigateTab,
  onOpenNewLead,
  onOpenNewCustomer,
  onOpenNewCampaign,
}) {
  // Clientes activos y honorarios mensuales (Ganancias del mes)
  const activeClients = clients.filter(
    (c) => c.status === "activo" || c.status === "por_renovar"
  );
  const monthlyRevenue = activeClients.reduce(
    (acc, c) => acc + (Number(c.feeARS) || 0),
    0
  );

  // Total de gastos del mes actual
  const currentYearMonth = getCurrentYearMonth();
  const monthlyExpenses = expenses
    .filter((e) => !e.date || (e.date || "").startsWith(currentYearMonth))
    .reduce((acc, e) => acc + (Number(e.amount) || 0), 0);

  // Balance mensual = Ganancias - Gastos
  const monthlyBalance = monthlyRevenue - monthlyExpenses;
  const isSuperavit = monthlyBalance >= 0;

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
  const activeCampaigns = campaigns.filter(
    (c) => c.status === "activa" || c.status === "optimizacion"
  );
  const totalMarketingBudget = campaigns.reduce(
    (acc, c) => acc + (Number(c.budgetARS) || 0),
    0
  );

  // Próximas renovaciones de clientes
  const renewingClients = activeClients.slice(0, 5);

  // Próximas reuniones de 20 min
  const upcomingMeetings = leads
    .filter((l) => (l.service === "Reunión Gratuita 20 min" || l.meetingDate) && l.status === "reunion_agendada")
    .slice(0, 4);

  const getWhatsAppQuickUrl = (lead) => {
    const cleanNumber = (lead.phone || "").replace(/[^0-9]/g, "");
    const msg = `Hola ${lead.fullName || ""}, te contacto de NEXO Creative para coordinar nuestra reunión de 20 minutos. ¿Te queda bien el horario agendado?`;
    return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------------ */}
      {/* 1. CABECERA EJECUTIVA SIMPLIFICADA                                 */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/8">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Resumen General
          </h1>
          <p className="text-xs text-gray-400 capitalize mt-0.5">
            Período de {getFormattedMonth()}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onOpenNewCustomer && (
            <button
              type="button"
              onClick={onOpenNewCustomer}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold border border-white/10 transition-colors cursor-pointer"
            >
              <Headset className="w-3.5 h-3.5 text-[#22C55E]" />
              <span>Nueva Ficha</span>
            </button>
          )}

          {onOpenNewCampaign && (
            <button
              type="button"
              onClick={onOpenNewCampaign}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold border border-white/10 transition-colors cursor-pointer"
            >
              <Megaphone className="w-3.5 h-3.5 text-[#22C55E]" />
              <span>Nueva Campaña</span>
            </button>
          )}

          {onOpenNewLead && (
            <button
              type="button"
              onClick={onOpenNewLead}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold transition-colors cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Nuevo Lead</span>
            </button>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 2. SALUD FINANCIERA: 3 TARJETAS CLAVE                              */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
        {/* Balance Neto */}
        <div className="bg-[#141519] border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Balance Neto
            </span>
            <div className={`p-2 rounded-xl ${isSuperavit ? "bg-[#16A34A]/15 text-[#22C55E]" : "bg-red-500/15 text-red-400"}`}>
              {isSuperavit ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
              ${monthlyBalance.toLocaleString("es-AR")}
            </div>
            <div className="text-xs mt-1">
              <span className={`font-semibold ${isSuperavit ? "text-[#22C55E]" : "text-red-400"}`}>
                {isSuperavit ? "Superávit operativo" : "Déficit mensual"}
              </span>
            </div>
          </div>
        </div>

        {/* Ingresos del Mes */}
        <div className="bg-[#141519] border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Ingresos Facturados
            </span>
            <div className="p-2 rounded-xl bg-[#16A34A]/15 text-[#22C55E]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-[#22C55E] font-mono tracking-tight">
              ${monthlyRevenue.toLocaleString("es-AR")}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {activeClients.length} clientes activos
            </div>
          </div>
        </div>

        {/* Gastos del Mes */}
        <div className="bg-[#141519] border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Gastos Operativos
            </span>
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
              ${monthlyExpenses.toLocaleString("es-AR")}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {expenses.length} egresos registrados
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 3. LOS 3 PILARES OPERATIVOS: ACCESO DIRECTO A CADA ÁREA            */}
      {/* ------------------------------------------------------------------ */}
      <div>
        <h2 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-3">
          Áreas de Trabajo
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
          {/* Pilar 1: Comercial */}
          <div
            onClick={() => onNavigateTab("commercial")}
            className="bg-[#141519] border border-white/10 hover:border-[#16A34A]/40 rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-[border-color,transform] duration-150 active:scale-99 cursor-pointer group shadow-lg"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-[#16A34A]/15 text-[#22C55E]">
                  <Users className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
              </div>
              <h3 className="text-sm font-black text-white mt-3">
                Pipeline Comercial
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                {activeLeads.length} oportunidades en seguimiento
              </p>
            </div>

            <div className="pt-3 mt-4 border-t border-white/5 flex items-baseline justify-between">
              <span className="text-[11px] text-gray-400">Valor estimado:</span>
              <span className="text-xs font-mono font-bold text-white">
                ${pipelineValue.toLocaleString("es-AR")}
              </span>
            </div>
          </div>

          {/* Pilar 2: Atención al Público */}
          <div
            onClick={() => onNavigateTab("customer_service")}
            className="bg-[#141519] border border-white/10 hover:border-[#16A34A]/40 rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-[border-color,transform] duration-150 active:scale-99 cursor-pointer group shadow-lg"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-blue-500/15 text-blue-400">
                  <Headset className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
              </div>
              <h3 className="text-sm font-black text-white mt-3">
                Atención al Cliente
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                {customerProfiles.length} fichas individuales
              </p>
            </div>

            <div className="pt-3 mt-4 border-t border-white/5 flex items-baseline justify-between">
              <span className="text-[11px] text-gray-400">Clientes activos:</span>
              <span className="text-xs font-bold text-emerald-400">
                {customerProfiles.filter((p) => p.status === "activo").length} en servicio
              </span>
            </div>
          </div>

          {/* Pilar 3: Marketing & Pauta */}
          <div
            onClick={() => onNavigateTab("marketing")}
            className="bg-[#141519] border border-white/10 hover:border-[#16A34A]/40 rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-[border-color,transform] duration-150 active:scale-99 cursor-pointer group shadow-lg"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-purple-500/15 text-purple-400">
                  <Megaphone className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
              </div>
              <h3 className="text-sm font-black text-white mt-3">
                Marketing &amp; Pauta
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                {activeCampaigns.length} campañas activas
              </p>
            </div>

            <div className="pt-3 mt-4 border-t border-white/5 flex items-baseline justify-between">
              <span className="text-[11px] text-gray-400">Pauta administrada:</span>
              <span className="text-xs font-mono font-bold text-white">
                ${totalMarketingBudget.toLocaleString("es-AR")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 4. PRIORIDADES INMEDIATAS (2 COLUMNAS ACCIONABLES)                 */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Próximas Reuniones */}
        <div className="bg-[#141519] border border-white/10 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/8">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#22C55E]" />
                <h4 className="text-xs font-black uppercase tracking-wider text-white">
                  Próximas Reuniones (20 min)
                </h4>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab("meetings")}
                className="text-xs font-bold text-gray-400 hover:text-white cursor-pointer"
              >
                Ver agenda
              </button>
            </div>

            {upcomingMeetings.length === 0 ? (
              <div className="py-6 text-center text-xs text-gray-500">
                No hay reuniones pendientes agendadas.
              </div>
            ) : (
              <div className="space-y-2">
                {upcomingMeetings.map((m) => (
                  <div
                    key={m.id || m.refId}
                    className="p-3 rounded-xl bg-[#181a20] border border-white/6 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-bold text-white">{m.fullName}</div>
                      <div className="text-[11px] text-gray-400">{m.businessName || "Negocio"}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="font-bold text-white flex items-center gap-1 justify-end">
                          <Clock className="w-3 h-3 text-[#22C55E]" />
                          <span>{m.meetingTime ? `${m.meetingTime} hs` : "20 min"}</span>
                        </div>
                        <div className="text-[10px] text-gray-400">
                          {m.meetingDate || "Fecha acordada"}
                        </div>
                      </div>
                      {m.phone && (
                        <a
                          href={getWhatsAppQuickUrl(m)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg bg-[#25D366] hover:bg-[#20ba59] text-white transition-colors"
                          title="Contactar por WhatsApp"
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

          <div className="pt-3 mt-3 border-t border-white/5 flex items-center justify-between text-xs text-gray-400">
            <span>Agendadas: <strong className="text-white">{upcomingMeetings.length}</strong></span>
            <button
              type="button"
              onClick={() => onNavigateTab("meetings")}
              className="text-[#22C55E] hover:underline font-bold cursor-pointer"
            >
              Abrir Agenda &rarr;
            </button>
          </div>
        </div>

        {/* Próximas Renovaciones / Cobros */}
        <div className="bg-[#141519] border border-white/10 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/8">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#22C55E]" />
                <h4 className="text-xs font-black uppercase tracking-wider text-white">
                  Próximas Renovaciones
                </h4>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab("clients")}
                className="text-xs font-bold text-gray-400 hover:text-white cursor-pointer"
              >
                Ver clientes
              </button>
            </div>

            {renewingClients.length === 0 ? (
              <div className="py-6 text-center text-xs text-gray-500">
                No hay clientes activos registrados aún.
              </div>
            ) : (
              <div className="space-y-2">
                {renewingClients.map((c) => (
                  <div
                    key={c.id || c.refId}
                    className="p-3 rounded-xl bg-[#181a20] border border-white/6 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-bold text-white">{c.clientName}</div>
                      <div className="text-[11px] text-gray-400">{c.service}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-[#22C55E]">
                        ${(Number(c.feeARS) || 0).toLocaleString("es-AR")}
                      </div>
                      <div className="text-[10px] text-gray-400">
                        {c.renewalDate || "Fecha a confirmar"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 mt-3 border-t border-white/5 flex items-center justify-between text-xs text-gray-400">
            <span>Clientes activos: <strong className="text-white">{activeClients.length}</strong></span>
            <button
              type="button"
              onClick={() => onNavigateTab("clients")}
              className="text-[#22C55E] hover:underline font-bold cursor-pointer"
            >
              Gestionar Clientes &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
