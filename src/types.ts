export type FlowDirection = 'antegrade' | 'retrograde' | 'bidirectional' | 'absent' | 'not_assessed';

export type VertebralFlowDirection =
  | 'antegrade'
  | 'bidirectional'
  | 'retrograde'
  | 'absent'
  | 'not_assessed';

export type VertebralWaveformCharacter =
  | 'normal_antegrade'
  | 'early_systolic_deceleration'
  | 'bunny_pre_steal'
  | 'bidirectional_partial_steal'
  | 'complete_reversal'
  | 'dampened'
  | 'high_resistance'
  | 'other'
  | 'not_assessed';

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
  vertebralWaveformCharacter?: VertebralWaveformCharacter;
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

export type ClassificationSystem =
  | 'ASUM_2021'
  | 'IAC_MODIFIED_SRU_2023'
  | 'MODIFIED_SRU_2021' // Legacy alias
  | 'SRU_2003'
  | 'UK_JOINT'
  | 'NASCET_INDEX'
  | 'CUSTOM';

export type ArchVariant =
  | 'standard'
  | 'bovine_common_origin'
  | 'left_vertebral_from_arch'
  | 'aberrant_right_subclavian'
  | 'separate_rcca_and_rsa'
  | 'other';

export type BifurcationVariant =
  | 'normal'
  | 'high'
  | 'low';

export interface AnatomyVariantState {
  archVariant: ArchVariant;
  bifurcationVariant: BifurcationVariant;
  otherDescription?: string;
  variantNotes?: string;
}

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

export interface NonCarotidFinding {
  id: string;
  type: string;
  side: 'right' | 'left' | 'bilateral';
  sizeMm?: number | null;
  comments: string;
}

// 4 Top-Level Main Tabs
export type MainTab = 'scan' | 'previous' | 'report' | 'protocol';

export type RequirementLevel = 'required' | 'recommended' | 'conditional' | 'optional' | 'not_performed';

export type SpecialExamType =
  | 'routine_native'
  | 'post_cea'
  | 'post_stent'
  | 'subclavian_steal'
  | 'known_occlusion'
  | 'limited_targeted';

export interface SiteProtocolConfig {
  protocolPresetId: 'universal_core' | 'australia_asum' | 'united_states_iac' | 'custom_site';
  organisation: string;
  site: string;
  localProtocolName: string;
  protocolOwner: string;
  approvedBy: string;
  version: string;
  effectiveDate: string;
  reviewDate: string;
  siteNotes: string;
  subclavianRoutine: 'routine' | 'conditional';
  vertebralExtent: 'representative' | 'full';
  ccaExtent: 'prox_dist' | 'prox_mid_dist';
  ecaExtent: 'prox_only' | 'prox_mid_dist';
  imtExtent: 'routine' | 'conditional' | 'not_performed';
  nascetBModeExtent: 'routine_above_threshold' | 'conditional' | 'not_routine';
  secondSonographerReviewTrigger: string;
  crossSectionalEscalation: string;
  mobileExamInstructions: string;
  afterHoursDataset: string;
  specialExamType: SpecialExamType;
  segmentRequirements: Record<string, RequirementLevel>;
}

export interface PriorExamData {
  hasPriorExam: boolean;
  examDate: string;
  facility: string;
  sonographer?: string;
  interpretingPhysician?: string;
  criteriaUsed?: string; // e.g. ASUM 2021, IAC Modified SRU 2023, SRU 2003, Other
  hasPriorReport: boolean;
  rightIcaPsv: number | null;
  rightIcaEdv: number | null;
  rightIcaRatio: number | null;
  rightIcaClassification: string;
  rightCcaPsv: number | null;
  rightPlaqueLocation: string;
  rightPlaqueThicknessMm: number | null;
  rightPlaqueMorphology: string;
  rightPlaqueSurface: string;
  rightVertFlow: FlowDirection;
  rightSubclavian: string;
  rightIntervention: string;
  
  leftIcaPsv: number | null;
  leftIcaEdv: number | null;
  leftIcaRatio: number | null;
  leftIcaClassification: string;
  leftCcaPsv: number | null;
  leftPlaqueLocation: string;
  leftPlaqueThicknessMm: number | null;
  leftPlaqueMorphology: string;
  leftPlaqueSurface: string;
  leftVertFlow: FlowDirection;
  leftSubclavian: string;
  leftIntervention: string;
  
  priorReportText: string;
  comparisonNotes: string;
}

import { ProtocolOverride, ProtocolAuditEvent, ProtocolSnapshot } from './types/protocol';
export * from './types/protocol';

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
  anatomyVariants: AnatomyVariantState;
  classificationSystem: ClassificationSystem;
  siteProtocol: SiteProtocolConfig;
  imtThresholdMm: number;
  customThresholds: CustomThresholds;
  patientName: string;
  patientId: string;
  examDate: string;
  sonographer: string;
  interpretingPhysician: string;
  studyComments: string;
  clinicalIndications: string[];
  symptomSide: 'right' | 'left' | 'bilateral' | 'none';
  symptomatic: boolean;
  vascularHistory: string;
  nonCarotidFindings: NonCarotidFinding[];
  priorExam?: PriorExamData;
  keyImpressions: {
    right: string;
    left: string;
    general: string;
  };
  // Dynamic Protocol State
  technicalOverrides: Record<string, ProtocolOverride>;
  protocolAuditLog: ProtocolAuditEvent[];
  protocolSnapshot?: ProtocolSnapshot;
  activeCcaReferenceOverride?: {
    right?: string | null;
    left?: string | null;
  };
}
