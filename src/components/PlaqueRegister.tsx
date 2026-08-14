import React, { useState } from 'react';
import { StudyData, PlaqueData, PlaqueComposition, PlaqueSurface, CalcificShadowing, LuminalNarrowing } from '../types';
import { SEGMENTS_META } from '../constants';
import { ClipboardList, Plus, Trash2, Info, Check, Sparkles } from 'lucide-react';

interface PlaqueRegisterProps {
  studyData: StudyData;
  selectedSegmentIds: string[];
  onAddPlaque: (plaque: PlaqueData) => void;
  onRemovePlaque: (id: string) => void;
}

export const PlaqueRegister: React.FC<PlaqueRegisterProps> = ({
  studyData,
  selectedSegmentIds,
  onAddPlaque,
  onRemovePlaque,
}) => {
  // Local state for editing a new plaque
  const [targetSegments, setTargetSegments] = useState<string[]>([]);
  const [maxPlaqueSite, setMaxPlaqueSite] = useState<string>('');
  const [maxThicknessMm, setMaxThicknessMm] = useState<string>('');
  const [composition, setComposition] = useState<PlaqueComposition>('mixed');
  const [surface, setSurface] = useState<PlaqueSurface>('smooth');
  const [calcificShadowing, setCalcificShadowing] = useState<CalcificShadowing>('none');
  const [luminalNarrowingVisible, setLuminalNarrowingVisible] = useState<LuminalNarrowing>('yes');
  const [freeText, setFreeText] = useState<string>('');

  const [isAdding, setIsAdding] = useState(false);

  // Sync target segments if user wants to use selected segments from tree
  const handleUseSelected = () => {
    if (selectedSegmentIds.length > 0) {
      setTargetSegments([...selectedSegmentIds]);
      setMaxPlaqueSite(selectedSegmentIds[0]);
    }
  };

  const handleSavePlaque = () => {
    if (targetSegments.length === 0) {
      alert("Please select at least one anatomical segment for plaque placement.");
      return;
    }

    const newPl: PlaqueData = {
      id: 'plaque_' + Date.now(),
      segments: targetSegments,
      locationDescription: targetSegments.map(id => SEGMENTS_META[id]?.shortName || id).join(' to '),
      maxPlaqueSite: maxPlaqueSite || targetSegments[0],
      maxThicknessMm: maxThicknessMm === '' ? null : parseFloat(maxThicknessMm),
      composition,
      surface,
      calcificShadowing,
      luminalNarrowingVisible,
      freeTextDescription: freeText,
    };

    onAddPlaque(newPl);
    
    // Reset form
    setTargetSegments([]);
    setMaxPlaqueSite('');
    setMaxThicknessMm('');
    setComposition('mixed');
    setSurface('smooth');
    setCalcificShadowing('none');
    setLuminalNarrowingVisible('yes');
    setFreeText('');
    setIsAdding(false);
  };

  const compositions: PlaqueComposition[] = ['hypoechoic', 'echogenic', 'mixed', 'calcified', 'indeterminate'];
  const surfaces: PlaqueSurface[] = ['smooth', 'irregular', 'ulcerated', 'indeterminate'];
  const shadowings: CalcificShadowing[] = ['none', 'partial', 'dense'];
  const narrowings: LuminalNarrowing[] = ['yes', 'no', 'indeterminate'];

  return (
    <div id="plaque-register-container" className="bg-[#0b1329] border border-slate-800 rounded-xl shadow-lg overflow-hidden flex flex-col h-full max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="p-4 bg-[#0f172a] border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-black text-slate-100 uppercase tracking-wider">Atherosclerotic Plaque Morphology Register</h3>
        </div>
        {!isAdding && (
          <button
            id="add-plaque-btn-trigger"
            onClick={() => {
              setIsAdding(true);
              handleUseSelected();
            }}
            className="flex items-center gap-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-lg shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Register Plaque Profile</span>
          </button>
        )}
      </div>

      <div className="p-5 flex-1 overflow-y-auto space-y-4">
        
        {/* Render New Plaque Entry Form */}
        {isAdding ? (
          <div className="bg-[#0f172a] p-5 border border-slate-800 rounded-xl space-y-4 shadow-md">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-black text-slate-100 uppercase">New Plaque Profile Definition</span>
              <button
                id="cancel-add-plaque-btn"
                onClick={() => setIsAdding(false)}
                className="text-xs text-slate-400 hover:text-slate-200 font-bold"
              >
                Cancel
              </button>
            </div>

            {/* Segments Attachment selection */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[10px] font-bold text-slate-300 uppercase">
                  Associated Arterial Segments
                </label>
                {selectedSegmentIds.length > 0 && (
                  <button
                    id="use-selected-for-plaque"
                    type="button"
                    onClick={handleUseSelected}
                    className="text-[10px] text-cyan-400 hover:underline font-bold"
                  >
                    Use Selected Canvas Nodes ({selectedSegmentIds.length})
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5 border border-slate-700 bg-[#0b101f] p-2.5 rounded-lg min-h-[42px]">
                {targetSegments.length > 0 ? (
                  targetSegments.map(id => (
                    <span key={id} className="inline-flex items-center gap-1 bg-amber-950/70 border border-amber-700 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded">
                      {SEGMENTS_META[id]?.shortName || id}
                    </span>
                  ))
                ) : (
                  <span className="text-[10px] text-slate-500 italic">No segments attached. Select on the tree/matrix and click "Use Selected".</span>
                )}
              </div>
            </div>

            {/* Maximum Plaque Site & Thickness */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-300 uppercase mb-1">
                  Point of Maximum Thickness
                </label>
                <select
                  id="select-max-plaque-site"
                  value={maxPlaqueSite}
                  onChange={(e) => setMaxPlaqueSite(e.target.value)}
                  className="w-full bg-[#0b101f] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none"
                >
                  <option value="">Select segment...</option>
                  {targetSegments.map(id => (
                    <option key={id} value={id}>
                      {SEGMENTS_META[id]?.name || id}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-300 uppercase mb-1">
                  Max Thickness <span className="text-[9px] text-slate-400 font-normal">(mm)</span>
                </label>
                <input
                  id="input-plaque-thickness"
                  type="number"
                  step="0.1"
                  placeholder="e.g. 2.4"
                  value={maxThicknessMm}
                  onChange={(e) => setMaxThicknessMm(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#0b101f] border border-slate-700 text-xs font-mono text-slate-100 focus:outline-none"
                />
              </div>
            </div>

            {/* Grid button selectors for Plaque parameters */}
            <div className="space-y-3 pt-1">
              
              {/* Composition Selection */}
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Composition</span>
                <div className="flex flex-wrap gap-1.5">
                  {compositions.map(c => (
                    <button
                      key={c}
                      type="button"
                      id={`comp-btn-${c}`}
                      onClick={() => setComposition(c)}
                      className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all border cursor-pointer ${
                        composition === c
                          ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-md'
                          : 'bg-[#0b101f] text-slate-300 border-slate-700 hover:bg-slate-800'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Surface Selection */}
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Surface Profile</span>
                <div className="flex flex-wrap gap-1.5">
                  {surfaces.map(s => (
                    <button
                      key={s}
                      type="button"
                      id={`surf-btn-${s}`}
                      onClick={() => setSurface(s)}
                      className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all border cursor-pointer ${
                        surface === s
                          ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-md'
                          : 'bg-[#0b101f] text-slate-300 border-slate-700 hover:bg-slate-800'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Calcific Shadowing Selection */}
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Calcific Acoustic Shadowing</span>
                <div className="flex flex-wrap gap-1.5">
                  {shadowings.map(sh => (
                    <button
                      key={sh}
                      type="button"
                      id={`shadow-btn-${sh}`}
                      onClick={() => setCalcificShadowing(sh)}
                      className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all border cursor-pointer ${
                        calcificShadowing === sh
                          ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-md'
                          : 'bg-[#0b101f] text-slate-300 border-slate-700 hover:bg-slate-800'
                      }`}
                    >
                      {sh}
                    </button>
                  ))}
                </div>
              </div>

              {/* Luminal Narrowing Selector */}
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Luminal Narrowing Visible</span>
                <div className="flex flex-wrap gap-1.5">
                  {narrowings.map(n => (
                    <button
                      key={n}
                      type="button"
                      id={`narrow-btn-${n}`}
                      onClick={() => setLuminalNarrowingVisible(n)}
                      className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all border cursor-pointer ${
                        luminalNarrowingVisible === n
                          ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-md'
                          : 'bg-[#0b101f] text-slate-300 border-slate-700 hover:bg-slate-800'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Free-text Description */}
            <div>
              <label className="block text-[10px] font-bold text-slate-300 uppercase mb-1">
                Morphological Description & Custom Notes
              </label>
              <textarea
                id="plaque-description-comments"
                placeholder="Type additional findings e.g. soft lipid-rich core, focal calcified nodules..."
                value={freeText}
                onChange={(e) => setFreeText(e.target.value)}
                className="w-full h-16 px-3 py-2 rounded-lg bg-[#0b101f] border border-slate-700 text-xs text-slate-100 focus:outline-none"
              />
            </div>

            <button
              id="submit-plaque-btn"
              type="button"
              onClick={handleSavePlaque}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[3]" /> Save Plaque Entry
            </button>

          </div>
        ) : (
          <div className="space-y-4">
            
            {/* List existing plaques */}
            {studyData.plaques.length > 0 ? (
              studyData.plaques.map((pl, idx) => (
                <div key={pl.id} className="p-4 border border-slate-800 hover:border-amber-700/80 rounded-xl bg-[#0f172a] relative group transition-colors shadow-md">
                  <div className="flex items-start justify-between mb-1.5">
                    <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      Plaque #{idx + 1}: {SEGMENTS_META[pl.maxPlaqueSite]?.shortName || pl.maxPlaqueSite} (Max Thickness Site)
                    </span>
                    <button
                      id={`delete-plaque-${pl.id}`}
                      onClick={() => onRemovePlaque(pl.id)}
                      className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-slate-800 transition-colors"
                      title="Delete plaque profile"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-normal mb-2">
                    <span className="font-bold text-slate-300">Location Extent:</span> {pl.locationDescription}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[10.5px] border-t border-slate-800 pt-2.5 text-slate-300">
                    <div>
                      <span className="font-bold text-slate-500 block text-[9px] uppercase">Thickness</span>
                      <span className="font-mono font-bold text-slate-100">{pl.maxThicknessMm !== null ? `${pl.maxThicknessMm} mm` : 'Not assessed'}</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-500 block text-[9px] uppercase">Composition</span>
                      <span className="capitalize font-medium text-slate-200">{pl.composition}</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-500 block text-[9px] uppercase">Surface</span>
                      <span className="capitalize font-medium text-slate-200">{pl.surface}</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-500 block text-[9px] uppercase">Shadowing</span>
                      <span className="capitalize font-medium text-slate-200">{pl.calcificShadowing}</span>
                    </div>
                    {pl.freeTextDescription && (
                      <div className="col-span-2 sm:col-span-4 border-t border-slate-800/60 pt-1.5 mt-1 text-[10px] text-slate-400">
                        <span className="font-bold text-slate-300 block">Comments:</span>
                        {pl.freeTextDescription}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl text-slate-500 flex flex-col items-center bg-[#0d1527]/30">
                <ClipboardList className="w-8 h-8 text-slate-600 mb-2" />
                <span className="text-xs font-bold text-slate-300 block">No plaques registered in this study</span>
                <span className="text-[10px] text-slate-500 max-w-[280px] mt-1 leading-normal">
                  Plaques declared in individual segment assessments or bilateral matrix can be cataloged here for complete morphological profiling.
                </span>
              </div>
            )}

            <div className="bg-[#0f172a] p-3.5 rounded-xl flex gap-2.5 text-[10.5px] text-slate-400 leading-relaxed border border-slate-800">
              <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-200 block">Sonographer Best Practice</span>
                Atherosclerotic plaques often span across contiguous boundaries (e.g. distal CCA extending into the bulb). Group them as a single plaque profile to avoid redundant pathology cataloging in clinical summaries.
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
