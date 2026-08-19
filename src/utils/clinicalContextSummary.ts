import { ClinicalContextData, ClinicalContextItem, ReferralSource } from '../types/clinicalContext';
import { StudyData } from '../types';

/**
 * Returns a normalized ClinicalContextData object from StudyData,
 * migrating legacy clinicalIndications and vascularHistory if clinicalContext is not yet populated.
 */
export function getNormalizedClinicalContext(studyData?: Partial<StudyData> | null): ClinicalContextData {
  if (studyData?.clinicalContext) {
    return {
      referral: studyData.clinicalContext.referral,
      indications: studyData.clinicalContext.indications || [],
      history: studyData.clinicalContext.history || [],
      priorImaging: studyData.clinicalContext.priorImaging || [],
      procedures: studyData.clinicalContext.procedures || [],
      additionalNotes: studyData.clinicalContext.additionalNotes || '',
      conditionalAnswers: studyData.clinicalContext.conditionalAnswers || {},
    };
  }

  // Migrate legacy fields
  const indications: ClinicalContextItem[] = (studyData?.clinicalIndications || []).map((ind, idx) => ({
    id: `migrated_ind_${idx}_${Date.now()}`,
    category: 'indication',
    label: ind,
    source: 'manual',
  }));

  const historyItems: ClinicalContextItem[] = [];
  if (studyData?.vascularHistory && studyData.vascularHistory.trim()) {
    const splitHistory = studyData.vascularHistory.split(/[,;\n]+/).map(s => s.trim()).filter(Boolean);
    splitHistory.forEach((h, idx) => {
      historyItems.push({
        id: `migrated_hist_${idx}_${Date.now()}`,
        category: 'history',
        label: h,
        source: 'manual',
      });
    });
  }

  const referralText = studyData?.clinicalIndications && studyData.clinicalIndications.length > 0
    ? `Referral indication: ${studyData.clinicalIndications.join(', ')}`
    : '';

  return {
    referral: referralText ? { rawText: referralText, source: 'manual' } : undefined,
    indications,
    history: historyItems,
    priorImaging: [],
    procedures: [],
    additionalNotes: studyData?.studyComments || '',
    conditionalAnswers: studyData?.symptomSide ? { symptomSide: studyData.symptomSide } : {},
  };
}

export interface ClinicalContextSummary {
  indicationsText: string;
  historyText: string;
  priorImagingText: string;
  notesText: string;
  totalItems: number;
  isEmpty: boolean;
  provenance: 'imported' | 'manual' | 'none';
}

/**
 * Generates a clean, compact summary of populated categories for the collapsed component header.
 */
export function generateClinicalContextSummary(context: ClinicalContextData): ClinicalContextSummary {
  const indicationsList = (context.indications || []).map(i => i.label).filter(Boolean);
  const historyList = (context.history || []).map(h => h.label).filter(Boolean);
  
  const priorImagingList: string[] = [];
  (context.priorImaging || []).forEach(item => {
    let str = item.label;
    if (item.date) str += ` — ${item.date}`;
    if (item.detail) str += ` (${item.detail})`;
    priorImagingList.push(str);
  });

  (context.procedures || []).forEach(item => {
    let str = item.label;
    if (item.date) str += ` — ${item.date}`;
    if (item.detail) str += ` (${item.detail})`;
    priorImagingList.push(str);
  });

  const indicationsText = indicationsList.join(' • ');
  const historyText = historyList.join(' • ');
  const priorImagingText = priorImagingList.join(' • ');
  const notesText = (context.additionalNotes || '').trim();

  const totalItems = indicationsList.length + historyList.length + priorImagingList.length;
  const rawReferralText = context.referral?.rawText?.trim() || '';
  const isEmpty = totalItems === 0 && !notesText && !rawReferralText;

  let provenance: 'imported' | 'manual' | 'none' = 'none';
  if (context.referral && (context.referral.source === 'electronic_referral' || context.referral.source === 'ris')) {
    provenance = 'imported';
  } else if (!isEmpty || rawReferralText) {
    provenance = 'manual';
  }

  return {
    indicationsText,
    historyText,
    priorImagingText,
    notesText,
    totalItems,
    isEmpty,
    provenance,
  };
}
