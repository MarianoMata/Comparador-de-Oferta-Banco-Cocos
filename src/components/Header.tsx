import React from 'react';
import { Sparkles, User, LogOut, Palmtree, Waves } from 'lucide-react';
import { UserSession } from '../types';
import { CocoLogo } from './CocoLogo';

interface HeaderProps {
  onLoadSample: () => void;
  isLoadingSample: boolean;
  hasFiles: boolean;
  user?: UserSession | null;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onLoadSample,
  isLoadingSample,
  hasFiles,
  user,
  onLogout,
}) => {
  return (
    <header className="bg-gradient-to-r from-[#022B2F] via-[#064E54] to-[#0A6167] text-white border-b border-teal-500/30 shadow-lg relative overflow-hidden">
      {/* Subtle Tropical Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-1/3 w-64 h-32 bg-teal-300/10 rounded-full blur-2xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Caribbean Logo and Branding */}
          <div className="space-y-1">
            <div className="flex items-center gap-3.5">
              {/* Coco & Palm Logo */}
              <div className="p-1.5 bg-gradient-to-br from-teal-400/25 to-amber-400/20 rounded-2xl border border-teal-300/40 backdrop-blur-md shadow-md flex items-center justify-center shrink-0">
                <CocoLogo size={44} className="w-11 h-11" />
              </div>

              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white drop-shadow-xs flex items-center gap-2">
                    <span>Comparador de Propuestas</span>
                    <span className="text-amber-300 font-extrabold">Banco del Coco</span>
                  </h1>
                  <span className="bg-amber-400/25 text-amber-200 text-xs font-bold px-3 py-0.5 rounded-full border border-amber-400/40 flex items-center gap-1 shadow-2xs">
                    <Palmtree className="w-3.5 h-3.5 text-amber-300" />
                    <span>Costa Rica · Caribe</span>
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-teal-100/90 font-medium mt-0.5 flex items-center gap-1.5">
                  <Waves className="w-3.5 h-3.5 text-teal-300" />
                  <span>Compara propuestas de seguro de automóvil en minutos. La IA prepara, el asesor decide.</span>
                </p>
              </div>
            </div>
          </div>

          {/* User info, sample button, and logout button */}
          <div className="flex items-center flex-wrap gap-2.5 sm:gap-3">
            <button
              onClick={onLoadSample}
              disabled={isLoadingSample}
              type="button"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-white/10 hover:bg-white/20 active:bg-white/25 text-white border border-teal-200/30 shadow-xs backdrop-blur-md transition-all cursor-pointer disabled:opacity-50"
              title="Cargar 3 cotizaciones de prueba (Cordillera, Alborada, Protectora del Valle) y perfil de cliente"
            >
              {isLoadingSample ? (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-amber-300 rounded-full animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              )}
              <span>Cotizaciones de ejemplo</span>
            </button>

            {user && (
              <div className="flex items-center gap-2 pl-2 sm:border-l sm:border-teal-400/30">
                {/* User chip */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-teal-950/40 border border-teal-300/30 backdrop-blur-md text-xs">
                  <div className="w-6 h-6 rounded-lg bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-white text-xs truncate max-w-[130px]">
                      {user.nombre}
                    </div>
                    <div className="text-[10px] text-teal-200 capitalize font-medium">
                      {user.rol}
                    </div>
                  </div>
                </div>

                {/* Logout Button */}
                {onLogout && (
                  <button
                    type="button"
                    onClick={onLogout}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-700/80 hover:bg-rose-700 active:bg-rose-800 text-white shadow-xs transition cursor-pointer border border-rose-500/40"
                    title="Cerrar sesión"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Cerrar sesión</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
