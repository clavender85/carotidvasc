import React from 'react';
import { StudyData, ClassificationSystem } from '../types';
import { CAROTID_INDICATIONS } from '../constants';
import { User, Calendar, FileText, ShieldAlert, Check } from 'lucide-react';

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
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <User className="w-4 h-4 text-cyan-600" />
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Patient Demographics & Exam Details</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Patient Name</label>
            <input
              type="text"
              id="input-patient-name"
              placeholder="e.g. Smith, John"
              value={studyData.patientName}
              onChange={(e) => onUpdateStudy({ patientName: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">MRN / Chart ID</label>
            <input
              type="text"
              id="input-patient-id"
              placeholder="e.g. MRN-984210"
              value={studyData.patientId}
              onChange={(e) => onUpdateStudy({ patientId: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Exam Date</label>
            <input
              type="date"
              id="input-exam-date"
              value={studyData.examDate}
              onChange={(e) => onUpdateStudy({ examDate: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Reporting Sonographer</label>
            <input
              type="text"
              id="input-sonographer"
              placeholder="e.g. Jane Doe, DMS"
              value={studyData.sonographer}
              onChange={(e) => onUpdateStudy({ sonographer: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Interpreting Physician</label>
            <input
              type="text"
              id="input-physician"
              placeholder="e.g. Dr. Robert Vance, MD"
              value={studyData.interpretingPhysician}
              onChange={(e) => onUpdateStudy({ interpretingPhysician: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Active Criteria Protocol</label>
            <select
              id="select-classification-system"
              value={studyData.classificationSystem}
              onChange={(e) => onUpdateStudy({ classificationSystem: e.target.value as ClassificationSystem })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-bold text-cyan-900 bg-cyan-50/50 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            >
              <option value="ASUM_2021">ASUM 2021 Guidelines</option>
              <option value="MODIFIED_SRU_2021">Modified SRU / IAC</option>
              <option value="SRU_2003">SRU Consensus (2003)</option>
              <option value="NASCET_INDEX">Sonographic NASCET Index</option>
              <option value="CUSTOM">Custom Laboratory Protocol</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. Clinical Indications Checklist */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Clinical Indications & Presentation</h3>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-[11px] font-bold text-slate-600">Symptomatic Status:</label>
            <select
              id="select-symptomatic-status"
              value={studyData.symptomatic ? 'yes' : 'no'}
              onChange={(e) => onUpdateStudy({ symptomatic: e.target.value === 'yes' })}
              className="px-2.5 py-1 rounded border border-slate-200 text-xs font-bold bg-slate-50 text-slate-700"
            >
              <option value="no">Asymptomatic</option>
              <option value="yes">Symptomatic</option>
            </select>
            {studyData.symptomatic && (
              <select
                id="select-symptom-side"
                value={studyData.symptomSide}
                onChange={(e) => onUpdateStudy({ symptomSide: e.target.value as any })}
                className="px-2.5 py-1 rounded border border-slate-200 text-xs font-bold bg-amber-50 text-amber-800"
              >
                <option value="none">Side Unspecified</option>
                <option value="right">Right Side Symptoms</option>
                <option value="left">Left Side Symptoms</option>
                <option value="bilateral">Bilateral Symptoms</option>
              </select>
            )}
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-2">Select Indications for Carotid Doppler Examination:</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {CAROTID_INDICATIONS.map(ind => {
              const isSelected = studyData.clinicalIndications.includes(ind);
              return (
                <button
                  key={ind}
                  type="button"
                  id={`indication-btn-${ind.replace(/[\/\s]+/g, '-').toLowerCase()}`}
                  onClick={() => handleIndicationToggle(ind)}
                  className={`p-2.5 rounded-lg border text-left text-[11px] font-medium flex items-start gap-2 transition-all ${
                    isSelected
                      ? 'bg-cyan-50/80 border-cyan-400 text-cyan-900 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 mt-0.5 border ${
                    isSelected ? 'bg-cyan-600 border-cyan-600 text-white' : 'border-slate-300 bg-white'
                  }`}>
                    {isSelected && <Check className="w-3 h-3" />}
                  </div>
                  <span className="leading-tight">{ind}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="space-y-3">
            <label className="block text-[11px] font-bold text-slate-700">Vascular History & Prior Procedures</label>
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
                    className={`p-2 rounded-lg border text-left text-[11px] font-medium flex items-center gap-2 transition-all ${
                      isIncluded ? 'bg-cyan-50 border-cyan-400 text-cyan-900' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${
                      isIncluded ? 'bg-cyan-600 border-cyan-600 text-white' : 'border-slate-300'
                    }`}>
                      {isIncluded && <Check className="w-3 h-3" />}
                    </div>
                    <span>{item}</span>
                  </button>
                );
              })}
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-600 mb-1 mt-2">Additional Vascular History & Risk Factors Notes</label>
              <textarea
                id="textarea-vascular-history"
                rows={2}
                placeholder="e.g. Hypertension, hyperlipidemia, smoking, diabetes..."
                value={studyData.vascularHistory}
                onChange={(e) => onUpdateStudy({ vascularHistory: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Study Comments & Technical Limitations</label>
              <textarea
                id="textarea-study-comments"
                rows={3}
                placeholder="Overall study notes or limitations..."
                value={studyData.studyComments}
                onChange={(e) => onUpdateStudy({ studyComments: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div>
                <span className="text-xs font-bold text-slate-800 block">Left Brachiocephalic Trunk Variant (BCT Anatomy)</span>
                <span className="text-[10px] text-slate-500">Document atypical left common carotid origin direct from arch.</span>
              </div>
              <button
                type="button"
                id="toggle-bct-variant"
                onClick={() => onUpdateStudy({ variantLeftBct: !studyData.variantLeftBct })}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  studyData.variantLeftBct
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
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
