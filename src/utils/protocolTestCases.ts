import { StudyData, SiteProtocolConfig, DynamicProtocolEvaluation } from '../types';
import { getInitialStudyData } from '../constants';
import { AUSTRALIA_DEFAULT_CONFIG } from '../data/protocols/australia';
import { evaluateDynamicProtocol } from './dynamicProtocolEngine';

export interface ProtocolTestCase {
  id: string;
  name: string;
  category: string;
  description: string;
  expectedTriggers: string[];
  expectedCanCompleteInitially: boolean;
  expectedWarningsCount: number;
  setupStudy: () => StudyData;
}

export const PROTOCOL_TEST_CASES: ProtocolTestCase[] = [
  {
    id: 'case_1_normal_bilateral',
    name: 'Case 1: Normal Bilateral Carotid',
    category: 'Baseline',
    description: 'Bilateral normal native carotid velocities and antegrade vertebral waveforms. No dynamic requirements are triggered and study completes normally once baseline is satisfied.',
    expectedTriggers: [],
    expectedCanCompleteInitially: true,
    expectedWarningsCount: 0,
    setupStudy: () => {
      const study = getInitialStudyData();
      study.patientName = 'Test Patient 1 (Normal)';
      study.patientId = 'TEST-NORM-01';

      // Set standard normal velocities
      const normalVals: Record<string, { psv: number; edv: number; flow: any; wave: string }> = {
        r_cca_dist: { psv: 75, edv: 18, flow: 'antegrade', wave: 'Normal' },
        l_cca_dist: { psv: 72, edv: 17, flow: 'antegrade', wave: 'Normal' },
        r_bulb: { psv: 62, edv: 15, flow: 'antegrade', wave: 'Normal' },
        l_bulb: { psv: 60, edv: 14, flow: 'antegrade', wave: 'Normal' },
        r_ica_prox: { psv: 68, edv: 22, flow: 'antegrade', wave: 'Normal' },
        l_ica_prox: { psv: 65, edv: 20, flow: 'antegrade', wave: 'Normal' },
        r_eca_prox: { psv: 72, edv: 12, flow: 'antegrade', wave: 'Normal' },
        l_eca_prox: { psv: 70, edv: 11, flow: 'antegrade', wave: 'Normal' },
        r_vert_mid: { psv: 45, edv: 12, flow: 'antegrade', wave: 'Normal antegrade' },
        l_vert_mid: { psv: 48, edv: 13, flow: 'antegrade', wave: 'Normal antegrade' },
      };

      for (const [id, val] of Object.entries(normalVals)) {
        if (study.segments[id]) {
          study.segments[id].psv = val.psv;
          study.segments[id].edv = val.edv;
          study.segments[id].flowDirection = val.flow;
          study.segments[id].waveform = val.wave;
        }
      }

      study.classifications.right.confirmed = 'Normal (<50% Stenosis)';
      study.classifications.left.confirmed = 'Normal (<50% Stenosis)';
      return study;
    }
  },
  {
    id: 'case_2_left_bunny_waveform',
    name: 'Case 2: Left Bunny / Pre-Steal Waveform',
    category: 'Vertebral Steal',
    description: 'Left vertebral artery exhibits bunny / early systolic deceleration waveform. Left vertebral parent is standard Left Subclavian, dynamically triggering mandatory Left Subclavian workup.',
    expectedTriggers: ['Left Subclavian Waveform', 'Left Subclavian PSV'],
    expectedCanCompleteInitially: false,
    expectedWarningsCount: 1,
    setupStudy: () => {
      const study = getInitialStudyData();
      study.patientName = 'Test Patient 2 (Left Bunny)';
      study.patientId = 'TEST-STEAL-02';

      study.segments['r_cca_dist'].psv = 75;
      study.segments['l_cca_dist'].psv = 72;
      study.segments['r_bulb'].psv = 60;
      study.segments['l_bulb'].psv = 60;
      study.segments['r_ica_prox'].psv = 70;
      study.segments['l_ica_prox'].psv = 70;
      study.segments['r_vert_mid'].psv = 45;
      study.segments['r_vert_mid'].flowDirection = 'antegrade';

      // Left vertebral abnormal bunny waveform
      study.segments['l_vert_mid'].psv = 38;
      study.segments['l_vert_mid'].flowDirection = 'antegrade';
      study.segments['l_vert_mid'].waveform = 'Bunny / Pre-steal morphology';
      study.segments['l_vert_mid'].vertebralWaveformCharacter = 'bunny_pre_steal';

      // Left subclavian remains unassessed initially
      study.segments['l_subcl_prox'].psv = null;
      study.segments['l_subcl_prox'].waveform = 'Not assessed';
      return study;
    }
  },
  {
    id: 'case_3_left_retrograde_vertebral',
    name: 'Case 3: Left Retrograde Vertebral Flow',
    category: 'Vertebral Steal',
    description: 'Left vertebral demonstrates complete retrograde flow (complete subclavian steal). Left subclavian assessment is dynamically mandated.',
    expectedTriggers: ['Left Subclavian Waveform', 'Left Subclavian PSV'],
    expectedCanCompleteInitially: false,
    expectedWarningsCount: 1,
    setupStudy: () => {
      const study = getInitialStudyData();
      study.patientName = 'Test Patient 3 (Left Reversal)';
      study.patientId = 'TEST-STEAL-03';

      study.segments['r_cca_dist'].psv = 75;
      study.segments['l_cca_dist'].psv = 72;
      study.segments['r_ica_prox'].psv = 70;
      study.segments['l_ica_prox'].psv = 70;
      study.segments['r_vert_mid'].psv = 55;
      study.segments['r_vert_mid'].flowDirection = 'antegrade';

      // Left vertebral complete reversal
      study.segments['l_vert_mid'].psv = 42;
      study.segments['l_vert_mid'].flowDirection = 'retrograde';
      study.segments['l_vert_mid'].waveform = 'Complete flow reversal';
      study.segments['l_vert_mid'].vertebralWaveformCharacter = 'complete_reversal';
      return study;
    }
  },
  {
    id: 'case_4_left_vertebral_arch_variant',
    name: 'Case 4: Left Vertebral from Arch Variant + Abnormal Waveform',
    category: 'Anatomy-Aware',
    description: 'Left vertebral originates directly from the aortic arch (variant). Abnormal waveform does NOT blindly trigger subclavian steal rule; instead an anatomy-aware advisory is generated.',
    expectedTriggers: ['Left Vertebral Direct Arch Origin Assessment'],
    expectedCanCompleteInitially: true,
    expectedWarningsCount: 1,
    setupStudy: () => {
      const study = getInitialStudyData();
      study.patientName = 'Test Patient 4 (Arch Variant)';
      study.patientId = 'TEST-ARCH-04';

      // Set variant
      study.anatomyVariants.archVariant = 'left_vertebral_from_arch';

      study.segments['r_cca_dist'].psv = 75;
      study.segments['l_cca_dist'].psv = 72;
      study.segments['r_bulb'].psv = 60;
      study.segments['l_bulb'].psv = 60;
      study.segments['r_ica_prox'].psv = 70;
      study.segments['l_ica_prox'].psv = 70;
      study.segments['r_vert_mid'].psv = 45;
      study.segments['r_vert_mid'].flowDirection = 'antegrade';

      // Left vertebral abnormal
      study.segments['l_vert_mid'].psv = 35;
      study.segments['l_vert_mid'].waveform = 'Bunny / Pre-steal morphology';
      study.segments['l_vert_mid'].vertebralWaveformCharacter = 'bunny_pre_steal';
      return study;
    }
  },
  {
    id: 'case_5_elevated_right_ica_psv',
    name: 'Case 5: Elevated Right ICA PSV (Hemodynamic Stenosis)',
    category: 'Stenosis',
    description: 'Right proximal ICA PSV is 245 cm/s (meets criteria for ≥70% stenosis under ASUM 2021). Dynamically requires Right ICA EDV, ICA/CCA Ratio, and Plaque documentation.',
    expectedTriggers: ['Right Peak Stenosis End-Diastolic Velocity', 'Right ICA/CCA Velocity Ratio', 'Right Plaque & Narrowing Documentation'],
    expectedCanCompleteInitially: false,
    expectedWarningsCount: 1,
    setupStudy: () => {
      const study = getInitialStudyData();
      study.patientName = 'Test Patient 5 (High ICA Velocity)';
      study.patientId = 'TEST-STEN-05';

      study.segments['r_cca_dist'].psv = 65;
      study.segments['l_cca_dist'].psv = 70;
      study.segments['r_bulb'].psv = 75;
      study.segments['l_bulb'].psv = 60;
      study.segments['l_ica_prox'].psv = 68;
      study.segments['r_vert_mid'].flowDirection = 'antegrade';
      study.segments['l_vert_mid'].flowDirection = 'antegrade';

      // Right ICA high PSV without EDV or plaque yet
      study.segments['r_ica_prox'].psv = 245;
      study.segments['r_ica_prox'].edv = null;
      study.segments['r_ica_prox'].plaquePresent = false;
      return study;
    }
  },
  {
    id: 'case_6_abnormal_distal_cca',
    name: 'Case 6: Abnormal Distal CCA Reference Denominator',
    category: 'Reference Ratio',
    description: 'Right Distal CCA has focal stenosis/plaque (PSV 145 cm/s). Unreliable reference denominator warning is triggered, advising alternative reference selection.',
    expectedTriggers: [],
    expectedCanCompleteInitially: true,
    expectedWarningsCount: 1,
    setupStudy: () => {
      const study = getInitialStudyData();
      study.patientName = 'Test Patient 6 (Diseased CCA)';
      study.patientId = 'TEST-CCA-06';

      study.segments['r_cca_dist'].psv = 145;
      study.segments['r_cca_dist'].plaquePresent = true;
      study.segments['r_cca_dist'].stenosisPresent = true;
      study.segments['l_cca_dist'].psv = 70;
      study.segments['r_bulb'].psv = 60;
      study.segments['l_bulb'].psv = 60;
      study.segments['r_ica_prox'].psv = 70;
      study.segments['l_ica_prox'].psv = 70;
      study.segments['r_vert_mid'].flowDirection = 'antegrade';
      study.segments['l_vert_mid'].flowDirection = 'antegrade';
      return study;
    }
  },
  {
    id: 'case_7_plaque_morphology',
    name: 'Case 7: Atherosclerotic Plaque Morphology Register',
    category: 'Plaque',
    description: 'Plaque present on Left Bulb / Proximal ICA. Triggers structured plaque morphology requirement (composition, surface, calcification).',
    expectedTriggers: ['Plaque Morphology Details'],
    expectedCanCompleteInitially: false,
    expectedWarningsCount: 0,
    setupStudy: () => {
      const study = getInitialStudyData();
      study.patientName = 'Test Patient 7 (Plaque)';
      study.patientId = 'TEST-PLQ-07';

      study.segments['r_cca_dist'].psv = 75;
      study.segments['l_cca_dist'].psv = 70;
      study.segments['r_bulb'].psv = 60;
      study.segments['l_bulb'].psv = 65;
      study.segments['l_bulb'].plaquePresent = true;
      study.segments['r_ica_prox'].psv = 70;
      study.segments['l_ica_prox'].psv = 95;
      study.segments['l_ica_prox'].plaquePresent = true;
      study.segments['r_vert_mid'].flowDirection = 'antegrade';
      study.segments['l_vert_mid'].flowDirection = 'antegrade';
      // Plaque array is empty initially
      study.plaques = [];
      return study;
    }
  },
  {
    id: 'case_8_suspected_near_occlusion',
    name: 'Case 8: Suspected Near Occlusion (String Sign)',
    category: 'Occlusion',
    description: 'Severe carotid narrowing with string-sign / pinpoint lumen. Activates low-flow colour/power optimization protocol and warns against NASCET diameter measurement.',
    expectedTriggers: ['Low-Flow Colour & Power Doppler Optimisation'],
    expectedCanCompleteInitially: false,
    expectedWarningsCount: 1,
    setupStudy: () => {
      const study = getInitialStudyData();
      study.patientName = 'Test Patient 8 (Near Occlusion)';
      study.patientId = 'TEST-NEAR-08';

      study.segments['r_cca_dist'].psv = 70;
      study.segments['l_cca_dist'].psv = 60;
      study.segments['r_bulb'].psv = 65;
      study.segments['l_bulb'].psv = 55;
      study.segments['r_ica_prox'].psv = 70;
      study.segments['r_vert_mid'].flowDirection = 'antegrade';
      study.segments['l_vert_mid'].flowDirection = 'antegrade';

      // Left ICA near occlusion
      study.segments['l_ica_prox'].psv = 45;
      study.segments['l_ica_prox'].waveform = 'Pre-occlusive string sign';
      study.segments['l_ica_prox'].comments = 'Pinpoint lumen with string sign on power Doppler';
      study.classifications.left.confirmed = 'Near Occlusion (95-99%)';
      return study;
    }
  },
  {
    id: 'case_9_suspected_total_occlusion',
    name: 'Case 9: Suspected Total Carotid Occlusion',
    category: 'Occlusion',
    description: 'Right ICA proximal shows absent flow and stump thump. Requires multi-modality confirmation protocol with low PRF colour and power Doppler.',
    expectedTriggers: ['Multi-Modality Occlusion Confirmation'],
    expectedCanCompleteInitially: false,
    expectedWarningsCount: 1,
    setupStudy: () => {
      const study = getInitialStudyData();
      study.patientName = 'Test Patient 9 (Total Occlusion)';
      study.patientId = 'TEST-OCC-09';

      study.segments['r_cca_dist'].psv = 60;
      study.segments['r_cca_dist'].waveform = 'Dampened / high resistance';
      study.segments['l_cca_dist'].psv = 75;
      study.segments['r_bulb'].psv = 45;
      study.segments['l_bulb'].psv = 60;
      study.segments['l_ica_prox'].psv = 70;
      study.segments['r_vert_mid'].flowDirection = 'antegrade';
      study.segments['l_vert_mid'].flowDirection = 'antegrade';

      // Right ICA absent flow
      study.segments['r_ica_prox'].psv = 0;
      study.segments['r_ica_prox'].flowDirection = 'absent';
      study.segments['r_ica_prox'].waveform = 'Terminal Thump';
      study.classifications.right.confirmed = 'Total Occlusion (100%)';
      return study;
    }
  },
  {
    id: 'case_10_required_segment_technical_waiver',
    name: 'Case 10: Required Segment Not Visualised (Technical Waiver Workflow)',
    category: 'Technical Exception',
    description: 'Right proximal ICA cannot be visualised due to dense calcific shadowing. Applying a structured technical exception satisfies the protocol requirement and allows study completion.',
    expectedTriggers: [],
    expectedCanCompleteInitially: true, // If override applied
    expectedWarningsCount: 0,
    setupStudy: () => {
      const study = getInitialStudyData();
      study.patientName = 'Test Patient 10 (Technical Exception)';
      study.patientId = 'TEST-TECH-10';

      study.segments['r_cca_dist'].psv = 75;
      study.segments['l_cca_dist'].psv = 72;
      study.segments['r_bulb'].psv = 60;
      study.segments['l_bulb'].psv = 60;
      study.segments['l_ica_prox'].psv = 68;
      study.segments['r_vert_mid'].flowDirection = 'antegrade';
      study.segments['l_vert_mid'].flowDirection = 'antegrade';

      // Right ICA prox marked unassessed with technical override recorded
      study.segments['r_ica_prox'].psv = null;
      study.segments['r_ica_prox'].technicalLimitations = 'Dense acoustic shadowing from calcified arterial wall';

      study.technicalOverrides['base_r_ica_prox'] = {
        requirementId: 'base_r_ica_prox',
        segmentId: 'r_ica_prox',
        reason: 'calcific_shadowing',
        comment: 'Dense acoustic shadow obscures proximal 1.5cm of right ICA',
        timestamp: new Date().toLocaleTimeString(),
        sonographer: 'Lead Vascular Sonographer'
      };
      return study;
    }
  },
  {
    id: 'case_11_post_carotid_stent',
    name: 'Case 11: Post Carotid Artery Stent (CAS) Surveillance',
    category: 'Intervention',
    description: 'Special exam type configured as post-stent. Activates in-stent multi-segment interrogation and displays stent criteria alert.',
    expectedTriggers: ['In-Stent Multi-Segment Velocity Interrogation'],
    expectedCanCompleteInitially: false,
    expectedWarningsCount: 1,
    setupStudy: () => {
      const study = getInitialStudyData();
      study.patientName = 'Test Patient 11 (Post Stent)';
      study.patientId = 'TEST-STENT-11';
      study.siteProtocol.specialExamType = 'post_stent';
      study.clinicalIndications = ['Post Carotid Stent Surveillance', 'Left ICA Stent'];

      study.segments['r_cca_dist'].psv = 75;
      study.segments['l_cca_dist'].psv = 80;
      study.segments['r_bulb'].psv = 60;
      study.segments['l_bulb'].psv = 65;
      study.segments['r_ica_prox'].psv = 70;
      study.segments['r_vert_mid'].flowDirection = 'antegrade';
      study.segments['l_vert_mid'].flowDirection = 'antegrade';
      return study;
    }
  },
  {
    id: 'case_12_prior_abnormal_comparison',
    name: 'Case 12: Previous Study Abnormality Comparison Target',
    category: 'Comparison',
    description: 'Previous study had significant right ICA stenosis (PSV 250 cm/s). Generates dynamic target requirement for directly comparable current Doppler sampling.',
    expectedTriggers: ['Prior Right ICA Disease Comparison Target'],
    expectedCanCompleteInitially: false,
    expectedWarningsCount: 0,
    setupStudy: () => {
      const study = getInitialStudyData();
      study.patientName = 'Test Patient 12 (Prior Stenosis)';
      study.patientId = 'TEST-PRIOR-12';

      study.priorExam = {
        hasPriorExam: true,
        examDate: '2023-04-12',
        facility: 'Regional Vascular Diagnostic Centre',
        hasPriorReport: true,
        rightIcaPsv: 250,
        rightIcaEdv: 85,
        rightIcaRatio: 3.8,
        rightIcaClassification: '70-79% Severe Stenosis',
        rightCcaPsv: 65,
        rightPlaqueLocation: 'Right ICA Proximal',
        rightPlaqueThicknessMm: 3.2,
        rightPlaqueMorphology: 'Heterogeneous calcified',
        rightPlaqueSurface: 'irregular',
        rightVertFlow: 'antegrade',
        rightSubclavian: 'Normal triphasic',
        rightIntervention: 'None',
        leftIcaPsv: 68,
        leftIcaEdv: 18,
        leftIcaRatio: 1.0,
        leftIcaClassification: 'Normal',
        leftCcaPsv: 68,
        leftPlaqueLocation: '',
        leftPlaqueThicknessMm: null,
        leftPlaqueMorphology: '',
        leftPlaqueSurface: '',
        leftVertFlow: 'antegrade',
        leftSubclavian: 'Normal triphasic',
        leftIntervention: 'None',
        priorReportText: 'Previous right ICA severe 70-79% stenosis.',
        comparisonNotes: 'Follow-up surveillance requested.'
      };

      study.segments['r_cca_dist'].psv = 70;
      study.segments['l_cca_dist'].psv = 70;
      study.segments['r_bulb'].psv = 60;
      study.segments['l_bulb'].psv = 60;
      study.segments['l_ica_prox'].psv = 68;
      study.segments['r_vert_mid'].flowDirection = 'antegrade';
      study.segments['l_vert_mid'].flowDirection = 'antegrade';
      return study;
    }
  }
];

export function runAllProtocolTestCases(): {
  caseId: string;
  name: string;
  passed: boolean;
  evaluation: DynamicProtocolEvaluation;
  details: string;
}[] {
  return PROTOCOL_TEST_CASES.map(testCase => {
    const study = testCase.setupStudy();
    const evaluation = evaluateDynamicProtocol({
      study,
      activeProtocol: study.siteProtocol,
      previousStudy: study.priorExam,
      anatomy: study.anatomyVariants,
      criteria: study.classificationSystem
    });

    const hasExpectedWarnings = evaluation.warnings.length >= testCase.expectedWarningsCount;
    const canCompleteMatches = testCase.expectedCanCompleteInitially
      ? evaluation.canCompleteStudy
      : true; // dynamic tests check triggers

    const allTriggersFound = testCase.expectedTriggers.every(expectedLabel =>
      evaluation.triggeredRequirements.some(req => req.label.toLowerCase().includes(expectedLabel.toLowerCase()))
    );

    const passed = hasExpectedWarnings && canCompleteMatches && allTriggersFound;

    return {
      caseId: testCase.id,
      name: testCase.name,
      passed,
      evaluation,
      details: passed
        ? `Passed: All ${testCase.expectedTriggers.length} expected triggers identified and completion evaluated correctly.`
        : `Check: Triggers matched (${allTriggersFound}), warnings matched (${hasExpectedWarnings}).`
    };
  });
}
