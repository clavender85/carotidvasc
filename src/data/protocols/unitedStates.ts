import { UNIVERSAL_CORE_DEFAULT_DATASET } from './universalCore';
import { SiteProtocolConfig } from '../../types';

export const UNITED_STATES_PROTOCOL_META = {
  id: 'united_states_iac',
  name: 'United States Standard Carotid Duplex — Example',
  badge: 'UNITED STATES',
  region: 'United States & North America',
  organisation: 'Intersocietal Accreditation Commission (IAC) / AIUM / ACR / SVU',
  baseProtocol: 'Universal Core',
  stenosisCriteriaId: 'IAC_MODIFIED_SRU_2023',
  stenosisCriteriaName: 'IAC Modified SRU 2023 Criteria',
  diameterMethodId: 'NASCET',
  diameterMethodName: 'NASCET Diameter Method',
  version: '3.0',
  evidenceChecked: 'IAC 2023 & SRU Standards',
  lastModified: '2026-08-14',
  reviewCycleMonths: 24,
  description: 'Accredited US vascular laboratory standard adhering to IAC Vascular Testing 2023 Standards and ACR-AIUM-SRU Carotid Duplex Performance Guidelines.',
  summaryPoints: [
    'Systematic bilateral transverse and longitudinal B-mode sweeps.',
    'Primary stenosis grading based on IAC 2023 Modified SRU consensus (PSV 180 cm/s for 50% cutoff).',
    'Doppler insonation angle rigorously maintained at ≤ 60 degrees with sample volume center-stream.',
    'NASCET caliper measurements recorded when appropriate for surgical multidisciplinary conferences.'
  ]
};

export const UNITED_STATES_DEFAULT_CONFIG: SiteProtocolConfig = {
  protocolPresetId: 'united_states_iac',
  organisation: 'US Health System / Vascular Institute',
  site: 'IAC Accredited Vascular Laboratory',
  localProtocolName: 'US IAC Carotid Duplex Performance Protocol',
  protocolOwner: 'Technical Director (RVT/RVS)',
  approvedBy: 'Medical Director (RPVI / FACS)',
  version: '3.0',
  effectiveDate: '2025-01-01',
  reviewDate: '2027-01-01',
  siteNotes: 'Compliant with IAC Vascular Testing Accreditation standards. Distal CCA serves as reference denominator for ICA/CCA ratio calculation. NASCET measurements taken in longitudinal and transverse planes.',
  subclavianRoutine: 'conditional',
  vertebralExtent: 'representative',
  ccaExtent: 'prox_dist',
  ecaExtent: 'prox_only',
  imtExtent: 'not_performed',
  nascetBModeExtent: 'routine_above_threshold',
  secondSonographerReviewTrigger: 'PSV > 230 cm/s, ICA/CCA ratio > 4.0, string-sign / near occlusion, or discrepancy > 1 stenosis grade between sonographers.',
  crossSectionalEscalation: 'Critical result notification to ordering physician within 2 hours for symptomatic >70% stenosis or occlusion with acute neurological deficit.',
  mobileExamInstructions: 'Limit study to core diagnostic vessels; note body habitus and ICU monitoring lines; recommend follow-up in vascular lab if suboptimal.',
  afterHoursDataset: 'Stat stroke protocol: Bilateral Proximal/Distal CCA, Bulb, Prox/Mid ICA, ECA, Vertebral direction.',
  specialExamType: 'routine_native',
  segmentRequirements: {
    ...UNIVERSAL_CORE_DEFAULT_DATASET,
    'r_cca_prox': 'required',
    'r_cca_mid': 'optional',
    'r_cca_dist': 'required',
    'r_bulb': 'required',
    'r_ica_prox': 'required',
    'r_ica_mid': 'required',
    'r_ica_dist': 'recommended',
    'r_eca_prox': 'required',
    'r_vert_mid': 'required',
    'r_subcl_prox': 'conditional',
    
    'l_cca_prox': 'required',
    'l_cca_mid': 'optional',
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
