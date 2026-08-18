import React, { useState, useEffect } from 'react';
import { StudyData, SegmentData, FlowDirection } from '../types';
import { SEGMENTS_META } from '../constants';
import { calculateLocalPsvRatio, findUpstreamNormalSegment } from '../utils/calculations';
import { Check, ClipboardList, Info, ShieldAlert, Sliders, Save, Plus, HelpCircle, Activity } from 'lucide-react';
import { 
  getWaveformOptionsForVessel, 
  findWaveformDescriptor, 
  VesselCategory, 
  WaveformDescriptor,
  WAVEFORM_DESCRIPTORS 
} from '../data/waveformDescriptors';
import { WaveformDescriptorGuide } from './WaveformDescriptorGuide';
import { WaveformHoverCard } from './WaveformHoverCard';

interface SegmentAssessmentProps {
  studyData: StudyData;
  selectedIds: string[];
  activeId: string | null;
  onSetActiveSegment: (id: string) => void;
  onRemoveSelectedSegment: (id: string) => void;
  onUpdateSegment: (id: string, updates: Partial<SegmentData>) => void;
  onUpdateSegmentsBulk: (ids: string[], updates: Partial<SegmentData>) => void;
  onAddPlaqueFromSegments: (ids: string[]) => void;
}

export const SegmentAssessment: React.FC<SegmentAssessmentProps> = ({
  studyData,
  selectedIds,
  activeId,
  onSetActiveSegment,
  onRemoveSelectedSegment,
  onUpdateSegment,
  onUpdateSegmentsBulk,
  onAddPlaqueFromSegments,
}) => {
  const currentId = (activeId && selectedIds.includes(activeId)) ? activeId : selectedIds[0];

  // Local transient states for form
  const [psv, setPsv] = useState<string>('');
  const [edv, setEdv] = useState<string>('');
  const [flowDirection, setFlowDirection] = useState<FlowDirection>('not_assessed');
  const [waveform, setWaveform] = useState<string>('Not assessed');
  const [plaquePresent, setPlaquePresent] = useState<boolean>(false);
  const [intimalThickening, setIntimalThickening] = useState<boolean>(false);
  const [stenosisPresent, setStenosisPresent] = useState<boolean>(false);
  const [comments, setComments] = useState<string>('');
  const [techLimits, setTechLimits] = useState<string>('');
  const [refOverrideId, setRefOverrideId] = useState<string>('auto');

  // 3-point hemodynamic velocities
  const [preStenosisPsv, setPreStenosisPsv] = useState<string>('');
  const [atStenosisPsv, setAtStenosisPsv] = useState<string>('');
  const [postStenosisPsv, setPostStenosisPsv] = useState<string>('');

  // Waveform reference guide state
  const [guideOpen, setGuideOpen] = useState(false);
  const [guideInitialDescriptor, setGuideInitialDescriptor] = useState<string | undefined>(undefined);

  // Bulk mode checkbox overrides
  const [applyPsv, setApplyPsv] = useState(false);
  const [applyEdv, setApplyEdv] = useState(false);
  const [applyFlow, setApplyFlow] = useState(true);
  const [applyWave, setApplyWave] = useState(true);
  const [applyPlaque, setApplyPlaque] = useState(true);
  const [applyImt, setApplyImt] = useState(true);
  const [applyStenosis, setApplyStenosis] = useState(true);
  const [applyComments, setApplyComments] = useState(false);

  // Load data from study state when currentId changes
  useEffect(() => {
    if (currentId) {
      const active = studyData.segments[currentId];
      if (active) {
        setPsv(active.psv !== null ? active.psv.toString() : '');
        setEdv(active.edv !== null ? active.edv.toString() : '');
        setFlowDirection(active.flowDirection);
        setWaveform(active.waveform || 'Not assessed');
        setPlaquePresent(active.plaquePresent);
        setIntimalThickening(active.intimalThickening);
        setStenosisPresent(active.stenosisPresent);
        setComments(active.comments || '');
        setTechLimits(active.technicalLimitations || '');
        setRefOverrideId(active.localRatioReferenceOverrideId || 'auto');
        
        // Load 3-point hemodynamics
        setPreStenosisPsv(active.preStenosisPsv !== null && active.preStenosisPsv !== undefined ? active.preStenosisPsv.toString() : '');
        setAtStenosisPsv(active.atStenosisPsv !== null && active.atStenosisPsv !== undefined ? active.atStenosisPsv.toString() : active.psv !== null ? active.psv.toString() : '');
        setPostStenosisPsv(active.postStenosisPsv !== null && active.postStenosisPsv !== undefined ? active.postStenosisPsv.toString() : '');
      }
    }
  }, [currentId, studyData]);

  if (selectedIds.length === 0) {
    return (
      <div id="no-segment-selected" className="bg-[#0b1329] border border-slate-800 rounded-xl p-8 text-center flex flex-col items-center justify-center h-full min-h-[380px]">
        <div className="w-12 h-12 rounded-full bg-[#0f172a] flex items-center justify-center border border-slate-800 mb-4 text-slate-500">
          <ClipboardList className="w-6 h-6" />
        </div>
        <h3 className="text-xs font-black text-slate-200 uppercase tracking-wider">No Segment Selected</h3>
        <p className="text-xs text-slate-500 max-w-[280px] mt-1.5 leading-relaxed">
          Select one or multiple segments on the diagram or bilateral matrix to view and record segment parameters.
        </p>
      </div>
    );
  }

  const isBulk = selectedIds.length > 1;

  // Save changes
  const handleSave = () => {
    const parseNum = (val: string): number | null => {
      const num = parseFloat(val);
      return isNaN(num) ? null : num;
    };

    const updates: Partial<SegmentData> = {
      flowDirection,
      waveform,
      plaquePresent,
      intimalThickening,
      stenosisPresent,
      comments,
      technicalLimitations: techLimits,
      preStenosisPsv: parseNum(preStenosisPsv),
      atStenosisPsv: parseNum(atStenosisPsv),
      postStenosisPsv: parseNum(postStenosisPsv),
    };

    if (!isBulk) {
      // Single segment updates
      onUpdateSegment(selectedIds[0], {
        ...updates,
        psv: parseNum(psv),
        edv: parseNum(edv),
        localRatioReferenceOverrideId: refOverrideId === 'auto' ? null : refOverrideId,
      });
    } else {
      // Bulk segment updates based on checkboxes
      const bulkUpdates: Partial<SegmentData> = {};
      if (applyPsv) bulkUpdates.psv = parseNum(psv);
      if (applyEdv) bulkUpdates.edv = parseNum(edv);
      if (applyFlow) bulkUpdates.flowDirection = flowDirection;
      if (applyWave) bulkUpdates.waveform = waveform;
      if (applyPlaque) bulkUpdates.plaquePresent = plaquePresent;
      if (applyImt) bulkUpdates.intimalThickening = intimalThickening;
      if (applyStenosis) bulkUpdates.stenosisPresent = stenosisPresent;
      if (applyComments) {
        bulkUpdates.comments = comments;
        bulkUpdates.technicalLimitations = techLimits;
      }

      onUpdateSegmentsBulk(selectedIds, bulkUpdates);
    }
  };

  const handleMarkNormal = () => {
    const normalUpdates: Partial<SegmentData> = {
      flowDirection: 'antegrade',
      waveform: 'Normal',
      plaquePresent: false,
      intimalThickening: false,
      stenosisPresent: false,
      comments: '',
      technicalLimitations: '',
      preStenosisPsv: null,
      atStenosisPsv: null,
      postStenosisPsv: null,
    };

    if (!isBulk) {
      const id = selectedIds[0];
      const meta = SEGMENTS_META[id];
      let standardPsv = 70;
      let standardEdv = 18;

      if (meta?.type === 'cca') { standardPsv = 75; standardEdv = 18; }
      else if (meta?.type === 'ica') { standardPsv = 68; standardEdv = 22; }
      else if (meta?.type === 'eca') { standardPsv = 70; standardEdv = 12; }
      else if (meta?.type === 'bulb') { standardPsv = 60; standardEdv = 15; }
      else if (meta?.type === 'vertebral') { standardPsv = 45; standardEdv = 12; }
      else if (meta?.type === 'subclavian' || meta?.type === 'bct') { standardPsv = 95; standardEdv = 10; normalUpdates.waveform = 'Normal Triphasic'; }

      onUpdateSegment(id, {
        ...normalUpdates,
        psv: standardPsv,
        edv: standardEdv,
        localRatioReferenceOverrideId: null
      });
    } else {
      onUpdateSegmentsBulk(selectedIds, normalUpdates);
    }
  };

  const targetSegmentId = currentId;
  const isVertebral = targetSegmentId && SEGMENTS_META[targetSegmentId]?.type === 'vertebral';
  const targetMeta = targetSegmentId ? SEGMENTS_META[targetSegmentId] : null;
  const vesselCategory: VesselCategory = (targetMeta?.type as VesselCategory) || (isVertebral ? 'vertebral' : 'ica');
  const vesselWaveformOptions = getWaveformOptionsForVessel(vesselCategory);
  const activeDescriptor = findWaveformDescriptor(waveform, vesselCategory);

  // For Local Ratio computation
  const localRatioData = targetSegmentId ? calculateLocalPsvRatio(targetSegmentId, studyData) : null;
  const autoUpstreamRef = targetSegmentId ? findUpstreamNormalSegment(targetSegmentId, studyData) : null;

  // Get segments on the same side with registered PSV for manual reference override dropdown
  const sameSideSegmentsWithPsv = targetSegmentId ? (Object.values(studyData.segments) as SegmentData[]).filter(s => 
    s.id !== targetSegmentId && 
    s.side === studyData.segments[targetSegmentId]?.side && 
    s.psv !== null && 
    s.psv > 0
  ) : [];

  return (
    <div id="segment-assessment-container" className="bg-[#0b1329] border border-slate-800 rounded-xl shadow-lg overflow-hidden flex flex-col h-full">
      {/* Panel Header */}
      <div className="p-4 bg-[#0f172a] border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-black text-slate-100 uppercase tracking-wider">
            {isBulk ? `Bulk Assessment (${selectedIds.length} Segments)` : `Detailed Segment Assessment`}
          </h3>
        </div>
        <button
          id="assessment-normal-btn"
          onClick={handleMarkNormal}
          className="px-2.5 py-1 bg-emerald-950/70 text-emerald-300 hover:bg-emerald-900 border border-emerald-700 rounded-lg text-[10px] font-extrabold uppercase transition-colors cursor-pointer"
        >
          Quick Set Normal
        </button>
      </div>

      {/* Selected segments list display with active switching and remove chips */}
      <div className="px-4 py-2.5 bg-[#080d19] border-b border-slate-800 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            Active Segment Targets ({selectedIds.length}):
          </span>
          {selectedIds.length > 1 && (
            <button
              type="button"
              id="classify-continuous-plaque-btn"
              onClick={() => onAddPlaqueFromSegments(selectedIds)}
              className="text-[10px] font-bold bg-amber-950/60 text-amber-300 hover:bg-amber-900 border border-amber-800 px-2 py-0.5 rounded transition-colors cursor-pointer"
              title="Register single continuous plaque spanning all selected segments"
            >
              Classify Continuous Plaque ({selectedIds.length})
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5 items-center">
          {selectedIds.map(id => {
            const meta = SEGMENTS_META[id];
            const name = meta?.shortName || id;
            const isActive = id === currentId;
            return (
              <span
                key={id}
                onClick={() => onSetActiveSegment(id)}
                className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-md cursor-pointer transition-all ${
                  isActive
                    ? 'bg-cyan-500 text-slate-950 shadow-sm border border-cyan-400 font-black'
                    : 'bg-[#152038] hover:bg-[#1e2d4d] text-slate-300 border border-slate-700'
                }`}
                title="Click to make active for individual editing"
              >
                <span>{name} {isActive && '(Active)'}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveSelectedSegment(id);
                  }}
                  className="w-3.5 h-3.5 rounded-full hover:bg-black/20 flex items-center justify-center text-current font-bold"
                  title="Remove from selection"
                >
                  ×
                </button>
              </span>
            );
          })}
        </div>
      </div>

      {/* Main Form Fields */}
      <div className="p-5 flex-1 overflow-y-auto space-y-4">

        {/* If bulk mode, display field apply selectors */}
        {isBulk && (
          <div className="bg-[#0f172a] border border-dashed border-cyan-900/60 p-3.5 rounded-xl space-y-2 mb-2">
            <span className="text-[10px] font-bold text-cyan-400 uppercase flex items-center gap-1">
              <Info className="w-3.5 h-3.5" /> Bulk Update Rules
            </span>
            <p className="text-[10px] text-slate-400 leading-normal">
              Select which properties to apply to all selected segments:
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 pt-1">
              <label className="flex items-center gap-1.5 text-[10px] font-medium text-slate-300">
                <input type="checkbox" checked={applyPsv} onChange={(e) => setApplyPsv(e.target.checked)} className="rounded text-cyan-500" />
                Apply PSV
              </label>
              <label className="flex items-center gap-1.5 text-[10px] font-medium text-slate-300">
                <input type="checkbox" checked={applyEdv} onChange={(e) => setApplyEdv(e.target.checked)} className="rounded text-cyan-500" />
                Apply EDV
              </label>
              <label className="flex items-center gap-1.5 text-[10px] font-medium text-slate-300">
                <input type="checkbox" checked={applyFlow} onChange={(e) => setApplyFlow(e.target.checked)} className="rounded text-cyan-500" />
                Apply Flow Direction
              </label>
              <label className="flex items-center gap-1.5 text-[10px] font-medium text-slate-300">
                <input type="checkbox" checked={applyWave} onChange={(e) => setApplyWave(e.target.checked)} className="rounded text-cyan-500" />
                Apply Waveform
              </label>
              <label className="flex items-center gap-1.5 text-[10px] font-medium text-slate-300">
                <input type="checkbox" checked={applyPlaque} onChange={(e) => setApplyPlaque(e.target.checked)} className="rounded text-cyan-500" />
                Apply Plaque Flag
              </label>
              <label className="flex items-center gap-1.5 text-[10px] font-medium text-slate-300">
                <input type="checkbox" checked={applyImt} onChange={(e) => setApplyImt(e.target.checked)} className="rounded text-cyan-500" />
                Apply IMT Flag
              </label>
              <label className="flex items-center gap-1.5 text-[10px] font-medium text-slate-300">
                <input type="checkbox" checked={applyStenosis} onChange={(e) => setApplyStenosis(e.target.checked)} className="rounded text-cyan-500" />
                Apply Stenosis Flag
              </label>
              <label className="flex items-center gap-1.5 text-[10px] font-medium text-slate-300">
                <input type="checkbox" checked={applyComments} onChange={(e) => setApplyComments(e.target.checked)} className="rounded text-cyan-500" />
                Apply Comments & Limits
              </label>
            </div>
          </div>
        )}

        {/* 1. Velocities (PSV / EDV) */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={`block text-[11px] font-bold uppercase mb-1 ${isBulk && !applyPsv ? 'text-slate-500 line-through' : 'text-slate-300'}`}>
              Peak Systolic (PSV) <span className="text-[9px] text-slate-500 font-normal">(cm/s)</span>
            </label>
            <input
              id="input-psv"
              type="number"
              placeholder="e.g. 75"
              value={psv}
              onChange={(e) => setPsv(e.target.value)}
              disabled={isBulk && !applyPsv}
              className="w-full px-3 py-2 rounded-lg bg-[#0f172a] border border-slate-700 text-xs font-mono text-slate-100 focus:border-cyan-500 focus:outline-none disabled:opacity-40"
            />
          </div>
          <div>
            <label className={`block text-[11px] font-bold uppercase mb-1 ${isBulk && !applyEdv ? 'text-slate-500 line-through' : 'text-slate-300'}`}>
              End Diastolic (EDV) <span className="text-[9px] text-slate-500 font-normal">(cm/s)</span>
            </label>
            <input
              id="input-edv"
              type="number"
              placeholder="e.g. 18"
              value={edv}
              onChange={(e) => setEdv(e.target.value)}
              disabled={isBulk && !applyEdv}
              className="w-full px-3 py-2 rounded-lg bg-[#0f172a] border border-slate-700 text-xs font-mono text-slate-100 focus:border-cyan-500 focus:outline-none disabled:opacity-40"
            />
          </div>
        </div>

        {/* 2. Flow Direction */}
        <div className={isBulk && !applyFlow ? 'opacity-40 pointer-events-none' : ''}>
          <label className="block text-[11px] font-bold uppercase text-slate-300 mb-1">
            Flow Direction
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {(['antegrade', 'retrograde', 'bidirectional'] as FlowDirection[]).map(dir => (
              <button
                key={dir}
                type="button"
                id={`flow-btn-${dir}`}
                onClick={() => setFlowDirection(dir)}
                className={`py-1.5 px-2 rounded-lg border text-[10px] font-black uppercase text-center transition-all cursor-pointer ${
                  flowDirection === dir
                    ? dir === 'antegrade'
                      ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300 shadow-sm'
                      : dir === 'retrograde'
                      ? 'bg-rose-950/80 border-rose-600 text-rose-300 shadow-sm'
                      : 'bg-amber-950/80 border-amber-600 text-amber-300 shadow-sm'
                    : 'bg-[#0f172a] border-slate-700 text-slate-400 hover:bg-slate-800'
                }`}
              >
                {dir}
              </button>
            ))}
            {(['absent', 'not_assessed'] as FlowDirection[]).map(dir => (
              <button
                key={dir}
                type="button"
                id={`flow-btn-${dir}`}
                onClick={() => setFlowDirection(dir)}
                className={`col-span-1 py-1.5 px-2 rounded-lg border text-[10px] font-black uppercase text-center transition-all cursor-pointer ${
                  flowDirection === dir
                    ? 'bg-slate-800 border-slate-600 text-slate-100 shadow-sm'
                    : 'bg-[#0f172a] border-slate-700 text-slate-400 hover:bg-slate-800'
                }`}
              >
                {dir === 'not_assessed' ? 'Unassessed' : dir}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Waveform Section */}
        <div className={isBulk && !applyWave ? 'opacity-40 pointer-events-none' : ''}>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <label className="block text-[11px] font-bold uppercase text-slate-300">
                Waveform
              </label>
              {isVertebral && (
                <span className="px-1.5 py-0.2 rounded text-[8.5px] font-bold bg-cyan-950/70 border border-cyan-700 text-cyan-300">
                  Vertebral Steal Protocol
                </span>
              )}
            </div>
            <button
              type="button"
              id="btn-open-waveform-guide"
              onClick={() => {
                setGuideInitialDescriptor(activeDescriptor?.id);
                setGuideOpen(true);
              }}
              className="flex items-center gap-1 text-[10px] font-semibold text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
              title="Open full interactive waveform descriptor reference and criteria guide"
            >
              <Activity className="w-3 h-3 text-cyan-400" />
              <span>Reference & Examples</span>
            </button>
          </div>

          {/* Structured Descriptor Chips */}
          <div className="flex flex-wrap gap-1.5 mb-2">
            {vesselWaveformOptions.map(opt => {
              const isSelected = waveform === opt.label || (opt.id === 'normal' && waveform.toLowerCase() === 'normal');
              return (
                <WaveformHoverCard
                  key={opt.id}
                  descriptor={opt}
                  vesselCategory={vesselCategory}
                  onOpenGuide={() => {
                    setGuideInitialDescriptor(opt.id);
                    setGuideOpen(true);
                  }}
                >
                  <button
                    type="button"
                    id={`waveform-chip-${opt.id}`}
                    onClick={() => {
                      setWaveform(opt.label);
                      // Auto-sync vertebral flow direction if applicable
                      if (isVertebral) {
                        if (opt.id === 'bidirectional_partial_steal') {
                          setFlowDirection('bidirectional');
                        } else if (opt.id === 'complete_reversal') {
                          setFlowDirection('retrograde');
                        } else if (opt.id === 'absent') {
                          setFlowDirection('absent');
                        } else if (flowDirection === 'not_assessed') {
                          setFlowDirection('antegrade');
                        }
                      } else {
                        if (opt.id === 'absent') {
                          setFlowDirection('absent');
                        } else if (flowDirection === 'not_assessed') {
                          setFlowDirection('antegrade');
                        }
                      }
                    }}
                    className={`px-2 py-1 rounded text-[9.5px] font-bold transition-all border cursor-pointer ${
                      isSelected
                        ? opt.id === 'normal'
                          ? 'bg-emerald-950/70 border-emerald-500 text-emerald-300 font-extrabold shadow-sm'
                          : opt.id.includes('steal') || opt.id.includes('reversal') || opt.id === 'tardus_parvus'
                          ? 'bg-amber-950/80 border-amber-500 text-amber-200 font-extrabold shadow-sm'
                          : 'bg-cyan-950/70 border-cyan-500 text-cyan-200 font-extrabold shadow-sm'
                        : 'bg-[#0f172a] border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                </WaveformHoverCard>
              );
            })}
          </div>

          {/* Active Descriptor Dynamic Diagnostic Banner */}
          {activeDescriptor && activeDescriptor.id !== 'normal' && activeDescriptor.id !== 'not_assessed' && (
            <div className="mb-2 p-2 rounded-lg bg-[#071120] border border-cyan-900/60 flex items-start justify-between gap-2 text-[10.5px]">
              <div>
                <span className="font-bold text-cyan-300 block">
                  {activeDescriptor.label}
                </span>
                <span className="text-slate-400 text-[9.5px] line-clamp-2">
                  {activeDescriptor.interpretation}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setGuideInitialDescriptor(activeDescriptor.id);
                  setGuideOpen(true);
                }}
                className="shrink-0 text-[9px] font-bold text-cyan-400 hover:underline cursor-pointer"
              >
                View Criteria →
              </button>
            </div>
          )}

          <input
            id="input-waveform-custom"
            type="text"
            placeholder="Type custom waveform profile or qualifier..."
            value={waveform}
            onChange={(e) => setWaveform(e.target.value)}
            className="w-full px-3 py-1.5 rounded-lg bg-[#0f172a] border border-slate-700 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
          />
        </div>

        {/* 4. Pathology Binary Flags */}
        <div className="space-y-2 pt-1 border-t border-slate-800">
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Arterial Wall Assessment</span>
          
          <div className="grid grid-cols-3 gap-2">
            {/* Plaque checkbox */}
            <label
              id="label-plaque-present"
              className={`flex flex-col items-center p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                isBulk && !applyPlaque ? 'opacity-40' : ''
              } ${
                plaquePresent
                  ? 'border-amber-500 bg-amber-950/50 text-amber-300 shadow-md'
                  : 'border-slate-800 bg-[#0f172a] hover:bg-slate-800 text-slate-400'
              }`}
            >
              <input
                type="checkbox"
                checked={plaquePresent}
                disabled={isBulk && !applyPlaque}
                onChange={(e) => setPlaquePresent(e.target.checked)}
                className="sr-only"
              />
              <span className="text-[10.5px] font-black">Plaque Present</span>
              <span className="text-[8.5px] text-slate-500 mt-0.5">Visible focal lesion</span>
            </label>

            {/* Intimal Thickening checkbox */}
            <label
              id="label-imt-increased"
              className={`flex flex-col items-center p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                isBulk && !applyImt ? 'opacity-40' : ''
              } ${
                intimalThickening
                  ? 'border-cyan-500 bg-cyan-950/50 text-cyan-300 shadow-md'
                  : 'border-slate-800 bg-[#0f172a] hover:bg-slate-800 text-slate-400'
              }`}
            >
              <input
                type="checkbox"
                checked={intimalThickening}
                disabled={isBulk && !applyImt}
                onChange={(e) => setIntimalThickening(e.target.checked)}
                className="sr-only"
              />
              <span className="text-[10.5px] font-black">Thickened IMT</span>
              <span className="text-[8.5px] text-slate-500 mt-0.5">Diffuse thickening</span>
            </label>

            {/* Stenosis Present checkbox */}
            <label
              id="label-stenosis-present"
              className={`flex flex-col items-center p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                isBulk && !applyStenosis ? 'opacity-40' : ''
              } ${
                stenosisPresent
                  ? 'border-rose-500 bg-rose-950/50 text-rose-300 shadow-md'
                  : 'border-slate-800 bg-[#0f172a] hover:bg-slate-800 text-slate-400'
              }`}
            >
              <input
                type="checkbox"
                checked={stenosisPresent}
                disabled={isBulk && !applyStenosis}
                onChange={(e) => setStenosisPresent(e.target.checked)}
                className="sr-only"
              />
              <span className="text-[10.5px] font-black">Stenosis Present</span>
              <span className="text-[8.5px] text-slate-500 mt-0.5">Hemodynamic lesion</span>
            </label>
          </div>
        </div>

        {/* 5. Plaque Creation Shortcut */}
        {plaquePresent && (
          <div className="bg-amber-950/30 border border-amber-800/80 p-3 rounded-xl flex flex-col gap-2">
            <div className="flex items-start gap-2">
              <ClipboardList className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-black text-amber-300 uppercase block">Plaque Registry Integration</span>
                <span className="text-[9.5px] text-slate-400 leading-normal">
                  Plaque is marked present on {isBulk ? 'these segments' : 'this segment'}. Click below to configure composition, surface, and thickness in the plaque register.
                </span>
              </div>
            </div>
            <button
              id="register-plaque-btn"
              type="button"
              onClick={() => onAddPlaqueFromSegments(selectedIds)}
              className="w-full text-center py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all cursor-pointer shadow-md"
            >
              Attach Plaque Profile & Log Measurements
            </button>
          </div>
        )}

        {/* 6. Smart Local Ratio Calculation Panel (Visible only in single assessment mode) */}
        {!isBulk && (
          <div className="bg-[#0f172a] border border-slate-800 p-3.5 rounded-xl space-y-2.5 shadow-md">
            <span className="text-[10px] font-black text-cyan-400 uppercase tracking-wider block">Local PSV Ratio (Diagnostic)</span>
            
            {localRatioData ? (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2 bg-[#0b101f] border border-slate-800 p-2.5 rounded-lg">
                  <div>
                    <span className="text-[8px] font-bold text-slate-500 block uppercase">Reference Site</span>
                    <span className="text-[10px] font-bold text-slate-200 truncate block">
                      {localRatioData.referenceName}
                    </span>
                    <span className="text-[10px] font-mono text-cyan-400">{localRatioData.referencePsv} cm/s</span>
                  </div>
                  <div>
                    <span className="text-[8px] font-bold text-slate-500 block uppercase">Stenosis Site</span>
                    <span className="text-[10px] font-bold text-slate-200 truncate block">
                      {SEGMENTS_META[currentId]?.shortName}
                    </span>
                    <span className="text-[10px] font-mono text-cyan-400">{psv || '0'} cm/s</span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-800 pt-2 text-[11px]">
                  <span className="font-bold text-slate-300">Calculated Ratio:</span>
                  <span className="font-mono text-xs font-black text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
                    {localRatioData.ratio}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-[10px] text-slate-500 italic">
                {psv ? 'Add a PSV to a normal upstream segment (or override below) to compute local PSV ratio.' : 'Register a segment PSV and an upstream reference to view ratios.'}
              </p>
            )}

            {/* Reference Override Selector */}
            <div className="pt-1.5 border-t border-slate-800">
              <label className="block text-[9px] text-slate-400 font-bold uppercase mb-1">
                Reference Segment Override
              </label>
              <select
                id="select-ratio-reference-override"
                value={refOverrideId}
                onChange={(e) => setRefOverrideId(e.target.value)}
                className="w-full bg-[#0b101f] px-2.5 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-200 focus:outline-none"
              >
                <option value="auto">
                  {autoUpstreamRef ? `Auto-Resolved (${autoUpstreamRef.name})` : 'Auto-Resolve Upstream Healthy'}
                </option>
                {sameSideSegmentsWithPsv.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.psv} cm/s)
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* 7. Comments and Technical Limitations */}
        <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-800">
          <div className={isBulk && !applyComments ? 'opacity-40 pointer-events-none' : ''}>
            <label className="block text-[11px] font-bold uppercase text-slate-300 mb-1">
              Comments
            </label>
            <textarea
              id="input-segment-comments"
              placeholder="e.g. calcified shadow..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              disabled={isBulk && !applyComments}
              className="w-full h-16 px-3 py-2 rounded-lg bg-[#0f172a] border border-slate-700 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none resize-none"
            />
          </div>
          <div className={isBulk && !applyComments ? 'opacity-40 pointer-events-none' : ''}>
            <label className="block text-[11px] font-bold uppercase text-slate-300 mb-1">
              Technical Limits
            </label>
            <textarea
              id="input-segment-limitations"
              placeholder="e.g. tortuosity..."
              value={techLimits}
              onChange={(e) => setTechLimits(e.target.value)}
              disabled={isBulk && !applyComments}
              className="w-full h-16 px-3 py-2 rounded-lg bg-[#0f172a] border border-slate-700 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none resize-none"
            />
          </div>
        </div>

      </div>

      {/* Save Trigger Button */}
      <div className="p-4 border-t border-slate-800 bg-[#0f172a] flex items-center justify-between">
        <span className="text-[10px] text-slate-500">
          Click Apply and Save to commit changes to patient chart.
        </span>
        <button
          id="save-assessment-btn"
          type="button"
          onClick={handleSave}
          className="flex items-center gap-1.5 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-black rounded-lg transition-all shadow-md cursor-pointer"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Apply and Save</span>
        </button>
      </div>

      {/* Waveform Reference & Criteria Modal */}
      <WaveformDescriptorGuide
        isOpen={guideOpen}
        onClose={() => setGuideOpen(false)}
        category={vesselCategory}
        initialDescriptorId={guideInitialDescriptor}
        onSelectDescriptor={(desc) => {
          setWaveform(desc.label);
          if (isVertebral) {
            if (desc.id === 'bidirectional_partial_steal') {
              setFlowDirection('bidirectional');
            } else if (desc.id === 'complete_reversal') {
              setFlowDirection('retrograde');
            } else if (desc.id === 'absent') {
              setFlowDirection('absent');
            } else if (flowDirection === 'not_assessed') {
              setFlowDirection('antegrade');
            }
          } else {
            if (desc.id === 'absent') {
              setFlowDirection('absent');
            } else if (flowDirection === 'not_assessed') {
              setFlowDirection('antegrade');
            }
          }
          setGuideOpen(false);
        }}
      />
    </div>
  );
};
