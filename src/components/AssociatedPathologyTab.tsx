import React, { useState } from 'react';
import { StudyData, NonCarotidFinding } from '../types';
import { NON_CAROTID_FINDING_TYPES } from '../constants';
import { ShieldAlert, Plus, Trash2, Check, Activity, AlertTriangle } from 'lucide-react';

interface AssociatedPathologyTabProps {
  studyData: StudyData;
  onUpdateStudy: (updates: Partial<StudyData>) => void;
}

export const AssociatedPathologyTab: React.FC<AssociatedPathologyTabProps> = ({ studyData, onUpdateStudy }) => {
  const [selectedType, setSelectedType] = useState<string>(NON_CAROTID_FINDING_TYPES[0]);
  const [side, setSide] = useState<'right' | 'left' | 'bilateral'>('right');
  const [sizeMm, setSizeMm] = useState<string>('');
  const [comments, setComments] = useState<string>('');

  const handleAddFinding = () => {
    const newFinding: NonCarotidFinding = {
      id: 'finding_' + Date.now(),
      type: selectedType,
      side,
      sizeMm: sizeMm ? parseFloat(sizeMm) : null,
      comments,
    };

    onUpdateStudy({
      nonCarotidFindings: [...studyData.nonCarotidFindings, newFinding],
    });

    setComments('');
    setSizeMm('');
  };

  const handleRemoveFinding = (id: string) => {
    onUpdateStudy({
      nonCarotidFindings: studyData.nonCarotidFindings.filter(f => f.id !== id),
    });
  };

  return (
    <div id="associated-pathology-container" className="space-y-6 max-w-5xl mx-auto pb-12">
      
      {/* Header card */}
      <div className="bg-[#0b1329] border border-slate-800 rounded-xl shadow-lg p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <Activity className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-xs font-black text-slate-100 uppercase tracking-wider">
                Non-Carotid & Associated Cervical Pathology Register
              </h3>
              <p className="text-[11px] text-slate-400">
                Document incidental or associated neck findings (thyroid nodules, lymphadenopathy, jugular abnormalities, hematoma).
              </p>
            </div>
          </div>
        </div>

        {/* Add Form */}
        <div className="bg-[#0f172a] p-5 rounded-xl border border-slate-800 space-y-4">
          <h4 className="text-[11px] font-black text-slate-200 uppercase tracking-wider">Add Cervical Finding</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Finding Category</label>
              <select
                id="select-finding-type"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#0b101f] border border-slate-700 text-xs font-bold text-slate-100 focus:border-cyan-500 focus:outline-none"
              >
                {NON_CAROTID_FINDING_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Anatomical Side</label>
              <select
                id="select-finding-side"
                value={side}
                onChange={(e) => setSide(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg bg-[#0b101f] border border-slate-700 text-xs font-bold text-slate-100 focus:border-cyan-500 focus:outline-none"
              >
                <option value="right">Right Side</option>
                <option value="left">Left Side</option>
                <option value="bilateral">Bilateral</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Approx Size (mm)</label>
              <input
                type="number"
                id="input-finding-size"
                placeholder="e.g. 15"
                value={sizeMm}
                onChange={(e) => setSizeMm(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#0b101f] border border-slate-700 text-xs font-mono text-slate-100 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div className="flex items-end">
              <button
                type="button"
                id="btn-add-finding"
                onClick={handleAddFinding}
                className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-black rounded-lg shadow-md transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Add Finding</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Morphology & Detailed Comments</label>
            <input
              type="text"
              id="input-finding-comments"
              placeholder="e.g. Well-circumscribed hypoechoic solid nodule in thyroid right lobe..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#0b101f] border border-slate-700 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Existing Findings List */}
        <div className="space-y-3 pt-2">
          <h4 className="text-[11px] font-black text-slate-200 uppercase tracking-wider">
            Documented Non-Carotid Findings ({studyData.nonCarotidFindings.length})
          </h4>
          
          {studyData.nonCarotidFindings.length === 0 ? (
            <div className="p-8 bg-[#0f172a] border border-dashed border-slate-800 rounded-xl text-center text-xs text-slate-500">
              No non-carotid cervical or associated pathology findings recorded yet.
            </div>
          ) : (
            <div className="space-y-2">
              {studyData.nonCarotidFindings.map(f => (
                <div key={f.id} className="flex items-center justify-between p-3.5 bg-[#0f172a] border border-slate-800 rounded-xl shadow-md">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase font-mono border ${
                      f.side === 'right' ? 'bg-cyan-950/70 border-cyan-800 text-cyan-300' :
                      f.side === 'left' ? 'bg-indigo-950/70 border-indigo-800 text-indigo-300' : 'bg-purple-950/70 border-purple-800 text-purple-300'
                    }`}>
                      {f.side}
                    </span>
                    <div>
                      <h5 className="text-xs font-bold text-slate-100">{f.type} {f.sizeMm ? `(${f.sizeMm} mm)` : ''}</h5>
                      {f.comments && <p className="text-[11px] text-slate-400 mt-0.5">{f.comments}</p>}
                    </div>
                  </div>
                  <button
                    type="button"
                    id={`remove-finding-${f.id}`}
                    onClick={() => handleRemoveFinding(f.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-all"
                    title="Remove finding"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
