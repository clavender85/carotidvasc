export type ClinicalContextCategory =
  | 'indication'
  | 'history'
  | 'prior_imaging'
  | 'procedure'
  | 'note';

export type ContextItemSource =
  | 'referral_import'
  | 'manual'
  | 'extracted'
  | 'edited';

export interface ClinicalContextItem {
  id: string;
  category: ClinicalContextCategory;
  label: string;
  detail?: string;
  side?: 'right' | 'left' | 'bilateral' | 'uncertain';
  date?: string;
  source: ContextItemSource;
  sourceText?: string;
}

export type ReferralSourceType =
  | 'electronic_referral'
  | 'ris'
  | 'manual'
  | 'other';

export interface ReferralSource {
  rawText: string;
  source: ReferralSourceType;
  importedAt?: string;
  sourceId?: string;
  isReadOnlySource?: boolean;
}

export interface ClinicalContextData {
  referral?: ReferralSource;
  indications: ClinicalContextItem[];
  history: ClinicalContextItem[];
  priorImaging: ClinicalContextItem[];
  procedures: ClinicalContextItem[];
  additionalNotes: string;
  conditionalAnswers?: Record<string, any>;
}

export interface ContextOption {
  id: string;
  label: string;
  shortLabel?: string;
  category: ClinicalContextCategory;
  description?: string;
  commonInExam?: boolean;
}

export interface ConditionalContextRule {
  id: string;
  triggerCondition: (context: ClinicalContextData) => boolean;
  fieldId: string;
  fieldLabel: string;
  fieldType: 'select' | 'text' | 'date';
  options?: { value: string; label: string }[];
  placeholder?: string;
  helpText?: string;
}

export interface ClinicalContextTemplate {
  examType: string;
  examName: string;
  indicationOptions: ContextOption[];
  historyOptions: ContextOption[];
  priorProcedureOptions?: ContextOption[];
  conditionalQuestions?: ConditionalContextRule[];
}

export interface ReferralImportResult {
  referral: ReferralSource;
  extractedIndications?: string[];
  extractedHistory?: string[];
  extractedPriorImaging?: string[];
}

export interface ReferralImportAdapter {
  importReferral(externalData: unknown): ReferralImportResult;
}
