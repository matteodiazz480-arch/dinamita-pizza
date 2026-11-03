import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  Phone,
  Building2,
  Trash2,
  Calendar,
} from "lucide-react";
import { WhatsAppIcon } from "../components/Icons";

const STATUS_OPTIONS = [
  { value: "all", label: "Todos los Estados" },
  { value: "reunion_agendada", label: "Reunión Agendada" },
  { value: "nuevo", label: "Nuevos (Sin contactar)" },
  { value: "contactado", label: "Contactados" },
  { value: "ganado", label: "Ganados / Clientes" },
  { value: "archivado", label: "Archivados" },
];

export default function CrmLeadsTable({ leads, onUpdateLead, onDeleteLead }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [onlyMeetings, setOnlyMeetings] = useState(false);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchSearch =
        !searchTerm.trim() ||
        (lead.fullName && lead.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (lead.businessName && lead.businessName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (lead.phone && lead.phone.includes(searchTerm)) ||
        (lead.email && lead.email.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchStatus =
        selectedStatus === "all" || lead.status === selectedStatus;

      const matchOnlyMeetings =
        !onlyMeetings ||
        lead.service === "Reunión Gratuita 20 min" ||
        Boolean(lead.meetingDate);

      return matchSearch && matchStatus && matchOnlyMeetings;
    });
  }, [leads, searchTerm, selectedStatus, onlyMeetings]);

  const getWhatsAppLeadUrl = (lead) => {
    const cleanNumber = (lead.phone || "").replace(/[^0-9]/g, "");
    const msg = `Hola ${lead.fullName || ""}, te contacto de NEXO Creative sobre tu consulta en nuestra web. ¿Cómo podemos ayudarte con tu marca?`;
    return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="space-y-4">
      {/* Barra de Búsqueda y Filtros */}
      <div className="bg-[#141519] border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, negocio, teléfono o email..."
            className="w-full bg-[#181a20] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#16A34A]"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-1.5 bg-[#181a20] border border-white/10 rounded-xl px-3 py-2 text-xs">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent text-gray-300 focus:outline-none cursor-pointer"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-[#181a20]">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => setOnlyMeetings(!onlyMeetings)}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              onlyMeetings
                ? "bg-[#16A34A] border-[#16A34A] text-white"
                : "bg-[#181a20] border-white/10 text-gray-300 hover:text-white"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Solo Reuniones 20 min</span>
          </button>
        </div>
      </div>

      {/* Tabla de Resultados */}
      <div className="bg-[#141519] border border-white/10 rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-[#181a20] text-gray-400 uppercase text-[10px] tracking-wider border-b border-white/10">
              <tr>
                <th className="py-3 px-4">Cliente / Negocio</th>
                <th className="py-3 px-4">Contacto</th>
                <th className="py-3 px-4">Servicio / Reunión</th>
                <th className="py-3 px-4">Fecha Alta</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    No se encontraron registros que coincidan con los filtros.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => {
                  const id = lead.id || lead.refId;
                  const isMeeting =
                    lead.service === "Reunión Gratuita 20 min" || Boolean(lead.meetingDate);

                  return (
                    <tr key={id} className="hover:bg-white/[0.02] transition-colors">
                      {/* Cliente / Negocio */}
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-white text-sm">
                          {lead.fullName}
                        </div>
                        {lead.businessName && (
                          <div className="text-gray-400 text-[11px] flex items-center gap-1 mt-0.5">
                            <Building2 className="w-3 h-3" />
                            <span>{lead.businessName}</span>
                          </div>
                        )}
                        {lead.refId && (
                          <div className="text-gray-600 font-mono text-[9px] mt-0.5">
                            {lead.refId}
                          </div>
                        )}
                      </td>

                      {/* Contacto */}
                      <td className="py-3.5 px-4 space-y-0.5 font-mono text-[11px]">
                        <div className="text-gray-200">{lead.phone}</div>
                        {lead.email && (
                          <div className="text-gray-400 truncate max-w-[160px]">
                            {lead.email}
                          </div>
                        )}
                      </td>

                      {/* Servicio / Fecha reunión */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            isMeeting
                              ? "bg-[#16A34A]/15 text-[#22C55E] border border-[#16A34A]/30"
                              : "bg-white/5 text-gray-300"
                          }`}
                        >
                          {lead.service}
                        </span>
                        {lead.meetingDate && (
                          <div className="text-[#22C55E] font-bold text-[10px] mt-1 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>
                              {lead.meetingDate} {lead.meetingTime ? `· ${lead.meetingTime} hs` : ""}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Fecha de creación */}
                      <td className="py-3.5 px-4 text-gray-400 text-[11px] whitespace-nowrap">
                        {lead.createdAt
                          ? new Date(lead.createdAt).toLocaleDateString("es-AR", {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "-"}
                      </td>

                      {/* Selector de Estado */}
                      <td className="py-3.5 px-4">
                        <select
                          value={lead.status || "nuevo"}
                          onChange={(e) => onUpdateLead(id, e.target.value)}
                          className="bg-[#181a20] border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-[#16A34A] cursor-pointer"
                        >
                          <option value="nuevo">Nuevo</option>
                          <option value="reunion_agendada">Reunión Agendada</option>
                          <option value="contactado">Contactado</option>
                          <option value="ganado">Cerrado / Ganado</option>
                          <option value="archivado">Archivado</option>
                        </select>
                      </td>

                      {/* Acciones */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={getWhatsAppLeadUrl(lead)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-[#25D366]/15 hover:bg-[#25D366]/30 text-[#25D366] transition-colors"
                            title="Hablar por WhatsApp"
                          >
                            <WhatsAppIcon className="w-4 h-4 fill-current" />
                          </a>

                          <a
                            href={`tel:${(lead.phone || "").replace(/[^0-9+]/g, "")}`}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white transition-colors"
                            title="Llamar"
                          >
                            <Phone className="w-4 h-4" />
                          </a>

                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm("¿Seguro de eliminar este lead?")) {
                                onDeleteLead(id);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/25 text-red-400 transition-colors cursor-pointer"
                            title="Eliminar lead"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
