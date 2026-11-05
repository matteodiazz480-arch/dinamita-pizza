import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  Phone,
  Calendar,
  Trash2,
  UserCheck,
  Edit3,
} from "lucide-react";
import { WhatsAppIcon } from "../components/Icons";

const STAGES = [
  { value: "all", label: "Todas las Etapas" },
  { value: "nuevo", label: "Nuevo" },
  { value: "contactado", label: "Contactado" },
  { value: "reunion_agendada", label: "Reunión Agendada" },
  { value: "propuesta_enviada", label: "Propuesta Enviada" },
  { value: "negociacion", label: "En Negociación" },
  { value: "ganado", label: "Ganado (Cliente)" },
  { value: "perdido", label: "Perdido" },
];

const STAGE_COLORS = {
  nuevo: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  contactado: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  reunion_agendada: "bg-[#16A34A]/15 text-[#22C55E] border-[#16A34A]/30",
  propuesta_enviada: "bg-purple-500/15 text-purple-300 border-purple-500/30",
  negociacion: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
  ganado: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  perdido: "bg-gray-500/15 text-gray-400 border-gray-500/30",
};

const PRIORITIES = {
  alta: "text-red-400 bg-red-500/10 border-red-500/25",
  media: "text-amber-400 bg-amber-500/10 border-amber-500/25",
  baja: "text-gray-400 bg-gray-500/10 border-gray-500/25",
};

const ORIGIN_STYLES = {
  "Solicitar Asesoramiento": "bg-blue-500/15 text-blue-300 border-blue-500/30",
  "Solicitar Presupuesto": "bg-purple-500/15 text-purple-300 border-purple-500/30",
  "Encontrá tu plan": "bg-[#16A34A]/15 text-[#22C55E] border-[#16A34A]/30",
  "Agenda Reunión 20 min": "bg-amber-500/15 text-amber-300 border-amber-500/30",
};

export default function CrmCommercialView({
  leads = [],
  onUpdateLead,
  onDeleteLead,
  onConvertToClient,
  onConvertToCustomerProfile,
  onOpenNewLead,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStage, setSelectedStage] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [editingNotesId, setEditingNotesId] = useState(null);
  const [tempNotes, setTempNotes] = useState("");

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchSearch =
        !searchTerm.trim() ||
        (lead.fullName && lead.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (lead.businessName && lead.businessName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (lead.phone && lead.phone.includes(searchTerm)) ||
        (lead.rubro && lead.rubro.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchStage = selectedStage === "all" || lead.status === selectedStage;
      const matchPriority =
        selectedPriority === "all" || lead.priority === selectedPriority;

      return matchSearch && matchStage && matchPriority;
    });
  }, [leads, searchTerm, selectedStage, selectedPriority]);

  const handleStageChange = async (id, newStage) => {
    await onUpdateLead(id, { status: newStage });
  };

  const handleStartEditNotes = (lead) => {
    setEditingNotesId(lead.id || lead.refId);
    setTempNotes(lead.notes || "");
  };

  const handleSaveNotes = async (leadId) => {
    await onUpdateLead(leadId, { notes: tempNotes });
    setEditingNotesId(null);
  };

  const getWhatsAppLeadUrl = (lead) => {
    const cleanNumber = (lead.phone || "").replace(/[^0-9]/g, "");
    const msg = `Hola ${lead.fullName || ""}, te contacto de NEXO Creative sobre tu consulta por ${lead.service || "nuestros servicios"}. ¿Tenés unos minutos para conversar?`;
    return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="space-y-4">
      {/* ------------------------------------------------------------------ */}
      {/* FILTROS Y BÚSQUEDA                                                */}
      {/* ------------------------------------------------------------------ */}
      <div className="bg-[#141519] border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-md">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por cliente, negocio, rubro o teléfono..."
            className="w-full bg-[#181a20] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#16A34A]"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-1.5 bg-[#181a20] border border-white/10 rounded-xl px-3 py-2 text-xs">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="bg-transparent text-gray-300 focus:outline-none cursor-pointer"
            >
              {STAGES.map((s) => (
                <option key={s.value} value={s.value} className="bg-[#181a20]">
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-[#181a20] border border-white/10 rounded-xl px-3 py-2 text-xs">
            <span className="text-gray-400">Prioridad:</span>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="bg-transparent text-gray-300 focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#181a20]">Todas</option>
              <option value="alta" className="bg-[#181a20]">Alta</option>
              <option value="media" className="bg-[#181a20]">Media</option>
              <option value="baja" className="bg-[#181a20]">Baja</option>
            </select>
          </div>

          <button
            type="button"
            onClick={onOpenNewLead}
            className="sm:hidden px-3 py-2 rounded-xl bg-[#16A34A] text-white text-xs font-black"
          >
            + Nueva Oportunidad
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* VISTA MÓVIL (TARJETAS APP: Sin desbordamiento horizontal)           */}
      {/* ------------------------------------------------------------------ */}
      <div className="md:hidden space-y-3">
        {filteredLeads.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-500 bg-[#141519] border border-white/10 rounded-2xl">
            No se encontraron oportunidades registradas.
          </div>
        ) : (
          filteredLeads.map((lead) => {
            const id = lead.id || lead.refId;
            const stageColor = STAGE_COLORS[lead.status] || STAGE_COLORS.nuevo;
            const priorityBadge = PRIORITIES[lead.priority] || PRIORITIES.media;
            const isEditing = editingNotesId === id;
            const isWon = lead.status === "ganado";
            const fee = Number(lead.feeARS) || 0;
            const prob = Number(lead.probability) || 50;
            const estimated = Math.round(fee * (prob / 100));

            return (
              <div
                key={id}
                className="bg-[#141519] border border-white/10 rounded-2xl p-4 text-white shadow-md space-y-3"
              >
                {/* Cabecera de la Tarjeta */}
                <div className="flex items-start justify-between gap-2 border-b border-white/5 pb-2.5">
                  <div>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="font-mono text-[9px] text-gray-400">{lead.refId || id}</span>
                      {lead.origin && (
                        <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded border ${ORIGIN_STYLES[lead.origin] || "bg-white/5 text-gray-400 border-white/10"}`}>
                          {lead.origin}
                        </span>
                      )}
                    </div>
                    <h3 className="font-extrabold text-sm text-white leading-tight">
                      {lead.businessName || lead.fullName}
                    </h3>
                    <p className="text-[11px] text-gray-300 font-medium">{lead.fullName}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${stageColor}`}>
                      {lead.status ? lead.status.replace("_", " ") : "Nuevo"}
                    </span>
                    {lead.priority && (
                      <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded border ${priorityBadge}`}>
                        {lead.priority}
                      </span>
                    )}
                  </div>
                </div>

                {/* Datos del Negocio & Contacto */}
                <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-300">
                  <div>
                    <span className="text-gray-400 text-[10px] block">Rubro:</span>
                    <span className="font-semibold text-white truncate block">{lead.rubro || "General"}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px] block">Servicio:</span>
                    <span className="font-semibold text-white truncate block">{lead.service || "Meta Ads"}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px] block">Honorarios ARS:</span>
                    <span className="font-mono font-bold text-[#22C55E] block">
                      ${fee.toLocaleString("es-AR")}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px] block">Estimado ({prob}%):</span>
                    <span className="font-mono font-bold text-white block">
                      ${estimated.toLocaleString("es-AR")}
                    </span>
                  </div>
                </div>

                {/* Próximo contacto y Redes */}
                <div className="bg-[#181a20] rounded-xl p-2.5 border border-white/5 text-[11px] flex items-center justify-between text-gray-300">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#22C55E]" />
                    <span>Próx. Contacto: <strong className="text-white">{lead.nextContactDate || "A definir"}</strong></span>
                  </div>
                  {lead.socials && (
                    <span className="text-[10px] text-gray-400 font-mono truncate max-w-[120px]">
                      {lead.socials}
                    </span>
                  )}
                </div>

                {/* Cambiar Etapa Comercial con un toque */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-400 font-bold uppercase">Etapa:</span>
                  <select
                    value={lead.status || "nuevo"}
                    onChange={(e) => handleStageChange(id, e.target.value)}
                    className="flex-1 bg-[#181a20] border border-white/12 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#16A34A]"
                  >
                    {STAGES.filter((s) => s.value !== "all").map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Botón Convertir a Ficha de Atención o Cliente Activo */}
                <div className="flex flex-col gap-1.5">
                  {onConvertToCustomerProfile && (
                    <button
                      type="button"
                      onClick={() => onConvertToCustomerProfile(lead)}
                      className="w-full py-1.5 px-3 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>Abrir Ficha de Atención</span>
                    </button>
                  )}

                  {isWon && onConvertToClient && (
                    <button
                      type="button"
                      onClick={() => onConvertToClient(lead)}
                      className="w-full py-2 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Convertir a Cliente Activo</span>
                    </button>
                  )}
                </div>

                {/* Notas / Observaciones */}
                <div className="border-t border-white/5 pt-2">
                  {isEditing ? (
                    <div className="space-y-1.5">
                      <textarea
                        rows={2}
                        value={tempNotes}
                        onChange={(e) => setTempNotes(e.target.value)}
                        placeholder="Observaciones de la oportunidad..."
                        className="w-full bg-[#181a20] border border-white/12 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#16A34A]"
                      />
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEditingNotesId(null)}
                          className="px-2 py-1 text-[10px] text-gray-400"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveNotes(id)}
                          className="px-2.5 py-1 rounded bg-[#16A34A] text-white font-bold text-[10px]"
                        >
                          Guardar Nota
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => handleStartEditNotes(lead)}
                      className="cursor-pointer text-[11px] text-gray-400 hover:text-white flex items-center justify-between"
                    >
                      <span className="italic truncate max-w-[240px]">
                        {lead.notes ? `Obs: ${lead.notes}` : "Click para agregar observaciones..."}
                      </span>
                      <Edit3 className="w-3 h-3 text-gray-500" />
                    </div>
                  )}
                </div>

                {/* Botones de Acción (Llamada, WhatsApp, Borrar) */}
                <div className="flex items-center gap-2 pt-1 border-t border-white/5">
                  <a
                    href={getWhatsAppLeadUrl(lead)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 px-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <WhatsAppIcon className="w-3.5 h-3.5 fill-current" />
                    <span>WhatsApp</span>
                  </a>

                  <a
                    href={`tel:${(lead.phone || "").replace(/[^0-9+]/g, "")}`}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10"
                    title="Llamar"
                  >
                    <Phone className="w-4 h-4" />
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm("¿Seguro de eliminar esta oportunidad?")) {
                        onDeleteLead(id);
                      }
                    }}
                    className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* VISTA ESCRITORIO (TABLA COMPLETA: Exacta al Excel CRM Comercial)   */}
      {/* ------------------------------------------------------------------ */}
      <div className="hidden md:block bg-[#141519] border border-white/10 rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-[#181a20] text-gray-400 uppercase text-[10px] tracking-wider border-b border-white/10">
              <tr>
                <th className="py-3 px-4">ID &amp; Ingreso</th>
                <th className="py-3 px-4">Cliente / Negocio</th>
                <th className="py-3 px-4">Rubro / Servicio</th>
                <th className="py-3 px-4">Contacto</th>
                <th className="py-3 px-4">Etapa Comercial</th>
                <th className="py-3 px-4">Honorarios (ARS)</th>
                <th className="py-3 px-4">Prob % / Estimado</th>
                <th className="py-3 px-4">Próx. Contacto</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-gray-500">
                    No hay oportunidades comerciales que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => {
                  const id = lead.id || lead.refId;
                  const stageColor = STAGE_COLORS[lead.status] || STAGE_COLORS.nuevo;
                  const fee = Number(lead.feeARS) || 0;
                  const prob = Number(lead.probability) || 50;
                  const estimated = Math.round(fee * (prob / 100));
                  const isWon = lead.status === "ganado";

                  return (
                    <tr key={id} className="hover:bg-white/[0.02] transition-colors">
                      {/* ID y Fecha */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-white block">{lead.refId || id}</span>
                        <span className="text-[10px] text-gray-500 block">
                          {lead.createdAt ? lead.createdAt.slice(0, 10) : "-"}
                        </span>
                      </td>

                      {/* Cliente / Negocio */}
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-white text-sm">
                          {lead.businessName || lead.fullName}
                        </div>
                        <div className="text-[11px] text-gray-400 font-medium">
                          {lead.fullName}
                        </div>
                        {lead.origin && (
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border mt-1 inline-block ${ORIGIN_STYLES[lead.origin] || "bg-white/5 text-gray-400 border-white/10"}`}>
                            {lead.origin}
                          </span>
                        )}
                      </td>

                      {/* Rubro / Servicio */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">{lead.rubro || "Comercios"}</div>
                        <div className="text-[11px] text-gray-400 truncate max-w-[150px]">{lead.service}</div>
                      </td>

                      {/* Contacto */}
                      <td className="py-3.5 px-4 font-mono text-[11px]">
                        <div className="text-gray-200">{lead.phone}</div>
                        {lead.socials && <div className="text-gray-400 truncate max-w-[120px]">{lead.socials}</div>}
                      </td>

                      {/* Etapa Comercial (Selector rápido) */}
                      <td className="py-3.5 px-4">
                        <select
                          value={lead.status || "nuevo"}
                          onChange={(e) => handleStageChange(id, e.target.value)}
                          className={`bg-[#181a20] border text-xs font-bold rounded-lg px-2 py-1 cursor-pointer focus:outline-none ${stageColor}`}
                        >
                          {STAGES.filter((s) => s.value !== "all").map((s) => (
                            <option key={s.value} value={s.value} className="bg-[#181a20] text-white">
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Honorarios ARS */}
                      <td className="py-3.5 px-4 font-mono font-bold text-[#22C55E]">
                        ${fee.toLocaleString("es-AR")}
                      </td>

                      {/* Probabilidad e Ingreso Estimado */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-white text-[11px] block">{prob}%</span>
                        <span className="font-mono text-[11px] text-gray-400 block">
                          ${estimated.toLocaleString("es-AR")}
                        </span>
                      </td>

                      {/* Próximo Contacto */}
                      <td className="py-3.5 px-4 text-gray-300 text-[11px] whitespace-nowrap">
                        {lead.nextContactDate || "-"}
                      </td>

                      {/* Acciones */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isWon && onConvertToClient && (
                            <button
                              type="button"
                              onClick={() => onConvertToClient(lead)}
                              className="p-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-300 transition-colors cursor-pointer"
                              title="Convertir a Cliente Activo"
                            >
                              <UserCheck className="w-4 h-4" />
                            </button>
                          )}

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
                              if (window.confirm("¿Seguro de eliminar esta oportunidad?")) {
                                onDeleteLead(id);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/25 text-red-400 transition-colors cursor-pointer"
                            title="Eliminar"
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
