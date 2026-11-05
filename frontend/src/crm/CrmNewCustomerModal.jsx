import React, { useState, useEffect } from "react";
import { X, Check, AlertTriangle, User, Building, Phone, Mail, FileText, Send } from "lucide-react";

export default function CrmNewCustomerModal({
  isOpen,
  onClose,
  onCreateCustomer,
  existingProfiles = [],
  initialLeadData = null,
}) {
  const [formData, setFormData] = useState({
    fullName: "",
    businessName: "",
    phone: "",
    email: "",
    city: "",
    socials: "",
    rubro: "",
    status: "nuevo",
    // Diagnóstico
    businessSituation: "",
    needsDetected: "",
    problems: "",
    businessGoals: "",
    // Plan
    planName: "Plan Captación Meta Ads",
    planPrice: "180000",
    includedServices: "",
    startDate: new Date().toISOString().slice(0, 10),
    renewalDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    // Publicidad
    adStrategy: "Captación de Consultas en WhatsApp",
    adPlatforms: "Meta Ads (Instagram & Facebook)",
    adCampaigns: "",
    adBudget: "100000",
    strategyDetails: "",
    // Observaciones
    observations: "",
  });

  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialLeadData) {
      setFormData((prev) => ({
        ...prev,
        fullName: initialLeadData.fullName || "",
        businessName: initialLeadData.businessName || "",
        phone: initialLeadData.phone || "",
        email: initialLeadData.email || "",
        rubro: initialLeadData.rubro || "",
        planName: initialLeadData.service || "Plan Captación Meta Ads",
        observations: initialLeadData.message || initialLeadData.notes || "",
        businessSituation: initialLeadData.message ? `Consulta web inicial: ${initialLeadData.message}` : "",
      }));
    }
  }, [initialLeadData]);

  // Detector de duplicados en tiempo real por teléfono o email
  useEffect(() => {
    const cleanPhone = (formData.phone || "").replace(/[^0-9]/g, "");
    const cleanEmail = (formData.email || "").trim().toLowerCase();

    if (cleanPhone.length >= 8 || (cleanEmail && cleanEmail.includes("@"))) {
      const match = existingProfiles.find((p) => {
        const pPhone = (p.phone || "").replace(/[^0-9]/g, "");
        const pEmail = (p.email || "").trim().toLowerCase();
        return (
          (cleanPhone.length >= 8 && pPhone && pPhone === cleanPhone) ||
          (cleanEmail && pEmail && pEmail === cleanEmail)
        );
      });

      if (match) {
        setDuplicateWarning({
          name: match.fullName || match.businessName,
          refId: match.refId || match.id,
          phone: match.phone,
        });
      } else {
        setDuplicateWarning(null);
      }
    } else {
      setDuplicateWarning(null);
    }
  }, [formData.phone, formData.email, existingProfiles]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName.trim() && !formData.businessName.trim()) {
      alert("Por favor ingresá al menos el nombre del cliente o de su negocio.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await onCreateCustomer(formData);
      if (res !== false) {
        onClose();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#141519] border border-white/15 rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-black text-white">
              Nueva Ficha de Cliente
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Atención al Público: Datos, Diagnóstico y Servicio.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Alerta de duplicado */}
        {duplicateWarning && (
          <div className="bg-amber-500/15 border-b border-amber-500/30 p-3 px-6 flex items-center gap-2.5 text-xs text-amber-300">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>
              <strong>Atención:</strong> Ya existe un cliente registrado con estos datos:{" "}
              <strong>{duplicateWarning.name}</strong> (Ref: {duplicateWarning.refId}).
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5 text-xs">
          {/* SECCIÓN 1: DATOS BÁSICOS */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-[#22C55E] uppercase tracking-wider block">
              1. Datos del Cliente
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-gray-300 block mb-1">Nombre y Apellido *</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Ej: Mateo Díaz"
                  className="w-full px-3 py-2 bg-[#0d0f12] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-[#16A34A]"
                />
              </div>

              <div>
                <label className="text-gray-300 block mb-1">Negocio / Marca</label>
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  placeholder="Ej: Estudio Jurídico Díaz"
                  className="w-full px-3 py-2 bg-[#0d0f12] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-[#16A34A]"
                />
              </div>

              <div>
                <label className="text-gray-300 block mb-1">Teléfono / WhatsApp *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Ej: +54 9 11 1234-5678"
                  className="w-full px-3 py-2 bg-[#0d0f12] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-[#16A34A]"
                />
              </div>

              <div>
                <label className="text-gray-300 block mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="cliente@ejemplo.com"
                  className="w-full px-3 py-2 bg-[#0d0f12] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-[#16A34A]"
                />
              </div>

              <div>
                <label className="text-gray-300 block mb-1">Ciudad / Ubicación</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Ej: CABA / Buenos Aires"
                  className="w-full px-3 py-2 bg-[#0d0f12] border border-white/10 rounded-xl text-white text-xs"
                />
              </div>

              <div>
                <label className="text-gray-300 block mb-1">Estado Inicial</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0d0f12] border border-white/10 rounded-xl text-white text-xs cursor-pointer"
                >
                  <option value="nuevo">Nuevo</option>
                  <option value="en_evaluacion">En evaluación</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="activo">Activo</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECCIÓN 2: DIAGNÓSTICO */}
          <div className="space-y-3 border-t border-white/10 pt-4">
            <span className="text-xs font-bold text-[#22C55E] uppercase tracking-wider block">
              2. Diagnóstico del Negocio
            </span>

            <div className="space-y-2.5">
              <div>
                <label className="text-gray-300 block mb-1">Situación Actual del Negocio</label>
                <textarea
                  rows={2}
                  value={formData.businessSituation}
                  onChange={(e) => setFormData({ ...formData, businessSituation: e.target.value })}
                  placeholder="Cómo se encuentra el negocio actualmente, qué canales utiliza..."
                  className="w-full px-3 py-2 bg-[#0d0f12] border border-white/10 rounded-xl text-white text-xs"
                />
              </div>

              <div>
                <label className="text-gray-300 block mb-1">Necesidades y Problemas Detectados</label>
                <textarea
                  rows={2}
                  value={formData.needsDetected}
                  onChange={(e) => setFormData({ ...formData, needsDetected: e.target.value })}
                  placeholder="Falta de consultas, presencia descuidada, anuncios ineficientes..."
                  className="w-full px-3 py-2 bg-[#0d0f12] border border-white/10 rounded-xl text-white text-xs"
                />
              </div>

              <div>
                <label className="text-gray-300 block mb-1">Objetivos Comerciales del Cliente</label>
                <input
                  type="text"
                  value={formData.businessGoals}
                  onChange={(e) => setFormData({ ...formData, businessGoals: e.target.value })}
                  placeholder="Ej: Aumentar 30% las ventas por WhatsApp este trimestre"
                  className="w-full px-3 py-2 bg-[#0d0f12] border border-white/10 rounded-xl text-white text-xs"
                />
              </div>
            </div>
          </div>

          {/* SECCIÓN 3: PLAN CONTRATADO & PUBLICIDAD */}
          <div className="space-y-3 border-t border-white/10 pt-4">
            <span className="text-xs font-bold text-[#22C55E] uppercase tracking-wider block">
              3. Plan y Estrategia Publicitaria
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-gray-300 block mb-1">Plan Elegido</label>
                <select
                  value={formData.planName}
                  onChange={(e) => setFormData({ ...formData, planName: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0d0f12] border border-white/10 rounded-xl text-white text-xs cursor-pointer"
                >
                  <option value="Plan Presencia & Contenido">Plan Presencia & Contenido</option>
                  <option value="Plan Captación Meta Ads">Plan Captación Meta Ads</option>
                  <option value="Plan Crecimiento Integral">Plan Crecimiento Integral</option>
                  <option value="Páginas Web Totalmente Personalizables">Páginas Web Totalmente Personalizables</option>
                  <option value="Servicio Personalizado">Servicio Personalizado</option>
                </select>
              </div>

              <div>
                <label className="text-gray-300 block mb-1">Honorarios / Precio Acordado (ARS)</label>
                <input
                  type="number"
                  value={formData.planPrice}
                  onChange={(e) => setFormData({ ...formData, planPrice: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0d0f12] border border-white/10 rounded-xl text-white text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-gray-300 block mb-1">Estrategia Publicitaria</label>
                <input
                  type="text"
                  value={formData.adStrategy}
                  onChange={(e) => setFormData({ ...formData, adStrategy: e.target.value })}
                  placeholder="Ej: Anuncios a WhatsApp con mensajes filtrados"
                  className="w-full px-3 py-2 bg-[#0d0f12] border border-white/10 rounded-xl text-white text-xs"
                />
              </div>

              <div>
                <label className="text-gray-300 block mb-1">Presupuesto en Pauta (ARS)</label>
                <input
                  type="number"
                  value={formData.adBudget}
                  onChange={(e) => setFormData({ ...formData, adBudget: e.target.value })}
                  placeholder="Monto destinado a Meta/Google"
                  className="w-full px-3 py-2 bg-[#0d0f12] border border-white/10 rounded-xl text-white text-xs font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-gray-300 block mb-1">Observaciones / Indicaciones Adicionales</label>
                <textarea
                  rows={2}
                  value={formData.observations}
                  onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                  placeholder="Instrucciones para el equipo, preferencias de comunicación..."
                  className="w-full px-3 py-2 bg-[#0d0f12] border border-white/10 rounded-xl text-white text-xs"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-4 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold transition-colors cursor-pointer shadow-sm disabled:opacity-50"
            >
              {submitting ? "Registrando..." : "Crear Ficha"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
