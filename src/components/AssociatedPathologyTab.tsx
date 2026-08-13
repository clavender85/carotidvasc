import React, { useState } from 'react';
import { StudyData, NonCarotidFinding } from '../types';
import { NON_CAROTID_FINDING_TYPES } from '../constants';
import { ShieldAlert, Plus, Trash2, Check, Activity } from 'lucide-react';

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
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-600" />
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Non-Carotid / Associated Cervical Pathology</h3>
              <p className="text-[11px] text-slate-500">Document incidental or associated neck findings (thyroid nodules, lymphadenopathy, jugular abnormalities, hematoma).</p>
            </div>
          </div>
        </div>

        {/* Add Form */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
          <h4 className="text-[11px] font-bold text-slate-700 uppercase">Add Cervical Finding</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Finding Category</label>
              <select
                id="select-finding-type"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-bold bg-white text-slate-800 focus:ring-2 focus:ring-cyan-500"
              >
                {NON_CAROTID_FINDING_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Anatomical Side</label>
              <select
                id="select-finding-side"
                value={side}
                onChange={(e) => setSide(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-bold bg-white text-slate-800 focus:ring-2 focus:ring-cyan-500"
              >
                <option value="right">Right Side</option>
                <option value="left">Left Side</option>
                <option value="bilateral">Bilateral</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Approx Size (mm)</label>
              <input
                type="number"
                id="input-finding-size"
                placeholder="e.g. 15"
                value={sizeMm}
                onChange={(e) => setSizeMm(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono bg-white focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div className="flex items-end">
              <button
                type="button"
                id="btn-add-finding"
                onClick={handleAddFinding}
                className="w-full flex items-center justify-center gap-1.5 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Finding</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Morphology & Detailed Comments</label>
            <input
              type="text"
              id="input-finding-comments"
              placeholder="e.g. Well-circumscribed hypoechoic solid nodule in thyroid right lobe..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        </div>

        {/* Existing Findings List */}
        <div className="space-y-3 pt-2">
          <h4 className="text-[11px] font-bold text-slate-700 uppercase">Documented Non-Carotid Findings ({studyData.nonCarotidFindings.length})</h4>
          
          {studyData.nonCarotidFindings.length === 0 ? (
            <div className="p-6 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-400">
              No non-carotid cervical or associated pathology findings recorded yet.
            </div>
          ) : (
            <div className="space-y-2">
              {studyData.nonCarotidFindings.map(f => (
                <div key={f.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      f.side === 'right' ? 'bg-cyan-100 text-cyan-800' :
                      f.side === 'left' ? 'bg-indigo-100 text-indigo-800' : 'bg-purple-100 text-purple-800'
                    }`}>
                      {f.side}
                    </span>
                    <div>
                      <h5 className="text-xs font-bold text-slate-800">{f.type} {f.sizeMm ? `(${f.sizeMm} mm)` : ''}</h5>
                      {f.comments && <p className="text-[11px] text-slate-600 mt-0.5">{f.comments}</p>}
                    </div>
                  </div>
                  <button
                    type="button"
                    id={`remove-finding-${f.id}`}
                    onClick={() => handleRemoveFinding(f.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
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
