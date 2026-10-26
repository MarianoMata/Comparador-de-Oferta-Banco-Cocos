import React, { useState } from 'react';
import {
  Sparkles,
  MessageSquare,
  Copy,
  Check,
  RotateCcw,
  Send,
  ExternalLink,
  Palmtree,
  Printer,
  Info,
} from 'lucide-react';

interface RecommendationCardsProps {
  preliminaryRecommendation: string;
  whatsappMessage: string;
  onNewComparison: () => void;
}

export const RecommendationCards: React.FC<RecommendationCardsProps> = ({
  preliminaryRecommendation,
  whatsappMessage,
  onNewComparison,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(whatsappMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Error copying to clipboard:', err);
    }
  };

  const handleOpenWhatsApp = () => {
    const encoded = encodeURIComponent(whatsappMessage);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* 2 Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Recomendación preliminar (borrador) */}
        <div className="bg-white rounded-2xl border border-teal-200/80 shadow-sm p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-gradient-to-br from-[#064E54] to-[#0A6065] text-amber-300 rounded-xl shadow-xs">
                  <Palmtree className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    Recomendación preliminar (borrador)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Análisis técnico para el asesor comercial (máximo 5 líneas)
                  </p>
                </div>
              </div>

              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-50 text-teal-900 border border-teal-200">
                Uso interno asesor
              </span>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-sm text-slate-800 leading-relaxed font-normal whitespace-pre-line">
              {preliminaryRecommendation || 'Generando recomendación basada en los términos analizados...'}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>Evalúa las prioridades y cuantifica diferencias de prima si excede presupuesto.</span>
            </div>
          </div>
        </div>

        {/* Card 2: Mensaje sugerido para el cliente (WhatsApp) */}
        <div className="bg-[#EFEAE2] rounded-2xl border border-emerald-700/20 shadow-sm p-6 flex flex-col justify-between relative overflow-hidden">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#25D366] text-white rounded-xl shadow-xs">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[#128C7E]">
                    Mensaje sugerido para el cliente (WhatsApp)
                  </h3>
                  <p className="text-xs text-slate-600">
                    Tono cordial, sin tecnicismos, listo para enviar (máx. 8 líneas)
                  </p>
                </div>
              </div>

              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                WhatsApp
              </span>
            </div>

            {/* WhatsApp Styled Bubble */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/60 relative">
              <div className="text-sm text-slate-800 whitespace-pre-line leading-relaxed font-sans">
                {whatsappMessage || 'Preparando mensaje para el cliente...'}
              </div>
              <div className="flex items-center justify-end gap-1 mt-2 text-[10px] text-slate-400">
                <span>Borrador sugerido</span>
                <span className="text-blue-500 font-bold">✓✓</span>
              </div>
            </div>
          </div>

          {/* Action inside WhatsApp card */}
          <div className="mt-4 pt-3 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleOpenWhatsApp}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-950 transition cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 text-[#25D366]" />
              <span>Abrir en WhatsApp Web</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </button>

            <button
              type="button"
              onClick={handleCopyMessage}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#25D366] hover:bg-[#20ba59] active:bg-[#1da850] text-white'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>¡Mensaje copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiar mensaje</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Global Bottom Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyMessage}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold shadow-xs transition-all cursor-pointer ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-gradient-to-r from-[#064E54] to-[#0A6065] hover:from-[#043E43] hover:to-[#085156] text-white'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>¡Mensaje copiado al portapapeles!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copiar mensaje</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
            title="Imprimir informe comparativo"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span className="hidden sm:inline">Imprimir / PDF</span>
          </button>
        </div>

        <div>
          <button
            type="button"
            onClick={onNewComparison}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-teal-900 bg-teal-50 hover:bg-teal-100 border border-teal-200 shadow-2xs transition cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Nueva comparación</span>
          </button>
        </div>
      </div>
    </div>
  );
};
