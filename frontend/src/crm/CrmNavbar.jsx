import React, { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
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
  const prefersReducedMotion = useReducedMotion();
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
      {/* 1. BARRA LATERAL IZQUIERDA PARA ESCRITORIO (Desktop Left Sidebar)  */}
      {/* ------------------------------------------------------------------ */}
      <aside className="hidden md:flex flex-col fixed inset-y-0 left-0 w-64 bg-[#141519] border-r border-white/10 z-30 select-none overflow-y-auto no-scrollbar">
        {/* Cabecera Sidebar con Logo */}
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => handleSelectTab("dashboard")}
              className="transition-transform duration-200 hover:scale-102 cursor-pointer text-left"
              aria-label="Ir al Dashboard"
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
          <div className="mt-3 flex items-center justify-between text-[11px] text-gray-400 bg-[#0d0f12] px-2.5 py-1.5 rounded-lg border border-white/5">
            <span className="font-bold text-gray-300 uppercase tracking-wider text-[10px]">
              CRM &amp; Finanzas
            </span>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
              <span className="text-[10px] text-white/80 font-medium">Activo</span>
            </div>
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
                  <Receipt className="w-4 h-4 text-[#22C55E]" />
                  <span>Gasto del Mes</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Listado de Opciones de Navegación Vertical */}
        <div className="flex-1 py-3 px-3 space-y-6">
          {/* GRUPO 1: VENTAS & OPERACIONES */}
          <div>
            <div className="px-3 pb-2 text-[10px] font-black uppercase tracking-wider text-gray-400">
              Ventas &amp; Operaciones
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
                  <span>Dashboard &amp; Finanzas</span>
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
                  <span>CRM Comercial</span>
                </div>
                {leadsCount > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                      activeTab === "commercial"
                        ? "bg-white/25 text-white"
                        : "bg-[#16A34A]/20 text-[#22C55E]"
                    }`}
                  >
                    {leadsCount}
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
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                      activeTab === "clients"
                        ? "bg-white/25 text-white"
                        : "bg-[#16A34A]/20 text-[#22C55E]"
                    }`}
                  >
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
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                      activeTab === "meetings"
                        ? "bg-white/25 text-white"
                        : "bg-[#16A34A]/20 text-[#22C55E]"
                    }`}
                  >
                    {meetingsCount}
                  </span>
                )}
              </button>
            </nav>
          </div>

          {/* GRUPO 2: GESTIÓN & FINANZAS */}
          <div>
            <div className="px-3 pb-2 text-[10px] font-black uppercase tracking-wider text-gray-400">
              Gestión &amp; Finanzas
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

              <button
                type="button"
                onClick={() => handleSelectTab("expenses")}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-[background-color,color,transform] duration-150 active:scale-98 cursor-pointer ${
                  activeTab === "expenses"
                    ? "bg-[#16A34A] text-white shadow-sm"
                    : "text-gray-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Receipt className="w-4 h-4" />
                  <span>Gastos del Mes</span>
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Pie de la Barra Lateral con Exportación, Web y Cerrar Sesión */}
        <div className="p-3 border-t border-white/10 space-y-1 bg-[#101115]">
          <button
            type="button"
            onClick={onExportCsv}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#22C55E]" />
            <span>Exportar Excel (CSV)</span>
          </button>

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
          onClick={() => handleSelectTab("dashboard")}
          className="transition-transform duration-200 hover:scale-102 flex-shrink-0 cursor-pointer"
        >
          <BrandLogo size="default" />
        </button>

        <div className="flex items-center gap-2">
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
                <button
                  type="button"
                  onClick={() => {
                    setIsPlusMenuOpen(false);
                    onOpenNewLead();
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 text-gray-200 flex items-center gap-2 cursor-pointer font-semibold"
                >
                  <Users className="w-3.5 h-3.5 text-[#22C55E]" />
                  <span>Lead Comercial</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsPlusMenuOpen(false);
                    onOpenNewClient();
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 text-gray-200 flex items-center gap-2 cursor-pointer font-semibold"
                >
                  <Briefcase className="w-3.5 h-3.5 text-[#22C55E]" />
                  <span>Cliente Activo</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsPlusMenuOpen(false);
                    onOpenNewExpense();
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 text-gray-200 flex items-center gap-2 cursor-pointer font-semibold"
                >
                  <Receipt className="w-3.5 h-3.5 text-[#22C55E]" />
                  <span>Gasto del Mes</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------------ */}
      {/* 3. BARRA INFERIOR PARA CELULARES (Mobile Bottom Navigation Bar)    */}
      {/* ------------------------------------------------------------------ */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#141519]/96 backdrop-blur-xl border-t border-white/10 pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-8px_24px_rgba(0,0,0,0.6)]">
        <div className="grid grid-cols-5 h-15 items-center px-1">
          {/* 1. Dashboard */}
          <button
            type="button"
            onClick={() => handleSelectTab("dashboard")}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition-[color,transform] duration-150 active:scale-95 cursor-pointer ${
              activeTab === "dashboard"
                ? "text-[#22C55E]"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <div
              className={`p-1 rounded-lg ${
                activeTab === "dashboard" ? "bg-[#16A34A]/20" : ""
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold tracking-tight mt-0.5">
              Inicio
            </span>
          </button>

          {/* 2. CRM Comercial */}
          <button
            type="button"
            onClick={() => handleSelectTab("commercial")}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition-[color,transform] duration-150 active:scale-95 cursor-pointer relative ${
              activeTab === "commercial"
                ? "text-[#22C55E]"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <div
              className={`p-1 rounded-lg ${
                activeTab === "commercial" ? "bg-[#16A34A]/20" : ""
              }`}
            >
              <Users className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold tracking-tight mt-0.5">
              Ventas
            </span>
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
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition-[color,transform] duration-150 active:scale-95 cursor-pointer relative ${
              activeTab === "clients"
                ? "text-[#22C55E]"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <div
              className={`p-1 rounded-lg ${
                activeTab === "clients" ? "bg-[#16A34A]/20" : ""
              }`}
            >
              <Briefcase className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold tracking-tight mt-0.5">
              Clientes
            </span>
            {clientsCount > 0 && (
              <span className="absolute top-1 right-3 w-4 h-4 rounded-full bg-[#16A34A] text-white text-[9px] font-black flex items-center justify-center">
                {clientsCount > 9 ? "9+" : clientsCount}
              </span>
            )}
          </button>

          {/* 4. Agenda Reuniones */}
          <button
            type="button"
            onClick={() => handleSelectTab("meetings")}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition-[color,transform] duration-150 active:scale-95 cursor-pointer relative ${
              activeTab === "meetings"
                ? "text-[#22C55E]"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <div
              className={`p-1 rounded-lg ${
                activeTab === "meetings" ? "bg-[#16A34A]/20" : ""
              }`}
            >
              <Calendar className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold tracking-tight mt-0.5">
              Agenda
            </span>
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
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition-[color,transform] duration-150 active:scale-95 cursor-pointer ${
              activeTab === "responses" || activeTab === "expenses"
                ? "text-[#22C55E]"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <div
              className={`p-1 rounded-lg ${
                activeTab === "responses" || activeTab === "expenses"
                  ? "bg-[#16A34A]/20"
                  : ""
              }`}
            >
              <MoreHorizontal className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold tracking-tight mt-0.5">
              Más
            </span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 4. BOTTOM SHEET «MÁS» PARA CELULARES                               */}
      {/* ------------------------------------------------------------------ */}
      <AnimatePresence>
        {isMoreMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
            className="md:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex flex-col justify-end"
            onClick={() => setIsMoreMenuOpen(false)}
          >
            <motion.div
              initial={prefersReducedMotion ? false : { y: "100%" }}
              animate={{ y: 0 }}
              exit={prefersReducedMotion ? false : { y: "100%" }}
              transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
              className="bg-[#141519] border-t border-white/12 rounded-t-3xl p-5 pb-[calc(2rem+env(safe-area-inset-bottom,0px))] space-y-4 shadow-2xl max-h-[82vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drag indicator handle */}
              <div className="w-10 h-1 rounded-full bg-white/20 mx-auto -mt-1.5 mb-1" />

              {/* Cabecera del Bottom Sheet */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
                  <h3 className="text-sm font-black text-white">
                    Más Opciones de Gestión
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMoreMenuOpen(false)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Apartados Secundarios */}
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => handleSelectTab("responses")}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-colors cursor-pointer ${
                    activeTab === "responses"
                      ? "bg-[#16A34A] text-white"
                      : "bg-white/5 text-gray-200 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4" />
                    <div>
                      <span className="text-xs font-bold block">
                        Respuestas Formularios Web
                      </span>
                      <span className="text-[10px] opacity-75">
                        Consultas recibidas desde la landing page
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {leadsCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#16A34A]/25 text-[#22C55E]">
                        {leadsCount}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 opacity-50" />
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectTab("expenses")}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-colors cursor-pointer ${
                    activeTab === "expenses"
                      ? "bg-[#16A34A] text-white"
                      : "bg-white/5 text-gray-200 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Receipt className="w-4 h-4" />
                    <div>
                      <span className="text-xs font-bold block">
                        Control de Gastos del Mes
                      </span>
                      <span className="text-[10px] opacity-75">
                        Registro de egresos operativos y balance
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </button>
              </div>

              {/* Accesos de Creación Rápida */}
              <div className="pt-2 border-t border-white/5">
                <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider block mb-2">
                  Acciones Rápidas
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      onOpenNewLead();
                    }}
                    className="p-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 flex flex-col items-center justify-center text-center gap-1 cursor-pointer active:scale-96 transition-transform"
                  >
                    <Users className="w-4 h-4 text-[#22C55E]" />
                    <span className="text-[10px] font-bold text-white leading-tight">
                      Nuevo Lead
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      onOpenNewClient();
                    }}
                    className="p-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 flex flex-col items-center justify-center text-center gap-1 cursor-pointer active:scale-96 transition-transform"
                  >
                    <Briefcase className="w-4 h-4 text-[#22C55E]" />
                    <span className="text-[10px] font-bold text-white leading-tight">
                      Nuevo Cliente
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      onOpenNewExpense();
                    }}
                    className="p-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 flex flex-col items-center justify-center text-center gap-1 cursor-pointer active:scale-96 transition-transform"
                  >
                    <Receipt className="w-4 h-4 text-[#22C55E]" />
                    <span className="text-[10px] font-bold text-white leading-tight">
                      Nuevo Gasto
                    </span>
                  </button>
                </div>
              </div>

              {/* Acciones del Sistema */}
              <div className="pt-2 border-t border-white/5 space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsMoreMenuOpen(false);
                    onExportCsv();
                  }}
                  className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-gray-200 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-[#22C55E]" />
                  <span>Exportar Excel Completo (CSV)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsMoreMenuOpen(false);
                    onNavigateLanding();
                  }}
                  className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-gray-200 cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Ver Landing Page Pública</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsMoreMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-red-500/10 text-red-400 text-xs font-bold cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
