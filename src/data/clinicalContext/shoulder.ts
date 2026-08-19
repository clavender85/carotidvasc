import { ClinicalContextTemplate, ContextOption } from '../../types/clinicalContext';

export const SHOULDER_INDICATION_OPTIONS: ContextOption[] = [
  { id: 'shoulder_pain', label: 'Shoulder pain', shortLabel: 'Pain', category: 'indication', commonInExam: true },
  { id: 'trauma', label: 'Acute trauma / fall onto shoulder', shortLabel: 'Trauma', category: 'indication', commonInExam: true },
  { id: 'reduced_rom', label: 'Reduced range of movement / stiffness', shortLabel: 'Reduced ROM', category: 'indication', commonInExam: true },
  { id: 'weakness', label: 'Weakness / drop arm sign', shortLabel: 'Weakness', category: 'indication', commonInExam: true },
  { id: 'suspected_rc_tear', label: 'Suspected rotator cuff tear', shortLabel: 'Suspected RC tear', category: 'indication', commonInExam: true },
  { id: 'injection_planning', label: 'Subacromial / glenohumeral injection planning', shortLabel: 'Injection planning', category: 'indication', commonInExam: false },
  { id: 'post_op_shoulder', label: 'Postoperative rotator cuff repair assessment', shortLabel: 'Post-op repair', category: 'indication', commonInExam: true },
];

export const SHOULDER_HISTORY_OPTIONS: ContextOption[] = [
  { id: 'prev_rc_repair', label: 'Previous rotator cuff repair surgery', shortLabel: 'Prior repair', category: 'history', commonInExam: true },
  { id: 'prev_corticosteroid', label: 'Previous corticosteroid injection', shortLabel: 'Prior injection', category: 'history', commonInExam: true },
  { id: 'prev_dislocation', label: 'Previous dislocation / instability', shortLabel: 'Prior dislocation', category: 'history', commonInExam: true },
  { id: 'inflammatory_arth', label: 'Inflammatory arthritis (RA / Polymyalgia rheumatica)', category: 'history', commonInExam: false },
  { id: 'prior_shoulder_mri', label: 'Previous shoulder MRI or X-ray', category: 'history', commonInExam: false },
];

export const SHOULDER_CONTEXT_TEMPLATE: ClinicalContextTemplate = {
  examType: 'shoulder',
  examName: 'Shoulder / MSK Ultrasound',
  indicationOptions: SHOULDER_INDICATION_OPTIONS,
  historyOptions: SHOULDER_HISTORY_OPTIONS,
};
