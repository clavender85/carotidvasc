import {
  StudyData,
  SiteProtocolConfig,
  PriorExamData,
  AnatomyVariantState,
  ClassificationSystem,
  ProtocolRequirement,
  ProtocolRequirementLevel,
  ProtocolRequirementCategory,
  ProtocolOverride,
  ProtocolContext,
  DynamicProtocolRule,
  DynamicProtocolResult,
  DynamicProtocolEvaluation,
  RuleSeverity,
  SegmentData,
  Side
} from '../types';
import { SEGMENTS_META } from '../constants';
import { getVertebralParent, getVesselParent } from './anatomyVariants';
import { calculateIcaCcaRatio, suggestIcaStenosisCategory } from './calculations';
import { evaluateVertebralRules } from '../rules/vertebralRules';

export { evaluateVertebralRules };

export type DynamicProtocolContext = ProtocolContext;

// 1. Catalog of Dynamic Rules for transparency and Protocol tab inspection
export const DYNAMIC_RULES_CATALOG: DynamicProtocolRule[] = [
  {
    id: 'rule_baseline_acquisition',
    name: 'Standard Baseline Extracranial Acquisition',
    description: 'Mandates standard bilateral carotid, vertebral and reference Doppler sampling based on active regional and site protocol presets.',
    priority: 10,
    category: 'baseline',
    severity: 'blocking',
    enabled: true,
    source: 'universal',
    ifCondition: 'Standard native extracranial cerebrovascular study initialized',
    thenAction: 'Enforce bilateral CCA, Bulb, ICA, ECA, Vertebral, and conditional Subclavian assessment'
  },
  {
    id: 'rule_vertebral_steal_subclavian_workup',
    name: 'Vertebral Abnormal Flow / Steal Parent Vessel Workup',
    description: 'When vertebral waveform demonstrates pre-steal (bunny), bidirectional, or retrograde flow, checks parent anatomy and dynamically requires ipsilateral subclavian assessment.',
    priority: 100,
    category: 'subclavian',
    severity: 'blocking',
    enabled: true,
    source: 'universal',
    ifCondition: 'Vertebral waveform = bunny / pre-steal, bidirectional, or retrograde flow AND parent vessel = subclavian',
    thenAction: 'Dynamically mandate ipsilateral Subclavian artery waveform, PSV, and focal stenosis assessment'
  },
  {
    id: 'rule_vertebral_arch_origin_advisory',
    name: 'Anatomy-Aware Vertebral Arch Origin Advisory',
    description: 'If abnormal vertebral waveform is detected in a patient with direct aortic arch origin (left vertebral from arch), issues targeted advisory instead of subclavian steal assumption.',
    priority: 95,
    category: 'vertebral',
    severity: 'warning',
    enabled: true,
    source: 'anatomy',
    ifCondition: 'Abnormal Left Vertebral waveform AND archVariant = left_vertebral_from_arch',
    thenAction: 'Issue anatomical advisory: Origin is aortic arch; evaluate proximal arch origin without assuming subclavian steal'
  },
  {
    id: 'rule_elevated_ica_velocity_secondary_params',
    name: 'Elevated ICA Velocity & Multi-Parameter Stenosis Workup',
    description: 'When ICA peak systolic velocity reaches or exceeds active consensus criteria thresholds (ASUM ≥125 cm/s, IAC ≥180 cm/s), mandates secondary parameters before classification confirmation.',
    priority: 80,
    category: 'stenosis',
    severity: 'blocking',
    enabled: true,
    source: 'regional',
    ifCondition: 'Highest ICA PSV reaches stenosis criteria threshold for active system',
    thenAction: 'Require ICA EDV, valid Distal CCA reference & ICA/CCA ratio, plaque documentation, and distal ICA waveform'
  },
  {
    id: 'rule_unreliable_cca_reference',
    name: 'Unreliable CCA Reference Denominator Safeguard',
    description: 'Detects stenosis, heavy disease, abnormal waveform, or extreme velocities in the distal CCA denominator, requiring alternative reference selection or ratio limitation acknowledgement.',
    priority: 75,
    category: 'carotid',
    severity: 'warning',
    enabled: true,
    source: 'universal',
    ifCondition: 'Distal CCA has stenosis, plaque, abnormal waveform, or PSV < 30 / > 120 cm/s',
    thenAction: 'Prompt alternative reference selection (Mid CCA / Prox CCA) or flag ratio as unreliable'
  },
  {
    id: 'rule_plaque_characterisation',
    name: 'Mandatory Plaque Morphology Characterisation',
    description: 'When atherosclerotic plaque is documented on any carotid or vertebral segment, requires structured morphological descriptors (location, extent, composition, surface, calcification).',
    priority: 60,
    category: 'plaque',
    severity: 'blocking',
    enabled: true,
    source: 'universal',
    ifCondition: 'Plaque present on any segment = true or Plaque object defined',
    thenAction: 'Require complete plaque profile: composition, surface, calcific shadowing, and maximal narrowing site'
  },
  {
    id: 'rule_focal_stenosis_three_point',
    name: 'Focal Stenosis 3-Point Hemodynamic Assessment',
    description: 'Requires pre-stenotic, intrastenotic peak, and post-stenotic flow disturbance sampling when focal arterial stenosis is identified.',
    priority: 70,
    category: 'stenosis',
    severity: 'recommendation',
    enabled: true,
    source: 'universal',
    ifCondition: 'Focal stenosis marked present on any arterial segment',
    thenAction: 'Recommend 3-point hemodynamics: pre-stenosis velocity, peak stenosis velocity, post-stenosis turbulence'
  },
  {
    id: 'rule_suspected_near_occlusion',
    name: 'Suspected Near Occlusion Low-Flow Protocol',
    description: 'Activates specialized low-flow assessment pathway when severe narrowing, string-sign, or collapsed distal calibre is identified, advising against inappropriate NASCET calculation.',
    priority: 90,
    category: 'occlusion',
    severity: 'blocking',
    enabled: true,
    source: 'regional',
    ifCondition: 'Severe stenosis with collapsed distal ICA, string-sign, or near-occlusion suspected',
    thenAction: 'Enforce low-scale colour/power Doppler confirmation; warn against standard NASCET diameter ratio'
  },
  {
    id: 'rule_suspected_total_occlusion',
    name: 'Suspected Total Occlusion Multi-Modality Confirmation',
    description: 'When zero flow or preocclusive thumping waveform is detected in the ICA, mandates multi-modality confirmation with low PRF colour and power Doppler before confirming occlusion.',
    priority: 95,
    category: 'occlusion',
    severity: 'blocking',
    enabled: true,
    source: 'universal',
    ifCondition: 'ICA segment flow marked absent or "thump / preocclusive" waveform',
    thenAction: 'Require confirmation with low PRF colour Doppler, power Doppler, and B-mode stump evaluation'
  },
  {
    id: 'rule_cardiac_arrhythmia_averaging',
    name: 'Cardiac Arrhythmia Velocity Averaging & Representative Beats',
    description: 'When atrial fibrillation or irregular cardiac rhythm is documented in indications, prompts multi-cycle averaging and advisory on single-beat velocity variability.',
    priority: 40,
    category: 'carotid',
    severity: 'warning',
    enabled: true,
    source: 'universal',
    ifCondition: 'Clinical indications include arrhythmia, atrial fibrillation, or irregular rhythm',
    thenAction: 'Prompt averaging of ≥3-5 consecutive cardiac cycles and caution on post-extrasystolic potentiation'
  },
  {
    id: 'rule_high_bifurcation_visualization',
    name: 'High Bifurcation Mandibular Shadowing Advisory',
    description: 'When high carotid bifurcation variant is present, guides acoustic window optimization and flags anticipated distal ICA shadowing limitations.',
    priority: 30,
    category: 'technical',
    severity: 'information',
    enabled: true,
    source: 'anatomy',
    ifCondition: 'Anatomy variant bifurcation = high (C2-C3 or mandibular angle)',
    thenAction: 'Provide acoustic guidance for submandibular / retromandibular approach and technical exception option'
  },
  {
    id: 'rule_prior_abnormality_comparison_target',
    name: 'Prior Exam Hemodynamic Delta Target Tracking',
    description: 'When previous examination is loaded with significant prior stenosis, sets mandatory comparative targets to evaluate disease progression or stability.',
    priority: 50,
    category: 'comparison',
    severity: 'recommendation',
    enabled: true,
    source: 'site',
    ifCondition: 'Prior examination on file with prior ICA PSV ≥ 125 cm/s or documented stenosis',
    thenAction: 'Require explicit comparison note and track PSV / ratio delta against index examination'
  },
  {
    id: 'rule_post_stent_surveillance_protocol',
    name: 'Post-Carotid Stent Surveillance Protocol',
    description: 'When exam is marked post-stent, enforces in-stent velocity sampling, native transition zones, and alerts to elevated baseline stent velocities.',
    priority: 85,
    category: 'post_intervention',
    severity: 'blocking',
    enabled: true,
    source: 'regional',
    ifCondition: 'Special exam type = post_stent or patient history includes CAS (Carotid Artery Stenting)',
    thenAction: 'Enforce proximal stent, mid stent, distal stent sampling and apply stented velocity criteria'
  },
  {
    id: 'rule_post_cea_protocol',
    name: 'Post-Carotid Endarterectomy (CEA) Surveillance Protocol',
    description: 'When exam is marked post-CEA, enforces surgical patch zone and transition velocity sampling.',
    priority: 85,
    category: 'post_intervention',
    severity: 'blocking',
    enabled: true,
    source: 'regional',
    ifCondition: 'Special exam type = post_cea or patient history includes CEA',
    thenAction: 'Enforce surgical transition zone and patch inspection'
  },
  {
    id: 'rule_tardus_parvus_proximal_inflow',
    name: 'Tardus-Parvus Proximal Inflow Disease Review',
    description: 'When a tardus-parvus waveform (prolonged systolic acceleration time, rounded/blunted peak) is detected, mandates ipsilateral proximal inflow and aortic arch review.',
    priority: 85,
    category: 'carotid',
    severity: 'blocking',
    enabled: true,
    source: 'universal',
    ifCondition: 'Waveform on any carotid or vertebral segment = Tardus-parvus',
    thenAction: 'Trigger mandatory proximal origin/inflow interrogation for upstream flow-limiting lesion'
  },
  {
    id: 'rule_damped_waveform_review',
    name: 'Damped Waveform Hemodynamic Correlation',
    description: 'When a damped waveform is documented, recommends correlation with proximal origin or systemic cardiac output.',
    priority: 45,
    category: 'carotid',
    severity: 'recommendation',
    enabled: true,
    source: 'universal',
    ifCondition: 'Waveform on any segment = Damped',
    thenAction: 'Recommend proximal inflow correlation and cardiac status review'
  }
];

// Helper: Check if segment has sufficient data entered
export function isSegmentAssessed(segment?: SegmentData): boolean {
  if (!segment) return false;
  if (segment.flowDirection === 'absent') return true;
  if (segment.flowDirection === 'not_assessed') return false;
  return segment.psv !== null || segment.waveform !== 'Not assessed';
}

// Helper: Check if vertebral waveform indicates steal / pre-steal
export function isVertebralWaveformSteal(segment?: SegmentData): boolean {
  if (!segment) return false;
  const wf = (segment.waveform || '').toLowerCase();
  const char = segment.vertebralWaveformCharacter;

  if (
    char === 'bunny_pre_steal' ||
    char === 'early_systolic_deceleration' ||
    char === 'bidirectional_partial_steal' ||
    char === 'complete_reversal'
  ) {
    return true;
  }

  if (
    segment.flowDirection === 'bidirectional' ||
    segment.flowDirection === 'retrograde'
  ) {
    return true;
  }

  return (
    wf.includes('bunny') ||
    wf.includes('pre-steal') ||
    wf.includes('deceleration') ||
    wf.includes('bidirectional') ||
    wf.includes('retrograde') ||
    wf.includes('reversal') ||
    wf.includes('tardus')
  );
}

// Helper: Get stenosis threshold PSV for current active criteria
export function getStenosisThresholdPsv(criteria: ClassificationSystem): number {
  switch (criteria) {
    case 'IAC_MODIFIED_SRU_2023':
    case 'MODIFIED_SRU_2021':
      return 180;
    case 'ASUM_2021':
    case 'SRU_2003':
    case 'UK_JOINT':
    case 'NASCET_INDEX':
    default:
      return 125;
  }
}

// Helper: Check if requirement has valid technical override
export function hasValidOverride(requirement: ProtocolRequirement, context: ProtocolContext): boolean {
  const overrides = context.study.technicalOverrides || {};
  if (overrides[requirement.id]) return true;
  if (requirement.targetSegmentId && overrides[requirement.targetSegmentId]) return true;
  if (requirement.vesselId && overrides[requirement.vesselId]) return true;
  return false;
}

// Helper: Deduplicate requirements by ID
export function deduplicateRequirements(requirements: ProtocolRequirement[]): ProtocolRequirement[] {
  const seen = new Map<string, ProtocolRequirement>();
  for (const req of requirements) {
    if (!seen.has(req.id)) {
      seen.set(req.id, req);
    }
  }
  return Array.from(seen.values());
}

// -------------------------------------------------------------------
// MODULAR RULE EVALUATION FUNCTIONS
// -------------------------------------------------------------------

export function buildBaselineRequirements(context: ProtocolContext): ProtocolRequirement[] {
  const { study, activeProtocol } = context;
  const baselineRequirements: ProtocolRequirement[] = [];
  const overrides = study.technicalOverrides || {};

  // Bilateral Distal CCA (Critical reference denominator)
  baselineRequirements.push({
    id: 'base_r_cca_dist',
    label: 'Right Distal CCA (Reference Denominator)',
    category: 'baseline',
    side: 'right',
    targetSegmentId: 'r_cca_dist',
    vesselId: 'r_cca_dist',
    targetModule: 'segment',
    level: 'required',
    blocking: true,
    allowTechnicalOverride: true,
    reason: 'Standard baseline ICA/CCA ratio denominator and inflow assessment',
    sourceRuleId: 'rule_baseline_acquisition',
    satisfied: !!(overrides['base_r_cca_dist'] || overrides['r_cca_dist'] || isSegmentAssessed(study.segments['r_cca_dist'])),
    satisfactionNote: overrides['base_r_cca_dist']
      ? `Technical exception: ${overrides['base_r_cca_dist'].reason}`
      : undefined
  });

  baselineRequirements.push({
    id: 'base_l_cca_dist',
    label: 'Left Distal CCA (Reference Denominator)',
    category: 'baseline',
    side: 'left',
    targetSegmentId: 'l_cca_dist',
    vesselId: 'l_cca_dist',
    targetModule: 'segment',
    level: 'required',
    blocking: true,
    allowTechnicalOverride: true,
    reason: 'Standard baseline ICA/CCA ratio denominator and inflow assessment',
    sourceRuleId: 'rule_baseline_acquisition',
    satisfied: !!(overrides['base_l_cca_dist'] || overrides['l_cca_dist'] || isSegmentAssessed(study.segments['l_cca_dist'])),
    satisfactionNote: overrides['base_l_cca_dist']
      ? `Technical exception: ${overrides['base_l_cca_dist'].reason}`
      : undefined
  });

  // Bilateral Proximal / Mid CCA based on site configuration
  if (activeProtocol.ccaExtent === 'prox_mid_dist') {
    baselineRequirements.push({
      id: 'base_r_cca_prox',
      label: 'Right Proximal CCA',
      category: 'baseline',
      side: 'right',
      targetSegmentId: 'r_cca_prox',
      vesselId: 'r_cca_prox',
      targetModule: 'segment',
      level: 'recommended',
      blocking: false,
      allowTechnicalOverride: true,
      reason: 'Site protocol: Proximal CCA routine baseline sampling',
      sourceRuleId: 'rule_baseline_acquisition',
      satisfied: !!(overrides['base_r_cca_prox'] || isSegmentAssessed(study.segments['r_cca_prox']))
    });
    baselineRequirements.push({
      id: 'base_l_cca_prox',
      label: 'Left Proximal CCA',
      category: 'baseline',
      side: 'left',
      targetSegmentId: 'l_cca_prox',
      vesselId: 'l_cca_prox',
      targetModule: 'segment',
      level: 'recommended',
      blocking: false,
      allowTechnicalOverride: true,
      reason: 'Site protocol: Proximal CCA routine baseline sampling',
      sourceRuleId: 'rule_baseline_acquisition',
      satisfied: !!(overrides['base_l_cca_prox'] || isSegmentAssessed(study.segments['l_cca_prox']))
    });
  }

  // Bilateral Bulb
  baselineRequirements.push({
    id: 'base_r_bulb',
    label: 'Right Carotid Bulb (Flow separation / Plaque screening)',
    category: 'baseline',
    side: 'right',
    targetSegmentId: 'r_bulb',
    vesselId: 'r_bulb',
    targetModule: 'segment',
    level: 'required',
    blocking: true,
    allowTechnicalOverride: true,
    reason: 'Carotid bulb geometry & boundary flow separation check',
    sourceRuleId: 'rule_baseline_acquisition',
    satisfied: !!(overrides['base_r_bulb'] || overrides['r_bulb'] || (study.segments['r_bulb']?.psv !== null || study.segments['r_bulb']?.plaquePresent || study.segments['r_bulb']?.waveform !== 'Not assessed'))
  });

  baselineRequirements.push({
    id: 'base_l_bulb',
    label: 'Left Carotid Bulb (Flow separation / Plaque screening)',
    category: 'baseline',
    side: 'left',
    targetSegmentId: 'l_bulb',
    vesselId: 'l_bulb',
    targetModule: 'segment',
    level: 'required',
    blocking: true,
    allowTechnicalOverride: true,
    reason: 'Carotid bulb geometry & boundary flow separation check',
    sourceRuleId: 'rule_baseline_acquisition',
    satisfied: !!(overrides['base_l_bulb'] || overrides['l_bulb'] || (study.segments['l_bulb']?.psv !== null || study.segments['l_bulb']?.plaquePresent || study.segments['l_bulb']?.waveform !== 'Not assessed'))
  });

  // Bilateral Proximal ICA
  baselineRequirements.push({
    id: 'base_r_ica_prox',
    label: 'Right Proximal ICA Spectral Doppler',
    category: 'baseline',
    side: 'right',
    targetSegmentId: 'r_ica_prox',
    vesselId: 'r_ica_prox',
    targetModule: 'segment',
    level: 'required',
    blocking: true,
    allowTechnicalOverride: true,
    reason: 'Peak velocity zone and baseline internal carotid assessment',
    sourceRuleId: 'rule_baseline_acquisition',
    satisfied: !!(overrides['base_r_ica_prox'] || overrides['r_ica_prox'] || isSegmentAssessed(study.segments['r_ica_prox']))
  });

  baselineRequirements.push({
    id: 'base_l_ica_prox',
    label: 'Left Proximal ICA Spectral Doppler',
    category: 'baseline',
    side: 'left',
    targetSegmentId: 'l_ica_prox',
    vesselId: 'l_ica_prox',
    targetModule: 'segment',
    level: 'required',
    blocking: true,
    allowTechnicalOverride: true,
    reason: 'Peak velocity zone and baseline internal carotid assessment',
    sourceRuleId: 'rule_baseline_acquisition',
    satisfied: !!(overrides['base_l_ica_prox'] || overrides['l_ica_prox'] || isSegmentAssessed(study.segments['l_ica_prox']))
  });

  // Bilateral ECA Proximal
  baselineRequirements.push({
    id: 'base_r_eca_prox',
    label: 'Right Proximal ECA (Branch patency / High-resistance)',
    category: 'baseline',
    side: 'right',
    targetSegmentId: 'r_eca_prox',
    vesselId: 'r_eca_prox',
    targetModule: 'segment',
    level: 'recommended',
    blocking: false,
    allowTechnicalOverride: true,
    reason: 'External carotid patency and high-resistance branch confirmation',
    sourceRuleId: 'rule_baseline_acquisition',
    satisfied: !!(overrides['base_r_eca_prox'] || isSegmentAssessed(study.segments['r_eca_prox']))
  });

  baselineRequirements.push({
    id: 'base_l_eca_prox',
    label: 'Left Proximal ECA (Branch patency / High-resistance)',
    category: 'baseline',
    side: 'left',
    targetSegmentId: 'l_eca_prox',
    vesselId: 'l_eca_prox',
    targetModule: 'segment',
    level: 'recommended',
    blocking: false,
    allowTechnicalOverride: true,
    reason: 'External carotid patency and high-resistance branch confirmation',
    sourceRuleId: 'rule_baseline_acquisition',
    satisfied: !!(overrides['base_l_eca_prox'] || isSegmentAssessed(study.segments['l_eca_prox']))
  });

  // Bilateral Vertebral Mid (Flow Direction & Waveform)
  baselineRequirements.push({
    id: 'base_r_vert_mid',
    label: 'Right Vertebral Artery Waveform & Flow Direction',
    category: 'baseline',
    side: 'right',
    targetSegmentId: 'r_vert_mid',
    vesselId: 'r_vert_mid',
    targetModule: 'segment',
    level: 'required',
    blocking: true,
    allowTechnicalOverride: true,
    reason: 'Vertebral flow direction and baseline waveform morphology',
    sourceRuleId: 'rule_baseline_acquisition',
    satisfied: !!(
      overrides['base_r_vert_mid'] ||
      overrides['r_vert_mid'] ||
      (study.segments['r_vert_mid']?.flowDirection && study.segments['r_vert_mid'].flowDirection !== 'not_assessed')
    )
  });

  baselineRequirements.push({
    id: 'base_l_vert_mid',
    label: 'Left Vertebral Artery Waveform & Flow Direction',
    category: 'baseline',
    side: 'left',
    targetSegmentId: 'l_vert_mid',
    vesselId: 'l_vert_mid',
    targetModule: 'segment',
    level: 'required',
    blocking: true,
    allowTechnicalOverride: true,
    reason: 'Vertebral flow direction and baseline waveform morphology',
    sourceRuleId: 'rule_baseline_acquisition',
    satisfied: !!(
      overrides['base_l_vert_mid'] ||
      overrides['l_vert_mid'] ||
      (study.segments['l_vert_mid']?.flowDirection && study.segments['l_vert_mid'].flowDirection !== 'not_assessed')
    )
  });

  // Subclavian: Routine vs Conditional based on active site protocol
  if (activeProtocol.subclavianRoutine === 'routine') {
    baselineRequirements.push({
      id: 'base_r_subcl_routine',
      label: 'Right Subclavian Artery (Site Routine Protocol)',
      category: 'baseline',
      side: 'right',
      targetSegmentId: 'r_subcl_prox',
      vesselId: 'r_subcl_prox',
      targetModule: 'segment',
      level: 'required',
      blocking: true,
      allowTechnicalOverride: true,
      reason: 'Site protocol: Subclavian assessment configured as routine for all patients',
      sourceRuleId: 'rule_baseline_acquisition',
      satisfied: !!(overrides['base_r_subcl_routine'] || isSegmentAssessed(study.segments['r_subcl_prox']))
    });

    baselineRequirements.push({
      id: 'base_l_subcl_routine',
      label: 'Left Subclavian Artery (Site Routine Protocol)',
      category: 'baseline',
      side: 'left',
      targetSegmentId: 'l_subcl_prox',
      vesselId: 'l_subcl_prox',
      targetModule: 'segment',
      level: 'required',
      blocking: true,
      allowTechnicalOverride: true,
      reason: 'Site protocol: Subclavian assessment configured as routine for all patients',
      sourceRuleId: 'rule_baseline_acquisition',
      satisfied: !!(overrides['base_l_subcl_routine'] || isSegmentAssessed(study.segments['l_subcl_prox']))
    });
  }

  return baselineRequirements;
}

export function evaluateIcaRules(context: ProtocolContext): ProtocolRequirement[] {
  const { study, criteria } = context;
  const requirements: ProtocolRequirement[] = [];
  const overrides = study.technicalOverrides || {};
  const sides: Side[] = ['right', 'left'];
  const thresholdPsv = getStenosisThresholdPsv(criteria);

  for (const side of sides) {
    const prefix = side === 'right' ? 'r' : 'l';
    const sideCap = side.charAt(0).toUpperCase() + side.slice(1);

    const icaProx = study.segments[`${prefix}_ica_prox`];
    const icaMid = study.segments[`${prefix}_ica_mid`];
    const icaDist = study.segments[`${prefix}_ica_dist`];

    const icaPsvs = [icaProx?.psv, icaMid?.psv, icaDist?.psv].filter((p): p is number => p !== null && p !== undefined);
    const maxIcaPsv = icaPsvs.length > 0 ? Math.max(...icaPsvs) : 0;

    const meetsThreshold = maxIcaPsv >= thresholdPsv;
    const isReportedStenosis = !!(
      (icaProx?.stenosisPresent) ||
      (icaMid?.stenosisPresent) ||
      (icaDist?.stenosisPresent)
    );

    if (meetsThreshold || isReportedStenosis) {
      const icaEdvEntered = (icaProx?.edv !== null && icaProx?.edv !== undefined) || (icaMid?.edv !== null && icaMid?.edv !== undefined);

      requirements.push({
        id: `dyn_${side}_ica_edv`,
        label: `${sideCap} ICA End-Diastolic Velocity (EDV)`,
        category: 'stenosis',
        side,
        vesselId: `${prefix}_ica_prox`,
        targetSegmentId: `${prefix}_ica_prox`,
        targetModule: 'segment',
        level: 'required',
        blocking: true,
        allowTechnicalOverride: true,
        reason: `${sideCap} ICA PSV is elevated (${maxIcaPsv} cm/s ≥ threshold ${thresholdPsv} cm/s). EDV is required for secondary consensus grading.`,
        triggeredBy: `${sideCap} ICA Velocity ≥ ${thresholdPsv} cm/s`,
        sourceRuleId: 'rule_elevated_ica_velocity_secondary_params',
        satisfied: !!(overrides[`dyn_${side}_ica_edv`] || overrides[`${prefix}_ica_prox`] || icaEdvEntered)
      });

      const ccaSegment = study.segments[`${prefix}_cca_dist`] || study.segments[`${prefix}_cca_mid`];
      const ccaPsv = ccaSegment?.psv;
      const ratioCalculated = ccaPsv && ccaPsv > 0 && maxIcaPsv > 0;

      requirements.push({
        id: `dyn_${side}_ica_cca_ratio`,
        label: `${sideCap} ICA/CCA Peak Systolic Velocity Ratio`,
        category: 'stenosis',
        side,
        vesselId: `${prefix}_ica_prox`,
        targetSegmentId: `${prefix}_ica_prox`,
        targetModule: 'ratio',
        level: 'required',
        blocking: true,
        allowTechnicalOverride: true,
        reason: `ICA/CCA Ratio is a mandatory secondary parameter for ${sideCap} ICA stenosis quantification under ${criteria.replace(/_/g, ' ')}.`,
        triggeredBy: `${sideCap} ICA Stenosis Workup`,
        sourceRuleId: 'rule_elevated_ica_velocity_secondary_params',
        satisfied: !!(overrides[`dyn_${side}_ica_cca_ratio`] || ratioCalculated)
      });

      const plaqueAssessed = study.plaques.some(p => (p.segments || []).some(s => s.startsWith(prefix))) || [icaProx, icaMid, icaDist].some(s => s?.plaquePresent !== undefined);

      requirements.push({
        id: `dyn_${side}_ica_plaque_characterisation`,
        label: `${sideCap} ICA Atherosclerotic Plaque Morphology & Extent`,
        category: 'plaque',
        side,
        vesselId: `${prefix}_ica_prox`,
        targetSegmentId: `${prefix}_ica_prox`,
        targetModule: 'plaque',
        level: 'recommended',
        blocking: false,
        allowTechnicalOverride: true,
        reason: 'Document plaque composition, surface regularity, and acoustic shadowing when stenosis is present.',
        triggeredBy: `${sideCap} ICA Velocity Elevation`,
        sourceRuleId: 'rule_elevated_ica_velocity_secondary_params',
        satisfied: !!(overrides[`dyn_${side}_ica_plaque_characterisation`] || plaqueAssessed)
      });

      const distalAssessed = isSegmentAssessed(icaDist);
      requirements.push({
        id: `dyn_${side}_distal_ica_waveform`,
        label: `Assess ${sideCap} Distal ICA for Post-Stenotic Flow / Reconstitution`,
        category: 'stenosis',
        side,
        vesselId: `${prefix}_ica_dist`,
        targetSegmentId: `${prefix}_ica_dist`,
        targetModule: 'segment',
        level: 'recommended',
        blocking: false,
        allowTechnicalOverride: true,
        reason: 'Document distal ICA waveform to verify post-stenotic flow disturbance or distal lumen reconstitution.',
        triggeredBy: `${sideCap} ICA Stenosis Workup`,
        sourceRuleId: 'rule_elevated_ica_velocity_secondary_params',
        satisfied: !!(overrides[`dyn_${side}_distal_ica_waveform`] || distalAssessed)
      });
    }
  }

  return requirements;
}

export function evaluatePlaqueRules(context: ProtocolContext): ProtocolRequirement[] {
  const { study } = context;
  const requirements: ProtocolRequirement[] = [];
  const overrides = study.technicalOverrides || {};

  const anyPlaquePresent = study.plaques.length > 0 || Object.values(study.segments).some(s => s.plaquePresent);
  if (anyPlaquePresent) {
    const plaquesWithSurface = study.plaques.filter(p => p.surface && p.surface !== 'indeterminate').length;
    const plaquesWithComp = study.plaques.filter(p => p.composition).length;
    const isPlaqueComplete = study.plaques.length > 0 && plaquesWithSurface === study.plaques.length && plaquesWithComp === study.plaques.length;

    requirements.push({
      id: 'dyn_plaque_characterisation',
      label: 'Plaque Morphology Details (Composition & Surface)',
      category: 'plaque',
      side: 'bilateral',
      targetModule: 'plaque',
      level: 'recommended',
      blocking: false,
      allowTechnicalOverride: true,
      reason: 'Plaque identified on scan. Register composition, surface regularity, and calcific shadowing in Plaque Register.',
      triggeredBy: 'Plaque Identified on Grayscale Sweep',
      sourceRuleId: 'rule_plaque_characterisation',
      satisfied: !!(overrides['dyn_plaque_characterisation'] || isPlaqueComplete || study.plaques.length > 0)
    });
  }

  return requirements;
}

export function evaluateCcaReferenceRules(context: ProtocolContext): ProtocolRequirement[] {
  // CCA reference rules generate warnings and advisory checks
  return [];
}

export function evaluateOcclusionRules(context: ProtocolContext): ProtocolRequirement[] {
  const { study } = context;
  const requirements: ProtocolRequirement[] = [];
  const overrides = study.technicalOverrides || {};
  const sides: Side[] = ['right', 'left'];

  for (const side of sides) {
    const prefix = side === 'right' ? 'r' : 'l';
    const sideCap = side.charAt(0).toUpperCase() + side.slice(1);
    const sideClassification = study.classifications[side]?.confirmed || study.classifications[side]?.suggested;

    const icaSegments = [
      study.segments[`${prefix}_ica_prox`],
      study.segments[`${prefix}_ica_mid`],
      study.segments[`${prefix}_ica_dist`]
    ];

    const hasNearOcclusion =
      sideClassification === 'Near Occlusion (95-99%)' ||
      sideClassification === 'Near Occlusion' ||
      icaSegments.some(s => (s?.comments || '').toLowerCase().includes('string') || (s?.comments || '').toLowerCase().includes('near occlusion'));

    if (hasNearOcclusion) {
      requirements.push({
        id: `dyn_${side}_near_occlusion_low_flow`,
        label: `${sideCap} Low-Flow Colour & Power Doppler Optimisation`,
        category: 'occlusion',
        side,
        vesselId: `${prefix}_ica_prox`,
        targetSegmentId: `${prefix}_ica_prox`,
        targetModule: 'segment',
        level: 'required',
        blocking: true,
        allowTechnicalOverride: true,
        reason: `Suspected ${sideCap} near occlusion requires low PRF colour and power Doppler to verify residual patent lumen.`,
        triggeredBy: `${sideCap} Suspected Near Occlusion`,
        sourceRuleId: 'rule_suspected_near_occlusion',
        satisfied: !!(overrides[`dyn_${side}_near_occlusion_low_flow`] || (icaSegments[0]?.comments || '').includes('Power Doppler') || icaSegments[0]?.psv !== null)
      });
    }

    const icaProx = study.segments[`${prefix}_ica_prox`];
    if (icaProx && (icaProx.flowDirection === 'absent' || (icaProx.waveform || '').toLowerCase().includes('thump') || (icaProx.waveform || '').toLowerCase().includes('occluded'))) {
      requirements.push({
        id: `dyn_${side}_occlusion_multi_modality`,
        label: `${sideCap} Multi-Modality Occlusion Confirmation`,
        category: 'occlusion',
        side,
        vesselId: `${prefix}_ica_prox`,
        targetSegmentId: `${prefix}_ica_prox`,
        targetModule: 'segment',
        level: 'required',
        blocking: true,
        allowTechnicalOverride: true,
        reason: `Absence of flow alone does not confirm occlusion. Document low-flow colour/power interrogation and B-mode stump appearance.`,
        triggeredBy: `${sideCap} Absent Flow Detected`,
        sourceRuleId: 'rule_suspected_total_occlusion',
        satisfied: !!(overrides[`dyn_${side}_occlusion_multi_modality`] || (icaProx.comments && icaProx.comments.length > 5))
      });
    }
  }

  return requirements;
}

export function evaluateAnatomyRules(context: ProtocolContext): ProtocolRequirement[] {
  // Anatomy variants are primarily handled in evaluateVertebralRules and warnings
  return [];
}

export function evaluatePreviousStudyRules(context: ProtocolContext): ProtocolRequirement[] {
  const { study, previousStudy } = context;
  const requirements: ProtocolRequirement[] = [];
  const overrides = study.technicalOverrides || {};

  if (previousStudy?.hasPriorExam && (previousStudy.rightIcaPsv && previousStudy.rightIcaPsv >= 125 || previousStudy.leftIcaPsv && previousStudy.leftIcaPsv >= 125)) {
    const priorSide: Side = previousStudy.rightIcaPsv && previousStudy.rightIcaPsv >= 125 ? 'right' : 'left';
    const priorPsv = priorSide === 'right' ? previousStudy.rightIcaPsv : previousStudy.leftIcaPsv;
    const priorSideCap = priorSide.charAt(0).toUpperCase() + priorSide.slice(1);

    requirements.push({
      id: `dyn_prior_${priorSide}_comparison_target`,
      label: `Prior ${priorSideCap} ICA Disease Comparison Target (Prior PSV: ${priorPsv} cm/s)`,
      category: 'comparison',
      side: priorSide,
      vesselId: `${priorSide === 'right' ? 'r' : 'l'}_ica_prox`,
      targetSegmentId: `${priorSide === 'right' ? 'r' : 'l'}_ica_prox`,
      targetModule: 'prior',
      level: 'recommended',
      blocking: false,
      allowTechnicalOverride: true,
      reason: `Prior study (${previousStudy.examDate || 'on file'}) showed significant ${priorSideCap} ICA stenosis. Ensure comparable spectral velocity and ratio acquisition.`,
      triggeredBy: 'Previous Abnormal Carotid Examination',
      sourceRuleId: 'rule_prior_abnormality_comparison_target',
      satisfied: !!(overrides[`dyn_prior_${priorSide}_comparison_target`] || isSegmentAssessed(study.segments[`${priorSide === 'right' ? 'r' : 'l'}_ica_prox`]))
    });
  }

  return requirements;
}

export function evaluatePostInterventionRules(context: ProtocolContext): ProtocolRequirement[] {
  const { study, activeProtocol } = context;
  const requirements: ProtocolRequirement[] = [];
  const overrides = study.technicalOverrides || {};

  if (activeProtocol.specialExamType === 'post_stent' || study.clinicalIndications.some(i => i.toLowerCase().includes('stent'))) {
    requirements.push({
      id: 'dyn_stent_multi_segment',
      label: 'In-Stent Multi-Segment Velocity Interrogation (Prox, Mid, Distal)',
      category: 'post_intervention',
      level: 'required',
      blocking: true,
      allowTechnicalOverride: true,
      reason: 'Post-stent surveillance mandates spectral interrogation at native pre-stent, in-stent body, and native post-stent zones.',
      triggeredBy: 'Carotid Stent Surveillance Examination',
      sourceRuleId: 'rule_post_stent_surveillance_protocol',
      satisfied: !!(overrides['dyn_stent_multi_segment'] || (study.studyComments && study.studyComments.includes('stent')))
    });
  }

  if (activeProtocol.specialExamType === 'post_cea' || study.clinicalIndications.some(i => i.toLowerCase().includes('cea') || i.toLowerCase().includes('endarterectomy'))) {
    requirements.push({
      id: 'dyn_cea_patch_assessment',
      label: 'CEA Surgical Site & Native Arterial Transition Assessment',
      category: 'post_intervention',
      level: 'required',
      blocking: true,
      allowTechnicalOverride: true,
      reason: 'Post-CEA evaluation mandates interrogation of surgical patch/eversion site, proximal step, and distal transition zone.',
      triggeredBy: 'Post Carotid Endarterectomy Examination',
      sourceRuleId: 'rule_post_cea_protocol',
      satisfied: !!(overrides['dyn_cea_patch_assessment'] || (study.studyComments && study.studyComments.includes('CEA')))
    });
  }

  return requirements;
}

export function evaluateWaveformHemodynamicRules(context: ProtocolContext): ProtocolRequirement[] {
  const { study } = context;
  const requirements: ProtocolRequirement[] = [];
  const overrides = study.technicalOverrides || {};
  const sides: Side[] = ['right', 'left'];

  for (const side of sides) {
    const prefix = side === 'right' ? 'r' : 'l';
    const sideCap = side.charAt(0).toUpperCase() + side.slice(1);

    const ccaProx = study.segments[`${prefix}_cca_prox`];
    const ccaMid = study.segments[`${prefix}_cca_mid`];
    const ccaDist = study.segments[`${prefix}_cca_dist`];
    const icaProx = study.segments[`${prefix}_ica_prox`];
    const vertMid = study.segments[`${prefix}_vert_mid`];

    const carotids = [ccaProx, ccaMid, ccaDist, icaProx].filter(Boolean);
    const hasTardusCarotid = carotids.some(s => (s?.waveform || '').toLowerCase().includes('tardus'));
    const hasTardusVert = (vertMid?.waveform || '').toLowerCase().includes('tardus');

    if (hasTardusCarotid || hasTardusVert) {
      requirements.push({
        id: `dyn_${side}_tardus_parvus_inflow`,
        label: `${sideCap} Proximal Inflow Assessment (Tardus-Parvus Waveform Detected)`,
        category: 'carotid',
        side,
        vesselId: `${prefix}_cca_prox`,
        targetSegmentId: `${prefix}_cca_prox`,
        targetModule: 'segment',
        level: 'required',
        blocking: true,
        allowTechnicalOverride: true,
        reason: `Tardus-parvus waveform identified in the ${sideCap} system. Delayed systolic acceleration and rounded systolic peaks indicate severe proximal inflow stenosis or occlusion upstream (${side === 'right' ? 'RCCA origin / Brachiocephalic Trunk' : 'LCCA origin / Aortic Arch'}).`,
        triggeredBy: `${sideCap} Tardus-Parvus Waveform`,
        sourceRuleId: 'rule_tardus_parvus_proximal_inflow',
        satisfied: !!(overrides[`dyn_${side}_tardus_parvus_inflow`] || (isSegmentAssessed(study.segments[`${prefix}_cca_prox`]) && (ccaProx?.comments?.length || 0) > 0))
      });
    }

    const hasDampedCarotid = carotids.some(s => (s?.waveform || '').toLowerCase().includes('damped') && !(s?.waveform || '').toLowerCase().includes('tardus'));
    if (hasDampedCarotid) {
      requirements.push({
        id: `dyn_${side}_damped_inflow_review`,
        label: `Review ${sideCap} Proximal Inflow (Damped Carotid Waveform)`,
        category: 'carotid',
        side,
        vesselId: `${prefix}_cca_prox`,
        targetSegmentId: `${prefix}_cca_prox`,
        targetModule: 'segment',
        level: 'recommended',
        blocking: false,
        allowTechnicalOverride: true,
        reason: `Damped waveform documented in ${sideCap} carotid artery. Review proximal vessel origins and correlate with systemic hemodynamic status (cardiac output/aortic valve).`,
        triggeredBy: `${sideCap} Damped Waveform`,
        sourceRuleId: 'rule_damped_waveform_review',
        satisfied: !!(overrides[`dyn_${side}_damped_inflow_review`] || isSegmentAssessed(study.segments[`${prefix}_cca_prox`]))
      });
    }
  }

  return requirements;
}

export function evaluateRequirementCompletion(
  requirement: ProtocolRequirement,
  context: ProtocolContext
): ProtocolRequirement {
  const { study } = context;
  const overrides = study.technicalOverrides || {};

  // Check if override applies
  const override = overrides[requirement.id] ||
    (requirement.targetSegmentId ? overrides[requirement.targetSegmentId] : undefined) ||
    (requirement.vesselId ? overrides[requirement.vesselId] : undefined);

  if (override) {
    return {
      ...requirement,
      satisfied: true,
      satisfactionNote: `Technical exception documented: ${override.reason.replace(/_/g, ' ')}`
    };
  }

  // Segment check if targetSegmentId is present
  if (requirement.targetSegmentId) {
    const seg = study.segments[requirement.targetSegmentId];
    if (requirement.id.includes('waveform') || requirement.id.includes('vert_mid')) {
      const waveSatisfied = !!(seg && seg.flowDirection && seg.flowDirection !== 'not_assessed');
      return {
        ...requirement,
        satisfied: waveSatisfied || requirement.satisfied
      };
    }

    if (requirement.id.includes('psv')) {
      const psvSatisfied = !!(seg && seg.psv !== null);
      return {
        ...requirement,
        satisfied: psvSatisfied || requirement.satisfied
      };
    }

    if (requirement.id.includes('edv')) {
      const edvSatisfied = !!(seg && seg.edv !== null && seg.edv !== undefined);
      return {
        ...requirement,
        satisfied: edvSatisfied || requirement.satisfied
      };
    }

    const assessed = isSegmentAssessed(seg);
    return {
      ...requirement,
      satisfied: assessed || requirement.satisfied
    };
  }

  return requirement;
}

// Generate Protocol Warnings and Advisories
export function generateProtocolWarnings(context: ProtocolContext): DynamicProtocolEvaluation['warnings'] {
  const { study, activeProtocol, anatomy, criteria } = context;
  const warnings: DynamicProtocolEvaluation['warnings'] = [];
  const sides: Side[] = ['right', 'left'];

  // Vertebral Warnings
  for (const side of sides) {
    const vertMid = study.segments[`${side === 'right' ? 'r' : 'l'}_vert_mid`];
    const vertProx = study.segments[`${side === 'right' ? 'r' : 'l'}_vert_prox`];
    const isAbnormal = isVertebralWaveformSteal(vertMid) || isVertebralWaveformSteal(vertProx);

    if (isAbnormal) {
      const parent = getVertebralParent(side, anatomy);
      const sideCap = side.charAt(0).toUpperCase() + side.slice(1);
      const subclId = `${side === 'right' ? 'r' : 'l'}_subcl_prox`;

      if (parent === 'subclavian') {
        warnings.push({
          id: `warn_steal_${side}`,
          title: `PROTOCOL EXPANDED — ${sideCap.toUpperCase()} VERTEBRAL STEAL PATTERN`,
          message: `${sideCap} vertebral flow waveform indicates steal physiology. Ipsilateral subclavian assessment is now required for protocol completion.`,
          severity: 'warning',
          side,
          actionLabel: `Go to ${sideCap} Subclavian`,
          targetSegmentId: subclId
        });
      } else if (parent === 'aortic_arch') {
        warnings.push({
          id: `warn_vert_arch_${side}`,
          title: `ANATOMICAL ADVISORY — LEFT VERTEBRAL FROM ARCH`,
          message: `Abnormal left vertebral waveform documented, but the selected anatomical variant indicates direct aortic arch origin. Review proximal vertebral/arch circulation; do not assume the left subclavian is the parent vessel.`,
          severity: 'information',
          side: 'left',
          targetSegmentId: 'l_vert_prox'
        });
      }
    }
  }

  // ICA Stenosis Warnings
  const thresholdPsv = getStenosisThresholdPsv(criteria);
  for (const side of sides) {
    const prefix = side === 'right' ? 'r' : 'l';
    const sideCap = side.charAt(0).toUpperCase() + side.slice(1);
    const icaProx = study.segments[`${prefix}_ica_prox`];
    const icaMid = study.segments[`${prefix}_ica_mid`];
    const icaDist = study.segments[`${prefix}_ica_dist`];
    const icaPsvs = [icaProx?.psv, icaMid?.psv, icaDist?.psv].filter((p): p is number => p !== null && p !== undefined);
    const maxIcaPsv = icaPsvs.length > 0 ? Math.max(...icaPsvs) : 0;

    if (maxIcaPsv >= thresholdPsv) {
      warnings.push({
        id: `warn_ica_stenosis_${side}`,
        title: `ADDITIONAL STENOSIS ASSESSMENT REQUIRED — ${sideCap.toUpperCase()} ICA`,
        message: `${sideCap} ICA PSV (${maxIcaPsv} cm/s) meets criteria requiring secondary parameters (EDV, ICA/CCA Ratio, Plaque characterisation) before confirmation.`,
        severity: 'warning',
        side,
        actionLabel: `Assess ${sideCap} ICA`,
        targetSegmentId: `${prefix}_ica_prox`
      });
    }
  }

  // CCA Reference Warnings
  for (const side of sides) {
    const prefix = side === 'right' ? 'r' : 'l';
    const sideCap = side.charAt(0).toUpperCase() + side.slice(1);
    const ccaDist = study.segments[`${prefix}_cca_dist`];

    if (ccaDist) {
      const hasCcaDisease = ccaDist.plaquePresent || ccaDist.stenosisPresent;
      const isExtremeVelocity = ccaDist.psv !== null && (ccaDist.psv < 30 || ccaDist.psv > 120);
      const isAbnormalWave = ccaDist.waveform && !ccaDist.waveform.toLowerCase().includes('normal');

      if (hasCcaDisease || isExtremeVelocity || isAbnormalWave) {
        warnings.push({
          id: `warn_cca_ref_${side}`,
          title: `⚠ STANDARD ${sideCap.toUpperCase()} CCA REFERENCE MAY BE UNRELIABLE`,
          message: `Distal CCA demonstrates ${hasCcaDisease ? 'plaque/stenosis' : isExtremeVelocity ? `unusual velocity (${ccaDist.psv} cm/s)` : 'abnormal waveform'}. Consider selecting Mid CCA as alternative reference or marking ratio unreliable.`,
          severity: 'warning',
          side,
          actionLabel: `Review ${sideCap} CCA Reference`,
          targetSegmentId: `${prefix}_cca_dist`
        });
      }
    }
  }

  // Near Occlusion Warnings
  for (const side of sides) {
    const prefix = side === 'right' ? 'r' : 'l';
    const sideCap = side.charAt(0).toUpperCase() + side.slice(1);
    const sideClassification = study.classifications[side]?.confirmed || study.classifications[side]?.suggested;
    const icaSegments = [
      study.segments[`${prefix}_ica_prox`],
      study.segments[`${prefix}_ica_mid`],
      study.segments[`${prefix}_ica_dist`]
    ];

    const hasNearOcclusion =
      sideClassification === 'Near Occlusion (95-99%)' ||
      sideClassification === 'Near Occlusion' ||
      icaSegments.some(s => (s?.comments || '').toLowerCase().includes('string') || (s?.comments || '').toLowerCase().includes('near occlusion'));

    if (hasNearOcclusion) {
      warnings.push({
        id: `warn_near_occlusion_${side}`,
        title: `NEAR OCCLUSION PATHWAY — ${sideCap.toUpperCase()} ICA`,
        message: `Severe narrowing with string sign or collapsed distal ICA. Note: NASCET diameter calculation is contraindicated due to distal vessel collapse.`,
        severity: 'blocking',
        side,
        targetSegmentId: `${prefix}_ica_prox`
      });
    }
  }

  // Total Occlusion Warnings
  for (const side of sides) {
    const prefix = side === 'right' ? 'r' : 'l';
    const sideCap = side.charAt(0).toUpperCase() + side.slice(1);
    const icaProx = study.segments[`${prefix}_ica_prox`];

    if (icaProx && (icaProx.flowDirection === 'absent' || (icaProx.waveform || '').toLowerCase().includes('thump') || (icaProx.waveform || '').toLowerCase().includes('occluded'))) {
      warnings.push({
        id: `warn_occlusion_${side}`,
        title: `TOTAL OCCLUSION CONFIRMATION PATHWAY — ${sideCap.toUpperCase()} ICA`,
        message: `Verify occlusion with low PRF colour settings, power Doppler, and proximal carotid stump interrogation. Document absence of patent distal reconstitution.`,
        severity: 'warning',
        side,
        targetSegmentId: `${prefix}_ica_prox`
      });
    }
  }

  // Arrhythmia Warnings
  const isArrhythmia = study.clinicalIndications.some(i => i.toLowerCase().includes('arrhythmia') || i.toLowerCase().includes('atrial')) ||
    (study.studyComments || '').toLowerCase().includes('arrhythmia') || (study.studyComments || '').toLowerCase().includes('af');

  if (isArrhythmia) {
    warnings.push({
      id: 'warn_arrhythmia',
      title: 'CARDIAC ARRHYTHMIA PROTOCOL NOTE',
      message: 'Cardiac rhythm irregularity noted. Acquire representative reproducible beats; avoid single isolated compensatory peak velocities for stenosis grading.',
      severity: 'information'
    });
  }

  // High Bifurcation Prompt
  if (anatomy.bifurcationVariant === 'high') {
    const rightDistIncomplete = !isSegmentAssessed(study.segments['r_ica_dist']);
    const leftDistIncomplete = !isSegmentAssessed(study.segments['l_ica_dist']);

    if (rightDistIncomplete || leftDistIncomplete) {
      warnings.push({
        id: 'warn_high_bifurcation',
        title: 'HIGH BIFURCATION ACOUSTIC LIMITATION',
        message: 'High cervical bifurcation located near mandibular shadow. Document structured technical limitation if distal ICA segment cannot be directly visualised.',
        severity: 'information',
        targetSegmentId: rightDistIncomplete ? 'r_ica_dist' : 'l_ica_dist'
      });
    }
  }

  // Post Stent Warning
  if (activeProtocol.specialExamType === 'post_stent' || study.clinicalIndications.some(i => i.toLowerCase().includes('stent'))) {
    warnings.push({
      id: 'warn_stent_criteria',
      title: 'POST-STENT SURVEILLANCE PROTOCOL ACTIVE',
      message: 'Native ICA stenosis velocity criteria do not apply to stented carotid arteries. Apply site-validated carotid stent criteria or surveillance delta thresholds.',
      severity: 'warning'
    });
  }

  return warnings;
}

/**
 * PURE DYNAMIC PROTOCOL EVALUATION FUNCTION
 */
export function evaluateDynamicProtocol(
  context: ProtocolContext
): DynamicProtocolResult {
  const baseline = buildBaselineRequirements(context);

  const dynamic = [
    ...evaluateVertebralRules(context),
    ...evaluateIcaRules(context),
    ...evaluateWaveformHemodynamicRules(context),
    ...evaluatePlaqueRules(context),
    ...evaluateCcaReferenceRules(context),
    ...evaluateOcclusionRules(context),
    ...evaluateAnatomyRules(context),
    ...evaluatePreviousStudyRules(context),
    ...evaluatePostInterventionRules(context),
  ];

  const allRequirements = deduplicateRequirements([
    ...baseline,
    ...dynamic,
  ]);

  const evaluated = allRequirements.map(requirement =>
    evaluateRequirementCompletion(
      requirement,
      context
    )
  );

  const blocking = evaluated.filter(
    r =>
      r.blocking &&
      !r.satisfied &&
      !hasValidOverride(r, context)
  );

  const required = evaluated.filter(
    r =>
      r.level === 'required' &&
      !r.satisfied
  );

  const recommended = evaluated.filter(
    r =>
      r.level === 'recommended' &&
      !r.satisfied
  );

  const completed = evaluated.filter(
    r => r.satisfied
  );

  const countable = evaluated.filter(
    r =>
      r.level === 'required' ||
      r.level === 'recommended'
  );

  const completeCount =
    countable.filter(r => r.satisfied).length;

  const overrides = context.study.technicalOverrides || {};
  const warnings = generateProtocolWarnings(context);

  const baselineRequired = baseline.filter(r => r.level === 'required');
  const baselineCompleted = baselineRequired.filter(r => r.satisfied).length;
  const dynamicRequired = dynamic.filter(r => r.level === 'required');
  const dynamicCompleted = dynamicRequired.filter(r => r.satisfied).length;

  const completionPercent =
    countable.length === 0
      ? 100
      : Math.round(
          (completeCount / countable.length) * 100
        );

  return {
    baselineRequirements:
      evaluated.filter(r => r.category === 'baseline'),

    triggeredRequirements:
      evaluated.filter(r => r.sourceRuleId && r.category !== 'baseline'),

    outstandingRequired: required,

    outstandingRecommended: recommended,

    completedRequirements: completed,

    completionPercent,

    canCompleteStudy:
      blocking.length === 0,

    // Extended audit & UI compatibility fields
    technicalOverrides: Object.values(overrides),
    warnings,
    protocolCompletionPercent: completionPercent,
    summaryStats: {
      baselineTotal: baselineRequired.length,
      baselineCompleted,
      dynamicTotal: dynamicRequired.length,
      dynamicCompleted,
      technicalExceptionsCount: Object.keys(overrides).length,
      recommendationsCount: recommended.length,
      blockingRemainingCount: blocking.length
    }
  };
}
