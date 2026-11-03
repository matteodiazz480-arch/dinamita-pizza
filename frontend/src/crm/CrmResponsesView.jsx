import React, { useState, useMemo } from "react";
import {
  Search,
  Phone,
  Trash2,
  ArrowRight,
} from "lucide-react";
import { WhatsAppIcon } from "../components/Icons";

export default function CrmResponsesView({
  leads = [],
  onUpdateLead,
  onDeleteLead,
  onNavigateCommercial,
}) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredResponses = useMemo(() => {
    return leads.filter((lead) => {
      const matchSearch =
        !searchTerm.trim() ||
        (lead.fullName && lead.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (lead.businessName && lead.businessName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (lead.phone && lead.phone.includes(searchTerm)) ||
        (lead.service && lead.service.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchSearch;
    });
  }, [leads, searchTerm]);

  const getWhatsAppReplyUrl = (lead) => {
    const cleanNumber = (lead.phone || "").replace(/[^0-9]/g, "");
    const msg = `Hola ${lead.fullName || ""}, gracias por tu mensaje en NEXO Creative sobre ${lead.service || "tu proyecto"}. ¿En qué horario podemos coordinar una llamada breve?`;
    return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(msg)}`;
  };

  const handleTransferToPipeline = async (lead) => {
    const id = lead.id || lead.refId;
    await onUpdateLead(id, {
      status: "contactado",
      origin: "Formulario Web",
      priority: "alta",
    });
    onNavigateCommercial();
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
            placeholder="Buscar respuestas por nombre, negocio o teléfono..."
            className="w-full bg-[#181a20] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#16A34A]"
          />
        </div>

        <div className="text-xs text-gray-400 font-semibold px-2">
          Total respuestas web: <strong className="text-white">{filteredResponses.length}</strong>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* VISTA MÓVIL (TARJETAS: Sin desbordamiento)                          */}
      {/* ------------------------------------------------------------------ */}
      <div className="md:hidden space-y-3">
        {filteredResponses.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-500 bg-[#141519] border border-white/10 rounded-2xl">
            No hay respuestas de formularios web registradas.
          </div>
        ) : (
          filteredResponses.map((lead) => {
            const id = lead.id || lead.refId;

            return (
              <div
                key={id}
                className="bg-[#141519] border border-white/10 rounded-2xl p-4 text-white shadow-md space-y-3"
              >
                <div className="flex items-start justify-between gap-2 border-b border-white/5 pb-2.5">
                  <div>
                    <span className="font-mono text-[9px] text-gray-400 block">{lead.refId || id}</span>
                    <h3 className="font-extrabold text-sm text-white leading-tight">
                      {lead.fullName}
                    </h3>
                    <p className="text-[11px] text-gray-300 font-medium">
                      {lead.businessName || "Negocio no especificado"}
                    </p>
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono">
                    {lead.createdAt ? lead.createdAt.slice(0, 10) : "Hoy"}
                  </span>
                </div>

                <div className="space-y-1 text-[11px] text-gray-300">
                  <div>
                    <span className="text-gray-400 text-[10px]">Servicio de Interés: </span>
                    <strong className="text-white">{lead.service}</strong>
                  </div>
                  {lead.rubro && (
                    <div>
                      <span className="text-gray-400 text-[10px]">Rubro: </span>
                      <span>{lead.rubro}</span>
                    </div>
                  )}
                  {lead.message && (
                    <div className="p-2.5 bg-[#181a20] rounded-xl border border-white/5 text-gray-300 text-xs mt-1">
                      {lead.message}
                    </div>
                  )}
                </div>

                {/* Botón Pasar al Pipeline Comercial */}
                <button
                  type="button"
                  onClick={() => handleTransferToPipeline(lead)}
                  className="w-full py-2 px-3 rounded-xl bg-[#16A34A]/15 hover:bg-[#16A34A]/25 border border-[#16A34A]/30 text-[#22C55E] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>Pasar a CRM Comercial</span>
                </button>

                {/* Acciones de Contacto */}
                <div className="flex items-center gap-2 pt-1 border-t border-white/5">
                  <a
                    href={getWhatsAppReplyUrl(lead)}
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
                      if (window.confirm("¿Eliminar esta respuesta?")) {
                        onDeleteLead(id);
                      }
                    }}
                    className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 cursor-pointer"
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
      {/* VISTA ESCRITORIO (TABLA: Hoja Respuestas formulario del Excel)    */}
      {/* ------------------------------------------------------------------ */}
      <div className="hidden md:block bg-[#141519] border border-white/10 rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-[#181a20] text-gray-400 uppercase text-[10px] tracking-wider border-b border-white/10">
              <tr>
                <th className="py-3 px-4">Marca Temporal</th>
                <th className="py-3 px-4">Nombre y Apellido</th>
                <th className="py-3 px-4">Negocio / Rubro</th>
                <th className="py-3 px-4">WhatsApp</th>
                <th className="py-3 px-4">Servicio de Interés</th>
                <th className="py-3 px-4">Consulta / Mensaje</th>
                <th className="py-3 px-4 text-right">Acción Comercial</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredResponses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    No hay respuestas de formularios registradas.
                  </td>
                </tr>
              ) : (
                filteredResponses.map((lead) => {
                  const id = lead.id || lead.refId;

                  return (
                    <tr key={id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4 font-mono text-gray-400 whitespace-nowrap">
                        {lead.createdAt ? lead.createdAt.slice(0, 16).replace("T", " ") : "-"}
                      </td>

                      <td className="py-3.5 px-4 font-extrabold text-white text-sm">
                        {lead.fullName}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">{lead.businessName || "-"}</div>
                        <div className="text-[11px] text-gray-400">{lead.rubro || "General"}</div>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-gray-200">
                        {lead.phone}
                      </td>

                      <td className="py-3.5 px-4 text-gray-200">
                        {lead.service}
                      </td>

                      <td className="py-3.5 px-4 text-gray-400 max-w-[200px] truncate">
                        {lead.message || "-"}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleTransferToPipeline(lead)}
                            className="px-2.5 py-1.5 rounded-lg bg-[#16A34A]/15 hover:bg-[#16A34A]/25 border border-[#16A34A]/30 text-[#22C55E] text-xs font-bold flex items-center gap-1 cursor-pointer"
                            title="Pasar a CRM Comercial"
                          >
                            <span>Pasar a CRM</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>

                          <a
                            href={getWhatsAppReplyUrl(lead)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-[#25D366]/15 hover:bg-[#25D366]/30 text-[#25D366] transition-colors"
                            title="Responder por WhatsApp"
                          >
                            <WhatsAppIcon className="w-4 h-4 fill-current" />
                          </a>

                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm("¿Eliminar esta respuesta?")) {
                                onDeleteLead(id);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 cursor-pointer"
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
