import { UNIVERSAL_CORE_DEFAULT_DATASET, UNIVERSAL_CORE_SECTIONS } from './universalCore';
import { SiteProtocolConfig } from '../../types';

export const AUSTRALIA_PROTOCOL_META = {
  id: 'australia_asum',
  name: 'Australian Standard Carotid Duplex — Example',
  badge: 'AUSTRALIA',
  region: 'Australia & New Zealand',
  organisation: 'Australasian Society for Ultrasound in Medicine (ASUM)',
  baseProtocol: 'Universal Core',
  stenosisCriteriaId: 'ASUM_2021',
  stenosisCriteriaName: 'ASUM 2021 Criteria',
  diameterMethodId: 'NASCET',
  diameterMethodName: 'NASCET supportive caliper measurement',
  version: '2.1',
  evidenceChecked: 'ASUM 2021 Guidelines',
  lastModified: '2026-08-14',
  reviewCycleMonths: 24,
  description: 'National clinical protocol standard adhering to ASUM 2021 extracranial guidelines and Australasian Sonographers Association practice parameters.',
  summaryPoints: [
    'Comprehensive bilateral duplex acquisition from CCA to distal accessible ICA.',
    'Primary stenosis grading driven by ASUM 2021 multi-parameter consensus.',
    'NASCET caliper diameter measurement utilized as supportive morphological evidence.',
    'Conditional subclavian artery protocol with prompt escalation for suspected steal.'
  ]
};

export const AUSTRALIA_DEFAULT_CONFIG: SiteProtocolConfig = {
  protocolPresetId: 'australia_asum',
  organisation: 'Australian Health Service / Imaging Network',
  site: 'Main Vascular Laboratory',
  localProtocolName: 'Australian Standard Carotid Duplex Protocol',
  protocolOwner: 'Chief Vascular Scientist',
  approvedBy: 'Director of Vascular Surgery / Radiology QA Committee',
  version: '2.1',
  effectiveDate: '2025-01-01',
  reviewDate: '2027-01-01',
  siteNotes: 'Routine clinical protocol aligned with ASUM 2021 guidelines. NASCET diameter calculation performed when plaque produces visible focal narrowing and acoustic window permits.',
  subclavianRoutine: 'conditional',
  vertebralExtent: 'representative',
  ccaExtent: 'prox_mid_dist',
  ecaExtent: 'prox_only',
  imtExtent: 'conditional',
  nascetBModeExtent: 'conditional',
  secondSonographerReviewTrigger: 'Suspected severe stenosis (≥70%), near occlusion, carotid dissection, or velocity discrepancy with ratio > 4.0.',
  crossSectionalEscalation: 'Urgent notification to referring clinician and vascular surgical team for symptomatic patients with ≥70% stenosis or near occlusion. Consider urgent CTA/MRA.',
  mobileExamInstructions: 'Document mobile/ICU environment limitations; prioritize distal CCA and proximal ICA Doppler samples; repeat in department when patient mobility allows.',
  afterHoursDataset: 'Minimum focused dataset: Bilateral Distal CCA, Bulb, Proximal ICA, ECA, and Vertebral flow direction.',
  specialExamType: 'routine_native',
  segmentRequirements: {
    ...UNIVERSAL_CORE_DEFAULT_DATASET,
    'r_cca_prox': 'required',
    'r_cca_mid': 'recommended',
    'r_cca_dist': 'required',
    'r_bulb': 'required',
    'r_ica_prox': 'required',
    'r_ica_mid': 'required',
    'r_ica_dist': 'recommended',
    'r_eca_prox': 'required',
    'r_vert_mid': 'required',
    'r_subcl_prox': 'conditional',
    
    'l_cca_prox': 'required',
    'l_cca_mid': 'recommended',
    'l_cca_dist': 'required',
    'l_bulb': 'required',
    'l_ica_prox': 'required',
    'l_ica_mid': 'required',
    'l_ica_dist': 'recommended',
    'l_eca_prox': 'required',
    'l_vert_mid': 'required',
    'l_subcl_prox': 'conditional',
  }
};
