import React, { useState } from 'react';
import { StudyData, SegmentData } from '../types';
import { SEGMENTS_META } from '../constants';
import { checkSubclavianSteal, calculateIcaCcaRatio, suggestIcaStenosisCategory } from '../utils/calculations';
import { ShieldAlert, ArrowUp, ArrowDown, ArrowUpDown, X, HelpCircle, Activity, Eye } from 'lucide-react';

interface CarotidDiagramProps {
  studyData: StudyData;
  selectedSegmentIds: string[];
  activeSegmentId: string | null;
  onSelectSegment: (id: string, isMulti: boolean) => void;
  onAssessSegment: (id: string) => void;
}

export const CarotidDiagram: React.FC<CarotidDiagramProps> = ({
  studyData,
  selectedSegmentIds,
  activeSegmentId,
  onSelectSegment,
  onAssessSegment,
}) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Floating Precision Zoom and Pan States
  const [zoom, setZoom] = useState<number>(1.0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  
  // View mode: Carotid Focus (default true) vs Full Anatomy
  const [focusMode, setFocusMode] = useState<boolean>(true);

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

    const isSubclavian = meta.type === 'subclavian';
    const isStealThreatened = isSubclavian && ((meta.side === 'right' && isRightSteal) || (meta.side === 'left' && isLeftSteal));

    // Base color determinations
    let strokeColor = '#1e293b';
    let strokeDasharray: string | undefined = undefined;

    if (isActive) {
      strokeColor = '#22d3ee'; // Brighter active cyan
    } else if (isSelected) {
      strokeColor = '#06b6d4'; // Cyan
    } else if (isOccluded) {
      strokeColor = '#991b1b'; // Dark burgundy
      strokeDasharray = '5,3';
    } else if (isStealThreatened) {
      strokeColor = '#f59e0b'; // Amber
    } else if (isStenotic) {
      strokeColor = '#ef4444'; // Red
    } else if (isPlaque) {
      strokeColor = '#d97706'; // Plaque amber
    } else if (isImtIncreased) {
      strokeColor = '#0284c7'; // Sky blue
    } else if (hasPsv) {
      strokeColor = '#0d9488'; // Teal
    }

    let finalStrokeWidth = strokeWidth;
    if (meta.type === 'bulb') {
      finalStrokeWidth = strokeWidth * 1.6; // Enlarged bulb
    }
    if (isStenotic) {
      finalStrokeWidth = strokeWidth * 0.4;
    }
    if (isActive) {
      finalStrokeWidth += 2;
    }

    // Label positioning
    const textLength = meta.shortName.length;
    const rectWidth = textLength * 6.2 + 10;
    const rectX = labelPos
      ? labelPos.align === 'start'
        ? labelPos.x - 4
        : labelPos.align === 'end'
        ? labelPos.x - rectWidth + 4
        : labelPos.x - rectWidth / 2
      : 0;

    return (
      <g
        key={id}
        className="group cursor-pointer"
        onClick={(e) => handleSegmentClick(e, id)}
        onDoubleClick={(e) => handleSegmentDoubleClick(e, id)}
        onMouseMove={(e) => handleMouseMove(e, id)}
        onMouseLeave={handleMouseLeave}
      >
        {/* Glow backing for active or selected */}
        {(isActive || isSelected || isHovered) && (
          <path
            d={d}
            fill="none"
            stroke={isActive ? '#22d3ee' : isSelected ? '#06b6d4' : '#334155'}
            strokeWidth={finalStrokeWidth + 14}
            strokeLinecap="round"
            opacity={isActive ? 0.5 : isSelected ? 0.35 : 0.15}
            filter={isActive ? 'url(#neon-glow)' : undefined}
          />
        )}

        {/* Intimal Thickening outer layer */}
        {isImtIncreased && !isStenotic && !isOccluded && (
          <path d={d} fill="none" stroke="#38bdf8" strokeWidth={finalStrokeWidth + 6} strokeLinecap="round" opacity={0.4} />
        )}

        {/* Main vessel path */}
        <path
          d={d}
          fill="none"
          stroke={strokeColor}
          strokeWidth={finalStrokeWidth}
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
        />

        {/* Hit box with wide transparent stroke for easy clinical clicking */}
        <path
          d={d}
          fill="none"
          stroke="transparent"
          strokeWidth={28}
          strokeLinecap="round"
          style={{ pointerEvents: 'stroke', cursor: 'pointer' }}
        />

        {/* Intraluminal Plaque / Stenosis Encroachment Fill */}
        {(isPlaque || isStenotic || isImtIncreased) && !isOccluded && (
          <path
            d={d}
            fill="none"
            stroke={
              isStenotic ? '#ef4444' :
              isPlaque ? '#f97316' : '#38bdf8'
            }
            strokeWidth={finalStrokeWidth * 0.65}
            strokeLinecap="round"
            opacity={0.82}
            style={{ pointerEvents: 'none' }}
          />
        )}

        {/* Max Stenosis Marker if marked or highest ICA velocity */}
        {isStenotic && (
          <g transform={`translate(${getMidpointOfPath(d).x}, ${getMidpointOfPath(d).y})`} style={{ pointerEvents: 'none' }}>
            <circle r={7} fill="#ef4444" stroke="#ffffff" strokeWidth={1.5} className="animate-pulse" />
            <text x={0} y={3} textAnchor="middle" className="text-[7px] font-extrabold fill-white uppercase select-none">
              MAX
            </text>
          </g>
        )}

        {/* Vessel Name Label (Clean Pill) */}
        {labelPos && (
          <g className="transition-all duration-150" style={{ pointerEvents: 'none' }}>
            <rect
              x={rectX}
              y={labelPos.y - 8.5}
              width={rectWidth}
              height={16}
              rx={4}
              fill="#020617"
              stroke={isActive ? '#22d3ee' : isSelected ? '#06b6d4' : isHovered ? '#475569' : '#1e293b'}
              strokeWidth={isActive || isSelected ? 1.5 : 0.75}
              opacity={0.95}
            />
            <text
              x={labelPos.x}
              y={labelPos.y + 3}
              textAnchor={labelPos.align || 'middle'}
              className={`text-[10px] font-bold tracking-tight select-none pointer-events-none ${
                isActive ? 'fill-cyan-300 font-extrabold' : isSelected ? 'fill-cyan-400 font-extrabold' : isHovered ? 'fill-slate-100' : 'fill-slate-300'
              }`}
            >
              {meta.shortName}
            </text>
          </g>
        )}

        {/* Direct Velocity Display Beside Anatomy (PSV / EDV) */}
        {velocityPos && hasPsv && (
          <g transform={`translate(${velocityPos.x}, ${velocityPos.y})`} className="select-none" style={{ pointerEvents: 'none' }}>
            <rect
              x={velocityPos.align === 'end' ? -65 : 0}
              y={-12}
              width={65}
              height={26}
              rx={4}
              fill="#090d16"
              stroke={s.psv && s.psv > 200 ? '#ef4444' : s.psv && s.psv > 125 ? '#f59e0b' : '#334155'}
              strokeWidth={1}
              opacity={0.92}
            />
            <text
              x={velocityPos.align === 'end' ? -32 : 32}
              y={-2}
              textAnchor="middle"
              className={`text-[10px] font-mono font-black ${
                s.psv && s.psv > 200 ? 'fill-rose-400' : s.psv && s.psv > 125 ? 'fill-amber-400' : 'fill-teal-300'
              }`}
            >
              {s.psv} <tspan className="text-[7px] font-normal fill-slate-400">cm/s</tspan>
            </text>
            <text
              x={velocityPos.align === 'end' ? -32 : 32}
              y={10}
              textAnchor="middle"
              className="text-[9px] font-mono fill-slate-400"
            >
              EDV: {s.edv !== null ? s.edv : '-'}
            </text>
          </g>
        )}

        {/* Vertebral Flow Direction Indicator */}
        {meta.type === 'vertebral' && hasPsv && (
          <g transform={`translate(${labelPos ? labelPos.x + (labelPos.align === 'end' ? -40 : 40) : 200}, ${labelPos ? labelPos.y : 200})`}>
            <text
              className={`text-[8px] font-bold font-mono ${
                s.flowDirection === 'retrograde' ? 'fill-rose-400 animate-pulse' : 'fill-cyan-400'
              }`}
            >
              {s.flowDirection === 'retrograde' ? '↓ RETROGRADE' : '↑ ANTEGRADE'}
            </text>
          </g>
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
    <div id="carotid-diagram-workspace" className="flex flex-col bg-[#0f172a] rounded-xl border border-slate-800 overflow-hidden relative min-h-[620px]">
      
      {/* Header Info & View Mode Toggle */}
      <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-100 uppercase tracking-wider">Clinical Hemodynamic Map & Worksheet</span>
            <span className="bg-cyan-950/80 border border-cyan-800 text-cyan-300 text-[9px] px-2 py-0.5 rounded font-mono font-bold">
              {focusMode ? 'Carotid Focus Mode' : 'Full Anatomy View'}
            </span>
          </div>
          <span className="text-[10px] text-slate-400">
            Left-click vessels to select. Double-click to document PSV/EDV/Plaque. Ratios & classifications calculated live.
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle Button */}
          <button
            onClick={() => setFocusMode(!focusMode)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              focusMode
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-950/50 border border-cyan-500'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
            }`}
            id="toggle-focus-mode"
          >
            <Eye className="w-3.5 h-3.5" />
            {focusMode ? 'Carotid Focus (Active)' : 'Focus Carotids'}
          </button>

          {/* Legend pills */}
          <div className="hidden lg:flex items-center gap-2 text-[9px] text-slate-400 font-mono bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#0d9488]"></span> Normal</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#f59e0b]"></span> Plaque</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#ef4444]"></span> Stenosis</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#991b1b] border border-white border-dashed"></span> Occlusion</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas Container */}
      <div className="p-6 flex items-center justify-center bg-[#070b14] overflow-hidden relative min-h-[560px]">
        
        {/* Floating Precision Viewport Controller */}
        <div className="absolute top-4 right-4 flex items-center gap-1 bg-slate-900/95 border border-slate-700/80 p-1 rounded-lg shadow-xl z-20 backdrop-blur-sm select-none">
          <button
            onClick={handleZoomIn}
            className="w-7 h-7 flex items-center justify-center rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 font-extrabold text-sm transition-colors cursor-pointer border border-slate-700/50"
            title="Zoom In"
          >
            +
          </button>
          <button
            onClick={handleZoomOut}
            className="w-7 h-7 flex items-center justify-center rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 font-extrabold text-sm transition-colors cursor-pointer border border-slate-700/50"
            title="Zoom Out"
          >
            -
          </button>
          
          <div className="grid grid-cols-3 gap-0.5 border-l border-r border-slate-800 px-1">
            <div />
            <button onClick={() => handlePan(0, 30)} className="w-5 h-5 flex items-center justify-center rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] cursor-pointer">▲</button>
            <div />
            <button onClick={() => handlePan(30, 0)} className="w-5 h-5 flex items-center justify-center rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] cursor-pointer">◀</button>
            <div />
            <button onClick={() => handlePan(-30, 0)} className="w-5 h-5 flex items-center justify-center rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] cursor-pointer">▶</button>
            <div />
            <button onClick={() => handlePan(0, -30)} className="w-5 h-5 flex items-center justify-center rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] cursor-pointer">▼</button>
          </div>

          <button
            onClick={handleReset}
            className="px-2.5 h-7 flex items-center justify-center rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-[10px] uppercase transition-colors cursor-pointer border border-slate-700/50"
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
              <text x="500" y="555" textAnchor="middle" className="text-[10px] font-extrabold tracking-widest fill-slate-500 uppercase">
                Aortic Arch
              </text>
            </g>

            {/* ================= RIGHT ARTERIAL SYSTEM (Viewer's Left) ================= */}
            {/* Brachiocephalic Trunk (BCT) */}
            {renderVessel('r_bct_prox', 'M 450,590 C 430,565 415,550 400,535', 15, { x: 440, y: 555, align: 'start' })}
            {renderVessel('r_bct_dist', 'M 400,535 C 385,520 375,510 365,500', 15, { x: 395, y: 508, align: 'start' })}

            {/* Subclavian Right */}
            {renderVessel('r_subcl_prox', 'M 365,500 C 330,502 295,505 260,510', 14, { x: 300, y: 495, align: 'middle' })}
            {renderVessel('r_subcl_dist', 'M 260,510 C 220,515 180,520 140,525', 13, { x: 175, y: 512, align: 'middle' })}

            {/* Vertebral Right */}
            {renderVessel('r_vert_prox', 'M 295,508 C 293,475 291,440 288,410', 10, { x: 265, y: 460, align: 'start' })}
            {renderVessel('r_vert_mid', 'M 288,410 C 284,350 280,290 276,230', 9, { x: 255, y: 310, align: 'start' })}
            {renderVessel('r_vert_dist', 'M 276,230 C 274,180 272,130 270,80', 8, { x: 250, y: 140, align: 'start' })}

            {/* Common Carotid Artery (CCA) Right */}
            {renderVessel('r_cca_prox', 'M 365,500 C 365,475 365,450 365,420', 14, { x: 320, y: 460, align: 'end' }, { x: 415, y: 460, align: 'start' })}
            {renderVessel('r_cca_mid', 'M 365,420 C 365,360 365,310 365,260', 14, { x: 320, y: 340, align: 'end' }, { x: 415, y: 340, align: 'start' })}
            {renderVessel('r_cca_dist', 'M 365,260 C 365,240 365,220 365,200', 14, { x: 320, y: 235, align: 'end' }, { x: 415, y: 235, align: 'start' })}

            {/* Carotid Bulb Right (Enlarged Bifurcation Zone) */}
            {renderVessel('r_bulb', 'M 365,200 Q 365,175 365,150', 18, { x: 315, y: 175, align: 'end' })}

            {/* Internal Carotid Artery (ICA) Right (Prominent Branch) */}
            {renderVessel('r_ica_prox', 'M 358,150 C 345,135 340,120 335,100', 12, { x: 285, y: 125, align: 'end' }, { x: 365, y: 125, align: 'start' })}
            {renderVessel('r_ica_mid', 'M 335,100 C 330,85 328,70 325,50', 11, { x: 275, y: 75, align: 'end' }, { x: 360, y: 75, align: 'start' })}
            {renderVessel('r_ica_dist', 'M 325,50 C 322,35 320,20 318,5', 10, { x: 265, y: 25, align: 'end' }, { x: 355, y: 25, align: 'start' })}

            {/* External Carotid Artery (ECA) Right */}
            {renderVessel('r_eca_prox', 'M 372,150 C 382,135 388,120 395,100', 11, { x: 430, y: 125, align: 'start' }, { x: 330, y: 125, align: 'end' })}
            {renderVessel('r_eca_mid', 'M 395,100 C 400,85 402,70 405,50', 10, { x: 440, y: 75, align: 'start' })}
            {renderVessel('r_eca_dist', 'M 405,50 C 408,35 410,20 412,5', 9, { x: 450, y: 25, align: 'start' })}

            {/* Right Bifurcation Summary Badge & ICA/CCA Ratio Display */}
            <g transform="translate(365, 145)" className="select-none">
              {rightIcaCca !== null && (
                <g transform="translate(-85, -20)">
                  <rect x={0} y={0} width={75} height={32} rx={6} fill="#090d16" stroke="#06b6d4" strokeWidth={1.25} opacity={0.95} />
                  <text x={37.5} y={12} textAnchor="middle" className="text-[9px] font-bold fill-slate-400">ICA/CCA</text>
                  <text x={37.5} y={24} textAnchor="middle" className="text-[11px] font-mono font-black fill-cyan-400">{rightIcaCca.ratio.toFixed(2)}</text>
                </g>
              )}
              {rightEval && rightEval.category && (
                <g transform="translate(15, -20)">
                  <rect
                    x={0}
                    y={0}
                    width={90}
                    height={32}
                    rx={6}
                    fill="#090d16"
                    stroke={
                      rightEval.category.includes('Severe') || rightEval.category.includes('>=70') ? '#ef4444' :
                      rightEval.category.includes('Moderate') || rightEval.category.includes('50-69') ? '#f59e0b' : '#0d9488'
                    }
                    strokeWidth={1.5}
                    opacity={0.95}
                  />
                  <text x={45} y={12} textAnchor="middle" className="text-[8px] font-bold fill-slate-400 uppercase">Stenosis Grade</text>
                  <text
                    x={45}
                    y={24}
                    textAnchor="middle"
                    className={`text-[10px] font-black uppercase ${
                      rightEval.category.includes('Severe') || rightEval.category.includes('>=70') ? 'fill-rose-400' :
                      rightEval.category.includes('Moderate') || rightEval.category.includes('50-69') ? 'fill-amber-400' : 'fill-teal-300'
                    }`}
                  >
                    {rightEval.category.split(' ')[0]}
                  </text>
                </g>
              )}
            </g>


            {/* ================= LEFT ARTERIAL SYSTEM (Viewer's Right) ================= */}
            {studyData.variantLeftBct ? (
              <>
                {renderVessel('l_bct_prox', 'M 550,590 C 570,565 585,550 600,535', 15, { x: 560, y: 555, align: 'end' })}
                {renderVessel('l_bct_dist', 'M 600,535 C 615,520 625,510 635,500', 15, { x: 605, y: 508, align: 'end' })}
                {renderVessel('l_cca_prox', 'M 635,500 C 635,475 635,450 635,420', 14, { x: 670, y: 460, align: 'start' })}
                {renderVessel('l_subcl_prox', 'M 635,500 C 670,502 705,505 740,510', 14, { x: 700, y: 495, align: 'middle' })}
              </>
            ) : (
              <>
                {renderVessel('l_cca_prox', 'M 540,590 C 570,535 600,480 635,420', 14, { x: 675, y: 480, align: 'start' }, { x: 580, y: 480, align: 'end' })}
                {renderVessel('l_subcl_prox', 'M 580,590 C 630,550 685,525 740,510', 14, { x: 690, y: 540, align: 'end' })}
              </>
            )}

            {renderVessel('l_subcl_dist', 'M 740,510 C 780,515 820,520 860,525', 13, { x: 825, y: 512, align: 'middle' })}

            {renderVessel('l_vert_prox', 'M 705,508 C 707,475 709,440 712,410', 10, { x: 735, y: 460, align: 'end' })}
            {renderVessel('l_vert_mid', 'M 712,410 C 716,350 720,290 724,230', 9, { x: 745, y: 310, align: 'end' })}
            {renderVessel('l_vert_dist', 'M 724,230 C 726,180 728,130 730,80', 8, { x: 750, y: 140, align: 'end' })}

            {renderVessel('l_cca_mid', 'M 635,420 C 635,360 635,310 635,260', 14, { x: 670, y: 340, align: 'start' }, { x: 580, y: 340, align: 'end' })}
            {renderVessel('l_cca_dist', 'M 635,260 C 635,240 635,220 635,200', 14, { x: 670, y: 235, align: 'start' }, { x: 580, y: 235, align: 'end' })}

            {/* Carotid Bulb Left */}
            {renderVessel('l_bulb', 'M 635,200 Q 635,175 635,150', 18, { x: 685, y: 175, align: 'start' })}

            {/* Internal Carotid Artery (ICA) Left */}
            {renderVessel('l_ica_prox', 'M 642,150 C 655,135 660,120 665,100', 12, { x: 715, y: 125, align: 'start' }, { x: 635, y: 125, align: 'end' })}
            {renderVessel('l_ica_mid', 'M 665,100 C 670,85 672,70 675,50', 11, { x: 725, y: 75, align: 'start' }, { x: 640, y: 75, align: 'end' })}
            {renderVessel('l_ica_dist', 'M 675,50 C 678,35 680,20 682,5', 10, { x: 735, y: 25, align: 'start' }, { x: 645, y: 25, align: 'end' })}

            {/* External Carotid Artery (ECA) Left */}
            {renderVessel('l_eca_prox', 'M 628,150 C 618,135 612,120 605,100', 11, { x: 570, y: 125, align: 'end' }, { x: 670, y: 125, align: 'start' })}
            {renderVessel('l_eca_mid', 'M 605,100 C 600,85 598,70 595,50', 10, { x: 560, y: 75, align: 'end' })}
            {renderVessel('l_eca_dist', 'M 595,50 C 592,35 590,20 588,5', 9, { x: 550, y: 25, align: 'end' })}

            {/* Left Bifurcation Summary Badge & ICA/CCA Ratio Display */}
            <g transform="translate(635, 145)" className="select-none">
              {leftIcaCca !== null && (
                <g transform="translate(10, -20)">
                  <rect x={0} y={0} width={75} height={32} rx={6} fill="#090d16" stroke="#06b6d4" strokeWidth={1.25} opacity={0.95} />
                  <text x={37.5} y={12} textAnchor="middle" className="text-[9px] font-bold fill-slate-400">ICA/CCA</text>
                  <text x={37.5} y={24} textAnchor="middle" className="text-[11px] font-mono font-black fill-cyan-400">{leftIcaCca.ratio.toFixed(2)}</text>
                </g>
              )}
              {leftEval && leftEval.category && (
                <g transform="translate(-100, -20)">
                  <rect
                    x={0}
                    y={0}
                    width={90}
                    height={32}
                    rx={6}
                    fill="#090d16"
                    stroke={
                      leftEval.category.includes('Severe') || leftEval.category.includes('>=70') ? '#ef4444' :
                      leftEval.category.includes('Moderate') || leftEval.category.includes('50-69') ? '#f59e0b' : '#0d9488'
                    }
                    strokeWidth={1.5}
                    opacity={0.95}
                  />
                  <text x={45} y={12} textAnchor="middle" className="text-[8px] font-bold fill-slate-400 uppercase">Stenosis Grade</text>
                  <text
                    x={45}
                    y={24}
                    textAnchor="middle"
                    className={`text-[10px] font-black uppercase ${
                      leftEval.category.includes('Severe') || leftEval.category.includes('>=70') ? 'fill-rose-400' :
                      leftEval.category.includes('Moderate') || leftEval.category.includes('50-69') ? 'fill-amber-400' : 'fill-teal-300'
                    }`}
                  >
                    {leftEval.category.split(' ')[0]}
                  </text>
                </g>
              )}
            </g>

          </g>
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredId && hoveredMeta && hoveredData && (
          <div
            className="absolute z-50 bg-slate-900/95 border border-slate-700 p-3 rounded-lg shadow-xl text-xs text-slate-100 max-w-xs pointer-events-none backdrop-blur-sm shadow-cyan-950/30"
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
