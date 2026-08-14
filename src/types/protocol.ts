// types/protocol.ts
import type { StudyData, SiteProtocolConfig, PriorExamData, AnatomyVariantState, ClassificationSystem } from '../types';

export type Side = 'right' | 'left';

export type RequirementLevel =
  | 'required'
  | 'recommended'
  | 'optional'
  | 'informational';

export type RuleSeverity =
  | 'blocking'
  | 'warning'
  | 'recommendation'
  | 'information';

export type ProtocolRequirementCategory =
  | 'baseline'
  | 'carotid'
  | 'stenosis'
  | 'plaque'
  | 'vertebral'
  | 'subclavian'
  | 'occlusion'
  | 'technical'
  | 'comparison'
  | 'post_intervention';

export interface ProtocolRequirement {
  id: string;
  label: string;
  side?: Side | 'bilateral' | 'common';
  vesselId?: string;
  targetSegmentId?: string;
  targetModule?: 'segment' | 'plaque' | 'nascet' | 'prior' | 'technical' | 'subclavian' | 'ratio' | 'indication';

  category: ProtocolRequirementCategory;

  level: RequirementLevel;
  severity?: RuleSeverity;

  blocking: boolean;
  allowTechnicalOverride: boolean;

  reason: string;
  triggeredBy?: string;
  sourceRuleId?: string;

  satisfied: boolean;
  satisfactionNote?: string;
}

export interface ProtocolOverride {
  requirementId: string;
  segmentId?: string;
  reason: string;
  comment?: string;
  timestamp: string;
  sonographer?: string;
}

export interface SubclavianAssessment {
  waveform?: string | null;
  psv?: number | null;
  edv?: number | null;
  diseaseStatus?: string | null;
  proximalOrigin?: boolean | null;
  brachialPressures?: boolean | null;
  flowDirection?: string | null;
  plaquePresent?: boolean | null;
  stenosisPresent?: boolean | null;
  comments?: string | null;
}

export interface SubclavianDynamicRequirements {
  waveform?: boolean;
  psv?: boolean;
  diseaseAssessment?: boolean;
  proximalOrigin?: boolean;
  brachialPressures?: boolean;
}

export interface VertebralAbnormalityRequirements {
  subclavian: SubclavianDynamicRequirements;
}

export interface DynamicRequirementsConfig {
  vertebralAbnormality: VertebralAbnormalityRequirements;
}

export interface ActiveProtocol extends Partial<SiteProtocolConfig> {
  dynamicRequirements: DynamicRequirementsConfig;
}

export interface ProtocolContext {
  study: StudyData;
  activeProtocol: SiteProtocolConfig | ActiveProtocol;
  previousStudy?: PriorExamData;
  anatomy: AnatomyVariantState;
  criteria: ClassificationSystem;
}

export interface DynamicProtocolResult {
  baselineRequirements: ProtocolRequirement[];
  triggeredRequirements: ProtocolRequirement[];

  outstandingRequired: ProtocolRequirement[];
  outstandingRecommended: ProtocolRequirement[];
  completedRequirements: ProtocolRequirement[];

  completionPercent: number;
  canCompleteStudy: boolean;

  // Rich evaluation extensions
  technicalOverrides?: ProtocolOverride[];
  warnings?: {
    id: string;
    title: string;
    message: string;
    severity: RuleSeverity;
    side?: 'right' | 'left' | 'bilateral';
    actionLabel?: string;
    targetSegmentId?: string;
  }[];
  protocolCompletionPercent?: number;
  summaryStats?: {
    baselineTotal: number;
    baselineCompleted: number;
    dynamicTotal: number;
    dynamicCompleted: number;
    technicalExceptionsCount: number;
    recommendationsCount: number;
    blockingRemainingCount: number;
  };
}

// Backward-compatible aliases
export type ProtocolRequirementLevel = RequirementLevel;
export type DynamicProtocolEvaluation = DynamicProtocolResult;

export interface ProtocolSnapshot {
  protocolId: string;
  protocolVersion: string;
  criteriaId: string;
  criteriaVersion: string;
  siteProtocolId: string;
  siteProtocolVersion: string;
  timestamp: string;
}

export interface ProtocolAuditEvent {
  id: string;
  timestamp: string;
  type:
    | 'TRIGGER_ADDED'
    | 'REQUIREMENT_COMPLETED'
    | 'EXCEPTION_RECORDED'
    | 'CRITERIA_CHANGED'
    | 'PROTOCOL_CHANGED'
    | 'FINDING_UPDATED';
  description: string;
  details?: string;
}

export interface DynamicProtocolRule {
  id: string;
  name: string;
  description: string;
  priority: number;
  category: ProtocolRequirementCategory;
  severity: RuleSeverity;
  appliesToProtocols?: string[];
  enabled: boolean;
  source: 'universal' | 'regional' | 'site' | 'anatomy';
  ifCondition: string;
  thenAction: string;
}
