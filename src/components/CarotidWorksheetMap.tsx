import React, { useState } from 'react';
import { StudyData, ArchVariant, BifurcationVariant } from '../types';
import { SEGMENTS_META } from '../constants';
import { suggestIcaStenosisCategory } from '../utils/calculations';
import { ARCH_VARIANTS_META, BIFURCATION_VARIANTS_META } from '../utils/anatomyVariants';
import { Check, GitBranch, ChevronDown, ChevronUp, Layers, Info } from 'lucide-react';

interface CarotidWorksheetMapProps {
  studyData: StudyData;
  selectedSegmentIds: string[];
  activeSegmentId: string | null;
  outstandingSegmentIds?: string[];
  onSelectSegment: (id: string, isMulti: boolean) => void;
  onAssessSegment: (id: string) => void;
  onToggleVariant?: () => void;
  onUpdateStudy?: (updates: Partial<StudyData>) => void;
}

interface SegmentGeometry {
  segPolygon: string;
  hitPath: string;
  velocityPos: { x: number; y: number; align: 'start' | 'middle' | 'end' };
  segCalibre: number;
  centerPoints: Array<{ x: number; y: number }>;
}

const getSegmentGeometries = (bifOffset: number): Record<string, SegmentGeometry> => {
  return {
    r_subcl_dist: {
      segPolygon: 'M 105,510 C 145,485 175,485 216,498 L 216,525 C 175,520 145,520 105,550 Z',
      hitPath: 'M 105,530 C 145,502 180,502 216,512',
      centerPoints: [{ x: 105, y: 530 }, { x: 160, y: 502 }, { x: 216, y: 512 }],
      velocityPos: { x: 155, y: 480, align: 'middle' },
      segCalibre: 26,
    },
    r_subcl_prox: {
      segPolygon: 'M 216,498 C 245,510 285,520 315,555 L 295,570 C 265,540 235,530 216,525 Z',
      hitPath: 'M 215,510 C 255,525 285,535 305,562',
      centerPoints: [{ x: 215, y: 510 }, { x: 260, y: 530 }, { x: 305, y: 562 }],
      velocityPos: { x: 265, y: 545, align: 'middle' },
      segCalibre: 26,
    },
    l_subcl_dist: {
      segPolygon: 'M 682,502 C 715,494 755,496 795,516 L 795,545 C 755,545 715,535 682,525 Z',
      hitPath: 'M 682,514 C 720,515 760,516 795,530',
      centerPoints: [{ x: 682, y: 514 }, { x: 740, y: 516 }, { x: 795, y: 530 }],
      velocityPos: { x: 755, y: 480, align: 'middle' },
      segCalibre: 26,
    },
    l_subcl_prox: {
      segPolygon: 'M 618,620 C 624,570 642,530 652,502 L 675,515 C 665,540 656,575 654,620 Z',
      hitPath: 'M 636,620 C 640,570 650,535 664,508',
      centerPoints: [{ x: 636, y: 620 }, { x: 648, y: 560 }, { x: 664, y: 508 }],
      velocityPos: { x: 655, y: 565, align: 'middle' },
      segCalibre: 26,
    },
    r_vert_dist: {
      segPolygon: 'M 226,240 L 224,80 L 242,80 L 244,240 Z',
      hitPath: 'M 235,240 L 233,80',
      centerPoints: [{ x: 235, y: 240 }, { x: 233, y: 80 }],
      velocityPos: { x: 215, y: 160, align: 'end' },
      segCalibre: 18,
    },
    r_vert_mid: {
      segPolygon: 'M 228,390 L 228,240 L 246,240 L 246,390 Z',
      hitPath: 'M 237,390 L 237,240',
      centerPoints: [{ x: 237, y: 390 }, { x: 237, y: 240 }],
      velocityPos: { x: 215, y: 315, align: 'end' },
      segCalibre: 18,
    },
    r_vert_prox: {
      segPolygon: 'M 228,500 L 228,390 L 246,390 L 246,500 Z',
      hitPath: 'M 237,500 L 237,390',
      centerPoints: [{ x: 237, y: 500 }, { x: 237, y: 390 }],
      velocityPos: { x: 215, y: 450, align: 'end' },
      segCalibre: 18,
    },
    l_vert_dist: {
      segPolygon: 'M 658,240 L 662,80 L 680,80 L 676,240 Z',
      hitPath: 'M 667,240 L 671,80',
      centerPoints: [{ x: 667, y: 240 }, { x: 671, y: 80 }],
      velocityPos: { x: 646, y: 160, align: 'end' },
      segCalibre: 18,
    },
    l_vert_mid: {
      segPolygon: 'M 658,390 L 658,240 L 676,240 L 676,390 Z',
      hitPath: 'M 667,390 L 667,240',
      centerPoints: [{ x: 667, y: 390 }, { x: 667, y: 240 }],
      velocityPos: { x: 646, y: 315, align: 'end' },
      segCalibre: 18,
    },
    l_vert_prox: {
      segPolygon: 'M 658,500 L 658,390 L 676,390 L 676,500 Z',
      hitPath: 'M 667,500 L 667,390',
      centerPoints: [{ x: 667, y: 500 }, { x: 667, y: 390 }],
      velocityPos: { x: 646, y: 450, align: 'end' },
      segCalibre: 18,
    },
    r_cca_dist: {
      segPolygon: `M 332,315 C 333,280 330,265 330,${250 + bifOffset} L 360,${250 + bifOffset} C 360,265 357,280 358,315 Z`,
      hitPath: `M 345,315 C 345,280 345,265 345,${250 + bifOffset}`,
      centerPoints: [{ x: 345, y: 315 }, { x: 345, y: 280 }, { x: 345, y: 250 + bifOffset }],
      velocityPos: { x: 320, y: 275 + bifOffset * 0.5, align: 'end' },
      segCalibre: 28,
    },
    r_cca_mid: {
      segPolygon: 'M 330,425 L 332,315 L 358,315 L 360,425 Z',
      hitPath: 'M 345,425 L 345,315',
      centerPoints: [{ x: 345, y: 425 }, { x: 345, y: 315 }],
      velocityPos: { x: 320, y: 370, align: 'end' },
      segCalibre: 28,
    },
    r_cca_prox: {
      segPolygon: 'M 330,580 L 330,425 L 360,425 L 360,580 Z',
      hitPath: 'M 345,580 L 345,425',
      centerPoints: [{ x: 345, y: 580 }, { x: 345, y: 425 }],
      velocityPos: { x: 320, y: 480, align: 'end' },
      segCalibre: 30,
    },
    l_cca_dist: {
      segPolygon: `M 542,315 C 541,280 540,265 540,${250 + bifOffset} L 570,${250 + bifOffset} C 570,265 569,280 568,315 Z`,
      hitPath: `M 555,315 C 555,280 555,265 555,${250 + bifOffset}`,
      centerPoints: [{ x: 555, y: 315 }, { x: 555, y: 280 }, { x: 555, y: 250 + bifOffset }],
      velocityPos: { x: 528, y: 275 + bifOffset * 0.5, align: 'end' },
      segCalibre: 28,
    },
    l_cca_mid: {
      segPolygon: 'M 540,425 L 542,315 L 568,315 L 570,425 Z',
      hitPath: 'M 555,425 L 555,315',
      centerPoints: [{ x: 555, y: 425 }, { x: 555, y: 315 }],
      velocityPos: { x: 528, y: 370, align: 'end' },
      segCalibre: 28,
    },
    l_cca_prox: {
      segPolygon: 'M 540,580 L 540,425 L 570,425 L 570,580 Z',
      hitPath: 'M 555,580 L 555,425',
      centerPoints: [{ x: 555, y: 580 }, { x: 555, y: 425 }],
      velocityPos: { x: 528, y: 480, align: 'end' },
      segCalibre: 30,
    },
    r_bulb: {
      segPolygon: `M 330,${250 + bifOffset} C 324,${220 + bifOffset} 308,${195 + bifOffset} 314,${160 + bifOffset} L 372,${160 + bifOffset} C 382,${195 + bifOffset} 366,${220 + bifOffset} 360,${250 + bifOffset} Z`,
      hitPath: `M 345,${250 + bifOffset} C 344,${200 + bifOffset} 344,${175 + bifOffset} 343,${160 + bifOffset}`,
      centerPoints: [{ x: 345, y: 250 + bifOffset }, { x: 344, y: 200 + bifOffset }, { x: 343, y: 160 + bifOffset }],
      velocityPos: { x: 300, y: 195 + bifOffset, align: 'end' },
      segCalibre: 42,
    },
    l_bulb: {
      segPolygon: `M 540,${250 + bifOffset} C 534,${220 + bifOffset} 520,${195 + bifOffset} 528,${160 + bifOffset} L 586,${160 + bifOffset} C 592,${195 + bifOffset} 576,${220 + bifOffset} 570,${250 + bifOffset} Z`,
      hitPath: `M 555,${250 + bifOffset} C 556,${200 + bifOffset} 556,${175 + bifOffset} 557,${160 + bifOffset}`,
      centerPoints: [{ x: 555, y: 250 + bifOffset }, { x: 556, y: 200 + bifOffset }, { x: 557, y: 160 + bifOffset }],
      velocityPos: { x: 520, y: 195 + bifOffset, align: 'end' },
      segCalibre: 42,
    },
    r_ica_prox: {
      segPolygon: `M 314,${160 + bifOffset} C 302,${110 + bifOffset * 0.7} 294,85 288,70 L 312,70 C 322,85 334,${110 + bifOffset * 0.7} 346,${142 + bifOffset} Z`,
      hitPath: `M 330,${151 + bifOffset} C 318,${110 + bifOffset * 0.7} 308,85 300,70`,
      centerPoints: [{ x: 330, y: 151 + bifOffset }, { x: 315, y: 110 + bifOffset * 0.7 }, { x: 300, y: 70 }],
      velocityPos: { x: 300, y: 110 + bifOffset, align: 'end' },
      segCalibre: 22,
    },
    r_ica_mid: {
      segPolygon: 'M 288,70 C 280,50 274,32 270,18 L 290,18 C 294,32 300,50 312,70 Z',
      hitPath: 'M 300,70 C 287,44 282,28 280,18',
      centerPoints: [{ x: 300, y: 70 }, { x: 288, y: 44 }, { x: 280, y: 18 }],
      velocityPos: { x: 278, y: 45, align: 'end' },
      segCalibre: 20,
    },
    r_ica_dist: {
      segPolygon: 'M 270,18 L 270,0 L 288,0 L 290,18 Z',
      hitPath: 'M 280,18 L 279,0',
      centerPoints: [{ x: 280, y: 18 }, { x: 279, y: 0 }],
      velocityPos: { x: 265, y: 12, align: 'end' },
      segCalibre: 18,
    },
    l_ica_prox: {
      segPolygon: `M 566,${142 + bifOffset} C 580,${110 + bifOffset * 0.7} 592,85 604,70 L 628,70 C 616,85 604,${110 + bifOffset * 0.7} 586,${160 + bifOffset} Z`,
      hitPath: `M 576,${151 + bifOffset} C 592,${110 + bifOffset * 0.7} 604,85 616,70`,
      centerPoints: [{ x: 576, y: 151 + bifOffset }, { x: 596, y: 110 + bifOffset * 0.7 }, { x: 616, y: 70 }],
      velocityPos: { x: 572, y: 110 + bifOffset, align: 'end' },
      segCalibre: 22,
    },
    l_ica_mid: {
      segPolygon: 'M 604,70 C 610,50 616,32 618,18 L 638,18 C 636,32 630,50 628,70 Z',
      hitPath: 'M 616,70 C 623,44 627,28 628,18',
      centerPoints: [{ x: 616, y: 70 }, { x: 624, y: 44 }, { x: 628, y: 18 }],
      velocityPos: { x: 595, y: 45, align: 'end' },
      segCalibre: 20,
    },
    l_ica_dist: {
      segPolygon: 'M 618,18 L 618,0 L 636,0 L 638,18 Z',
      hitPath: 'M 628,18 L 627,0',
      centerPoints: [{ x: 628, y: 18 }, { x: 627, y: 0 }],
      velocityPos: { x: 608, y: 12, align: 'end' },
      segCalibre: 18,
    },
    r_eca_prox: {
      segPolygon: `M 354,${142 + bifOffset} C 366,${110 + bifOffset * 0.7} 378,85 388,70 L 412,70 C 402,85 388,${110 + bifOffset * 0.7} 372,${160 + bifOffset} Z`,
      hitPath: `M 363,${151 + bifOffset} C 377,${110 + bifOffset * 0.7} 389,85 400,70`,
      centerPoints: [{ x: 363, y: 151 + bifOffset }, { x: 382, y: 110 + bifOffset * 0.7 }, { x: 400, y: 70 }],
      velocityPos: { x: 358, y: 110 + bifOffset, align: 'end' },
      segCalibre: 20,
    },
    r_eca_mid: {
      segPolygon: 'M 388,70 C 394,50 400,32 402,18 L 420,18 C 418,32 412,50 412,70 Z',
      hitPath: 'M 400,70 C 406,44 410,28 411,18',
      centerPoints: [{ x: 400, y: 70 }, { x: 406, y: 44 }, { x: 411, y: 18 }],
      velocityPos: { x: 384, y: 45, align: 'end' },
      segCalibre: 18,
    },
    r_eca_dist: {
      segPolygon: 'M 402,18 L 402,0 L 420,0 L 420,18 Z',
      hitPath: 'M 411,18 L 411,0',
      centerPoints: [{ x: 411, y: 18 }, { x: 411, y: 0 }],
      velocityPos: { x: 398, y: 12, align: 'end' },
      segCalibre: 16,
    },
    l_eca_prox: {
      segPolygon: `M 528,${160 + bifOffset} C 514,${110 + bifOffset * 0.7} 502,85 492,70 L 516,70 C 526,85 538,${110 + bifOffset * 0.7} 546,${142 + bifOffset} Z`,
      hitPath: `M 537,${151 + bifOffset} C 520,${110 + bifOffset * 0.7} 508,85 504,70`,
      centerPoints: [{ x: 537, y: 151 + bifOffset }, { x: 518, y: 110 + bifOffset * 0.7 }, { x: 504, y: 70 }],
      velocityPos: { x: 510, y: 110 + bifOffset, align: 'end' },
      segCalibre: 20,
    },
    l_eca_mid: {
      segPolygon: 'M 492,70 C 486,50 480,32 478,18 L 496,18 C 498,32 504,50 516,70 Z',
      hitPath: 'M 504,70 C 492,44 487,28 487,18',
      centerPoints: [{ x: 504, y: 70 }, { x: 494, y: 44 }, { x: 487, y: 18 }],
      velocityPos: { x: 485, y: 45, align: 'end' },
      segCalibre: 18,
    },
    l_eca_dist: {
      segPolygon: 'M 478,18 L 478,0 L 496,0 L 496,18 Z',
      hitPath: 'M 487,18 L 487,0',
      centerPoints: [{ x: 487, y: 18 }, { x: 487, y: 0 }],
      velocityPos: { x: 475, y: 12, align: 'end' },
      segCalibre: 16,
    },
  };
};

export const CarotidWorksheetMap: React.FC<CarotidWorksheetMapProps> = ({
  studyData,
  selectedSegmentIds,
  activeSegmentId,
  outstandingSegmentIds = [],
  onSelectSegment,
  onAssessSegment,
  onUpdateStudy,
}) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // View mode & toggles
  const [labelDensity, setLabelDensity] = useState<'minimal' | 'full' | 'hidden'>('minimal');
  const [showVelocities, setShowVelocities] = useState<boolean>(true);
  const [showPlaqueOverlay, setShowPlaqueOverlay] = useState<boolean>(true);
  const [isVariantsPanelOpen, setIsVariantsPanelOpen] = useState<boolean>(false);

  // Zoom & Pan
  const [zoom, setZoom] = useState<number>(1.0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activeArchVariant: ArchVariant =
    studyData.anatomyVariants?.archVariant || (studyData.variantLeftBct ? 'bovine_common_origin' : 'standard');
  const activeBifVariant: BifurcationVariant =
    studyData.anatomyVariants?.bifurcationVariant || 'normal';

  const rightEval = suggestIcaStenosisCategory('right', studyData);
  const leftEval = suggestIcaStenosisCategory('left', studyData);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleSetArchVariant = (variantId: ArchVariant) => {
    const updatedVariants = {
      ...(studyData.anatomyVariants || {
        archVariant: 'standard',
        bifurcationVariant: 'normal',
        leftVertebralOrigin: 'subclavian',
        rightSubclavianOrigin: 'bct',
        variantNotes: '',
      }),
      archVariant: variantId,
    };
    onUpdateStudy?.({
      anatomyVariants: updatedVariants,
      variantLeftBct: variantId === 'bovine_common_origin',
    });
    triggerToast(`Arch Variant: ${ARCH_VARIANTS_META[variantId]?.label || variantId}`);
  };

  const handleSetBifVariant = (bifId: BifurcationVariant) => {
    const updatedVariants = {
      ...(studyData.anatomyVariants || {
        archVariant: 'standard',
        bifurcationVariant: 'normal',
        leftVertebralOrigin: 'subclavian',
        rightSubclavianOrigin: 'bct',
        variantNotes: '',
      }),
      bifurcationVariant: bifId,
    };
    onUpdateStudy?.({
      anatomyVariants: updatedVariants,
    });
    triggerToast(`Bifurcation: ${BIFURCATION_VARIANTS_META[bifId]?.label || bifId}`);
  };

  const handleSegmentClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    const isMulti = e.ctrlKey || e.metaKey || e.shiftKey;
    onSelectSegment(id, isMulti);
  };

  const handleSegmentDoubleClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    onAssessSegment(id);
  };

  const handleMouseMove = (e: React.MouseEvent, id: string) => {
    const svgEl = e.currentTarget.closest('svg');
    if (svgEl) {
      const svgRect = svgEl.getBoundingClientRect();
      setTooltipPos({
        x: e.clientX - svgRect.left + 15,
        y: e.clientY - svgRect.top + 15,
      });
    }
    setHoveredId(id);
  };

  const handleMouseLeave = () => setHoveredId(null);

  const handleZoomIn = () => setZoom(z => Math.min(z + 0.15, 3.5));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.15, 0.4));
  const handleReset = () => {
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
  };

  const bifOffset = activeBifVariant === 'high' ? -35 : activeBifVariant === 'low' ? 35 : 0;

  const hoveredMeta = hoveredId ? SEGMENTS_META[hoveredId] : null;
  const hoveredData = hoveredId ? studyData.segments[hoveredId] : null;

  const segmentGeometries = getSegmentGeometries(bifOffset);

  // Anatomically connected tracks for continuous lesion generation
  const VASCULAR_TRACKS: Array<{ id: string; clip: string; segments: string[] }> = [
    { id: 'r_carotid', clip: 'right-vascular-clip', segments: ['r_cca_prox', 'r_cca_mid', 'r_cca_dist', 'r_bulb', 'r_ica_prox', 'r_ica_mid', 'r_ica_dist'] },
    { id: 'r_eca', clip: 'right-vascular-clip', segments: ['r_eca_prox', 'r_eca_mid', 'r_eca_dist'] },
    { id: 'r_vert', clip: 'right-vascular-clip', segments: ['r_vert_prox', 'r_vert_mid', 'r_vert_dist'] },
    { id: 'r_subcl', clip: 'right-vascular-clip', segments: ['r_subcl_prox', 'r_subcl_dist'] },
    { id: 'l_carotid', clip: 'left-vascular-clip', segments: ['l_cca_prox', 'l_cca_mid', 'l_cca_dist', 'l_bulb', 'l_ica_prox', 'l_ica_mid', 'l_ica_dist'] },
    { id: 'l_eca', clip: 'left-vascular-clip', segments: ['l_eca_prox', 'l_eca_mid', 'l_eca_dist'] },
    { id: 'l_vert', clip: 'left-vascular-clip', segments: ['l_vert_prox', 'l_vert_mid', 'l_vert_dist'] },
    { id: 'l_subcl', clip: 'left-vascular-clip', segments: ['l_subcl_prox', 'l_subcl_dist'] },
  ];

  // Helper to render continuous flowing plaque and patent lumen channels
  const renderContinuousLesions = () => {
    if (!showPlaqueOverlay) return null;

    return VASCULAR_TRACKS.map(track => {
      // Find contiguous sub-arrays of segments that have active plaque, stenosis, IMT, or occlusion
      const chains: string[][] = [];
      let currentChain: string[] = [];

      for (const segId of track.segments) {
        const segData = studyData.segments[segId];
        const hasLesion = segData && (segData.plaquePresent || segData.stenosisPresent || segData.intimalThickening || segData.flowDirection === 'absent');
        if (hasLesion) {
          currentChain.push(segId);
        } else {
          if (currentChain.length > 0) {
            chains.push(currentChain);
            currentChain = [];
          }
        }
      }
      if (currentChain.length > 0) {
        chains.push(currentChain);
      }

      if (chains.length === 0) return null;

      return chains.map((chain, cIdx) => {
        // Evaluate plaque characteristics across the chain
        let isOccluded = false;
        let isSevere = false;
        let isModerate = false;
        let isImtOnly = true;
        let primaryPlaqueComp = '';
        let minPatentWidth = 999;

        const chainPolygons: string[] = [];
        const continuousCenterPoints: Array<{ x: number; y: number }> = [];

        chain.forEach((segId) => {
          const s = studyData.segments[segId];
          const geom = segmentGeometries[segId];
          if (!s || !geom) return;

          chainPolygons.push(geom.segPolygon);
          continuousCenterPoints.push(...geom.centerPoints);

          if (s.flowDirection === 'absent') isOccluded = true;
          if (s.plaquePresent || s.stenosisPresent) isImtOnly = false;

          const matchingPlaque = studyData.plaques.find(p => p.segments.includes(segId) || p.maxPlaqueSite === segId);
          if (matchingPlaque?.composition) {
            primaryPlaqueComp = matchingPlaque.composition.toLowerCase();
          }

          const psvVal = s.psv || 0;
          const meta = SEGMENTS_META[segId];
          const sideEval = meta?.side === 'right' ? rightEval : leftEval;
          const isIcaOrBulb = meta?.type === 'ica' || meta?.type === 'bulb';

          const segSevere = s.stenosisPresent && (psvVal >= 230 || s.comments.toLowerCase().includes('severe') || s.comments.toLowerCase().includes('70') || s.comments.toLowerCase().includes('95') || (isIcaOrBulb && sideEval?.category.includes('Severe')));
          const segMod = !segSevere && (s.stenosisPresent || psvVal >= 125) && (psvVal >= 125 || s.comments.toLowerCase().includes('moderate') || s.comments.toLowerCase().includes('50') || (isIcaOrBulb && sideEval?.category.includes('Moderate')));

          if (segSevere) isSevere = true;
          if (segMod) isModerate = true;

          const sideNascet = meta?.side ? studyData.nascet[meta.side as 'right' | 'left'] : undefined;
          const nascetVal = sideNascet?.longitudinal?.calculatedStenosis ?? sideNascet?.transverse?.calculatedStenosis ?? null;

          let plaqueRatio = 0.30;
          if (segSevere || s.comments.toLowerCase().includes('near') || s.comments.toLowerCase().includes('95')) {
            plaqueRatio = 0.82;
          } else if (segMod) {
            plaqueRatio = 0.52;
          } else if (s.intimalThickening && !s.plaquePresent && !s.stenosisPresent) {
            plaqueRatio = 0.20;
          }

          if (nascetVal !== null && nascetVal > 0) {
            plaqueRatio = Math.min(0.94, Math.max(0.18, nascetVal / 100));
          }

          const segPatent = isOccluded ? 0 : Math.max(2.5, geom.segCalibre * (1 - plaqueRatio));
          if (segPatent < minPatentWidth) {
            minPatentWidth = segPatent;
          }
        });

        const plaqueFillColor = isOccluded ? '#dc2626' :
          primaryPlaqueComp.includes('calc') ? '#fef08a' :
          primaryPlaqueComp.includes('hypo') ? '#d97706' :
          primaryPlaqueComp.includes('hyper') || primaryPlaqueComp.includes('echog') ? '#facc15' :
          '#eab308';

        // Construct continuous flow path through centerpoints
        let continuousFlowD = '';
        if (continuousCenterPoints.length > 0) {
          continuousFlowD = `M ${continuousCenterPoints[0].x},${continuousCenterPoints[0].y}`;
          for (let i = 1; i < continuousCenterPoints.length; i++) {
            continuousFlowD += ` L ${continuousCenterPoints[i].x},${continuousCenterPoints[i].y}`;
          }
        }

        return (
          <g key={`${track.id}-lesion-${cIdx}`} clipPath={`url(#${track.clip})`}>
            {/* 1. Continuous Plaque / Atheroma Infill across all connected segments */}
            {chainPolygons.map((polyD, pIdx) => (
              <path
                key={pIdx}
                d={polyD}
                fill={plaqueFillColor}
                fillOpacity={isImtOnly ? 0.65 : 0.90}
                stroke={isOccluded ? '#ef4444' : plaqueFillColor}
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            ))}

            {/* 2. Continuous Flowing Residual Patent Lumen Channel with Tapered Transitions */}
            {!isOccluded && continuousFlowD && (
              <>
                {/* Outer soft transition zone for smooth tapering */}
                <path
                  d={continuousFlowD}
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth={minPatentWidth + 4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeOpacity={0.4}
                />
                {/* Core patent blood flow lumen */}
                <path
                  d={continuousFlowD}
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth={minPatentWidth}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </>
            )}
          </g>
        );
      });
    });
  };

  return (
    <div id="carotid-worksheet-map" className="flex flex-col bg-[#0b1329] rounded-xl border border-slate-800 overflow-hidden relative min-h-[720px] shadow-lg">
      
      {/* 1. Header Toolbar */}
      <div className="p-4 bg-[#0f172a] border-b border-slate-800 flex flex-col gap-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-black text-slate-100 uppercase tracking-wider">
              Carotid Worksheet Map & Anatomical Workspace
            </span>
            <button
              onClick={() => setIsVariantsPanelOpen(!isVariantsPanelOpen)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold border transition-all cursor-pointer ${
                activeArchVariant !== 'standard' || activeBifVariant !== 'normal'
                  ? 'bg-amber-950/80 border-amber-600 text-amber-300'
                  : isVariantsPanelOpen
                  ? 'bg-cyan-950 border-cyan-700 text-cyan-300'
                  : 'bg-[#152038] border-slate-700 text-slate-300 hover:text-white'
              }`}
              title="Configure Great Vessel Arch & Carotid Bifurcation Variations"
            >
              <GitBranch className="w-3.5 h-3.5 text-cyan-400" />
              <span>Anatomy Variations</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-900/60 text-cyan-300">
                {ARCH_VARIANTS_META[activeArchVariant]?.shortLabel || 'Standard'}
              </span>
              {isVariantsPanelOpen ? <ChevronUp className="w-3.5 h-3.5 ml-0.5" /> : <ChevronDown className="w-3.5 h-3.5 ml-0.5" />}
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Label Density Controls */}
            <div className="flex items-center bg-[#080d19] border border-slate-700/80 rounded-lg p-0.5">
              <button
                onClick={() => setLabelDensity('minimal')}
                className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                  labelDensity === 'minimal' ? 'bg-cyan-600 text-slate-950 font-black shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Minimal
              </button>
              <button
                onClick={() => setLabelDensity('full')}
                className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                  labelDensity === 'full' ? 'bg-cyan-600 text-slate-950 font-black shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Full
              </button>
              <button
                onClick={() => setLabelDensity('hidden')}
                className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                  labelDensity === 'hidden' ? 'bg-rose-950 border border-rose-800 text-rose-300' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Hide
              </button>
            </div>

            {/* Velocities & Plaque Toggles */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowVelocities(!showVelocities)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                  showVelocities ? 'bg-cyan-950 text-cyan-300 border-cyan-800' : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                Velocities: {showVelocities ? 'ON' : 'OFF'}
              </button>
              <button
                type="button"
                onClick={() => setShowPlaqueOverlay(!showPlaqueOverlay)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                  showPlaqueOverlay ? 'bg-indigo-950 text-indigo-300 border-indigo-800' : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                Plaque: {showPlaqueOverlay ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
        </div>

        {/* 2. ANATOMY VARIATIONS CONFIGURATION PANEL (Collapsible) */}
        {isVariantsPanelOpen && (
          <div className="bg-[#080d19] border border-slate-700/80 rounded-lg p-3.5 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-black text-slate-200 uppercase tracking-wider">
                  Anatomical Variation & Origin Architecture
                </span>
              </div>
              <span className="text-[10px] text-slate-400">
                Diagram dynamically adapts proximal great vessel connectivity and bifurcation height
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Arch Branching Variants */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                  Aortic Arch & Proximal Origin Pattern:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {(Object.keys(ARCH_VARIANTS_META) as ArchVariant[]).map((vKey) => {
                    const meta = ARCH_VARIANTS_META[vKey];
                    const isSelected = activeArchVariant === vKey;
                    return (
                      <button
                        key={vKey}
                        type="button"
                        onClick={() => handleSetArchVariant(vKey)}
                        className={`p-2 rounded text-left transition-all border cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-cyan-950 border-cyan-500 text-cyan-200 shadow-md ring-1 ring-cyan-500/50'
                            : 'bg-[#0f172a] border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                        }`}
                      >
                        <span className="text-[10.5px] font-extrabold leading-tight">{meta.shortLabel}</span>
                        <span className="text-[8.5px] text-slate-400 mt-1 line-clamp-1">{meta.badge}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bifurcation Height Variants */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  Carotid Bifurcation Level (Cervical Height):
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  {(Object.keys(BIFURCATION_VARIANTS_META) as BifurcationVariant[]).map((bKey) => {
                    const meta = BIFURCATION_VARIANTS_META[bKey];
                    const isSelected = activeBifVariant === bKey;
                    return (
                      <button
                        key={bKey}
                        type="button"
                        onClick={() => handleSetBifVariant(bKey)}
                        className={`p-2 rounded text-left transition-all border cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-amber-950 border-amber-500 text-amber-200 shadow-md ring-1 ring-amber-500/50'
                            : 'bg-[#0f172a] border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                        }`}
                      >
                        <span className="text-[10.5px] font-extrabold leading-tight">{meta.shortLabel}</span>
                        <span className="text-[8.5px] text-slate-400 mt-1">
                          {bKey === 'normal' ? 'C3-C4 standard' : bKey === 'high' ? 'C2-C3 angle of mandible' : 'C5-C6 supraclavicular'}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Clinical note on active variant */}
                <div className="mt-2 bg-[#0b1329] p-2 rounded border border-slate-800 text-[10px] text-slate-300 flex items-start gap-1.5">
                  <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                  <span>
                    {ARCH_VARIANTS_META[activeArchVariant]?.clinicalImplications || 'Standard anatomical branching.'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Toast Pill */}
      {toastMessage && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-50 bg-[#080d19]/95 border border-cyan-500/80 px-4 py-1.5 rounded-full shadow-2xl backdrop-blur-md flex items-center gap-2 text-xs font-bold text-cyan-200 animate-in fade-in slide-in-from-top-2 duration-200">
          <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* SVG Canvas Container */}
      <div className="p-6 flex items-center justify-center bg-[#070b14] overflow-hidden relative min-h-[660px]">
        
        {/* Floating Viewport Controls */}
        <div className="absolute top-4 right-4 flex items-center gap-1 bg-[#0b1329]/95 border border-slate-700/80 p-1 rounded-lg shadow-xl z-20 backdrop-blur-sm select-none">
          <button onClick={handleZoomIn} className="w-7 h-7 flex items-center justify-center rounded bg-[#152038] hover:bg-[#1e2d4d] text-cyan-400 font-extrabold text-sm cursor-pointer border border-slate-700/50">+</button>
          <button onClick={handleZoomOut} className="w-7 h-7 flex items-center justify-center rounded bg-[#152038] hover:bg-[#1e2d4d] text-cyan-400 font-extrabold text-sm cursor-pointer border border-slate-700/50">-</button>
          <button onClick={handleReset} className="px-2.5 h-7 flex items-center justify-center rounded bg-[#152038] hover:bg-[#1e2d4d] text-slate-300 hover:text-white font-bold text-[10px] uppercase cursor-pointer border border-slate-700/50">Fit</button>
        </div>

        <svg
          viewBox="60 -10 780 660"
          className="w-full max-w-5xl h-auto select-none transition-all duration-300"
          id="worksheet-svg-viewport"
        >
          <defs>
            <filter id="ws-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Right Vascular Silhouettes Clip Path */}
            <clipPath id="right-vascular-clip">
              {activeArchVariant === 'aberrant_right_subclavian' || activeArchVariant === 'separate_rcca_and_rsa' ? (
                <>
                  <path d="M 285,620 C 260,560 195,530 105,550 C 96,550 92,542 92,530 C 92,518 96,510 105,510 C 150,485 190,485 216,498 C 224,494 222,460 222,400 C 220,320 222,200 224,80 L 242,80 C 240,200 248,320 246,400 C 246,460 250,496 256,498 C 285,508 305,555 315,620 Z" />
                  <path d={`M 330,620 C 328,480 334,350 330,${250 + bifOffset} C 324,${220 + bifOffset} 308,${195 + bifOffset} 314,${160 + bifOffset} C 302,${110 + bifOffset * 0.7} 285,55 270,0 L 288,0 C 302,55 320,${110 + bifOffset * 0.7} 334,${142 + bifOffset} Q 344,${154 + bifOffset} 354,${142 + bifOffset} C 368,${110 + bifOffset * 0.7} 382,55 398,0 L 412,0 C 398,55 386,${110 + bifOffset * 0.7} 372,${160 + bifOffset} C 380,${195 + bifOffset} 366,${220 + bifOffset} 360,${250 + bifOffset} C 364,350 360,480 362,620 Z`} />
                </>
              ) : (
                <path d={`M 364,620 C 364,570 362,535 362,535 C 364,430 356,330 360,${250 + bifOffset} C 366,${220 + bifOffset} 380,${195 + bifOffset} 372,${160 + bifOffset} C 386,${110 + bifOffset * 0.7} 398,55 412,0 L 398,0 C 382,55 368,${110 + bifOffset * 0.7} 354,${142 + bifOffset} Q 344,${154 + bifOffset} 334,${142 + bifOffset} C 320,${110 + bifOffset * 0.7} 302,55 288,0 L 270,0 C 285,55 302,${110 + bifOffset * 0.7} 314,${160 + bifOffset} C 308,${195 + bifOffset} 324,${220 + bifOffset} 330,${250 + bifOffset} C 334,330 328,430 330,520 C 332,532 320,535 288,512 C 268,498 252,496 248,400 C 248,320 240,200 242,80 L 224,80 C 222,200 230,320 228,400 C 228,460 224,494 216,498 C 175,485 145,485 105,510 C 96,510 92,518 92,530 C 92,542 96,550 105,550 C 185,530 245,530 315,555 C 318,575 320,598 322,620 Z`} />
              )}
            </clipPath>

            {/* Left Vascular Silhouettes Clip Path */}
            <clipPath id="left-vascular-clip">
              {activeArchVariant === 'bovine_common_origin' ? (
                <>
                  <path d={`M 364,575 C 430,565 510,550 538,535 C 544,430 536,330 540,${250 + bifOffset} C 534,${220 + bifOffset} 520,${195 + bifOffset} 528,${160 + bifOffset} C 514,${110 + bifOffset * 0.7} 502,55 488,0 L 502,0 C 516,55 532,${110 + bifOffset * 0.7} 546,${142 + bifOffset} Q 556,${154 + bifOffset} 566,${142 + bifOffset} C 580,${110 + bifOffset * 0.7} 598,55 612,0 L 630,0 C 615,55 598,${110 + bifOffset * 0.7} 586,${160 + bifOffset} C 592,${195 + bifOffset} 576,${220 + bifOffset} 570,${250 + bifOffset} C 566,330 574,430 570,535 C 568,555 505,585 364,615 Z`} />
                  <path d="M 618,620 C 624,570 642,530 652,502 C 656,460 658,380 658,200 C 658,140 660,100 662,80 L 680,80 C 680,100 680,140 680,200 C 680,380 676,460 682,502 C 715,494 755,496 795,516 C 802,516 805,522 805,530 C 805,538 802,545 795,545 C 755,545 700,545 660,560 C 656,575 654,598 654,620 Z" />
                </>
              ) : activeArchVariant === 'left_vertebral_from_arch' ? (
                <>
                  <path d={`M 538,620 C 542,450 536,330 540,${250 + bifOffset} C 534,${220 + bifOffset} 520,${195 + bifOffset} 528,${160 + bifOffset} C 514,${110 + bifOffset * 0.7} 502,55 488,0 L 502,0 C 516,55 532,${110 + bifOffset * 0.7} 546,${142 + bifOffset} Q 556,${154 + bifOffset} 566,${142 + bifOffset} C 580,${110 + bifOffset * 0.7} 598,55 612,0 L 630,0 C 615,55 598,${110 + bifOffset * 0.7} 586,${160 + bifOffset} C 592,${195 + bifOffset} 576,${220 + bifOffset} 570,${250 + bifOffset} C 566,330 574,450 570,620 Z`} />
                  <path d="M 590,620 C 606,400 658,250 660,80 L 678,80 C 678,250 626,400 610,620 Z" />
                  <path d="M 626,620 C 630,570 650,530 670,504 C 710,496 755,496 795,516 C 802,516 805,522 805,530 C 805,538 802,545 795,545 C 755,545 700,545 665,560 C 660,575 658,598 658,620 Z" />
                </>
              ) : (
                <>
                  <path d={`M 538,620 C 542,450 536,330 540,${250 + bifOffset} C 534,${220 + bifOffset} 520,${195 + bifOffset} 528,${160 + bifOffset} C 514,${110 + bifOffset * 0.7} 502,55 488,0 L 502,0 C 516,55 532,${110 + bifOffset * 0.7} 546,${142 + bifOffset} Q 556,${154 + bifOffset} 566,${142 + bifOffset} C 580,${110 + bifOffset * 0.7} 598,55 612,0 L 630,0 C 615,55 598,${110 + bifOffset * 0.7} 586,${160 + bifOffset} C 592,${195 + bifOffset} 576,${220 + bifOffset} 570,${250 + bifOffset} C 566,330 574,450 570,620 Z`} />
                  <path d="M 618,620 C 624,570 642,530 652,502 C 656,460 658,380 658,200 C 658,140 660,100 662,80 L 680,80 C 680,100 680,140 680,200 C 680,380 676,460 682,502 C 715,494 755,496 795,516 C 802,516 805,522 805,530 C 805,538 802,545 795,545 C 755,545 700,545 660,560 C 656,575 654,598 654,620 Z" />
                </>
              )}
            </clipPath>
          </defs>

          <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`} className="origin-center transition-transform duration-100 ease-out">

            {/* ========================================================================= */}
            {/* LAYER 0: SUBTLE AORTIC ARCH ROOF ANCHOR                                  */}
            {/* ========================================================================= */}
            <path
              d="M 270,630 C 420,605 580,605 730,630"
              fill="none"
              stroke="#334155"
              strokeWidth="2.5"
              strokeDasharray="5 4"
              opacity={0.5}
            />
            {labelDensity !== 'hidden' && (
              <text x="500" y="640" textAnchor="middle" className="text-[9px] font-bold fill-slate-500 uppercase tracking-widest select-none">
                Aortic Arch Origin Scaffold
              </text>
            )}

            {/* ========================================================================= */}
            {/* LAYER 1: TRUE CONTINUOUS CLOSED FILLED SILHOUETTES (CONNECTED ROOTS)      */}
            {/* ========================================================================= */}
            <g id="visible-anatomy">

              {/* ========================================================= */}
              {/* RIGHT VASCULAR SUBSYSTEM (BCT -> RSA + RVA + RCCA -> BULB -> ICA/ECA) */}
              {/* ========================================================= */}
              {activeArchVariant === 'aberrant_right_subclavian' || activeArchVariant === 'separate_rcca_and_rsa' ? (
                // Separate RCCA and RSA origins (No BCT)
                <>
                  {/* Separate Broad Patent Right Subclavian + Vertebral */}
                  <path
                    d="
                      M 285,620
                      C 260,560 195,530 105,550
                      C 96,550 92,542 92,530
                      C 92,518 96,510 105,510
                      C 150,485 190,485 216,498
                      C 224,494 222,460 222,400
                      C 220,320 222,200 224,80
                      L 242,80
                      C 240,200 248,320 246,400
                      C 246,460 250,496 256,498
                      C 285,508 305,555 315,620
                      Z
                    "
                    fill="#1e293b"
                    stroke="#334155"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  {/* Separate Broad Patent Right Carotid Tree from arch */}
                  <path
                    d={`
                      M 330,620
                      C 328,480 334,350 330,${250 + bifOffset}
                      C 324,${220 + bifOffset} 308,${195 + bifOffset} 314,${160 + bifOffset}
                      C 302,${110 + bifOffset * 0.7} 285,55 270,0
                      L 288,0
                      C 302,55 320,${110 + bifOffset * 0.7} 334,${142 + bifOffset}
                      Q 344,${154 + bifOffset} 354,${142 + bifOffset}
                      C 368,${110 + bifOffset * 0.7} 382,55 398,0
                      L 412,0
                      C 398,55 386,${110 + bifOffset * 0.7} 372,${160 + bifOffset}
                      C 380,${195 + bifOffset} 366,${220 + bifOffset} 360,${250 + bifOffset}
                      C 364,350 360,480 362,620
                      Z
                    `}
                    fill="#1e293b"
                    stroke="#334155"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                </>
              ) : (
                // Standard & Bovine: Connected Wide Patent Brachiocephalic Trunk (BCT) dividing into RCCA + RSA (with RVA)
                <path
                  d={`
                    M 364,620
                    C 364,570 362,535 362,535
                    C 364,430 356,330 360,${250 + bifOffset}
                    C 366,${220 + bifOffset} 380,${195 + bifOffset} 372,${160 + bifOffset}
                    C 386,${110 + bifOffset * 0.7} 398,55 412,0
                    L 398,0
                    C 382,55 368,${110 + bifOffset * 0.7} 354,${142 + bifOffset}
                    Q 344,${154 + bifOffset} 334,${142 + bifOffset}
                    C 320,${110 + bifOffset * 0.7} 302,55 288,0
                    L 270,0
                    C 285,55 302,${110 + bifOffset * 0.7} 314,${160 + bifOffset}
                    C 308,${195 + bifOffset} 324,${220 + bifOffset} 330,${250 + bifOffset}
                    C 334,330 328,430 330,520
                    C 332,532 320,535 288,512
                    C 268,498 252,496 248,400
                    C 248,320 240,200 242,80
                    L 224,80
                    C 222,200 230,320 228,400
                    C 228,460 224,494 216,498
                    C 175,485 145,485 105,510
                    C 96,510 92,518 92,530
                    C 92,542 96,550 105,550
                    C 185,530 245,530 315,555
                    C 318,575 320,598 322,620
                    Z
                  `}
                  fill="#1e293b"
                  stroke="#334155"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              )}

              {/* ========================================================= */}
              {/* LEFT VASCULAR SUBSYSTEM (LCCA + LSA + LVA)                */}
              {/* ========================================================= */}
              {activeArchVariant === 'bovine_common_origin' ? (
                // Bovine Arch: Left CCA arises broadly from the Brachiocephalic Trunk
                <>
                  {/* Left CCA branching broadly from BCT stem */}
                  <path
                    d={`
                      M 364,575
                      C 430,565 510,550 538,535
                      C 544,430 536,330 540,${250 + bifOffset}
                      C 534,${220 + bifOffset} 520,${195 + bifOffset} 528,${160 + bifOffset}
                      C 514,${110 + bifOffset * 0.7} 502,55 488,0
                      L 502,0
                      C 516,55 532,${110 + bifOffset * 0.7} 546,${142 + bifOffset}
                      Q 556,${154 + bifOffset} 566,${142 + bifOffset}
                      C 580,${110 + bifOffset * 0.7} 598,55 612,0
                      L 630,0
                      C 615,55 598,${110 + bifOffset * 0.7} 586,${160 + bifOffset}
                      C 592,${195 + bifOffset} 576,${220 + bifOffset} 570,${250 + bifOffset}
                      C 566,330 574,430 570,535
                      C 568,555 505,585 364,615
                      Z
                    `}
                    fill="#1e293b"
                    stroke="#334155"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  {/* Sleek, Proportionate Left Subclavian + Vertebral (Matching Right Side) */}
                  <path
                    d="
                      M 618,620
                      C 624,570 642,530 652,502
                      C 656,460 658,380 658,200
                      C 658,140 660,100 662,80
                      L 680,80
                      C 680,100 680,140 680,200
                      C 680,380 676,460 682,502
                      C 715,494 755,496 795,516
                      C 802,516 805,522 805,530
                      C 805,538 802,545 795,545
                      C 755,545 700,545 660,560
                      C 656,575 654,598 654,620
                      Z
                    "
                    fill="#1e293b"
                    stroke="#334155"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                </>
              ) : activeArchVariant === 'left_vertebral_from_arch' ? (
                // Left Vertebral arises directly from Aortic Arch with broad open origins
                <>
                  {/* Left CCA (Independent broad arch origin) */}
                  <path
                    d={`
                      M 538,620
                      C 542,450 536,330 540,${250 + bifOffset}
                      C 534,${220 + bifOffset} 520,${195 + bifOffset} 528,${160 + bifOffset}
                      C 514,${110 + bifOffset * 0.7} 502,55 488,0
                      L 502,0
                      C 516,55 532,${110 + bifOffset * 0.7} 546,${142 + bifOffset}
                      Q 556,${154 + bifOffset} 566,${142 + bifOffset}
                      C 580,${110 + bifOffset * 0.7} 598,55 612,0
                      L 630,0
                      C 615,55 598,${110 + bifOffset * 0.7} 586,${160 + bifOffset}
                      C 592,${195 + bifOffset} 576,${220 + bifOffset} 570,${250 + bifOffset}
                      C 566,330 574,450 570,620
                      Z
                    `}
                    fill="#1e293b"
                    stroke="#334155"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  {/* Left Vertebral Artery arising directly from Arch Base */}
                  <path
                    d="
                      M 590,620
                      C 606,400 658,250 660,80
                      L 678,80
                      C 678,250 626,400 610,620
                      Z
                    "
                    fill="#1e293b"
                    stroke="#334155"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  {/* Proportionate Left Subclavian without Vertebral */}
                  <path
                    d="
                      M 626,620
                      C 630,570 650,530 670,504
                      C 710,496 755,496 795,516
                      C 802,516 805,522 805,530
                      C 805,538 802,545 795,545
                      C 755,545 700,545 665,560
                      C 660,575 658,598 658,620
                      Z
                    "
                    fill="#1e293b"
                    stroke="#334155"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                </>
              ) : (
                // Standard Left System: Independent Broad LCCA + Sleek Proportionate LSA (with LVA)
                <>
                  {/* Left CCA (Independent arch origin) */}
                  <path
                    d={`
                      M 538,620
                      C 542,450 536,330 540,${250 + bifOffset}
                      C 534,${220 + bifOffset} 520,${195 + bifOffset} 528,${160 + bifOffset}
                      C 514,${110 + bifOffset * 0.7} 502,55 488,0
                      L 502,0
                      C 516,55 532,${110 + bifOffset * 0.7} 546,${142 + bifOffset}
                      Q 556,${154 + bifOffset} 566,${142 + bifOffset}
                      C 580,${110 + bifOffset * 0.7} 598,55 612,0
                      L 630,0
                      C 615,55 598,${110 + bifOffset * 0.7} 586,${160 + bifOffset}
                      C 592,${195 + bifOffset} 576,${220 + bifOffset} 570,${250 + bifOffset}
                      C 566,330 574,450 570,620
                      Z
                    `}
                    fill="#1e293b"
                    stroke="#334155"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  {/* Sleek, Proportionate Left Subclavian + Vertebral (Matching Right Side) */}
                  <path
                    d="
                      M 618,620
                      C 624,570 642,530 652,502
                      C 656,460 658,380 658,200
                      C 658,140 660,100 662,80
                      L 680,80
                      C 680,100 680,140 680,200
                      C 680,380 676,460 682,502
                      C 715,494 755,496 795,516
                      C 802,516 805,522 805,530
                      C 805,538 802,545 795,545
                      C 755,545 700,545 660,560
                      C 656,575 654,598 654,620
                      Z
                    "
                    fill="#1e293b"
                    stroke="#334155"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                </>
              )}

              {/* Single Major Vessel Labels (Non-repeated, positioned cleanly away from vessels) */}
              {labelDensity !== 'hidden' && (
                <>
                  {/* Right side labels */}
                  <text x="375" y="460" textAnchor="start" className="text-[10px] font-bold fill-slate-400 uppercase tracking-widest select-none">CCA</text>
                  <text x="286" y={190 + bifOffset} textAnchor="end" className="text-[10px] font-bold fill-slate-400 uppercase tracking-widest select-none">Bulb</text>
                  <text x="245" y="40" textAnchor="end" className="text-[10px] font-bold fill-slate-400 uppercase tracking-widest select-none">ICA</text>
                  <text x="425" y="40" textAnchor="start" className="text-[10px] font-bold fill-slate-400 uppercase tracking-widest select-none">ECA</text>
                  <text x="215" y="210" textAnchor="end" className="text-[10px] font-bold fill-slate-400 uppercase tracking-widest select-none">Vert</text>
                  <text x="180" y="535" textAnchor="middle" className="text-[10px] font-bold fill-slate-400 uppercase tracking-widest select-none">Subclavian</text>
                  {activeArchVariant !== 'aberrant_right_subclavian' && activeArchVariant !== 'separate_rcca_and_rsa' && (
                    <text x="345" y="585" textAnchor="middle" className="text-[9px] font-extrabold fill-slate-500 uppercase tracking-wider select-none">BCT</text>
                  )}

                  {/* Left side labels */}
                  <text x="575" y="460" textAnchor="start" className="text-[10px] font-bold fill-slate-400 uppercase tracking-widest select-none">CCA</text>
                  <text x="604" y={190 + bifOffset} textAnchor="start" className="text-[10px] font-bold fill-slate-400 uppercase tracking-widest select-none">Bulb</text>
                  <text x="640" y="40" textAnchor="start" className="text-[10px] font-bold fill-slate-400 uppercase tracking-widest select-none">ICA</text>
                  <text x="455" y="40" textAnchor="end" className="text-[10px] font-bold fill-slate-400 uppercase tracking-widest select-none">ECA</text>
                  <text x="685" y="210" textAnchor="start" className="text-[10px] font-bold fill-slate-400 uppercase tracking-widest select-none">Vert</text>
                  <text x="710" y="535" textAnchor="middle" className="text-[10px] font-bold fill-slate-400 uppercase tracking-widest select-none">Subclavian</text>
                  {activeArchVariant === 'bovine_common_origin' && (
                    <text x="460" y="585" textAnchor="middle" className="text-[8.5px] font-extrabold fill-amber-400 uppercase tracking-wider select-none">Bovine Stem</text>
                  )}
                </>
              )}

              {/* Classification Badges */}
              {rightEval && rightEval.category && rightEval.category !== 'Not Assessed' && (
                <text
                  x="345"
                  y={180 + bifOffset}
                  textAnchor="middle"
                  className={`text-[9px] font-mono font-black select-none ${
                    rightEval.category.includes('Severe') || rightEval.category.includes('70') ? 'fill-rose-400' :
                    rightEval.category.includes('Moderate') || rightEval.category.includes('50') ? 'fill-orange-400' : 'fill-emerald-400'
                  }`}
                  style={{ pointerEvents: 'none' }}
                >
                  {rightEval.category.includes('50-69') ? '50-69%' : rightEval.category.includes('70') ? '≥70%' : rightEval.category.includes('Normal') ? 'NORMAL' : rightEval.category}
                </text>
              )}

              {leftEval && leftEval.category && leftEval.category !== 'Not Assessed' && (
                <text
                  x="555"
                  y={180 + bifOffset}
                  textAnchor="middle"
                  className={`text-[9px] font-mono font-black select-none ${
                    leftEval.category.includes('Severe') || leftEval.category.includes('70') ? 'fill-rose-400' :
                    leftEval.category.includes('Moderate') || leftEval.category.includes('50') ? 'fill-orange-400' : 'fill-emerald-400'
                  }`}
                  style={{ pointerEvents: 'none' }}
                >
                  {leftEval.category.includes('50-69') ? '50-69%' : leftEval.category.includes('70') ? '≥70%' : leftEval.category.includes('Normal') ? 'NORMAL' : leftEval.category}
                </text>
              )}
            </g>

            {/* ========================================================================= */}
            {/* LAYER 2: CONTINUOUS FLOWING PLAQUE & RESIDUAL PATENT LUMEN CHANNELS       */}
            {/* ========================================================================= */}
            {renderContinuousLesions()}

            {/* ========================================================================= */}
            {/* LAYER 3, 4, 5: INTERACTIVE SELECTION, HIT ZONES & VELOCITY OVERLAYS        */}
            {/* ========================================================================= */}
            {Object.keys(SEGMENTS_META).map(id => {
              const s = studyData.segments[id];
              const meta = SEGMENTS_META[id];
              const geom = segmentGeometries[id];
              if (!s || !meta || !geom) return null;

              const isSelected = selectedSegmentIds.includes(id);
              const isActive = activeSegmentId === id;
              const isHovered = hoveredId === id;
              const isStenotic = s.stenosisPresent;
              const hasPsv = s.psv !== null;
              const isOccluded = s.flowDirection === 'absent';

              const { segPolygon, hitPath, velocityPos } = geom;

              const psvVal = s.psv || 0;
              const sideEval = meta.side === 'right' ? rightEval : leftEval;
              const isIcaOrBulb = meta.type === 'ica' || meta.type === 'bulb';
              const isSevere = isStenotic && (psvVal >= 230 || s.comments.toLowerCase().includes('severe') || s.comments.toLowerCase().includes('70') || s.comments.toLowerCase().includes('95') || (isIcaOrBulb && sideEval?.category.includes('Severe')));
              const isModerate = !isSevere && (isStenotic || psvVal >= 125) && (psvVal >= 125 || s.comments.toLowerCase().includes('moderate') || s.comments.toLowerCase().includes('50') || (isIcaOrBulb && sideEval?.category.includes('Moderate')));

              const sideNascet = meta.side ? (studyData.nascet ? studyData.nascet[meta.side as 'right' | 'left'] : undefined) : undefined;
              const nascetVal = sideNascet?.longitudinal?.calculatedStenosis ?? sideNascet?.transverse?.calculatedStenosis ?? (meta.side === 'right' ? studyData.nascetRight?.calculatedPercent : studyData.nascetLeft?.calculatedPercent) ?? null;
              
              // Determine if this exact segment is the primary stenosis / plaque lesion site
              const sidePrefix = meta.side === 'right' ? 'r_' : 'l_';
              const sideIcaPlaques = studyData.plaques.filter(p => p.segments.some(segId => segId.startsWith(sidePrefix)));
              const explicitMaxSite = sideIcaPlaques.find(p => p.maxPlaqueSite)?.maxPlaqueSite;
              
              // Find the ICA segment with peak velocity on this side
              const sideIcaIds = [`${sidePrefix}ica_prox`, `${sidePrefix}ica_mid`, `${sidePrefix}ica_dist`];
              let peakIcaId = `${sidePrefix}ica_prox`;
              let maxIcaPsv = -1;
              sideIcaIds.forEach(segId => {
                const segPsv = studyData.segments[segId]?.psv ?? -1;
                if (segPsv > maxIcaPsv) {
                  maxIcaPsv = segPsv;
                  peakIcaId = segId;
                }
              });

              const isPrimaryLesionSite = explicitMaxSite ? (id === explicitMaxSite) : (id === peakIcaId);
              const isStenoticOrAtheroma = s.stenosisPresent || (s.psv !== null && s.psv >= 125) || s.plaquePresent;

              // NASCET should ONLY appear at the focal stenosis site, never on the rest of the normal vessel
              const showNascet = isIcaOrBulb && isPrimaryLesionSite && isStenoticOrAtheroma && nascetVal !== null && nascetVal > 0;

              return (
                <g
                  key={id}
                  className="group cursor-pointer"
                  onClick={(e) => handleSegmentClick(e, id)}
                  onDoubleClick={(e) => handleSegmentDoubleClick(e, id)}
                  onMouseMove={(e) => handleMouseMove(e, id)}
                  onMouseLeave={handleMouseLeave}
                >
                  {/* Selection / Hover Glow Overlay (Fills the anatomical segment polygon) */}
                  {(isActive || isSelected || isHovered) && segPolygon && (
                    <path
                      d={segPolygon}
                      fill={isActive ? '#22d3ee' : isSelected ? '#06b6d4' : '#38bdf8'}
                      fillOpacity={isActive ? 0.35 : isSelected ? 0.25 : 0.15}
                      stroke={isActive ? '#22d3ee' : isSelected ? '#06b6d4' : '#38bdf8'}
                      strokeWidth="1.5"
                    />
                  )}

                  {/* LAYER 5: Invisible Hit Zone (Transparent interactive overlay for clicking/hover) */}
                  {hitPath && (
                    <path
                      d={hitPath}
                      fill="none"
                      stroke="transparent"
                      strokeWidth={40}
                      strokeLinecap="butt"
                      strokeLinejoin="round"
                      style={{ pointerEvents: 'stroke', cursor: 'pointer' }}
                    />
                  )}

                  {/* PSV Only Label */}
                  {showVelocities && velocityPos && hasPsv && (
                    <g transform={`translate(${velocityPos.x}, ${velocityPos.y})`} className="select-none" style={{ pointerEvents: 'none' }}>
                      <text
                        x={velocityPos.align === 'end' ? -3 : 3}
                        y={0}
                        textAnchor={velocityPos.align === 'end' ? 'end' : 'start'}
                        className={`text-[9.5px] font-mono font-black ${
                          isOccluded ? 'fill-rose-500 font-bold' :
                          isSevere ? 'fill-rose-400 font-black' :
                          isModerate ? 'fill-orange-400 font-black' :
                          s.psv >= 125 ? 'fill-orange-400' : 'fill-cyan-300'
                        }`}
                      >
                        {s.psv}
                      </text>

                      {showNascet && nascetVal !== null && (
                        <text
                          x={velocityPos.align === 'end' ? -3 : 3}
                          y={10}
                          textAnchor={velocityPos.align === 'end' ? 'end' : 'start'}
                          className="text-[8px] font-mono font-black fill-rose-400"
                        >
                          {Math.round(nascetVal)}%
                        </text>
                      )}
                    </g>
                  )}
                </g>
              );
            })}

          </g>
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredId && hoveredMeta && hoveredData && (
          <div
            className="absolute z-50 bg-[#0b1329]/95 border border-slate-700 p-3 rounded-lg shadow-xl text-xs text-slate-100 max-w-xs pointer-events-none backdrop-blur-sm shadow-cyan-950/30"
            style={{ left: `${tooltipPos.x}px`, top: `${tooltipPos.y}px` }}
          >
            <div className="flex items-center justify-between gap-4 mb-1 border-b border-slate-800 pb-1">
              <span className="font-extrabold text-cyan-400">{hoveredMeta.name}</span>
              <span className="text-[10px] text-slate-400 font-mono uppercase">{hoveredMeta.side}</span>
            </div>
            <div className="space-y-1 text-slate-300 text-[11px]">
              <div>PSV: <strong className="text-cyan-300 font-mono">{hoveredData.psv !== null ? `${hoveredData.psv} cm/s` : 'Not Assessed'}</strong></div>
              <div>Plaque: <strong className={hoveredData.plaquePresent ? 'text-amber-400' : 'text-slate-400'}>{hoveredData.plaquePresent ? 'Present' : 'None'}</strong></div>
              <div>Stenosis: <strong className={hoveredData.stenosisPresent ? 'text-rose-400' : 'text-slate-400'}>{hoveredData.stenosisPresent ? 'Stenosis' : 'None'}</strong></div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
