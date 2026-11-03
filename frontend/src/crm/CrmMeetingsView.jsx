import React, { useState } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  Phone,
  Mail,
  Building2,
  ExternalLink,
  Save,
} from "lucide-react";
import { WhatsAppIcon } from "../components/Icons";

const STATUS_LABELS = {
  reunion_agendada: { label: "Reunión Agendada", color: "bg-[#16A34A]/15 text-[#22C55E] border-[#16A34A]/30" },
  contactado: { label: "En Contacto", color: "bg-blue-500/15 text-blue-300 border-blue-500/30" },
  ganado: { label: "Cerrado / Cliente", color: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
  nuevo: { label: "Pendiente", color: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
  archivado: { label: "Archivado / Cancelado", color: "bg-gray-500/15 text-gray-400 border-gray-500/30" },
};

export default function CrmMeetingsView({ leads, onUpdateLead }) {
  const [editingNotesId, setEditingNotesId] = useState(null);
  const [tempNotes, setTempNotes] = useState("");
  const [savingId, setSavingId] = useState(null);

  // Filter leads that are meetings or have a meeting date
  const meetingLeads = leads.filter(
    (l) => l.service === "Reunión Gratuita 20 min" || l.meetingDate
  );

  const handleStartEditNotes = (lead) => {
    setEditingNotesId(lead.id || lead.refId);
    setTempNotes(lead.notes || "");
  };

  const handleSaveNotes = async (leadId) => {
    setSavingId(leadId);
    await onUpdateLead(leadId, undefined, tempNotes);
    setSavingId(null);
    setEditingNotesId(null);
  };

  const handleStatusChange = async (leadId, newStatus) => {
    await onUpdateLead(leadId, newStatus, undefined);
  };

  const getWhatsAppMeetingUrl = (lead) => {
    const cleanNumber = (lead.phone || "").replace(/[^0-9]/g, "");
    const dateStr = lead.meetingDate || "la fecha acordada";
    const timeStr = lead.meetingTime ? `${lead.meetingTime} hs` : "";
    const msg = `Hola ${lead.fullName || ""}, te contacto de NEXO Creative sobre la reunión estratégica de 20 minutos que agendaste para el ${dateStr} ${timeStr}. ¿Confirmamos la conexión por Google Meet?`;
    return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(msg)}`;
  };

  if (meetingLeads.length === 0) {
    return (
      <div className="bg-[#141519] border border-white/10 rounded-2xl p-12 text-center text-gray-400">
        <CalendarIcon className="w-12 h-12 text-gray-600 mx-auto mb-3" />
        <h3 className="text-base font-bold text-white">No hay reuniones agendadas aún</h3>
        <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
          Cuando un cliente reserve una reunión estratégica de 20 min desde la landing page, aparecerá inmediatamente aquí.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-extrabold uppercase tracking-wider text-gray-400 flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#22C55E]" />
          <span>Agenda de Reuniones Estratégicas ({meetingLeads.length})</span>
        </h2>
        <a
          href="https://meet.google.com/new"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-200 border border-white/10 transition-colors"
        >
          <Video className="w-3.5 h-3.5 text-[#22C55E]" />
          <span>Crear sala Google Meet</span>
          <ExternalLink className="w-3 h-3 text-gray-400" />
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {meetingLeads.map((lead) => {
          const id = lead.id || lead.refId;
          const statusConfig = STATUS_LABELS[lead.status] || STATUS_LABELS.reunion_agendada;
          const isEditingNotes = editingNotesId === id;

          return (
            <div
              key={id}
              className="bg-[#141519] border border-white/10 hover:border-white/20 rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-colors shadow-lg"
            >
              <div>
                {/* Cabecera de la tarjeta: Fecha y Estado */}
                <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-white/5">
                  <div className="flex items-center gap-2 text-white">
                    <CalendarIcon className="w-4 h-4 flex-shrink-0" />
                    <span className="text-xs font-black tracking-wide">
                      {lead.meetingDate || "Fecha a confirmar"}{" "}
                      {lead.meetingTime ? `· ${lead.meetingTime} hs` : ""}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${statusConfig.color}`}
                  >
                    {statusConfig.label}
                  </span>
                </div>

                {/* Datos del Cliente */}
                <div className="space-y-1.5">
                  <h3 className="text-base font-black text-white leading-tight">
                    {lead.fullName}
                  </h3>
                  {lead.businessName && (
                    <p className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-gray-400" />
                      <span>{lead.businessName}</span>
                    </p>
                  )}
                  <div className="pt-1 space-y-1 text-xs text-gray-400">
                    <p className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#22C55E]" />
                      <span className="text-gray-200 font-mono">{lead.phone}</span>
                    </p>
                    {lead.email && (
                      <p className="flex items-center gap-1.5 truncate">
                        <Mail className="w-3.5 h-3.5 text-gray-500" />
                        <span className="truncate">{lead.email}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Mensaje original o consulta */}
                {lead.message && (
                  <div className="mt-3 p-2.5 rounded-xl bg-[#181a20] border border-white/5 text-[11px] text-gray-300 line-clamp-2">
                    {lead.message}
                  </div>
                )}

                {/* Sección de Notas Internas */}
                <div className="mt-3 pt-2.5 border-t border-white/5">
                  {isEditingNotes ? (
                    <div className="space-y-2">
                      <textarea
                        rows={2}
                        value={tempNotes}
                        onChange={(e) => setTempNotes(e.target.value)}
                        placeholder="Escribí notas de la reunión..."
                        className="w-full bg-[#181a20] border border-white/15 rounded-lg p-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#16A34A]"
                      />
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEditingNotesId(null)}
                          className="px-2 py-1 rounded text-[11px] text-gray-400 hover:text-white"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          disabled={savingId === id}
                          onClick={() => handleSaveNotes(id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#16A34A] text-white font-bold text-[11px] hover:bg-[#15803D]"
                        >
                          <Save className="w-3 h-3" />
                          <span>Guardar</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => handleStartEditNotes(lead)}
                      className="cursor-pointer group flex items-start justify-between text-[11px] text-gray-400 hover:text-gray-200"
                    >
                      <span className="italic truncate max-w-[200px]">
                        {lead.notes ? `Nota: ${lead.notes}` : "Click para agregar notas internas..."}
                      </span>
                      <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        Editar
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="mt-4 pt-3 border-t border-white/5 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={getWhatsAppMeetingUrl(lead)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-black py-2 px-3 rounded-xl transition-all shadow-sm"
                  >
                    <WhatsAppIcon className="w-3.5 h-3.5 fill-current" />
                    <span>WhatsApp</span>
                  </a>

                  <a
                    href={`tel:${(lead.phone || "").replace(/[^0-9+]/g, "")}`}
                    className="inline-flex items-center justify-center gap-1.5 bg-white/10 hover:bg-white/15 text-white text-xs font-bold py-2 px-3 rounded-xl transition-colors border border-white/10"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Llamar</span>
                  </a>
                </div>

                {/* Selector rápido de estado */}
                <select
                  value={lead.status || "reunion_agendada"}
                  onChange={(e) => handleStatusChange(id, e.target.value)}
                  className="w-full bg-[#181a20] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-[#16A34A] cursor-pointer"
                >
                  <option value="reunion_agendada">Reunión Agendada</option>
                  <option value="contactado">En Contacto / Realizada</option>
                  <option value="ganado">Cerrado / Cliente Ganado</option>
                  <option value="archivado">Archivar / Cancelar</option>
                </select>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
