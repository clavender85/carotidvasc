import { ClinicalContextTemplate, ContextOption, ConditionalContextRule } from '../../types/clinicalContext';

export const DVT_INDICATION_OPTIONS: ContextOption[] = [
  { id: 'limb_pain', label: 'Limb pain', shortLabel: 'Pain', category: 'indication', commonInExam: true },
  { id: 'limb_swelling', label: 'Limb swelling / edema', shortLabel: 'Swelling', category: 'indication', commonInExam: true },
  { id: 'suspected_dvt', label: 'Suspected deep vein thrombosis (DVT)', shortLabel: 'Suspected DVT', category: 'indication', commonInExam: true },
  { id: 'pe', label: 'Pulmonary embolism (PE) workup', shortLabel: 'PE', category: 'indication', commonInExam: true },
  { id: 'post_op_dvt', label: 'Postoperative thrombosis screen', shortLabel: 'Post-op', category: 'indication', commonInExam: true },
  { id: 'followup_thrombus', label: 'Follow-up known thrombus / resolution', shortLabel: 'Follow-up thrombus', category: 'indication', commonInExam: true },
  { id: 'palpable_cord', label: 'Palpable venous cord / superficial thrombophlebitis', category: 'indication', commonInExam: false },
  { id: 'elevated_d_dimer', label: 'Elevated D-dimer', shortLabel: 'D-dimer +', category: 'indication', commonInExam: true },
];

export const DVT_HISTORY_OPTIONS: ContextOption[] = [
  { id: 'prev_dvt', label: 'Previous DVT', shortLabel: 'Prior DVT', category: 'history', commonInExam: true },
  { id: 'prev_pe', label: 'Previous PE', shortLabel: 'Prior PE', category: 'history', commonInExam: true },
  { id: 'recent_surgery', label: 'Recent major surgery / orthopaedic surgery', category: 'history', commonInExam: true },
  { id: 'recent_travel', label: 'Recent long-distance travel / immobility', category: 'history', commonInExam: true },
  { id: 'malignancy', label: 'Active malignancy / oncology history', category: 'history', commonInExam: true },
  { id: 'anticoagulation_dvt', label: 'Currently anticoagulated (DOAC / Warfarin / LMWH)', category: 'history', commonInExam: true },
  { id: 'thrombophilia', label: 'Known thrombophilia / clotting disorder', category: 'history', commonInExam: false },
  { id: 'pregnancy_postpartum', label: 'Pregnancy or postpartum (<6 weeks)', category: 'history', commonInExam: false },
];

export const DVT_CONTEXT_TEMPLATE: ClinicalContextTemplate = {
  examType: 'dvt',
  examName: 'Venous Thrombosis (DVT) Ultrasound',
  indicationOptions: DVT_INDICATION_OPTIONS,
  historyOptions: DVT_HISTORY_OPTIONS,
};
