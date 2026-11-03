import React, { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Calendar,
  Receipt,
  FileText,
  Download,
  RefreshCw,
  LogOut,
  ExternalLink,
  Plus,
  MoreHorizontal,
  X,
  ChevronRight,
} from "lucide-react";
import { BrandLogo } from "../components/Icons";

export default function CrmNavbar({
  activeTab,
  onSelectTab,
  leadsCount = 0,
  clientsCount = 0,
  meetingsCount = 0,
  onOpenNewLead,
  onOpenNewClient,
  onOpenNewExpense,
  onExportCsv,
  onRefresh,
  refreshing,
  onLogout,
  onNavigateLanding,
}) {
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isPlusMenuOpen, setIsPlusMenuOpen] = useState(false);

  const handleSelectTab = (tabId) => {
    onSelectTab(tabId);
    setIsMoreMenuOpen(false);
    setIsPlusMenuOpen(false);
  };

  return (
    <>
      {/* ------------------------------------------------------------------ */}
      {/* BARRA SUPERIOR DE ESCRITORIO (Desktop Top Header)                 */}
      {/* ------------------------------------------------------------------ */}
      <header className="bg-[#141519] border-b border-white/10 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleSelectTab("dashboard")}
              className="transition-transform duration-200 hover:scale-102 flex-shrink-0 cursor-pointer"
            >
              <BrandLogo size="default" />
            </button>
            <div className="hidden sm:block border-l border-white/10 pl-3">
              <span className="text-xs font-black text-white tracking-wide uppercase">
                Panel CRM &amp; Finanzas
              </span>
              <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                <span>Base Comercial Activa</span>
              </div>
            </div>
          </div>

          {/* Pestañas Principales en Desktop */}
          <nav className="hidden md:flex items-center gap-1 bg-[#181a20] p-1 rounded-xl border border-white/8">
            <button
              type="button"
              onClick={() => handleSelectTab("dashboard")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "dashboard"
                  ? "bg-[#16A34A] text-white shadow-sm"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectTab("commercial")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "commercial"
                  ? "bg-[#16A34A] text-white shadow-sm"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>CRM Comercial</span>
              {leadsCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-white/20 text-white font-extrabold">
                  {leadsCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleSelectTab("clients")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "clients"
                  ? "bg-[#16A34A] text-white shadow-sm"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Clientes Activos</span>
              {clientsCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-white/20 text-white font-extrabold">
                  {clientsCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleSelectTab("meetings")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "meetings"
                  ? "bg-[#16A34A] text-white shadow-sm"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Reuniones 20 min</span>
              {meetingsCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-white/20 text-white font-extrabold">
                  {meetingsCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleSelectTab("responses")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "responses"
                  ? "bg-[#16A34A] text-white shadow-sm"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Formularios Web</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectTab("expenses")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "expenses"
                  ? "bg-[#16A34A] text-white shadow-sm"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Gastos del Mes</span>
            </button>
          </nav>

          {/* Acciones de Cabecera */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onRefresh}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer"
              title="Actualizar datos"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-[#22C55E]" : ""}`} />
            </button>

            {/* Menú de Botón Nuevo */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsPlusMenuOpen(!isPlusMenuOpen)}
                className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-black transition-all shadow-sm cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span className="hidden sm:inline">Nuevo Registro</span>
                <span className="sm:hidden">Nuevo</span>
              </button>

              {isPlusMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-[#181a20] border border-white/12 rounded-xl shadow-2xl p-1.5 z-50 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setIsPlusMenuOpen(false);
                      onOpenNewLead();
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 text-gray-200 hover:text-white flex items-center gap-2 cursor-pointer font-semibold"
                  >
                    <Users className="w-4 h-4 text-[#22C55E]" />
                    <span>Oportunidad / Lead</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsPlusMenuOpen(false);
                      onOpenNewClient();
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 text-gray-200 hover:text-white flex items-center gap-2 cursor-pointer font-semibold"
                  >
                    <Briefcase className="w-4 h-4 text-[#22C55E]" />
                    <span>Cliente Activo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsPlusMenuOpen(false);
                      onOpenNewExpense();
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 text-gray-200 hover:text-white flex items-center gap-2 cursor-pointer font-semibold"
                  >
                    <Receipt className="w-4 h-4 text-amber-400" />
                    <span>Gasto del Mes</span>
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={onExportCsv}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-gray-300 border border-white/10 transition-colors cursor-pointer"
              title="Descargar CSV para Excel / Google Sheets"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar Excel</span>
            </button>

            <button
              type="button"
              onClick={onNavigateLanding}
              className="hidden md:inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <span>Ver Web</span>
              <ExternalLink className="w-3 h-3" />
            </button>

            <button
              type="button"
              onClick={onLogout}
              className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer"
              title="Cerrar Sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------------ */}
      {/* BARRA INFERIOR PARA CELULARES (Mobile Bottom Navigation Bar)        */}
      {/* ------------------------------------------------------------------ */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#141519]/96 backdrop-blur-xl border-t border-white/10 pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-8px_24px_rgba(0,0,0,0.6)]">
        <div className="grid grid-cols-5 h-15 items-center px-1">
          {/* 1. Dashboard */}
          <button
            type="button"
            onClick={() => handleSelectTab("dashboard")}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all cursor-pointer ${
              activeTab === "dashboard"
                ? "text-[#22C55E]"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <div className={`p-1 rounded-lg ${activeTab === "dashboard" ? "bg-[#16A34A]/20" : ""}`}>
              <LayoutDashboard className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold tracking-tight mt-0.5">Inicio</span>
          </button>

          {/* 2. CRM Comercial */}
          <button
            type="button"
            onClick={() => handleSelectTab("commercial")}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all cursor-pointer relative ${
              activeTab === "commercial"
                ? "text-[#22C55E]"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <div className={`p-1 rounded-lg ${activeTab === "commercial" ? "bg-[#16A34A]/20" : ""}`}>
              <Users className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold tracking-tight mt-0.5">Ventas</span>
            {leadsCount > 0 && (
              <span className="absolute top-1 right-3 w-4 h-4 rounded-full bg-[#16A34A] text-white text-[9px] font-black flex items-center justify-center">
                {leadsCount > 9 ? "9+" : leadsCount}
              </span>
            )}
          </button>

          {/* 3. Clientes Activos */}
          <button
            type="button"
            onClick={() => handleSelectTab("clients")}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all cursor-pointer relative ${
              activeTab === "clients"
                ? "text-[#22C55E]"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <div className={`p-1 rounded-lg ${activeTab === "clients" ? "bg-[#16A34A]/20" : ""}`}>
              <Briefcase className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold tracking-tight mt-0.5">Clientes</span>
            {clientsCount > 0 && (
              <span className="absolute top-1 right-3 w-4 h-4 rounded-full bg-[#16A34A] text-white text-[9px] font-black flex items-center justify-center">
                {clientsCount > 9 ? "9+" : clientsCount}
              </span>
            )}
          </button>

          {/* 4. Reuniones */}
          <button
            type="button"
            onClick={() => handleSelectTab("meetings")}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all cursor-pointer relative ${
              activeTab === "meetings"
                ? "text-[#22C55E]"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <div className={`p-1 rounded-lg ${activeTab === "meetings" ? "bg-[#16A34A]/20" : ""}`}>
              <Calendar className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold tracking-tight mt-0.5">Agenda</span>
            {meetingsCount > 0 && (
              <span className="absolute top-1 right-3 w-4 h-4 rounded-full bg-[#16A34A] text-white text-[9px] font-black flex items-center justify-center">
                {meetingsCount}
              </span>
            )}
          </button>

          {/* 5. «Más» con menú desplegable */}
          <button
            type="button"
            onClick={() => setIsMoreMenuOpen(true)}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all cursor-pointer ${
              activeTab === "responses" || activeTab === "expenses"
                ? "text-[#22C55E]"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <div className={`p-1 rounded-lg ${activeTab === "responses" || activeTab === "expenses" ? "bg-[#16A34A]/20" : ""}`}>
              <MoreHorizontal className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold tracking-tight mt-0.5">Más</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* DESPLEGABLE «MÁS» PARA CELULARES (Bottom Sheet)                   */}
      {/* ------------------------------------------------------------------ */}
      {isMoreMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <div
            onClick={() => setIsMoreMenuOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />
          <div className="relative bg-[#141519] border-t border-white/12 rounded-t-3xl p-5 shadow-2xl z-10 space-y-4 max-h-[80vh] overflow-y-auto pb-[calc(env(safe-area-inset-bottom,0px)+1.5rem)] text-white">
            <div className="w-12 h-1.5 rounded-full bg-white/20 mx-auto mb-2" />

            <div className="flex items-center justify-between border-b border-white/8 pb-3">
              <div>
                <h3 className="text-sm font-black text-white">Más Opciones y Herramientas</h3>
                <p className="text-[11px] text-gray-400">NEXO Creative · CRM Móvil</p>
              </div>
              <button
                type="button"
                onClick={() => setIsMoreMenuOpen(false)}
                className="p-1 rounded-full bg-white/5 hover:bg-white/10 text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1.5 text-xs">
              <button
                type="button"
                onClick={() => handleSelectTab("responses")}
                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                  activeTab === "responses"
                    ? "bg-[#16A34A]/15 border-[#16A34A] text-white font-bold"
                    : "bg-[#181a20] border-white/8 text-gray-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/15 text-blue-400">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold">Respuestas Formularios Web</div>
                    <div className="text-[10px] text-gray-400">Consultas entrantes desde la web</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-500" />
              </button>

              <button
                type="button"
                onClick={() => handleSelectTab("expenses")}
                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                  activeTab === "expenses"
                    ? "bg-[#16A34A]/15 border-[#16A34A] text-white font-bold"
                    : "bg-[#181a20] border-white/8 text-gray-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/15 text-amber-400">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold">Control de Gastos del Mes</div>
                    <div className="text-[10px] text-gray-400">Costos operativos y herramientas</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-500" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMoreMenuOpen(false);
                  onExportCsv();
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-[#181a20] border border-white/8 text-gray-200 hover:bg-white/5 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-400">
                    <Download className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold">Exportar a Excel / CSV</div>
                    <div className="text-[10px] text-gray-400">Descargar copia de seguridad</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-500" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMoreMenuOpen(false);
                  onNavigateLanding();
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-[#181a20] border border-white/8 text-gray-200 hover:bg-white/5 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/15 text-purple-400">
                    <ExternalLink className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold">Ver Sitio Web NEXO</div>
                    <div className="text-[10px] text-gray-400">Abrir la landing page pública</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-500" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMoreMenuOpen(false);
                  onLogout();
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 hover:bg-red-500/20 cursor-pointer pt-3"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-500/20 text-red-400">
                    <LogOut className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold">Cerrar Sesión</div>
                    <div className="text-[10px] text-red-300/80">Salir del panel de administración</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-red-400" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
