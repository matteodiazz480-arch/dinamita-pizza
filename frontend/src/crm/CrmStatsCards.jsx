import React from "react";
import { Calendar, Users, Clock, Trophy } from "lucide-react";

export default function CrmStatsCards({ leads }) {
  const totalLeads = leads.length;
  const meetings = leads.filter(
    (l) => l.service === "Reunión Gratuita 20 min" || l.meetingDate
  );
  const activeMeetings = meetings.filter((l) => l.status === "reunion_agendada");
  const pendingLeads = leads.filter((l) => l.status === "nuevo");
  const wonLeads = leads.filter((l) => l.status === "ganado");

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* Tarjeta 1: Reuniones 20 min */}
      <div className="bg-[#141519] border border-[#BCE838]/25 rounded-2xl p-4 sm:p-5 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400">
            Reuniones 20 min
          </span>
          <div className="p-2 rounded-xl bg-[#BCE838]/15 text-[#BCE838]">
            <Calendar className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-black text-white">{meetings.length}</span>
          <span className="text-xs text-[#BCE838] font-bold">
            ({activeMeetings.length} activas)
          </span>
        </div>
      </div>

      {/* Tarjeta 2: Total Leads */}
      <div className="bg-[#141519] border border-white/10 rounded-2xl p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400">
            Total Contactos
          </span>
          <div className="p-2 rounded-xl bg-white/5 text-gray-300">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2">
          <span className="text-2xl sm:text-3xl font-black text-white">{totalLeads}</span>
        </div>
      </div>

      {/* Tarjeta 3: Pendientes */}
      <div className="bg-[#141519] border border-white/10 rounded-2xl p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400">
            Por Contactar
          </span>
          <div className="p-2 rounded-xl bg-amber-500/15 text-amber-300">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2">
          <span className="text-2xl sm:text-3xl font-black text-white">{pendingLeads.length}</span>
        </div>
      </div>

      {/* Tarjeta 4: Ganados / Clientes */}
      <div className="bg-[#141519] border border-white/10 rounded-2xl p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400">
            Cerrados / Clientes
          </span>
          <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-300">
            <Trophy className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2">
          <span className="text-2xl sm:text-3xl font-black text-white">{wonLeads.length}</span>
        </div>
      </div>
    </div>
  );
}
