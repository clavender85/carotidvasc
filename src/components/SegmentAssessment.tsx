import React, { useState, useEffect, useMemo } from 'react';
import { StudyData, SegmentData, FlowDirection, PlaqueData, PlaqueComposition, PlaqueSurface, CalcificShadowing } from '../types';
import { SEGMENTS_META } from '../constants';
import { 
  suggestIcaStenosisCategory, 
  getPeakIcaMeasurements, 
  calculateIcaCcaRatio, 
  calculateNascetStenosis, 
  checkCcaSuitability 
} from '../utils/calculations';
import { 
  Activity, 
  Check, 
  ShieldAlert, 
  Layers, 
  Sliders, 
  X, 
  MoreHorizontal, 
  ExternalLink,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  AlertTriangle
} from 'lucide-react';

interface SegmentAssessmentProps {
  studyData: StudyData;
  selectedIds: string[];
  activeId: string | null;
  onSelectSegment?: (id: string, isMulti: boolean) => void;
  onSetActiveSegment: (id: string) => void;
  onRemoveSelectedSegment: (id: string) => void;
  onUpdateSegment: (id: string, updates: Partial<SegmentData>) => void;
  onUpdateSegmentsBulk?: (ids: string[], updates: Partial<SegmentData>) => void;
  onAddPlaqueFromSegments?: (ids: string[]) => void;
  onAddPlaque?: (plaque: PlaqueData) => void;
  onUpdateStudy?: (updates: Partial<StudyData>) => void;
  onOpenNascet?: (side: 'right' | 'left') => void;
}

// Groupings for structured anatomy
interface VesselGroup {
  name: string;
  vesselKey: string;
  side: 'right' | 'left';
  segmentIds: string[];
}

export const SegmentAssessment: React.FC<SegmentAssessmentProps> = ({
  studyData,
  selectedIds,
  activeId,
  onSelectSegment,
  onSetActiveSegment,
  onRemoveSelectedSegment,
  onUpdateSegment,
  onUpdateSegmentsBulk,
  onAddPlaque,
  onUpdateStudy,
}) => {
  // Tab state
  const [activeSideTab, setActiveSideTab] = useState<'right' | 'left' | 'bilateral'>('right');
  
  // Drawer / Popover for advanced details (when '⋯' is clicked)
  const [advancedDrawerSegmentId, setAdvancedDrawerSegmentId] = useState<string | null>(null);

  // Synchronize tab with selected segment if active
  useEffect(() => {
    if (activeId) {
      const meta = SEGMENTS_META[activeId];
      if (meta && activeSideTab !== 'bilateral') {
        if (meta.side === 'right' || meta.side === 'left') {
          if (meta.side !== activeSideTab) {
            setActiveSideTab(meta.side);
          }
        }
      }
      // Scroll corresponding row into view smoothly
      const rowEl = document.getElementById(`worksheet-row-${activeId}`);
      if (rowEl) {
        rowEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [activeId]);

  // Define segments for Right and Left in clinical order: CCA -> Bulb -> ICA -> ECA -> Vert -> Subclavian
  const rightSegmentIds = [
    'r_cca_prox', 'r_cca_mid', 'r_cca_dist',
    'r_bulb',
    'r_ica_prox', 'r_ica_mid', 'r_ica_dist',
    'r_eca_prox', 'r_eca_dist',
    'r_vert_prox', 'r_vert_mid', 'r_vert_dist',
    'r_subcl_prox', 'r_subcl_dist'
  ];

  const leftSegmentIds = [
    'l_cca_prox', 'l_cca_mid', 'l_cca_dist',
    'l_bulb',
    'l_ica_prox', 'l_ica_mid', 'l_ica_dist',
    'l_eca_prox', 'l_eca_dist',
    'l_vert_prox', 'l_vert_mid', 'l_vert_dist',
    'l_subcl_prox', 'l_subcl_dist'
  ];

  // Manual expand/collapse state for optional Subclavian Artery (keyed by side)
  const [subclavianManualToggle, setSubclavianManualToggle] = useState<Record<string, boolean>>({});

  // Helper to detect if a vertebral artery has atypical / steal waveforms or abnormal flow
  const isVertAtypical = (side: 'right' | 'left'): { atypical: boolean; reason?: string } => {
    const prefix = side === 'right' ? 'r_' : 'l_';
    const p = studyData.segments[`${prefix}vert_prox`];
    const m = studyData.segments[`${prefix}vert_mid`];
    const d = studyData.segments[`${prefix}vert_dist`];
    const segs = [p, m, d].filter(Boolean);

    for (const seg of segs) {
      if (seg.flowDirection === 'retrograde') {
        return { atypical: true, reason: 'Retrograde Flow (Subclavian Steal)' };
      }
      if (seg.flowDirection === 'bidirectional') {
        return { atypical: true, reason: 'Bidirectional Flow (Partial Steal)' };
      }
      const wf = (seg.waveform || '').toLowerCase();
      if (wf.includes('retrograde') || wf.includes('reversal')) {
        return { atypical: true, reason: 'Retrograde Waveform (Steal)' };
      }
      if (wf.includes('bunny') || wf.includes('steal') || wf.includes('deceleration') || wf.includes('early systolic')) {
        return { atypical: true, reason: 'Bunny / Pre-Steal Pattern' };
      }
      if (wf.includes('high resistance') || wf.includes('dampened') || wf.includes('tardus')) {
        return { atypical: true, reason: `${seg.waveform}` };
      }
      if (wf.includes('absent') || seg.stenosisPresent) {
        return { atypical: true, reason: 'Severe Pathology / Stenosis' };
      }
      if (seg.psv !== null && (seg.psv > 120 || seg.psv < 12)) {
        return { atypical: true, reason: `Abnormal Velocity (${seg.psv} cm/s)` };
      }
    }
    return { atypical: false };
  };

  // Helper to check if user has documented data in Subclavian
  const hasSubclavianData = (side: 'right' | 'left'): boolean => {
    const prefix = side === 'right' ? 'r_' : 'l_';
    const p = studyData.segments[`${prefix}subcl_prox`];
    const d = studyData.segments[`${prefix}subcl_dist`];
    return [p, d].some(s => s && (
      s.psv !== null ||
      s.edv !== null ||
      s.plaquePresent ||
      s.stenosisPresent ||
      (s.waveform && s.waveform !== 'Not assessed' && s.waveform !== 'Multiphasic') ||
      Boolean(s.comments)
    ));
  };

  // Subclavian visibility evaluator
  const getIsSubclavianExpanded = (side: 'right' | 'left'): boolean => {
    if (subclavianManualToggle[side] !== undefined) {
      return subclavianManualToggle[side];
    }
    // Auto-expand if vertebral is atypical OR if subclavian already has documented data
    return isVertAtypical(side).atypical || hasSubclavianData(side);
  };

  // Define vessel groups in strict clinical sequence: CCA -> Bulb -> ICA -> ECA -> Vertebral -> Subclavian (±)
  const vesselGroups: VesselGroup[] = useMemo(() => {
    const sides: ('right' | 'left')[] = activeSideTab === 'bilateral' ? ['right', 'left'] : [activeSideTab];
    const groups: VesselGroup[] = [];

    sides.forEach(side => {
      const prefix = side === 'right' ? 'r_' : 'l_';
      const sideShort = side === 'right' ? 'Rt' : 'Lt';

      // 1. Common Carotid (CCA)
      groups.push({
        name: `${sideShort} CCA`,
        vesselKey: 'cca',
        side,
        segmentIds: [`${prefix}cca_prox`, `${prefix}cca_mid`, `${prefix}cca_dist`]
      });

      // 2. Carotid Bulb
      groups.push({
        name: `${sideShort} Bulb`,
        vesselKey: 'bulb',
        side,
        segmentIds: [`${prefix}bulb`]
      });

      // 3. Internal Carotid (ICA)
      groups.push({
        name: `${sideShort} ICA`,
        vesselKey: 'ica',
        side,
        segmentIds: [`${prefix}ica_prox`, `${prefix}ica_mid`, `${prefix}ica_dist`]
      });

      // 4. External Carotid (ECA)
      groups.push({
        name: `${sideShort} ECA`,
        vesselKey: 'eca',
        side,
        segmentIds: [`${prefix}eca_prox`, `${prefix}eca_dist`]
      });

      // 5. Vertebral Artery
      groups.push({
        name: `${sideShort} Vert`,
        vesselKey: 'vertebral',
        side,
        segmentIds: [`${prefix}vert_prox`, `${prefix}vert_mid`, `${prefix}vert_dist`]
      });

      // 6. Subclavian Artery (±)
      groups.push({
        name: `${sideShort} Subclavian (±)`,
        vesselKey: 'subclavian',
        side,
        segmentIds: [`${prefix}subcl_prox`, `${prefix}subcl_dist`]
      });
    });

    return groups;
  }, [activeSideTab]);

  // Hemodynamic calculations per side
  const rIcaPeak = useMemo(() => getPeakIcaMeasurements('right', studyData), [studyData]);
  const lIcaPeak = useMemo(() => getPeakIcaMeasurements('left', studyData), [studyData]);

  const rIcaCcaRatio = useMemo(() => calculateIcaCcaRatio('right', studyData), [studyData]);
  const lIcaCcaRatio = useMemo(() => calculateIcaCcaRatio('left', studyData), [studyData]);

  const rCcaRefVal = studyData.segments['r_cca_dist']?.psv ?? null;
  const lCcaRefVal = studyData.segments['l_cca_dist']?.psv ?? null;

  // Vertebral state summary
  const getVertSummary = (side: 'right' | 'left') => {
    const prefix = side === 'right' ? 'r_' : 'l_';
    const p = studyData.segments[`${prefix}vert_prox`];
    const m = studyData.segments[`${prefix}vert_mid`];
    const d = studyData.segments[`${prefix}vert_dist`];
    const anyRetro = [p, m, d].some(s => s?.flowDirection === 'retrograde' || s?.waveform?.toLowerCase().includes('retrograde') || s?.waveform?.toLowerCase().includes('reversal'));
    const anySteal = [p, m, d].some(s => s?.flowDirection === 'bidirectional' || s?.waveform?.toLowerCase().includes('steal') || s?.waveform?.toLowerCase().includes('deceleration') || s?.waveform?.toLowerCase().includes('bunny'));
    if (anyRetro) return { text: '⚠ Retrograde / Reversal (Steal)', isAbnormal: true };
    if (anySteal) return { text: '⚠ Pre-Steal / Bidirectional', isAbnormal: true };
    return { text: 'Antegrade Flow', isAbnormal: false };
  };

  // Group Header Summary Generator
  const getGroupSummary = (group: VesselGroup) => {
    const side = group.side;
    if (group.vesselKey === 'cca') {
      const refVal = side === 'right' ? rCcaRefVal : lCcaRefVal;
      return refVal ? `REF PSV ${refVal}` : 'Distal CCA Ref';
    }
    if (group.vesselKey === 'bulb') {
      const bulbSeg = studyData.segments[`${side === 'right' ? 'r_' : 'l_'}bulb`];
      const plaque = studyData.plaques.find(p => p.segments.includes(`${side === 'right' ? 'r_' : 'l_'}bulb`));
      if (bulbSeg?.plaquePresent) {
        return `Plaque: ${plaque?.luminalNarrowingVisible || 'Present'}`;
      }
      return 'Flow Separation';
    }
    if (group.vesselKey === 'ica') {
      const peak = side === 'right' ? rIcaPeak : lIcaPeak;
      const ratio = side === 'right' ? rIcaCcaRatio : lIcaCcaRatio;
      const nascetCalc = side === 'right' ? studyData.nascetRight : studyData.nascetLeft;
      const nascetPct = nascetCalc?.calculatedPercent ? Math.round(nascetCalc.calculatedPercent) : null;
      
      const suggestedResult = suggestIcaStenosisCategory(side, studyData);
      const suggestedCategory = suggestedResult?.category || '';

      const parts: string[] = [];
      if (suggestedCategory && !suggestedCategory.includes('Normal') && !suggestedCategory.includes('<50%') && !suggestedCategory.includes('mild')) {
        parts.push(suggestedCategory.split('(')[0].trim());
      }
      if (peak.psv) {
        parts.push(`MAX PSV ${peak.psv}`);
      }
      if (ratio && ratio.ratio) {
        parts.push(`RATIO ${ratio.ratio.toFixed(2)}`);
      }
      if (nascetPct !== null) {
        parts.push(`NASCET ${nascetPct}%`);
      }

      return parts.length > 0 ? parts.join(' | ') : 'Normal Low Resistance';
    }
    if (group.vesselKey === 'eca') {
      const ecaProx = studyData.segments[`${side === 'right' ? 'r_' : 'l_'}eca_prox`];
      if (ecaProx?.psv && ecaProx.psv > 150) {
        return `PSV ${ecaProx.psv} | High Resistance`;
      }
      return 'High Resistance';
    }
    if (group.vesselKey === 'vertebral') {
      const vert = getVertSummary(side);
      const vertAtypical = isVertAtypical(side);
      if (vertAtypical.atypical) {
        return `⚠ ${vertAtypical.reason || vert.text} → Check Subclavian`;
      }
      return vert.text;
    }
    if (group.vesselKey === 'subclavian') {
      const prox = studyData.segments[`${side === 'right' ? 'r_' : 'l_'}subcl_prox`];
      const dist = studyData.segments[`${side === 'right' ? 'r_' : 'l_'}subcl_dist`];
      const vertAtypical = isVertAtypical(side);
      if (vertAtypical.atypical) {
        return `⚠ Investigation Prompted (${vertAtypical.reason})`;
      }
      if ((prox?.psv && prox.psv > 150) || (dist?.psv && dist.psv > 150)) {
        return '⚠ High Velocity Jet';
      }
      if (hasSubclavianData(side)) {
        return 'Documented Flow';
      }
      return 'Optional (±)';
    }
    return '';
  };

  // Vessel-specific Waveform Options
  const getWaveformOptionsForSegment = (segmentId: string): string[] => {
    if (segmentId.includes('subcl')) {
      return [
        'Multiphasic',
        'Biphasic',
        'Monophasic',
        'Dampened',
        'Turbulent / high velocity',
        'Tardus-parvus',
        'Absent',
        'Not assessed'
      ];
    }
    if (segmentId.includes('vert')) {
      return [
        'Normal antegrade',
        'Early systolic deceleration',
        'Bunny / pre-steal',
        'Bidirectional / partial steal',
        'Retrograde / complete reversal',
        'High resistance',
        'Dampened',
        'Absent',
        'Not assessed'
      ];
    }
    if (segmentId.includes('cca')) {
      return [
        'Normal',
        'High resistance',
        'Low resistance',
        'Tardus-parvus',
        'Dampened',
        'Turbulent',
        'Absent',
        'Not assessed'
      ];
    }
    if (segmentId.includes('bulb')) {
      return [
        'Normal boundary layer separation',
        'Disturbed / swirling flow',
        'Turbulent / high velocity',
        'Dampened',
        'Absent',
        'Not assessed'
      ];
    }
    if (segmentId.includes('ica')) {
      return [
        'Normal low resistance',
        'Turbulent / high velocity',
        'Tardus-parvus',
        'Dampened',
        'Very low flow',
        'Pre-occlusive / terminal pattern',
        'Absent',
        'Not assessed'
      ];
    }
    if (segmentId.includes('eca')) {
      return [
        'Normal high resistance',
        'Positive temporal tap',
        'Low resistance (internalized/collateral)',
        'Turbulent / high velocity',
        'Absent',
        'Not assessed'
      ];
    }
    return ['Normal', 'Dampened', 'Turbulent', 'Tardus-parvus', 'Absent', 'Not assessed'];
  };

  // Stenosis dropdown options
  const getStenosisOptionsForSegment = (segmentId: string): { label: string; value: string }[] => {
    if (segmentId.includes('ica')) {
      return [
        { label: 'None', value: 'normal' },
        { label: '<50%', value: '<50%' },
        { label: '50–69%', value: '50-69%' },
        { label: '≥70%', value: '>=70%' },
        { label: 'Near occlusion', value: 'near_occlusion' },
        { label: 'Occluded', value: 'occluded' },
        { label: 'Indeterminate', value: 'indeterminate' }
      ];
    }
    return [
      { label: 'None', value: 'normal' },
      { label: '<50%', value: '<50%' },
      { label: '50–69%', value: '50-69%' },
      { label: '≥70%', value: '>=70%' },
      { label: 'Occluded', value: 'occluded' },
      { label: 'Indeterminate', value: 'indeterminate' }
    ];
  };

  // Helper to determine plaque composition for segment
  const getSegmentPlaqueComposition = (segId: string): 'none' | 'echogenic' | 'hypoechoic' | 'calcified' | 'mixed' => {
    const seg = studyData.segments[segId];
    if (!seg || !seg.plaquePresent) return 'none';
    const plaque = studyData.plaques.find(p => p.segments.includes(segId));
    if (!plaque || !plaque.composition) return 'echogenic';
    const comp = plaque.composition.toLowerCase();
    if (comp.includes('calcified') || comp.includes('dense') || comp.includes('calc')) return 'calcified';
    if (comp.includes('hypoechoic') || comp.includes('soft') || comp.includes('lipid') || comp.includes('intraplaque')) return 'hypoechoic';
    if (comp.includes('mixed') || comp.includes('heterogeneous') || comp.includes('complex')) return 'mixed';
    if (comp.includes('echogenic') || comp.includes('fibrous') || comp.includes('homogeneous')) return 'echogenic';
    return 'echogenic';
  };

  // Helper to determine plaque surface for segment
  const getSegmentPlaqueSurface = (segId: string): 'none' | 'smooth' | 'irregular' | 'ulcerated' => {
    const seg = studyData.segments[segId];
    if (!seg || !seg.plaquePresent) return 'none';
    const plaque = studyData.plaques.find(p => p.segments.includes(segId));
    if (!plaque || !plaque.surface) return 'smooth';
    const surf = plaque.surface.toLowerCase();
    if (surf.includes('ulcer')) return 'ulcerated';
    if (surf.includes('irreg')) return 'irregular';
    if (surf.includes('smooth')) return 'smooth';
    return 'smooth';
  };

  // Helper to determine stenosis label for segment
  const getSegmentStenosisGrade = (segId: string): string => {
    const seg = studyData.segments[segId];
    if (!seg || !seg.stenosisPresent) return 'normal';
    if (seg.comments?.includes('>=70%') || seg.comments?.includes('70-99')) return '>=70%';
    if (seg.comments?.includes('50-69%')) return '50-69%';
    if (seg.comments?.includes('<50%')) return '<50%';
    if (seg.comments?.includes('near_occlusion')) return 'near_occlusion';
    if (seg.comments?.includes('occluded') || seg.flowDirection === 'absent') return 'occluded';
    return '50-69%';
  };

  // Handle PSV change
  const handlePsvChange = (id: string, valueStr: string) => {
    const num = valueStr.trim() === '' ? null : parseFloat(valueStr);
    const validNum = num !== null && !isNaN(num) && num >= 0 ? num : null;
    
    let updates: Partial<SegmentData> = { psv: validNum };

    if (id.includes('ica') && validNum !== null) {
      if (validNum >= 125) {
        updates.stenosisPresent = true;
      }
    }

    onUpdateSegment(id, updates);
  };

  // Handle EDV change
  const handleEdvChange = (id: string, valueStr: string) => {
    const num = valueStr.trim() === '' ? null : parseFloat(valueStr);
    const validNum = num !== null && !isNaN(num) && num >= 0 ? num : null;
    onUpdateSegment(id, { edv: validNum });
  };

  // Handle Waveform change
  const handleWaveformChange = (id: string, waveformVal: string) => {
    let updates: Partial<SegmentData> = { waveform: waveformVal };
    
    // If vertebral, synchronize flowDirection
    if (id.includes('vert')) {
      if (waveformVal.toLowerCase().includes('retrograde') || waveformVal.toLowerCase().includes('reversal')) {
        updates.flowDirection = 'retrograde';
      } else if (waveformVal.toLowerCase().includes('bidirectional') || waveformVal.toLowerCase().includes('steal') || waveformVal.toLowerCase().includes('deceleration') || waveformVal.toLowerCase().includes('bunny')) {
        updates.flowDirection = 'bidirectional';
      } else if (waveformVal.toLowerCase().includes('absent')) {
        updates.flowDirection = 'absent';
      } else if (waveformVal.toLowerCase().includes('antegrade')) {
        updates.flowDirection = 'antegrade';
      }
    }

    onUpdateSegment(id, updates);
  };

  // Handle Plaque Composition change
  const handlePlaqueCompositionChange = (id: string, compVal: string) => {
    const meta = SEGMENTS_META[id];
    
    if (compVal === 'none' || compVal === 'None') {
      onUpdateSegment(id, {
        plaquePresent: false
      });
      // Remove or detach plaque
      const existingPlaques = studyData.plaques
        .map(p => ({
          ...p,
          segments: p.segments.filter(sId => sId !== id)
        }))
        .filter(p => p.segments.length > 0);

      if (onUpdateStudy) {
        onUpdateStudy({ plaques: existingPlaques });
      }
    } else {
      const existingPlaque = studyData.plaques.find(p => p.segments.includes(id));
      const isCalcified = compVal === 'calcified';
      
      if (!existingPlaque) {
        const newPlaqueId = `plaque_${id}_${Date.now()}`;
        const newPlaque: PlaqueData = {
          id: newPlaqueId,
          segments: [id],
          locationDescription: meta?.name || id,
          maxPlaqueSite: id,
          maxThicknessMm: isCalcified ? 2.4 : 1.8,
          composition: compVal,
          surface: 'smooth',
          calcificShadowing: isCalcified ? 'partial' : 'none',
          luminalNarrowingVisible: 'Mild wall thickening (<50%)',
          freeTextDescription: `${compVal.toUpperCase()} plaque at ${meta?.name || id}`
        };
        if (onAddPlaque) {
          onAddPlaque(newPlaque);
        } else if (onUpdateStudy) {
          onUpdateStudy({ plaques: [...studyData.plaques, newPlaque] });
        }
      } else {
        const updated = studyData.plaques.map(p => p.id === existingPlaque.id ? { 
          ...p, 
          composition: compVal,
          calcificShadowing: isCalcified ? (p.calcificShadowing === 'none' ? 'partial' : p.calcificShadowing) : p.calcificShadowing
        } : p);
        if (onUpdateStudy) {
          onUpdateStudy({ plaques: updated });
        }
      }

      onUpdateSegment(id, {
        plaquePresent: true
      });
    }
  };

  // Handle Plaque Surface change
  const handlePlaqueSurfaceChange = (id: string, surfVal: string) => {
    const meta = SEGMENTS_META[id];
    
    if (surfVal === 'none' || surfVal === '—') {
      const existingPlaque = studyData.plaques.find(p => p.segments.includes(id));
      if (existingPlaque && onUpdateStudy) {
        const updated = studyData.plaques.map(p => p.id === existingPlaque.id ? { ...p, surface: 'smooth' as PlaqueSurface } : p);
        onUpdateStudy({ plaques: updated });
      }
      return;
    }

    const surfaceTyped = surfVal as PlaqueSurface;
    const existingPlaque = studyData.plaques.find(p => p.segments.includes(id));

    if (!existingPlaque) {
      const newPlaqueId = `plaque_${id}_${Date.now()}`;
      const newPlaque: PlaqueData = {
        id: newPlaqueId,
        segments: [id],
        locationDescription: meta?.name || id,
        maxPlaqueSite: id,
        maxThicknessMm: 1.8,
        composition: 'echogenic',
        surface: surfaceTyped,
        calcificShadowing: 'none',
        luminalNarrowingVisible: 'Mild wall thickening (<50%)',
        freeTextDescription: `${surfaceTyped.toUpperCase()} surface plaque at ${meta?.name || id}`
      };
      if (onAddPlaque) {
        onAddPlaque(newPlaque);
      } else if (onUpdateStudy) {
        onUpdateStudy({ plaques: [...studyData.plaques, newPlaque] });
      }
    } else {
      const updated = studyData.plaques.map(p => p.id === existingPlaque.id ? { 
        ...p, 
        surface: surfaceTyped 
      } : p);
      if (onUpdateStudy) {
        onUpdateStudy({ plaques: updated });
      }
    }

    onUpdateSegment(id, {
      plaquePresent: true
    });
  };

  // Handle Stenosis change
  const handleStenosisChange = (id: string, stenosisVal: string) => {
    const isPresent = stenosisVal !== 'normal' && stenosisVal !== 'None' && stenosisVal !== 'none';
    onUpdateSegment(id, { 
      stenosisPresent: isPresent,
      comments: isPresent ? `Stenosis grade: ${stenosisVal}` : ''
    });
  };

  // Row selection handler (toggles selection & highlights map)
  const handleRowClick = (id: string) => {
    if (selectedIds.includes(id)) {
      onRemoveSelectedSegment(id);
    } else {
      onSetActiveSegment(id);
      if (onSelectSegment) {
        onSelectSegment(id, false);
      }
    }
  };

  // Mark active side normal
  const handleMarkSideNormal = (side: 'right' | 'left') => {
    const ids = side === 'right' ? rightSegmentIds : leftSegmentIds;
    ids.forEach(id => {
      onUpdateSegment(id, {
        psv: id.includes('cca') ? 70 : id.includes('ica') ? 65 : id.includes('eca') ? 75 : id.includes('vert') ? 45 : 95,
        edv: id.includes('ica') ? 22 : id.includes('cca') ? 18 : id.includes('eca') ? 14 : id.includes('vert') ? 12 : 10,
        waveform: id.includes('subcl') ? 'Multiphasic' : id.includes('vert') ? 'Normal antegrade' : id.includes('ica') ? 'Normal low resistance' : id.includes('eca') ? 'Normal high resistance' : 'Normal',
        flowDirection: 'antegrade',
        plaquePresent: false,
        stenosisPresent: false,
        comments: ''
      });
    });

    // Clean plaques for this side
    if (onUpdateStudy) {
      const remainingPlaques = studyData.plaques.filter(p => !p.segments.some(segId => ids.includes(segId)));
      onUpdateStudy({ plaques: remainingPlaques });
    }
  };

  // Key Findings calculation for the footer summary
  const keyFindings = useMemo(() => {
    const findings: { id: string; text: string; type: 'severe' | 'moderate' | 'warning' | 'info' }[] = [];
    const checkSides: ('right' | 'left')[] = activeSideTab === 'bilateral' ? ['right', 'left'] : [activeSideTab];

    checkSides.forEach(side => {
      const sidePrefix = side === 'right' ? 'r_' : 'l_';
      const sideName = side === 'right' ? 'Right' : 'Left';

      // 1. ICA Stenosis
      const peak = side === 'right' ? rIcaPeak : lIcaPeak;
      const ratio = side === 'right' ? rIcaCcaRatio : lIcaCcaRatio;
      const nascetCalc = side === 'right' ? studyData.nascetRight : studyData.nascetLeft;
      const nascetPct = nascetCalc?.calculatedPercent ? Math.round(nascetCalc.calculatedPercent) : null;

      const icaProx = studyData.segments[`${sidePrefix}ica_prox`];
      const icaMid = studyData.segments[`${sidePrefix}ica_mid`];
      const icaDist = studyData.segments[`${sidePrefix}ica_dist`];
      const icaSegments = [icaProx, icaMid, icaDist].filter(Boolean);

      const severeIca = icaSegments.find(s => (s.psv && s.psv >= 230) || (s.comments && s.comments.includes('>=70%')) || s.flowDirection === 'absent');
      const modIca = icaSegments.find(s => (s.psv && s.psv >= 125 && s.psv < 230) || (s.comments && s.comments.includes('50-69%')));

      if (severeIca) {
        const segMeta = SEGMENTS_META[severeIca.id];
        const gradeText = severeIca.flowDirection === 'absent' ? 'Total Occlusion' : '≥70% Stenosis';
        const psvText = severeIca.psv ? ` (PSV ${severeIca.psv} cm/s${ratio?.ratio ? `, Ratio ${ratio.ratio.toFixed(1)}` : ''})` : '';
        const nascetText = nascetPct ? ` [NASCET: ${nascetPct}%]` : '';
        findings.push({
          id: `ica_severe_${side}`,
          text: `${sideName} ${segMeta?.shortName || 'ICA'}: ${gradeText}${psvText}${nascetText}${severeIca.plaquePresent ? ' with atheroma' : ''}.`,
          type: 'severe'
        });
      } else if (modIca) {
        const segMeta = SEGMENTS_META[modIca.id];
        const psvText = modIca.psv ? ` (PSV ${modIca.psv} cm/s${ratio?.ratio ? `, Ratio ${ratio.ratio.toFixed(1)}` : ''})` : '';
        findings.push({
          id: `ica_mod_${side}`,
          text: `${sideName} ${segMeta?.shortName || 'ICA'}: 50–69% Stenosis${psvText}.`,
          type: 'moderate'
        });
      }

      // 2. Vertebral flow / steal
      const vertProx = studyData.segments[`${sidePrefix}vert_prox`];
      const vertMid = studyData.segments[`${sidePrefix}vert_mid`];
      const vertDist = studyData.segments[`${sidePrefix}vert_dist`];
      const vertSegs = [vertProx, vertMid, vertDist].filter(Boolean);

      const retroVert = vertSegs.find(s => s.flowDirection === 'retrograde' || s.waveform?.toLowerCase().includes('retrograde') || s.waveform?.toLowerCase().includes('reversal'));
      const stealVert = vertSegs.find(s => s.flowDirection === 'bidirectional' || s.waveform?.toLowerCase().includes('steal') || s.waveform?.toLowerCase().includes('bunny') || s.waveform?.toLowerCase().includes('deceleration'));

      if (retroVert) {
        findings.push({
          id: `vert_retro_${side}`,
          text: `${sideName} Vertebral: Retrograde flow (complete subclavian steal physiology).`,
          type: 'severe'
        });
      } else if (stealVert) {
        findings.push({
          id: `vert_steal_${side}`,
          text: `${sideName} Vertebral: Pre-steal / bidirectional waveform requiring subclavian investigation.`,
          type: 'warning'
        });
      }

      // 3. Subclavian stenosis / dampening
      const subProx = studyData.segments[`${sidePrefix}subcl_prox`];
      const subDist = studyData.segments[`${sidePrefix}subcl_dist`];
      if ((subProx?.psv && subProx.psv > 180) || (subDist?.psv && subDist.psv > 180)) {
        findings.push({
          id: `sub_high_${side}`,
          text: `${sideName} Subclavian: Elevated peak velocity (>180 cm/s) indicating proximal stenotic lesion.`,
          type: 'moderate'
        });
      }

      // 4. Carotid Bulb & CCA Plaque
      const bulb = studyData.segments[`${sidePrefix}bulb`];
      if (bulb?.plaquePresent) {
        findings.push({
          id: `bulb_plaque_${side}`,
          text: `${sideName} Carotid Bulb: Atheroma present at carotid bifurcation.`,
          type: 'info'
        });
      }
    });

    return findings;
  }, [studyData, activeSideTab, rIcaPeak, lIcaPeak, rIcaCcaRatio, lIcaCcaRatio]);

  // Drawer / Advanced Segment Data
  const drawerSegment = advancedDrawerSegmentId ? studyData.segments[advancedDrawerSegmentId] : null;
  const drawerMeta = advancedDrawerSegmentId ? SEGMENTS_META[advancedDrawerSegmentId] : null;
  const drawerPlaque = useMemo(() => {
    if (!advancedDrawerSegmentId) return null;
    return studyData.plaques.find(p => p.segments.includes(advancedDrawerSegmentId)) || null;
  }, [studyData.plaques, advancedDrawerSegmentId]);

  return (
    <div className="w-full h-full flex flex-col bg-[#0b1329] border border-slate-800 rounded-xl overflow-hidden shadow-xl select-none">
      
      {/* 1. COMPACT WORKSHEET HEADER & TABS */}
      <div className="px-4 py-2.5 bg-[#0f172a] border-b border-slate-800 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-cyan-500/10 border border-cyan-500/30 rounded text-cyan-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
              Hemodynamic Worksheet
            </h2>
            <p className="text-[10px] text-slate-400">
              Inline entry • cm/s • auto-interpreting
            </p>
          </div>
        </div>

        {/* Tab Selection: RIGHT | LEFT | BILATERAL */}
        <div className="flex items-center bg-[#070d1e] p-0.5 rounded-lg border border-slate-800">
          <button
            id="tab-btn-right"
            onClick={() => setActiveSideTab('right')}
            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
              activeSideTab === 'right'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            RIGHT
          </button>
          <button
            id="tab-btn-left"
            onClick={() => setActiveSideTab('left')}
            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
              activeSideTab === 'left'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            LEFT
          </button>
          <button
            id="tab-btn-bilateral"
            onClick={() => setActiveSideTab('bilateral')}
            className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
              activeSideTab === 'bilateral'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            BILATERAL
          </button>
        </div>

        {/* Quick Normal Action */}
        <div className="hidden sm:flex items-center gap-1.5">
          <button
            id="btn-quick-normal-side"
            onClick={() => handleMarkSideNormal(activeSideTab === 'left' ? 'left' : 'right')}
            title={`Set all ${activeSideTab === 'left' ? 'Left' : 'Right'} vessels to standard normal values`}
            className="px-2.5 py-1 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-semibold rounded border border-slate-700/80 flex items-center gap-1 transition-colors"
          >
            <Check className="w-3 h-3 text-emerald-400" />
            Normal {activeSideTab === 'left' ? 'Left' : 'Right'}
          </button>
        </div>
      </div>

      {/* 2. PRIMARY WORKSHEET TABLE (INLINE EDITING) */}
      <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar">
        <table className="w-full text-left border-collapse table-fixed">
          {/* Sticky Table Header */}
          <thead className="sticky top-0 z-20 bg-[#0f172a] shadow-sm border-b border-slate-700/80 text-[11px] font-bold text-slate-300 uppercase tracking-wider">
            <tr>
              <th className="py-2 px-3 w-[18%]">Vessel / Segment</th>
              <th className="py-2 px-1.5 w-[10%] text-center">PSV <span className="text-[9px] text-slate-400 font-normal lowercase">cm/s</span></th>
              <th className="py-2 px-1.5 w-[10%] text-center">EDV <span className="text-[9px] text-slate-400 font-normal lowercase">cm/s</span></th>
              <th className="py-2 px-1.5 w-[18%]">Waveform</th>
              <th className="py-2 px-1.5 w-[15%]">Plaque</th>
              <th className="py-2 px-1.5 w-[12%]">Surface</th>
              <th className="py-2 px-1.5 w-[14%]">Stenosis</th>
              <th className="py-2 px-1 w-[3%] text-center"></th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800/60 text-xs">
            {vesselGroups.map((group) => {
              const groupSummary = getGroupSummary(group);
              const isIca = group.vesselKey === 'ica';
              const isSubclavian = group.vesselKey === 'subclavian';
              const isAbnormalGroup = groupSummary.includes('≥70%') || groupSummary.includes('50–69%') || groupSummary.includes('⚠') || groupSummary.includes('70');
              
              const isSubclavianOpen = isSubclavian ? getIsSubclavianExpanded(group.side) : true;
              const vertAtypicalInfo = isSubclavian ? isVertAtypical(group.side) : { atypical: false };

              return (
                <React.Fragment key={`${group.side}_${group.vesselKey}`}>
                  {/* GROUP HEADER ROW WITH HIGH-YIELD SUMMARY */}
                  <tr className="bg-[#121c38]/90 border-t border-slate-700/60">
                    <td colSpan={8} className="py-1.5 px-3">
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className="text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${isAbnormalGroup ? 'bg-amber-400 animate-pulse' : 'bg-cyan-400'}`} />
                          {group.name}
                        </span>
                        
                        <div className="flex items-center gap-2">
                          {groupSummary && (
                            <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-medium ${
                              isAbnormalGroup 
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                                : 'bg-slate-800 text-slate-300 border border-slate-700/50'
                            }`}>
                              {groupSummary}
                            </span>
                          )}

                          {/* Subclavian Expand/Collapse Interactive Trigger */}
                          {isSubclavian && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSubclavianManualToggle(prev => ({
                                  ...prev,
                                  [group.side]: !isSubclavianOpen
                                }));
                              }}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors flex items-center gap-1 ${
                                isSubclavianOpen
                                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-600'
                                  : vertAtypicalInfo.atypical
                                  ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/40 animate-pulse'
                                  : 'bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-300 border-cyan-700/50'
                              }`}
                            >
                              {isSubclavianOpen ? (
                                <>
                                  <span>Collapse</span>
                                  <ChevronUp className="w-3 h-3" />
                                </>
                              ) : (
                                <>
                                  <span>{vertAtypicalInfo.atypical ? 'Investigate Subclavian' : '+ Expand (±)'}</span>
                                  <ChevronDown className="w-3 h-3" />
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>

                  {/* SUBCLAVIAN COLLAPSED BANNER */}
                  {isSubclavian && !isSubclavianOpen && (
                    <tr 
                      onClick={() => setSubclavianManualToggle(prev => ({ ...prev, [group.side]: true }))}
                      className={`cursor-pointer transition-colors border-b border-slate-800/80 ${
                        vertAtypicalInfo.atypical
                          ? 'bg-amber-950/30 hover:bg-amber-950/50 border-amber-500/40'
                          : 'bg-[#090f20]/60 hover:bg-[#0d162f]'
                      }`}
                    >
                      <td colSpan={8} className="py-2 px-3">
                        <div className="flex items-center justify-between text-[11px]">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                              vertAtypicalInfo.atypical ? 'bg-amber-500 text-black' : 'bg-slate-800 text-slate-400'
                            }`}>
                              {vertAtypicalInfo.atypical ? '⚠ ATYPICAL VERT' : '± OPTIONAL'}
                            </span>
                            <span className={vertAtypicalInfo.atypical ? 'text-amber-200 font-semibold' : 'text-slate-400'}>
                              {vertAtypicalInfo.atypical
                                ? `${group.side === 'right' ? 'Right' : 'Left'} vertebral flow is atypical (${vertAtypicalInfo.reason}). Click to assess subclavian artery for steal origin.`
                                : 'Subclavian info collapsed (vertebral flow normal). Click to expand and document.'}
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 underline flex items-center gap-1">
                            {vertAtypicalInfo.atypical ? 'Assess Subclavian Artery →' : '+ Expand'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  )}

                  {/* CLINICAL PROMPT FOR ATYPICAL VERTEBRAL WHEN SUBCLAVIAN IS EXPANDED */}
                  {isSubclavian && isSubclavianOpen && vertAtypicalInfo.atypical && (
                    <tr className="bg-amber-950/40 border-b border-amber-500/40">
                      <td colSpan={8} className="py-1.5 px-3">
                        <div className="flex items-center gap-2 text-[11px] text-amber-200 font-medium">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>
                            <strong>Clinical Prompt:</strong> Atypical {group.side === 'right' ? 'Right' : 'Left'} vertebral artery flow ({vertAtypicalInfo.reason}). Assess proximal and distal subclavian artery for high-velocity jet or occlusion.
                          </span>
                        </div>
                      </td>
                    </tr>
                  )}

                  {/* VESSEL SEGMENTS IN THIS GROUP (RENDERED IF EXPANDED) */}
                  {isSubclavianOpen && group.segmentIds.map((segId, segIdx) => {
                    const meta = SEGMENTS_META[segId];
                    const seg = studyData.segments[segId] || {
                      id: segId,
                      name: meta?.name || segId,
                      side: group.side,
                      psv: null,
                      edv: null,
                      flowDirection: 'antegrade',
                      waveform: 'Normal',
                      plaquePresent: false,
                      intimalThickening: false,
                      stenosisPresent: false,
                      localPsvRatio: null,
                      comments: '',
                      technicalLimitations: ''
                    };

                    const isSelected = selectedIds.includes(segId);
                    const isActive = activeId === segId;
                    const waveformOptions = getWaveformOptionsForSegment(segId);
                    const stenosisOptions = getStenosisOptionsForSegment(segId);

                    const plaqueComp = getSegmentPlaqueComposition(segId);
                    const plaqueSurface = getSegmentPlaqueSurface(segId);
                    const stenosisGrade = getSegmentStenosisGrade(segId);

                    // High-yield highlighting
                    const isHighPsv = seg.psv !== null && seg.psv >= 125;
                    const isVeryHighPsv = seg.psv !== null && seg.psv >= 230;
                    const isSevereStenosis = stenosisGrade === '>=70%' || stenosisGrade === 'near_occlusion' || stenosisGrade === 'occluded';
                    const isModerateStenosis = stenosisGrade === '50-69%';
                    const hasPlaque = seg.plaquePresent && plaqueComp !== 'none';
                    const isRetroFlow = seg.flowDirection === 'retrograde' || (seg.waveform && seg.waveform.toLowerCase().includes('retrograde'));

                    // NASCET badge for specific lesion site
                    const sideNascet = group.side === 'right' ? studyData.nascet?.right : studyData.nascet?.left;
                    const nascetCalc = group.side === 'right' ? studyData.nascetRight : studyData.nascetLeft;
                    const nascetVal = sideNascet?.longitudinal?.calculatedStenosis ?? sideNascet?.transverse?.calculatedStenosis ?? nascetCalc?.calculatedPercent ?? null;
                    
                    const sidePrefix = group.side === 'right' ? 'r_' : 'l_';
                    const sideIcaPlaques = studyData.plaques.filter(p => p.segments.some(sId => sId.startsWith(sidePrefix)));
                    const explicitMaxSite = sideIcaPlaques.find(p => p.maxPlaqueSite)?.maxPlaqueSite;
                    const sidePeakIcaId = (group.side === 'right' ? rIcaPeak : lIcaPeak)?.segmentId || `${sidePrefix}ica_prox`;
                    const isPrimaryIcaLesion = isIca && (explicitMaxSite ? segId === explicitMaxSite : segId === sidePeakIcaId);
                    const isNascetLesion = isPrimaryIcaLesion && nascetVal !== null && (seg.plaquePresent || isSevereStenosis || isModerateStenosis || isHighPsv);

                    return (
                      <tr
                        key={segId}
                        id={`worksheet-row-${segId}`}
                        onClick={() => handleRowClick(segId)}
                        className={`transition-colors cursor-pointer group ${
                          isActive
                            ? 'bg-cyan-950/40 hover:bg-cyan-950/50 border-l-2 border-cyan-400'
                            : isSelected
                            ? 'bg-slate-800/60 hover:bg-slate-800/80 border-l-2 border-cyan-600'
                            : 'hover:bg-slate-800/30'
                        }`}
                      >
                        {/* 1. Segment Label */}
                        <td className="py-1.5 px-3">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-xs font-semibold ${
                              isActive ? 'text-cyan-200 font-bold' : isSelected ? 'text-slate-100' : 'text-slate-300'
                            }`}>
                              {meta?.shortName || meta?.name?.replace(/Right |Left /gi, '') || segId}
                            </span>

                            {/* NASCET lesion indicator - Only at the primary stenosis lesion */}
                            {isNascetLesion && (
                              <span className="text-[9px] px-1 py-0.2 bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded font-mono font-bold">
                                NASCET {Math.round(nascetVal!)}%
                              </span>
                            )}

                            {/* Notes/Limitations indicator */}
                            {seg.comments && (
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title={`Note: ${seg.comments}`} />
                            )}
                          </div>
                        </td>

                        {/* 2. PSV (Inline Numeric Input) */}
                        <td className="py-1 px-1.5 text-center" onClick={(e) => e.stopPropagation()}>
                          <input
                            id={`input-psv-${segId}`}
                            type="number"
                            min="0"
                            max="600"
                            placeholder="—"
                            value={seg.psv !== null && seg.psv !== undefined ? seg.psv : ''}
                            onChange={(e) => handlePsvChange(segId, e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                (e.target as HTMLInputElement).blur();
                              }
                            }}
                            className={`w-full py-1 px-1.5 text-center text-xs font-mono font-bold rounded border transition-colors outline-none focus:ring-1 focus:ring-cyan-400 ${
                              isVeryHighPsv
                                ? 'bg-red-950/50 border-red-500/60 text-red-300 shadow-inner'
                                : isHighPsv
                                ? 'bg-amber-950/40 border-amber-500/50 text-amber-300'
                                : seg.psv !== null
                                ? 'bg-[#070d1e] border-slate-700 text-slate-100 hover:border-slate-600'
                                : 'bg-[#070d1e]/50 border-slate-800 text-slate-400 hover:border-slate-700'
                            }`}
                          />
                        </td>

                        {/* 3. EDV (Inline Numeric Input) */}
                        <td className="py-1 px-1.5 text-center" onClick={(e) => e.stopPropagation()}>
                          <input
                            id={`input-edv-${segId}`}
                            type="number"
                            min="0"
                            max="300"
                            placeholder="—"
                            value={seg.edv !== null && seg.edv !== undefined ? seg.edv : ''}
                            onChange={(e) => handleEdvChange(segId, e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                (e.target as HTMLInputElement).blur();
                              }
                            }}
                            className={`w-full py-1 px-1.5 text-center text-xs font-mono font-bold rounded border transition-colors outline-none focus:ring-1 focus:ring-cyan-400 ${
                              seg.edv !== null && seg.edv >= 100
                                ? 'bg-red-950/50 border-red-500/60 text-red-300'
                                : seg.edv !== null && seg.edv >= 40
                                ? 'bg-amber-950/40 border-amber-500/50 text-amber-300'
                                : seg.edv !== null
                                ? 'bg-[#070d1e] border-slate-700 text-slate-100 hover:border-slate-600'
                                : 'bg-[#070d1e]/50 border-slate-800 text-slate-400 hover:border-slate-700'
                            }`}
                          />
                        </td>

                        {/* 4. Waveform (Inline Vessel-Specific Dropdown) */}
                        <td className="py-1 px-1.5" onClick={(e) => e.stopPropagation()}>
                          <select
                            id={`select-waveform-${segId}`}
                            value={seg.waveform || (segId.includes('subcl') ? 'Multiphasic' : segId.includes('vert') ? 'Normal antegrade' : 'Normal')}
                            onChange={(e) => handleWaveformChange(segId, e.target.value)}
                            className={`w-full py-1 px-1.5 text-[11px] rounded border transition-colors outline-none focus:ring-1 focus:ring-cyan-400 font-medium truncate ${
                              isRetroFlow
                                ? 'bg-red-950/50 border-red-500/50 text-red-300 font-bold'
                                : seg.waveform && (seg.waveform.includes('Turbulent') || seg.waveform.includes('Dampened') || seg.waveform.includes('Tardus'))
                                ? 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                                : 'bg-[#070d1e] border-slate-700/80 text-slate-200 hover:border-slate-600'
                            }`}
                          >
                            {waveformOptions.map(opt => (
                              <option key={opt} value={opt} className="bg-[#0f172a] text-slate-200">
                                {opt}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* 5. Plaque Type (Inline Dropdown: None / Echogenic / Hypoechoic / Calcified / Mixed) */}
                        <td className="py-1 px-1.5" onClick={(e) => e.stopPropagation()}>
                          <select
                            id={`select-plaque-${segId}`}
                            value={hasPlaque ? plaqueComp : 'none'}
                            onChange={(e) => handlePlaqueCompositionChange(segId, e.target.value)}
                            className={`w-full py-1 px-1 text-[11px] rounded border transition-colors outline-none focus:ring-1 focus:ring-cyan-400 font-medium capitalize ${
                              plaqueComp === 'calcified'
                                ? 'bg-teal-950/50 border-teal-500/50 text-teal-300 font-semibold'
                                : plaqueComp === 'hypoechoic'
                                ? 'bg-amber-950/50 border-amber-500/50 text-amber-300 font-semibold'
                                : plaqueComp === 'mixed'
                                ? 'bg-purple-950/50 border-purple-500/50 text-purple-300 font-semibold'
                                : plaqueComp === 'echogenic'
                                ? 'bg-blue-950/40 border-blue-500/40 text-blue-300'
                                : 'bg-[#070d1e] border-slate-800 text-slate-400 hover:border-slate-700'
                            }`}
                          >
                            <option value="none" className="bg-[#0f172a] text-slate-400">None</option>
                            <option value="echogenic" className="bg-[#0f172a] text-blue-300 font-semibold">Echogenic</option>
                            <option value="hypoechoic" className="bg-[#0f172a] text-amber-300 font-semibold">Hypoechoic</option>
                            <option value="calcified" className="bg-[#0f172a] text-teal-300 font-semibold">Calcified</option>
                            <option value="mixed" className="bg-[#0f172a] text-purple-300 font-semibold">Mixed</option>
                          </select>
                        </td>

                        {/* 6. Plaque Surface (Inline Dropdown: — / Smooth / Irregular / Ulcerated) */}
                        <td className="py-1 px-1.5" onClick={(e) => e.stopPropagation()}>
                          <select
                            id={`select-surface-${segId}`}
                            value={hasPlaque ? plaqueSurface : 'none'}
                            onChange={(e) => handlePlaqueSurfaceChange(segId, e.target.value)}
                            className={`w-full py-1 px-1 text-[11px] rounded border transition-colors outline-none focus:ring-1 focus:ring-cyan-400 font-medium capitalize ${
                              plaqueSurface === 'ulcerated'
                                ? 'bg-red-950/60 border-red-500/60 text-red-300 font-bold'
                                : plaqueSurface === 'irregular'
                                ? 'bg-amber-950/50 border-amber-500/50 text-amber-300 font-semibold'
                                : plaqueSurface === 'smooth' && hasPlaque
                                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 font-medium'
                                : 'bg-[#070d1e] border-slate-800 text-slate-500 hover:border-slate-700'
                            }`}
                          >
                            <option value="none" className="bg-[#0f172a] text-slate-500">—</option>
                            <option value="smooth" className="bg-[#0f172a] text-emerald-300 font-medium">Smooth</option>
                            <option value="irregular" className="bg-[#0f172a] text-amber-300 font-semibold">Irregular</option>
                            <option value="ulcerated" className="bg-[#0f172a] text-red-300 font-bold">Ulcerated</option>
                          </select>
                        </td>

                        {/* 7. Stenosis (Inline Dropdown) */}
                        <td className="py-1 px-1.5" onClick={(e) => e.stopPropagation()}>
                          <select
                            id={`select-stenosis-${segId}`}
                            value={stenosisGrade}
                            onChange={(e) => handleStenosisChange(segId, e.target.value)}
                            className={`w-full py-1 px-1 text-[11px] rounded border transition-colors outline-none focus:ring-1 focus:ring-cyan-400 font-medium ${
                              isSevereStenosis
                                ? 'bg-red-950/50 border-red-500/50 text-red-300 font-bold'
                                : isModerateStenosis
                                ? 'bg-amber-950/40 border-amber-500/40 text-amber-300 font-bold'
                                : stenosisGrade === '<50%'
                                ? 'bg-blue-950/40 border-blue-500/40 text-blue-300'
                                : 'bg-[#070d1e] border-slate-800 text-slate-400 hover:border-slate-700'
                            }`}
                          >
                            {stenosisOptions.map(opt => (
                              <option key={opt.value} value={opt.value} className="bg-[#0f172a] text-slate-200">
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* 8. Action Button (⋯) for Advanced Details */}
                        <td className="py-1 px-1 text-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            id={`btn-advanced-${segId}`}
                            onClick={() => setAdvancedDrawerSegmentId(segId)}
                            title="Open Advanced Morphology & NASCET Details"
                            className="p-1 rounded text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors"
                          >
                            <MoreHorizontal className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 3. KEY FINDINGS FOOTER SUMMARY */}
      <div className="p-3 bg-[#0f172a] border-t border-slate-800 shrink-0">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200 uppercase tracking-wider">
            <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
            <span>Key Findings • {keyFindings.length}</span>
          </div>
          {keyFindings.length === 0 && (
            <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Unremarkable Study
            </span>
          )}
        </div>

        {keyFindings.length > 0 ? (
          <div className="space-y-1 max-h-24 overflow-y-auto custom-scrollbar">
            {keyFindings.map(f => (
              <div 
                key={f.id} 
                className={`text-[11px] px-2 py-1 rounded flex items-start gap-1.5 font-medium ${
                  f.type === 'severe'
                    ? 'bg-red-950/30 text-red-200 border border-red-500/30'
                    : f.type === 'moderate'
                    ? 'bg-amber-950/30 text-amber-200 border border-amber-500/30'
                    : f.type === 'warning'
                    ? 'bg-orange-950/30 text-orange-200 border border-orange-500/30'
                    : 'bg-slate-800/60 text-slate-300 border border-slate-700/40'
                }`}
              >
                <span className="text-cyan-400 font-bold">•</span>
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[11px] text-slate-400 italic">
            Normal bilateral velocities and waveforms without hemodynamically significant stenosis.
          </p>
        )}
      </div>

      {/* 4. OPTIONAL ADVANCED DETAILS MODAL / DRAWER (Triggered on Demand by '⋯') */}
      {advancedDrawerSegmentId && drawerSegment && drawerMeta && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setAdvancedDrawerSegmentId(null)}
        >
          <div 
            className="w-full max-w-lg bg-[#0b1329] border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-4 py-3 bg-[#0f172a] border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <div>
                  <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                    {drawerMeta.name}
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400">
                    ID: {drawerSegment.id} • {drawerMeta.side.toUpperCase()}
                  </span>
                </div>
              </div>
              <button
                id="btn-close-advanced-drawer"
                onClick={() => setAdvancedDrawerSegmentId(null)}
                className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-4 overflow-y-auto space-y-4 text-xs custom-scrollbar">
              
              {/* Plaque Morphology Panel */}
              <div className="p-3 bg-[#0f172a]/70 border border-slate-800 rounded-lg space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-cyan-400" />
                    Plaque Morphology & Texture
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {drawerSegment.plaquePresent ? 'Plaque Documented' : 'No plaque marked'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Composition</label>
                    <select
                      value={drawerPlaque?.composition || 'echogenic'}
                      onChange={(e) => {
                        if (drawerPlaque && onUpdateStudy) {
                          const updated = studyData.plaques.map(p => p.id === drawerPlaque.id ? { ...p, composition: e.target.value as PlaqueComposition } : p);
                          onUpdateStudy({ plaques: updated });
                        }
                      }}
                      className="w-full py-1 px-2 text-xs bg-[#070d1e] border border-slate-700 rounded text-slate-200 outline-none"
                    >
                      <option value="echogenic">Echogenic (Fibrous)</option>
                      <option value="hypoechoic">Hypoechoic (Soft / Lipid)</option>
                      <option value="calcified">Calcified</option>
                      <option value="mixed">Mixed (Heterogeneous)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Surface Contour</label>
                    <select
                      value={drawerPlaque?.surface || 'smooth'}
                      onChange={(e) => {
                        if (drawerPlaque && onUpdateStudy) {
                          const updated = studyData.plaques.map(p => p.id === drawerPlaque.id ? { ...p, surface: e.target.value as PlaqueSurface } : p);
                          onUpdateStudy({ plaques: updated });
                        }
                      }}
                      className="w-full py-1 px-2 text-xs bg-[#070d1e] border border-slate-700 rounded text-slate-200 outline-none"
                    >
                      <option value="smooth">Smooth</option>
                      <option value="irregular">Irregular</option>
                      <option value="ulcerated">Ulcerated (High Embolic Risk)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Calcification</label>
                    <select
                      value={drawerPlaque?.calcificShadowing || 'none'}
                      onChange={(e) => {
                        if (drawerPlaque && onUpdateStudy) {
                          const updated = studyData.plaques.map(p => p.id === drawerPlaque.id ? { ...p, calcificShadowing: e.target.value as CalcificShadowing } : p);
                          onUpdateStudy({ plaques: updated });
                        }
                      }}
                      className="w-full py-1 px-2 text-xs bg-[#070d1e] border border-slate-700 rounded text-slate-200 outline-none"
                    >
                      <option value="none">None</option>
                      <option value="minor">Minor (&lt; 1cm)</option>
                      <option value="partial">Partial (&gt; 1cm)</option>
                      <option value="dense">Dense Acoustic Shadowing</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Max Thickness (mm)</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="e.g. 2.4"
                      value={drawerPlaque?.maxThicknessMm ?? ''}
                      onChange={(e) => {
                        const val = e.target.value === '' ? null : parseFloat(e.target.value);
                        if (drawerPlaque && onUpdateStudy) {
                          const updated = studyData.plaques.map(p => p.id === drawerPlaque.id ? { ...p, maxThicknessMm: val } : p);
                          onUpdateStudy({ plaques: updated });
                        }
                      }}
                      className="w-full py-1 px-2 text-xs bg-[#070d1e] border border-slate-700 rounded text-slate-100 outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* NASCET Measurement (If ICA or requested) */}
              {drawerSegment.id.includes('ica') && (
                <div className="p-3 bg-[#0f172a]/70 border border-slate-800 rounded-lg space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200 flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-purple-400" />
                      NASCET Diameter Reduction Geometry
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Focal Stenosis Ratio
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    % Stenosis = [(1 - A / B) × 100], where A is the residual lumen at the narrowest lesion point and B is the normal distal ICA lumen diameter.
                  </p>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Residual Lumen A (mm)</label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="e.g. 1.2"
                        value={
                          drawerMeta.side === 'right'
                            ? studyData.nascetRight?.longitudinal?.minLumenA ?? ''
                            : studyData.nascetLeft?.longitudinal?.minLumenA ?? ''
                        }
                        onChange={(e) => {
                          const val = e.target.value === '' ? null : parseFloat(e.target.value);
                          if (onUpdateStudy) {
                            const sideKey = drawerMeta.side === 'right' ? 'nascetRight' : 'nascetLeft';
                            const current = studyData[sideKey] || { side: drawerMeta.side === 'right' ? 'right' : 'left' };
                            const updatedLong = { ...(current.longitudinal || { plane: 'longitudinal' }), minLumenA: val };
                            const calc = calculateNascetStenosis(updatedLong.minLumenA ?? null, updatedLong.normalLumenB ?? null);
                            onUpdateStudy({
                              [sideKey]: {
                                ...current,
                                longitudinal: updatedLong,
                                calculatedPercent: calc
                              }
                            });
                          }
                        }}
                        className="w-full py-1 px-2 text-xs bg-[#070d1e] border border-slate-700 rounded text-slate-100 outline-none focus:border-purple-400 font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Distal Reference B (mm)</label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="e.g. 5.0"
                        value={
                          drawerMeta.side === 'right'
                            ? studyData.nascetRight?.longitudinal?.normalLumenB ?? ''
                            : studyData.nascetLeft?.longitudinal?.normalLumenB ?? ''
                        }
                        onChange={(e) => {
                          const val = e.target.value === '' ? null : parseFloat(e.target.value);
                          if (onUpdateStudy) {
                            const sideKey = drawerMeta.side === 'right' ? 'nascetRight' : 'nascetLeft';
                            const current = studyData[sideKey] || { side: drawerMeta.side === 'right' ? 'right' : 'left' };
                            const updatedLong = { ...(current.longitudinal || { plane: 'longitudinal' }), normalLumenB: val };
                            const calc = calculateNascetStenosis(updatedLong.minLumenA ?? null, updatedLong.normalLumenB ?? null);
                            onUpdateStudy({
                              [sideKey]: {
                                ...current,
                                longitudinal: updatedLong,
                                calculatedPercent: calc
                              }
                            });
                          }
                        }}
                        className="w-full py-1 px-2 text-xs bg-[#070d1e] border border-slate-700 rounded text-slate-100 outline-none focus:border-purple-400 font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Flow Direction & Hemodynamic Notes */}
              <div className="p-3 bg-[#0f172a]/70 border border-slate-800 rounded-lg space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-cyan-400" />
                    Flow Vector & Technical Nuances
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Flow Direction</label>
                    <select
                      value={drawerSegment.flowDirection || 'antegrade'}
                      onChange={(e) => onUpdateSegment(drawerSegment.id, { flowDirection: e.target.value as FlowDirection })}
                      className="w-full py-1 px-2 text-xs bg-[#070d1e] border border-slate-700 rounded text-slate-200 outline-none"
                    >
                      <option value="antegrade">Antegrade (Normal)</option>
                      <option value="bidirectional">Bidirectional (Pre-Steal)</option>
                      <option value="retrograde">Retrograde (Reversed)</option>
                      <option value="absent">Absent (No Doppler signal)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Stenosis Present</label>
                    <select
                      value={drawerSegment.stenosisPresent ? 'yes' : 'no'}
                      onChange={(e) => onUpdateSegment(drawerSegment.id, { stenosisPresent: e.target.value === 'yes' })}
                      className="w-full py-1 px-2 text-xs bg-[#070d1e] border border-slate-700 rounded text-slate-200 outline-none"
                    >
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                    </select>
                  </div>
                </div>

                {/* Notes & Limitations */}
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Diagnostic Notes & Limitations</label>
                  <textarea
                    rows={2}
                    placeholder="Document acoustic shadowing, tortuosity, or patient-specific factors..."
                    value={drawerSegment.comments || ''}
                    onChange={(e) => onUpdateSegment(drawerSegment.id, { comments: e.target.value })}
                    className="w-full py-1.5 px-2 text-xs bg-[#070d1e] border border-slate-700 rounded text-slate-200 outline-none focus:border-cyan-400 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-4 py-2.5 bg-[#0f172a] border-t border-slate-800 flex items-center justify-end">
              <button
                id="btn-done-advanced-drawer"
                onClick={() => setAdvancedDrawerSegmentId(null)}
                className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded shadow transition-colors"
              >
                Apply & Return to Worksheet
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
