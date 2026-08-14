// rules/vertebralRules.ts

import {
  ProtocolContext,
  ProtocolRequirement,
  StudyData,
  ActiveProtocol,
  SubclavianAssessment,
  SiteProtocolConfig,
  SegmentData,
  Side
} from '../types';
import { getVesselParent } from '../utils/anatomyVariants';

const stealTypeWaveforms = new Set([
  'early_systolic_deceleration',
  'bunny_waveform',
  'bunny_pre_steal',
  'bidirectional',
  'bidirectional_partial_steal',
  'retrograde',
  'complete_reversal'
]);

function capitalize(s: string): string {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function getVertebralAssessment(study: StudyData, side: Side): SegmentData | undefined {
  const prefix = side === 'right' ? 'r' : 'l';
  const mid = study.segments[`${prefix}_vert_mid`];
  const prox = study.segments[`${prefix}_vert_prox`];

  // Return the one with findings, preferring mid or prox if assessed
  if (mid && (mid.flowDirection !== 'not_assessed' || mid.psv !== null || mid.vertebralWaveformCharacter)) {
    return mid;
  }
  if (prox && (prox.flowDirection !== 'not_assessed' || prox.psv !== null || prox.vertebralWaveformCharacter)) {
    return prox;
  }
  return mid || prox;
}

export function getSubclavianAssessment(study: StudyData, side: Side): SubclavianAssessment | undefined {
  const prefix = side === 'right' ? 'r' : 'l';
  const seg = study.segments[`${prefix}_subcl_prox`];
  if (!seg) return undefined;

  let diseaseStatus: string | null = null;
  if (seg.stenosisPresent) {
    diseaseStatus = 'stenosis';
  } else if (seg.plaquePresent) {
    diseaseStatus = 'plaque';
  } else if (seg.flowDirection !== 'not_assessed' || seg.psv !== null || (seg.waveform && seg.waveform !== 'Not assessed')) {
    diseaseStatus = 'normal';
  }

  const proxAssessed = !!(seg.psv !== null || seg.waveform !== 'Not assessed' || seg.flowDirection !== 'not_assessed');
  const hasBrachial = !!(study.nonCarotidFindings?.some(f => f.type.toLowerCase().includes('brachial') || f.comments.toLowerCase().includes('brachial')) || (study.studyComments || '').toLowerCase().includes('brachial'));

  return {
    waveform: seg.waveform && seg.waveform !== 'Not assessed' ? seg.waveform : undefined,
    psv: seg.psv ?? undefined,
    edv: seg.edv ?? undefined,
    diseaseStatus: diseaseStatus ?? undefined,
    proximalOrigin: proxAssessed,
    brachialPressures: hasBrachial,
    flowDirection: seg.flowDirection,
    plaquePresent: seg.plaquePresent,
    stenosisPresent: seg.stenosisPresent,
    comments: seg.comments
  };
}

export function ensureActiveProtocol(protocol: SiteProtocolConfig | ActiveProtocol): ActiveProtocol {
  if ('dynamicRequirements' in protocol && protocol.dynamicRequirements?.vertebralAbnormality?.subclavian) {
    return protocol as ActiveProtocol;
  }
  return {
    ...protocol,
    dynamicRequirements: {
      vertebralAbnormality: {
        subclavian: {
          waveform: true,
          psv: true,
          diseaseAssessment: true,
          proximalOrigin: false,
          brachialPressures: true,
        }
      }
    }
  } as ActiveProtocol;
}

export function isSubclavianAssessmentComplete(
  assessment: SubclavianAssessment | undefined,
  protocol: ActiveProtocol
): boolean {
  if (!assessment) return false;

  const requirements =
    protocol.dynamicRequirements
      .vertebralAbnormality
      .subclavian;

  if (
    requirements.waveform &&
    !assessment.waveform
  ) {
    return false;
  }

  if (
    requirements.psv &&
    assessment.psv == null
  ) {
    return false;
  }

  if (
    requirements.diseaseAssessment &&
    assessment.diseaseStatus == null
  ) {
    return false;
  }

  if (
    requirements.proximalOrigin &&
    !assessment.proximalOrigin
  ) {
    return false;
  }

  if (
    requirements.brachialPressures &&
    !assessment.brachialPressures
  ) {
    return false;
  }

  return true;
}

export function evaluateVertebralRules(
  context: ProtocolContext
): ProtocolRequirement[] {
  const requirements: ProtocolRequirement[] = [];
  const activeProtocol = ensureActiveProtocol(context.activeProtocol);

  (['right', 'left'] as const).forEach(side => {
    const vertebral = getVertebralAssessment(context.study, side);

    if (!vertebral) return;

    const char = vertebral.vertebralWaveformCharacter || '';
    const wf = (vertebral.waveform || '').toLowerCase().replace(/\s+/g, '_');

    const abnormal =
      stealTypeWaveforms.has(char) ||
      stealTypeWaveforms.has(wf) ||
      vertebral.flowDirection === 'retrograde' ||
      vertebral.flowDirection === 'bidirectional' ||
      wf.includes('bunny') ||
      wf.includes('steal') ||
      wf.includes('deceleration') ||
      wf.includes('reversal');

    if (!abnormal) return;

    const parent = getVesselParent(
      `${side}_vertebral`,
      context.anatomy
    );

    // Important anatomical exception.
    if (parent !== `${side}_subclavian`) {
      requirements.push({
        id: `${side}-abnormal-vertebral-parent-review`,

        label:
          `Review abnormal ${side} vertebral flow in context of anatomical origin`,

        side,

        vesselId: `${side}_vertebral`,

        category: 'vertebral',

        level: 'informational',
        severity: 'information',

        blocking: false,
        allowTechnicalOverride: false,

        reason:
          `Abnormal vertebral waveform detected, but selected anatomy does not show this vertebral artery arising from the ipsilateral subclavian artery.`,

        sourceRuleId:
          'vertebral_abnormal_flow_parent_review',

        satisfied: false,
      });

      return;
    }

    const subclavian = getSubclavianAssessment(
      context.study,
      side
    );

    requirements.push({
      id: `${side}-subclavian-after-vertebral-abnormality`,

      label:
        `Complete ${side} subclavian assessment`,

      side,

      vesselId: `${side}_subclavian`,

      category: 'subclavian',

      level: 'required',
      severity: 'blocking',

      blocking: true,
      allowTechnicalOverride: true,

      reason:
        `${capitalize(side)} vertebral flow demonstrates a steal-type abnormality.`,

      sourceRuleId:
        'vertebral_abnormal_flow_requires_subclavian',

      satisfied: isSubclavianAssessmentComplete(
        subclavian,
        activeProtocol
      ),
    });
  });

  return requirements;
}
