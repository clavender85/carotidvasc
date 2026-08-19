import { ClinicalContextTemplate, ContextOption, ConditionalContextRule } from '../../types/clinicalContext';

export const CAROTID_INDICATION_OPTIONS: ContextOption[] = [
  { id: 'tia_symptoms', label: 'TIA symptoms', shortLabel: 'TIA', category: 'indication', commonInExam: true },
  { id: 'stroke_symptoms', label: 'Stroke symptoms', shortLabel: 'Stroke', category: 'indication', commonInExam: true },
  { id: 'visual_disturbance', label: 'Transient visual disturbance', shortLabel: 'Visual', category: 'indication', commonInExam: true },
  { id: 'amaurosis_fugax', label: 'Amaurosis fugax', shortLabel: 'Amaurosis', category: 'indication', commonInExam: true },
  { id: 'carotid_bruit', label: 'Carotid bruit', shortLabel: 'Bruit', category: 'indication', commonInExam: true },
  { id: 'dizziness', label: 'Dizziness', category: 'indication', commonInExam: true },
  { id: 'vertigo', label: 'Vertigo', category: 'indication', commonInExam: false },
  { id: 'syncope', label: 'Syncope / presyncope', shortLabel: 'Syncope', category: 'indication', commonInExam: true },
  { id: 'followup_stenosis', label: 'Follow-up known carotid stenosis', shortLabel: 'Follow-up stenosis', category: 'indication', commonInExam: true },
  { id: 'abnormal_ct_cta', label: 'Abnormal CT / CTA', shortLabel: 'Abnormal CTA', category: 'indication', commonInExam: true },
  { id: 'abnormal_mri_mra', label: 'Abnormal MRI / MRA', shortLabel: 'Abnormal MRA', category: 'indication', commonInExam: false },
  { id: 'post_cea', label: 'Post carotid endarterectomy', shortLabel: 'Post CEA', category: 'indication', commonInExam: true },
  { id: 'post_stent', label: 'Post carotid stent', shortLabel: 'Post stent', category: 'indication', commonInExam: true },
  { id: 'suspected_steal', label: 'Suspected subclavian steal', shortLabel: 'Subclavian steal', category: 'indication', commonInExam: true },
  { id: 'other_neuro', label: 'Other neurological symptoms', category: 'indication', commonInExam: false },
  { id: 'routine_screening', label: 'Vascular screening / check', category: 'indication', commonInExam: false },
  { id: 'pulsatile_neck_mass', label: 'Pulsatile neck mass / suspected aneurysm', category: 'indication', commonInExam: false },
  { id: 'pre_op_cardiac', label: 'Pre-operative cardiac surgery assessment', category: 'indication', commonInExam: false },
];

export const CAROTID_HISTORY_OPTIONS: ContextOption[] = [
  { id: 'prev_stroke', label: 'Previous stroke', shortLabel: 'Prior stroke', category: 'history', commonInExam: true },
  { id: 'prev_tia', label: 'Previous TIA', shortLabel: 'Prior TIA', category: 'history', commonInExam: true },
  { id: 'prev_carotid_stenosis', label: 'Previous carotid stenosis', shortLabel: 'Known stenosis', category: 'history', commonInExam: true },
  { id: 'prev_cea', label: 'Previous carotid endarterectomy', shortLabel: 'Prior CEA', category: 'history', commonInExam: true },
  { id: 'prev_stent', label: 'Previous carotid stent', shortLabel: 'Prior stent', category: 'history', commonInExam: true },
  { id: 'cvd', label: 'Cardiovascular disease', shortLabel: 'CVD', category: 'history', commonInExam: true },
  { id: 'hypertension', label: 'Hypertension', shortLabel: 'HTN', category: 'history', commonInExam: true },
  { id: 'hyperlipidaemia', label: 'Hyperlipidaemia', shortLabel: 'Lipids', category: 'history', commonInExam: true },
  { id: 'diabetes', label: 'Diabetes mellitus', shortLabel: 'Diabetes', category: 'history', commonInExam: true },
  { id: 'smoking', label: 'Smoking history', shortLabel: 'Smoker', category: 'history', commonInExam: true },
  { id: 'atrial_fib', label: 'Atrial fibrillation', shortLabel: 'AF', category: 'history', commonInExam: false },
  { id: 'anticoagulation', label: 'Anticoagulation / antiplatelet therapy', shortLabel: 'Anticoagulated', category: 'history', commonInExam: false },
  { id: 'pad', label: 'Peripheral arterial disease', shortLabel: 'PAD', category: 'history', commonInExam: false },
  { id: 'family_hx_stroke', label: 'Family history of stroke / vascular disease', category: 'history', commonInExam: false },
];

export const CAROTID_PRIOR_PROCEDURES: ContextOption[] = [
  { id: 'prior_carotid_us', label: 'Carotid Duplex Ultrasound', category: 'prior_imaging' },
  { id: 'prior_cta_neck', label: 'CT Angiography (CTA) Neck / Brain', category: 'prior_imaging' },
  { id: 'prior_mra_neck', label: 'MR Angiography (MRA) Neck / Brain', category: 'prior_imaging' },
  { id: 'prior_dsa', label: 'Digital Subtraction Angiography (DSA)', category: 'prior_imaging' },
  { id: 'prior_cea_surg', label: 'Carotid Endarterectomy (CEA)', category: 'procedure' },
  { id: 'prior_cas_stent', label: 'Carotid Artery Stenting (CAS)', category: 'procedure' },
  { id: 'prior_cabg', label: 'Coronary Artery Bypass Graft (CABG)', category: 'procedure' },
];

export const CAROTID_CONDITIONAL_QUESTIONS: ConditionalContextRule[] = [
  {
    id: 'carotid_symptom_side',
    triggerCondition: (context) => {
      const symptomaticKeywords = ['tia', 'stroke', 'visual', 'amaurosis', 'neurological'];
      return context.indications.some(ind => 
        symptomaticKeywords.some(kw => ind.label.toLowerCase().includes(kw))
      );
    },
    fieldId: 'symptomSide',
    fieldLabel: 'Symptom Laterality / Target Side',
    fieldType: 'select',
    options: [
      { value: 'right', label: 'Right Hemisphere / Eye Symptoms' },
      { value: 'left', label: 'Left Hemisphere / Eye Symptoms' },
      { value: 'bilateral', label: 'Bilateral / Vertebrobasilar' },
      { value: 'uncertain', label: 'Uncertain / Unspecified' },
    ],
    helpText: 'Triggered by neurological/visual indications'
  },
  {
    id: 'carotid_symptom_onset',
    triggerCondition: (context) => {
      const symptomaticKeywords = ['tia', 'stroke', 'visual', 'amaurosis'];
      return context.indications.some(ind => 
        symptomaticKeywords.some(kw => ind.label.toLowerCase().includes(kw))
      );
    },
    fieldId: 'symptomOnset',
    fieldLabel: 'Symptom Onset / Event Date',
    fieldType: 'text',
    placeholder: 'e.g. <24 hours ago, 3 days ago, 12/05/2026',
    helpText: 'Clinical timeframe of ischemic presentation'
  }
];

export const CAROTID_CONTEXT_TEMPLATE: ClinicalContextTemplate = {
  examType: 'carotid',
  examName: 'Carotid & Vertebral Duplex Ultrasound',
  indicationOptions: CAROTID_INDICATION_OPTIONS,
  historyOptions: CAROTID_HISTORY_OPTIONS,
  priorProcedureOptions: CAROTID_PRIOR_PROCEDURES,
  conditionalQuestions: CAROTID_CONDITIONAL_QUESTIONS,
};
