import { StudyData } from '../types';
import { SEGMENTS_META } from '../constants';
import { checkSubclavianSteal, checkCcaSuitability } from './calculations';

export interface ValidationIssue {
  id: string;
  severity: 'error' | 'warning' | 'info';
  category: 'hemodynamic' | 'completeness' | 'plaque' | 'protocol';
  title: string;
  message: string;
  segmentId?: string;
  side?: 'right' | 'left' | 'bilateral' | 'common';
}

export function validateCarotidStudy(study: StudyData): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // 1. Check patient demographics
  if (!study.patientName.trim()) {
    issues.push({
      id: 'missing-patient-name',
      severity: 'warning',
      category: 'completeness',
      title: 'Patient Name Missing',
      message: 'Document patient full name before finalizing clinical report.',
    });
  }

  if (!study.patientId.trim()) {
    issues.push({
      id: 'missing-patient-id',
      severity: 'info',
      category: 'completeness',
      title: 'MRN / ID Missing',
      message: 'Medical record number or accession ID has not been entered.',
    });
  }

  // 2. Check Segment-Level Contradictions
  Object.keys(study.segments).forEach(id => {
    const s = study.segments[id];
    const meta = SEGMENTS_META[id];
    if (!meta) return;
    if (id.startsWith('l_bct_') && !study.variantLeftBct) return;

    // Occluded with non-zero velocity
    if (s.flowDirection === 'absent' && s.psv !== null && s.psv > 0) {
      issues.push({
        id: `occlusion-psv-${id}`,
        severity: 'error',
        category: 'hemodynamic',
        title: `Contradictory Flow & PSV in ${meta.shortName}`,
        message: `Segment flow is marked as "Absent / Occluded" but has a recorded PSV of ${s.psv} cm/s.`,
        segmentId: id,
        side: meta.side,
      });
    }

    // Stenosis marked without Plaque or without elevated PSV
    if (s.stenosisPresent && !s.plaquePresent && (s.psv === null || s.psv < 125)) {
      issues.push({
        id: `stenosis-no-plaque-${id}`,
        severity: 'warning',
        category: 'plaque',
        title: `Stenosis without Plaque in ${meta.shortName}`,
        message: `Stenosis is flagged in ${meta.name}, but plaque is marked absent and velocity is normal (${s.psv ?? 'unassessed'} cm/s).`,
        segmentId: id,
        side: meta.side,
      });
    }

    // Severe velocity without stenosis or plaque flagged
    if (s.psv !== null && s.psv >= 230 && !s.stenosisPresent) {
      issues.push({
        id: `high-psv-unflagged-${id}`,
        severity: 'warning',
        category: 'hemodynamic',
        title: `High Velocity Unflagged in ${meta.shortName}`,
        message: `PSV is ${s.psv} cm/s (meets severe criteria), but stenosis indicator is unchecked.`,
        segmentId: id,
        side: meta.side,
      });
    }
  });

  // 3. Bilateral Carotid Completeness & CCA Ratio Reference Check
  const sides: ('right' | 'left')[] = ['right', 'left'];

  sides.forEach(side => {
    const prefix = side === 'right' ? 'r_' : 'l_';
    const icaSegments = ['prox', 'mid', 'dist'].map(p => `${prefix}ica_${p}`);
    const ccaSegments = ['prox', 'mid', 'dist'].map(p => `${prefix}cca_${p}`);
    const vertSegments = ['prox', 'mid', 'dist'].map(p => `${prefix}vert_${p}`);

    const assessedIca = icaSegments.some(id => study.segments[id]?.psv !== null);
    const assessedCca = ccaSegments.some(id => study.segments[id]?.psv !== null);
    const assessedVert = vertSegments.some(id => study.segments[id]?.psv !== null);

    if (!assessedIca) {
      issues.push({
        id: `incomplete-ica-${side}`,
        severity: 'warning',
        category: 'completeness',
        title: `${side.toUpperCase()} ICA Unassessed`,
        message: `No velocity measurements recorded for the ${side} Internal Carotid Artery.`,
        side,
      });
    }

    if (!assessedCca) {
      issues.push({
        id: `incomplete-cca-${side}`,
        severity: 'info',
        category: 'completeness',
        title: `${side.toUpperCase()} CCA Unassessed`,
        message: `No velocity measurements recorded for the ${side} Common Carotid Artery.`,
        side,
      });
    }

    if (!assessedVert) {
      issues.push({
        id: `incomplete-vert-${side}`,
        severity: 'info',
        category: 'completeness',
        title: `${side.toUpperCase()} Vertebral Unassessed`,
        message: `Vertebral artery flow direction not documented on the ${side}.`,
        side,
      });
    }

    // Check Distal CCA Suitability for ICA/CCA ratio calculation
    const distalCca = study.segments[`${prefix}cca_dist`];
    const ccaSuitability = checkCcaSuitability(distalCca);
    const hasIcaStenosis = icaSegments.some(id => {
      const s = study.segments[id];
      return s && (s.stenosisPresent || (s.psv !== null && s.psv >= 125));
    });

    if (hasIcaStenosis && !ccaSuitability.suitable) {
      issues.push({
        id: `unreliable-ratio-${side}`,
        severity: 'warning',
        category: 'hemodynamic',
        title: `${side.toUpperCase()} ICA/CCA Ratio Compromised`,
        message: `Distal CCA reference segment has limitations (${ccaSuitability.reason}). Consider hemodynamic correlation with absolute velocities.`,
        side,
      });
    }

    // Subclavian Steal check
    const isSteal = checkSubclavianSteal(side, study);
    if (isSteal) {
      const subclavian = study.segments[`${prefix}subcl_prox`];
      const hasSubclavianData = subclavian && subclavian.psv !== null;

      issues.push({
        id: `steal-physiology-${side}`,
        severity: 'error',
        category: 'hemodynamic',
        title: `${side.toUpperCase()} Subclavian Steal Physiology Detected`,
        message: `Retrograde flow documented in ${side} vertebral artery. ${
          hasSubclavianData
            ? 'Verify ipsilateral subclavian artery stenosis/occlusion.'
            : 'Subclavian artery has not been fully evaluated.'
        }`,
        side,
      });
    }
  });

  return issues;
}
