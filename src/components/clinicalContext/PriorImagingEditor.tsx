import React, { useState } from 'react';
import { ClinicalContextItem, ContextOption } from '../../types/clinicalContext';
import { History, Plus, X, Calendar, FileText } from 'lucide-react';

interface PriorImagingEditorProps {
  items: ClinicalContextItem[];
  availableProcedures?: ContextOption[];
  onAddItem: (item: Omit<ClinicalContextItem, 'id'>) => void;
  onRemoveItem: (id: string) => void;
}

const COMMON_MODALITIES = [
  'Carotid Ultrasound',
  'CT Angiography (CTA)',
  'MR Angiography (MRA)',
  'Carotid Endarterectomy (CEA)',
  'Carotid Stenting (CAS)',
  'Brain CT / MRI',
  'Vascular Surgery',
  'Previous Ultrasound',
  'Other Imaging / Procedure',
];

export const PriorImagingEditor: React.FC<PriorImagingEditorProps> = ({
  items,
  availableProcedures,
  onAddItem,
  onRemoveItem,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [selectedModality, setSelectedModality] = useState(COMMON_MODALITIES[0]);
  const [customModality, setCustomModality] = useState('');
  const [date, setDate] = useState('');
  const [detail, setDetail] = useState('');

  const handleSaveItem = () => {
    const label = selectedModality === 'Other Imaging / Procedure' && customModality.trim()
      ? customModality.trim()
      : selectedModality;

    if (!label) return;

    onAddItem({
      category: 'prior_imaging',
      label,
      date: date.trim() || undefined,
      detail: detail.trim() || undefined,
      source: 'manual',
    });

    // Reset form
    setCustomModality('');
    setDate('');
    setDetail('');
    setIsAdding(false);
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <History className="w-3 h-3 text-cyan-400" />
          <span>Prior Imaging & Relevant Procedures</span>
          <span className="text-[10px] text-slate-500 font-mono">({items.length})</span>
        </label>
        {!isAdding && (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#0f172a] border border-slate-700 text-xs font-semibold text-cyan-400 hover:bg-slate-800 hover:text-cyan-300 cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            <span>Add Prior Record</span>
          </button>
        )}
      </div>

      {/* List of Existing Prior Items */}
      {items.length > 0 ? (
        <div className="space-y-1.5">
          {items.map(item => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-[#080d19] border border-slate-800 text-xs text-slate-200"
            >
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-cyan-300">{item.label}</span>
                {item.date && (
                  <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono border border-slate-700">
                    {item.date}
                  </span>
                )}
                {item.detail && (
                  <span className="text-[11px] text-slate-400 italic">
                    — {item.detail}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => onRemoveItem(item.id)}
                className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors cursor-pointer"
                title="Remove record"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        !isAdding && (
          <div className="text-[11px] text-slate-500 italic p-2 rounded-lg bg-[#080d19]/40 border border-slate-800/40">
            No prior imaging or surgical procedures recorded
          </div>
        )
      )}

      {/* Form to Add New Prior Record */}
      {isAdding && (
        <div className="p-3 rounded-lg bg-[#0f172a] border border-cyan-800/60 space-y-2.5 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                Modality / Procedure
              </label>
              <select
                value={selectedModality}
                onChange={(e) => setSelectedModality(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-md bg-[#080d19] border border-slate-700 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
              >
                {COMMON_MODALITIES.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                Date / Year
              </label>
              <input
                type="text"
                placeholder="e.g. 2025 or 12/06/2025"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-md bg-[#080d19] border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                Relevant Detail / Finding
              </label>
              <input
                type="text"
                placeholder="e.g. Right CEA with patch / 50-69% stenosis"
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-md bg-[#080d19] border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          {selectedModality === 'Other Imaging / Procedure' && (
            <div>
              <input
                type="text"
                placeholder="Specify custom modality or surgical procedure name..."
                value={customModality}
                onChange={(e) => setCustomModality(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-md bg-[#080d19] border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1 rounded-md text-xs font-semibold text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveItem}
              className="px-3 py-1 rounded-md bg-cyan-600 text-slate-950 text-xs font-bold hover:bg-cyan-500 cursor-pointer"
            >
              Save Record
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
