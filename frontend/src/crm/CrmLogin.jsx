import React, { useState } from "react";
import { Lock, Eye, EyeOff, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";
import { BrandLogo } from "../components/Icons";
import { crmLogin } from "./crmApi";

export default function CrmLogin({ onLoginSuccess, onNavigateLanding }) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || loading) return;
    setError("");
    setLoading(true);

    try {
      const res = await crmLogin(password);
      if (res.ok) {
        onLoginSuccess?.(res.user);
      } else {
        setError(res.error || "Contraseña incorrecta.");
      }
    } catch {
      setError("Error de conexión al servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0f12] text-white flex flex-col justify-center items-center p-4 relative overflow-hidden select-none">
      {/* Glow ambiental */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#BCE838]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-block mb-3">
            <BrandLogo size="large" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Portal de Gestión & CRM
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Reuniones estratégicas, leads y agenda en vivo
          </p>
        </div>

        <div className="bg-[#141519] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-[0_24px_64px_rgba(0,0,0,0.7)] backdrop-blur-xl">
          <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-white/8 text-xs font-bold text-gray-300">
            <Lock className="w-4 h-4 text-[#BCE838]" />
            <span>Acceso Privado de Administración</span>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">
                Contraseña de acceso
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingresá la clave de administrador"
                  required
                  autoFocus
                  className="w-full bg-[#181a20] border border-white/12 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#BCE838] transition-colors pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full inline-flex items-center justify-center gap-2 bg-[#BCE838] hover:bg-[#add92b] text-[#111111] font-black text-xs sm:text-sm px-5 py-3.5 rounded-xl transition-all cursor-pointer shadow-[0_0_20px_rgba(188,232,56,0.3)] hover:shadow-[0_0_28px_rgba(188,232,56,0.5)] active:scale-98 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Ingresar al CRM</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#BCE838]" />
              <span>Protegido con HMAC</span>
            </span>
            <button
              type="button"
              onClick={onNavigateLanding}
              className="hover:text-white underline underline-offset-2 cursor-pointer"
            >
              Volver al sitio
            </button>
          </div>
        </div>

        <div className="text-center mt-6 text-[11px] text-gray-400">
          <span>Clave por defecto de desarrollo: </span>
          <code className="text-[#BCE838] font-mono bg-white/5 px-2 py-0.5 rounded">nexo2026admin</code>
        </div>
      </div>
    </div>
  );
}
