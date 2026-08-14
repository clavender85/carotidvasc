import React from 'react';
import { StudyData, ClassificationSystem } from '../types';
import { CAROTID_INDICATIONS } from '../constants';
import { User, Calendar, FileText, ShieldAlert, Check, Activity, Sparkles } from 'lucide-react';

interface DemographicsTabProps {
  studyData: StudyData;
  onUpdateStudy: (updates: Partial<StudyData>) => void;
}

export const DemographicsTab: React.FC<DemographicsTabProps> = ({ studyData, onUpdateStudy }) => {
  const handleIndicationToggle = (ind: string) => {
    const current = [...studyData.clinicalIndications];
    const index = current.indexOf(ind);
    if (index >= 0) {
      current.splice(index, 1);
    } else {
      current.push(ind);
    }
    onUpdateStudy({ clinicalIndications: current });
  };

  return (
    <div id="demographics-tab-container" className="space-y-6 max-w-5xl mx-auto pb-12">
      
      {/* 1. Patient Context & Clinical Information */}
      <div className="bg-[#0b1329] border border-slate-800 rounded-xl shadow-lg p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <User className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-black text-slate-100 uppercase tracking-wider">
            Patient Demographics & Examination Profile
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Patient Full Name</label>
            <input
              type="text"
              id="input-patient-name"
              placeholder="e.g. Smith, John"
              value={studyData.patientName}
              onChange={(e) => onUpdateStudy({ patientName: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-[#0f172a] border border-slate-700 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">MRN / Accession ID</label>
            <input
              type="text"
              id="input-patient-id"
              placeholder="e.g. MRN-984210"
              value={studyData.patientId}
              onChange={(e) => onUpdateStudy({ patientId: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-[#0f172a] border border-slate-700 text-xs font-mono text-slate-100 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Exam Date</label>
            <input
              type="date"
              id="input-exam-date"
              value={studyData.examDate}
              onChange={(e) => onUpdateStudy({ examDate: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-[#0f172a] border border-slate-700 text-xs font-mono text-slate-100 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Reporting Sonographer</label>
            <input
              type="text"
              id="input-sonographer"
              placeholder="e.g. Jane Doe, AMS"
              value={studyData.sonographer}
              onChange={(e) => onUpdateStudy({ sonographer: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-[#0f172a] border border-slate-700 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Interpreting Physician</label>
            <input
              type="text"
              id="input-physician"
              placeholder="e.g. Dr. Robert Vance, MD"
              value={studyData.interpretingPhysician}
              onChange={(e) => onUpdateStudy({ interpretingPhysician: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-[#0f172a] border border-slate-700 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Diagnostic Consensus Protocol</label>
            <select
              id="select-classification-system"
              value={studyData.classificationSystem}
              onChange={(e) => onUpdateStudy({ classificationSystem: e.target.value as ClassificationSystem })}
              className="w-full px-3 py-2 rounded-lg bg-[#0f172a] border border-cyan-700 text-xs font-bold text-cyan-300 focus:border-cyan-400 focus:outline-none"
            >
              <option value="ASUM_2021">ASUM 2021 Guidelines</option>
              <option value="MODIFIED_SRU_2021">Modified SRU / IAC Standard</option>
              <option value="SRU_2003">SRU Consensus (2003)</option>
              <option value="NASCET_INDEX">Sonographic NASCET Index</option>
              <option value="CUSTOM">Custom Laboratory Protocol</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. Clinical Indications Checklist */}
      <div className="bg-[#0b1329] border border-slate-800 rounded-xl shadow-lg p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 gap-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-black text-slate-100 uppercase tracking-wider">
              Clinical Indications & Neurological Presentation
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase">Symptomatic:</label>
            <select
              id="select-symptomatic-status"
              value={studyData.symptomatic ? 'yes' : 'no'}
              onChange={(e) => onUpdateStudy({ symptomatic: e.target.value === 'yes' })}
              className="px-2.5 py-1 rounded bg-[#0f172a] border border-slate-700 text-xs font-bold text-slate-200"
            >
              <option value="no">Asymptomatic</option>
              <option value="yes">Symptomatic</option>
            </select>
            {studyData.symptomatic && (
              <select
                id="select-symptom-side"
                value={studyData.symptomSide}
                onChange={(e) => onUpdateStudy({ symptomSide: e.target.value as any })}
                className="px-2.5 py-1 rounded bg-amber-950/70 border border-amber-700 text-xs font-bold text-amber-300"
              >
                <option value="none">Side Unspecified</option>
                <option value="right">Right-Sided Symptoms</option>
                <option value="left">Left-Sided Symptoms</option>
                <option value="bilateral">Bilateral Symptoms</option>
              </select>
            )}
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-300 uppercase mb-2">
            Select Indications for Carotid Doppler Examination:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {CAROTID_INDICATIONS.map(ind => {
              const isSelected = studyData.clinicalIndications.includes(ind);
              return (
                <button
                  key={ind}
                  type="button"
                  id={`indication-btn-${ind.replace(/[\/\s]+/g, '-').toLowerCase()}`}
                  onClick={() => handleIndicationToggle(ind)}
                  className={`p-2.5 rounded-lg border text-left text-[11px] font-medium flex items-start gap-2.5 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-950/40 border-cyan-500 text-cyan-200 shadow-md shadow-cyan-950/30'
                      : 'bg-[#0f172a] border-slate-800 text-slate-300 hover:bg-[#152038]'
                  }`}
                >
                  <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 mt-0.5 border ${
                    isSelected ? 'bg-cyan-600 border-cyan-600 text-slate-950' : 'border-slate-700 bg-[#0b101f]'
                  }`}>
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span className="leading-tight">{ind}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="space-y-3">
            <label className="block text-[11px] font-bold text-slate-300 uppercase">
              Vascular History & Prior Procedures
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                'Prior carotid surgery',
                'Prior carotid stent',
                'Prior stroke / TIA',
                'Previous carotid ultrasound'
              ].map(item => {
                const isIncluded = studyData.vascularHistory.includes(item);
                const handleToggleHistory = () => {
                  let currentArr = studyData.vascularHistory ? studyData.vascularHistory.split(', ').filter(Boolean) : [];
                  if (isIncluded) {
                    currentArr = currentArr.filter(x => x !== item);
                  } else {
                    currentArr.push(item);
                  }
                  onUpdateStudy({ vascularHistory: currentArr.join(', ') });
                };
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={handleToggleHistory}
                    className={`p-2 rounded-lg border text-left text-[11px] font-medium flex items-center gap-2 transition-all cursor-pointer ${
                      isIncluded
                        ? 'bg-cyan-950/40 border-cyan-500 text-cyan-200'
                        : 'bg-[#0f172a] border-slate-800 text-slate-300 hover:bg-[#152038]'
                    }`}
                  >
                    <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${
                      isIncluded ? 'bg-cyan-600 border-cyan-600 text-slate-950' : 'border-slate-700 bg-[#0b101f]'
                    }`}>
                      {isIncluded && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span>{item}</span>
                  </button>
                );
              })}
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 mt-2">
                Additional Vascular History & Risk Factors Notes
              </label>
              <textarea
                id="textarea-vascular-history"
                rows={2}
                placeholder="e.g. Hypertension, hyperlipidemia, smoking, diabetes..."
                value={studyData.vascularHistory}
                onChange={(e) => onUpdateStudy({ vascularHistory: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[#0f172a] border border-slate-700 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                Study Comments & Technical Limitations
              </label>
              <textarea
                id="textarea-study-comments"
                rows={3}
                placeholder="Overall study notes or limitations..."
                value={studyData.studyComments}
                onChange={(e) => onUpdateStudy({ studyComments: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[#0f172a] border border-slate-700 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-[#0f172a] rounded-lg border border-slate-800">
              <div>
                <span className="text-xs font-bold text-slate-200 block">Left Brachiocephalic Trunk Variant (BCT Anatomy)</span>
                <span className="text-[10px] text-slate-400">Document atypical left common carotid origin direct from arch.</span>
              </div>
              <button
                type="button"
                id="toggle-bct-variant"
                onClick={() => onUpdateStudy({ variantLeftBct: !studyData.variantLeftBct })}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  studyData.variantLeftBct
                    ? 'bg-cyan-600 text-slate-950 font-black shadow-md'
                    : 'bg-[#0b101f] border border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {studyData.variantLeftBct ? 'Variant Active' : 'Standard Anatomy'}
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
