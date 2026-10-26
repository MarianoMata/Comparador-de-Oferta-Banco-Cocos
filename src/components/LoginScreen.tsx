import React, { useState } from 'react';
import { Lock, User, AlertCircle, ArrowRight, Eye, EyeOff, Palmtree, Sun, Waves } from 'lucide-react';
import { UserSession } from '../types';
import { CocoLogo } from './CocoLogo';

interface LoginScreenProps {
  onLoginSuccess: (user: UserSession) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanUser = usuario.trim().toLowerCase();
    if (!cleanUser || !contrasena) {
      setErrorMessage('Por favor ingresa tu usuario y contraseña.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario: cleanUser,
          contrasena,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErrorMessage(data.error || 'usuario o contraseña incorrectos');
        return;
      }

      if (data.ok && data.usuario) {
        onLoginSuccess(data.usuario);
      } else {
        setErrorMessage('usuario o contraseña incorrectos');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage('Error al conectar con el servidor. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#022426] via-[#043E42] to-[#07595F] flex flex-col justify-center items-center px-4 py-12 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      {/* Tropical Caribbean background ambient orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-400/10 rounded-full blur-3xl pointer-events-none -mr-40 -mt-40" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-400/10 rounded-full blur-3xl pointer-events-none -ml-40 -mb-40" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className="max-w-md w-full space-y-6 relative z-10">
        {/* Brand Banner */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 bg-gradient-to-br from-teal-400/20 to-amber-400/20 rounded-3xl border border-teal-300/40 backdrop-blur-md shadow-xl transform transition hover:scale-105 duration-300">
            <CocoLogo size={64} className="w-16 h-16" />
          </div>
          <div>
            <div className="flex items-center justify-center gap-1.5 mb-1.5">
              <span className="inline-flex items-center gap-1.5 bg-amber-400/25 text-amber-200 text-xs font-bold px-3.5 py-1 rounded-full border border-amber-400/40 tracking-wide uppercase shadow-sm">
                <Palmtree className="w-3.5 h-3.5 text-amber-300" />
                <span>Banco del Coco · Costa Rica</span>
                <Sun className="w-3.5 h-3.5 text-amber-300" />
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-sm">
              Comparador de Propuestas
            </h1>
            <p className="text-sm text-teal-100/90 font-medium mt-1 flex items-center justify-center gap-1.5">
              <Waves className="w-4 h-4 text-teal-300" />
              <span>Portal de Seguros de Automóvil · Asesores</span>
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl border border-teal-100/80 p-7 sm:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">Iniciar sesión</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Ingresa tus credenciales autorizadas de Banco del Coco.
              </p>
            </div>
            <div className="p-2 bg-teal-50 rounded-xl text-teal-800 border border-teal-200/60">
              <Palmtree className="w-5 h-5 text-teal-700" />
            </div>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-red-800 text-xs sm:text-sm animate-fade-in shadow-2xs">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Field: Usuario */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-teal-800" />
                <span>Usuario</span>
              </label>
              <input
                type="text"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck="false"
                required
                value={usuario}
                onChange={(e) => setUsuario(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                placeholder="Nombre de usuario"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-700 focus:border-transparent transition bg-slate-50/60 hover:bg-white"
              />
            </div>

            {/* Field: Contraseña */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-teal-800" />
                <span>Contraseña</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-700 focus:border-transparent transition bg-slate-50/60 hover:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button: Entrar */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl font-extrabold text-sm bg-gradient-to-r from-[#064E54] to-[#0A6167] hover:from-[#043E43] hover:to-[#085156] active:scale-[0.99] text-white shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-amber-300 rounded-full animate-spin" />
                    <span>Verificando credenciales...</span>
                  </>
                ) : (
                  <>
                    <span>Entrar</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Security Notice */}
          <div className="pt-2 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400 leading-tight">
              Acceso restringido únicamente a usuarios autorizados por Banco del Coco. Las sesiones expiran automáticamente en 8 horas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
