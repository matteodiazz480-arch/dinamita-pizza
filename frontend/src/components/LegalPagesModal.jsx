import React, { useState, useEffect } from "react";
import { LEGAL_DOCS } from "../data/legalData";
import { X, Shield, FileText, Cookie, Lock, Check, AlertCircle } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { securePost, sanitizeClientText } from "../utils/securityClient";

export default function LegalPagesModal({
  activeDocId,
  onSelectDoc,
  onClose,
  onOpenCookieSettings,
}) {
  const prefersReducedMotion = useReducedMotion();
  const isOpen = Boolean(activeDocId);
  const currentDoc = LEGAL_DOCS[activeDocId] || LEGAL_DOCS.privacidad;

  const [arcoForm, setArcoForm] = useState({
    fullName: "",
    email: "",
    rightType: "acceso",
    details: "",
    website_url: "",
  });
  const [arcoStatus, setArcoStatus] = useState("idle");
  const [arcoError, setArcoError] = useState("");
  const [arcoTrackingId, setArcoTrackingId] = useState("");

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleArcoChange = (e) => {
    const { name, value } = e.target;
    setArcoForm((prev) => ({
      ...prev,
      [name]: sanitizeClientText(value, name === "details" ? 600 : 120),
    }));
    if (arcoError) setArcoError("");
  };

  const handleArcoSubmit = async (e) => {
    e.preventDefault();
    setArcoError("");

    if (
      arcoForm.fullName.trim().length < 2 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(arcoForm.email.trim()) ||
      arcoForm.details.trim().length < 5
    ) {
      setArcoError(
        "Por favor completá tu nombre, un correo electrónico válido y el detalle de tu solicitud."
      );
      return;
    }

    setArcoStatus("loading");
    const res = await securePost("/api/privacy/rights", arcoForm);

    if (res.ok) {
      setArcoTrackingId(res.data.trackingId || "ARCO-REGISTRADO");
      setArcoStatus("success");
      setArcoForm({
        fullName: "",
        email: "",
        rightType: "acceso",
        details: "",
        website_url: "",
      });
    } else {
      setArcoStatus("error");
      setArcoError(
        res.data?.error || "No se pudo procesar la solicitud. Intentá nuevamente."
      );
    }
  };

  const tabs = [
    { id: "privacidad", label: "Política de Privacidad", icon: Shield },
    { id: "cookies", label: "Política de Cookies", icon: Cookie },
    { id: "terminos", label: "Términos y Condiciones", icon: FileText },
    { id: "seguridad", label: "Política de Seguridad", icon: Lock },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
          />

          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={prefersReducedMotion ? false : { opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label={currentDoc.title}
            className="relative w-full max-w-4xl max-h-[88vh] bg-[#141519] border border-white/10 rounded-2xl text-white shadow-2xl z-10 flex flex-col overflow-hidden my-auto"
          >
            <div className="p-4 sm:px-6 bg-[#111111] border-b border-white/10 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-0.5 rounded-md bg-white/[0.06] border border-white/10 text-[11px] font-bold text-[#BCE838] tracking-wide">
                    {currentDoc.lawBadge}
                  </span>
                  <span className="text-xs text-gray-400">
                    Actualizado: {currentDoc.updatedAt}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer"
                  aria-label="Cerrar documentos legales"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = currentDoc.id === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setArcoStatus("idle");
                        setArcoError("");
                        onSelectDoc(tab.id);
                      }}
                      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                        isActive
                          ? "bg-[#BCE838] text-[#111111]"
                          : "bg-white/[0.04] hover:bg-white/[0.08] text-gray-300 border border-white/[0.06]"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6 text-gray-300">
              <div className="space-y-2 border-b border-white/10 pb-5">
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {currentDoc.title}
                </h2>
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                  {currentDoc.intro}
                </p>
              </div>

              {currentDoc.pendingFieldsNotice && (
                <div className="rounded-xl bg-[#1b1d24] border border-amber-400/25 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-amber-300 uppercase tracking-wider">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>Datos del titular pendientes de completar antes de publicar</span>
                  </div>
                  <ul className="space-y-1 text-xs text-gray-300 list-disc list-inside">
                    {currentDoc.pendingFieldsNotice.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="space-y-5">
                {currentDoc.sections.map((sec, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <h3 className="text-sm sm:text-base font-extrabold text-white">
                      {sec.heading}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-300 leading-relaxed whitespace-pre-line">
                      {sec.body}
                    </p>
                  </div>
                ))}
              </div>

              {currentDoc.id === "cookies" && (
                <div className="rounded-xl bg-[#0d0f12] border border-white/10 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs sm:text-sm font-extrabold text-white">
                      Panel de gestión de consentimiento
                    </h4>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Podés revisar o revocar tus permisos de cookies opcionales ahora mismo.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenCookieSettings?.();
                    }}
                    className="px-4 py-2.5 rounded-xl bg-[#BCE838] hover:bg-[#add92b] text-[#111111] font-extrabold text-xs whitespace-nowrap transition-colors cursor-pointer"
                  >
                    Configurar mis cookies
                  </button>
                </div>
              )}

              {currentDoc.id === "privacidad" && (
                <div className="mt-8 pt-6 border-t border-white/10">
                  <div className="rounded-2xl bg-[#0d0f12] border border-white/10 p-5 sm:p-6 space-y-4">
                    <div>
                      <h3 className="text-base sm:text-lg font-extrabold text-white">
                        Formulario para ejercer derechos ARCO (Ley N° 25.326)
                      </h3>
                      <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                        Si enviaste tus datos previamente a través de nuestro formulario comercial, podés solicitar el acceso, rectificación, actualización o supresión de tu registro.
                      </p>
                    </div>

                    {arcoStatus === "success" ? (
                      <div className="rounded-xl bg-[#141812] border border-[#BCE838]/30 p-4 flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-[#BCE838] text-[#111111] flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </span>
                        <div className="space-y-1 text-xs">
                          <p className="font-bold text-white">
                            Solicitud registrada correctamente (Código: {arcoTrackingId})
                          </p>
                          <p className="text-gray-300">
                            Procesaremos tu solicitud dentro de los plazos legales previstos por los artículos 14 y 16 de la Ley N° 25.326.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={handleArcoSubmit} className="space-y-3" noValidate>
                        <div className="hidden" aria-hidden="true">
                          <input
                            type="text"
                            name="website_url"
                            tabIndex={-1}
                            autoComplete="off"
                            value={arcoForm.website_url}
                            onChange={handleArcoChange}
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold uppercase text-gray-300 mb-1">
                              Nombre y apellido *
                            </label>
                            <input
                              type="text"
                              name="fullName"
                              value={arcoForm.fullName}
                              onChange={handleArcoChange}
                              placeholder="Tu nombre"
                              className="w-full bg-[#141519] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#BCE838]"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold uppercase text-gray-300 mb-1">
                              Correo electrónico *
                            </label>
                            <input
                              type="email"
                              name="email"
                              value={arcoForm.email}
                              onChange={handleArcoChange}
                              placeholder="correo@ejemplo.com"
                              className="w-full bg-[#141519] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#BCE838]"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold uppercase text-gray-300 mb-1">
                              Derecho a ejercer *
                            </label>
                            <select
                              name="rightType"
                              value={arcoForm.rightType}
                              onChange={handleArcoChange}
                              className="w-full bg-[#141519] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#BCE838]"
                            >
                              <option value="acceso">Acceso a mis datos</option>
                              <option value="rectificacion">Rectificación de datos</option>
                              <option value="actualizacion">Actualización de datos</option>
                              <option value="supresion">Supresión / Eliminación</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold uppercase text-gray-300 mb-1">
                            Detalle de la solicitud *
                          </label>
                          <textarea
                            rows={2}
                            name="details"
                            value={arcoForm.details}
                            onChange={handleArcoChange}
                            placeholder="Indicá qué dato deseás consultar, rectificar o eliminar de nuestros registros."
                            className="w-full bg-[#141519] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#BCE838] resize-none"
                          />
                        </div>

                        {arcoError && (
                          <p className="text-xs text-rose-400 flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                            <span>{arcoError}</span>
                          </p>
                        )}

                        <button
                          type="submit"
                          disabled={arcoStatus === "loading"}
                          className="px-5 py-2.5 rounded-xl bg-[#BCE838] hover:bg-[#add92b] disabled:opacity-60 text-[#111111] font-extrabold text-xs transition-colors cursor-pointer"
                        >
                          {arcoStatus === "loading"
                            ? "Enviando solicitud..."
                            : "Enviar solicitud de derechos ARCO"}
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
