import React, { useState } from "react";
import {
  RefreshCw,
  LogOut,
  Download,
  Plus,
  Calendar,
  Table,
  ExternalLink,
} from "lucide-react";
import { BrandLogo } from "../components/Icons";
import CrmStatsCards from "./CrmStatsCards";
import CrmMeetingsView from "./CrmMeetingsView";
import CrmLeadsTable from "./CrmLeadsTable";
import CrmNewLeadModal from "./CrmNewLeadModal";

export default function CrmDashboard({
  leads,
  onRefresh,
  onUpdateLead,
  onCreateLead,
  onDeleteLead,
  onLogout,
  onNavigateLanding,
}) {
  const [activeTab, setActiveTab] = useState("meetings"); // "meetings" | "table"
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh();
    setTimeout(() => setRefreshing(false), 500);
  };

  const exportCsv = () => {
    if (leads.length === 0) return;
    const headers = [
      "ID",
      "Fecha Alta",
      "Nombre",
      "Negocio",
      "Telefono",
      "Email",
      "Servicio",
      "Fecha Reunion",
      "Hora Reunion",
      "Estado",
      "Mensaje",
      "Notas Internas",
    ];
    const rows = leads.map((l) => [
      `"${l.refId || l.id || ""}"`,
      `"${l.createdAt || ""}"`,
      `"${(l.fullName || "").replace(/"/g, '""')}"`,
      `"${(l.businessName || "").replace(/"/g, '""')}"`,
      `"${(l.phone || "").replace(/"/g, '""')}"`,
      `"${(l.email || "").replace(/"/g, '""')}"`,
      `"${(l.service || "").replace(/"/g, '""')}"`,
      `"${l.meetingDate || ""}"`,
      `"${l.meetingTime || ""}"`,
      `"${l.status || ""}"`,
      `"${(l.message || "").replace(/"/g, '""')}"`,
      `"${(l.notes || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `nexo_leads_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#0d0f12] text-white flex flex-col">
      {/* Barra de Navegación Superior del CRM */}
      <header className="bg-[#141519] border-b border-white/10 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <BrandLogo size="default" />
            <div className="hidden sm:block border-l border-white/10 pl-3">
              <span className="text-xs font-black text-white tracking-wide uppercase">
                Panel CRM & Agenda
              </span>
              <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                <span className="w-1.5 h-1.5 rounded-full bg-[#BCE838]" />
                <span>Base de Datos Conectada</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRefresh}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
              title="Actualizar datos"
            >
              <RefreshCw
                className={`w-4 h-4 ${refreshing ? "animate-spin text-[#BCE838]" : ""}`}
              />
            </button>

            <button
              type="button"
              onClick={exportCsv}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-gray-300 border border-white/10 transition-colors"
              title="Exportar a Excel / CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar CSV</span>
            </button>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-[#BCE838] hover:bg-[#add92b] text-[#111111] text-xs font-black transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nuevo Lead</span>
            </button>

            <button
              type="button"
              onClick={onNavigateLanding}
              className="hidden md:inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-gray-400 hover:text-white transition-colors"
            >
              <span>Ver Landing</span>
              <ExternalLink className="w-3 h-3" />
            </button>

            <button
              type="button"
              onClick={onLogout}
              className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
              title="Cerrar Sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 w-full space-y-6">
        {/* Métricas / Estadísticas */}
        <CrmStatsCards leads={leads} />

        {/* Pestañas de Vista */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab("meetings")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-colors cursor-pointer ${
              activeTab === "meetings"
                ? "bg-[#BCE838] text-[#111111]"
                : "bg-white/5 text-gray-400 hover:text-white"
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Reuniones 20 min</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("table")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-colors cursor-pointer ${
              activeTab === "table"
                ? "bg-[#BCE838] text-[#111111]"
                : "bg-white/5 text-gray-400 hover:text-white"
            }`}
          >
            <Table className="w-4 h-4" />
            <span>Todos los Leads ({leads.length})</span>
          </button>
        </div>

        {/* Contenido de la Pestaña Activa */}
        {activeTab === "meetings" ? (
          <CrmMeetingsView leads={leads} onUpdateLead={onUpdateLead} />
        ) : (
          <CrmLeadsTable
            leads={leads}
            onUpdateLead={onUpdateLead}
            onDeleteLead={onDeleteLead}
          />
        )}
      </main>

      {/* Modal para Crear Lead Manual */}
      <CrmNewLeadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreateLead={onCreateLead}
      />
    </div>
  );
}
