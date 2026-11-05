import React, { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Calendar,
  FileText,
  Download,
  RefreshCw,
  LogOut,
  ExternalLink,
  Plus,
  MoreHorizontal,
  X,
  ChevronRight,
  Headset,
  Database,
  UserCheck,
  Megaphone,
  Receipt,
  Target,
} from "lucide-react";
import { BrandLogo } from "../components/Icons";

const ROLE_LABELS = {
  admin: { label: "Administrador", badge: "bg-red-500/15 text-red-300 border-red-500/30" },
  atencion: { label: "Atención al Cliente", badge: "bg-blue-500/15 text-blue-300 border-blue-500/30" },
  marketing: { label: "Marketing & Finanzas", badge: "bg-purple-500/15 text-purple-300 border-purple-500/30" },
};

export default function CrmNavbar({
  activeTab,
  onSelectTab,
  currentUser,
  leadsCount = 0,
  clientsCount = 0,
  customerProfilesCount = 0,
  clientCampaignsCount = 0,
  companyCampaignsCount = 0,
  meetingsCount = 0,
  onOpenNewLead,
  onOpenNewClient,
  onOpenNewCustomerProfile,
  onOpenNewClientCampaign,
  onOpenNewCompanyCampaign,
  onOpenNewExpense,
  onOpenUsers,
  onOpenBackups,
  onExportCsv,
  onRefresh,
  refreshing,
  onLogout,
  onNavigateLanding,
}) {
  const prefersReducedMotion = useReducedMotion();
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isPlusMenuOpen, setIsPlusMenuOpen] = useState(false);

  const role = currentUser?.role || "admin";
  const roleConfig = ROLE_LABELS[role] || ROLE_LABELS.admin;

  const handleSelectTab = (tabId) => {
    onSelectTab(tabId);
    setIsMoreMenuOpen(false);
    setIsPlusMenuOpen(false);
  };

  return (
    <>
      {/* ------------------------------------------------------------------ */}
      {/* 1. BARRA LATERAL IZQUIERDA PARA ESCRITORIO (Desktop Left Sidebar)  */}
      {/* ------------------------------------------------------------------ */}
      <aside className="hidden md:flex flex-col fixed inset-y-0 left-0 w-64 bg-[#141519] border-r border-white/10 z-30 select-none overflow-y-auto no-scrollbar">
        {/* Cabecera Sidebar con Logo y Rol */}
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => handleSelectTab(role === "atencion" ? "customer_service" : role === "marketing" ? "marketing" : "dashboard")}
              className="transition-transform duration-200 hover:scale-102 cursor-pointer text-left"
              aria-label="Ir al inicio del CRM"
            >
              <BrandLogo size="default" />
            </button>
            <button
              type="button"
              onClick={onRefresh}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer"
              title="Sincronizar datos"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-[#22C55E]" : ""}`}
              />
            </button>
          </div>

          {/* Identificación de Usuario y Rol */}
          <div className="mt-3 flex items-center justify-between text-[11px] bg-[#0d0f12] px-2.5 py-1.5 rounded-lg border border-white/5">
            <div className="flex items-center gap-1.5 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] flex-shrink-0" />
              <span className="font-bold text-white truncate text-[11px]">
                {currentUser?.name || currentUser?.username || "Usuario"}
              </span>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider flex-shrink-0 ${roleConfig.badge}`}>
              {roleConfig.label}
            </span>
          </div>
        </div>

        {/* Acceso Rápido + Nuevo */}
        <div className="p-3 border-b border-white/5">
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsPlusMenuOpen(!isPlusMenuOpen)}
              className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-black transition-[background-color,transform] duration-150 active:scale-98 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Nuevo Registro</span>
            </button>

            {isPlusMenuOpen && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-[#181a20] border border-white/12 rounded-xl shadow-2xl p-1.5 z-50 text-xs">
                {/* Opciones para Marketing */}
                {role === "marketing" && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setIsPlusMenuOpen(false);
                        onOpenNewClientCampaign?.();
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 text-gray-200 hover:text-white flex items-center gap-2 cursor-pointer font-semibold"
                    >
                      <Megaphone className="w-4 h-4 text-purple-400" />
                      <span>Campaña de Cliente</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsPlusMenuOpen(false);
                        onOpenNewCompanyCampaign?.();
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 text-gray-200 hover:text-white flex items-center gap-2 cursor-pointer font-semibold"
                    >
                      <Target className="w-4 h-4 text-blue-400" />
                      <span>Campaña Propia (NEXO)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsPlusMenuOpen(false);
                        onOpenNewExpense?.();
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 text-gray-200 hover:text-white flex items-center gap-2 cursor-pointer font-semibold"
                    >
                      <Receipt className="w-4 h-4 text-amber-400" />
                      <span>Gasto Operativo</span>
                    </button>
                  </>
                )}

                {/* Opciones para Admin y Atención */}
                {(role === "admin" || role === "atencion") && onOpenNewCustomerProfile && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsPlusMenuOpen(false);
                      onOpenNewCustomerProfile();
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 text-gray-200 hover:text-white flex items-center gap-2 cursor-pointer font-semibold"
                  >
                    <Headset className="w-4 h-4 text-[#22C55E]" />
                    <span>Ficha de Atención</span>
                  </button>
                )}

                {(role === "admin" || role === "atencion") && onOpenNewLead && (
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
                )}

                {(role === "admin" || role === "atencion") && onOpenNewClient && (
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
                )}
              </div>
            )}
          </div>
        </div>

        {/* Listado de Opciones de Navegación Vertical Según Rol */}
        <div className="flex-1 py-3 px-3 space-y-6">
          {/* ============================================================== */}
          {/* MENU PARA ADMINISTRADOR (Supervisión Operativa)                */}
          {/* ============================================================== */}
          {role === "admin" && (
            <>
              <div>
                <div className="px-3 pb-2 text-[10px] font-black uppercase tracking-wider text-gray-400">
                  Operaciones &amp; Equipos
                </div>
                <nav className="space-y-1">
                  <button
                    type="button"
                    onClick={() => handleSelectTab("dashboard")}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-[background-color,color,transform] duration-150 active:scale-98 cursor-pointer ${
                      activeTab === "dashboard"
                        ? "bg-[#16A34A] text-white shadow-sm"
                        : "text-gray-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Resumen Operativo</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectTab("commercial")}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-[background-color,color,transform] duration-150 active:scale-98 cursor-pointer ${
                      activeTab === "commercial"
                        ? "bg-[#16A34A] text-white shadow-sm"
                        : "text-gray-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Users className="w-4 h-4" />
                      <span>Pipeline Comercial</span>
                    </div>
                    {leadsCount > 0 && (
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${activeTab === "commercial" ? "bg-white/25 text-white" : "bg-[#16A34A]/20 text-[#22C55E]"}`}>
                        {leadsCount}
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectTab("customer_service")}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-[background-color,color,transform] duration-150 active:scale-98 cursor-pointer ${
                      activeTab === "customer_service"
                        ? "bg-[#16A34A] text-white shadow-sm"
                        : "text-gray-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Headset className="w-4 h-4" />
                      <span>Atención al Público</span>
                    </div>
                    {customerProfilesCount > 0 && (
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${activeTab === "customer_service" ? "bg-white/25 text-white" : "bg-blue-500/20 text-blue-300"}`}>
                        {customerProfilesCount}
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectTab("marketing")}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-[background-color,color,transform] duration-150 active:scale-98 cursor-pointer ${
                      activeTab === "marketing"
                        ? "bg-[#16A34A] text-white shadow-sm"
                        : "text-gray-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Megaphone className="w-4 h-4" />
                      <span>Marketing &amp; Campañas</span>
                    </div>
                    {(clientCampaignsCount + companyCampaignsCount) > 0 && (
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${activeTab === "marketing" ? "bg-white/25 text-white" : "bg-purple-500/20 text-purple-300"}`}>
                        {clientCampaignsCount + companyCampaignsCount}
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectTab("clients")}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-[background-color,color,transform] duration-150 active:scale-98 cursor-pointer ${
                      activeTab === "clients"
                        ? "bg-[#16A34A] text-white shadow-sm"
                        : "text-gray-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Briefcase className="w-4 h-4" />
                      <span>Clientes Activos</span>
                    </div>
                    {clientsCount > 0 && (
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${activeTab === "clients" ? "bg-white/25 text-white" : "bg-[#16A34A]/20 text-[#22C55E]"}`}>
                        {clientsCount}
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectTab("meetings")}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-[background-color,color,transform] duration-150 active:scale-98 cursor-pointer ${
                      activeTab === "meetings"
                        ? "bg-[#16A34A] text-white shadow-sm"
                        : "text-gray-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Calendar className="w-4 h-4" />
                      <span>Agenda Reuniones 20m</span>
                    </div>
                    {meetingsCount > 0 && (
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${activeTab === "meetings" ? "bg-white/25 text-white" : "bg-[#16A34A]/20 text-[#22C55E]"}`}>
                        {meetingsCount}
                      </span>
                    )}
                  </button>
                </nav>
              </div>

              <div>
                <div className="px-3 pb-2 text-[10px] font-black uppercase tracking-wider text-gray-400">
                  Consultas &amp; Web
                </div>
                <nav className="space-y-1">
                  <button
                    type="button"
                    onClick={() => handleSelectTab("responses")}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-[background-color,color,transform] duration-150 active:scale-98 cursor-pointer ${
                      activeTab === "responses"
                        ? "bg-[#16A34A] text-white shadow-sm"
                        : "text-gray-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-4 h-4" />
                      <span>Formularios Web</span>
                    </div>
                  </button>
                </nav>
              </div>
            </>
          )}

          {/* ============================================================== */}
          {/* MENU PARA ATENCIÓN AL CLIENTE                                 */}
          {/* ============================================================== */}
          {role === "atencion" && (
            <div>
              <div className="px-3 pb-2 text-[10px] font-black uppercase tracking-wider text-gray-400">
                Atención al Cliente
              </div>
              <nav className="space-y-1">
                <button
                  type="button"
                  onClick={() => handleSelectTab("customer_service")}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-[background-color,color,transform] duration-150 active:scale-98 cursor-pointer ${
                    activeTab === "customer_service"
                      ? "bg-[#16A34A] text-white shadow-sm"
                      : "text-gray-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Headset className="w-4 h-4" />
                    <span>Fichas &amp; Diagnósticos</span>
                  </div>
                  {customerProfilesCount > 0 && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${activeTab === "customer_service" ? "bg-white/25 text-white" : "bg-[#16A34A]/20 text-[#22C55E]"}`}>
                      {customerProfilesCount}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectTab("clients")}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-[background-color,color,transform] duration-150 active:scale-98 cursor-pointer ${
                    activeTab === "clients"
                      ? "bg-[#16A34A] text-white shadow-sm"
                      : "text-gray-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Briefcase className="w-4 h-4" />
                    <span>Clientes Activos</span>
                  </div>
                  {clientsCount > 0 && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${activeTab === "clients" ? "bg-white/25 text-white" : "bg-[#16A34A]/20 text-[#22C55E]"}`}>
                      {clientsCount}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectTab("meetings")}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-[background-color,color,transform] duration-150 active:scale-98 cursor-pointer ${
                    activeTab === "meetings"
                      ? "bg-[#16A34A] text-white shadow-sm"
                      : "text-gray-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Calendar className="w-4 h-4" />
                    <span>Agenda de Reuniones</span>
                  </div>
                  {meetingsCount > 0 && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${activeTab === "meetings" ? "bg-white/25 text-white" : "bg-[#16A34A]/20 text-[#22C55E]"}`}>
                      {meetingsCount}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectTab("responses")}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-[background-color,color,transform] duration-150 active:scale-98 cursor-pointer ${
                    activeTab === "responses"
                      ? "bg-[#16A34A] text-white shadow-sm"
                      : "text-gray-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4" />
                    <span>Formularios Web</span>
                  </div>
                  {leadsCount > 0 && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${activeTab === "responses" ? "bg-white/25 text-white" : "bg-white/10 text-gray-300"}`}>
                      {leadsCount}
                    </span>
                  )}
                </button>
              </nav>
            </div>
          )}

          {/* ============================================================== */}
          {/* MENU PARA MARKETING & FINANZAS                                 */}
          {/* ============================================================== */}
          {role === "marketing" && (
            <div>
              <div className="px-3 pb-2 text-[10px] font-black uppercase tracking-wider text-purple-300">
                Marketing &amp; Finanzas
              </div>
              <nav className="space-y-1">
                <button
                  type="button"
                  onClick={() => handleSelectTab("marketing")}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-[background-color,color,transform] duration-150 active:scale-98 cursor-pointer ${
                    activeTab === "marketing"
                      ? "bg-purple-600 text-white shadow-sm"
                      : "text-gray-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Megaphone className="w-4 h-4" />
                    <span>Campañas &amp; Finanzas</span>
                  </div>
                  {(clientCampaignsCount + companyCampaignsCount) > 0 && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${activeTab === "marketing" ? "bg-white/25 text-white" : "bg-purple-500/20 text-purple-300"}`}>
                      {clientCampaignsCount + companyCampaignsCount}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectTab("clients")}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-[background-color,color,transform] duration-150 active:scale-98 cursor-pointer ${
                    activeTab === "clients"
                      ? "bg-[#16A34A] text-white shadow-sm"
                      : "text-gray-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Briefcase className="w-4 h-4" />
                    <span>Clientes &amp; Servicios</span>
                  </div>
                  {clientsCount > 0 && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${activeTab === "clients" ? "bg-white/25 text-white" : "bg-[#16A34A]/20 text-[#22C55E]"}`}>
                      {clientsCount}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectTab("customer_service")}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-[background-color,color,transform] duration-150 active:scale-98 cursor-pointer ${
                    activeTab === "customer_service"
                      ? "bg-[#16A34A] text-white shadow-sm"
                      : "text-gray-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Headset className="w-4 h-4" />
                    <span>Contexto de Fichas</span>
                  </div>
                  {customerProfilesCount > 0 && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${activeTab === "customer_service" ? "bg-white/25 text-white" : "bg-blue-500/20 text-blue-300"}`}>
                      {customerProfilesCount}
                    </span>
                  )}
                </button>
              </nav>
            </div>
          )}
        </div>

        {/* Pie de la Barra Lateral */}
        <div className="p-3 border-t border-white/10 space-y-1 bg-[#101115]">
          {role === "admin" && (
            <>
              {onOpenUsers && (
                <button
                  type="button"
                  onClick={onOpenUsers}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <UserCheck className="w-4 h-4 text-[#22C55E]" />
                  <span>Equipo &amp; Accesos</span>
                </button>
              )}

              {onOpenBackups && (
                <button
                  type="button"
                  onClick={onOpenBackups}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <Database className="w-4 h-4 text-[#22C55E]" />
                  <span>Copias de Seguridad</span>
                </button>
              )}

              {onExportCsv && (
                <button
                  type="button"
                  onClick={onExportCsv}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4 text-[#22C55E]" />
                  <span>Exportar Excel (CSV)</span>
                </button>
              )}
            </>
          )}

          <button
            type="button"
            onClick={onNavigateLanding}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-gray-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <ExternalLink className="w-4 h-4 text-gray-400" />
              <span>Ver Sitio Web</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* ------------------------------------------------------------------ */}
      {/* 2. CABECERA SUPERIOR PARA CELULARES (Mobile Top Header)            */}
      {/* ------------------------------------------------------------------ */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-30 bg-[#141519] border-b border-white/10 px-4 py-2.5 flex items-center justify-between">
        <button
          type="button"
          onClick={() => handleSelectTab(role === "atencion" ? "customer_service" : role === "marketing" ? "marketing" : "dashboard")}
          className="transition-transform duration-200 hover:scale-102 flex-shrink-0 cursor-pointer"
        >
          <BrandLogo size="default" />
        </button>

        <div className="flex items-center gap-2">
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${roleConfig.badge}`}>
            {roleConfig.label}
          </span>

          <button
            type="button"
            onClick={onRefresh}
            className="p-2 rounded-xl bg-white/5 text-gray-300 transition-colors cursor-pointer"
            title="Actualizar datos"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-[#22C55E]" : ""}`}
            />
          </button>

          {/* Botón rápido "+ Nuevo" móvil */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsPlusMenuOpen(!isPlusMenuOpen)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#16A34A] text-white text-[11px] font-black cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Nuevo</span>
            </button>

            {isPlusMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-[#181a20] border border-white/12 rounded-xl shadow-2xl p-1.5 z-50 text-xs">
                {role === "marketing" && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setIsPlusMenuOpen(false);
                        onOpenNewClientCampaign?.();
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 text-gray-200 hover:text-white flex items-center gap-2 font-semibold"
                    >
                      <Megaphone className="w-4 h-4 text-purple-400" />
                      <span>Campaña Cliente</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsPlusMenuOpen(false);
                        onOpenNewCompanyCampaign?.();
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 text-gray-200 hover:text-white flex items-center gap-2 font-semibold"
                    >
                      <Target className="w-4 h-4 text-blue-400" />
                      <span>Campaña Propia</span>
                    </button>
                  </>
                )}

                {(role === "admin" || role === "atencion") && onOpenNewCustomerProfile && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsPlusMenuOpen(false);
                      onOpenNewCustomerProfile();
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 text-gray-200 hover:text-white flex items-center gap-2 font-semibold"
                  >
                    <Headset className="w-4 h-4 text-[#22C55E]" />
                    <span>Ficha de Atención</span>
                  </button>
                )}

                {(role === "admin" || role === "atencion") && onOpenNewLead && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsPlusMenuOpen(false);
                      onOpenNewLead();
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 text-gray-200 hover:text-white flex items-center gap-2 font-semibold"
                  >
                    <Users className="w-4 h-4 text-[#22C55E]" />
                    <span>Lead / Oportunidad</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------------ */}
      {/* 3. BARRA INFERIOR DE ACCESO RÁPIDO PARA CELULARES (Mobile Bottom)  */}
      {/* ------------------------------------------------------------------ */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#141519]/95 backdrop-blur-lg border-t border-white/10 px-2 py-2 flex items-center justify-around select-none">
        {role === "admin" && (
          <>
            <button
              type="button"
              onClick={() => handleSelectTab("dashboard")}
              className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-[10px] font-bold transition-colors cursor-pointer ${
                activeTab === "dashboard" ? "text-[#22C55E]" : "text-gray-400 hover:text-white"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Resumen</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectTab("commercial")}
              className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-[10px] font-bold transition-colors cursor-pointer relative ${
                activeTab === "commercial" ? "text-[#22C55E]" : "text-gray-400 hover:text-white"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Pipeline</span>
              {leadsCount > 0 && (
                <span className="absolute top-0 right-1 w-2 h-2 rounded-full bg-[#16A34A]" />
              )}
            </button>

            <button
              type="button"
              onClick={() => handleSelectTab("customer_service")}
              className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-[10px] font-bold transition-colors cursor-pointer relative ${
                activeTab === "customer_service" ? "text-[#22C55E]" : "text-gray-400 hover:text-white"
              }`}
            >
              <Headset className="w-4 h-4" />
              <span>Atención</span>
              {customerProfilesCount > 0 && (
                <span className="absolute top-0 right-1 w-2 h-2 rounded-full bg-blue-500" />
              )}
            </button>

            <button
              type="button"
              onClick={() => handleSelectTab("marketing")}
              className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-[10px] font-bold transition-colors cursor-pointer relative ${
                activeTab === "marketing" ? "text-[#22C55E]" : "text-gray-400 hover:text-white"
              }`}
            >
              <Megaphone className="w-4 h-4" />
              <span>Marketing</span>
            </button>
          </>
        )}

        {role === "atencion" && (
          <>
            <button
              type="button"
              onClick={() => handleSelectTab("customer_service")}
              className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-[10px] font-bold transition-colors cursor-pointer relative ${
                activeTab === "customer_service" ? "text-[#22C55E]" : "text-gray-400 hover:text-white"
              }`}
            >
              <Headset className="w-4 h-4" />
              <span>Fichas</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectTab("clients")}
              className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-[10px] font-bold transition-colors cursor-pointer ${
                activeTab === "clients" ? "text-[#22C55E]" : "text-gray-400 hover:text-white"
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Clientes</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectTab("meetings")}
              className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-[10px] font-bold transition-colors cursor-pointer ${
                activeTab === "meetings" ? "text-[#22C55E]" : "text-gray-400 hover:text-white"
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Agenda</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectTab("responses")}
              className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-[10px] font-bold transition-colors cursor-pointer ${
                activeTab === "responses" ? "text-[#22C55E]" : "text-gray-400 hover:text-white"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Web</span>
            </button>
          </>
        )}

        {role === "marketing" && (
          <>
            <button
              type="button"
              onClick={() => handleSelectTab("marketing")}
              className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-[10px] font-bold transition-colors cursor-pointer relative ${
                activeTab === "marketing" ? "text-[#22C55E]" : "text-gray-400 hover:text-white"
              }`}
            >
              <Megaphone className="w-4 h-4" />
              <span>Campañas</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectTab("clients")}
              className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-[10px] font-bold transition-colors cursor-pointer ${
                activeTab === "clients" ? "text-[#22C55E]" : "text-gray-400 hover:text-white"
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Clientes</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectTab("customer_service")}
              className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-[10px] font-bold transition-colors cursor-pointer ${
                activeTab === "customer_service" ? "text-[#22C55E]" : "text-gray-400 hover:text-white"
              }`}
            >
              <Headset className="w-4 h-4" />
              <span>Fichas</span>
            </button>
          </>
        )}

        {/* Botón 'Más' móvil para opciones complementarias */}
        <button
          type="button"
          onClick={() => setIsMoreMenuOpen(true)}
          className="flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-[10px] font-bold text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
          <MoreHorizontal className="w-4 h-4" />
          <span>Más</span>
        </button>
      </nav>

      {/* ------------------------------------------------------------------ */}
      {/* 4. MODAL / BOTTOM SHEET "MÁS OPCIONES" PARA MÓVIL                  */}
      {/* ------------------------------------------------------------------ */}
      <AnimatePresence>
        {isMoreMenuOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center md:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setIsMoreMenuOpen(false)}
            />

            <motion.div
              initial={prefersReducedMotion ? false : { y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full bg-[#181a20] border-t border-white/10 rounded-t-3xl p-5 pb-8 max-h-[85vh] overflow-y-auto z-10"
            >
              <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-4" />

              <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                <div>
                  <h3 className="text-sm font-black text-white">Menú de Navegación</h3>
                  <p className="text-[11px] text-gray-400">Sesión: {currentUser?.name || currentUser?.username}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMoreMenuOpen(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1">
                {role === "admin" && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleSelectTab("clients")}
                      className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 text-gray-200 text-xs font-bold"
                    >
                      <div className="flex items-center gap-3">
                        <Briefcase className="w-4 h-4 text-[#22C55E]" />
                        <span>Clientes Activos</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-500" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectTab("meetings")}
                      className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 text-gray-200 text-xs font-bold"
                    >
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-[#22C55E]" />
                        <span>Agenda Reuniones 20m</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-500" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectTab("responses")}
                      className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 text-gray-200 text-xs font-bold"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-[#22C55E]" />
                        <span>Formularios Web</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-500" />
                    </button>

                    {onOpenUsers && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsMoreMenuOpen(false);
                          onOpenUsers();
                        }}
                        className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 text-gray-200 text-xs font-bold"
                      >
                        <div className="flex items-center gap-3">
                          <UserCheck className="w-4 h-4 text-[#22C55E]" />
                          <span>Equipo &amp; Accesos</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                      </button>
                    )}

                    {onOpenBackups && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsMoreMenuOpen(false);
                          onOpenBackups();
                        }}
                        className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 text-gray-200 text-xs font-bold"
                      >
                        <div className="flex items-center gap-3">
                          <Database className="w-4 h-4 text-[#22C55E]" />
                          <span>Copias de Seguridad</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                      </button>
                    )}

                    {onExportCsv && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsMoreMenuOpen(false);
                          onExportCsv();
                        }}
                        className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 text-gray-200 text-xs font-bold"
                      >
                        <div className="flex items-center gap-3">
                          <Download className="w-4 h-4 text-[#22C55E]" />
                          <span>Exportar Excel (CSV)</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                      </button>
                    )}
                  </>
                )}

                <div className="pt-2 mt-2 border-t border-white/10 space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      onNavigateLanding();
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 text-gray-200 text-xs font-bold"
                  >
                    <div className="flex items-center gap-3">
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                      <span>Ver Sitio Web</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-500/10 text-red-400 text-xs font-bold"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
