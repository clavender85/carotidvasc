export type FlowDirection = 'antegrade' | 'retrograde' | 'bidirectional' | 'absent' | 'not_assessed';

export type PlaqueComposition = string; // Support multiple selections joined as string
export type PlaqueSurface = 'smooth' | 'irregular' | 'ulcerated' | 'indeterminate';
export type CalcificShadowing = 'none' | 'minor' | 'partial' | 'dense';
export type LuminalNarrowing = string; // Support flexible diagnostic bands

export interface SegmentData {
  id: string;
  name: string;
  side: 'right' | 'left' | 'common';
  psv: number | null;
  edv: number | null;
  flowDirection: FlowDirection;
  waveform: string;
  plaquePresent: boolean;
  intimalThickening: boolean;
  stenosisPresent: boolean;
  localPsvRatio: number | null;
  comments: string;
  technicalLimitations: string;
  // Specific reference override for local ratios
  localRatioReferenceOverrideId?: string | null;
  // 3-point Hemodynamic Assessment
  preStenosisPsv?: number | null;
  atStenosisPsv?: number | null;
  postStenosisPsv?: number | null;
}

export interface PlaqueData {
  id: string; // Unique ID or associated segment ID
  segments: string[]; // Segment IDs this plaque is attached to
  locationDescription: string;
  maxPlaqueSite: string; // Segment ID where the plaque is thickest
  maxThicknessMm: number | null;
  composition: PlaqueComposition;
  surface: PlaqueSurface;
  calcificShadowing: CalcificShadowing;
  luminalNarrowingVisible: LuminalNarrowing;
  freeTextDescription: string;
}

export type ClassificationSystem = 'ASUM_2021' | 'SRU_2003' | 'MODIFIED_SRU_2021' | 'NASCET_INDEX' | 'CUSTOM';

export interface CustomThresholds {
  normalMaxPsv: number;
  stenosis50MaxPsv: number;
  stenosis70MaxPsv: number;
  normalMaxRatio: number;
  stenosis50MaxRatio: number;
  stenosis70MaxRatio: number;
}

export interface NascetCalculation {
  plane: 'longitudinal' | 'transverse';
  minLumenA: number | null; // A = min residual lumen diameter in mm
  normalLumenB: number | null; // B = normal distal ICA lumen diameter in mm
  calculatedStenosis: number | null; // percentage
}

export interface NascetState {
  longitudinal: NascetCalculation;
  transverse: NascetCalculation;
}

export interface SideSummary {
  highestIcaPsv: number | null;
  highestIcaPsvSegmentId: string | null;
  correspondingIcaEdv: number | null;
  distalCcaPsv: number | null;
  icaCcaRatio: number | null;
  icaCcaRatioOverridden: boolean;
  icaCcaRatioReferenceId: string;
  maxPlaqueLocation: string | null;
  maxPlaqueThickness: number | null;
  plaqueMorphology: string | null;
  nascetEstimateLongitudinal: number | null;
  nascetEstimateTransverse: number | null;
  suggestedClassification: string;
  confirmedClassification: string;
  vertebralFlowDirection: FlowDirection;
  subclavianFindings: string;
  subclavianStealSuspected: boolean;
  imtMm: number | null;
}

export interface StudyData {
  segments: Record<string, SegmentData>;
  plaques: PlaqueData[];
  nascet: {
    right: NascetState;
    left: NascetState;
  };
  imt: {
    right: number | null;
    left: number | null;
  };
  classifications: {
    right: {
      suggested: string;
      confirmed: string;
    };
    left: {
      suggested: string;
      confirmed: string;
    };
  };
  variantLeftBct: boolean;
  classificationSystem: ClassificationSystem;
  imtThresholdMm: number;
  customThresholds: CustomThresholds;
  patientName: string;
  patientId: string;
  examDate: string;
  sonographer: string;
  interpretingPhysician: string;
  studyComments: string;
}
