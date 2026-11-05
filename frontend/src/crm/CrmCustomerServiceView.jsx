import React, { useState, useMemo } from "react";
import {
  Search,
  Plus,
  Phone,
  Mail,
  Building,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Edit2,
  Trash2,
  MessageSquare,
  Sparkles,
  ExternalLink,
  Save,
  X,
  History,
  TrendingUp,
  DollarSign,
  Send,
  User,
} from "lucide-react";
import { WhatsAppIcon } from "../components/Icons";

const STATUS_CONFIG = {
  nuevo: { label: "Nuevo", badge: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  en_evaluacion: { label: "En evaluación", badge: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
  pendiente: { label: "Pendiente", badge: "bg-purple-500/15 text-purple-300 border-purple-500/30" },
  activo: { label: "Activo", badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
  finalizado: { label: "Finalizado", badge: "bg-gray-500/15 text-gray-400 border-gray-500/30" },
};

export default function CrmCustomerServiceView({
  customerProfiles = [],
  onUpdateProfile,
  onDeleteProfile,
  onAddFollowup,
  onOpenNewProfile,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [activeTabModal, setActiveTabModal] = useState("general"); // "general" | "diagnostico" | "plan" | "publicidad" | "historial"
  const [newFollowupText, setNewFollowupText] = useState("");
  const [newFollowupNextAction, setNewFollowupNextAction] = useState("");
  const [newFollowupNextDate, setNewFollowupNextDate] = useState("");
  const [saving, setSaving] = useState(false);

  // Filtrado de perfiles
  const filteredProfiles = useMemo(() => {
    return customerProfiles.filter((p) => {
      const q = searchTerm.toLowerCase().trim();
      const matchSearch =
        !q ||
        (p.fullName && p.fullName.toLowerCase().includes(q)) ||
        (p.firstName && p.firstName.toLowerCase().includes(q)) ||
        (p.lastName && p.lastName.toLowerCase().includes(q)) ||
        (p.businessName && p.businessName.toLowerCase().includes(q)) ||
        (p.phone && p.phone.includes(q)) ||
        (p.email && p.email.toLowerCase().includes(q)) ||
        (p.refId && p.refId.toLowerCase().includes(q));

      const matchStatus = statusFilter === "all" || p.status === statusFilter;
      const matchPlan =
        planFilter === "all" ||
        (p.planName && p.planName.toLowerCase().includes(planFilter.toLowerCase()));

      return matchSearch && matchStatus && matchPlan;
    });
  }, [customerProfiles, searchTerm, statusFilter, planFilter]);

  // Métricas
  const totalProfiles = customerProfiles.length;
  const activeCount = customerProfiles.filter((p) => p.status === "activo").length;
  const evaluationCount = customerProfiles.filter((p) => p.status === "en_evaluacion").length;
  const pendingCount = customerProfiles.filter((p) => p.status === "pendiente").length;

  const handleOpenDetail = (profile) => {
    setSelectedProfile(profile);
    setEditFormData({ ...profile });
    setIsEditMode(false);
    setActiveTabModal("general");
    setNewFollowupText("");
    setNewFollowupNextAction("");
    setNewFollowupNextDate("");
  };

  const handleCloseDetail = () => {
    setSelectedProfile(null);
    setIsEditMode(false);
  };

  const handleSaveEdit = async () => {
    if (!selectedProfile) return;
    setSaving(true);
    try {
      const res = await onUpdateProfile(
        selectedProfile.id,
        editFormData,
        "Modificación de datos de la ficha desde Atención al Público."
      );
      if (res !== false) {
        setSelectedProfile({ ...selectedProfile, ...editFormData });
        setIsEditMode(false);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleAddFollowupSubmit = async (e) => {
    e.preventDefault();
    if (!newFollowupText.trim() || !selectedProfile) return;
    setSaving(true);
    try {
      await onAddFollowup(selectedProfile.id, {
        date: new Date().toISOString().slice(0, 10),
        note: newFollowupText.trim(),
        nextAction: newFollowupNextAction.trim(),
        nextDate: newFollowupNextDate,
      });
      setNewFollowupText("");
      setNewFollowupNextAction("");
      setNewFollowupNextDate("");
    } finally {
      setSaving(false);
    }
  };

  const getWhatsAppUrl = (phone, name = "") => {
    const cleanNumber = (phone || "").replace(/[^0-9]/g, "");
    if (!cleanNumber) return "#";
    const msg = `Hola ${name ? name.split(" ")[0] : ""}, te contacto desde el equipo de atención de NEXO Creative para coordinar el seguimiento de tu servicio.`;
    return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="space-y-5">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Atención al Público
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Registro, diagnóstico y seguimiento integral de clientes.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenNewProfile}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold transition-all duration-150 cursor-pointer shadow-sm active:scale-98"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Nueva Ficha de Cliente</span>
        </button>
      </div>

      {/* Métricas Principales */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#141519] border border-white/10 rounded-2xl p-4">
          <span className="text-[11px] font-bold text-gray-400 block uppercase tracking-wider">
            Total Fichas
          </span>
          <span className="text-2xl font-black text-white mt-1 block">
            {totalProfiles}
          </span>
        </div>

        <div className="bg-[#141519] border border-emerald-500/20 rounded-2xl p-4">
          <span className="text-[11px] font-bold text-emerald-400 block uppercase tracking-wider">
            Clientes Activos
          </span>
          <span className="text-2xl font-black text-[#22C55E] mt-1 block">
            {activeCount}
          </span>
        </div>

        <div className="bg-[#141519] border border-amber-500/20 rounded-2xl p-4">
          <span className="text-[11px] font-bold text-amber-300 block uppercase tracking-wider">
            En Evaluación
          </span>
          <span className="text-2xl font-black text-amber-300 mt-1 block">
            {evaluationCount}
          </span>
        </div>

        <div className="bg-[#141519] border border-purple-500/20 rounded-2xl p-4">
          <span className="text-[11px] font-bold text-purple-300 block uppercase tracking-wider">
            Pendientes
          </span>
          <span className="text-2xl font-black text-purple-300 mt-1 block">
            {pendingCount}
          </span>
        </div>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div className="bg-[#141519] border border-white/10 rounded-2xl p-3 sm:p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, apellido, teléfono, negocio o código..."
            className="w-full pl-9 pr-3 py-2 bg-[#0d0f12] border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#16A34A] transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-[#0d0f12] border border-white/10 rounded-xl text-xs text-gray-300 focus:outline-none focus:border-[#16A34A] cursor-pointer"
          >
            <option value="all">Todos los estados</option>
            <option value="nuevo">Nuevo</option>
            <option value="en_evaluacion">En evaluación</option>
            <option value="pendiente">Pendiente</option>
            <option value="activo">Activo</option>
            <option value="finalizado">Finalizado</option>
          </select>

          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="px-3 py-2 bg-[#0d0f12] border border-white/10 rounded-xl text-xs text-gray-300 focus:outline-none focus:border-[#16A34A] cursor-pointer"
          >
            <option value="all">Todos los planes</option>
            <option value="presencia">Plan Presencia</option>
            <option value="captacion">Plan Captación</option>
            <option value="integral">Plan Integral</option>
            <option value="web">Páginas Web</option>
            <option value="personalizado">Personalizado</option>
          </select>
        </div>
      </div>

      {/* Lista de Fichas */}
      {filteredProfiles.length === 0 ? (
        <div className="bg-[#141519] border border-white/10 rounded-2xl p-8 sm:p-12 text-center">
          <FileText className="w-8 h-8 text-gray-500 mx-auto mb-3" />
          <h2 className="text-base font-bold text-white">
            No se encontraron fichas de clientes
          </h2>
          <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
            {searchTerm || statusFilter !== "all" || planFilter !== "all"
              ? "No hay resultados para los filtros aplicados. Intentá restablecer la búsqueda."
              : "Aún no se registraron fichas en Atención al Público. Creá una nueva ficha para comenzar."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredProfiles.map((profile) => {
            const statusInfo = STATUS_CONFIG[profile.status] || STATUS_CONFIG.nuevo;
            const cleanPhone = (profile.phone || "").replace(/[^0-9]/g, "");

            return (
              <div
                key={profile.id}
                className="bg-[#141519] border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col justify-between hover:border-white/20 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-gray-400 block">
                        {profile.refId || profile.id}
                      </span>
                      <h2 className="text-sm sm:text-base font-black text-white mt-0.5">
                        {profile.fullName || `${profile.firstName || ""} ${profile.lastName || ""}`.trim() || "Cliente sin nombre"}
                      </h2>
                      {profile.businessName && (
                        <span className="text-xs text-gray-300 font-medium flex items-center gap-1.5 mt-0.5">
                          <Building className="w-3.5 h-3.5 text-gray-400" />
                          <span>{profile.businessName}</span>
                        </span>
                      )}
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusInfo.badge}`}
                    >
                      {statusInfo.label}
                    </span>
                  </div>

                  {/* Datos rápidos */}
                  <div className="space-y-1.5 text-xs text-gray-300 border-t border-white/5 pt-2.5">
                    {profile.phone && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-[11px]">Teléfono:</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[11px]">{profile.phone}</span>
                          <a
                            href={getWhatsAppUrl(profile.phone, profile.fullName)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#22C55E] hover:opacity-80 p-0.5"
                            title="Abrir WhatsApp"
                          >
                            <WhatsAppIcon className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    )}

                    {profile.planName && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-[11px]">Plan:</span>
                        <span className="font-semibold text-white truncate max-w-[170px]">
                          {profile.planName}
                        </span>
                      </div>
                    )}

                    {profile.adStrategy && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-[11px]">Publicidad:</span>
                        <span className="text-gray-300 text-[11px] truncate max-w-[170px]">
                          {profile.adStrategy}
                        </span>
                      </div>
                    )}

                    {profile.nextActionDate && (
                      <div className="flex items-center justify-between text-amber-300">
                        <span className="text-[11px]">Próxima acción:</span>
                        <span className="text-[11px] font-bold">
                          {profile.nextActionDate}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-white/5 pt-3 mt-3 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenDetail(profile)}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition-colors cursor-pointer text-center"
                  >
                    Ver Ficha Completa
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm("¿Seguro que deseás eliminar esta ficha de cliente?")) {
                        onDeleteProfile(profile.id);
                      }
                    }}
                    className="p-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer"
                    title="Eliminar ficha"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL DETALLE / EDICIÓN: FICHA COMPLETA DE CLIENTE            */}
      {/* ============================================================== */}
      {selectedProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#141519] border border-white/15 rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
            {/* Header Modal */}
            <div className="p-4 sm:p-6 border-b border-white/10 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-gray-400">
                    {selectedProfile.refId || selectedProfile.id}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      STATUS_CONFIG[selectedProfile.status]?.badge || STATUS_CONFIG.nuevo.badge
                    }`}
                  >
                    {STATUS_CONFIG[selectedProfile.status]?.label || selectedProfile.status}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-white mt-1">
                  {selectedProfile.fullName || "Ficha de Cliente"}
                </h2>
                {selectedProfile.businessName && (
                  <span className="text-xs text-gray-400 block mt-0.5">
                    {selectedProfile.businessName} {selectedProfile.rubro ? `• ${selectedProfile.rubro}` : ""}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {!isEditMode ? (
                  <button
                    type="button"
                    onClick={() => setIsEditMode(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Editar Ficha</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={saving}
                    onClick={handleSaveEdit}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{saving ? "Guardando..." : "Guardar Cambios"}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleCloseDetail}
                  className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Selector de Pestañas de la Ficha */}
            <div className="px-4 sm:px-6 border-b border-white/10 flex items-center gap-2 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setActiveTabModal("general")}
                className={`py-3 text-xs font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                  activeTabModal === "general"
                    ? "border-[#16A34A] text-[#22C55E]"
                    : "border-transparent text-gray-400 hover:text-white"
                }`}
              >
                Datos Generales
              </button>

              <button
                type="button"
                onClick={() => setActiveTabModal("diagnostico")}
                className={`py-3 text-xs font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                  activeTabModal === "diagnostico"
                    ? "border-[#16A34A] text-[#22C55E]"
                    : "border-transparent text-gray-400 hover:text-white"
                }`}
              >
                Diagnóstico del Negocio
              </button>

              <button
                type="button"
                onClick={() => setActiveTabModal("plan")}
                className={`py-3 text-xs font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                  activeTabModal === "plan"
                    ? "border-[#16A34A] text-[#22C55E]"
                    : "border-transparent text-gray-400 hover:text-white"
                }`}
              >
                Plan Contratado
              </button>

              <button
                type="button"
                onClick={() => setActiveTabModal("publicidad")}
                className={`py-3 text-xs font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                  activeTabModal === "publicidad"
                    ? "border-[#16A34A] text-[#22C55E]"
                    : "border-transparent text-gray-400 hover:text-white"
                }`}
              >
                Estrategia Publicitaria
              </button>

              <button
                type="button"
                onClick={() => setActiveTabModal("historial")}
                className={`py-3 text-xs font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeTabModal === "historial"
                    ? "border-[#16A34A] text-[#22C55E]"
                    : "border-transparent text-gray-400 hover:text-white"
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>Historial &amp; Seguimiento</span>
              </button>
            </div>

            {/* Contenido de la Ficha */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              {/* PESTAÑA 1: DATOS GENERALES */}
              {activeTabModal === "general" && (
                <div className="space-y-4">
                  {!isEditMode ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <span className="text-gray-400 block text-[11px]">Nombre Completo</span>
                        <span className="text-white font-bold text-sm block">
                          {selectedProfile.fullName || "-"}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-gray-400 block text-[11px]">Negocio / Empresa</span>
                        <span className="text-white font-bold text-sm block">
                          {selectedProfile.businessName || "-"}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-gray-400 block text-[11px]">Teléfono / WhatsApp</span>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-mono text-sm block">
                            {selectedProfile.phone || "-"}
                          </span>
                          {selectedProfile.phone && (
                            <a
                              href={getWhatsAppUrl(selectedProfile.phone, selectedProfile.fullName)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#22C55E] hover:underline flex items-center gap-1 text-[11px]"
                            >
                              <WhatsAppIcon className="w-3.5 h-3.5" />
                              <span>Abrir chat</span>
                            </a>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-gray-400 block text-[11px]">Correo Electrónico</span>
                        <span className="text-white font-mono text-sm block">
                          {selectedProfile.email || "-"}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-gray-400 block text-[11px]">Ciudad / Ubicación</span>
                        <span className="text-white font-medium block">
                          {selectedProfile.city || "-"}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-gray-400 block text-[11px]">Redes Sociales</span>
                        <span className="text-white font-medium block">
                          {selectedProfile.socials || "-"}
                        </span>
                      </div>

                      <div className="space-y-1 sm:col-span-2">
                        <span className="text-gray-400 block text-[11px]">Estado del Cliente</span>
                        <span className="text-white font-bold capitalize block">
                          {STATUS_CONFIG[selectedProfile.status]?.label || selectedProfile.status}
                        </span>
                      </div>

                      <div className="space-y-1 sm:col-span-2">
                        <span className="text-gray-400 block text-[11px]">Observaciones Generales</span>
                        <p className="text-gray-300 leading-relaxed bg-[#0d0f12] p-3 rounded-xl border border-white/5">
                          {selectedProfile.observations || "Sin observaciones registradas."}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="text-gray-400 text-[11px] block mb-1">Nombre Completo</label>
                        <input
                          type="text"
                          value={editFormData.fullName || ""}
                          onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                          className="w-full px-3 py-2 bg-[#0d0f12] border border-white/10 rounded-xl text-white text-xs"
                        />
                      </div>

                      <div>
                        <label className="text-gray-400 text-[11px] block mb-1">Negocio / Empresa</label>
                        <input
                          type="text"
                          value={editFormData.businessName || ""}
                          onChange={(e) => setEditFormData({ ...editFormData, businessName: e.target.value })}
                          className="w-full px-3 py-2 bg-[#0d0f12] border border-white/10 rounded-xl text-white text-xs"
                        />
                      </div>

                      <div>
                        <label className="text-gray-400 text-[11px] block mb-1">Teléfono</label>
                        <input
                          type="text"
                          value={editFormData.phone || ""}
                          onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                          className="w-full px-3 py-2 bg-[#0d0f12] border border-white/10 rounded-xl text-white text-xs"
                        />
                      </div>

                      <div>
                        <label className="text-gray-400 text-[11px] block mb-1">Correo</label>
                        <input
                          type="email"
                          value={editFormData.email || ""}
                          onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                          className="w-full px-3 py-2 bg-[#0d0f12] border border-white/10 rounded-xl text-white text-xs"
                        />
                      </div>

                      <div>
                        <label className="text-gray-400 text-[11px] block mb-1">Ciudad</label>
                        <input
                          type="text"
                          value={editFormData.city || ""}
                          onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                          className="w-full px-3 py-2 bg-[#0d0f12] border border-white/10 rounded-xl text-white text-xs"
                        />
                      </div>

                      <div>
                        <label className="text-gray-400 text-[11px] block mb-1">Estado</label>
                        <select
                          value={editFormData.status || "nuevo"}
                          onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                          className="w-full px-3 py-2 bg-[#0d0f12] border border-white/10 rounded-xl text-white text-xs"
                        >
                          <option value="nuevo">Nuevo</option>
                          <option value="en_evaluacion">En evaluación</option>
                          <option value="pendiente">Pendiente</option>
                          <option value="activo">Activo</option>
                          <option value="finalizado">Finalizado</option>
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-gray-400 text-[11px] block mb-1">Observaciones</label>
                        <textarea
                          rows={3}
                          value={editFormData.observations || ""}
                          onChange={(e) => setEditFormData({ ...editFormData, observations: e.target.value })}
                          className="w-full px-3 py-2 bg-[#0d0f12] border border-white/10 rounded-xl text-white text-xs"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* PESTAÑA 2: DIAGNÓSTICO */}
              {activeTabModal === "diagnostico" && (
                <div className="space-y-4">
                  {!isEditMode ? (
                    <div className="space-y-3.5">
                      <div>
                        <span className="text-gray-400 block text-[11px]">Situación Actual del Negocio</span>
                        <p className="text-white leading-relaxed bg-[#0d0f12] p-3 rounded-xl border border-white/5 mt-1">
                          {selectedProfile.businessSituation || "Sin información detallada."}
                        </p>
                      </div>

                      <div>
                        <span className="text-gray-400 block text-[11px]">Necesidades Detectadas</span>
                        <p className="text-white leading-relaxed bg-[#0d0f12] p-3 rounded-xl border border-white/5 mt-1">
                          {selectedProfile.needsDetected || "Sin información detallada."}
                        </p>
                      </div>

                      <div>
                        <span className="text-gray-400 block text-[11px]">Problemas a Resolver</span>
                        <p className="text-white leading-relaxed bg-[#0d0f12] p-3 rounded-xl border border-white/5 mt-1">
                          {selectedProfile.problems || "Sin información detallada."}
                        </p>
                      </div>

                      <div>
                        <span className="text-gray-400 block text-[11px]">Objetivos del Cliente</span>
                        <p className="text-white leading-relaxed bg-[#0d0f12] p-3 rounded-xl border border-white/5 mt-1">
                          {selectedProfile.businessGoals || "Sin información detallada."}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <label className="text-gray-400 text-[11px] block mb-1">Situación Actual del Negocio</label>
                        <textarea
                          rows={2}
                          value={editFormData.businessSituation || ""}
                          onChange={(e) => setEditFormData({ ...editFormData, businessSituation: e.target.value })}
                          className="w-full px-3 py-2 bg-[#0d0f12] border border-white/10 rounded-xl text-white text-xs"
                        />
                      </div>

                      <div>
                        <label className="text-gray-400 text-[11px] block mb-1">Necesidades Detectadas</label>
                        <textarea
                          rows={2}
                          value={editFormData.needsDetected || ""}
                          onChange={(e) => setEditFormData({ ...editFormData, needsDetected: e.target.value })}
                          className="w-full px-3 py-2 bg-[#0d0f12] border border-white/10 rounded-xl text-white text-xs"
                        />
                      </div>

                      <div>
                        <label className="text-gray-400 text-[11px] block mb-1">Problemas a Resolver</label>
                        <textarea
                          rows={2}
                          value={editFormData.problems || ""}
                          onChange={(e) => setEditFormData({ ...editFormData, problems: e.target.value })}
                          className="w-full px-3 py-2 bg-[#0d0f12] border border-white/10 rounded-xl text-white text-xs"
                        />
                      </div>

                      <div>
                        <label className="text-gray-400 text-[11px] block mb-1">Objetivos Comerciales</label>
                        <textarea
                          rows={2}
                          value={editFormData.businessGoals || ""}
                          onChange={(e) => setEditFormData({ ...editFormData, businessGoals: e.target.value })}
                          className="w-full px-3 py-2 bg-[#0d0f12] border border-white/10 rounded-xl text-white text-xs"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* PESTAÑA 3: PLAN CONTRATADO */}
              {activeTabModal === "plan" && (
                <div className="space-y-4">
                  {!isEditMode ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <span className="text-gray-400 block text-[11px]">Plan Elegido</span>
                        <span className="text-white font-bold text-sm block">
                          {selectedProfile.planName || "No definido"}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-gray-400 block text-[11px]">Inversión / Precio Acordado</span>
                        <span className="text-[#22C55E] font-black text-sm font-mono block">
                          {selectedProfile.planPrice ? `$${Number(selectedProfile.planPrice).toLocaleString("es-AR")}` : "A convenir"}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-gray-400 block text-[11px]">Fecha de Inicio</span>
                        <span className="text-white font-mono block">
                          {selectedProfile.startDate || "-"}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-gray-400 block text-[11px]">Próxima Renovación</span>
                        <span className="text-white font-mono block">
                          {selectedProfile.renewalDate || "-"}
                        </span>
                      </div>

                      <div className="sm:col-span-2 space-y-1">
                        <span className="text-gray-400 block text-[11px]">Servicios y Alcance Incluidos</span>
                        <p className="text-gray-300 leading-relaxed bg-[#0d0f12] p-3 rounded-xl border border-white/5">
                          {selectedProfile.includedServices || "No especificado."}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="text-gray-400 text-[11px] block mb-1">Plan Elegido</label>
                        <input
                          type="text"
                          value={editFormData.planName || ""}
                          onChange={(e) => setEditFormData({ ...editFormData, planName: e.target.value })}
                          className="w-full px-3 py-2 bg-[#0d0f12] border border-white/10 rounded-xl text-white text-xs"
                        />
                      </div>

                      <div>
                        <label className="text-gray-400 text-[11px] block mb-1">Precio Acordado (ARS)</label>
                        <input
                          type="number"
                          value={editFormData.planPrice || ""}
                          onChange={(e) => setEditFormData({ ...editFormData, planPrice: e.target.value })}
                          className="w-full px-3 py-2 bg-[#0d0f12] border border-white/10 rounded-xl text-white text-xs font-mono"
                        />
                      </div>

                      <div>
                        <label className="text-gray-400 text-[11px] block mb-1">Fecha de Inicio</label>
                        <input
                          type="date"
                          value={editFormData.startDate || ""}
                          onChange={(e) => setEditFormData({ ...editFormData, startDate: e.target.value })}
                          className="w-full px-3 py-2 bg-[#0d0f12] border border-white/10 rounded-xl text-white text-xs"
                        />
                      </div>

                      <div>
                        <label className="text-gray-400 text-[11px] block mb-1">Próxima Renovación</label>
                        <input
                          type="date"
                          value={editFormData.renewalDate || ""}
                          onChange={(e) => setEditFormData({ ...editFormData, renewalDate: e.target.value })}
                          className="w-full px-3 py-2 bg-[#0d0f12] border border-white/10 rounded-xl text-white text-xs"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-gray-400 text-[11px] block mb-1">Servicios y Alcance Incluidos</label>
                        <textarea
                          rows={3}
                          value={editFormData.includedServices || ""}
                          onChange={(e) => setEditFormData({ ...editFormData, includedServices: e.target.value })}
                          className="w-full px-3 py-2 bg-[#0d0f12] border border-white/10 rounded-xl text-white text-xs"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* PESTAÑA 4: ESTRATEGIA PUBLICITARIA */}
              {activeTabModal === "publicidad" && (
                <div className="space-y-4">
                  {!isEditMode ? (
                    <div className="space-y-3.5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <span className="text-gray-400 block text-[11px]">Tipo de Publicidad</span>
                          <span className="text-white font-bold block mt-0.5">
                            {selectedProfile.adStrategy || "No configurada"}
                          </span>
                        </div>

                        <div>
                          <span className="text-gray-400 block text-[11px]">Presupuesto en Pauta (Anuncios)</span>
                          <span className="text-white font-mono font-bold block mt-0.5">
                            {selectedProfile.adBudget ? `$${Number(selectedProfile.adBudget).toLocaleString("es-AR")}` : "No definido"}
                          </span>
                        </div>

                        <div className="sm:col-span-2">
                          <span className="text-gray-400 block text-[11px]">Plataformas Utilizadas</span>
                          <span className="text-white font-medium block mt-0.5">
                            {selectedProfile.adPlatforms || "Meta Ads (Instagram / Facebook)"}
                          </span>
                        </div>
                      </div>

                      <div>
                        <span className="text-gray-400 block text-[11px]">Campañas y Objetivos</span>
                        <p className="text-white leading-relaxed bg-[#0d0f12] p-3 rounded-xl border border-white/5 mt-1">
                          {selectedProfile.adCampaigns || "Sin campañas activas descritas."}
                        </p>
                      </div>

                      <div>
                        <span className="text-gray-400 block text-[11px]">Detalles de la Estrategia</span>
                        <p className="text-white leading-relaxed bg-[#0d0f12] p-3 rounded-xl border border-white/5 mt-1">
                          {selectedProfile.strategyDetails || "Sin detalles de estrategia."}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                          <label className="text-gray-400 text-[11px] block mb-1">Tipo de Publicidad</label>
                          <input
                            type="text"
                            value={editFormData.adStrategy || ""}
                            onChange={(e) => setEditFormData({ ...editFormData, adStrategy: e.target.value })}
                            placeholder="Ej: Captación de Leads por WhatsApp"
                            className="w-full px-3 py-2 bg-[#0d0f12] border border-white/10 rounded-xl text-white text-xs"
                          />
                        </div>

                        <div>
                          <label className="text-gray-400 text-[11px] block mb-1">Presupuesto Pauta (ARS)</label>
                          <input
                            type="number"
                            value={editFormData.adBudget || ""}
                            onChange={(e) => setEditFormData({ ...editFormData, adBudget: e.target.value })}
                            className="w-full px-3 py-2 bg-[#0d0f12] border border-white/10 rounded-xl text-white text-xs font-mono"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="text-gray-400 text-[11px] block mb-1">Plataformas Utilizadas</label>
                          <input
                            type="text"
                            value={editFormData.adPlatforms || ""}
                            onChange={(e) => setEditFormData({ ...editFormData, adPlatforms: e.target.value })}
                            placeholder="Meta Ads, Google Ads, TikTok, etc."
                            className="w-full px-3 py-2 bg-[#0d0f12] border border-white/10 rounded-xl text-white text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-gray-400 text-[11px] block mb-1">Campañas y Objetivos</label>
                        <textarea
                          rows={2}
                          value={editFormData.adCampaigns || ""}
                          onChange={(e) => setEditFormData({ ...editFormData, adCampaigns: e.target.value })}
                          className="w-full px-3 py-2 bg-[#0d0f12] border border-white/10 rounded-xl text-white text-xs"
                        />
                      </div>

                      <div>
                        <label className="text-gray-400 text-[11px] block mb-1">Detalles de la Estrategia</label>
                        <textarea
                          rows={3}
                          value={editFormData.strategyDetails || ""}
                          onChange={(e) => setEditFormData({ ...editFormData, strategyDetails: e.target.value })}
                          className="w-full px-3 py-2 bg-[#0d0f12] border border-white/10 rounded-xl text-white text-xs"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* PESTAÑA 5: HISTORIAL & SEGUIMIENTO */}
              {activeTabModal === "historial" && (
                <div className="space-y-5">
                  {/* Formulario rápido para añadir nuevo contacto/seguimiento */}
                  <form
                    onSubmit={handleAddFollowupSubmit}
                    className="bg-[#0d0f12] border border-white/10 rounded-2xl p-3.5 sm:p-4 space-y-3"
                  >
                    <span className="text-xs font-bold text-white block">
                      Registrar Nuevo Contacto o Avance
                    </span>

                    <textarea
                      rows={2}
                      required
                      value={newFollowupText}
                      onChange={(e) => setNewFollowupText(e.target.value)}
                      placeholder="Detalle de la llamada, mensaje de WhatsApp, reunión o avance..."
                      className="w-full px-3 py-2 bg-[#141519] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-[#16A34A]"
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <input
                        type="text"
                        value={newFollowupNextAction}
                        onChange={(e) => setNewFollowupNextAction(e.target.value)}
                        placeholder="Próxima acción planificada..."
                        className="px-3 py-1.5 bg-[#141519] border border-white/10 rounded-xl text-white text-xs"
                      />

                      <input
                        type="date"
                        value={newFollowupNextDate}
                        onChange={(e) => setNewFollowupNextDate(e.target.value)}
                        className="px-3 py-1.5 bg-[#141519] border border-white/10 rounded-xl text-white text-xs"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={saving || !newFollowupText.trim()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{saving ? "Guardando..." : "Registrar Seguimiento"}</span>
                      </button>
                    </div>
                  </form>

                  {/* Línea de tiempo de cambios y actividades */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-gray-400 block">
                      Historial de Actividades y Modificaciones
                    </span>

                    {(!selectedProfile.historial || selectedProfile.historial.length === 0) ? (
                      <p className="text-gray-500 text-xs py-4 text-center">
                        No hay eventos registrados en el historial de esta ficha.
                      </p>
                    ) : (
                      <div className="space-y-2.5">
                        {selectedProfile.historial.map((entry, idx) => (
                          <div
                            key={entry.id || idx}
                            className="bg-[#0d0f12] border border-white/5 rounded-xl p-3 space-y-1"
                          >
                            <div className="flex items-center justify-between text-[11px] text-gray-400">
                              <span className="font-bold text-white">
                                {entry.title || "Actividad registrada"}
                              </span>
                              <span className="font-mono text-[10px]">
                                {entry.timestamp ? new Date(entry.timestamp).toLocaleString("es-AR") : "-"}
                              </span>
                            </div>

                            <p className="text-gray-300 text-xs leading-relaxed">
                              {entry.description}
                            </p>

                            {entry.author && (
                              <span className="text-[10px] text-gray-400 block pt-0.5">
                                Registrado por: <strong className="text-gray-300">{entry.author}</strong>
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
