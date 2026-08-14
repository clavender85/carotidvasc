import { SegmentData, StudyData, ClassificationSystem, NascetCalculation, SideSummary } from '../types';
import { SEGMENTS_META, getUpstreamPath } from '../constants';
import { getAnatomicalVariationReportSentences } from './anatomyVariants';

// Find the closest upstream segment with PSV that is considered "Normal" (no plaque/stenosis, flow is antegrade)
export function findUpstreamNormalSegment(
  segmentId: string,
  studyData: StudyData
): { id: string; name: string; psv: number } | null {
  const archVariant = studyData.anatomyVariants?.archVariant || (studyData.variantLeftBct ? 'bovine_common_origin' : 'standard');
  const path = getUpstreamPath(segmentId, archVariant);
  
  for (const stopId of path) {
    const s = studyData.segments[stopId];
    if (s && s.psv !== null && s.psv > 0) {
      // Normal means no plaque, no stenosis, and flow direction is antegrade
      const isNormal = !s.plaquePresent && !s.stenosisPresent && s.flowDirection === 'antegrade';
      if (isNormal) {
        return {
          id: s.id,
          name: s.name,
          psv: s.psv
        };
      }
    }
  }
  
  // Secondary pass: if no "Normal" segment found, find ANY upstream segment with a PSV as a fallback reference
  for (const stopId of path) {
    const s = studyData.segments[stopId];
    if (s && s.psv !== null && s.psv > 0) {
      return {
        id: s.id,
        name: s.name,
        psv: s.psv
      };
    }
  }
  
  return null;
}

// Calculate Local PSV Ratio for a segment
export function calculateLocalPsvRatio(
  segmentId: string,
  studyData: StudyData
): { ratio: number; referenceId: string; referenceName: string; referencePsv: number } | null {
  const current = studyData.segments[segmentId];
  if (!current || current.psv === null || current.psv <= 0) return null;

  // Check if override exists
  let refSegment: SegmentData | null = null;
  if (current.localRatioReferenceOverrideId) {
    refSegment = studyData.segments[current.localRatioReferenceOverrideId] || null;
  }

  if (refSegment && refSegment.psv !== null && refSegment.psv > 0) {
    return {
      ratio: Number((current.psv / refSegment.psv).toFixed(2)),
      referenceId: refSegment.id,
      referenceName: refSegment.name,
      referencePsv: refSegment.psv
    };
  }

  // Auto-find normal upstream
  const autoRef = findUpstreamNormalSegment(segmentId, studyData);
  if (autoRef) {
    return {
      ratio: Number((current.psv / autoRef.psv).toFixed(2)),
      referenceId: autoRef.id,
      referenceName: autoRef.name,
      referencePsv: autoRef.psv
    };
  }

  return null;
}

// Check if distal CCA is suitable as a standard reference segment
export function checkCcaSuitability(ccaSegment: SegmentData | undefined): { suitable: boolean; reason?: string } {
  if (!ccaSegment) {
    return { suitable: false, reason: "No segment data" };
  }
  if (ccaSegment.psv === null || ccaSegment.psv <= 0) {
    return { suitable: false, reason: "No velocity recorded" };
  }
  if (ccaSegment.plaquePresent) {
    return { suitable: false, reason: "Plaque is present in the distal CCA" };
  }
  if (ccaSegment.stenosisPresent) {
    return { suitable: false, reason: "Stenosis is present in the distal CCA" };
  }
  if (ccaSegment.flowDirection === 'absent') {
    return { suitable: false, reason: "Flow is absent" };
  }
  if (ccaSegment.flowDirection === 'retrograde') {
    return { suitable: false, reason: "Flow direction is retrograde" };
  }
  if (ccaSegment.waveform.toLowerCase().includes('dampened') || ccaSegment.waveform.toLowerCase().includes('tardus')) {
    return { suitable: false, reason: "Waveform is abnormal / parvus tardus" };
  }
  return { suitable: true };
}

// Get peak ICA measurements for a side
export function getPeakIcaMeasurements(side: 'right' | 'left', studyData: StudyData) {
  const sCode = side === 'right' ? 'r' : 'l';
  const prefix = `${sCode}_ica_`;
  const icaSegs = [
    studyData.segments[`${sCode}_ica_prox`],
    studyData.segments[`${sCode}_ica_mid`],
    studyData.segments[`${sCode}_ica_dist`]
  ].filter((s): s is SegmentData => !!s);

  let maxPsv = 0;
  let correspondingEdv: number | null = null;
  let maxSegId: string | null = null;
  let hasPlaque = false;
  let hasStenosis = false;

  for (const s of icaSegs) {
    if (s.plaquePresent) hasPlaque = true;
    if (s.stenosisPresent) hasStenosis = true;
    if (s.psv !== null && s.psv > maxPsv) {
      maxPsv = s.psv;
      correspondingEdv = s.edv;
      maxSegId = s.id;
    }
  }

  // Check if any plaque/stenosis is marked in the bulb, which heavily relates to ICA classification
  const bulb = studyData.segments[`${sCode}_bulb`];
  if (bulb) {
    if (bulb.plaquePresent) hasPlaque = true;
    if (bulb.stenosisPresent) hasStenosis = true;
  }

  return {
    psv: maxPsv > 0 ? maxPsv : null,
    edv: correspondingEdv,
    segmentId: maxSegId,
    hasPlaque,
    hasStenosis
  };
}

// Generate the ICA/CCA ratio
export function calculateIcaCcaRatio(side: 'right' | 'left', studyData: StudyData) {
  const peakIca = getPeakIcaMeasurements(side, studyData);
  if (peakIca.psv === null) return null;

  const defaultCcaId = side === 'right' ? 'r_cca_dist' : 'l_cca_dist';
  const ccaSegment = studyData.segments[defaultCcaId];

  if (!ccaSegment || ccaSegment.psv === null || ccaSegment.psv <= 0) {
    return null;
  }

  const ratio = Number((peakIca.psv / ccaSegment.psv).toFixed(2));
  const suitability = checkCcaSuitability(ccaSegment);

  return {
    ratio,
    ccaPsv: ccaSegment.psv,
    ccaId: defaultCcaId,
    suitable: suitability.suitable,
    reason: suitability.reason
  };
}

// Calculate NASCET Stenosis % = (1 - A/B) * 100
export function calculateNascetStenosis(a: number | null, b: number | null): number | null {
  if (a === null || b === null || b <= 0) return null;
  if (a > b) return 0; // residual lumen cannot be larger than normal, but safety clamp
  const pct = (1 - a / b) * 100;
  return Number(pct.toFixed(1));
}

// Core Classification Engine
export function suggestIcaStenosisCategory(
  side: 'right' | 'left',
  studyData: StudyData
): { category: string; criteriaUsed: string } {
  const system = studyData.classificationSystem;
  const peak = getPeakIcaMeasurements(side, studyData);
  const ratioData = calculateIcaCcaRatio(side, studyData);
  
  const psv = peak.psv;
  const edv = peak.edv;
  const ratio = ratioData ? ratioData.ratio : null;
  const hasPlaque = peak.hasPlaque;
  const hasStenosis = peak.hasStenosis;

  // Let's check for occlusion/near occlusion markers
  // If user has set flow to absent on all ICA segments, it's occluded
  const prefix = side === 'right' ? 'r_ica_' : 'l_ica_';
  const proxSeg = studyData.segments[`${prefix}prox`];
  const midSeg = studyData.segments[`${prefix}mid`];
  const distSeg = studyData.segments[`${prefix}dist`];
  
  const allIcaAbsent = (proxSeg?.flowDirection === 'absent' && midSeg?.flowDirection === 'absent' && distSeg?.flowDirection === 'absent');
  const anyIcaStringSign = (proxSeg?.comments.toLowerCase().includes('string sign') || 
                            midSeg?.comments.toLowerCase().includes('string sign') ||
                            distSeg?.comments.toLowerCase().includes('string sign') ||
                            proxSeg?.comments.toLowerCase().includes('near occlusion') ||
                            midSeg?.comments.toLowerCase().includes('near occlusion'));

  if (allIcaAbsent || (psv === 0 && edv === 0)) {
    return {
      category: "Total Occlusion (100%)",
      criteriaUsed: "No detectable flow or patent lumen on B-mode/Doppler."
    };
  }

  if (anyIcaStringSign || (psv !== null && psv < 40 && hasStenosis && (proxSeg?.comments.toLowerCase().includes('string') || midSeg?.comments.toLowerCase().includes('string')))) {
    return {
      category: "Near Occlusion (95-99%)",
      criteriaUsed: "Markedly narrowed residual lumen ('string sign') confirmed on imaging, velocities may be paradoxically high or low."
    };
  }

  if (psv === null) {
    return {
      category: "Not Assessed",
      criteriaUsed: "Requires ICA PSV measurement."
    };
  }

  // --- ASUM 2021 LOGIC ---
  if (system === 'ASUM_2021') {
    const desc = "ASUM 2021 Criteria";
    
    if (psv < 125 && (!ratio || ratio < 2.0) && !hasPlaque && !hasStenosis) {
      return { category: "Normal (0% Stenosis)", criteriaUsed: `${desc}: Normal Doppler velocities (PSV < 125 cm/s, Ratio < 2.0) and no visible plaque.` };
    }
    
    if (psv < 125 && (!ratio || ratio < 2.0) && (hasPlaque || hasStenosis)) {
      return { category: "Mild Stenosis (<50%)", criteriaUsed: `${desc}: Focal plaque present with hemodynamically non-significant velocities (PSV < 125 cm/s, ICA/CCA Ratio < 2.0).` };
    }
    
    // 70-79% Supporting: PSV > 270 OR EDV > 110 OR Ratio > 4
    const meets70to79 = (psv > 270 || (edv !== null && edv > 110) || (ratio !== null && ratio > 4.0));
    // >80% Supporting: PSV > 270 AND EDV > 140 AND Ratio > 4
    const meets80to99 = (psv > 270 && (edv !== null && edv > 140) && (ratio !== null && ratio > 4.0));

    if (meets80to99) {
      return { category: "Critical Stenosis (80-94%)", criteriaUsed: `${desc}: Extreme velocity acceleration (PSV > 270 cm/s, EDV > 140 cm/s, and ICA/CCA Ratio > 4.0).` };
    }
    
    if (meets70to79) {
      return { category: "Severe Stenosis (70-79%)", criteriaUsed: `${desc}: Severe velocity acceleration (PSV > 270 cm/s OR EDV > 110 cm/s OR ICA/CCA Ratio > 4.0).` };
    }
    
    // 50-69%: PSV >= 125 and/or ratio >= 2
    if (psv >= 125 || (ratio !== null && ratio >= 2.0)) {
      return { category: "Moderate Stenosis (50-69%)", criteriaUsed: `${desc}: Hemodynamically significant stenosis indicated by PSV >= 125 cm/s and/or ICA/CCA Ratio >= 2.0.` };
    }
    
    return { category: "Mild Stenosis (<50%)", criteriaUsed: `${desc}: Normal velocities with mild wall plaque.` };
  }

  // --- MODIFIED SRU / IAC 2023 LOGIC ---
  if (system === 'IAC_MODIFIED_SRU_2023' || system === 'MODIFIED_SRU_2021') {
    const desc = "IAC Modified SRU 2023 Criteria";
    
    // Normal: PSV < 180 cm/s, no plaque, Ratio < 2, EDV < 40
    const normalVel = psv < 180 && (!ratio || ratio < 2) && (edv === null || edv < 40);
    if (normalVel && !hasPlaque) {
      return { category: "Normal (0% Stenosis)", criteriaUsed: `${desc}: PSV < 180 cm/s, EDV < 40 cm/s, no plaque, and ICA/CCA Ratio < 2.0.` };
    }
    
    if (normalVel && hasPlaque) {
      return { category: "Mild Stenosis (<50%)", criteriaUsed: `${desc}: Plaque present with normal velocities (PSV < 180 cm/s, EDV < 40 cm/s, Ratio < 2.0).` };
    }

    // >=70%: PSV > 230, plaque >50%, ratio > 4, EDV > 100
    const meets70 = (psv > 230 || (ratio !== null && ratio > 4.0) || (edv !== null && edv > 100));
    if (meets70) {
      return { category: "Severe Stenosis (>=70%)", criteriaUsed: `${desc}: Severe Doppler criteria (PSV > 230 cm/s, EDV > 100 cm/s, and/or ICA/CCA Ratio > 4.0).` };
    }

    // 50-69%: PSV 180-230, plaque >50%, Ratio 2-4, EDV 40-100
    const meets50to69 = (psv >= 180 && psv <= 230) || (ratio !== null && ratio >= 2.0 && ratio <= 4.0) || (edv !== null && edv >= 40 && edv <= 100);
    if (meets50to69) {
      return { category: "Moderate Stenosis (50-69%)", criteriaUsed: `${desc}: Moderate acceleration (PSV 180-230 cm/s, EDV 40-100 cm/s, Ratio 2.0-4.0).` };
    }

    // Exception check: PSV 125-180 but Ratio >= 2.0, significant plaque
    if (psv >= 125 && psv < 180 && (ratio !== null && ratio >= 2.0) && hasPlaque) {
      return { category: "Moderate Stenosis (50-69%)", criteriaUsed: `${desc} [IAC Exception]: PSV 125–180 cm/s with ICA/CCA ratio >= 2.0 and significant plaque.` };
    }

    return { category: "Mild Stenosis (<50%)", criteriaUsed: `${desc}: Mild velocity findings.` };
  }

  // --- UK JOINT RECOMMENDATIONS ---
  if (system === 'UK_JOINT') {
    const desc = "UK Joint Recommendations";
    if (psv < 125 && (!ratio || ratio < 2.0)) {
      return { category: "Normal (<50% Stenosis)", criteriaUsed: `${desc}: PSV < 125 cm/s, ICA/CCA Ratio < 2.0.` };
    }
    if (psv > 230 || (ratio !== null && ratio > 4.0) || (edv !== null && edv > 100)) {
      return { category: "Severe Stenosis (>=70%)", criteriaUsed: `${desc}: PSV > 230 cm/s, EDV > 100 cm/s, Ratio > 4.0.` };
    }
    if ((psv >= 125 && psv <= 230) || (ratio !== null && ratio >= 2.0 && ratio <= 4.0)) {
      return { category: "Moderate Stenosis (50-69%)", criteriaUsed: `${desc}: PSV 125-230 cm/s, Ratio 2.0-4.0.` };
    }
    return { category: "Normal (<50% Stenosis)", criteriaUsed: `${desc}: Normal or sub-hemodynamic velocities.` };
  }

  // --- STANDARD SRU 2003 LOGIC ---
  if (system === 'SRU_2003') {
    const desc = "SRU 2003 Criteria";
    
    if (psv < 125 && !hasPlaque) {
      return { category: "Normal (0% Stenosis)", criteriaUsed: `${desc}: PSV < 125 cm/s, no plaque.` };
    }
    if (psv < 125 && hasPlaque) {
      return { category: "Mild Stenosis (<50%)", criteriaUsed: `${desc}: PSV < 125 cm/s with plaque.` };
    }
    if (psv > 230 || (ratio !== null && ratio > 4.0) || (edv !== null && edv > 100)) {
      return { category: "Severe Stenosis (>=70%)", criteriaUsed: `${desc}: PSV > 230 cm/s, EDV > 100 cm/s, and/or ICA/CCA Ratio > 4.0.` };
    }
    if ((psv >= 125 && psv <= 230) || (ratio !== null && ratio >= 2.0 && ratio <= 4.0)) {
      return { category: "Moderate Stenosis (50-69%)", criteriaUsed: `${desc}: PSV 125-230 cm/s and/or ICA/CCA Ratio 2.0-4.0.` };
    }
    return { category: "Mild Stenosis (<50%)", criteriaUsed: `${desc}: Plaque with PSV < 125 cm/s.` };
  }

  // --- SONOGRAPHIC NASCET INDEX ---
  if (system === 'NASCET_INDEX') {
    const desc = "Sonographic NASCET Index";
    
    // Check if we have calculated NASCET percentage
    const nascetState = side === 'right' ? studyData.nascet.right : studyData.nascet.left;
    const nascetLong = calculateNascetStenosis(nascetState.longitudinal.minLumenA, nascetState.longitudinal.normalLumenB);
    const nascetTrans = calculateNascetStenosis(nascetState.transverse.minLumenA, nascetState.transverse.normalLumenB);
    
    // Find maximum calculated percent stenosis
    let maxNascet: number | null = null;
    if (nascetLong !== null) maxNascet = nascetLong;
    if (nascetTrans !== null && (maxNascet === null || nascetTrans > maxNascet)) {
      maxNascet = nascetTrans;
    }
    
    if (maxNascet !== null) {
      if (maxNascet === 0) {
        return { category: "Normal (0% Stenosis)", criteriaUsed: `${desc}: Calculated 0% diameter reduction.` };
      }
      if (maxNascet < 30) {
        return { category: "Mild Stenosis (<30%)", criteriaUsed: `${desc}: Calculated ${maxNascet}% diameter reduction.` };
      }
      if (maxNascet < 50) {
        return { category: "Mild Stenosis (30-49%)", criteriaUsed: `${desc}: Calculated ${maxNascet}% diameter reduction.` };
      }
      if (maxNascet < 60) {
        return { category: "Moderate Stenosis (50-59%)", criteriaUsed: `${desc}: Calculated ${maxNascet}% diameter reduction.` };
      }
      if (maxNascet < 70) {
        return { category: "Moderate-Severe Stenosis (60-69%)", criteriaUsed: `${desc}: Calculated ${maxNascet}% diameter reduction.` };
      }
      if (maxNascet < 95) {
        return { category: "Severe Stenosis (>=70%)", criteriaUsed: `${desc}: Calculated ${maxNascet}% diameter reduction.` };
      }
      if (maxNascet < 100) {
        return { category: "Near Occlusion (95-99%)", criteriaUsed: `${desc}: Calculated ${maxNascet}% diameter reduction.` };
      }
      return { category: "Total Occlusion (100%)", criteriaUsed: `${desc}: Calculated 100% diameter reduction.` };
    }
    
    if (ratio === null) {
      return { category: "Requires Ratio", criteriaUsed: "NASCET Index requires ICA/CCA ratio or direct diameter values." };
    }
    if (ratio < 1.5) {
      return { category: "Mild Stenosis (<30%)", criteriaUsed: `${desc} (Ratio-based fallback): ICA/CCA Ratio < 1.5.` };
    }
    if (ratio >= 1.5 && ratio < 2.0) {
      return { category: "Mild Stenosis (30-49%)", criteriaUsed: `${desc} (Ratio-based fallback): ICA/CCA Ratio 1.5-2.0.` };
    }
    if (ratio >= 2.0 && ratio < 3.0) {
      return { category: "Moderate Stenosis (50-59%)", criteriaUsed: `${desc} (Ratio-based fallback): ICA/CCA Ratio 2.0-3.0.` };
    }
    if (ratio >= 3.0 && ratio < 4.0) {
      return { category: "Moderate-Severe Stenosis (60-69%)", criteriaUsed: `${desc} (Ratio-based fallback): ICA/CCA Ratio 3.0-4.0.` };
    }
    if (ratio >= 4.0) {
      return { category: "Severe Stenosis (>=70%)", criteriaUsed: `${desc} (Ratio-based fallback): ICA/CCA Ratio >= 4.0.` };
    }
    return { category: "Indeterminate", criteriaUsed: `${desc}: Velocity details incomplete.` };
  }

  // --- CUSTOM LABORATORY CRITERIA ---
  if (system === 'CUSTOM') {
    const desc = "Custom Laboratory Criteria";
    const thresholds = studyData.customThresholds;
    
    if (psv < thresholds.normalMaxPsv && (!ratio || ratio < thresholds.normalMaxRatio)) {
      return { category: "Normal / Minimal Disease", criteriaUsed: `${desc}: PSV < ${thresholds.normalMaxPsv} cm/s and Ratio < ${thresholds.normalMaxRatio}.` };
    }
    if (psv >= thresholds.stenosis70MaxPsv || (ratio && ratio >= thresholds.stenosis70MaxRatio)) {
      return { category: "Severe Stenosis (>=70%)", criteriaUsed: `${desc}: PSV >= ${thresholds.stenosis70MaxPsv} cm/s and/or Ratio >= ${thresholds.stenosis70MaxRatio}.` };
    }
    if (psv >= thresholds.stenosis50MaxPsv || (ratio && ratio >= thresholds.stenosis50MaxRatio)) {
      return { category: "Moderate Stenosis (50-69%)", criteriaUsed: `${desc}: PSV >= ${thresholds.stenosis50MaxPsv} cm/s and/or Ratio >= ${thresholds.stenosis50MaxRatio}.` };
    }
    return { category: "Mild Stenosis (<50%)", criteriaUsed: `${desc}: Normal or mild velocity elevation below Moderate threshold.` };
  }

  return { category: "Indeterminate", criteriaUsed: "Incomplete database parameters." };
}

// Subclavian Steal Review Checks
export function checkSubclavianSteal(side: 'right' | 'left', studyData: StudyData): boolean {
  // If vertebral artery segments on that side are marked retrograde or bidirectional, flag the subclavian artery
  const prefix = side === 'right' ? 'r_vert_' : 'l_vert_';
  const vertSegs = [
    studyData.segments[`${prefix}prox`],
    studyData.segments[`${prefix}mid`],
    studyData.segments[`${prefix}dist`]
  ];

  for (const s of vertSegs) {
    if (s && (s.flowDirection === 'retrograde' || s.flowDirection === 'bidirectional')) {
      return true;
    }
  }
  return false;
}

// Compute the Side Summary object automatically
export function generateSideSummary(side: 'right' | 'left', studyData: StudyData): SideSummary {
  const peak = getPeakIcaMeasurements(side, studyData);
  const ratioResult = calculateIcaCcaRatio(side, studyData);
  
  // Vertebral direction: look at mid segment as standard representative
  const vertPrefix = side === 'right' ? 'r_vert_' : 'l_vert_';
  const midVert = studyData.segments[`${vertPrefix}mid`];
  const vertFlow = midVert ? midVert.flowDirection : 'not_assessed';

  // Subclavian findings: pull from subclavian proximal/distal
  const subclPrefix = side === 'right' ? 'r_subcl_' : 'l_subcl_';
  const subclProx = studyData.segments[`${subclPrefix}prox`];
  const subclDist = studyData.segments[`${subclPrefix}dist`];
  
  let subclavianFindings = "Not assessed";
  if (subclProx && subclDist) {
    if (subclProx.psv !== null || subclDist.psv !== null) {
      const psvStr = `Prox PSV: ${subclProx.psv !== null ? subclProx.psv + ' cm/s' : 'N/A'}, Dist PSV: ${subclDist.psv !== null ? subclDist.psv + ' cm/s' : 'N/A'}`;
      const waveStr = `Waveform: ${subclProx.waveform || subclDist.waveform || 'N/A'}`;
      subclavianFindings = `${psvStr}. ${waveStr}`;
      if (subclProx.stenosisPresent || subclDist.stenosisPresent) {
        subclavianFindings += ` (Stenosis/Plaque documented)`;
      }
    }
  }

  const stealSuspected = checkSubclavianSteal(side, studyData);
  if (stealSuspected) {
    subclavianFindings += ` [! Hemodynamic Variant: Retrograde Vertebral Flow suspects Subclavian Steal]`;
  }

  // NASCET values
  const nascetState = side === 'right' ? studyData.nascet.right : studyData.nascet.left;
  const nascetLong = calculateNascetStenosis(nascetState.longitudinal.minLumenA, nascetState.longitudinal.normalLumenB);
  const nascetTrans = calculateNascetStenosis(nascetState.transverse.minLumenA, nascetState.transverse.normalLumenB);

  // Plaque details for side
  const sidePlaques = studyData.plaques.filter(p => 
    p.segments.some(segId => segId.startsWith(side === 'right' ? 'r_' : 'l_'))
  );

  let maxPlaqueLocation: string | null = null;
  let maxThickness: number | null = null;
  let plaqueMorphology: string | null = null;

  if (sidePlaques.length > 0) {
    // find plaque with max thickness
    let maxPl = sidePlaques[0];
    for (const pl of sidePlaques) {
      if (pl.maxThicknessMm !== null && (maxPl.maxThicknessMm === null || pl.maxThicknessMm > maxPl.maxThicknessMm)) {
        maxPl = pl;
      }
    }
    
    maxPlaqueLocation = SEGMENTS_META[maxPl.maxPlaqueSite]?.name || maxPl.maxPlaqueSite || "Multiple segments";
    maxThickness = maxPl.maxThicknessMm;
    plaqueMorphology = `${maxPl.composition} composition, ${maxPl.surface} surface. Calcific shadowing: ${maxPl.calcificShadowing}`;
  } else {
    // check if any segments have plaquePresent marked
    const plaqueSegments = Object.values(studyData.segments).filter(s => s.side === side && s.plaquePresent);
    if (plaqueSegments.length > 0) {
      maxPlaqueLocation = plaqueSegments.map(s => SEGMENTS_META[s.id]?.shortName || s.name).join(', ');
      plaqueMorphology = "Documented on segment(s). Plaque form details not registered.";
    }
  }

  const suggested = suggestIcaStenosisCategory(side, studyData);
  const confirmed = side === 'right' ? studyData.classifications.right.confirmed : studyData.classifications.left.confirmed;

  return {
    highestIcaPsv: peak.psv,
    highestIcaPsvSegmentId: peak.segmentId,
    correspondingIcaEdv: peak.edv,
    distalCcaPsv: ratioResult ? ratioResult.ccaPsv : (studyData.segments[side === 'right' ? 'r_cca_dist' : 'l_cca_dist']?.psv || null),
    icaCcaRatio: ratioResult ? ratioResult.ratio : null,
    icaCcaRatioOverridden: false,
    icaCcaRatioReferenceId: ratioResult ? ratioResult.ccaId : (side === 'right' ? 'r_cca_dist' : 'l_cca_dist'),
    maxPlaqueLocation,
    maxPlaqueThickness: maxThickness,
    plaqueMorphology,
    nascetEstimateLongitudinal: nascetLong,
    nascetEstimateTransverse: nascetTrans,
    suggestedClassification: suggested.category,
    confirmedClassification: confirmed === 'Not Classified' ? suggested.category : confirmed,
    vertebralFlowDirection: vertFlow,
    subclavianFindings,
    subclavianStealSuspected: stealSuspected,
    imtMm: side === 'right' ? studyData.imt.right : studyData.imt.left
  };
}

// Generate structured clinical impression narrative text
export function generateClinicalImpressionNarrative(studyData: StudyData): {
  right: string;
  left: string;
  overall: string;
} {
  const rightSummary = generateSideSummary('right', studyData);
  const leftSummary = generateSideSummary('left', studyData);

  // Right Side Narrative
  let rightText = `RIGHT ICA: ${rightSummary.confirmedClassification}.`;
  if (rightSummary.highestIcaPsv !== null) {
    rightText += ` Peak PSV ${rightSummary.highestIcaPsv} cm/s, EDV ${rightSummary.correspondingIcaEdv ?? 'N/A'} cm/s.`;
  }
  if (rightSummary.icaCcaRatio !== null) {
    rightText += ` ICA/CCA PSV Ratio ${rightSummary.icaCcaRatio}.`;
  }
  if (rightSummary.maxPlaqueLocation) {
    rightText += ` Plaque at ${rightSummary.maxPlaqueLocation}`;
    if (rightSummary.maxPlaqueThickness !== null) {
      rightText += ` (thickness ${rightSummary.maxPlaqueThickness} mm)`;
    }
    rightText += `.`;
  }
  if (rightSummary.vertebralFlowDirection !== 'not_assessed') {
    rightText += ` Right vertebral flow: ${rightSummary.vertebralFlowDirection}.`;
  }
  if (rightSummary.subclavianStealSuspected) {
    rightText += ` [Subclavian steal physiology suspected].`;
  }

  // Left Side Narrative
  let leftText = `LEFT ICA: ${leftSummary.confirmedClassification}.`;
  if (leftSummary.highestIcaPsv !== null) {
    leftText += ` Peak PSV ${leftSummary.highestIcaPsv} cm/s, EDV ${leftSummary.correspondingIcaEdv ?? 'N/A'} cm/s.`;
  }
  if (leftSummary.icaCcaRatio !== null) {
    leftText += ` ICA/CCA PSV Ratio ${leftSummary.icaCcaRatio}.`;
  }
  if (leftSummary.maxPlaqueLocation) {
    leftText += ` Plaque at ${leftSummary.maxPlaqueLocation}`;
    if (leftSummary.maxPlaqueThickness !== null) {
      leftText += ` (thickness ${leftSummary.maxPlaqueThickness} mm)`;
    }
    leftText += `.`;
  }
  if (leftSummary.vertebralFlowDirection !== 'not_assessed') {
    leftText += ` Left vertebral flow: ${leftSummary.vertebralFlowDirection}.`;
  }
  if (leftSummary.subclavianStealSuspected) {
    leftText += ` [Subclavian steal physiology suspected].`;
  }

  // Overall Narrative
  const protoName = studyData.classificationSystem.replace(/_/g, ' ');
  let overall = `CAROTID DOPPLER IMPRESSION (${protoName}):\n`;
  overall += `1. ${rightText}\n`;
  overall += `2. ${leftText}\n`;

  let sectionIdx = 3;
  const variantSentences = getAnatomicalVariationReportSentences(studyData);
  if (variantSentences.length > 0) {
    overall += `${sectionIdx}. ANATOMICAL VARIATION: ${variantSentences.join(' ')}\n`;
    sectionIdx++;
  }

  if (studyData.nonCarotidFindings && studyData.nonCarotidFindings.length > 0) {
    const ncStr = studyData.nonCarotidFindings.map(f => `${f.side.toUpperCase()} ${f.type}${f.sizeMm ? ` (${f.sizeMm} mm)` : ''}: ${f.comments}`).join('; ');
    overall += `${sectionIdx}. Associated Pathologies / Non-Carotid: ${ncStr}.\n`;
  }

  return {
    right: rightText,
    left: leftText,
    overall
  };
}

