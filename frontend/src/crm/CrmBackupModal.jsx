import React, { useState, useEffect } from "react";
import {
  X,
  Database,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RotateCcw,
  ShieldCheck,
  FileCheck,
  RefreshCw,
  HardDrive,
  FileJson,
} from "lucide-react";
import {
  crmCreateBackup,
  crmGetBackups,
  crmRestoreBackupTest,
  crmRestoreBackup,
} from "./crmApi";

export default function CrmBackupModal({ isOpen, onClose, onRefreshData }) {
  const [backupsHistory, setBackupsHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState("");
  const [actionError, setActionError] = useState("");

  // Estado para la prueba de restauración
  const [testReport, setTestReport] = useState(null);
  const [testingRestore, setTestingRestore] = useState(false);
  const [selectedFileContent, setSelectedFileContent] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreCollections, setRestoreCollections] = useState({
    leads: true,
    clients: true,
    customer_profiles: true,
    expenses: true,
  });

  const loadHistory = async () => {
    setLoading(true);
    try {
      const res = await crmGetBackups();
      if (res.ok) {
        setBackupsHistory(res.backups);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadHistory();
      setActionSuccess("");
      setActionError("");
      setTestReport(null);
      setSelectedFileContent(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCreateNow = async () => {
    setLoading(true);
    setActionSuccess("");
    setActionError("");
    try {
      const res = await crmCreateBackup("manual", sessionStorage.getItem("nexo_crm_user") || "Administrador");
      if (res.ok && res.backup) {
        setActionSuccess(`Copia de seguridad generada con éxito (${res.backup.counts.total} registros respaldados).`);
        await loadHistory();

        // Ofrecer descarga automática para almacenamiento externo
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(res.backup, null, 2));
        const downloadAnchor = document.createElement("a");
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `NEXO_Backup_${res.backup.createdAt.slice(0, 10)}_${res.backup.backupId}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
      } else {
        setActionError(res.error || "No se pudo generar la copia de seguridad.");
      }
    } catch (err) {
      setActionError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFileName(file.name);
    setTestReport(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result;
        setSelectedFileContent(content);
      } catch (err) {
        setActionError("Error al leer el archivo seleccionado: " + err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleRunRestoreTest = async () => {
    if (!selectedFileContent) {
      setActionError("Por favor seleccioná o cargá un archivo JSON de copia de seguridad primero.");
      return;
    }

    setTestingRestore(true);
    setActionError("");
    setTestReport(null);

    try {
      const res = await crmRestoreBackupTest(selectedFileContent);
      if (res.ok) {
        setTestReport(res.report);
      } else {
        setActionError(res.error || "La copia no superó la verificación de estructura.");
      }
    } catch (err) {
      setActionError("Error en prueba de validación: " + err.message);
    } finally {
      setTestingRestore(false);
    }
  };

  const handleConfirmRestore = async () => {
    if (!testReport || !testReport.isSafeToRestore) {
      alert("No podés restaurar un archivo que no haya superado exitosamente la prueba de integridad previa.");
      return;
    }

    const cols = Object.keys(restoreCollections).filter((k) => restoreCollections[k]);
    if (cols.length === 0) {
      alert("Seleccioná al menos una colección para restaurar.");
      return;
    }

    const conf = window.confirm(
      `¿Confirmás la restauración de ${testReport.totalDocs} registros en Firebase Firestore para las colecciones seleccionadas (${cols.join(", ")})?`
    );
    if (!conf) return;

    setIsRestoring(true);
    try {
      const res = await crmRestoreBackup(selectedFileContent, cols);
      if (res.ok) {
        setActionSuccess(`Restauración completada con éxito. Se importaron/actualizaron ${res.results.restored} documentos en Firestore.`);
        await loadHistory();
        if (onRefreshData) onRefreshData();
      } else {
        setActionError(res.error || "Error durante el proceso de restauración.");
      }
    } catch (err) {
      setActionError("Error al restaurar: " + err.message);
    } finally {
      setIsRestoring(false);
    }
  };

  const latestBackup = backupsHistory[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#141519] border border-white/15 rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Cabecera */}
        <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#16A34A]/15 text-[#22C55E]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">
                Copias de Seguridad &amp; Restauración
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Respaldo automático periódico y verificación de integridad de Firebase.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Notificaciones */}
        {actionSuccess && (
          <div className="bg-emerald-500/15 border-b border-emerald-500/30 p-3 px-6 flex items-center gap-2 text-xs text-emerald-300">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}
        {actionError && (
          <div className="bg-red-500/15 border-b border-red-500/30 p-3 px-6 flex items-center gap-2 text-xs text-red-300">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{actionError}</span>
          </div>
        )}

        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6 text-xs">
          {/* 1. ESTADO DEL SISTEMA AUTOMÁTICO */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-[#0d0f12] border border-white/10 rounded-2xl p-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                Frecuencia Automática
              </span>
              <span className="text-sm font-black text-white mt-1 block flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#22C55E]" />
                <span>Cada 24 horas</span>
              </span>
              <span className="text-[11px] text-emerald-400 font-semibold block mt-1">
                Servicio Activo
              </span>
            </div>

            <div className="bg-[#0d0f12] border border-white/10 rounded-2xl p-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                Última Copia Exitosa
              </span>
              <span className="text-xs font-mono font-bold text-white mt-1 block truncate">
                {latestBackup?.createdAt ? new Date(latestBackup.createdAt).toLocaleString("es-AR") : "Pendiente"}
              </span>
              <span className="text-[11px] text-gray-400 block mt-1">
                {latestBackup?.counts?.total ? `${latestBackup.counts.total} registros` : "Sin copias previas"}
              </span>
            </div>

            <div className="bg-[#0d0f12] border border-white/10 rounded-2xl p-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                Almacenamiento Separado
              </span>
              <span className="text-sm font-black text-white mt-1 block flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-blue-400" />
                <span>Nube &amp; Descarga JSON</span>
              </span>
              <span className="text-[11px] text-gray-400 block mt-1">
                Aislado de fallas de base
              </span>
            </div>
          </div>

          {/* 2. ACCIÓN: GENERAR BACKUP MANUAL */}
          <div className="bg-[#0d0f12] border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-white">
                Generar y Descargar Copia de Seguridad Inmediata
              </h3>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Crea un snapshot completo con hash de verificación de Leads, Clientes, Fichas de Atención y Gastos.
              </p>
            </div>

            <button
              type="button"
              disabled={loading}
              onClick={handleCreateNow}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold transition-colors cursor-pointer shadow-sm disabled:opacity-50 whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              <span>{loading ? "Generando..." : "Crear Backup Ahora"}</span>
            </button>
          </div>

          {/* 3. PRUEBA DE RESTAURACIÓN SEGURA (DRY-RUN RESTORE) */}
          <div className="bg-[#0d0f12] border border-white/10 rounded-2xl p-4 space-y-3.5">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
                <h3 className="text-xs sm:text-sm font-bold text-white">
                  Verificación de Integridad &amp; Prueba de Restauración
                </h3>
              </div>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Comprueba que un archivo de backup sea íntegro, compatible y recuperable sin modificar ningún dato real en producción.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <label className="flex-1 flex items-center justify-between px-3 py-2 bg-[#141519] border border-dashed border-white/20 rounded-xl cursor-pointer hover:border-white/40 transition-colors">
                <span className="text-gray-300 truncate text-[11px]">
                  {selectedFileName || "Seleccionar archivo JSON de backup para probar..."}
                </span>
                <Upload className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                disabled={testingRestore || !selectedFileContent}
                onClick={handleRunRestoreTest}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold transition-colors cursor-pointer disabled:opacity-40 whitespace-nowrap text-xs"
              >
                {testingRestore ? "Verificando..." : "Ejecutar Prueba de Integridad"}
              </button>
            </div>

            {/* Resultado del Informe de Prueba */}
            {testReport && (
              <div className="mt-3 p-3.5 rounded-xl bg-[#141519] border border-emerald-500/30 space-y-2.5 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Prueba Superada: Archivo 100% Válido y Recuperable</span>
                  </div>
                  <span className="text-[10px] font-mono text-gray-400">
                    Checksum: {testReport.checksum}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1">
                  <div className="bg-[#0d0f12] p-2 rounded-lg border border-white/5">
                    <span className="text-gray-400 block text-[10px]">Leads</span>
                    <span className="font-bold text-white">{testReport.counts.leads || 0}</span>
                  </div>
                  <div className="bg-[#0d0f12] p-2 rounded-lg border border-white/5">
                    <span className="text-gray-400 block text-[10px]">Clientes Activos</span>
                    <span className="font-bold text-white">{testReport.counts.clients || 0}</span>
                  </div>
                  <div className="bg-[#0d0f12] p-2 rounded-lg border border-white/5">
                    <span className="text-gray-400 block text-[10px]">Fichas Atención</span>
                    <span className="font-bold text-white">{testReport.counts.customer_profiles || 0}</span>
                  </div>
                  <div className="bg-[#0d0f12] p-2 rounded-lg border border-white/5">
                    <span className="text-gray-400 block text-[10px]">Gastos</span>
                    <span className="font-bold text-white">{testReport.counts.expenses || 0}</span>
                  </div>
                </div>

                {/* Opciones de Restauración Real Controlada */}
                <div className="border-t border-white/5 pt-3 mt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-gray-400 font-semibold">Restaurar:</span>
                    <label className="inline-flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={restoreCollections.leads}
                        onChange={(e) => setRestoreCollections({ ...restoreCollections, leads: e.target.checked })}
                        className="rounded accent-[#16A34A]"
                      />
                      <span>Leads</span>
                    </label>
                    <label className="inline-flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={restoreCollections.customer_profiles}
                        onChange={(e) => setRestoreCollections({ ...restoreCollections, customer_profiles: e.target.checked })}
                        className="rounded accent-[#16A34A]"
                      />
                      <span>Fichas</span>
                    </label>
                    <label className="inline-flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={restoreCollections.clients}
                        onChange={(e) => setRestoreCollections({ ...restoreCollections, clients: e.target.checked })}
                        className="rounded accent-[#16A34A]"
                      />
                      <span>Clientes</span>
                    </label>
                    <label className="inline-flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={restoreCollections.expenses}
                        onChange={(e) => setRestoreCollections({ ...restoreCollections, expenses: e.target.checked })}
                        className="rounded accent-[#16A34A]"
                      />
                      <span>Gastos</span>
                    </label>
                  </div>

                  <button
                    type="button"
                    disabled={isRestoring}
                    onClick={handleConfirmRestore}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-bold transition-colors cursor-pointer text-xs flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{isRestoring ? "Restaurando..." : "Restaurar Copia en Firestore"}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 4. HISTORIAL DE BACKUPS EN FIRESTORE */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-300">
                Historial de Copias Registradas
              </span>
              <button
                type="button"
                onClick={loadHistory}
                className="text-[11px] text-gray-400 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Actualizar</span>
              </button>
            </div>

            {backupsHistory.length === 0 ? (
              <p className="text-gray-500 text-center py-4 bg-[#0d0f12] rounded-xl border border-white/5">
                No hay copias previas registradas en Firestore.
              </p>
            ) : (
              <div className="space-y-2">
                {backupsHistory.slice(0, 8).map((bkp) => (
                  <div
                    key={bkp.id || bkp.backupId}
                    className="bg-[#0d0f12] border border-white/5 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] font-bold text-white">
                          {bkp.backupId || bkp.id}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase ${
                            bkp.status === "success"
                              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                              : "bg-red-500/15 text-red-400 border border-red-500/30"
                          }`}
                        >
                          {bkp.status === "success" ? "Correcto" : "Fallo"}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {bkp.type === "automatic" ? "Automático (24h)" : "Manual"}
                        </span>
                      </div>
                      <span className="text-[11px] text-gray-400 block mt-0.5">
                        {bkp.createdAt ? new Date(bkp.createdAt).toLocaleString("es-AR") : "-"} • Autor: {bkp.author || "Sistema"}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px]">
                      {bkp.counts && (
                        <span className="text-gray-300 font-mono">
                          {bkp.counts.total || 0} registros
                        </span>
                      )}
                      {bkp.checksum && (
                        <span className="text-gray-400 font-mono text-[10px] hidden md:inline">
                          {bkp.checksum}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
