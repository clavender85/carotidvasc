import { ClinicalContextTemplate, ContextOption } from '../../types/clinicalContext';

export const ABDOMEN_INDICATION_OPTIONS: ContextOption[] = [
  { id: 'ruq_pain', label: 'Right upper quadrant (RUQ) pain', shortLabel: 'RUQ pain', category: 'indication', commonInExam: true },
  { id: 'gen_abd_pain', label: 'Generalised abdominal pain', shortLabel: 'Abdo pain', category: 'indication', commonInExam: true },
  { id: 'abnormal_lfts', label: 'Abnormal liver function tests (LFTs)', shortLabel: 'Abnormal LFTs', category: 'indication', commonInExam: true },
  { id: 'jaundice', label: 'Jaundice / hyperbilirubinaemia', shortLabel: 'Jaundice', category: 'indication', commonInExam: true },
  { id: 'weight_loss', label: 'Unexplained weight loss', shortLabel: 'Weight loss', category: 'indication', commonInExam: false },
  { id: 'abnormal_ct_mri', label: 'Abnormal CT / MRI finding', shortLabel: 'Abnormal CT/MRI', category: 'indication', commonInExam: true },
  { id: 'followup_lesion', label: 'Follow-up liver / renal / gallbladder lesion', shortLabel: 'Follow-up lesion', category: 'indication', commonInExam: true },
  { id: 'suspected_aaa', label: 'Suspected abdominal aortic aneurysm (AAA) / screen', category: 'indication', commonInExam: true },
];

export const ABDOMEN_HISTORY_OPTIONS: ContextOption[] = [
  { id: 'cholecystectomy', label: 'Previous cholecystectomy', shortLabel: 'Post chole', category: 'history', commonInExam: true },
  { id: 'pancreatitis', label: 'Previous pancreatitis', shortLabel: 'Pancreatitis', category: 'history', commonInExam: true },
  { id: 'cirrhosis_liver', label: 'Chronic liver disease / cirrhosis / hepatitis', category: 'history', commonInExam: true },
  { id: 'malignancy_abd', label: 'Known malignancy / metastatic screen', category: 'history', commonInExam: true },
  { id: 'prev_abd_surgery', label: 'Previous abdominal or pelvic surgery', category: 'history', commonInExam: true },
  { id: 'renal_calculi', label: 'Renal calculi / nephrolithiasis', category: 'history', commonInExam: false },
];

export const ABDOMEN_CONTEXT_TEMPLATE: ClinicalContextTemplate = {
  examType: 'abdomen',
  examName: 'Abdominal Ultrasound',
  indicationOptions: ABDOMEN_INDICATION_OPTIONS,
  historyOptions: ABDOMEN_HISTORY_OPTIONS,
};
