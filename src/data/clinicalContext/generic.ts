import { ClinicalContextTemplate, ContextOption } from '../../types/clinicalContext';

export const GENERIC_INDICATION_OPTIONS: ContextOption[] = [
  { id: 'pain_eval', label: 'Pain / discomfort assessment', shortLabel: 'Pain', category: 'indication', commonInExam: true },
  { id: 'swelling_mass', label: 'Palpable lump / swelling / mass evaluation', shortLabel: 'Mass / Swelling', category: 'indication', commonInExam: true },
  { id: 'abnormal_labs', label: 'Abnormal laboratory / clinical biomarkers', shortLabel: 'Abnormal labs', category: 'indication', commonInExam: true },
  { id: 'abnormal_prior_imaging', label: 'Follow-up abnormal prior imaging', shortLabel: 'Follow-up imaging', category: 'indication', commonInExam: true },
  { id: 'post_op_eval', label: 'Post-procedure / post-surgical check', shortLabel: 'Post-op', category: 'indication', commonInExam: true },
  { id: 'pre_op_screen', label: 'Pre-operative / pre-procedure screening', shortLabel: 'Pre-op', category: 'indication', commonInExam: false },
  { id: 'other_indication', label: 'Other clinical indication', category: 'indication', commonInExam: false },
];

export const GENERIC_HISTORY_OPTIONS: ContextOption[] = [
  { id: 'prev_surgery', label: 'Previous relevant surgery', shortLabel: 'Prior surgery', category: 'history', commonInExam: true },
  { id: 'prev_trauma', label: 'Previous trauma / injury', shortLabel: 'Prior trauma', category: 'history', commonInExam: true },
  { id: 'known_malignancy', label: 'Known oncology / malignancy history', shortLabel: 'Malignancy', category: 'history', commonInExam: true },
  { id: 'anticoagulated', label: 'Anticoagulation / antiplatelet therapy', shortLabel: 'Anticoagulated', category: 'history', commonInExam: true },
  { id: 'chronic_illness', label: 'Relevant chronic systemic condition', category: 'history', commonInExam: false },
];

export const GENERIC_CONTEXT_TEMPLATE: ClinicalContextTemplate = {
  examType: 'generic',
  examName: 'General Ultrasound Examination',
  indicationOptions: GENERIC_INDICATION_OPTIONS,
  historyOptions: GENERIC_HISTORY_OPTIONS,
};
