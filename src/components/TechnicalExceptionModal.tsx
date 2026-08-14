import React, { useState } from 'react';
import { ProtocolRequirement, ProtocolOverride, StudyData } from '../types';
import { SEGMENTS_META } from '../constants';
import { ShieldAlert, Check, X, AlertTriangle, FileText, UserCheck } from 'lucide-react';

interface TechnicalExceptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  requirement?: ProtocolRequirement | null;
  studyData: StudyData;
  onSaveOverride: (override: ProtocolOverride) => void;
}

export const TECHNICAL_REASONS = [
  { id: 'calcific_shadowing', label: 'Dense Calcific Acoustic Shadowing', description: 'Arterial calcification obscures acoustic window' },
  { id: 'high_bifurcation', label: 'High Cervical / Mandibular Bifurcation', description: 'Vessel extends superiorly behind angle of mandible' },
  { id: 'vessel_depth_habitus', label: 'Patient Body Habitus / Vessel Depth', description: 'Extreme depth limits high-frequency Doppler penetration' },
  { id: 'severe_tortuosity_kinking', label: 'Severe Tortuosity / Redundancy / Coiling', description: 'Complex 3D looping prevents reproducible Doppler angle' },
  { id: 'surgical_wound_dressing', label: 'Surgical Wound / Neck Dressing / Drain', description: 'Fresh incision, clips, or dressing prevents probe contact' },
  { id: 'patient_intolerance_immobility', label: 'Patient Distress / Involuntary Movement', description: 'Severe dyspnoea, tremor, pain or altered conscious state' },
  { id: 'poor_acoustic_window', label: 'Suboptimal General Acoustic Window', description: 'Poor tissue transmission or air artifact' },
  { id: 'other_clinical_limitation', label: 'Other Documented Technical Limitation', description: 'Custom clinical circumstance detailed below' },
];

export const TechnicalExceptionModal: React.FC<TechnicalExceptionModalProps> = ({
  isOpen,
  onClose,
  requirement,
  studyData,
  onSaveOverride
}) => {
  const [selectedReason, setSelectedReason] = useState<string>('calcific_shadowing');
  const [comment, setComment] = useState<string>('');
  const [sonographerName, setSonographerName] = useState<string>(studyData.sonographer || 'Vascular Sonographer');

  if (!isOpen || !requirement) return null;

  const targetSegmentName = requirement.targetSegmentId
    ? SEGMENTS_META[requirement.targetSegmentId]?.shortName || requirement.targetSegmentId
    : requirement.label;

  const handleConfirm = () => {
    const override: ProtocolOverride = {
      requirementId: requirement.id,
      segmentId: requirement.targetSegmentId,
      reason: selectedReason,
      comment: comment.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sonographer: sonographerName.trim()
    };
    onSaveOverride(override);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#0b1329] border border-cyan-700/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-4 bg-[#0f172a] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-950/80 border border-amber-600 flex items-center justify-center text-amber-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-black text-slate-100 uppercase tracking-wider">
                Record Technical Exception / Protocol Waiver
              </h3>
              <p className="text-[11px] text-slate-400">
                Target: <span className="text-cyan-300 font-bold">{targetSegmentName}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="p-3 bg-[#080e1e] rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
            <div className="font-bold text-slate-200">Protocol Requirement:</div>
            <div className="text-slate-400">{requirement.label}</div>
            <div className="text-[10px] text-amber-300/90 font-mono mt-1">
              Reason for mandate: {requirement.reason}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2">
              Select Primary Clinical Limitation:
            </label>
            <div className="space-y-1.5">
              {TECHNICAL_REASONS.map(reason => (
                <label
                  key={reason.id}
                  onClick={() => setSelectedReason(reason.id)}
                  className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer ${
                    selectedReason === reason.id
                      ? 'bg-cyan-950/60 border-cyan-500 text-cyan-200 shadow-sm'
                      : 'bg-[#0f172a] border-slate-800 text-slate-400 hover:bg-slate-800/80 hover:text-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="techReason"
                    checked={selectedReason === reason.id}
                    onChange={() => setSelectedReason(reason.id)}
                    className="mt-0.5 text-cyan-500"
                  />
                  <div className="flex-1">
                    <div className="text-xs font-bold text-slate-200">{reason.label}</div>
                    <div className="text-[10px] text-slate-400">{reason.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
              Specific Descriptive Notes & Acoustic Context:
            </label>
            <textarea
              rows={2}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="e.g. Dense circumferential calcification in proximal 15mm; distal lumen reconstituted with normal colour flow."
              className="w-full px-3 py-2 bg-[#0f172a] border border-slate-700 rounded-xl text-xs text-slate-200 focus:border-cyan-500 focus:outline-none placeholder:text-slate-600"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
              Documenting Sonographer:
            </label>
            <input
              type="text"
              value={sonographerName}
              onChange={(e) => setSonographerName(e.target.value)}
              className="w-full px-3 py-1.5 bg-[#0f172a] border border-slate-700 rounded-xl text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#0f172a] border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black text-xs shadow-md transition-all flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Confirm Technical Waiver</span>
          </button>
        </div>
      </div>
    </div>
  );
};
