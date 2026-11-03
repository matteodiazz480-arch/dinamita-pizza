import React, { useState, useMemo } from "react";
import {
  Search,
  Plus,
  Briefcase,
  Calendar,
  Phone,
  Trash2,
  DollarSign,
  Edit3,
} from "lucide-react";
import { WhatsAppIcon } from "../components/Icons";

const CLIENT_STATUSES = {
  activo: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  por_renovar: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  pausado: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  finalizado: "bg-gray-500/15 text-gray-400 border-gray-500/30",
};

export default function CrmClientsView({
  clients = [],
  onUpdateClient,
  onDeleteClient,
  onOpenNewClient,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      const matchSearch =
        !searchTerm.trim() ||
        (c.clientName && c.clientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.service && c.service.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.contact && c.contact.includes(searchTerm));
      const matchStatus = statusFilter === "all" || c.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [clients, searchTerm, statusFilter]);

  const totalMonthlyFees = clients
    .filter((c) => c.status === "activo" || c.status === "por_renovar")
    .reduce((acc, c) => acc + (Number(c.feeARS) || 0), 0);

  const totalAdBudget = clients
    .filter((c) => c.status === "activo" || c.status === "por_renovar")
    .reduce((acc, c) => acc + (Number(c.adBudget) || 0), 0);

  const getWhatsAppRenewalUrl = (client) => {
    const cleanNumber = (client.contact || "").replace(/[^0-9]/g, "");
    const msg = `Hola ${client.clientName || ""}, te contacto de NEXO Creative para coordinar la renovación del servicio mensual de ${client.service || "marketing y publicidad"} (Vencimiento: ${client.renewalDate || "este mes"}). ¿Te enviamos los datos de pago?`;
    return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(msg)}`;
  };

  const handleStatusChange = async (id, newStatus) => {
    await onUpdateClient(id, { status: newStatus });
  };

  return (
    <div className="space-y-4">
      {/* ------------------------------------------------------------------ */}
      {/* TARJETAS RESUMEN DE CLIENTES ACTIVOS                               */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-[#141519] border border-[#16A34A]/30 rounded-2xl p-4 flex items-center justify-between shadow-md">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block">
              Honorarios Mensuales Activos
            </span>
            <span className="text-xl sm:text-2xl font-black text-[#22C55E] font-mono mt-1 block">
              ${totalMonthlyFees.toLocaleString("es-AR")}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#16A34A]/15 text-[#22C55E]">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#141519] border border-white/10 rounded-2xl p-4 flex items-center justify-between shadow-md">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block">
              Pauta Anuncios Gestionada
            </span>
            <span className="text-xl sm:text-2xl font-black text-white font-mono mt-1 block">
              ${totalAdBudget.toLocaleString("es-AR")}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-blue-500/15 text-blue-400">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#141519] border border-white/10 rounded-2xl p-4 flex items-center justify-between shadow-md">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block">
              Total Clientes en Cartera
            </span>
            <span className="text-xl sm:text-2xl font-black text-white mt-1 block">
              {clients.length}
            </span>
          </div>
          <button
            type="button"
            onClick={onOpenNewClient}
            className="px-3 py-2 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-black flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Nuevo Cliente</span>
          </button>
        </div>
      </div>

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
            placeholder="Buscar por cliente, servicio o teléfono..."
            className="w-full bg-[#181a20] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#16A34A]"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-[#181a20] border border-white/10 rounded-xl px-3 py-2 text-xs">
            <span className="text-gray-400">Estado:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-gray-300 focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#181a20]">Todos</option>
              <option value="activo" className="bg-[#181a20]">Activo</option>
              <option value="por_renovar" className="bg-[#181a20]">Por Renovar</option>
              <option value="pausado" className="bg-[#181a20]">Pausado</option>
              <option value="finalizado" className="bg-[#181a20]">Finalizado</option>
            </select>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* VISTA MÓVIL (TARJETAS APP: Sin desbordamiento)                      */}
      {/* ------------------------------------------------------------------ */}
      <div className="md:hidden space-y-3">
        {filteredClients.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-500 bg-[#141519] border border-white/10 rounded-2xl">
            No se encontraron clientes activos registrados.
          </div>
        ) : (
          filteredClients.map((client) => {
            const id = client.id || client.refId;
            const statusClass = CLIENT_STATUSES[client.status] || CLIENT_STATUSES.activo;
            const fee = Number(client.feeARS) || 0;
            const ad = Number(client.adBudget) || 0;

            return (
              <div
                key={id}
                className="bg-[#141519] border border-white/10 rounded-2xl p-4 text-white shadow-md space-y-3"
              >
                <div className="flex items-start justify-between gap-2 border-b border-white/5 pb-2.5">
                  <div>
                    <span className="font-mono text-[9px] text-gray-400 block">{client.refId || id}</span>
                    <h3 className="font-extrabold text-sm text-white leading-tight">
                      {client.clientName}
                    </h3>
                    <p className="text-[11px] text-gray-300">{client.service}</p>
                  </div>
                  <select
                    value={client.status || "activo"}
                    onChange={(e) => handleStatusChange(id, e.target.value)}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border bg-[#181a20] cursor-pointer ${statusClass}`}
                  >
                    <option value="activo">Activo</option>
                    <option value="por_renovar">Por Renovar</option>
                    <option value="pausado">Pausado</option>
                    <option value="finalizado">Finalizado</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-300">
                  <div>
                    <span className="text-gray-400 text-[10px] block">Honorarios Mensuales:</span>
                    <span className="font-mono font-bold text-[#22C55E] block">
                      ${fee.toLocaleString("es-AR")}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px] block">Pauta Anuncios:</span>
                    <span className="font-mono font-bold text-white block">
                      ${ad.toLocaleString("es-AR")}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px] block">Próxima Renovación:</span>
                    <span className="font-bold text-white block">
                      {client.renewalDate || "A convenir"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px] block">Responsable:</span>
                    <span className="text-gray-200 block truncate">
                      {client.responsible || "Mateo Díaz"}
                    </span>
                  </div>
                </div>

                {client.notes && (
                  <div className="bg-[#181a20] rounded-xl p-2.5 border border-white/5 text-[11px] text-gray-300">
                    <span className="text-gray-400 text-[10px] block mb-0.5">Notas operativas:</span>
                    <p className="line-clamp-2">{client.notes}</p>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-1 border-t border-white/5">
                  <a
                    href={getWhatsAppRenewalUrl(client)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 px-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <WhatsAppIcon className="w-3.5 h-3.5 fill-current" />
                    <span>Aviso Renovación</span>
                  </a>

                  <a
                    href={`tel:${(client.contact || "").replace(/[^0-9+]/g, "")}`}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10"
                    title="Llamar"
                  >
                    <Phone className="w-4 h-4" />
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm("¿Seguro de eliminar este cliente?")) {
                        onDeleteClient(id);
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
      {/* VISTA ESCRITORIO (TABLA: Hoja Clientes Activos del Excel)          */}
      {/* ------------------------------------------------------------------ */}
      <div className="hidden md:block bg-[#141519] border border-white/10 rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-[#181a20] text-gray-400 uppercase text-[10px] tracking-wider border-b border-white/10">
              <tr>
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Cliente / Negocio</th>
                <th className="py-3 px-4">Servicio Contratado</th>
                <th className="py-3 px-4">Responsable</th>
                <th className="py-3 px-4">Inicio &amp; Renovación</th>
                <th className="py-3 px-4">Honorarios (ARS)</th>
                <th className="py-3 px-4">Inversión Pauta</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-gray-500">
                    No se encontraron clientes activos en el sistema.
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => {
                  const id = client.id || client.refId;
                  const statusClass = CLIENT_STATUSES[client.status] || CLIENT_STATUSES.activo;
                  const fee = Number(client.feeARS) || 0;
                  const ad = Number(client.adBudget) || 0;

                  return (
                    <tr key={id} className="hover:bg-white/[0.02] transition-colors">
                      {/* ID */}
                      <td className="py-3.5 px-4 font-mono font-bold text-white">
                        {client.refId || id}
                      </td>

                      {/* Cliente / Negocio */}
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-white text-sm">
                          {client.clientName}
                        </div>
                        {client.contact && (
                          <div className="text-[11px] text-gray-400 font-mono">
                            {client.contact}
                          </div>
                        )}
                      </td>

                      {/* Servicio */}
                      <td className="py-3.5 px-4 font-semibold text-gray-200">
                        {client.service}
                      </td>

                      {/* Responsable */}
                      <td className="py-3.5 px-4 text-gray-300">
                        {client.responsible || "Mateo Díaz"}
                      </td>

                      {/* Inicio y Renovación */}
                      <td className="py-3.5 px-4">
                        <div className="text-gray-400 text-[11px]">Inicio: {client.startDate || "-"}</div>
                        <div className="font-bold text-white">Renovación: {client.renewalDate || "-"}</div>
                      </td>

                      {/* Honorarios ARS */}
                      <td className="py-3.5 px-4 font-mono font-bold text-[#22C55E]">
                        ${fee.toLocaleString("es-AR")}
                      </td>

                      {/* Inversión Anuncios */}
                      <td className="py-3.5 px-4 font-mono text-gray-300">
                        ${ad.toLocaleString("es-AR")}
                      </td>

                      {/* Estado */}
                      <td className="py-3.5 px-4">
                        <select
                          value={client.status || "activo"}
                          onChange={(e) => handleStatusChange(id, e.target.value)}
                          className={`text-xs font-bold rounded-lg px-2 py-1 border bg-[#181a20] cursor-pointer focus:outline-none ${statusClass}`}
                        >
                          <option value="activo" className="bg-[#181a20] text-white">Activo</option>
                          <option value="por_renovar" className="bg-[#181a20] text-white">Por Renovar</option>
                          <option value="pausado" className="bg-[#181a20] text-white">Pausado</option>
                          <option value="finalizado" className="bg-[#181a20] text-white">Finalizado</option>
                        </select>
                      </td>

                      {/* Acciones */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={getWhatsAppRenewalUrl(client)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-[#25D366]/15 hover:bg-[#25D366]/30 text-[#25D366] transition-colors"
                            title="Enviar recordatorio de renovación por WhatsApp"
                          >
                            <WhatsAppIcon className="w-4 h-4 fill-current" />
                          </a>

                          <a
                            href={`tel:${(client.contact || "").replace(/[^0-9+]/g, "")}`}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white transition-colors"
                            title="Llamar"
                          >
                            <Phone className="w-4 h-4" />
                          </a>

                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm("¿Seguro de eliminar este cliente?")) {
                                onDeleteClient(id);
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
