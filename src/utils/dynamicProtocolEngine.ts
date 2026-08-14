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
  DynamicProtocolRule,
  DynamicProtocolEvaluation,
  RuleSeverity,
  SegmentData
} from '../types';
import { SEGMENTS_META } from '../constants';
import { getVertebralParent, getVesselParent } from './anatomyVariants';
import { calculateIcaCcaRatio, suggestIcaStenosisCategory } from './calculations';

export interface DynamicProtocolContext {
  study: StudyData;
  activeProtocol: SiteProtocolConfig;
  previousStudy?: PriorExamData;
  anatomy: AnatomyVariantState;
  criteria: ClassificationSystem;
}

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
    source: 'universal',
    ifCondition: 'Classification = Near Occlusion OR string sign / pinpoint residual lumen documented',
    thenAction: 'Require low-flow colour/power optimization, distal ICA calibre assessment, and caution on NASCET diameter ratio'
  },
  {
    id: 'rule_suspected_total_occlusion',
    name: 'Suspected Total Occlusion Multi-Modality Confirmation',
    description: 'Prevents misdiagnosis of occlusion from absent spectral Doppler alone by requiring optimized low PRF colour, power Doppler, B-mode stump check, and technical limitation notes.',
    priority: 90,
    category: 'occlusion',
    severity: 'blocking',
    enabled: true,
    source: 'universal',
    ifCondition: 'Flow direction = absent OR classification = Total Occlusion',
    thenAction: 'Require low PRF colour Doppler, power Doppler confirmation, B-mode stump appearance, and acoustic limitation check'
  },
  {
    id: 'rule_arrhythmia_velocity_protocol',
    name: 'Arrhythmia / Irregular Rhythm Averaging Protocol',
    description: 'Guides sonographers to measure multiple representative cardiac cycles and document rhythm-related velocity limitations.',
    priority: 40,
    category: 'technical',
    severity: 'information',
    enabled: true,
    source: 'universal',
    ifCondition: 'Clinical indication = Arrhythmia / Atrial fibrillation or study comments mention irregular rhythm',
    thenAction: 'Display guidance: Measure representative reproducible cardiac cycles; do not select isolated ectopic/compensatory beats'
  },
  {
    id: 'rule_high_bifurcation_technical_prompt',
    name: 'High Carotid Bifurcation Technical Limitation Prompt',
    description: 'Prompts technical exception documentation when high mandibular bifurcation obscures distal ICA acoustic window.',
    priority: 50,
    category: 'technical',
    severity: 'warning',
    enabled: true,
    source: 'anatomy',
    ifCondition: 'Bifurcation variant = high AND distal ICA not visualised or incomplete',
    thenAction: 'Prompt: High bifurcation limits distal ICA window; document structured technical exception if unobtainable'
  },
  {
    id: 'rule_prior_abnormality_comparison_target',
    name: 'Prior Study Significant Abnormality Comparison Target',
    description: 'Extracts significant prior stenosis findings from previous examination and generates targets for directly comparable current Doppler sampling.',
    priority: 65,
    category: 'comparison',
    severity: 'recommendation',
    enabled: true,
    source: 'site',
    ifCondition: 'Prior study attached with prior ICA PSV ≥ 125 cm/s or prior severe stenosis',
    thenAction: 'Generate comparison target: Obtain comparable spectral waveform, PSV, EDV, ratio, and plaque morphology'
  },
  {
    id: 'rule_post_cea_protocol',
    name: 'Post Carotid Endarterectomy (CEA) Assessment',
    description: 'Adjusts native carotid expectations to focus on native-patch transition zones, surgical shelf, and intimal flap / restenosis evaluation.',
    priority: 85,
    category: 'post_intervention',
    severity: 'blocking',
    enabled: true,
    source: 'universal',
    ifCondition: 'Special exam type = post_cea or indication contains CEA',
    thenAction: 'Require pre-repair native vessel, surgical site, post-repair native vessel, and restenosis/flap assessment'
  },
  {
    id: 'rule_post_stent_surveillance_protocol',
    name: 'Post Carotid Artery Stent (CAS) Surveillance Protocol',
    description: 'Enforces in-stent multi-segment sampling (prox, mid, distal stent) and warns against automatic application of native ICA stenosis criteria.',
    priority: 85,
    category: 'post_intervention',
    severity: 'blocking',
    enabled: true,
    source: 'universal',
    ifCondition: 'Special exam type = post_stent or indication contains stent',
    thenAction: 'Require native pre-stent, prox stent, mid stent, dist stent, and native post-stent velocities; alert on stent criteria'
  }
];

// Helper: Check if segment has sufficient data entered
function isSegmentAssessed(segment?: SegmentData): boolean {
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

/**
 * PURE EVALUATION FUNCTION
 * Accepts study, activeProtocol, previousStudy, anatomy, criteria and returns comprehensive dynamic evaluation.
 */
export function evaluateDynamicProtocol(context: DynamicProtocolContext): DynamicProtocolEvaluation {
  const { study, activeProtocol, previousStudy, anatomy, criteria } = context;

  const baselineRequirements: ProtocolRequirement[] = [];
  const triggeredRequirements: ProtocolRequirement[] = [];
  const warnings: DynamicProtocolEvaluation['warnings'] = [];

  const overrides = study.technicalOverrides || {};
  const segmentReqs = activeProtocol?.segmentRequirements || {};

  // -------------------------------------------------------------
  // 1. BASELINE REQUIREMENTS
  // -------------------------------------------------------------

  // Bilateral Distal CCA (Critical reference denominator)
  baselineRequirements.push({
    id: 'base_r_cca_dist',
    label: 'Right Distal CCA (Reference Denominator)',
    category: 'baseline',
    side: 'right',
    targetSegmentId: 'r_cca_dist',
    targetModule: 'segment',
    level: 'required',
    blocking: true,
    reason: 'Standard baseline ICA/CCA ratio denominator and inflow assessment',
    allowTechnicalOverride: true,
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
    targetModule: 'segment',
    level: 'required',
    blocking: true,
    reason: 'Standard baseline ICA/CCA ratio denominator and inflow assessment',
    allowTechnicalOverride: true,
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
      targetModule: 'segment',
      level: 'recommended',
      blocking: false,
      reason: 'Site protocol: Proximal CCA routine baseline sampling',
      allowTechnicalOverride: true,
      satisfied: !!(overrides['base_r_cca_prox'] || isSegmentAssessed(study.segments['r_cca_prox']))
    });
    baselineRequirements.push({
      id: 'base_l_cca_prox',
      label: 'Left Proximal CCA',
      category: 'baseline',
      side: 'left',
      targetSegmentId: 'l_cca_prox',
      targetModule: 'segment',
      level: 'recommended',
      blocking: false,
      reason: 'Site protocol: Proximal CCA routine baseline sampling',
      allowTechnicalOverride: true,
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
    targetModule: 'segment',
    level: 'required',
    blocking: true,
    reason: 'Carotid bulb geometry & boundary flow separation check',
    allowTechnicalOverride: true,
    satisfied: !!(overrides['base_r_bulb'] || overrides['r_bulb'] || (study.segments['r_bulb']?.psv !== null || study.segments['r_bulb']?.plaquePresent || study.segments['r_bulb']?.waveform !== 'Not assessed'))
  });

  baselineRequirements.push({
    id: 'base_l_bulb',
    label: 'Left Carotid Bulb (Flow separation / Plaque screening)',
    category: 'baseline',
    side: 'left',
    targetSegmentId: 'l_bulb',
    targetModule: 'segment',
    level: 'required',
    blocking: true,
    reason: 'Carotid bulb geometry & boundary flow separation check',
    allowTechnicalOverride: true,
    satisfied: !!(overrides['base_l_bulb'] || overrides['l_bulb'] || (study.segments['l_bulb']?.psv !== null || study.segments['l_bulb']?.plaquePresent || study.segments['l_bulb']?.waveform !== 'Not assessed'))
  });

  // Bilateral Proximal ICA
  baselineRequirements.push({
    id: 'base_r_ica_prox',
    label: 'Right Proximal ICA Spectral Doppler',
    category: 'baseline',
    side: 'right',
    targetSegmentId: 'r_ica_prox',
    targetModule: 'segment',
    level: 'required',
    blocking: true,
    reason: 'Peak velocity zone and baseline internal carotid assessment',
    allowTechnicalOverride: true,
    satisfied: !!(overrides['base_r_ica_prox'] || overrides['r_ica_prox'] || isSegmentAssessed(study.segments['r_ica_prox']))
  });

  baselineRequirements.push({
    id: 'base_l_ica_prox',
    label: 'Left Proximal ICA Spectral Doppler',
    category: 'baseline',
    side: 'left',
    targetSegmentId: 'l_ica_prox',
    targetModule: 'segment',
    level: 'required',
    blocking: true,
    reason: 'Peak velocity zone and baseline internal carotid assessment',
    allowTechnicalOverride: true,
    satisfied: !!(overrides['base_l_ica_prox'] || overrides['l_ica_prox'] || isSegmentAssessed(study.segments['l_ica_prox']))
  });

  // Bilateral ECA Proximal
  baselineRequirements.push({
    id: 'base_r_eca_prox',
    label: 'Right Proximal ECA (Branch patency / High-resistance)',
    category: 'baseline',
    side: 'right',
    targetSegmentId: 'r_eca_prox',
    targetModule: 'segment',
    level: 'recommended',
    blocking: false,
    reason: 'External carotid patency and high-resistance branch confirmation',
    allowTechnicalOverride: true,
    satisfied: !!(overrides['base_r_eca_prox'] || isSegmentAssessed(study.segments['r_eca_prox']))
  });

  baselineRequirements.push({
    id: 'base_l_eca_prox',
    label: 'Left Proximal ECA (Branch patency / High-resistance)',
    category: 'baseline',
    side: 'left',
    targetSegmentId: 'l_eca_prox',
    targetModule: 'segment',
    level: 'recommended',
    blocking: false,
    reason: 'External carotid patency and high-resistance branch confirmation',
    allowTechnicalOverride: true,
    satisfied: !!(overrides['base_l_eca_prox'] || isSegmentAssessed(study.segments['l_eca_prox']))
  });

  // Bilateral Vertebral Mid (Flow Direction & Waveform)
  baselineRequirements.push({
    id: 'base_r_vert_mid',
    label: 'Right Vertebral Artery Waveform & Flow Direction',
    category: 'baseline',
    side: 'right',
    targetSegmentId: 'r_vert_mid',
    targetModule: 'segment',
    level: 'required',
    blocking: true,
    reason: 'Vertebral flow direction and baseline waveform morphology',
    allowTechnicalOverride: true,
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
    targetModule: 'segment',
    level: 'required',
    blocking: true,
    reason: 'Vertebral flow direction and baseline waveform morphology',
    allowTechnicalOverride: true,
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
      targetModule: 'segment',
      level: 'required',
      blocking: true,
      reason: 'Site protocol: Subclavian assessment configured as routine for all patients',
      allowTechnicalOverride: true,
      satisfied: !!(overrides['base_r_subcl_routine'] || isSegmentAssessed(study.segments['r_subcl_prox']))
    });

    baselineRequirements.push({
      id: 'base_l_subcl_routine',
      label: 'Left Subclavian Artery (Site Routine Protocol)',
      category: 'baseline',
      side: 'left',
      targetSegmentId: 'l_subcl_prox',
      targetModule: 'segment',
      level: 'required',
      blocking: true,
      reason: 'Site protocol: Subclavian assessment configured as routine for all patients',
      allowTechnicalOverride: true,
      satisfied: !!(overrides['base_l_subcl_routine'] || isSegmentAssessed(study.segments['l_subcl_prox']))
    });
  }

  // -------------------------------------------------------------
  // 2. DYNAMIC RULE EVALUATION
  // -------------------------------------------------------------

  // RULE 1 & 2: ABNORMAL VERTEBRAL FLOW & PARENT VESSEL RESOLUTION (Right & Left)
  const sides: ('right' | 'left')[] = ['right', 'left'];

  for (const side of sides) {
    const vertMid = study.segments[`${side === 'right' ? 'r' : 'l'}_vert_mid`];
    const vertProx = study.segments[`${side === 'right' ? 'r' : 'l'}_vert_prox`];
    const isAbnormal = isVertebralWaveformSteal(vertMid) || isVertebralWaveformSteal(vertProx);

    if (isAbnormal) {
      const parent = getVertebralParent(side, anatomy);
      const sideCap = side.charAt(0).toUpperCase() + side.slice(1);
      const subclId = `${side === 'right' ? 'r' : 'l'}_subcl_prox`;
      const subclSeg = study.segments[subclId];

      if (parent === 'subclavian') {
        // Trigger Subclavian Artery Assessment
        const subclWaveOk = !!(subclSeg && subclSeg.waveform && subclSeg.waveform !== 'Not assessed');
        const subclPsvOk = !!(subclSeg && subclSeg.psv !== null);
        const subclPlaqueOk = !!(subclSeg && (subclSeg.plaquePresent !== undefined || subclSeg.stenosisPresent !== undefined));

        triggeredRequirements.push({
          id: `dyn_${side}_subclavian_waveform`,
          label: `${sideCap} Subclavian Waveform & Morphology`,
          category: 'subclavian',
          side,
          targetSegmentId: subclId,
          targetModule: 'segment',
          level: 'required',
          blocking: true,
          reason: `${sideCap} vertebral waveform indicates possible steal physiology (${vertMid?.waveform || vertMid?.flowDirection || 'abnormal flow'}). Assess parent subclavian artery.`,
          triggeredBy: `${sideCap} Vertebral Flow Abnormality`,
          sourceRuleId: 'rule_vertebral_steal_subclavian_workup',
          allowTechnicalOverride: true,
          satisfied: !!(overrides[`dyn_${side}_subclavian_waveform`] || overrides[subclId] || (subclWaveOk && subclSeg?.flowDirection !== 'not_assessed'))
        });

        triggeredRequirements.push({
          id: `dyn_${side}_subclavian_psv`,
          label: `${sideCap} Subclavian Peak Systolic Velocity (PSV)`,
          category: 'subclavian',
          side,
          targetSegmentId: subclId,
          targetModule: 'segment',
          level: 'required',
          blocking: true,
          reason: `${sideCap} vertebral steal pattern requires parent subclavian hemodynamic quantification.`,
          triggeredBy: `${sideCap} Vertebral Flow Abnormality`,
          sourceRuleId: 'rule_vertebral_steal_subclavian_workup',
          allowTechnicalOverride: true,
          satisfied: !!(overrides[`dyn_${side}_subclavian_psv`] || overrides[subclId] || subclPsvOk)
        });

        triggeredRequirements.push({
          id: `dyn_${side}_subclavian_plaque`,
          label: `Assess ${sideCap} Subclavian for Focal Plaque / Stenosis`,
          category: 'subclavian',
          side,
          targetSegmentId: subclId,
          targetModule: 'segment',
          level: 'recommended',
          blocking: false,
          reason: `Document presence or absence of proximal atherosclerotic plaque in ${sideCap} subclavian.`,
          triggeredBy: `${sideCap} Vertebral Steal Pattern`,
          sourceRuleId: 'rule_vertebral_steal_subclavian_workup',
          allowTechnicalOverride: true,
          satisfied: !!(overrides[`dyn_${side}_subclavian_plaque`] || (subclSeg && (subclSeg.plaquePresent || subclSeg.stenosisPresent || subclSeg.comments)))
        });

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
        // Anatomy aware advisory! Do NOT blindly require subclavian steal workup
        warnings.push({
          id: `warn_vert_arch_${side}`,
          title: `ANATOMICAL ADVISORY — LEFT VERTEBRAL FROM ARCH`,
          message: `Abnormal left vertebral waveform documented, but the selected anatomical variant indicates direct aortic arch origin. Review proximal vertebral/arch circulation; do not assume the left subclavian is the parent vessel.`,
          severity: 'information',
          side: 'left',
          targetSegmentId: 'l_vert_prox'
        });

        triggeredRequirements.push({
          id: 'dyn_l_vert_arch_origin_check',
          label: 'Left Vertebral Direct Arch Origin Assessment',
          category: 'vertebral',
          side: 'left',
          targetSegmentId: 'l_vert_prox',
          targetModule: 'segment',
          level: 'recommended',
          blocking: false,
          reason: 'Document proximal left vertebral origin at the aortic arch due to direct arch branching variant.',
          triggeredBy: 'Left Vertebral Arch Origin Variant',
          sourceRuleId: 'rule_vertebral_arch_origin_advisory',
          allowTechnicalOverride: true,
          satisfied: !!(overrides['dyn_l_vert_arch_origin_check'] || isSegmentAssessed(study.segments['l_vert_prox']))
        });
      }
    }
  }

  // RULE 3: ELEVATED ICA VELOCITY & MULTI-PARAMETER STENOSIS WORKUP
  const thresholdPsv = getStenosisThresholdPsv(criteria);

  for (const side of sides) {
    const prefix = side === 'right' ? 'r' : 'l';
    const sideCap = side.charAt(0).toUpperCase() + side.slice(1);

    const icaProx = study.segments[`${prefix}_ica_prox`];
    const icaMid = study.segments[`${prefix}_ica_mid`];
    const icaDist = study.segments[`${prefix}_ica_dist`];
    const ccaDist = study.segments[`${prefix}_cca_dist`];

    const maxIcaPsv = Math.max(
      icaProx?.psv || 0,
      icaMid?.psv || 0,
      icaDist?.psv || 0
    );

    if (maxIcaPsv >= thresholdPsv) {
      // 1. Require ICA EDV
      const hasEdv = !!(
        (icaProx?.psv === maxIcaPsv && icaProx?.edv !== null) ||
        (icaMid?.psv === maxIcaPsv && icaMid?.edv !== null) ||
        (icaDist?.psv === maxIcaPsv && icaDist?.edv !== null)
      );

      triggeredRequirements.push({
        id: `dyn_${side}_ica_edv`,
        label: `${sideCap} Peak Stenosis End-Diastolic Velocity (EDV)`,
        category: 'stenosis',
        side,
        targetSegmentId: `${prefix}_ica_prox`,
        targetModule: 'segment',
        level: 'required',
        blocking: true,
        reason: `${sideCap} ICA PSV (${maxIcaPsv} cm/s) meets criteria threshold (≥${thresholdPsv} cm/s). EDV is mandatory for consensus grading.`,
        triggeredBy: `${sideCap} ICA Velocity Acceleration`,
        sourceRuleId: 'rule_elevated_ica_velocity_secondary_params',
        allowTechnicalOverride: true,
        satisfied: !!(overrides[`dyn_${side}_ica_edv`] || hasEdv)
      });

      // 2. Require Distal CCA Reference & Ratio
      const hasRatio = calculateIcaCcaRatio(side, study) !== null;
      triggeredRequirements.push({
        id: `dyn_${side}_ica_cca_ratio`,
        label: `${sideCap} ICA/CCA Velocity Ratio`,
        category: 'stenosis',
        side,
        targetSegmentId: `${prefix}_cca_dist`,
        targetModule: 'ratio',
        level: 'required',
        blocking: true,
        reason: `ICA/CCA ratio calculation is mandatory under ${criteria.replace(/_/g, ' ')} for stenosis validation.`,
        triggeredBy: `${sideCap} ICA Velocity Acceleration`,
        sourceRuleId: 'rule_elevated_ica_velocity_secondary_params',
        allowTechnicalOverride: true,
        satisfied: !!(overrides[`dyn_${side}_ica_cca_ratio`] || hasRatio)
      });

      // 3. Require Plaque Documentation
      const sidePlaque = study.plaques.some(p => p.segments.some(s => s.startsWith(`${prefix}_`))) ||
        (study.segments[`${prefix}_bulb`]?.plaquePresent || study.segments[`${prefix}_ica_prox`]?.plaquePresent);

      triggeredRequirements.push({
        id: `dyn_${side}_plaque_documentation`,
        label: `${sideCap} Plaque & Narrowing Documentation`,
        category: 'plaque',
        side,
        targetSegmentId: `${prefix}_ica_prox`,
        targetModule: 'plaque',
        level: 'required',
        blocking: true,
        reason: `Consensus criteria require B-mode / colour confirmation of luminal plaque for hemodynamic stenosis.`,
        triggeredBy: `${sideCap} Elevated Velocity Jet`,
        sourceRuleId: 'rule_elevated_ica_velocity_secondary_params',
        allowTechnicalOverride: true,
        satisfied: !!(overrides[`dyn_${side}_plaque_documentation`] || sidePlaque)
      });

      // 4. Require Distal ICA Assessment
      const distalAssessed = isSegmentAssessed(icaDist);
      triggeredRequirements.push({
        id: `dyn_${side}_distal_ica_waveform`,
        label: `${sideCap} Distal ICA Waveform & Patency`,
        category: 'carotid',
        side,
        targetSegmentId: `${prefix}_ica_dist`,
        targetModule: 'segment',
        level: 'recommended',
        blocking: false,
        reason: `Evaluate distal ICA for post-stenotic flow reconstitution or downstream tandem lesions.`,
        triggeredBy: `${sideCap} Proximal ICA Stenosis`,
        sourceRuleId: 'rule_elevated_ica_velocity_secondary_params',
        allowTechnicalOverride: true,
        satisfied: !!(overrides[`dyn_${side}_distal_ica_waveform`] || distalAssessed)
      });

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

  // RULE 4: UNRELIABLE DISTAL CCA REFERENCE DENOMINATOR
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

  // RULE 5: PLAQUE CHARACTERISATION
  const anyPlaquePresent = study.plaques.length > 0 || Object.values(study.segments).some(s => s.plaquePresent);
  if (anyPlaquePresent) {
    const plaquesWithSurface = study.plaques.filter(p => p.surface && p.surface !== 'indeterminate').length;
    const plaquesWithComp = study.plaques.filter(p => p.composition).length;
    const isPlaqueComplete = study.plaques.length > 0 && plaquesWithSurface === study.plaques.length && plaquesWithComp === study.plaques.length;

    triggeredRequirements.push({
      id: 'dyn_plaque_characterisation',
      label: 'Plaque Morphology Details (Composition & Surface)',
      category: 'plaque',
      side: 'bilateral',
      targetModule: 'plaque',
      level: 'recommended',
      blocking: false,
      reason: 'Plaque identified on scan. Register composition, surface regularity, and calcific shadowing in Plaque Register.',
      triggeredBy: 'Plaque Identified on Grayscale Sweep',
      sourceRuleId: 'rule_plaque_characterisation',
      allowTechnicalOverride: true,
      satisfied: !!(overrides['dyn_plaque_characterisation'] || isPlaqueComplete || study.plaques.length > 0)
    });
  }

  // RULE 6: SUSPECTED NEAR OCCLUSION
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
      triggeredRequirements.push({
        id: `dyn_${side}_near_occlusion_low_flow`,
        label: `${sideCap} Low-Flow Colour & Power Doppler Optimisation`,
        category: 'occlusion',
        side,
        targetSegmentId: `${prefix}_ica_prox`,
        targetModule: 'segment',
        level: 'required',
        blocking: true,
        reason: `Suspected ${sideCap} near occlusion requires low PRF colour and power Doppler to verify residual patent lumen.`,
        triggeredBy: `${sideCap} Suspected Near Occlusion`,
        sourceRuleId: 'rule_suspected_near_occlusion',
        allowTechnicalOverride: true,
        satisfied: !!(overrides[`dyn_${side}_near_occlusion_low_flow`] || (icaSegments[0]?.comments || '').includes('Power Doppler') || icaSegments[0]?.psv !== null)
      });

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

  // RULE 7: SUSPECTED TOTAL OCCLUSION
  for (const side of sides) {
    const prefix = side === 'right' ? 'r' : 'l';
    const sideCap = side.charAt(0).toUpperCase() + side.slice(1);
    const icaProx = study.segments[`${prefix}_ica_prox`];

    if (icaProx && (icaProx.flowDirection === 'absent' || (icaProx.waveform || '').toLowerCase().includes('thump') || (icaProx.waveform || '').toLowerCase().includes('occluded'))) {
      triggeredRequirements.push({
        id: `dyn_${side}_occlusion_multi_modality`,
        label: `${sideCap} Multi-Modality Occlusion Confirmation`,
        category: 'occlusion',
        side,
        targetSegmentId: `${prefix}_ica_prox`,
        targetModule: 'segment',
        level: 'required',
        blocking: true,
        reason: `Absence of flow alone does not confirm occlusion. Document low-flow colour/power interrogation and B-mode stump appearance.`,
        triggeredBy: `${sideCap} Absent Flow Detected`,
        sourceRuleId: 'rule_suspected_total_occlusion',
        allowTechnicalOverride: true,
        satisfied: !!(overrides[`dyn_${side}_occlusion_multi_modality`] || (icaProx.comments && icaProx.comments.length > 5))
      });

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

  // RULE 8: ARRHYTHMIA
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

  // RULE 9: HIGH BIFURCATION PROMPT
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

  // RULE 10: PRIOR STUDY ABNORMALITY TARGET
  if (previousStudy?.hasPriorExam && (previousStudy.rightIcaPsv && previousStudy.rightIcaPsv >= 125 || previousStudy.leftIcaPsv && previousStudy.leftIcaPsv >= 125)) {
    const priorSide = previousStudy.rightIcaPsv && previousStudy.rightIcaPsv >= 125 ? 'right' : 'left';
    const priorPsv = priorSide === 'right' ? previousStudy.rightIcaPsv : previousStudy.leftIcaPsv;
    const priorSideCap = priorSide.charAt(0).toUpperCase() + priorSide.slice(1);

    triggeredRequirements.push({
      id: `dyn_prior_${priorSide}_comparison_target`,
      label: `Prior ${priorSideCap} ICA Disease Comparison Target (Prior PSV: ${priorPsv} cm/s)`,
      category: 'comparison',
      side: priorSide,
      targetSegmentId: `${priorSide === 'right' ? 'r' : 'l'}_ica_prox`,
      targetModule: 'prior',
      level: 'recommended',
      blocking: false,
      reason: `Prior study (${previousStudy.examDate || 'on file'}) showed significant ${priorSideCap} ICA stenosis. Ensure comparable spectral velocity and ratio acquisition.`,
      triggeredBy: 'Previous Abnormal Carotid Examination',
      sourceRuleId: 'rule_prior_abnormality_comparison_target',
      allowTechnicalOverride: true,
      satisfied: !!(overrides[`dyn_prior_${priorSide}_comparison_target`] || isSegmentAssessed(study.segments[`${priorSide === 'right' ? 'r' : 'l'}_ica_prox`]))
    });
  }

  // RULE 11: POST CAROTID STENT (CAS)
  if (activeProtocol.specialExamType === 'post_stent' || study.clinicalIndications.some(i => i.toLowerCase().includes('stent'))) {
    triggeredRequirements.push({
      id: 'dyn_stent_multi_segment',
      label: 'In-Stent Multi-Segment Velocity Interrogation (Prox, Mid, Distal)',
      category: 'post_intervention',
      level: 'required',
      blocking: true,
      reason: 'Post-stent surveillance mandates spectral interrogation at native pre-stent, in-stent body, and native post-stent zones.',
      triggeredBy: 'Carotid Stent Surveillance Examination',
      sourceRuleId: 'rule_post_stent_surveillance_protocol',
      allowTechnicalOverride: true,
      satisfied: !!(overrides['dyn_stent_multi_segment'] || (study.studyComments && study.studyComments.includes('stent')))
    });

    warnings.push({
      id: 'warn_stent_criteria',
      title: 'POST-STENT SURVEILLANCE PROTOCOL ACTIVE',
      message: 'Native ICA stenosis velocity criteria do not apply to stented carotid arteries. Apply site-validated carotid stent criteria or surveillance delta thresholds.',
      severity: 'warning'
    });
  }

  // RULE 12: POST CAROTID ENDARTERECTOMY (CEA)
  if (activeProtocol.specialExamType === 'post_cea' || study.clinicalIndications.some(i => i.toLowerCase().includes('cea') || i.toLowerCase().includes('endarterectomy'))) {
    triggeredRequirements.push({
      id: 'dyn_cea_patch_assessment',
      label: 'CEA Surgical Site & Native Arterial Transition Assessment',
      category: 'post_intervention',
      level: 'required',
      blocking: true,
      reason: 'Post-CEA evaluation mandates interrogation of surgical patch/eversion site, proximal step, and distal transition zone.',
      triggeredBy: 'Post Carotid Endarterectomy Examination',
      sourceRuleId: 'rule_post_cea_protocol',
      allowTechnicalOverride: true,
      satisfied: !!(overrides['dyn_cea_patch_assessment'] || (study.studyComments && study.studyComments.includes('CEA')))
    });
  }

  // -------------------------------------------------------------
  // 3. AGGREGATE & CALCULATE COMPLETION METRICS
  // -------------------------------------------------------------

  const allRequirements = [...baselineRequirements, ...triggeredRequirements];

  const outstandingRequired = allRequirements.filter(r => r.level === 'required' && !r.satisfied);
  const outstandingRecommended = allRequirements.filter(r => r.level === 'recommended' && !r.satisfied);
  const completedRequirements = allRequirements.filter(r => r.satisfied);

  const baselineRequired = baselineRequirements.filter(r => r.level === 'required');
  const baselineCompleted = baselineRequired.filter(r => r.satisfied).length;

  const dynamicRequired = triggeredRequirements.filter(r => r.level === 'required');
  const dynamicCompleted = dynamicRequired.filter(r => r.satisfied).length;

  const totalRequired = baselineRequired.length + dynamicRequired.length;
  const totalCompleted = baselineCompleted + dynamicCompleted;

  let completionPercent = 100;
  if (totalRequired > 0) {
    completionPercent = Math.round((totalCompleted / totalRequired) * 100);
  }

  const technicalExceptionsCount = Object.keys(overrides).length;
  const recommendationsCount = allRequirements.filter(r => r.level === 'recommended').length;
  const blockingRemainingCount = outstandingRequired.filter(r => r.blocking).length;

  const canCompleteStudy = blockingRemainingCount === 0;

  return {
    baselineRequirements,
    triggeredRequirements,
    outstandingRequired,
    outstandingRecommended,
    completedRequirements,
    technicalOverrides: Object.values(overrides),
    warnings,
    protocolCompletionPercent: completionPercent,
    canCompleteStudy,
    summaryStats: {
      baselineTotal: baselineRequired.length,
      baselineCompleted,
      dynamicTotal: dynamicRequired.length,
      dynamicCompleted,
      technicalExceptionsCount,
      recommendationsCount,
      blockingRemainingCount
    }
  };
}
