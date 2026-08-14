import React, { useState } from 'react';
import { StudyData, SegmentData } from '../types';
import { SEGMENTS_META } from '../constants';
import { checkSubclavianSteal, calculateIcaCcaRatio, suggestIcaStenosisCategory } from '../utils/calculations';
import { ShieldAlert, ArrowUp, ArrowDown, ArrowUpDown, X, HelpCircle, Activity, Eye, Layers } from 'lucide-react';

interface CarotidDiagramProps {
  studyData: StudyData;
  selectedSegmentIds: string[];
  activeSegmentId: string | null;
  onSelectSegment: (id: string, isMulti: boolean) => void;
  onAssessSegment: (id: string) => void;
  onToggleVariant: () => void;
}

export const CarotidDiagram: React.FC<CarotidDiagramProps> = ({
  studyData,
  selectedSegmentIds,
  activeSegmentId,
  onSelectSegment,
  onAssessSegment,
  onToggleVariant,
}) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Floating Precision Zoom and Pan States
  const [zoom, setZoom] = useState<number>(1.0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  
  // View mode & Label density
  const [focusMode, setFocusMode] = useState<boolean>(true);
  const [labelDensity, setLabelDensity] = useState<'minimal' | 'full' | 'hidden'>('minimal');

  const isRightSteal = checkSubclavianSteal('right', studyData);
  const isLeftSteal = checkSubclavianSteal('left', studyData);

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

  const handleMouseLeave = () => {
    setHoveredId(null);
  };

  const handleZoomIn = () => setZoom(z => Math.min(z + 0.15, 3.5));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.15, 0.4));
  const handlePan = (dx: number, dy: number) => setPan(p => ({ x: p.x + dx, y: p.y + dy }));
  const handleReset = () => {
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
  };

  // Calculate ICA/CCA ratios
  const rightIcaCca = calculateIcaCcaRatio('right', studyData);
  const leftIcaCca = calculateIcaCcaRatio('left', studyData);

  // Evaluate classifications for color coding
  const rightEval = suggestIcaStenosisCategory('right', studyData);
  const leftEval = suggestIcaStenosisCategory('left', studyData);

  // Helper for ECA/CCA ratio
  const getEcaCcaRatio = (side: 'right' | 'left', ecaPsv: number | null): number | null => {
    if (!ecaPsv) return null;
    const ccaDist = studyData.segments[`${side === 'right' ? 'r' : 'l'}_cca_dist`];
    const ccaMid = studyData.segments[`${side === 'right' ? 'r' : 'l'}_cca_mid`];
    const ccaPsv = ccaDist?.psv || ccaMid?.psv;
    if (ccaPsv && ccaPsv > 0) {
      return parseFloat((ecaPsv / ccaPsv).toFixed(2));
    }
    return null;
  };

  // Render a vessel path segment with rich annotations and direct velocities
  const renderVessel = (
    id: string,
    d: string,
    strokeWidth: number = 14,
    labelPos?: { x: number; y: number; align?: 'start' | 'middle' | 'end' },
    velocityPos?: { x: number; y: number; align?: 'start' | 'middle' | 'end' }
  ) => {
    const s = studyData.segments[id];
    const meta = SEGMENTS_META[id];
    if (!s || !meta) return null;

    const isSelected = selectedSegmentIds.includes(id);
    const isActive = activeSegmentId === id;
    const isHovered = hoveredId === id;
    const isStenotic = s.stenosisPresent;
    const isPlaque = s.plaquePresent;
    const isImtIncreased = s.intimalThickening;
    const hasPsv = s.psv !== null;
    const isOccluded = s.flowDirection === 'absent';

    const side = meta.side;
    const matchingPlaque = studyData.plaques.find(p => p.segments.includes(id) || p.maxPlaqueSite === id);
    const plaqueComp = matchingPlaque?.composition?.toLowerCase() || '';

    // Determine stenosis severity level
    const psvVal = s.psv || 0;
    const sideEval = side === 'right' ? rightEval : leftEval;
    const isIcaOrBulb = meta.type === 'ica' || meta.type === 'bulb';
    const isEca = meta.type === 'eca';
    
    let isSevere = isStenotic && (psvVal >= 230 || s.comments.toLowerCase().includes('severe') || s.comments.toLowerCase().includes('70') || s.comments.toLowerCase().includes('80') || (isIcaOrBulb && sideEval?.category.includes('Severe')));
    let isModerate = !isSevere && (isStenotic || psvVal >= 125) && (psvVal >= 125 || s.comments.toLowerCase().includes('moderate') || s.comments.toLowerCase().includes('50') || (isIcaOrBulb && sideEval?.category.includes('Moderate')));
    let isMild = !isSevere && !isModerate && (isPlaque || isStenotic);

    let finalStrokeWidth = strokeWidth;
    if (meta.type === 'bulb') {
      finalStrokeWidth = strokeWidth * 1.5; // Enlarged bulb
    }

    // Label formatting based on density
    let displayName = meta.shortName;
    if (labelDensity === 'minimal') {
      displayName = meta.shortName.split(' ')[0]; // e.g. "ICA", "CCA", "Vert", "Sub", "BCT", "Bulb"
    }

    // NASCET percentage for this side if > 50%
    const sideNascet = studyData.nascet[side as 'right' | 'left'];
    const nascetVal = sideNascet?.longitudinal?.calculatedStenosis ?? sideNascet?.transverse?.calculatedStenosis ?? null;
    const showNascet = isIcaOrBulb && nascetVal !== null && nascetVal > 50;

    // Calculate ECA/CCA ratio if ECA segment
    const ecaRatio = isEca ? getEcaCcaRatio(side as 'right' | 'left', s.psv) : null;
    const icaRatio = isIcaOrBulb ? (side === 'right' ? rightIcaCca?.ratio : leftIcaCca?.ratio) : null;
    const showRatio = (isIcaOrBulb && (isSevere || isModerate || psvVal >= 125 || (icaRatio && icaRatio >= 2.0))) ||
                      (isEca && (isSevere || isModerate || psvVal >= 150 || (ecaRatio && ecaRatio >= 2.0)));

    return (
      <g
        key={id}
        className="group cursor-pointer"
        onClick={(e) => handleSegmentClick(e, id)}
        onDoubleClick={(e) => handleSegmentDoubleClick(e, id)}
        onMouseMove={(e) => handleMouseMove(e, id)}
        onMouseLeave={handleMouseLeave}
      >
        {/* Glow backing for active, selected, or hovered */}
        {(isActive || isSelected || isHovered) && (
          <path
            d={d}
            fill="none"
            stroke={isActive ? '#22d3ee' : isSelected ? '#06b6d4' : '#475569'}
            strokeWidth={finalStrokeWidth + 12}
            strokeLinecap="round"
            opacity={isActive ? 0.6 : isSelected ? 0.4 : 0.2}
            filter={isActive ? 'url(#neon-glow)' : undefined}
          />
        )}

        {/* Outer Arterial Vessel Wall Boundary */}
        <path
          d={d}
          fill="none"
          stroke={isActive ? '#22d3ee' : isSelected ? '#0891b2' : '#334155'}
          strokeWidth={finalStrokeWidth + 2}
          strokeLinecap="round"
        />

        {/* Intraluminal Base (Dark Vessel Cavity) */}
        <path
          d={d}
          fill="none"
          stroke="#020617"
          strokeWidth={finalStrokeWidth - 1}
          strokeLinecap="round"
        />

        {/* Normal Flow Streamline (When normal & assessed) */}
        {hasPsv && !isPlaque && !isStenotic && !isOccluded && (
          <path
            d={d}
            fill="none"
            stroke="#0d9488"
            strokeWidth={3.5}
            strokeLinecap="round"
            opacity={0.85}
          />
        )}

        {/* Intraluminal Plaque & Grayscale Morphology Cues (Drawn inside vessel without severity color override) */}
        {isOccluded ? (
          <>
            <path d={d} fill="none" stroke="#7f1d1d" strokeWidth={finalStrokeWidth - 2} strokeLinecap="round" opacity={0.95} />
            <path d={d} fill="none" stroke="#ef4444" strokeWidth={2.5} strokeLinecap="round" strokeDasharray="4,2" />
          </>
        ) : isPlaque || isStenotic || isImtIncreased ? (
          <>
            {/* Plaque base rendered using grayscale morphology cues */}
            <path
              d={d}
              fill="none"
              stroke={
                plaqueComp.includes('hypo') ? '#64748b' : // Hypoechoic = dark soft gray
                plaqueComp.includes('calc') ? '#1e293b' : // Calcific = dense dark core
                plaqueComp.includes('echog') || plaqueComp.includes('hyper') ? '#cbd5e1' : // Echogenic = bright silver
                plaqueComp.includes('mixed') || plaqueComp.includes('hetero') ? '#94a3b8' : '#475569' // Isoechoic = medium gray
              }
              strokeWidth={finalStrokeWidth * (isSevere ? 0.75 : isModerate ? 0.55 : 0.35)}
              strokeLinecap="round"
              opacity={0.88}
            />
            {/* Calcific bright center highlight if calcific */}
            {plaqueComp.includes('calc') && (
              <path d={d} fill="none" stroke="#f8fafc" strokeWidth={2} strokeLinecap="round" />
            )}
            {/* Luminal residual core */}
            <path
              d={d}
              fill="none"
              stroke={isSevere ? '#fef08a' : isModerate ? '#fed7aa' : '#38bdf8'}
              strokeWidth={isSevere ? 2 : 3}
              strokeLinecap="round"
            />
          </>
        ) : null}

        {/* Wide Transparent Hit Area for Effortless Clinical Clicking */}
        <path
          d={d}
          fill="none"
          stroke="transparent"
          strokeWidth={28}
          strokeLinecap="round"
          style={{ pointerEvents: 'stroke', cursor: 'pointer' }}
        />

        {/* Point of Maximum Stenosis (Focal MAX Marker) */}
        {(isStenotic || isSevere || isModerate) && (
          <g transform={`translate(${getMidpointOfPath(d).x}, ${getMidpointOfPath(d).y})`} style={{ pointerEvents: 'none' }}>
            <circle r={5.5} fill="#ef4444" stroke="#ffffff" strokeWidth={1.2} className="animate-pulse" />
            <text x={0} y={2.2} textAnchor="middle" className="text-[6px] font-black fill-white uppercase select-none">
              MAX
            </text>
          </g>
        )}

        {/* Short Anatomy Label (NO BOXES, immediately adjacent to vessel) */}
        {labelPos && labelDensity !== 'hidden' && (
          <text
            x={labelPos.x}
            y={labelPos.y}
            textAnchor={labelPos.align || 'middle'}
            className={`text-[9px] font-bold tracking-tight select-none transition-colors ${
              isActive
                ? 'fill-cyan-300 font-black'
                : isSelected
                ? 'fill-cyan-400 font-extrabold'
                : isHovered
                ? 'fill-white'
                : 'fill-slate-400'
            }`}
            style={{ pointerEvents: 'none' }}
          >
            {displayName}
          </text>
        )}

        {/* Compact Adjacent Numbers (PSV, EDV, Ratio ICA/CCA or ECA/CCA if >50%) */}
        {velocityPos && hasPsv && (
          <g transform={`translate(${velocityPos.x}, ${velocityPos.y})`} className="select-none" style={{ pointerEvents: 'none' }}>
            {/* Peak Systolic Velocity */}
            <text
              x={velocityPos.align === 'end' ? -2 : 2}
              y={-4}
              textAnchor={velocityPos.align === 'end' ? 'end' : 'start'}
              className={`text-[9.5px] font-mono font-black ${
                isOccluded ? 'fill-rose-500 font-bold' :
                isSevere ? 'fill-rose-400 font-black' :
                isModerate ? 'fill-orange-400 font-black' :
                isMild ? 'fill-amber-400' :
                s.psv && s.psv >= 125 ? 'fill-orange-400' : 'fill-emerald-400'
              }`}
            >
              <tspan className="text-[7px] font-sans font-bold fill-slate-500">P </tspan>
              {s.psv}
            </text>
            
            {/* End Diastolic Velocity */}
            <text
              x={velocityPos.align === 'end' ? -2 : 2}
              y={4.5}
              textAnchor={velocityPos.align === 'end' ? 'end' : 'start'}
              className="text-[8px] font-mono fill-slate-300 font-medium"
            >
              <tspan className="text-[6.5px] font-sans fill-slate-500">E </tspan>
              {s.edv !== null ? s.edv : '-'}
            </text>

            {/* Display ICA/CCA or ECA/CCA ratio when stenosis >50% or PSV >= 125 */}
            {showRatio && (
              <text
                x={velocityPos.align === 'end' ? -2 : 2}
                y={13}
                textAnchor={velocityPos.align === 'end' ? 'end' : 'start'}
                className="text-[8px] font-mono font-black fill-cyan-300"
              >
                <tspan className="text-[6.5px] font-sans font-bold fill-slate-400">
                  {isEca ? 'E/C ' : 'R '}
                </tspan>
                {isEca ? ecaRatio?.toFixed(2) : icaRatio?.toFixed(2)}
              </text>
            )}

            {/* Display NASCET % if >50% */}
            {showNascet && nascetVal !== null && (
              <text
                x={velocityPos.align === 'end' ? -2 : 2}
                y={showRatio ? 21 : 13}
                textAnchor={velocityPos.align === 'end' ? 'end' : 'start'}
                className="text-[8px] font-mono font-black fill-rose-400"
              >
                <tspan className="text-[6.5px] font-sans font-bold fill-slate-400">N </tspan>
                {Math.round(nascetVal)}%
              </text>
            )}
          </g>
        )}

        {/* Vertebral Flow Direction Indicator (abnormal: retrograde or bidirectional) */}
        {meta.type === 'vertebral' && hasPsv && (s.flowDirection === 'retrograde' || s.flowDirection === 'bidirectional') && (
          <text
            x={labelPos ? labelPos.x : 200}
            y={(labelPos ? labelPos.y : 200) + 12}
            textAnchor={labelPos?.align || 'middle'}
            className={`text-[8px] font-mono font-black ${
              s.flowDirection === 'retrograde' ? 'fill-rose-400 animate-pulse' : 'fill-amber-400'
            }`}
            style={{ pointerEvents: 'none' }}
          >
            {s.flowDirection === 'retrograde' ? '↓ RETROGRADE' : '↕ BIDIRECTIONAL'}
          </text>
        )}
      </g>
    );
  };

  const getMidpointOfPath = (d: string): { x: number; y: number } => {
    try {
      const parts = d.replace(/[A-Z]/gi, ' ').trim().split(/\s+/);
      if (parts.length >= 4) {
        const x1 = parseFloat(parts[0]);
        const y1 = parseFloat(parts[1]);
        const x2 = parseFloat(parts[parts.length - 2]);
        const y2 = parseFloat(parts[parts.length - 1]);
        return { x: (x1 + x2) / 2, y: (y1 + y2) / 2 };
      }
    } catch (e) {}
    return { x: 500, y: 300 };
  };

  const hoveredMeta = hoveredId ? SEGMENTS_META[hoveredId] : null;
  const hoveredData = hoveredId ? studyData.segments[hoveredId] : null;

  return (
    <div id="carotid-diagram-workspace" className="flex flex-col bg-[#0b1329] rounded-xl border border-slate-800 overflow-hidden relative min-h-[620px] shadow-lg">
      
      {/* Header Info & View Mode Toggle */}
      <div className="p-4 bg-[#0f172a] border-b border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-slate-100 uppercase tracking-wider">Clinical Hemodynamic Map & Anatomical Workspace</span>
            <span className="bg-cyan-950/80 border border-cyan-800 text-cyan-300 text-[9px] px-2 py-0.5 rounded font-mono font-bold">
              {focusMode ? 'Carotid Focus Mode' : 'Full Anatomy View'}
            </span>
          </div>
          <span className="text-[10.5px] text-slate-400">
            Left-click vessels to select. Double-click to document PSV/EDV/Plaque. Ratios & classifications updated live.
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Label Density Selector */}
          <div className="flex items-center bg-[#080d19] rounded-lg border border-slate-700/80 p-0.5">
            <button
              onClick={() => setLabelDensity('minimal')}
              className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                labelDensity === 'minimal' ? 'bg-cyan-600 text-slate-950 font-black shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Minimal Labels
            </button>
            <button
              onClick={() => setLabelDensity('full')}
              className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                labelDensity === 'full' ? 'bg-cyan-600 text-slate-950 font-black shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Full Labels
            </button>
            <button
              onClick={() => setLabelDensity('hidden')}
              className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                labelDensity === 'hidden' ? 'bg-rose-950 border border-rose-800 text-rose-300' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Hide Labels
            </button>
          </div>

          {/* View Mode Toggle Button */}
          <button
            onClick={() => setFocusMode(!focusMode)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              focusMode
                ? 'bg-cyan-600 text-slate-950 font-black shadow-md border border-cyan-500'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
            }`}
            id="toggle-focus-mode"
          >
            <Eye className="w-3.5 h-3.5" />
            {focusMode ? 'Carotid Focus' : 'Full Anatomy'}
          </button>
        </div>
      </div>

      {/* SVG Canvas Container */}
      <div className="p-6 flex items-center justify-center bg-[#070b14] overflow-hidden relative min-h-[580px]">
        
        {/* Floating Precision Viewport Controller */}
        <div className="absolute top-4 right-4 flex items-center gap-1 bg-[#0b1329]/95 border border-slate-700/80 p-1 rounded-lg shadow-xl z-20 backdrop-blur-sm select-none">
          <button
            onClick={handleZoomIn}
            className="w-7 h-7 flex items-center justify-center rounded bg-[#152038] hover:bg-[#1e2d4d] text-cyan-400 font-extrabold text-sm transition-colors cursor-pointer border border-slate-700/50"
            title="Zoom In"
          >
            +
          </button>
          <button
            onClick={handleZoomOut}
            className="w-7 h-7 flex items-center justify-center rounded bg-[#152038] hover:bg-[#1e2d4d] text-cyan-400 font-extrabold text-sm transition-colors cursor-pointer border border-slate-700/50"
            title="Zoom Out"
          >
            -
          </button>
          
          <div className="grid grid-cols-3 gap-0.5 border-l border-r border-slate-800 px-1">
            <div />
            <button onClick={() => handlePan(0, 30)} className="w-5 h-5 flex items-center justify-center rounded bg-[#152038] hover:bg-[#1e2d4d] text-slate-300 text-[10px] cursor-pointer">▲</button>
            <div />
            <button onClick={() => handlePan(30, 0)} className="w-5 h-5 flex items-center justify-center rounded bg-[#152038] hover:bg-[#1e2d4d] text-slate-300 text-[10px] cursor-pointer">◀</button>
            <div />
            <button onClick={() => handlePan(-30, 0)} className="w-5 h-5 flex items-center justify-center rounded bg-[#152038] hover:bg-[#1e2d4d] text-slate-300 text-[10px] cursor-pointer">▶</button>
            <div />
            <button onClick={() => handlePan(0, -30)} className="w-5 h-5 flex items-center justify-center rounded bg-[#152038] hover:bg-[#1e2d4d] text-slate-300 text-[10px] cursor-pointer">▼</button>
          </div>

          <button
            onClick={handleReset}
            className="px-2.5 h-7 flex items-center justify-center rounded bg-[#152038] hover:bg-[#1e2d4d] text-slate-300 hover:text-white font-bold text-[10px] uppercase transition-colors cursor-pointer border border-slate-700/50"
            title="Reset View"
          >
            Fit
          </button>
        </div>

        {/* Anatomical Map SVG Viewport */}
        <svg
          viewBox={focusMode ? "180 0 640 520" : "110 0 780 610"}
          className="w-full max-w-4xl h-auto select-none transition-all duration-300"
          id="carotid-svg-viewport"
        >
          <defs>
            <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`} className="origin-center transition-transform duration-100 ease-out">

            {/* ================= AORTIC ARCH ROOT ================= */}
            <g
              className="cursor-pointer group"
              onClick={(e) => handleSegmentClick(e, 'arch')}
              onDoubleClick={(e) => handleSegmentDoubleClick(e, 'arch')}
            >
              <path
                d="M 380,590 A 120,60 0 0,1 620,590"
                fill="none"
                stroke={selectedSegmentIds.includes('arch') ? '#06b6d4' : '#1e293b'}
                strokeWidth={selectedSegmentIds.includes('arch') ? 22 : 18}
                strokeLinecap="round"
              />
              <text x="500" y="555" textAnchor="middle" className="text-[10px] font-extrabold tracking-widest fill-slate-600 uppercase">
                Aortic Arch
              </text>
            </g>

            {/* ================= RIGHT ARTERIAL SYSTEM (Viewer's Left) ================= */}
            {/* Brachiocephalic Trunk (BCT) */}
            {renderVessel('r_bct_prox', 'M 450,590 C 430,565 415,550 400,535', 15, { x: 432, y: 558, align: 'start' })}
            {renderVessel('r_bct_dist', 'M 400,535 C 385,520 375,510 365,500', 15, { x: 388, y: 512, align: 'start' })}

            {/* Subclavian Right */}
            {renderVessel('r_subcl_prox', 'M 365,500 C 330,502 295,505 260,510', 14, { x: 300, y: 492, align: 'middle' }, { x: 300, y: 524, align: 'middle' })}
            {renderVessel('r_subcl_dist', 'M 260,510 C 220,515 180,520 140,525', 13, { x: 190, y: 504, align: 'middle' }, { x: 190, y: 536, align: 'middle' })}

            {/* Vertebral Right */}
            {renderVessel('r_vert_prox', 'M 295,508 C 293,475 291,440 288,410', 10, { x: 278, y: 460, align: 'end' }, { x: 304, y: 460, align: 'start' })}
            {renderVessel('r_vert_mid', 'M 288,410 C 284,350 280,290 276,230', 9, { x: 268, y: 310, align: 'end' }, { x: 292, y: 310, align: 'start' })}
            {renderVessel('r_vert_dist', 'M 276,230 C 274,180 272,130 270,80', 8, { x: 258, y: 140, align: 'end' }, { x: 284, y: 140, align: 'start' })}

            {/* Common Carotid Artery (CCA) Right (Labels at left ~340, Velocities immediately adjacent at right ~382) */}
            {renderVessel('r_cca_prox', 'M 365,500 C 365,475 365,450 365,420', 14, { x: 342, y: 460, align: 'end' }, { x: 382, y: 460, align: 'start' })}
            {renderVessel('r_cca_mid', 'M 365,420 C 365,360 365,310 365,260', 14, { x: 342, y: 340, align: 'end' }, { x: 382, y: 340, align: 'start' })}
            {renderVessel('r_cca_dist', 'M 365,260 C 365,240 365,220 365,200', 14, { x: 342, y: 235, align: 'end' }, { x: 382, y: 235, align: 'start' })}

            {/* Carotid Bulb Right (Enlarged Bifurcation Zone) */}
            {renderVessel('r_bulb', 'M 365,200 Q 365,175 365,150', 18, { x: 338, y: 175, align: 'end' })}

            {/* Internal Carotid Artery (ICA) Right */}
            {renderVessel('r_ica_prox', 'M 358,150 C 345,135 340,120 335,100', 12, { x: 322, y: 125, align: 'end' }, { x: 356, y: 125, align: 'start' })}
            {renderVessel('r_ica_mid', 'M 335,100 C 330,85 328,70 325,50', 11, { x: 308, y: 75, align: 'end' }, { x: 342, y: 75, align: 'start' })}
            {renderVessel('r_ica_dist', 'M 325,50 C 322,35 320,20 318,5', 10, { x: 300, y: 25, align: 'end' }, { x: 334, y: 25, align: 'start' })}

            {/* External Carotid Artery (ECA) Right */}
            {renderVessel('r_eca_prox', 'M 372,150 C 382,135 388,120 395,100', 11, { x: 408, y: 125, align: 'start' }, { x: 374, y: 125, align: 'end' })}
            {renderVessel('r_eca_mid', 'M 395,100 C 400,85 402,70 405,50', 10, { x: 420, y: 75, align: 'start' }, { x: 388, y: 75, align: 'end' })}
            {renderVessel('r_eca_dist', 'M 405,50 C 408,35 410,20 412,5', 9, { x: 428, y: 25, align: 'start' }, { x: 396, y: 25, align: 'end' })}

            {/* Right Bifurcation Classification Indicator */}
            {rightEval && rightEval.category && rightEval.category !== 'Not Assessed' && (
              <text
                x="365"
                y="142"
                textAnchor="middle"
                className={`text-[8.5px] font-mono font-black select-none ${
                  rightEval.category.includes('Severe') || rightEval.category.includes('80') || rightEval.category.includes('70') ? 'fill-rose-400' :
                  rightEval.category.includes('Moderate') || rightEval.category.includes('50') ? 'fill-orange-400' :
                  rightEval.category.includes('Mild') ? 'fill-amber-400' : 'fill-emerald-400'
                }`}
                style={{ pointerEvents: 'none' }}
              >
                {rightEval.category.includes('80-94') ? '80-94%' :
                 rightEval.category.includes('70-79') ? '70-79%' :
                 rightEval.category.includes('50-69') ? '50-69%' :
                 rightEval.category.includes('Mild') || rightEval.category.includes('<50') ? '<50%' :
                 rightEval.category.includes('Occlusion') ? 'OCCLUDED' : 'NORMAL'}
              </text>
            )}


            {/* ================= LEFT ARTERIAL SYSTEM (Viewer's Right) ================= */}
            {studyData.variantLeftBct ? (
              <>
                {renderVessel('l_bct_prox', 'M 550,590 C 570,565 585,550 600,535', 15, { x: 568, y: 558, align: 'end' })}
                {renderVessel('l_bct_dist', 'M 600,535 C 615,520 625,510 635,500', 15, { x: 612, y: 512, align: 'end' })}
                {renderVessel('l_cca_prox', 'M 635,500 C 635,475 635,450 635,420', 14, { x: 658, y: 460, align: 'start' }, { x: 618, y: 460, align: 'end' })}
                {renderVessel('l_subcl_prox', 'M 635,500 C 670,502 705,505 740,510', 14, { x: 700, y: 492, align: 'middle' }, { x: 700, y: 524, align: 'middle' })}
              </>
            ) : (
              <>
                {renderVessel('l_cca_prox', 'M 540,590 C 570,535 600,480 635,420', 14, { x: 658, y: 480, align: 'start' }, { x: 595, y: 480, align: 'end' })}
                {renderVessel('l_subcl_prox', 'M 580,590 C 630,550 685,525 740,510', 14, { x: 700, y: 492, align: 'middle' }, { x: 700, y: 524, align: 'middle' })}
              </>
            )}

            {renderVessel('l_subcl_dist', 'M 740,510 C 780,515 820,520 860,525', 13, { x: 810, y: 504, align: 'middle' }, { x: 810, y: 536, align: 'middle' })}

            {/* Vertebral Left */}
            {renderVessel('l_vert_prox', 'M 705,508 C 707,475 709,440 712,410', 10, { x: 724, y: 460, align: 'start' }, { x: 696, y: 460, align: 'end' })}
            {renderVessel('l_vert_mid', 'M 712,410 C 716,350 720,290 724,230', 9, { x: 734, y: 310, align: 'start' }, { x: 706, y: 310, align: 'end' })}
            {renderVessel('l_vert_dist', 'M 724,230 C 726,180 728,130 730,80', 8, { x: 742, y: 140, align: 'start' }, { x: 716, y: 140, align: 'end' })}

            {/* Common Carotid Artery (CCA) Left (Labels at right ~658, Velocities immediately adjacent at left ~618) */}
            {renderVessel('l_cca_mid', 'M 635,420 C 635,360 635,310 635,260', 14, { x: 658, y: 340, align: 'start' }, { x: 618, y: 340, align: 'end' })}
            {renderVessel('l_cca_dist', 'M 635,260 C 635,240 635,220 635,200', 14, { x: 658, y: 235, align: 'start' }, { x: 618, y: 235, align: 'end' })}

            {/* Carotid Bulb Left */}
            {renderVessel('l_bulb', 'M 635,200 Q 635,175 635,150', 18, { x: 662, y: 175, align: 'start' })}

            {/* Internal Carotid Artery (ICA) Left */}
            {renderVessel('l_ica_prox', 'M 642,150 C 655,135 660,120 665,100', 12, { x: 678, y: 125, align: 'start' }, { x: 642, y: 125, align: 'end' })}
            {renderVessel('l_ica_mid', 'M 665,100 C 670,85 672,70 675,50', 11, { x: 692, y: 75, align: 'start' }, { x: 658, y: 75, align: 'end' })}
            {renderVessel('l_ica_dist', 'M 675,50 C 678,35 680,20 682,5', 10, { x: 700, y: 25, align: 'start' }, { x: 665, y: 25, align: 'end' })}

            {/* External Carotid Artery (ECA) Left */}
            {renderVessel('l_eca_prox', 'M 628,150 C 618,135 612,120 605,100', 11, { x: 592, y: 125, align: 'end' }, { x: 628, y: 125, align: 'start' })}
            {renderVessel('l_eca_mid', 'M 605,100 C 600,85 598,70 595,50', 10, { x: 580, y: 75, align: 'end' }, { x: 612, y: 75, align: 'start' })}
            {renderVessel('l_eca_dist', 'M 595,50 C 592,35 590,20 588,5', 9, { x: 572, y: 25, align: 'end' }, { x: 604, y: 25, align: 'start' })}

            {/* Left Bifurcation Classification Indicator */}
            {leftEval && leftEval.category && leftEval.category !== 'Not Assessed' && (
              <text
                x="635"
                y="142"
                textAnchor="middle"
                className={`text-[8.5px] font-mono font-black select-none ${
                  leftEval.category.includes('Severe') || leftEval.category.includes('80') || leftEval.category.includes('70') ? 'fill-rose-400' :
                  leftEval.category.includes('Moderate') || leftEval.category.includes('50') ? 'fill-orange-400' :
                  leftEval.category.includes('Mild') ? 'fill-amber-400' : 'fill-emerald-400'
                }`}
                style={{ pointerEvents: 'none' }}
              >
                {leftEval.category.includes('80-94') ? '80-94%' :
                 leftEval.category.includes('70-79') ? '70-79%' :
                 leftEval.category.includes('50-69') ? '50-69%' :
                 leftEval.category.includes('Mild') || leftEval.category.includes('<50') ? '<50%' :
                 leftEval.category.includes('Occlusion') ? 'OCCLUDED' : 'NORMAL'}
              </text>
            )}

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
              <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded uppercase font-mono font-bold">
                {hoveredMeta.side}
              </span>
            </div>
            <div className="space-y-1.5 pt-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-400">Peak Systolic Velocity (PSV):</span>
                <span className="font-mono font-bold text-slate-200">
                  {hoveredData.psv !== null ? `${hoveredData.psv} cm/s` : 'Unassessed'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">End Diastolic Velocity (EDV):</span>
                <span className="font-mono font-bold text-slate-200">
                  {hoveredData.edv !== null ? `${hoveredData.edv} cm/s` : 'Unassessed'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Flow Direction:</span>
                <span className={`capitalize font-bold ${
                  hoveredData.flowDirection === 'antegrade' ? 'text-cyan-400' :
                  hoveredData.flowDirection === 'retrograde' ? 'text-rose-400 animate-pulse' :
                  hoveredData.flowDirection === 'bidirectional' ? 'text-amber-400' : 'text-slate-500'
                }`}>
                  {hoveredData.flowDirection.replace('_', ' ')}
                </span>
              </div>
              {hoveredData.waveform && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Waveform:</span>
                  <span className="text-slate-300 italic">{hoveredData.waveform}</span>
                </div>
              )}
              {(hoveredData.plaquePresent || hoveredData.intimalThickening || hoveredData.stenosisPresent) && (
                <div className="pt-2 mt-1.5 border-t border-slate-800 flex flex-wrap gap-1">
                  {hoveredData.stenosisPresent && (
                    <span className="bg-rose-950/60 border border-rose-800 text-rose-300 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase">
                      Stenosis Recorded
                    </span>
                  )}
                  {hoveredData.plaquePresent && (
                    <span className="bg-amber-950/60 border border-amber-800 text-amber-300 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase">
                      Plaque Present
                    </span>
                  )}
                  {hoveredData.intimalThickening && (
                    <span className="bg-sky-950/60 border border-sky-800 text-sky-300 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase">
                      Thickened IMT
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Subclavian Steal / Vertebral Flow Alerts */}
      {(isRightSteal || isLeftSteal) && (
        <div className="bg-amber-950/40 border-t border-amber-900 px-4 py-2.5 flex items-start gap-2 text-amber-200 text-xs">
          <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5 animate-pulse" />
          <div>
            <span className="font-bold text-amber-300">Retrograde Flow Alerts Detected:</span>{' '}
            {isRightSteal && <span className="font-medium mr-4">Right vertebral flow is retrograde. Review Right Subclavian Artery.</span>}
            {isLeftSteal && <span className="font-medium">Left vertebral flow is retrograde. Review Left Subclavian Artery.</span>}
          </div>
        </div>
      )}
    </div>
  );
};
