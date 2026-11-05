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
  FileText,
  Phone,
} from "lucide-react";
import { WhatsAppIcon } from "../components/Icons";

function getCurrentYearMonth() {
  return new Date().toISOString().slice(0, 7);
}

const STAGE_CONFIGS = [
  { key: "nuevo", label: "Nuevo", color: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
  { key: "contactado", label: "Contactado", color: "bg-blue-500/15 text-blue-300 border-blue-500/30" },
  { key: "reunion_agendada", label: "Reunión Agendada", color: "bg-[#16A34A]/15 text-[#22C55E] border-[#16A34A]/30" },
  { key: "propuesta_enviada", label: "Propuesta Enviada", color: "bg-purple-500/15 text-purple-300 border-purple-500/30" },
  { key: "negociacion", label: "Negociación", color: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30" },
  { key: "ganado", label: "Ganado", color: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
  { key: "perdido", label: "Perdido", color: "bg-gray-500/15 text-gray-400 border-gray-500/30" },
];

const ORIGIN_BADGES = {
  "Solicitar Asesoramiento": "bg-blue-500/15 text-blue-300 border-blue-500/30",
  "Solicitar Presupuesto": "bg-purple-500/15 text-purple-300 border-purple-500/30",
  "Encontrá tu plan": "bg-[#16A34A]/15 text-[#22C55E] border-[#16A34A]/30",
  "Agenda Reunión 20 min": "bg-amber-500/15 text-amber-300 border-amber-500/30",
};

export default function CrmDashboardView({
  leads = [],
  clients = [],
  customerProfiles = [],
  expenses = [],
  onNavigateTab,
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
  const pipelineValue = leads.reduce((acc, l) => {
    if (l.status === "ganado" || l.status === "perdido" || l.status === "archivado") {
      return acc;
    }
    const fee = Number(l.feeARS) || 0;
    const prob = Number(l.probability) || 50;
    return acc + Math.round(fee * (prob / 100));
  }, 0);

  // Próximas renovaciones de clientes
  const renewingClients = activeClients.slice(0, 5);

  // Próximas reuniones de 20 min
  const upcomingMeetings = leads
    .filter((l) => (l.service === "Reunión Gratuita 20 min" || l.meetingDate) && l.status === "reunion_agendada")
    .slice(0, 4);

  // Últimas consultas y respuestas web (de cualquier formulario)
  const recentLeads = leads.slice(0, 5);

  const getWhatsAppQuickUrl = (lead) => {
    const cleanNumber = (lead.phone || "").replace(/[^0-9]/g, "");
    const msg = `Hola ${lead.fullName || ""}, te contacto de NEXO Creative con respecto a tu consulta por ${lead.service || "tu proyecto"}. ¿En qué momento tenés unos minutos para conversar?`;
    return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------------ */}
      {/* TARJETAS PRINCIPALES DE FINANZAS (Solicitadas por el usuario)      */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* 1. BALANCE MENSUAL */}
        <div className="bg-[#141519] border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400">
              Balance Mensual Neto
            </span>
            <div className={`p-2 rounded-xl ${isSuperavit ? "bg-[#16A34A]/15 text-[#22C55E]" : "bg-red-500/15 text-red-400"}`}>
              {isSuperavit ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
              ${monthlyBalance.toLocaleString("es-AR")}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[11px]">
              <span className={`font-bold ${isSuperavit ? "text-[#22C55E]" : "text-red-400"}`}>
                {isSuperavit ? "Superávit mensual" : "Déficit mensual"}
              </span>
              <span className="text-gray-400">· Ganancias - Gastos</span>
            </div>
          </div>
        </div>

        {/* 2. GANANCIAS DEL MES */}
        <div className="bg-[#141519] border border-[#16A34A]/30 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400">
              Ganancias del Mes (Ingresos)
            </span>
            <div className="p-2 rounded-xl bg-[#16A34A]/15 text-[#22C55E]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-[#22C55E] font-mono tracking-tight">
              ${monthlyRevenue.toLocaleString("es-AR")}
            </div>
            <div className="text-[11px] text-gray-400 mt-1">
              <strong className="text-white">{activeClients.length}</strong> clientes activos facturando
            </div>
          </div>
        </div>

        {/* 3. GASTOS DEL MES */}
        <div className="bg-[#141519] border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400">
              Gastos del Mes
            </span>
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
              ${monthlyExpenses.toLocaleString("es-AR")}
            </div>
            <div className="text-[11px] text-gray-400 mt-1">
              {expenses.length} registros operativos este mes
            </div>
          </div>
        </div>

        {/* 4. VALOR ESTIMADO DEL PIPELINE */}
        <div className="bg-[#141519] border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400">
              Pipeline Estimado (Ventas)
            </span>
            <div className="p-2 rounded-xl bg-blue-500/15 text-blue-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
              ${pipelineValue.toLocaleString("es-AR")}
            </div>
            <div className="text-[11px] text-gray-400 mt-1">
              Ponderado por probabilidad %
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* ETAPAS COMERCIALES DEL PIPELINE                                    */}
      {/* ------------------------------------------------------------------ */}
      <div className="bg-[#141519] border border-white/10 rounded-2xl p-4 sm:p-6 shadow-lg">
        <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-white/8">
          <div>
            <h3 className="text-sm sm:text-base font-black text-white tracking-tight">
              Etapas del Pipeline Comercial
            </h3>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab("commercial")}
            className="text-xs font-bold text-[#22C55E] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Ver Pipeline</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {STAGE_CONFIGS.map((stage) => {
            const count = leads.filter((l) => l.status === stage.key).length;
            return (
              <div
                key={stage.key}
                onClick={() => onNavigateTab("commercial")}
                className="bg-[#181a20] border border-white/8 hover:border-[#16A34A]/50 rounded-xl p-3 flex flex-col justify-between transition-[border-color,transform] duration-150 active:scale-97 cursor-pointer group select-none"
              >
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider truncate">
                  {stage.label}
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-xl sm:text-2xl font-black text-white group-hover:text-[#22C55E] transition-colors">
                    {count}
                  </span>
                  <span className={`w-2 h-2 rounded-full ${stage.color.split(" ")[0]}`} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* ATENCIÓN AL PÚBLICO: RESUMEN OPERATIVO                             */}
      {/* ------------------------------------------------------------------ */}
      <div className="bg-[#141519] border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-[#16A34A]/15 text-[#22C55E]">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white">
              Atención al Público
            </h3>
            <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
              <span>{customerProfiles.length} fichas registradas</span>
              <span>•</span>
              <span className="text-emerald-400 font-semibold">
                {customerProfiles.filter((p) => p.status === "activo").length} activos
              </span>
              <span>•</span>
              <span className="text-amber-300 font-semibold">
                {customerProfiles.filter((p) => p.status === "en_evaluacion").length} en evaluación
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigateTab("customer_service")}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition-colors cursor-pointer"
        >
          <span>Abrir Módulo</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* RENOVACIONES Y REUNIONES DE 20 MIN                                 */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Renovaciones del Mes */}
        <div className="bg-[#141519] border border-white/10 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/8">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#22C55E]" />
                <h4 className="text-xs font-black uppercase tracking-wider text-white">
                  Próximas Renovaciones / Cobros
                </h4>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab("clients")}
                className="text-[11px] font-bold text-gray-400 hover:text-white cursor-pointer"
              >
                Ver todos ({clients.length})
              </button>
            </div>

            {renewingClients.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-500">
                No hay clientes activos registrados aún.
              </div>
            ) : (
              <div className="space-y-2">
                {renewingClients.map((c) => (
                  <div
                    key={c.id || c.refId}
                    className="p-2.5 rounded-xl bg-[#181a20] border border-white/6 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-extrabold text-white">{c.clientName}</div>
                      <div className="text-[11px] text-gray-400">{c.service}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-[#22C55E]">
                        ${(Number(c.feeARS) || 0).toLocaleString("es-AR")}
                      </div>
                      <div className="text-[10px] text-gray-400">
                        Renovación: {c.renewalDate || "A confirmar"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 mt-3 border-t border-white/5 flex items-center justify-between text-xs text-gray-400">
            <span>Total clientes activos: <strong className="text-white">{activeClients.length}</strong></span>
            <button
              type="button"
              onClick={() => onNavigateTab("clients")}
              className="text-[#22C55E] hover:underline font-bold cursor-pointer"
            >
              Gestionar Clientes &rarr;
            </button>
          </div>
        </div>

        {/* Reuniones 20 min en vivo */}
        <div className="bg-[#141519] border border-white/10 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/8">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#22C55E]" />
                <h4 className="text-xs font-black uppercase tracking-wider text-white">
                  Reuniones Estratégicas 20 min
                </h4>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab("meetings")}
                className="text-[11px] font-bold text-gray-400 hover:text-white cursor-pointer"
              >
                Ver agenda
              </button>
            </div>

            {upcomingMeetings.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-500">
                No hay reuniones pendientes para los próximos días.
              </div>
            ) : (
              <div className="space-y-2">
                {upcomingMeetings.map((m) => (
                  <div
                    key={m.id || m.refId}
                    className="p-2.5 rounded-xl bg-[#181a20] border border-white/6 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-extrabold text-white">{m.fullName}</div>
                      <div className="text-[11px] text-gray-400">{m.businessName || "Negocio"}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-white flex items-center gap-1 justify-end">
                        <Clock className="w-3 h-3 text-[#22C55E]" />
                        <span>{m.meetingTime ? `${m.meetingTime} hs` : "20 min"}</span>
                      </div>
                      <div className="text-[10px] text-gray-400">
                        {m.meetingDate || "Fecha acordada"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 mt-3 border-t border-white/5 flex items-center justify-between text-xs text-gray-400">
            <span>Reuniones agendadas en total: <strong className="text-white">{upcomingMeetings.length}</strong></span>
            <button
              type="button"
              onClick={() => onNavigateTab("meetings")}
              className="text-[#22C55E] hover:underline font-bold cursor-pointer"
            >
              Abrir Agenda 20 min &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* ÚLTIMAS CONSULTAS Y FORMULARIOS WEB RECIBIDOS (CENTRALIZADO)       */}
      {/* ------------------------------------------------------------------ */}
      <div className="bg-[#141519] border border-white/10 rounded-2xl p-4 sm:p-5 shadow-lg">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/8">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#22C55E]" />
            <div>
              <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white">
                Últimas Consultas y Formularios Web Recibidos
              </h4>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Panel centralizado en tiempo real con todas las entradas de la landing
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab("responses")}
            className="text-xs font-bold text-[#22C55E] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Ver todos ({leads.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentLeads.length === 0 ? (
          <div className="py-8 text-center text-xs text-gray-500">
            No hay consultas ni formularios registrados todavía.
          </div>
        ) : (
          <div className="space-y-2.5">
            {recentLeads.map((lead) => {
              const id = lead.id || lead.refId;
              const originStyle = ORIGIN_BADGES[lead.origin] || "bg-white/10 text-gray-300 border-white/15";
              return (
                <div
                  key={id}
                  className="p-3 rounded-xl bg-[#181a20] border border-white/6 hover:border-white/15 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <span className="font-mono text-[10px] text-gray-500 hidden sm:inline">
                      {lead.refId || id}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-white text-sm">
                          {lead.fullName}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${originStyle}`}>
                          {lead.origin || "Formulario Web"}
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-2 flex-wrap">
                        <span>{lead.businessName || "Negocio"}</span>
                        <span>·</span>
                        <span className="text-gray-300">{lead.service}</span>
                        {lead.phone && (
                          <>
                            <span>·</span>
                            <span className="text-gray-400 font-mono">{lead.phone}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                    <span className="text-[10px] text-gray-400 font-mono">
                      {lead.createdAt ? lead.createdAt.slice(0, 10) : "Hoy"}
                    </span>
                    <a
                      href={getWhatsAppQuickUrl(lead)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#20ba59] text-white text-[11px] font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                      title="Contactar por WhatsApp"
                    >
                      <WhatsAppIcon className="w-3 h-3 fill-current" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
