import React, { useState, useEffect } from "react";
import {
  X,
  UserCheck,
  Plus,
  Trash2,
  Lock,
  Shield,
  Key,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Edit2,
  Save,
} from "lucide-react";
import { crmGetUsers, crmCreateUser, crmUpdateUser, crmDeleteUser } from "./crmApi";

const ROLE_CONFIG = {
  admin: { label: "Administrador", badge: "bg-red-500/15 text-red-300 border-red-500/30" },
  atencion: { label: "Atención al Cliente", badge: "bg-blue-500/15 text-blue-300 border-blue-500/30" },
  marketing: { label: "Marketing", badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
};

export default function CrmUsersModal({ isOpen, onClose, onShowToast }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    role: "atencion",
    password: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editPass, setEditPass] = useState("");

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await crmGetUsers();
      if (res.ok) {
        setUsers(res.users);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadUsers();
      setIsAdding(false);
      setEditingUser(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username.trim() || !formData.password.trim()) {
      alert("Completá el nombre de usuario y contraseña.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await crmCreateUser(formData);
      if (res.ok) {
        onShowToast?.({
          type: "success",
          title: "Usuario registrado con éxito",
          message: `El usuario "${formData.username}" fue creado con rol ${ROLE_CONFIG[formData.role]?.label || formData.role}.`,
        });
        setFormData({ username: "", name: "", role: "atencion", password: "" });
        setIsAdding(false);
        await loadUsers();
      } else {
        alert(res.error || "No se pudo registrar el usuario.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSavePassword = async (username) => {
    if (!editPass.trim() || editPass.length < 4) {
      alert("La contraseña debe tener al menos 4 caracteres.");
      return;
    }

    try {
      const res = await crmUpdateUser(username, { password: editPass.trim() });
      if (res.ok) {
        onShowToast?.({
          type: "success",
          title: "Contraseña actualizada",
          message: `Se cambió la clave para el usuario ${username}.`,
        });
        setEditingUser(null);
        setEditPass("");
        await loadUsers();
      } else {
        alert(res.error || "Error al actualizar contraseña.");
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === "inactivo" ? "activo" : "inactivo";
    const res = await crmUpdateUser(user.username, { status: newStatus });
    if (res.ok) {
      onShowToast?.({
        type: "info",
        title: "Estado de usuario modificado",
        message: `El usuario ${user.username} ahora está ${newStatus}.`,
      });
      await loadUsers();
    }
  };

  const handleDelete = async (username) => {
    if (window.confirm(`¿Seguro que deseás revocar el acceso y eliminar el usuario "${username}"?`)) {
      const res = await crmDeleteUser(username);
      if (res.ok) {
        onShowToast?.({
          type: "info",
          title: "Usuario eliminado",
          message: `Se removió la cuenta ${username}.`,
        });
        await loadUsers();
      } else {
        alert(res.error || "Error al eliminar usuario.");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#141519] border border-white/15 rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto text-xs">
        {/* Cabecera */}
        <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-500/15 text-red-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">
                Gestión de Usuarios &amp; Accesos
              </h2>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Control de roles independientes: Administrador, Atención al cliente y Marketing.
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

        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* Barra de acción: Crear Usuario */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-300">
              Cuentas del Equipo ({users.length})
            </span>

            <button
              type="button"
              onClick={() => setIsAdding(!isAdding)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isAdding ? "Cancelar" : "Nuevo Usuario"}</span>
            </button>
          </div>

          {/* Formulario de Alta de Usuario */}
          {isAdding && (
            <form onSubmit={handleCreateSubmit} className="bg-[#0d0f12] p-4 rounded-2xl border border-white/10 space-y-3">
              <span className="text-xs font-bold text-white block">Crear Nueva Cuenta de Acceso</span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-400 block mb-1 text-[11px]">Nombre de Usuario *</label>
                  <input
                    type="text"
                    required
                    placeholder="ej: laura_atencion"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().trim() })}
                    className="w-full px-3 py-2 bg-[#141519] border border-white/10 rounded-xl text-white text-xs"
                  />
                </div>

                <div>
                  <label className="text-gray-400 block mb-1 text-[11px]">Nombre Completo</label>
                  <input
                    type="text"
                    placeholder="ej: Laura Gómez"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-[#141519] border border-white/10 rounded-xl text-white text-xs"
                  />
                </div>

                <div>
                  <label className="text-gray-400 block mb-1 text-[11px]">Rol Asignado</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 bg-[#141519] border border-white/10 rounded-xl text-white text-xs cursor-pointer"
                  >
                    <option value="atencion">Atención al Cliente</option>
                    <option value="marketing">Marketing</option>
                    <option value="admin">Administrador (Acceso Completo)</option>
                  </select>
                </div>

                <div>
                  <label className="text-gray-400 block mb-1 text-[11px]">Contraseña Inicial *</label>
                  <input
                    type="password"
                    required
                    placeholder="Mínimo 4 caracteres"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 bg-[#141519] border border-white/10 rounded-xl text-white text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-xs cursor-pointer disabled:opacity-50"
                >
                  {submitting ? "Guardando..." : "Crear Cuenta"}
                </button>
              </div>
            </form>
          )}

          {/* Listado de Usuarios */}
          <div className="space-y-2">
            {users.map((u) => {
              const roleInfo = ROLE_CONFIG[u.role] || ROLE_CONFIG.atencion;
              const isEditingThis = editingUser === u.username;

              return (
                <div
                  key={u.username}
                  className="bg-[#0d0f12] border border-white/5 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-white text-xs">
                        {u.username}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full border ${roleInfo.badge}`}>
                        {roleInfo.label}
                      </span>
                      {u.status === "inactivo" && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-gray-500/20 text-gray-400 border border-gray-500/30">
                          Inactivo
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-gray-400 block mt-0.5">
                      {u.name || "Sin nombre asignado"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isEditingThis ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="password"
                          placeholder="Nueva contraseña..."
                          value={editPass}
                          onChange={(e) => setEditPass(e.target.value)}
                          className="px-2.5 py-1 bg-[#141519] border border-white/20 rounded-lg text-white text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => handleSavePassword(u.username)}
                          className="p-1.5 rounded-lg bg-[#16A34A] text-white"
                          title="Guardar contraseña"
                        >
                          <Save className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingUser(null);
                            setEditPass("");
                          }}
                          className="p-1.5 rounded-lg bg-white/10 text-gray-300"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingUser(u.username);
                            setEditPass("");
                          }}
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white flex items-center gap-1 text-[11px] cursor-pointer"
                          title="Cambiar contraseña"
                        >
                          <Key className="w-3 h-3" />
                          <span>Cambiar Clave</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleStatus(u)}
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-[11px] cursor-pointer"
                        >
                          {u.status === "inactivo" ? "Activar" : "Desactivar"}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(u.username)}
                          className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 cursor-pointer"
                          title="Eliminar usuario"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
