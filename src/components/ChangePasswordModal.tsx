import React, { useState } from 'react';
import { Check, X, ArrowRight, Lock, Palmtree } from 'lucide-react';
import { UserSession } from '../types';
import { CocoLogo } from './CocoLogo';

interface ChangePasswordModalProps {
  user: UserSession;
  onPasswordChanged: (updatedUser: UserSession) => void;
  onLogout: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  user,
  onPasswordChanged,
  onLogout,
}) => {
  const [claveNueva, setClaveNueva] = useState('');
  const [claveConfirmar, setClaveConfirmar] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const hasMinLength = claveNueva.length >= 8;
  const hasNumber = /\d/.test(claveNueva);
  const passwordsMatch = claveNueva.length > 0 && claveNueva === claveConfirmar;
  const isValid = hasMinLength && hasNumber && passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!hasMinLength) {
      setErrorMessage('La contraseña debe tener mínimo 8 caracteres.');
      return;
    }
    if (!hasNumber) {
      setErrorMessage('La contraseña debe incluir al menos un número (0-9).');
      return;
    }
    if (claveNueva !== claveConfirmar) {
      setErrorMessage('Las contraseñas no coinciden.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/cambiar-clave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claveNueva }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErrorMessage(data.error || 'Error al cambiar la contraseña.');
        return;
      }

      if (data.ok && data.usuario) {
        onPasswordChanged(data.usuario);
      } else {
        onPasswordChanged({
          ...user,
          debeCambiarClave: false,
        });
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage('Error al conectar con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#022426]/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-teal-100 overflow-hidden animate-fade-in">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#022B2F] via-[#064E54] to-[#0A6167] p-6 text-white text-center space-y-2 relative overflow-hidden">
          <div className="inline-flex p-2 bg-gradient-to-br from-teal-400/25 to-amber-400/20 rounded-2xl border border-teal-300/40 backdrop-blur-md shadow-md mb-1">
            <CocoLogo size={48} className="w-12 h-12" />
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-amber-300 bg-amber-400/20 px-2.5 py-0.5 rounded-full border border-amber-400/30">
              <Palmtree className="w-3 h-3 text-amber-300" />
              <span>Banco del Coco</span>
            </span>
          </div>
          <h2 className="text-xl font-extrabold tracking-tight">
            Cambio obligatorio de contraseña
          </h2>
          <p className="text-xs text-teal-100/90 leading-relaxed max-w-xs mx-auto">
            Hola, <span className="font-bold text-white">{user.nombre}</span> ({user.usuario}). Por seguridad institucional, debes definir una nueva contraseña personalizada antes de continuar.
          </p>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-5">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700 font-medium">
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-teal-800" />
              <span>Nueva contraseña</span>
            </label>
            <input
              type="password"
              autoComplete="new-password"
              required
              value={claveNueva}
              onChange={(e) => setClaveNueva(e.target.value)}
              placeholder="Mínimo 8 caracteres y un número"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-700 focus:border-transparent transition bg-slate-50 hover:bg-white font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-teal-800" />
              <span>Confirmar nueva contraseña</span>
            </label>
            <input
              type="password"
              autoComplete="new-password"
              required
              value={claveConfirmar}
              onChange={(e) => setClaveConfirmar(e.target.value)}
              placeholder="Repite la nueva contraseña"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-700 focus:border-transparent transition bg-slate-50 hover:bg-white font-medium"
            />
          </div>

          {/* Validation Checklist */}
          <div className="p-3.5 bg-teal-50/50 rounded-2xl border border-teal-200/60 space-y-1.5 text-xs text-slate-600">
            <p className="font-bold text-teal-900 mb-1">Requisitos de la contraseña:</p>
            <div className="flex items-center gap-2">
              {hasMinLength ? (
                <Check className="w-3.5 h-3.5 text-emerald-600 font-bold" />
              ) : (
                <X className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span className={hasMinLength ? 'text-emerald-800 font-semibold' : 'text-slate-500'}>
                Mínimo 8 caracteres
              </span>
            </div>
            <div className="flex items-center gap-2">
              {hasNumber ? (
                <Check className="w-3.5 h-3.5 text-emerald-600 font-bold" />
              ) : (
                <X className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span className={hasNumber ? 'text-emerald-800 font-semibold' : 'text-slate-500'}>
                Al menos un número (0-9)
              </span>
            </div>
            <div className="flex items-center gap-2">
              {passwordsMatch ? (
                <Check className="w-3.5 h-3.5 text-emerald-600 font-bold" />
              ) : (
                <X className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span className={passwordsMatch ? 'text-emerald-800 font-semibold' : 'text-slate-500'}>
                Ambas contraseñas coinciden
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onLogout}
              className="text-xs font-semibold text-slate-500 hover:text-rose-600 transition cursor-pointer"
            >
              Cerrar sesión
            </button>

            <button
              type="submit"
              disabled={isLoading || !isValid}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-[#064E54] to-[#0A6167] hover:from-[#043E43] hover:to-[#085156] active:scale-[0.99] text-white shadow-md transition disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <span>Guardando...</span>
              ) : (
                <>
                  <span>Guardar y acceder</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
