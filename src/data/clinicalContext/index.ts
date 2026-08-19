import { ClinicalContextTemplate } from '../../types/clinicalContext';
import { CAROTID_CONTEXT_TEMPLATE } from './carotid';
import { DVT_CONTEXT_TEMPLATE } from './dvt';
import { ABDOMEN_CONTEXT_TEMPLATE } from './abdomen';
import { SHOULDER_CONTEXT_TEMPLATE } from './shoulder';
import { GENERIC_CONTEXT_TEMPLATE } from './generic';

export * from './carotid';
export * from './dvt';
export * from './abdomen';
export * from './shoulder';
export * from './generic';

export const CLINICAL_CONTEXT_TEMPLATES: Record<string, ClinicalContextTemplate> = {
  carotid: CAROTID_CONTEXT_TEMPLATE,
  dvt: DVT_CONTEXT_TEMPLATE,
  abdomen: ABDOMEN_CONTEXT_TEMPLATE,
  shoulder: SHOULDER_CONTEXT_TEMPLATE,
  generic: GENERIC_CONTEXT_TEMPLATE,
};

export function getContextTemplate(examType: string = 'carotid'): ClinicalContextTemplate {
  return CLINICAL_CONTEXT_TEMPLATES[examType] || GENERIC_CONTEXT_TEMPLATE;
}
