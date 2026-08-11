import React, { useState } from 'react';
import { StudyData, SegmentData, FlowDirection } from '../types';
import { SEGMENTS_META, SegmentMeta } from '../constants';
import { checkSubclavianSteal } from '../utils/calculations';
import { ArrowUp, ArrowDown, ArrowUpDown, X, HelpCircle, Check, ShieldAlert, Settings, Sparkles, Layers, Activity } from 'lucide-react';
import { CarotidDiagram } from './CarotidDiagram';

interface AnatomicalTreeProps {
  studyData: StudyData;
  selectedSegmentIds: string[];
  activeSegmentId: string | null;
  onSelectSegment: (id: string, isMulti: boolean) => void;
  onAssessSegment: (id: string) => void;
  onQuickMarkNormal: (ids: string[]) => void;
  onMarkSideNormal: (side: 'right' | 'left') => void;
  onResetAll: () => void;
  onToggleVariant: () => void;
}

export const AnatomicalTree: React.FC<AnatomicalTreeProps> = ({
  studyData,
  selectedSegmentIds,
  activeSegmentId,
  onSelectSegment,
  onAssessSegment,
  onQuickMarkNormal,
  onMarkSideNormal,
  onResetAll,
  onToggleVariant,
}) => {
  const [viewMode, setViewMode] = useState<'diagram' | 'grid'>('diagram');
  const isRightSteal = checkSubclavianSteal('right', studyData);
  const isLeftSteal = checkSubclavianSteal('left', studyData);

  const handleNodeClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const isMulti = e.ctrlKey || e.metaKey || e.shiftKey;
    onSelectSegment(id, isMulti);
  };

  const handleNodeContextMenu = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    onAssessSegment(id);
  };

  const handleNodeDoubleClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    onAssessSegment(id);
  };

  // Render the flow direction indicator
  const renderFlowIndicator = (direction: FlowDirection) => {
    switch (direction) {
      case 'antegrade':
        return (
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-cyan-950/50 text-cyan-400 border border-cyan-850" title="Antegrade Flow">
            <ArrowUp className="w-3.5 h-3.5" />
          </span>
        );
      case 'retrograde':
        return (
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-rose-950/50 text-rose-400 border border-rose-800 animate-pulse" title="Retrograde Flow">
            <ArrowDown className="w-3.5 h-3.5" />
          </span>
        );
      case 'bidirectional':
        return (
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-950/50 text-amber-400 border border-amber-800" title="Bidirectional / Alternating Flow">
            <ArrowUpDown className="w-3.5 h-3.5" />
          </span>
        );
      case 'absent':
        return (
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-slate-400 border border-slate-800 font-bold text-[10px]" title="Absent Flow">
            <X className="w-3 h-3" />
          </span>
        );
      case 'not_assessed':
      default:
        return (
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#1e293b] text-slate-500 border border-dashed border-slate-800" title="Not Assessed">
            <HelpCircle className="w-3.5 h-3.5" />
          </span>
        );
    }
  };

  // Render segment card
  const renderSegmentCard = (id: string) => {
    const s = studyData.segments[id];
    const meta = SEGMENTS_META[id];
    if (!s || !meta) return null;

    const isActive = activeSegmentId === id;
    const isSelected = selectedSegmentIds.includes(id);
    const hasPsv = s.psv !== null;
    const isStenotic = s.stenosisPresent;
    const isPlaque = s.plaquePresent;
    const isImtIncreased = s.intimalThickening;

    // Check if we need to apply subclavian highlight because of vertebral steal
    const isSubclavian = meta.type === 'subclavian';
    const isStealThreatened = isSubclavian && ((meta.side === 'right' && isRightSteal) || (meta.side === 'left' && isLeftSteal));

    // Styling logic
    let cardBg = 'bg-[#111622]';
    let borderColor = 'border-slate-800';
    let ringColor = '';

    if (isActive) {
      borderColor = 'border-cyan-400';
      cardBg = 'bg-cyan-950/20';
      ringColor = 'ring-2 ring-cyan-400 shadow-lg shadow-cyan-500/20';
    } else if (isSelected) {
      borderColor = 'border-cyan-600';
      ringColor = 'ring-1 ring-cyan-500/30';
    } else if (isStealThreatened) {
      borderColor = 'border-amber-500';
      cardBg = 'bg-amber-950/20';
      ringColor = 'ring-2 ring-amber-500/20 animate-pulse';
    } else if (isStenotic) {
      borderColor = 'border-rose-600';
      cardBg = 'bg-rose-950/10';
    } else if (isPlaque) {
      borderColor = 'border-amber-600';
      cardBg = 'bg-amber-950/10';
    } else if (hasPsv) {
      borderColor = 'border-cyan-700/60';
      cardBg = 'bg-cyan-950/5';
    }

    return (
      <div
        id={`segment-card-${id}`}
        onClick={(e) => handleNodeClick(e, id)}
        onDoubleClick={(e) => handleNodeDoubleClick(e, id)}
        onContextMenu={(e) => handleNodeContextMenu(e, id)}
        className={`relative p-3 rounded-lg border text-left cursor-pointer transition-all duration-150 select-none ${cardBg} ${borderColor} ${ringColor} hover:shadow-sm`}
        title="Left-click to select (Ctrl/Shift for multi). Double-click or Right-click for detailed assessment."
      >
        {/* Indicators Row */}
        <div className="flex items-center justify-between gap-1 mb-1.5">
          <span className="text-xs font-semibold text-slate-200 truncate max-w-[120px]">
            {meta.shortName}
          </span>
          <div className="flex items-center gap-1.5">
            {isStenotic && (
              <span className="px-1 text-[9px] font-bold text-rose-300 bg-rose-950 border border-rose-800 rounded">STEN</span>
            )}
            {isPlaque && (
              <span className="px-1 text-[9px] font-bold text-amber-300 bg-amber-950 border border-amber-800 rounded">PLQ</span>
            )}
            {isImtIncreased && (
              <span className="px-1 text-[9px] font-bold text-sky-300 bg-sky-950 border border-sky-855 rounded">IMT</span>
            )}
            {renderFlowIndicator(s.flowDirection)}
          </div>
        </div>

        {/* Data Values Row */}
        <div className="flex items-baseline justify-between">
          <div className="text-[11px] text-slate-400">
            {hasPsv ? (
              <span className="font-mono text-slate-100 font-bold">
                {s.psv} <span className="text-[9px] text-slate-500 font-normal">PSV</span>
                {s.edv !== null && (
                  <>
                    {' '}/{' '}
                    <span className="text-slate-300 font-bold">{s.edv}</span>{' '}
                    <span className="text-[9px] text-slate-500 font-normal">EDV</span>
                  </>
                )}
              </span>
            ) : (
              <span className="italic text-slate-500">Not assessed</span>
            )}
          </div>
          {s.waveform && s.waveform !== 'Not assessed' && (
            <span className="text-[9px] text-slate-500 truncate max-w-[70px]" title={s.waveform}>
              {s.waveform}
            </span>
          )}
        </div>

        {/* Steal Threat Flashing Warning Tag */}
        {isStealThreatened && (
          <div className="absolute -top-2.5 -right-1 flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-600 text-white text-[8px] font-bold uppercase tracking-wider shadow animate-bounce">
            <ShieldAlert className="w-2.5 h-2.5" /> Steal Review
          </div>
        )}
      </div>
    );
  };

  return (
    <div id="vessel-tree-workspace" className="flex flex-col bg-[#0b0f19] rounded-xl border border-slate-800 overflow-hidden shadow-xl">
      
      {/* Workspace Header Panel */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 bg-[#0f172a] border-b border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div>
            <h2 className="text-base font-extrabold text-slate-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              Carotid Hemodynamics Workspace
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Interactive clinical workspace for direct hemodynamic analysis & anatomical charting.
            </p>
          </div>

          {/* View mode sliding switcher */}
          <div className="flex bg-[#070b14] border border-slate-800 p-0.5 rounded-lg shrink-0">
            <button
              id="view-mode-diagram"
              onClick={() => setViewMode('diagram')}
              className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'diagram'
                  ? 'bg-[#1e293b] text-cyan-400 border border-slate-700/60 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Interactive Map</span>
            </button>
            <button
              id="view-mode-grid"
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'grid'
                  ? 'bg-[#1e293b] text-cyan-400 border border-slate-700/60 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Anatomical Tree</span>
            </button>
          </div>
        </div>

        {/* Quick Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Anatomical Variant Toggle */}
          <button
            id="variant-toggle-btn"
            onClick={onToggleVariant}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors border cursor-pointer ${
              studyData.variantLeftBct
                ? 'bg-cyan-950/40 border-cyan-800 text-cyan-400'
                : 'bg-[#1e293b]/50 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-[#1e293b]'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Variant Left BCT: {studyData.variantLeftBct ? 'Active' : 'Off'}</span>
          </button>

          {/* Quick Mark Selected Normal */}
          {selectedSegmentIds.length > 0 && (
            <button
              id="mark-selected-normal-btn"
              onClick={() => onQuickMarkNormal(selectedSegmentIds)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-extrabold transition-colors shadow-sm cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Mark Normal ({selectedSegmentIds.length})</span>
            </button>
          )}

          {/* Side normal actions */}
          <button
            id="mark-right-normal-btn"
            onClick={() => onMarkSideNormal('right')}
            className="px-2.5 py-1.5 rounded-md border border-slate-800 bg-[#1e293b] hover:bg-[#2e3e52] text-slate-300 text-xs font-medium transition-colors cursor-pointer"
          >
            Mark Right Normal
          </button>
          <button
            id="mark-left-normal-btn"
            onClick={() => onMarkSideNormal('left')}
            className="px-2.5 py-1.5 rounded-md border border-slate-800 bg-[#1e293b] hover:bg-[#2e3e52] text-slate-300 text-xs font-medium transition-colors cursor-pointer"
          >
            Mark Left Normal
          </button>

          <button
            id="reset-workspace-btn"
            onClick={onResetAll}
            className="px-2.5 py-1.5 rounded-md border border-rose-900 bg-rose-950/20 hover:bg-rose-950/40 text-rose-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Steal alert banners if any */}
      {(isRightSteal || isLeftSteal) && (
        <div className="bg-amber-950/30 border-b border-amber-900 px-4 py-2 flex items-start gap-2.5 text-amber-200 text-xs">
          <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5 animate-pulse" />
          <div>
            <span className="font-bold text-amber-300">Retrograde Vertebral Flow Detected:</span>{' '}
            {isRightSteal && <span className="font-medium mr-4">Right vertebral flow is retrograde/bidirectional. Verify Right Subclavian Artery for subclavian steal.</span>}
            {isLeftSteal && <span className="font-medium">Left vertebral flow is retrograde/bidirectional. Verify Left Subclavian Artery for subclavian steal.</span>}
          </div>
        </div>
      )}

      {/* Conditionally render Interactive Map or Anatomical Grid */}
      {viewMode === 'diagram' ? (
        <div className="p-6">
          <CarotidDiagram
            studyData={studyData}
            selectedSegmentIds={selectedSegmentIds}
            activeSegmentId={activeSegmentId}
            onSelectSegment={onSelectSegment}
            onAssessSegment={onAssessSegment}
          />
        </div>
      ) : (
        <div className="p-6 overflow-x-auto">
          <div className="min-w-[800px] grid grid-cols-11 gap-x-6 gap-y-4 items-stretch">
          
          {/* ================= RIGHT ARTERIAL TREE ================= */}
          <div className="col-span-5 flex flex-col gap-6 bg-[#0f172a] p-4 rounded-xl border border-slate-800">
            <div className="border-b border-slate-800 pb-2 mb-1 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Right Arterial System (Hemispheric)</span>
              <span className="text-[10px] bg-[#121824] border border-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">Proximal → Distal (Flow Bottom to Top)</span>
            </div>

            {/* Row 1: ICA Distal / ECA Distal */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Distal ICA</label>
                {renderSegmentCard('r_ica_dist')}
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Distal ECA</label>
                {renderSegmentCard('r_eca_dist')}
              </div>
            </div>

            {/* Row 2: ICA Mid / ECA Mid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Mid ICA</label>
                {renderSegmentCard('r_ica_mid')}
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Mid ECA</label>
                {renderSegmentCard('r_eca_mid')}
              </div>
            </div>

            {/* Row 3: ICA Prox / ECA Prox */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Proximal ICA</label>
                {renderSegmentCard('r_ica_prox')}
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Proximal ECA</label>
                {renderSegmentCard('r_eca_prox')}
              </div>
            </div>

            {/* Connection branching into bulb */}
            <div className="flex justify-around px-12 -my-2">
              <div className="w-0.5 h-4 bg-slate-800"></div>
              <div className="w-0.5 h-4 bg-slate-800"></div>
            </div>

            {/* Row 4: Carotid Bulb */}
            <div className="w-2/3 mx-auto">
              <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1 text-center">Right Bulb</label>
              {renderSegmentCard('r_bulb')}
            </div>

            {/* Row 5: CCA Distal */}
            <div>
              <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Distal CCA</label>
              {renderSegmentCard('r_cca_dist')}
            </div>

            {/* Row 6: CCA Mid */}
            <div>
              <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Mid CCA</label>
              {renderSegmentCard('r_cca_mid')}
            </div>

            {/* Row 7: CCA Prox */}
            <div>
              <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Proximal CCA</label>
              {renderSegmentCard('r_cca_prox')}
            </div>

            {/* Subclavian / Vertebral Row (Branches off subclavian proximal) */}
            <div className="grid grid-cols-2 gap-4 border-t border-slate-800 pt-4">
              <div className="flex flex-col gap-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Subclavian System</span>
                <div>
                  <label className="block text-[9px] text-slate-400 mb-0.5">Subclavian Distal</label>
                  {renderSegmentCard('r_subcl_dist')}
                </div>
                <div>
                  <label className="block text-[9px] text-slate-400 mb-0.5">Subclavian Proximal</label>
                  {renderSegmentCard('r_subcl_prox')}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Vertebral System</span>
                <div>
                  <label className="block text-[9px] text-slate-400 mb-0.5">Vertebral Distal</label>
                  {renderSegmentCard('r_vert_dist')}
                </div>
                <div>
                  <label className="block text-[9px] text-slate-400 mb-0.5">Vertebral Mid</label>
                  {renderSegmentCard('r_vert_mid')}
                </div>
                <div>
                  <label className="block text-[9px] text-slate-400 mb-0.5">Vertebral Proximal</label>
                  {renderSegmentCard('r_vert_prox')}
                </div>
              </div>
            </div>

            {/* Brachiocephalic Trunk (BCT) Row */}
            <div className="grid grid-cols-2 gap-4 border-t border-slate-800 pt-4 bg-[#121824] p-2.5 rounded-lg border border-slate-850">
              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">BCT Distal</label>
                {renderSegmentCard('r_bct_dist')}
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">BCT Proximal</label>
                {renderSegmentCard('r_bct_prox')}
              </div>
            </div>

          </div>

          {/* ================= CENTRAL GRAPHICS AND ARCH ================= */}
          <div className="col-span-1 flex flex-col items-center justify-end pb-8">
            {/* Elegant Flow direction graphics representing blood rising from Arch */}
            <div className="flex flex-col items-center gap-6 h-full justify-between py-12 text-slate-700">
              <div className="flex flex-col items-center gap-1">
                <ArrowUp className="w-5 h-5 text-cyan-500 animate-pulse" />
                <span className="text-[8px] font-bold uppercase tracking-wider text-cyan-500 [writing-mode:vertical-lr]">Distal flow</span>
              </div>
              <div className="h-full w-0.5 bg-slate-800 border-dashed border-slate-700 border-r"></div>
              <div className="text-center">
                <div className="w-8 h-8 rounded-full border border-slate-800 flex items-center justify-center text-cyan-400 bg-[#121824] font-mono text-xs font-bold">
                  H
                </div>
                <span className="text-[8px] font-bold uppercase text-slate-500 block mt-1">Heart</span>
              </div>
            </div>

            {/* Aortic Arch Root */}
            <div className="w-full text-center">
              <label className="block text-[9px] text-slate-400 font-bold uppercase mb-1">Arch Root</label>
              <div
                onClick={(e) => handleNodeClick(e, 'arch')}
                onDoubleClick={(e) => handleNodeDoubleClick(e, 'arch')}
                className={`p-2.5 rounded-lg border text-center cursor-pointer transition-all ${
                  selectedSegmentIds.includes('arch')
                    ? 'border-cyan-500 bg-cyan-950/20 ring-2 ring-cyan-500/20'
                    : 'border-slate-800 bg-[#121824] hover:bg-[#1e293b] text-slate-300'
                }`}
              >
                <div className="text-[10px] font-bold">Aortic Arch</div>
                <div className="text-[8px] text-slate-500 font-mono">Common Source</div>
              </div>
            </div>
          </div>

          {/* ================= LEFT ARTERIAL TREE ================= */}
          <div className="col-span-5 flex flex-col gap-6 bg-[#0f172a] p-4 rounded-xl border border-slate-800">
            <div className="border-b border-slate-800 pb-2 mb-1 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Left Arterial System (Hemispheric)</span>
              <span className="text-[10px] bg-[#121824] border border-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">Proximal → Distal (Flow Bottom to Top)</span>
            </div>

            {/* Row 1: ICA Distal / ECA Distal */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Distal ICA</label>
                {renderSegmentCard('l_ica_dist')}
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Distal ECA</label>
                {renderSegmentCard('l_eca_dist')}
              </div>
            </div>

            {/* Row 2: ICA Mid / ECA Mid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Mid ICA</label>
                {renderSegmentCard('l_ica_mid')}
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Mid ECA</label>
                {renderSegmentCard('l_eca_mid')}
              </div>
            </div>

            {/* Row 3: ICA Prox / ECA Prox */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Proximal ICA</label>
                {renderSegmentCard('l_ica_prox')}
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Proximal ECA</label>
                {renderSegmentCard('l_eca_prox')}
              </div>
            </div>

            {/* Connection branching into bulb */}
            <div className="flex justify-around px-12 -my-2">
              <div className="w-0.5 h-4 bg-slate-800"></div>
              <div className="w-0.5 h-4 bg-slate-800"></div>
            </div>

            {/* Row 4: Carotid Bulb */}
            <div className="w-2/3 mx-auto">
              <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1 text-center">Left Bulb</label>
              {renderSegmentCard('l_bulb')}
            </div>

            {/* Row 5: CCA Distal */}
            <div>
              <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Distal CCA</label>
              {renderSegmentCard('l_cca_dist')}
            </div>

            {/* Row 6: CCA Mid */}
            <div>
              <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Mid CCA</label>
              {renderSegmentCard('l_cca_mid')}
            </div>

            {/* Row 7: CCA Prox */}
            <div>
              <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Proximal CCA</label>
              {renderSegmentCard('l_cca_prox')}
            </div>

            {/* Subclavian / Vertebral Row */}
            <div className="grid grid-cols-2 gap-4 border-t border-slate-800 pt-4">
              <div className="flex flex-col gap-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Subclavian System</span>
                <div>
                  <label className="block text-[9px] text-slate-400 mb-0.5">Subclavian Distal</label>
                  {renderSegmentCard('l_subcl_dist')}
                </div>
                <div>
                  <label className="block text-[9px] text-slate-400 mb-0.5">Subclavian Proximal</label>
                  {renderSegmentCard('l_subcl_prox')}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Vertebral System</span>
                <div>
                  <label className="block text-[9px] text-slate-400 mb-0.5">Vertebral Distal</label>
                  {renderSegmentCard('l_vert_dist')}
                </div>
                <div>
                  <label className="block text-[9px] text-slate-400 mb-0.5">Vertebral Mid</label>
                  {renderSegmentCard('l_vert_mid')}
                </div>
                <div>
                  <label className="block text-[9px] text-slate-400 mb-0.5">Vertebral Proximal</label>
                  {renderSegmentCard('l_vert_prox')}
                </div>
              </div>
            </div>

            {/* Left Brachiocephalic Trunk Variant (Hidden under normal anatomy, rendered if variant toggle is active) */}
            {studyData.variantLeftBct ? (
              <div className="grid grid-cols-2 gap-4 border-t border-cyan-800/40 pt-4 bg-cyan-950/10 p-2.5 rounded-lg border border-dashed border-cyan-850">
                <div>
                  <label className="block text-[10px] text-cyan-400 font-bold uppercase mb-1">Left BCT Distal (Variant)</label>
                  {renderSegmentCard('l_bct_dist')}
                </div>
                <div>
                  <label className="block text-[10px] text-cyan-400 font-bold uppercase mb-1">Left BCT Proximal (Variant)</label>
                  {renderSegmentCard('l_bct_prox')}
                </div>
              </div>
            ) : (
              <div className="border-t border-slate-800 pt-4 text-center py-6 text-slate-400 text-xs italic bg-[#121824] rounded-lg">
                No Left Brachiocephalic Trunk under normal anatomy.
                <button
                  id="enable-left-bct-prompt-btn"
                  onClick={onToggleVariant}
                  className="block mx-auto mt-2 text-[10px] text-cyan-400 font-bold hover:underline hover:text-cyan-300 cursor-pointer"
                >
                  Enable Variant Left BCT
                </button>
              </div>
            )}

          </div>

        </div>
      </div>
      )}
      
    </div>
  );
};
