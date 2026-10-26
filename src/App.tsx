import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ProposalUploader } from './components/ProposalUploader';
import { ClientProfileForm } from './components/ClientProfileForm';
import { ComparisonTable } from './components/ComparisonTable';
import { RecommendationCards } from './components/RecommendationCards';
import { PdfPreviewModal } from './components/PdfPreviewModal';
import { LoginScreen } from './components/LoginScreen';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { CocoLogo } from './components/CocoLogo';
import {
  ClientProfile,
  UploadedPDF,
  ComparisonResponse,
  MandatoryCoverages,
  UserSession,
} from './types';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  BrainCircuit,
} from 'lucide-react';

const defaultProfile: ClientProfile = {
  name: 'Laura Solís Vargas',
  vehicle: 'Toyota Corolla XEi 2022 - Particular',
  maxBudget: 400000,
  mandatoryCoverages: {
    colision: true,
    robo: true,
    asistenciaVial: true,
    fenomenosNaturales: true,
    vehiculoSustituto: true,
  },
  priorities:
    'Valora contar con vehículo sustituto en caso de siniestro y protección completa ante inundaciones o desastres naturales, además de asistencia vial 24/7 sin costos adicionales.',
  paymentMethod: 'Anual de contado',
};

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const [files, setFiles] = useState<UploadedPDF[]>([]);
  const [profile, setProfile] = useState<ClientProfile>(defaultProfile);
  const [isComparing, setIsComparing] = useState(false);
  const [comparisonProgressStep, setComparisonProgressStep] = useState<string>('');
  const [comparisonResult, setComparisonResult] = useState<ComparisonResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoadingSample, setIsLoadingSample] = useState(false);
  const [previewFile, setPreviewFile] = useState<UploadedPDF | null>(null);

  // Check active session on startup
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      setIsCheckingAuth(true);
      const res = await fetch('/api/yo');
      if (res.ok) {
        const data = await res.json();
        if (data.ok && data.usuario) {
          setCurrentUser(data.usuario);
        } else {
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
    } catch {
      setCurrentUser(null);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
    } catch (err) {
      console.error('Error logging out:', err);
    } finally {
      setCurrentUser(null);
      setComparisonResult(null);
      setFiles([]);
    }
  };

  // Load sample PDFs from server
  const handleLoadSample = async () => {
    try {
      setIsLoadingSample(true);
      setErrorMessage(null);

      const res = await fetch('/api/sample-proposals');
      if (res.status === 401) {
        setCurrentUser(null);
        return;
      }
      if (!res.ok) {
        throw new Error('No se pudieron obtener las propuestas de ejemplo.');
      }
      const data = await res.json();

      if (data.samples && data.samples.length > 0) {
        const loaded: UploadedPDF[] = data.samples.map((s: any) => ({
          id: s.id,
          name: s.fileName,
          size: s.size,
          base64: s.base64,
          url: s.url,
          isSample: true,
        }));
        setFiles(loaded);
        setProfile(defaultProfile);
        setComparisonResult(null);
      } else {
        throw new Error('No se encontraron los archivos PDF de ejemplo en el servidor.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Error al cargar cotizaciones de ejemplo.');
    } finally {
      setIsLoadingSample(false);
    }
  };

  const handleAddFiles = (newFiles: UploadedPDF[]) => {
    setFiles((prev) => [...prev, ...newFiles].slice(0, 3));
    setErrorMessage(null);
  };

  const handleRemoveFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    if (comparisonResult) {
      setComparisonResult(null);
    }
  };

  const handleProfileChange = (updated: Partial<ClientProfile>) => {
    setProfile((prev) => ({ ...prev, ...updated }));
  };

  const handleCoverageToggle = (key: keyof MandatoryCoverages) => {
    setProfile((prev) => ({
      ...prev,
      mandatoryCoverages: {
        ...prev.mandatoryCoverages,
        [key]: !prev.mandatoryCoverages[key],
      },
    }));
  };

  const handleCompare = async () => {
    if (files.length === 0) {
      setErrorMessage('Por favor sube al menos un archivo PDF de propuesta en la sección 1.');
      return;
    }

    setErrorMessage(null);
    setIsComparing(true);
    setComparisonProgressStep('Iniciando lectura multimodal de los PDF con Gemini 3.8 Flash...');

    try {
      const t1 = setTimeout(() => {
        setComparisonProgressStep('Extrayendo primas, coberturas incluidas, asistencias y deducibles...');
      }, 1400);

      const t2 = setTimeout(() => {
        setComparisonProgressStep('Validando presupuesto y cobertura obligatoria estricta según condiciones de póliza...');
      }, 3500);

      const t3 = setTimeout(() => {
        setComparisonProgressStep('Generando tabla comparativa, semáforo y recomendación comercial preliminar...');
      }, 6000);

      const payload = {
        files: files.map((f) => ({
          name: f.name,
          base64: f.base64,
        })),
        clientProfile: profile,
      };

      const res = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);

      if (res.status === 401) {
        setCurrentUser(null);
        throw new Error('Tu sesión ha expirado. Por favor inicia sesión nuevamente.');
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Error del servidor (${res.status}). Intente de nuevo.`);
      }

      const data: ComparisonResponse = await res.json();
      setComparisonResult(data);

      // Smooth scroll to result
      setTimeout(() => {
        document.getElementById('seccion-resultado')?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Ocurrió un error al comparar las propuestas.');
    } finally {
      setIsComparing(false);
      setComparisonProgressStep('');
    }
  };

  const handleNewComparison = () => {
    setComparisonResult(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Loading splash while checking session
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#022426] via-[#043E42] to-[#07595F] flex flex-col items-center justify-center text-white font-sans p-4 relative overflow-hidden">
        <div className="p-3 bg-gradient-to-br from-teal-400/20 to-amber-400/20 rounded-3xl border border-teal-300/40 backdrop-blur-md shadow-xl mb-4 animate-pulse">
          <CocoLogo size={56} className="w-14 h-14" />
        </div>
        <div className="w-6 h-6 border-2 border-white/30 border-t-amber-300 rounded-full animate-spin mb-3" />
        <p className="text-sm font-bold tracking-wide text-teal-100">
          Iniciando sistema de seguridad Banco del Coco...
        </p>
      </div>
    );
  }

  // If not logged in, show login screen
  if (!currentUser) {
    return <LoginScreen onLoginSuccess={(u) => setCurrentUser(u)} />;
  }

  // If user must change password, show mandatory change screen
  if (currentUser.debeCambiarClave) {
    return (
      <ChangePasswordModal
        user={currentUser}
        onPasswordChanged={(updatedUser) => setCurrentUser(updatedUser)}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* Top Header with user status and logout button */}
      <Header
        onLoadSample={handleLoadSample}
        isLoadingSample={isLoadingSample}
        hasFiles={files.length > 0}
        user={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Error Notification */}
        {errorMessage && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-800 shadow-xs">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold">Atención:</p>
              <p className="text-xs sm:text-sm mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Input Sections Grid */}
        <div className="space-y-8">
          {/* Section 1: Propuestas */}
          <section aria-labelledby="section-propuestas">
            <ProposalUploader
              files={files}
              onAddFiles={handleAddFiles}
              onRemoveFile={handleRemoveFile}
              onPreviewFile={(f) => setPreviewFile(f)}
            />
          </section>

          {/* Section 2: Perfil del cliente */}
          <section aria-labelledby="section-perfil">
            <ClientProfileForm
              profile={profile}
              onChange={handleProfileChange}
              onCoverageToggle={handleCoverageToggle}
            />
          </section>

          {/* Action Button: Botón grande "Comparar propuestas" */}
          <div className="flex flex-col items-center justify-center pt-2">
            <button
              type="button"
              onClick={handleCompare}
              disabled={isComparing || files.length === 0}
              className={`w-full sm:w-auto min-w-[320px] px-8 py-4 rounded-2xl font-extrabold text-base sm:text-lg flex items-center justify-center gap-3 shadow-lg transition-all duration-200 cursor-pointer ${
                isComparing
                  ? 'bg-teal-900 text-white cursor-wait opacity-90'
                  : files.length === 0
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                  : 'bg-gradient-to-r from-[#064E54] via-[#0A6167] to-[#0D7377] hover:from-[#043E43] hover:to-[#085156] active:scale-[0.99] text-white hover:shadow-xl shadow-teal-950/25'
              }`}
            >
              {isComparing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>Analizando propuestas...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-amber-300" />
                  <span>Comparar propuestas</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            {files.length === 0 && (
              <p className="text-xs text-slate-500 mt-2 text-center">
                Sube entre 1 y 3 cotizaciones en PDF o presiona "Cotizaciones de ejemplo" para iniciar.
              </p>
            )}

            {/* Analysis In-Progress Indicator Box */}
            {isComparing && (
              <div className="mt-6 w-full max-w-lg p-5 bg-white rounded-2xl border border-teal-200 shadow-md text-center space-y-3 animate-fade-in">
                <div className="flex items-center justify-center gap-2 text-teal-900 font-bold text-sm sm:text-base">
                  <BrainCircuit className="w-5 h-5 text-teal-600 animate-pulse" />
                  <span>Analizando propuestas con Gemini...</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-gradient-to-r from-teal-500 to-emerald-500 h-2 rounded-full w-2/3 animate-[pulse_1.5s_ease-in-out_infinite]" />
                </div>
                <p className="text-xs text-slate-600 font-medium italic">
                  {comparisonProgressStep || 'Procesando condiciones de aseguradoras y evaluando perfil...'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Resultado */}
        {comparisonResult && (
          <div id="seccion-resultado" className="space-y-8 pt-4">
            <section aria-labelledby="section-resultado">
              <ComparisonTable
                proposals={comparisonResult.proposals}
                maxBudget={profile.maxBudget}
              />
            </section>

            {/* Recommendation & WhatsApp Message Cards */}
            <section aria-labelledby="section-recomendaciones">
              <RecommendationCards
                preliminaryRecommendation={comparisonResult.preliminaryRecommendation}
                whatsappMessage={comparisonResult.whatsappMessage}
                onNewComparison={handleNewComparison}
              />
            </section>
          </div>
        )}
      </main>

      {/* PDF Preview Modal */}
      <PdfPreviewModal
        file={previewFile}
        onClose={() => setPreviewFile(null)}
      />

      {/* Fixed Footer Note */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white py-4 px-4 text-center">
        <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-4xl mx-auto">
          Borrador generado con IA. Debe ser validado por un asesor contra las condiciones reales de la póliza. No suba datos reales de clientes.
        </p>
      </footer>
    </div>
  );
}
