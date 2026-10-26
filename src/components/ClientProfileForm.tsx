import React, { useState, useRef } from 'react';
import {
  User,
  Car,
  DollarSign,
  CheckSquare,
  ListOrdered,
  CreditCard,
  MessageSquare,
  FileUp,
  Sparkles,
  X,
  CheckCircle2,
  AlertCircle,
  FileText,
  Upload,
} from 'lucide-react';
import { ClientProfile, MandatoryCoverages } from '../types';

interface ClientProfileFormProps {
  profile: ClientProfile;
  onChange: (updated: Partial<ClientProfile>) => void;
  onCoverageToggle: (key: keyof MandatoryCoverages) => void;
}

export const ClientProfileForm: React.FC<ClientProfileFormProps> = ({
  profile,
  onChange,
  onCoverageToggle,
}) => {
  const [activeImportTab, setActiveImportTab] = useState<'none' | 'message' | 'pdf'>('none');
  const [pastedMessage, setPastedMessage] = useState('');
  const [selectedPdf, setSelectedPdf] = useState<{ name: string; size: number; base64: string } | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [extractSuccess, setExtractSuccess] = useState<string | null>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const coverageOptions: { key: keyof MandatoryCoverages; label: string; description: string }[] = [
    {
      key: 'colision',
      label: 'Colisión y vuelco',
      description: 'Cubre daños por impacto, choque o vuelco del vehículo asegurado.',
    },
    {
      key: 'robo',
      label: 'Robo total / parcial',
      description: 'Protección ante sustracción del vehículo o partes esenciales.',
    },
    {
      key: 'asistenciaVial',
      label: 'Asistencia vial 24/7',
      description: 'Auxilio en carretera: avería mecánica, cerrajería, paso de corriente, cambio de llanta.',
    },
    {
      key: 'fenomenosNaturales',
      label: 'Fenómenos naturales',
      description: 'Inundaciones, deslizamientos, caída de árboles, sismos o erupciones.',
    },
    {
      key: 'vehiculoSustituto',
      label: 'Vehículo sustituto',
      description: 'Auto temporal de reemplazo mientras el vehículo se encuentra en taller.',
    },
  ];

  const paymentMethods = [
    'Anual de contado',
    'Mensual (12 cuotas)',
    'Semestral (2 cuotas)',
    'Indiferente / El más conveniente',
  ];

  // Sample WhatsApp message for testing
  const sampleMessage = `Hola estimado asesor de Banco del Coco, mi nombre es Laura Solís Vargas. Deseo asegurar mi vehículo Toyota Corolla XEi año 2022 de uso particular. Mi presupuesto tope para el seguro es de 400.000 colones al año. Por mi zona de residencia requiero indispensablemente amparo total contra inundaciones y fenómenos naturales, y auto sustituto si ingresa a taller. También asistencia vial completa 24 horas y robo. El pago preferiría hacerlo anual de contado.`;

  const handlePdfSelected = (file: File) => {
    setExtractError(null);
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setExtractError('Por favor selecciona un archivo PDF válido.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedPdf({
        name: file.name,
        size: file.size,
        base64: reader.result as string,
      });
    };
    reader.onerror = () => setExtractError('Error al leer el archivo PDF.');
    reader.readAsDataURL(file);
  };

  const handleExtractFromMessage = async () => {
    if (!pastedMessage.trim()) {
      setExtractError('Por favor pega o escribe el mensaje del cliente.');
      return;
    }
    await callExtractionApi({
      sourceType: 'message',
      text: pastedMessage,
    });
  };

  const handleExtractFromPdf = async () => {
    if (!selectedPdf) {
      setExtractError('Por favor selecciona un archivo PDF primero.');
      return;
    }
    await callExtractionApi({
      sourceType: 'pdf',
      pdfBase64: selectedPdf.base64,
      fileName: selectedPdf.name,
    });
  };

  const callExtractionApi = async (body: any) => {
    setIsExtracting(true);
    setExtractError(null);
    setExtractSuccess(null);

    try {
      const res = await fetch('/api/extract-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Error al procesar la información del cliente.');
      }

      const data = await res.json();
      if (data.profile) {
        onChange({
          name: data.profile.name || profile.name,
          vehicle: data.profile.vehicle || profile.vehicle,
          maxBudget: data.profile.maxBudget !== undefined ? data.profile.maxBudget : profile.maxBudget,
          mandatoryCoverages: {
            colision: Boolean(data.profile.mandatoryCoverages?.colision),
            robo: Boolean(data.profile.mandatoryCoverages?.robo),
            asistenciaVial: Boolean(data.profile.mandatoryCoverages?.asistenciaVial),
            fenomenosNaturales: Boolean(data.profile.mandatoryCoverages?.fenomenosNaturales),
            vehiculoSustituto: Boolean(data.profile.mandatoryCoverages?.vehiculoSustituto),
          },
          priorities: data.profile.priorities || profile.priorities,
          paymentMethod: data.profile.paymentMethod || profile.paymentMethod,
        });

        setExtractSuccess('¡Perfil del cliente autocompletado con IA! Puedes revisar o ajustar cualquier dato a continuación.');
        setActiveImportTab('none');
      }
    } catch (err: any) {
      console.error(err);
      setExtractError(err.message || 'Ocurrió un error al extraer los datos con Gemini.');
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-7">
      {/* Header and Quick Auto-Fill Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-900 border border-teal-200 flex items-center justify-center font-bold text-sm">
            2
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Perfil del cliente
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Define las características y presupuesto. Puedes editar manualmente o usar IA para completarlo.
            </p>
          </div>
        </div>

        {/* Action buttons: Pegar mensaje o Subir PDF */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => {
              setActiveImportTab(activeImportTab === 'message' ? 'none' : 'message');
              setExtractError(null);
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              activeImportTab === 'message'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
            <span>Pegar mensaje (WhatsApp)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveImportTab(activeImportTab === 'pdf' ? 'none' : 'pdf');
              setExtractError(null);
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              activeImportTab === 'pdf'
                ? 'bg-gradient-to-r from-[#064E54] to-[#0A6065] text-white border-teal-800 shadow-xs'
                : 'bg-teal-50 text-teal-900 border-teal-200 hover:bg-teal-100'
            }`}
          >
            <FileUp className="w-3.5 h-3.5 text-teal-800" />
            <span>Subir PDF de cliente</span>
          </button>
        </div>
      </div>

      {/* Success Banner */}
      {extractSuccess && (
        <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs sm:text-sm text-emerald-800 animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{extractSuccess}</span>
          </div>
          <button
            type="button"
            onClick={() => setExtractSuccess(null)}
            className="p-1 hover:bg-emerald-100 rounded-md transition text-emerald-700"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Import Drawer: Pegar Mensaje */}
      {activeImportTab === 'message' && (
        <div className="mb-6 p-4 sm:p-5 bg-gradient-to-r from-emerald-50/60 via-slate-50 to-emerald-50/40 border border-emerald-200 rounded-2xl space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs sm:text-sm font-bold text-slate-800">
                Autocompletar perfil desde mensaje o conversación
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setActiveImportTab('none')}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-500">
            Pega el texto del WhatsApp, correo electrónico o nota de llamada del cliente. Gemini extraerá nombre, vehículo, presupuesto y coberturas.
          </p>

          <textarea
            rows={4}
            value={pastedMessage}
            onChange={(e) => setPastedMessage(e.target.value)}
            placeholder="Ejemplo: 'Hola, soy Laura Solís. Deseo cotizar para mi Corolla 2022 uso particular. Tengo presupuesto de 400 mil colones. Me interesa con fenómenos naturales, auto sustituto y asistencia vial...'"
            className="w-full p-3 text-xs sm:text-sm bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
          />

          {extractError && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-700">
              <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
              <span>{extractError}</span>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <button
              type="button"
              onClick={() => setPastedMessage(sampleMessage)}
              className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold underline underline-offset-2 cursor-pointer"
            >
              Insertar mensaje de prueba
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveImportTab('none')}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-200/50 transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isExtracting || !pastedMessage.trim()}
                onClick={handleExtractFromMessage}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-xs transition disabled:opacity-50 cursor-pointer"
              >
                {isExtracting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span>Extrayendo perfil con IA...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                    <span>Extraer perfil con IA</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Drawer: Subir PDF */}
      {activeImportTab === 'pdf' && (
        <div className="mb-6 p-4 sm:p-5 bg-gradient-to-r from-blue-50/60 via-slate-50 to-blue-50/40 border border-blue-200 rounded-2xl space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-700" />
              <h3 className="text-xs sm:text-sm font-bold text-slate-800">
                Autocompletar perfil desde documento PDF del cliente
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setActiveImportTab('none')}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-500">
            Sube un PDF con la solicitud de seguro, formulario de requerimientos o cotización previa del cliente.
          </p>

          <input
            ref={pdfInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handlePdfSelected(e.target.files[0]);
              }
            }}
            className="hidden"
          />

          {!selectedPdf ? (
            <div
              onClick={() => pdfInputRef.current?.click()}
              className="border-2 border-dashed border-blue-300 hover:border-blue-500 bg-white/70 hover:bg-white rounded-xl p-5 text-center cursor-pointer transition"
            >
              <div className="flex flex-col items-center gap-1.5">
                <div className="p-2 bg-blue-50 text-blue-900 rounded-full">
                  <Upload className="w-5 h-5" />
                </div>
                <p className="text-xs sm:text-sm font-semibold text-slate-800">
                  Haz clic para seleccionar el archivo PDF del cliente
                </p>
                <p className="text-[11px] text-slate-400">
                  Formatos aceptados: .PDF (hojas de solicitud, cartas de requerimiento)
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-white rounded-xl border border-blue-200 flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-2 bg-red-100 text-red-600 rounded-lg shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                    {selectedPdf.name}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {(selectedPdf.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPdf(null)}
                className="text-xs text-red-600 hover:text-red-700 font-medium px-2 py-1 rounded hover:bg-red-50 transition"
              >
                Cambiar
              </button>
            </div>
          )}

          {extractError && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-700">
              <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
              <span>{extractError}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setActiveImportTab('none')}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-200/50 transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={isExtracting || !selectedPdf}
              onClick={handleExtractFromPdf}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#064E54] to-[#0A6065] hover:from-[#043E43] hover:to-[#085156] active:scale-95 text-white shadow-xs transition disabled:opacity-50 cursor-pointer"
            >
              {isExtracting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>Analizando PDF con Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Extraer perfil del PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Main Manual / Review Form */}
      <div className="space-y-6">
        {/* Row 1: Nombre, Vehículo y uso, Presupuesto */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {/* Nombre */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-teal-800" />
              <span>Nombre del cliente</span>
            </label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => onChange({ name: e.target.value })}
              placeholder="Ej. Laura Solís Vargas"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-700 focus:border-transparent transition bg-slate-50/50 hover:bg-white"
            />
          </div>

          {/* Vehículo y uso */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
              <Car className="w-3.5 h-3.5 text-teal-800" />
              <span>Vehículo y uso</span>
            </label>
            <input
              type="text"
              value={profile.vehicle}
              onChange={(e) => onChange({ vehicle: e.target.value })}
              placeholder="Ej. Toyota Corolla XEi 2022 - Particular"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-700 focus:border-transparent transition bg-slate-50/50 hover:bg-white"
            />
          </div>

          {/* Presupuesto máximo anual */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
              <span className="text-blue-900 font-extrabold text-xs">₡</span>
              <span>Presupuesto máx. anual (colones)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-semibold text-sm">
                ₡
              </div>
              <input
                type="number"
                min="0"
                step="5000"
                value={profile.maxBudget || ''}
                onChange={(e) => onChange({ maxBudget: parseFloat(e.target.value) || 0 })}
                placeholder="400000"
                className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition bg-slate-50/50 hover:bg-white"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Equivalente aprox: {profile.maxBudget ? `₡ ${Number(profile.maxBudget).toLocaleString('es-CR')}` : '₡ 0'}
            </p>
          </div>
        </div>

        {/* Coberturas obligatorias */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5 text-blue-900" />
              <span>Coberturas obligatorias</span>
            </label>
            <span className="text-[11px] text-slate-500 font-medium">
              Deben estar incluidas en la prima base para aprobar semáforo
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {coverageOptions.map((item) => {
              const isChecked = profile.mandatoryCoverages[item.key];
              return (
                <label
                  key={item.key}
                  className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                    isChecked
                      ? 'bg-teal-50/90 border-teal-400 text-teal-950 shadow-2xs'
                      : 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => onCoverageToggle(item.key)}
                    className="mt-0.5 w-4 h-4 text-teal-800 rounded border-slate-300 focus:ring-teal-700 cursor-pointer"
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs sm:text-sm font-bold ${isChecked ? 'text-teal-950' : 'text-slate-800'}`}>
                      {item.label}
                    </p>
                    <p className="text-[11px] text-slate-500 leading-tight mt-0.5 line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Row 3: Prioridades & Forma de pago preferida */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {/* Prioridades (área de texto) */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
              <ListOrdered className="w-3.5 h-3.5 text-blue-900" />
              <span>Prioridades del cliente</span>
            </label>
            <textarea
              rows={3}
              value={profile.priorities}
              onChange={(e) => onChange({ priorities: e.target.value })}
              placeholder="Ej. El cliente vive en zona propensa a inundación, por lo que requiere amplia cobertura de fenómenos naturales y vehículo sustituto para no detener su trabajo. Valora deducible bajo en colisión."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition bg-slate-50/50 hover:bg-white resize-none"
            />
          </div>

          {/* Forma de pago preferida */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-blue-900" />
              <span>Forma de pago preferida</span>
            </label>
            <div className="space-y-1.5">
              {paymentMethods.map((method) => (
                <label
                  key={method}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border text-xs cursor-pointer transition ${
                    profile.paymentMethod === method
                      ? 'bg-gradient-to-r from-[#064E54] to-[#0A6065] text-white border-teal-800 font-semibold'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method}
                    checked={profile.paymentMethod === method}
                    onChange={(e) => onChange({ paymentMethod: e.target.value })}
                    className="sr-only"
                  />
                  <div
                    className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                      profile.paymentMethod === method
                        ? 'border-white bg-amber-400'
                        : 'border-slate-400 bg-white'
                    }`}
                  >
                    {profile.paymentMethod === method && (
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-950" />
                    )}
                  </div>
                  <span className="truncate">{method}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
