import React, { useState } from "react";
import { Lock, User, Eye, EyeOff, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";
import { BrandLogo } from "../components/Icons";
import { crmLogin } from "./crmApi";

export default function CrmLogin({ onLoginSuccess, onNavigateLanding }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanUser = username.trim();
    const cleanPass = password.trim();

    if (!cleanUser) {
      setError("Por favor ingresá tu nombre de usuario.");
      return;
    }
    if (!cleanPass) {
      setError("Por favor ingresá tu contraseña de acceso.");
      return;
    }
    if (loading) return;

    setError("");
    setLoading(true);

    try {
      const res = await crmLogin(cleanUser, cleanPass);
      if (res.ok) {
        onLoginSuccess?.(res.user);
      } else {
        setError(res.error || "Credenciales incorrectas.");
      }
    } catch {
      setError("Error de conexión al servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0f12] text-white flex flex-col justify-center items-center px-4 py-8 relative select-none">
      <div className="w-full max-w-sm sm:max-w-md relative z-10">
        {/* Cabecera con Logo de Marca */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-block mb-3.5">
            <BrandLogo size="large" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Portal de Gestión & CRM
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Panel de control centralizado de consultas y clientes
          </p>
        </div>

        {/* Tarjeta de Inicio de Sesión */}
        <div className="bg-[#141519] border border-white/10 rounded-2xl p-5 sm:p-7 shadow-2xl">
          <div className="flex items-center gap-2 pb-3.5 mb-4 border-b border-white/8 text-xs font-bold text-gray-300">
            <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
            <span>Acceso Privado de Administración</span>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Campo: Usuario */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                Usuario
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="admin"
                  required
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  autoComplete="username"
                  className="w-full bg-[#181a20] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 sm:py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#16A34A] transition-colors"
                />
              </div>
            </div>

            {/* Campo: Contraseña */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="••••••••••••"
                  required
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  autoComplete="current-password"
                  className="w-full bg-[#181a20] border border-white/10 rounded-xl pl-10 pr-10 py-2.5 sm:py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#16A34A] transition-colors font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors cursor-pointer p-1"
                  tabIndex={-1}
                  aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Botón de Envío */}
            <button
              type="submit"
              disabled={loading || !password.trim() || !username.trim()}
              className="w-full inline-flex items-center justify-center gap-2 bg-[#16A34A] hover:bg-[#15803D] text-white font-black text-xs sm:text-sm px-5 py-3 rounded-xl transition-[background-color,transform,opacity] duration-150 cursor-pointer shadow-sm active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Ingresar al CRM</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Pie de tarjeta con retorno seguro */}
          <div className="mt-5 pt-3.5 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-400">
            <span className="text-[10px] text-gray-400">NEXO Management v2.0</span>
            <button
              type="button"
              onClick={onNavigateLanding}
              className="hover:text-white transition-colors underline underline-offset-2 cursor-pointer font-semibold"
            >
              Volver al sitio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
