import React from 'react';
import {
  Check,
  X,
  AlertTriangle,
  Shield,
  FileCheck,
  FileX,
  HelpCircle,
  Car,
  Wrench,
  Clock,
  Sparkles,
} from 'lucide-react';
import { ProposalResult, TrafficLightColor } from '../types';

interface ComparisonTableProps {
  proposals: ProposalResult[];
  maxBudget: number;
}

export const ComparisonTable: React.FC<ComparisonTableProps> = ({ proposals, maxBudget }) => {
  if (!proposals || proposals.length === 0) {
    return null;
  }

  // Row definition list as requested:
  // 1. Prima anual
  // 2. Cabe en presupuesto
  // 3. Deducible colisión
  // 4. Deducible robo
  // 5. RC daños a terceros
  // 6. RC lesiones
  // 7. Asistencia vial 24/7
  // 8. Grúa
  // 9. Vehículo sustituto
  // 10. Fenómenos naturales
  // 11. Rotura de cristales
  // 12. Exclusiones destacadas
  // 13. Cumple obligatorias
  // 14. Semáforo

  const rows = [
    {
      id: 'annualPremium',
      label: 'Prima anual',
      description: 'Monto total con impuestos (IVA) incluido',
      isHighlight: true,
      render: (p: ProposalResult) => (
        <div className="font-extrabold text-base sm:text-lg text-slate-900">
          {p.annualPremium || 'no indicado'}
        </div>
      ),
    },
    {
      id: 'fitsBudget',
      label: 'Cabe en presupuesto',
      description: `Presupuesto máx: ₡ ${Number(maxBudget).toLocaleString('es-CR')}`,
      render: (p: ProposalResult) => {
        const fits = p.fitsBudget?.toLowerCase() === 'sí' || p.fitsBudget?.toLowerCase() === 'si';
        const isNo = p.fitsBudget?.toLowerCase() === 'no';
        if (fits) {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Sí cabe</span>
            </span>
          );
        }
        if (isNo) {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
              <X className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>No cabe</span>
            </span>
          );
        }
        return <span className="text-slate-500 italic text-xs">{p.fitsBudget || 'no indicado'}</span>;
      },
    },
    {
      id: 'collisionDeductible',
      label: 'Deducible colisión',
      description: 'Porcentaje y monto mínimo por evento',
      render: (p: ProposalResult) => (
        <span className="text-xs sm:text-sm font-medium text-slate-800">
          {p.collisionDeductible || 'no indicado'}
        </span>
      ),
    },
    {
      id: 'theftDeductible',
      label: 'Deducible robo',
      description: 'Deducible aplicable a robo total/parcial',
      render: (p: ProposalResult) => (
        <span className="text-xs sm:text-sm font-medium text-slate-800">
          {p.theftDeductible || 'no indicado'}
        </span>
      ),
    },
    {
      id: 'thirdPartyLiabilityProperty',
      label: 'RC daños a terceros',
      description: 'Responsabilidad civil bienes materiales',
      render: (p: ProposalResult) => (
        <span className="text-xs sm:text-sm font-semibold text-slate-800">
          {p.thirdPartyLiabilityProperty || 'no indicado'}
        </span>
      ),
    },
    {
      id: 'thirdPartyLiabilityInjuries',
      label: 'RC lesiones',
      description: 'Responsabilidad civil lesiones o muerte',
      render: (p: ProposalResult) => (
        <span className="text-xs sm:text-sm font-semibold text-slate-800">
          {p.thirdPartyLiabilityInjuries || 'no indicado'}
        </span>
      ),
    },
    {
      id: 'roadsideAssistance',
      label: 'Asistencia vial 24/7',
      description: 'Paso de corriente, llanta, cerrajería, etc.',
      render: (p: ProposalResult) => {
        const val = p.roadsideAssistance?.toLowerCase() || '';
        const isNotIncluded = val.includes('no incluye') || val.includes('opcional');
        return (
          <div className="text-xs sm:text-sm">
            <span className={isNotIncluded ? 'text-amber-800 font-medium' : 'text-slate-800'}>
              {p.roadsideAssistance || 'no indicado'}
            </span>
          </div>
        );
      },
    },
    {
      id: 'towing',
      label: 'Grúa',
      description: 'Kilometraje y eventos por año',
      render: (p: ProposalResult) => (
        <span className="text-xs sm:text-sm text-slate-800 font-medium">
          {p.towing || 'no indicado'}
        </span>
      ),
    },
    {
      id: 'replacementVehicle',
      label: 'Vehículo sustituto',
      description: 'Auto provisional durante reparación',
      render: (p: ProposalResult) => {
        const val = p.replacementVehicle?.toLowerCase() || '';
        const isNo = val.includes('no') || val.includes('no incluye');
        return (
          <span
            className={`text-xs sm:text-sm font-medium ${
              isNo ? 'text-rose-700' : 'text-emerald-700 font-semibold'
            }`}
          >
            {p.replacementVehicle || 'no indicado'}
          </span>
        );
      },
    },
    {
      id: 'naturalPhenomena',
      label: 'Fenómenos naturales',
      description: 'Inundaciones, deslizamientos, etc.',
      render: (p: ProposalResult) => {
        const val = p.naturalPhenomena?.toLowerCase() || '';
        const isNo = val.includes('no') || val.includes('no aplica');
        return (
          <span
            className={`text-xs sm:text-sm font-medium ${
              isNo ? 'text-rose-700' : 'text-emerald-700 font-semibold'
            }`}
          >
            {p.naturalPhenomena || 'no indicado'}
          </span>
        );
      },
    },
    {
      id: 'glassBreakage',
      label: 'Rotura de cristales',
      description: 'Parabrisas y ventanas laterales',
      render: (p: ProposalResult) => {
        const val = p.glassBreakage?.toLowerCase() || '';
        const isNo = val.includes('no cubre') || val.includes('no');
        return (
          <span className={`text-xs sm:text-sm ${isNo ? 'text-slate-400' : 'text-slate-800'}`}>
            {p.glassBreakage || 'no indicado'}
          </span>
        );
      },
    },
    {
      id: 'highlightedExclusions',
      label: 'Exclusiones destacadas',
      description: 'Restricciones críticas de póliza',
      render: (p: ProposalResult) => (
        <p className="text-xs text-slate-600 leading-relaxed max-w-xs">
          {p.highlightedExclusions || 'no indicado'}
        </p>
      ),
    },
    {
      id: 'meetsMandatory',
      label: 'Cumple obligatorias',
      description: 'Todas las solicitadas incluidas en la prima base',
      isHighlight: true,
      render: (p: ProposalResult) => {
        const meets = p.meetsMandatory?.toLowerCase() === 'sí' || p.meetsMandatory?.toLowerCase() === 'si';
        return (
          <div>
            {meets ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <FileCheck className="w-4 h-4 stroke-[2.5]" />
                <span>Cumple al 100%</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold bg-rose-100 text-rose-800 border border-rose-300">
                <FileX className="w-4 h-4 stroke-[2.5]" />
                <span>No cumple</span>
              </span>
            )}
          </div>
        );
      },
    },
    {
      id: 'trafficLight',
      label: 'Semáforo',
      description: 'Verde (cabe y cumple) / Amarillo (cumple, excede $) / Rojo (no cumple)',
      isHighlight: true,
      isStickyBottom: true,
      render: (p: ProposalResult) => {
        const color = p.trafficLight;
        return (
          <div className="flex flex-col gap-1.5">
            {color === 'verde' && (
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-extrabold bg-emerald-600 text-white shadow-sm">
                <span className="w-3 h-3 rounded-full bg-white animate-pulse" />
                <span>VERDE</span>
              </div>
            )}
            {color === 'amarillo' && (
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-extrabold bg-amber-500 text-white shadow-sm">
                <span className="w-3 h-3 rounded-full bg-white animate-pulse" />
                <span>AMARILLO</span>
              </div>
            )}
            {color === 'rojo' && (
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-extrabold bg-rose-600 text-white shadow-sm">
                <span className="w-3 h-3 rounded-full bg-white animate-pulse" />
                <span>ROJO</span>
              </div>
            )}
            <p className="text-[11px] text-slate-500 font-medium leading-tight">
              {p.trafficLightExplanation || (
                color === 'verde'
                  ? 'Cumple todas las coberturas y cabe en el presupuesto.'
                  : color === 'amarillo'
                  ? 'Cumple todas las coberturas pero excede el presupuesto.'
                  : 'No cumple con las coberturas obligatorias marcadas.'
              )}
            </p>
          </div>
        );
      },
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      {/* Table Header Section */}
      <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-900 border border-teal-200 flex items-center justify-center font-bold text-sm">
              3
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                Resultado: Tabla comparativa
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Comparación directa por aseguradora con validación objetiva de condiciones y semáforo.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Verde: Cabe y cumple
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Amarillo: Cumple, no cabe
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Rojo: No cumple
            </span>
          </div>
        </div>
      </div>

      {/* Responsive Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-gradient-to-r from-[#032F33] via-[#064E54] to-[#0A6065] text-white">
              <th className="py-4 px-4 sm:px-6 text-xs font-bold uppercase tracking-wider w-[240px] sm:w-[280px] border-b border-teal-700">
                Característica evaluada
              </th>
              {proposals.map((prop, idx) => (
                <th
                  key={prop.id || idx}
                  className="py-4 px-4 sm:px-6 text-xs sm:text-sm font-bold border-b border-teal-700 min-w-[200px]"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-teal-800 text-amber-300 font-extrabold flex items-center justify-center text-xs border border-amber-300/30">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <div className="truncate">
                      <div className="font-extrabold text-white text-sm sm:text-base truncate">
                        {prop.insurerName || `Aseguradora ${idx + 1}`}
                      </div>
                      <div className="text-[11px] text-teal-200 font-normal truncate opacity-85" title={prop.fileName}>
                        {prop.fileName}
                      </div>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {rows.map((row, rIdx) => {
              const isEven = rIdx % 2 === 0;
              const isSticky = row.isStickyBottom;
              return (
                <tr
                  key={row.id}
                  className={`transition-colors ${
                    isSticky
                      ? 'bg-slate-100/90 font-medium'
                      : isEven
                      ? 'bg-white'
                      : 'bg-slate-50/70'
                  } hover:bg-blue-50/40`}
                >
                  {/* Left row header */}
                  <td className="py-3.5 px-4 sm:px-6 align-middle border-r border-slate-200/80">
                    <div className="text-xs sm:text-sm font-bold text-slate-800">
                      {row.label}
                    </div>
                    {row.description && (
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {row.description}
                      </div>
                    )}
                  </td>

                  {/* Proposal columns */}
                  {proposals.map((prop, pIdx) => (
                    <td
                      key={`${row.id}-${prop.id || pIdx}`}
                      className="py-3.5 px-4 sm:px-6 align-middle border-r border-slate-200/60 last:border-r-0"
                    >
                      {row.render(prop)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
