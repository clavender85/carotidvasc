import React, { useState } from 'react';
import { StudyData, NascetState } from '../types';
import { calculateNascetStenosis } from '../utils/calculations';
import { Ruler, ShieldAlert, CheckCircle, Info } from 'lucide-react';

interface NascetCalculatorProps {
  studyData: StudyData;
  onUpdateNascet: (side: 'right' | 'left', plane: 'longitudinal' | 'transverse', minLumenA: number | null, normalLumenB: number | null) => void;
}

export const NascetCalculator: React.FC<NascetCalculatorProps> = ({
  studyData,
  onUpdateNascet,
}) => {
  const [activeSide, setActiveSide] = useState<'right' | 'left'>('right');

  // Local state for edit inputs
  const [longA, setLongA] = useState<string>('');
  const [longB, setLongB] = useState<string>('');
  const [transA, setTransA] = useState<string>('');
  const [transB, setTransB] = useState<string>('');

  const nascetState = activeSide === 'right' ? studyData.nascet.right : studyData.nascet.left;
  const suggestedClass = activeSide === 'right' ? studyData.classifications.right.suggested : studyData.classifications.left.suggested;

  const handleApply = (plane: 'longitudinal' | 'transverse') => {
    let aStr = plane === 'longitudinal' ? longA : transA;
    let bStr = plane === 'longitudinal' ? longB : transB;

    const a = aStr === '' ? null : parseFloat(aStr);
    const b = bStr === '' ? null : parseFloat(bStr);

    onUpdateNascet(activeSide, plane, a, b);
  };

  const handleClear = (plane: 'longitudinal' | 'transverse') => {
    if (plane === 'longitudinal') {
      setLongA('');
      setLongB('');
    } else {
      setTransA('');
      setTransB('');
    }
    onUpdateNascet(activeSide, plane, null, null);
  };

  // Synced loaders
  React.useEffect(() => {
    const state = activeSide === 'right' ? studyData.nascet.right : studyData.nascet.left;
    setLongA(state.longitudinal.minLumenA !== null ? state.longitudinal.minLumenA.toString() : '');
    setLongB(state.longitudinal.normalLumenB !== null ? state.longitudinal.normalLumenB.toString() : '');
    setTransA(state.transverse.minLumenA !== null ? state.transverse.minLumenA.toString() : '');
    setTransB(state.transverse.normalLumenB !== null ? state.transverse.normalLumenB.toString() : '');
  }, [activeSide, studyData]);

  const longStenosis = calculateNascetStenosis(nascetState.longitudinal.minLumenA, nascetState.longitudinal.normalLumenB);
  const transStenosis = calculateNascetStenosis(nascetState.transverse.minLumenA, nascetState.transverse.normalLumenB);

  const showOcclusionWarning = suggestedClass.toLowerCase().includes('occlusion') || suggestedClass.toLowerCase().includes('near occlusion');

  return (
    <div id="nascet-calculator-container" className="bg-[#0f172a] border border-slate-800 rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
      {/* Tab select side */}
      <div className="p-4 bg-slate-900/50 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Ruler className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">NASCET Diameter-Reduction Calculator</h3>
        </div>
        <div className="flex bg-[#121824] p-0.5 rounded-lg border border-slate-800 self-start">
          <button
            id="nascet-side-r"
            onClick={() => setActiveSide('right')}
            className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
              activeSide === 'right' ? 'bg-[#1e293b] text-cyan-400 border border-slate-800' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Right ICA
          </button>
          <button
            id="nascet-side-l"
            onClick={() => setActiveSide('left')}
            className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
              activeSide === 'left' ? 'bg-[#1e293b] text-cyan-400 border border-slate-800' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Left ICA
          </button>
        </div>
      </div>

      <div className="p-5 flex-1 overflow-y-auto space-y-4">
        <p className="text-xs text-slate-400 leading-normal">
          Physically map real-time B-mode or color-flow lumen boundaries to compute the true angiographic diameter-reduction index. Enter plane-specific measurements.
        </p>

        {/* Occlusion / Near Occlusion Warning Banner */}
        {showOcclusionWarning && (
          <div className="p-3 bg-red-950/20 border border-red-900 rounded-lg flex items-start gap-2 text-red-200 text-[11px] leading-relaxed">
            <ShieldAlert className="w-4 h-4 text-red-500 shrink-0 mt-0.5 animate-pulse" />
            <div>
              <span className="font-bold block mb-0.5 text-red-300">Warning: Hemodynamic Occlusion/Near Occlusion Present</span>
              A simple numerical NASCET diameter calculation may be highly unreliable because real lumen dimensions collapse under extreme pressure drops (string sign). User-directed clinical correlation is strictly required.
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Longitudinal Plane Section */}
          <div className="border border-slate-800 p-4 rounded-xl bg-[#121824] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-1.5">
                <span className="text-xs font-bold text-slate-300">Longitudinal Plane (A-L)</span>
                <span className="text-[9px] bg-slate-900 text-slate-400 border border-slate-800 px-1.5 py-0.5 rounded font-medium">Sagittal Plane</span>
              </div>

              <div className="space-y-3 mb-4">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                    (A) Min Residual Lumen Diameter at Stenosis <span className="text-[9px] text-slate-500 font-mono">(mm)</span>
                  </label>
                  <input
                    id="nascet-long-a"
                    type="number"
                    step="0.1"
                    placeholder="e.g. 1.2"
                    value={longA}
                    onChange={(e) => setLongA(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-800 bg-[#0f172a] text-slate-100 text-xs font-mono focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                    (B) True Lumen Diameter of Distal Healthy ICA <span className="text-[9px] text-slate-500 font-mono">(mm)</span>
                  </label>
                  <input
                    id="nascet-long-b"
                    type="number"
                    step="0.1"
                    placeholder="e.g. 5.5"
                    value={longB}
                    onChange={(e) => setLongB(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-800 bg-[#0f172a] text-slate-100 text-xs font-mono focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-slate-800">
              <div className="flex justify-between items-center bg-[#0f172a] p-2.5 border border-slate-800 rounded-lg">
                <span className="text-[10px] font-medium text-slate-400">NASCET estimate:</span>
                {longStenosis !== null ? (
                  <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/40 border border-cyan-800 px-2 py-0.5 rounded">
                    {longStenosis}% <span className="text-[9px] text-slate-500 font-normal">Reduction</span>
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-500 italic">Not calculated</span>
                )}
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  id="btn-clear-nascet-long"
                  onClick={() => handleClear('longitudinal')}
                  className="px-2 py-1 hover:bg-[#1e293b] text-slate-400 text-[10px] font-medium rounded transition-colors cursor-pointer"
                >
                  Clear
                </button>
                <button
                  id="btn-apply-nascet-long"
                  onClick={() => handleApply('longitudinal')}
                  className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-[10px] font-extrabold rounded transition-colors cursor-pointer"
                >
                  Apply Longitudinal
                </button>
              </div>
            </div>
          </div>

          {/* Transverse Plane Section */}
          <div className="border border-slate-800 p-4 rounded-xl bg-[#121824] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-1.5">
                <span className="text-xs font-bold text-slate-300">Transverse Plane (A-T)</span>
                <span className="text-[9px] bg-slate-900 text-slate-400 border border-slate-800 px-1.5 py-0.5 rounded font-medium">Axial Plane</span>
              </div>

              <div className="space-y-3 mb-4">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                    (A) Min Residual Lumen Diameter at Stenosis <span className="text-[9px] text-slate-500 font-mono">(mm)</span>
                  </label>
                  <input
                    id="nascet-trans-a"
                    type="number"
                    step="0.1"
                    placeholder="e.g. 1.5"
                    value={transA}
                    onChange={(e) => setTransA(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-800 bg-[#0f172a] text-slate-100 text-xs font-mono focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                    (B) True Lumen Diameter of Distal Healthy ICA <span className="text-[9px] text-slate-500 font-mono">(mm)</span>
                  </label>
                  <input
                    id="nascet-trans-b"
                    type="number"
                    step="0.1"
                    placeholder="e.g. 5.5"
                    value={transB}
                    onChange={(e) => setTransB(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-800 bg-[#0f172a] text-slate-100 text-xs font-mono focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-slate-800">
              <div className="flex justify-between items-center bg-[#0f172a] p-2.5 border border-slate-800 rounded-lg">
                <span className="text-[10px] font-medium text-slate-400">NASCET estimate:</span>
                {transStenosis !== null ? (
                  <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/40 border border-cyan-800 px-2 py-0.5 rounded">
                    {transStenosis}% <span className="text-[9px] text-slate-500 font-normal">Reduction</span>
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-500 italic">Not calculated</span>
                )}
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  id="btn-clear-nascet-trans"
                  onClick={() => handleClear('transverse')}
                  className="px-2 py-1 hover:bg-[#1e293b] text-slate-400 text-[10px] font-medium rounded transition-colors cursor-pointer"
                >
                  Clear
                </button>
                <button
                  id="btn-apply-nascet-trans"
                  onClick={() => handleApply('transverse')}
                  className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-[10px] font-extrabold rounded transition-colors cursor-pointer"
                >
                  Apply Transverse
                </button>
              </div>
            </div>
          </div>

        </div>

        <div className="bg-cyan-950/20 p-3 rounded-lg border border-cyan-900/40 flex gap-2 text-[10px] text-slate-400 leading-normal">
          <Info className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-300 block">NASCET Diameter vs. Area Reductions</span>
            This calculator implements strictly the NASCET diameter reduction formula: <span className="font-mono text-[9px] font-bold text-slate-200">Stenosis % = (1 - A/B) * 100</span>.
            Do not confuse this with cross-sectional area reduction or the velocity-based Doppler NASCET Index.
          </div>
        </div>

      </div>
    </div>
  );
};
