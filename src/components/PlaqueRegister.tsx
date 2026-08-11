import React, { useState } from 'react';
import { StudyData, PlaqueData, PlaqueComposition, PlaqueSurface, CalcificShadowing, LuminalNarrowing } from '../types';
import { SEGMENTS_META } from '../constants';
import { ClipboardList, Plus, Trash2, Info, Check } from 'lucide-react';

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
    <div id="plaque-register-container" className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
      
      {/* Header */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-amber-500" />
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Atherosclerotic Plaque Register</h3>
        </div>
        {!isAdding && (
          <button
            id="add-plaque-btn-trigger"
            onClick={() => {
              setIsAdding(true);
              handleUseSelected();
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold rounded shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Register Plaque</span>
          </button>
        )}
      </div>

      <div className="p-5 flex-1 overflow-y-auto space-y-4">
        
        {/* Render New Plaque Entry Form */}
        {isAdding ? (
          <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-xs font-bold text-slate-800 uppercase">New Plaque Profile</span>
              <button
                id="cancel-add-plaque-btn"
                onClick={() => setIsAdding(false)}
                className="text-[10px] text-slate-500 hover:text-slate-700 font-bold"
              >
                Cancel
              </button>
            </div>

            {/* Segments Attachment selection */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[10px] font-bold text-slate-600 uppercase">
                  Associated Segments
                </label>
                {selectedSegmentIds.length > 0 && (
                  <button
                    id="use-selected-for-plaque"
                    type="button"
                    onClick={handleUseSelected}
                    className="text-[9px] text-blue-600 hover:underline font-bold"
                  >
                    Use Selected Canvas Nodes ({selectedSegmentIds.length})
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1 border border-slate-200 bg-white p-2 rounded-md min-h-[36px]">
                {targetSegments.length > 0 ? (
                  targetSegments.map(id => (
                    <span key={id} className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-800 text-[9px] font-bold px-1.5 py-0.5 rounded">
                      {SEGMENTS_META[id]?.shortName || id}
                    </span>
                  ))
                ) : (
                  <span className="text-[10px] text-slate-400 italic">No segments attached. Select on the tree above and click "Use Selected".</span>
                )}
              </div>
            </div>

            {/* Maximum Plaque Site & Thickness */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                  Point of Max Thickness
                </label>
                <select
                  id="select-max-plaque-site"
                  value={maxPlaqueSite}
                  onChange={(e) => setMaxPlaqueSite(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 text-xs focus:outline-none"
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
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                  Max Thickness <span className="text-[9px] text-slate-400 font-normal">(mm)</span>
                </label>
                <input
                  id="input-plaque-thickness"
                  type="number"
                  step="0.1"
                  placeholder="e.g. 2.4"
                  value={maxThicknessMm}
                  onChange={(e) => setMaxThicknessMm(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded border border-slate-200 text-xs font-mono focus:outline-none"
                />
              </div>
            </div>

            {/* Grid button selectors for Plaque parameters */}
            <div className="space-y-3">
              
              {/* Composition Selection */}
              <div>
                <span className="block text-[10px] font-bold text-slate-600 uppercase mb-1.5">Composition</span>
                <div className="flex flex-wrap gap-1">
                  {compositions.map(c => (
                    <button
                      key={c}
                      type="button"
                      id={`comp-btn-${c}`}
                      onClick={() => setComposition(c)}
                      className={`px-2 py-1 rounded text-[9px] font-bold transition-all border ${
                        composition === c
                          ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Surface Selection */}
              <div>
                <span className="block text-[10px] font-bold text-slate-600 uppercase mb-1.5">Surface Profile</span>
                <div className="flex flex-wrap gap-1">
                  {surfaces.map(s => (
                    <button
                      key={s}
                      type="button"
                      id={`surf-btn-${s}`}
                      onClick={() => setSurface(s)}
                      className={`px-2 py-1 rounded text-[9px] font-bold transition-all border ${
                        surface === s
                          ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Calcific Shadowing Selection */}
              <div>
                <span className="block text-[10px] font-bold text-slate-600 uppercase mb-1.5">Calcific Shadowing</span>
                <div className="flex flex-wrap gap-1">
                  {shadowings.map(sh => (
                    <button
                      key={sh}
                      type="button"
                      id={`shadow-btn-${sh}`}
                      onClick={() => setCalcificShadowing(sh)}
                      className={`px-2 py-1 rounded text-[9px] font-bold transition-all border ${
                        calcificShadowing === sh
                          ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {sh}
                    </button>
                  ))}
                </div>
              </div>

              {/* Luminal Narrowing Selector */}
              <div>
                <span className="block text-[10px] font-bold text-slate-600 uppercase mb-1.5">Luminal Narrowing Visible</span>
                <div className="flex flex-wrap gap-1">
                  {narrowings.map(n => (
                    <button
                      key={n}
                      type="button"
                      id={`narrow-btn-${n}`}
                      onClick={() => setLuminalNarrowingVisible(n)}
                      className={`px-2 py-1 rounded text-[9px] font-bold transition-all border ${
                        luminalNarrowingVisible === n
                          ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
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
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                Morphological Description & Comments
              </label>
              <textarea
                id="plaque-description-comments"
                placeholder="Type additional findings e.g. soft lipid-rich core, focal calcified nodules..."
                value={freeText}
                onChange={(e) => setFreeText(e.target.value)}
                className="w-full h-16 px-2.5 py-1.5 rounded border border-slate-200 text-xs focus:outline-none"
              />
            </div>

            <button
              id="submit-plaque-btn"
              type="button"
              onClick={handleSavePlaque}
              className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" /> Save Plaque Entry
            </button>

          </div>
        ) : (
          <div className="space-y-3">
            
            {/* List existing plaques */}
            {studyData.plaques.length > 0 ? (
              studyData.plaques.map((pl, idx) => (
                <div key={pl.id} className="p-4 border border-slate-200 hover:border-amber-300 rounded-xl bg-amber-50/5 relative group transition-colors">
                  <div className="flex items-start justify-between mb-1.5">
                    <span className="text-xs font-bold text-amber-900 flex items-center gap-1">
                      Plaque #{idx + 1}: {SEGMENTS_META[pl.maxPlaqueSite]?.shortName || pl.maxPlaqueSite} Max site
                    </span>
                    <button
                      id={`delete-plaque-${pl.id}`}
                      onClick={() => onRemovePlaque(pl.id)}
                      className="text-slate-400 hover:text-red-500 p-1 rounded hover:bg-slate-100 transition-colors"
                      title="Delete plaque profile"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-[10px] text-slate-500 leading-normal mb-2">
                    <span className="font-semibold text-slate-700">Location Range:</span> {pl.locationDescription}
                  </p>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[10px] border-t border-slate-100 pt-2 text-slate-600">
                    <div>
                      <span className="font-semibold text-slate-500 block">Thickness:</span>
                      {pl.maxThicknessMm !== null ? `${pl.maxThicknessMm} mm` : 'Not assessed'}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-500 block">Composition:</span>
                      <span className="capitalize">{pl.composition}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-500 block">Surface:</span>
                      <span className="capitalize">{pl.surface}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-500 block">Calcific Shadowing:</span>
                      <span className="capitalize">{pl.calcificShadowing}</span>
                    </div>
                    {pl.freeTextDescription && (
                      <div className="col-span-2 border-t border-dashed border-slate-100 pt-1.5 mt-1 text-[9px] text-slate-500">
                        <span className="font-semibold text-slate-600 block">Comments:</span>
                        {pl.freeTextDescription}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl text-slate-400 flex flex-col items-center">
                <ClipboardList className="w-8 h-8 text-slate-300 mb-2" />
                <span className="text-[11px] font-bold text-slate-500 block">No plaques registered in this study</span>
                <span className="text-[10px] text-slate-400 max-w-[220px] mt-1 leading-normal">
                  Plaques declared in individual segment assessments can be cataloged here for complete morphological profiling.
                </span>
              </div>
            )}

            <div className="bg-slate-50 p-3 rounded-lg flex gap-2 text-[10px] text-slate-500 leading-normal border border-slate-200">
              <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-700 block">Clinical Tip</span>
                Atherosclerotic plaques often span across contiguous boundaries (e.g. distal CCA extending into the bulb). Group them as a single plaque profile to avoid redundant pathology cataloging.
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
