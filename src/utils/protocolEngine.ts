import { StudyData, SiteProtocolConfig, RequirementLevel, SpecialExamType } from '../types';
import { UNIVERSAL_CORE_DEFAULT_DATASET } from '../data/protocols/universalCore';
import { AUSTRALIA_DEFAULT_CONFIG, AUSTRALIA_PROTOCOL_META } from '../data/protocols/australia';
import { UNITED_STATES_DEFAULT_CONFIG, UNITED_STATES_PROTOCOL_META } from '../data/protocols/unitedStates';
import { SEGMENTS_META } from '../constants';

export interface ProtocolEvidenceReference {
  category: 'AUSTRALIA' | 'UNITED_STATES' | 'DIAMETER_MEASUREMENT' | 'HISTORICAL_ALTERNATIVE';
  organisation: string;
  title: string;
  yearVersion: string;
  status: 'CURRENT' | 'REFERENCE' | 'LEGACY' | 'SITE_VALIDATED';
  citation: string;
  link?: string;
  notes: string;
}

export const PROTOCOL_REFERENCES: ProtocolEvidenceReference[] = [
  // Australia
  {
    category: 'AUSTRALIA',
    organisation: 'Australasian Society for Ultrasound in Medicine (ASUM)',
    title: 'Standards of Practice: Duplex Doppler Ultrasound Assessment of Extracranial Carotid Artery Disease',
    yearVersion: '2021',
    status: 'CURRENT',
    citation: 'Australas J Ultrasound Med. 2021; Policy document on extracranial carotid duplex examination.',
    notes: 'Official clinical consensus across Australia and New Zealand vascular laboratories.'
  },
  {
    category: 'AUSTRALIA',
    organisation: 'Australasian Sonographers Association (ASA)',
    title: 'Carotid Duplex Ultrasound Examination Practice Guideline',
    yearVersion: '2020 (Reviewed 2024)',
    status: 'REFERENCE',
    citation: 'ASA Professional Practice Guidelines for Extracranial Cerebrovascular Imaging.',
    notes: 'Technical and professional practice parameters for accredited sonographers.'
  },

  // United States
  {
    category: 'UNITED_STATES',
    organisation: 'Intersocietal Accreditation Commission (IAC)',
    title: 'Updated Recommendations for Carotid Stenosis Interpretation Criteria',
    yearVersion: '2023',
    status: 'CURRENT',
    citation: 'IAC Vascular Testing: Interpretation Criteria Consensus & Division Standards (2023).',
    notes: 'Establishes the 180 cm/s PSV threshold for 50% stenosis and multi-parameter grading.'
  },
  {
    category: 'UNITED_STATES',
    organisation: 'American College of Radiology (ACR) / AIUM / SRU',
    title: 'ACR–AIUM–SRU Practice Parameter for the Performance of Extracranial Cerebrovascular Duplex Ultrasound',
    yearVersion: 'Revised 2021',
    status: 'CURRENT',
    citation: 'ACR-AIUM-SRU Practice Parameter for Extracranial Cerebrovascular Ultrasound Examinations.',
    notes: 'US Multi-society standard for comprehensive technical acquisition.'
  },
  {
    category: 'UNITED_STATES',
    organisation: 'Society for Vascular Ultrasound (SVU)',
    title: 'Extracranial Cerebrovascular Duplex Ultrasound Performance Guidance',
    yearVersion: '2019 (Affirmed 2023)',
    status: 'REFERENCE',
    citation: 'SVU Professional Performance Guidelines for Carotid and Vertebral Duplex Examinations.',
    notes: 'Laboratory quality benchmarks and Doppler sampling protocols.'
  },

  // Diameter Measurement
  {
    category: 'DIAMETER_MEASUREMENT',
    organisation: 'North American Symptomatic Carotid Endarterectomy Trial (NASCET)',
    title: 'Beneficial Effect of Carotid Endarterectomy in Symptomatic Patients with High-Grade Carotid Stenosis',
    yearVersion: '1991 (Landmark Trial)',
    status: 'CURRENT',
    citation: 'N Engl J Med. 1991;325(7):445-453.',
    notes: 'Standard anatomical diameter reduction calculation method: % Stenosis = (1 - A / B) × 100.'
  },
  {
    category: 'DIAMETER_MEASUREMENT',
    organisation: 'European Carotid Surgery Trial (ECST)',
    title: 'MRC European Carotid Surgery Trial: interim results for symptomatic patients with severe carotid stenosis',
    yearVersion: '1991',
    status: 'LEGACY',
    citation: 'Lancet. 1991;337(8752):1235-1243.',
    notes: 'Historical trial using estimated original bulb diameter C as denominator.'
  },

  // Historical / Alternative
  {
    category: 'HISTORICAL_ALTERNATIVE',
    organisation: 'Society of Radiologists in Ultrasound (SRU)',
    title: 'Carotid Artery Stenosis: Gray-Scale and Doppler US Diagnosis—Consensus Conference',
    yearVersion: '2003',
    status: 'LEGACY',
    citation: 'Radiology. 2003;229(2):340-346.',
    notes: 'Foundational consensus that defined the classic 125/230 cm/s velocity categories.'
  },
  {
    category: 'HISTORICAL_ALTERNATIVE',
    organisation: 'British Society of Echocardiography & Vascular Society of Great Britain and Ireland',
    title: 'Joint Recommendations for Reporting Carotid Ultrasound Investigations in the United Kingdom',
    yearVersion: '2009',
    status: 'REFERENCE',
    citation: 'Eur J Vasc Endovasc Surg. 2009;37(3):251-261.',
    notes: 'UK national standard for velocity and ratio based grading.'
  }
];

export interface SiteOverrideItem {
  key: string;
  label: string;
  universalValue: string;
  siteValue: string;
  isOverridden: boolean;
}

// Detect differences between Universal Core and active site config
export function getSiteOverrides(config: SiteProtocolConfig): SiteOverrideItem[] {
  const overrides: SiteOverrideItem[] = [];

  // Subclavian routine vs conditional
  if (config.subclavianRoutine !== 'conditional') {
    overrides.push({
      key: 'subclavianRoutine',
      label: 'Subclavian Artery Assessment',
      universalValue: 'Conditional',
      siteValue: config.subclavianRoutine === 'routine' ? 'Routine (Every Patient)' : 'Conditional',
      isOverridden: true
    });
  }

  // Vertebral extent
  if (config.vertebralExtent !== 'representative') {
    overrides.push({
      key: 'vertebralExtent',
      label: 'Vertebral Artery Extent',
      universalValue: 'Representative (Mid segment)',
      siteValue: 'Full (Prox, Mid, Distal segments)',
      isOverridden: true
    });
  }

  // CCA extent
  if (config.ccaExtent !== 'prox_mid_dist') {
    overrides.push({
      key: 'ccaExtent',
      label: 'CCA Acquisition Extent',
      universalValue: 'Proximal, Mid & Distal',
      siteValue: 'Proximal & Distal only',
      isOverridden: true
    });
  }

  // IMT
  if (config.imtExtent !== 'conditional') {
    overrides.push({
      key: 'imtExtent',
      label: 'Intima-Media Thickness (IMT)',
      universalValue: 'Conditional / As indicated',
      siteValue: config.imtExtent === 'routine' ? 'Routine Measurement' : 'Not Performed',
      isOverridden: true
    });
  }

  // NASCET B-Mode
  if (config.nascetBModeExtent !== 'conditional') {
    overrides.push({
      key: 'nascetBModeExtent',
      label: 'NASCET Diameter Measurement',
      universalValue: 'Conditional (Visible narrowing)',
      siteValue: config.nascetBModeExtent === 'routine_above_threshold' ? 'Routine for visible stenosis' : 'Not Routine',
      isOverridden: true
    });
  }

  // Special exam type
  if (config.specialExamType !== 'routine_native') {
    overrides.push({
      key: 'specialExamType',
      label: 'Examination Type Protocol',
      universalValue: 'Routine Native Carotid Study',
      siteValue: getSpecialExamTypeName(config.specialExamType),
      isOverridden: true
    });
  }

  return overrides;
}

export function getSpecialExamTypeName(type: SpecialExamType): string {
  switch (type) {
    case 'routine_native': return 'Routine Native Carotid Study';
    case 'post_cea': return 'Post Carotid Endarterectomy (CEA)';
    case 'post_stent': return 'Post Carotid Artery Stent (CAS)';
    case 'subclavian_steal': return 'Suspected Subclavian Steal Assessment';
    case 'known_occlusion': return 'Known Carotid Occlusion Follow-up';
    case 'limited_targeted': return 'Limited / Targeted Carotid Study';
    default: return 'Custom Study';
  }
}

export interface ScanChecklistItem {
  category: 'PRE_SCAN' | 'GRAYSCALE_COLOUR' | 'SPECTRAL_DOPPLER' | 'ABNORMAL_PATHOLOGY';
  id: string;
  label: string;
  requirement: RequirementLevel;
  isComplete: boolean;
  notes?: string;
  side?: 'right' | 'left' | 'both';
}

export interface ScanCompletenessResult {
  totalRequired: number;
  completedRequired: number;
  totalRecommended: number;
  completedRecommended: number;
  percentage: number;
  missingRequired: string[];
  missingRecommended: string[];
  isReadyForReport: boolean;
}

// Generate dynamic checklist from active protocol
export function generateScanChecklist(studyData: StudyData): ScanChecklistItem[] {
  const reqs = studyData.siteProtocol?.segmentRequirements || UNIVERSAL_CORE_DEFAULT_DATASET;
  const items: ScanChecklistItem[] = [];

  // 1. Pre-Scan Items
  items.push({
    category: 'PRE_SCAN',
    id: 'pre_id',
    label: 'Patient Identity Verified (2 Identifiers)',
    requirement: 'required',
    isComplete: !!(studyData.patientName && studyData.patientId),
    notes: studyData.patientName ? `${studyData.patientName} (${studyData.patientId})` : 'Awaiting patient identification'
  });

  items.push({
    category: 'PRE_SCAN',
    id: 'pre_indication',
    label: 'Clinical Indication & Symptomatic Side Reviewed',
    requirement: 'required',
    isComplete: studyData.clinicalIndications.length > 0,
    notes: studyData.clinicalIndications.length > 0 ? studyData.clinicalIndications.join(', ') : 'No indication selected'
  });

  items.push({
    category: 'PRE_SCAN',
    id: 'pre_prior',
    label: 'Previous Imaging / History Checked',
    requirement: 'recommended',
    isComplete: !!studyData.priorExam?.hasPriorExam || !!studyData.vascularHistory,
    notes: studyData.priorExam?.hasPriorExam ? `Prior study dated ${studyData.priorExam.examDate || 'on file'}` : 'No prior study attached'
  });

  // 2. Grayscale & Colour
  const rightIcaHasSample = !!(studyData.segments['r_ica_prox']?.psv || studyData.segments['r_ica_prox']?.flowDirection);
  const leftIcaHasSample = !!(studyData.segments['l_ica_prox']?.psv || studyData.segments['l_ica_prox']?.flowDirection);
  const rightCcaHasSample = !!(studyData.segments['r_cca_dist']?.psv || studyData.segments['r_cca_dist']?.flowDirection);
  const leftCcaHasSample = !!(studyData.segments['l_cca_dist']?.psv || studyData.segments['l_cca_dist']?.flowDirection);

  items.push({
    category: 'GRAYSCALE_COLOUR',
    id: 'bmode_cca',
    label: 'Bilateral CCA B-Mode & Colour Sweeps',
    requirement: 'required',
    isComplete: rightCcaHasSample && leftCcaHasSample,
    side: 'both'
  });

  items.push({
    category: 'GRAYSCALE_COLOUR',
    id: 'bmode_bulb',
    label: 'Bilateral Carotid Bifurcation & Bulb Geometry',
    requirement: 'required',
    isComplete: !!(studyData.segments['r_bulb']?.psv || studyData.segments['r_bulb']?.plaquePresent) &&
                !!(studyData.segments['l_bulb']?.psv || studyData.segments['l_bulb']?.plaquePresent),
    side: 'both'
  });

  items.push({
    category: 'GRAYSCALE_COLOUR',
    id: 'bmode_ica',
    label: 'Bilateral ICA Longitudinal & Transverse Views',
    requirement: 'required',
    isComplete: rightIcaHasSample && leftIcaHasSample,
    side: 'both'
  });

  items.push({
    category: 'GRAYSCALE_COLOUR',
    id: 'bmode_eca',
    label: 'Bilateral ECA Patency & Branch Confirmation',
    requirement: 'recommended',
    isComplete: !!(studyData.segments['r_eca_prox']?.psv) && !!(studyData.segments['l_eca_prox']?.psv),
    side: 'both'
  });

  // 3. Spectral Doppler Segments based on active config
  const spectralSegmentsToCheck = [
    { id: 'r_cca_prox', label: 'Right Proximal CCA' },
    { id: 'r_cca_mid', label: 'Right Mid CCA' },
    { id: 'r_cca_dist', label: 'Right Distal CCA (Reference Denominator)' },
    { id: 'r_bulb', label: 'Right Carotid Bulb' },
    { id: 'r_ica_prox', label: 'Right Proximal ICA (Peak Velocity Zone)' },
    { id: 'r_ica_mid', label: 'Right Mid ICA' },
    { id: 'r_ica_dist', label: 'Right Distal ICA' },
    { id: 'r_eca_prox', label: 'Right Proximal ECA' },
    { id: 'r_vert_mid', label: 'Right Vertebral Artery (Direction/Waveform)' },
    { id: 'r_subcl_prox', label: 'Right Subclavian Artery' },

    { id: 'l_cca_prox', label: 'Left Proximal CCA' },
    { id: 'l_cca_mid', label: 'Left Mid CCA' },
    { id: 'l_cca_dist', label: 'Left Distal CCA (Reference Denominator)' },
    { id: 'l_bulb', label: 'Left Carotid Bulb' },
    { id: 'l_ica_prox', label: 'Left Proximal ICA (Peak Velocity Zone)' },
    { id: 'l_ica_mid', label: 'Left Mid ICA' },
    { id: 'l_ica_dist', label: 'Left Distal ICA' },
    { id: 'l_eca_prox', label: 'Left Proximal ECA' },
    { id: 'l_vert_mid', label: 'Left Vertebral Artery (Direction/Waveform)' },
    { id: 'l_subcl_prox', label: 'Left Subclavian Artery' },
  ];

  for (const seg of spectralSegmentsToCheck) {
    const level: RequirementLevel = reqs[seg.id] || 'recommended';
    if (level === 'not_performed') continue;

    const data = studyData.segments[seg.id];
    const isComplete = !!(data && (data.psv !== null || data.flowDirection === 'absent' || data.flowDirection === 'not_assessed'));

    items.push({
      category: 'SPECTRAL_DOPPLER',
      id: `spectral_${seg.id}`,
      label: seg.label,
      requirement: level,
      isComplete,
      notes: data?.psv ? `PSV: ${data.psv} cm/s, EDV: ${data.edv ?? '-'} cm/s` : (data?.flowDirection === 'absent' ? 'Flow Absent' : 'Pending acquisition')
    });
  }

  // 4. Abnormal Pathology / Quality Verification
  const anyPlaque = studyData.plaques.length > 0 || Object.values(studyData.segments).some(s => s.plaquePresent);
  const anyStenosis = Object.values(studyData.segments).some(s => s.stenosisPresent || (s.psv && s.psv >= 125));

  items.push({
    category: 'ABNORMAL_PATHOLOGY',
    id: 'abn_plaque_morphology',
    label: 'Plaque Morphology & Characteristics Documented',
    requirement: anyPlaque ? 'required' : 'optional',
    isComplete: !anyPlaque || studyData.plaques.length > 0,
    notes: anyPlaque ? `${studyData.plaques.length} plaque profiles defined` : 'No plaque present'
  });

  items.push({
    category: 'ABNORMAL_PATHOLOGY',
    id: 'abn_nascet_measurement',
    label: 'NASCET Caliper Diameter Reduction (if focal stenosis present)',
    requirement: anyStenosis ? 'conditional' : 'optional',
    isComplete: (studyData.nascet.right.longitudinal.calculatedStenosis !== null || studyData.nascet.left.longitudinal.calculatedStenosis !== null) || !anyStenosis,
    notes: 'Supportive diameter calculation'
  });

  items.push({
    category: 'ABNORMAL_PATHOLOGY',
    id: 'abn_vertebral_direction',
    label: 'Vertebral Flow Direction & Steal Screening Confirmed',
    requirement: 'required',
    isComplete: !!(studyData.segments['r_vert_mid']?.flowDirection && studyData.segments['l_vert_mid']?.flowDirection),
    notes: `R: ${studyData.segments['r_vert_mid']?.flowDirection || 'Pending'}, L: ${studyData.segments['l_vert_mid']?.flowDirection || 'Pending'}`
  });

  return items;
}

// Calculate completeness score
export function calculateScanCompleteness(studyData: StudyData): ScanCompletenessResult {
  const checklist = generateScanChecklist(studyData);
  
  const requiredItems = checklist.filter(i => i.requirement === 'required');
  const recommendedItems = checklist.filter(i => i.requirement === 'recommended');

  const completedRequired = requiredItems.filter(i => i.isComplete).length;
  const completedRecommended = recommendedItems.filter(i => i.isComplete).length;

  const totalRequired = requiredItems.length;
  const totalRecommended = recommendedItems.length;

  // Weight required as 80%, recommended as 20%
  let score = 100;
  if (totalRequired > 0 || totalRecommended > 0) {
    const reqPart = totalRequired > 0 ? (completedRequired / totalRequired) * 80 : 80;
    const recPart = totalRecommended > 0 ? (completedRecommended / totalRecommended) * 20 : 20;
    score = Math.round(reqPart + recPart);
  }

  const missingRequired = requiredItems.filter(i => !i.isComplete).map(i => i.label);
  const missingRecommended = recommendedItems.filter(i => !i.isComplete).map(i => i.label);

  return {
    totalRequired,
    completedRequired,
    totalRecommended,
    completedRecommended,
    percentage: score,
    missingRequired,
    missingRecommended,
    isReadyForReport: missingRequired.length === 0
  };
}
