import React, { useState, useEffect } from 'react';
import { StudyData, SegmentData, FlowDirection } from '../types';
import { SEGMENTS_META } from '../constants';
import { calculateLocalPsvRatio, findUpstreamNormalSegment } from '../utils/calculations';
import { Check, ClipboardList, Info, ShieldAlert, Sliders, Save, Plus } from 'lucide-react';

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

  // Bidirectional mirroring
  const handleAtStenosisChange = (val: string) => {
    setAtStenosisPsv(val);
    setPsv(val);
  };

  const handleMainPsvChange = (val: string) => {
    setPsv(val);
    setAtStenosisPsv(val);
  };

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
      <div id="no-segment-selected" className="bg-white border border-slate-200 rounded-xl p-8 text-center flex flex-col items-center justify-center h-full min-h-[400px]">
        <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center border border-slate-200 mb-4 text-slate-400">
          <ClipboardList className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-slate-800">No segment selected</h3>
        <p className="text-xs text-slate-500 max-w-[280px] mt-1.5 leading-relaxed">
          Select one or multiple segments on the anatomical tree canvas to begin clinical assessment.
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

  const wavePresets = [
    'Normal Low Resistance',
    'Normal High Resistance',
    'Triphasic',
    'Biphasic',
    'Monophasic',
    'Tardus-Parvus',
    'Turbulent / High velocity',
    'Dampened',
    'Terminal Thump',
    'Pre-occlusive string sign'
  ];

  // For Local Ratio computation
  const targetSegmentId = currentId;
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
    <div id="segment-assessment-container" className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
      {/* Panel Header */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-blue-500" />
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            {isBulk ? `Bulk Assessment (${selectedIds.length} Segments)` : `Detailed Segment Assessment`}
          </h3>
        </div>
        <button
          id="assessment-normal-btn"
          onClick={handleMarkNormal}
          className="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded text-[10px] font-bold transition-colors"
        >
          Quick Set Normal
        </button>
      </div>

      {/* Selected segments list display with active switching and remove chips */}
      <div className="px-4 py-2.5 bg-[#0f172a] border-b border-slate-800 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            Selected Segments ({selectedIds.length}):
          </span>
          {selectedIds.length > 1 && (
            <button
              type="button"
              id="classify-continuous-plaque-btn"
              onClick={() => onAddPlaqueFromSegments(selectedIds)}
              className="text-[10px] font-bold bg-amber-950/40 text-amber-300 hover:bg-amber-900/50 border border-amber-800 px-2 py-0.5 rounded transition-colors cursor-pointer"
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
                    ? 'bg-cyan-500 text-slate-950 shadow-sm border border-cyan-400 font-extrabold'
                    : 'bg-[#1e293b] hover:bg-[#2c3e50] text-slate-200 border border-slate-700'
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
                  className="w-3.5 h-3.5 rounded-full hover:bg-black/20 flex items-center justify-center text-current"
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
          <div className="bg-indigo-50/40 border border-dashed border-indigo-100 p-3 rounded-lg space-y-2 mb-2">
            <span className="text-[10px] font-bold text-indigo-700 uppercase flex items-center gap-1">
              <Info className="w-3.5 h-3.5" /> Bulk Update Rules
            </span>
            <p className="text-[10px] text-slate-500 leading-normal">
              Select which properties to apply to all selected segments:
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 pt-1">
              <label className="flex items-center gap-1.5 text-[10px] font-medium text-slate-700">
                <input type="checkbox" checked={applyPsv} onChange={(e) => setApplyPsv(e.target.checked)} className="rounded text-indigo-600 focus:ring-indigo-500" />
                Apply PSV
              </label>
              <label className="flex items-center gap-1.5 text-[10px] font-medium text-slate-700">
                <input type="checkbox" checked={applyEdv} onChange={(e) => setApplyEdv(e.target.checked)} className="rounded text-indigo-600 focus:ring-indigo-500" />
                Apply EDV
              </label>
              <label className="flex items-center gap-1.5 text-[10px] font-medium text-slate-700">
                <input type="checkbox" checked={applyFlow} onChange={(e) => setApplyFlow(e.target.checked)} className="rounded text-indigo-600 focus:ring-indigo-500" />
                Apply Flow Direction
              </label>
              <label className="flex items-center gap-1.5 text-[10px] font-medium text-slate-700">
                <input type="checkbox" checked={applyWave} onChange={(e) => setApplyWave(e.target.checked)} className="rounded text-indigo-600 focus:ring-indigo-500" />
                Apply Waveform
              </label>
              <label className="flex items-center gap-1.5 text-[10px] font-medium text-slate-700">
                <input type="checkbox" checked={applyPlaque} onChange={(e) => setApplyPlaque(e.target.checked)} className="rounded text-indigo-600 focus:ring-indigo-500" />
                Apply Plaque Flag
              </label>
              <label className="flex items-center gap-1.5 text-[10px] font-medium text-slate-700">
                <input type="checkbox" checked={applyImt} onChange={(e) => setApplyImt(e.target.checked)} className="rounded text-indigo-600 focus:ring-indigo-500" />
                Apply IMT Flag
              </label>
              <label className="flex items-center gap-1.5 text-[10px] font-medium text-slate-700">
                <input type="checkbox" checked={applyStenosis} onChange={(e) => setApplyStenosis(e.target.checked)} className="rounded text-indigo-600 focus:ring-indigo-500" />
                Apply Stenosis Flag
              </label>
              <label className="flex items-center gap-1.5 text-[10px] font-medium text-slate-700">
                <input type="checkbox" checked={applyComments} onChange={(e) => setApplyComments(e.target.checked)} className="rounded text-indigo-600 focus:ring-indigo-500" />
                Apply Comments & Limits
              </label>
            </div>
          </div>
        )}

        {/* 1. Velocities (PSV / EDV) */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={`block text-[11px] font-semibold mb-1 ${isBulk && !applyPsv ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
              Peak Systolic (PSV) <span className="text-[9px] text-slate-400 font-normal">(cm/s)</span>
            </label>
            <input
              id="input-psv"
              type="number"
              placeholder="e.g. 75"
              value={psv}
              onChange={(e) => setPsv(e.target.value)}
              disabled={isBulk && !applyPsv}
              className="w-full px-3 py-1.5 rounded-md border border-slate-200 text-xs font-mono focus:border-blue-500 focus:ring-1 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-400"
            />
          </div>
          <div>
            <label className={`block text-[11px] font-semibold mb-1 ${isBulk && !applyEdv ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
              End Diastolic (EDV) <span className="text-[9px] text-slate-400 font-normal">(cm/s)</span>
            </label>
            <input
              id="input-edv"
              type="number"
              placeholder="e.g. 18"
              value={edv}
              onChange={(e) => setEdv(e.target.value)}
              disabled={isBulk && !applyEdv}
              className="w-full px-3 py-1.5 rounded-md border border-slate-200 text-xs font-mono focus:border-blue-500 focus:ring-1 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-400"
            />
          </div>
        </div>

        {/* 2. Flow Direction */}
        <div className={isBulk && !applyFlow ? 'opacity-50 pointer-events-none' : ''}>
          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
            Flow Direction
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {(['antegrade', 'retrograde', 'bidirectional'] as FlowDirection[]).map(dir => (
              <button
                key={dir}
                type="button"
                id={`flow-btn-${dir}`}
                onClick={() => setFlowDirection(dir)}
                className={`py-1 px-1.5 rounded border text-[10px] font-bold text-center capitalize transition-all ${
                  flowDirection === dir
                    ? dir === 'antegrade'
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                      : dir === 'retrograde'
                      ? 'bg-red-50 border-red-300 text-red-800'
                      : 'bg-amber-50 border-amber-300 text-amber-800'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
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
                className={`col-span-1 py-1 px-1.5 rounded border text-[10px] font-bold text-center capitalize transition-all ${
                  flowDirection === dir
                    ? 'bg-slate-100 border-slate-300 text-slate-800'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {dir === 'not_assessed' ? 'Unassessed' : dir}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Waveform Presets */}
        <div className={isBulk && !applyWave ? 'opacity-50 pointer-events-none' : ''}>
          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
            Waveform Characteristics
          </label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {wavePresets.map(w => (
              <button
                key={w}
                type="button"
                id={`waveform-preset-${w.replace(/\s+/g, '-').toLowerCase()}`}
                onClick={() => setWaveform(w)}
                className={`px-2 py-1 rounded text-[9px] font-medium transition-all ${
                  waveform === w
                    ? 'bg-blue-50 border border-blue-300 text-blue-800'
                    : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {w}
              </button>
            ))}
          </div>
          <input
            id="input-waveform-custom"
            type="text"
            placeholder="Type custom waveform profile..."
            value={waveform}
            onChange={(e) => setWaveform(e.target.value)}
            className="w-full px-3 py-1.5 rounded-md border border-slate-200 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
          />
        </div>

        {/* 4. Pathology Binary Flags */}
        <div className="space-y-2 pt-1 border-t border-slate-100">
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Arterial Wall Assessment</span>
          
          <div className="grid grid-cols-3 gap-2">
            {/* Plaque checkbox */}
            <label
              id="label-plaque-present"
              className={`flex flex-col items-center p-2 rounded-lg border text-center transition-all cursor-pointer ${
                isBulk && !applyPlaque ? 'opacity-40' : ''
              } ${
                plaquePresent
                  ? 'border-amber-400 bg-amber-50/20 text-amber-900'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
              }`}
            >
              <input
                type="checkbox"
                checked={plaquePresent}
                disabled={isBulk && !applyPlaque}
                onChange={(e) => setPlaquePresent(e.target.checked)}
                className="sr-only"
              />
              <span className="text-[10px] font-bold">Plaque Present</span>
              <span className="text-[8px] text-slate-400 mt-0.5">Visible focal lesion</span>
            </label>

            {/* Intimal Thickening checkbox */}
            <label
              id="label-imt-increased"
              className={`flex flex-col items-center p-2 rounded-lg border text-center transition-all cursor-pointer ${
                isBulk && !applyImt ? 'opacity-40' : ''
              } ${
                intimalThickening
                  ? 'border-blue-400 bg-blue-50/20 text-blue-900'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
              }`}
            >
              <input
                type="checkbox"
                checked={intimalThickening}
                disabled={isBulk && !applyImt}
                onChange={(e) => setIntimalThickening(e.target.checked)}
                className="sr-only"
              />
              <span className="text-[10px] font-bold">Thickened IMT</span>
              <span className="text-[8px] text-slate-400 mt-0.5">Diffuse thickening</span>
            </label>

            {/* Stenosis Present checkbox */}
            <label
              id="label-stenosis-present"
              className={`flex flex-col items-center p-2 rounded-lg border text-center transition-all cursor-pointer ${
                isBulk && !applyStenosis ? 'opacity-40' : ''
              } ${
                stenosisPresent
                  ? 'border-red-400 bg-red-50/20 text-red-900'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
              }`}
            >
              <input
                type="checkbox"
                checked={stenosisPresent}
                disabled={isBulk && !applyStenosis}
                onChange={(e) => setStenosisPresent(e.target.checked)}
                className="sr-only"
              />
              <span className="text-[10px] font-bold">Stenosis Present</span>
              <span className="text-[8px] text-slate-400 mt-0.5">Hemodynamic lesion</span>
            </label>
          </div>
        </div>

        {/* 5. Plaque Creation Shortcut */}
        {plaquePresent && (
          <div className="bg-amber-50/60 border border-amber-200 p-3 rounded-lg flex flex-col gap-2">
            <div className="flex items-start gap-2">
              <ClipboardList className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-bold text-amber-800 block">Plaque Registry Integration</span>
                <span className="text-[9px] text-slate-500 leading-normal">
                  Plaque is marked present on {isBulk ? 'these segments' : 'this segment'}. Click below to configure composition, surface, and thickness in the plaque register.
                </span>
              </div>
            </div>
            <button
              id="register-plaque-btn"
              type="button"
              onClick={() => onAddPlaqueFromSegments(selectedIds)}
              className="w-full text-center py-1.5 rounded bg-amber-500 hover:bg-amber-600 text-white font-bold text-[10px] transition-all"
            >
              Attach Plaque Profile & Log measurements
            </button>
          </div>
        )}

        {/* 6. Smart Local Ratio Calculation Panel (Visible only in single assessment mode) */}
        {!isBulk && (
          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-lg space-y-2.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Local PSV Ratio (Diagnostic)</span>
            
            {localRatioData ? (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2 bg-white border border-slate-100 p-2 rounded-md">
                  <div>
                    <span className="text-[8px] font-bold text-slate-400 block uppercase">Reference Site</span>
                    <span className="text-[10px] font-semibold text-slate-700 truncate block">
                      {localRatioData.referenceName}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">{localRatioData.referencePsv} cm/s</span>
                  </div>
                  <div>
                    <span className="text-[8px] font-bold text-slate-400 block uppercase">Stenosis Site</span>
                    <span className="text-[10px] font-semibold text-slate-700 truncate block">
                      {SEGMENTS_META[activeId]?.shortName}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">{psv || '0'} cm/s</span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-200/60 pt-2 text-[11px]">
                  <span className="font-semibold text-slate-600">Calculated Ratio:</span>
                  <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {localRatioData.ratio}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-[10px] text-slate-400 italic">
                {psv ? 'Add a PSV to a normal upstream segment (or override below) to compute local PSV ratio.' : 'Register a segment PSV and an upstream reference to view ratios.'}
              </p>
            )}

            {/* Reference Override Selector */}
            <div className="pt-1.5 border-t border-slate-200/40">
              <label className="block text-[9px] text-slate-500 font-bold uppercase mb-1">
                Reference Segment Override
              </label>
              <select
                id="select-ratio-reference-override"
                value={refOverrideId}
                onChange={(e) => setRefOverrideId(e.target.value)}
                className="w-full bg-white px-2 py-1 rounded border border-slate-200 text-[10px] focus:outline-none focus:ring-1 focus:ring-blue-100"
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
              <span className="text-[8px] text-slate-400 block mt-0.5 leading-normal">
                Standard clinical protocol automatically walks back towards the heart to identify the nearest normal segment.
              </span>
            </div>
          </div>
        )}

        {/* 7. Comments and Technical Limitations */}
        <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-100">
          <div className={isBulk && !applyComments ? 'opacity-50 pointer-events-none' : ''}>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Comments
            </label>
            <textarea
              id="input-segment-comments"
              placeholder="e.g. calcified shadow..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              disabled={isBulk && !applyComments}
              className="w-full h-16 px-2 py-1.5 rounded-md border border-slate-200 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-100 resize-none"
            />
          </div>
          <div className={isBulk && !applyComments ? 'opacity-50 pointer-events-none' : ''}>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Technical Limits
            </label>
            <textarea
              id="input-segment-limitations"
              placeholder="e.g. tortuosity..."
              value={techLimits}
              onChange={(e) => setTechLimits(e.target.value)}
              disabled={isBulk && !applyComments}
              className="w-full h-16 px-2 py-1.5 rounded-md border border-slate-200 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-100 resize-none"
            />
          </div>
        </div>

      </div>

      {/* Save Trigger Button */}
      <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
        <span className="text-[9px] text-slate-400">
          Click Save to commit changes to the patient chart.
        </span>
        <button
          id="save-assessment-btn"
          type="button"
          onClick={handleSave}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-all shadow-sm"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Apply and Save</span>
        </button>
      </div>
    </div>
  );
};
