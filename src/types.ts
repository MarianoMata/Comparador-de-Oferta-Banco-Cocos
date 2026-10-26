export interface MandatoryCoverages {
  colision: boolean;
  robo: boolean;
  asistenciaVial: boolean;
  fenomenosNaturales: boolean;
  vehiculoSustituto: boolean;
}

export interface ClientProfile {
  name: string;
  vehicle: string;
  maxBudget: number;
  mandatoryCoverages: MandatoryCoverages;
  priorities: string;
  paymentMethod: string;
}

export type TrafficLightColor = 'verde' | 'amarillo' | 'rojo';

export interface ProposalResult {
  id: string;
  fileName: string;
  insurerName: string;
  annualPremium: string;
  annualPremiumNumeric: number;
  fitsBudget: 'Sí' | 'No' | 'no indicado';
  collisionDeductible: string;
  theftDeductible: string;
  thirdPartyLiabilityProperty: string;
  thirdPartyLiabilityInjuries: string;
  roadsideAssistance: string;
  towing: string;
  replacementVehicle: string;
  naturalPhenomena: string;
  glassBreakage: string;
  highlightedExclusions: string;
  meetsMandatory: 'Sí' | 'No' | 'no indicado';
  trafficLight: TrafficLightColor;
  trafficLightExplanation: string;
  notes?: string;
}

export interface ComparisonResponse {
  proposals: ProposalResult[];
  preliminaryRecommendation: string;
  whatsappMessage: string;
}

export interface UploadedPDF {
  id: string;
  name: string;
  size: number;
  base64: string;
  url?: string;
  isSample?: boolean;
}

export type UserRole = 'administrador' | 'asesor';
export type UserStatus = 'activo' | 'suspendido';

export interface UserSession {
  id: string;
  usuario: string;
  nombre: string;
  rol: UserRole;
  estado: UserStatus;
  debeCambiarClave: boolean;
  fechaCreacion: string;
  ultimoAcceso: string | null;
}
