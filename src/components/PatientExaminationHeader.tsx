import React, { useState } from 'react';
import { StudyData, ClassificationSystem, MainTab } from '../types';
import { User, Calendar, Edit3, ChevronDown, ChevronUp, History, Shield, Check, Clock, Stethoscope } from 'lucide-react';

interface PatientExaminationHeaderProps {
  studyData: StudyData;
  onUpdateStudy: (updates: Partial<StudyData>) => void;
  onNavigateTab: (tab: MainTab) => void;
}

export const PatientExaminationHeader: React.FC<PatientExaminationHeaderProps> = ({
  studyData,
  onUpdateStudy,
  onNavigateTab,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const getSymptomBadge = () => {
    if (!studyData.symptomatic) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase bg-emerald-950/60 border border-emerald-800/80 text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          Asymptomatic
        </span>
      );
    }
    const sideText =
      studyData.symptomSide === 'right'
        ? 'Right'
        : studyData.symptomSide === 'left'
        ? 'Left'
        : studyData.symptomSide === 'bilateral'
        ? 'Bilateral'
        : 'Unspecified';
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase bg-amber-950/60 border border-amber-800/80 text-amber-300">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
        Symptomatic ({sideText})
      </span>
    );
  };

  const hasPrior = Boolean(studyData.priorExam?.hasPriorExam);

  return (
    <div
      id="patient-examination-header-card"
      className="bg-[#0b1329] border border-slate-800 rounded-xl shadow-md overflow-hidden transition-all"
    >
      {/* Top Compact Summary Bar */}
      <div className="p-3.5 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#0d162f]">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-extrabold text-slate-100 tracking-tight">
                  {studyData.patientName || <span className="text-slate-400 italic">Unassigned Patient</span>}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {studyData.patientId ? `MRN: ${studyData.patientId}` : 'MRN: Unassigned'}
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-400 flex-wrap mt-0.5">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  {studyData.examDate || new Date().toISOString().split('T')[0]}
                </span>
                <span>•</span>
                <span>Protocol: <strong className="text-cyan-400">{studyData.classificationSystem.replace('_', ' ')}</strong></span>
                {studyData.sonographer && (
                  <>
                    <span>•</span>
                    <span>Sono: <strong className="text-slate-300">{studyData.sonographer}</strong></span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Badges */}
          <div className="flex items-center gap-2 ml-auto sm:ml-2 flex-wrap">
            {getSymptomBadge()}

            {/* Prior Exam Badge / Button */}
            {hasPrior ? (
              <button
                type="button"
                id="btn-nav-to-prior-exam"
                onClick={() => onNavigateTab('previous')}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase bg-cyan-950/60 border border-cyan-700 text-cyan-300 hover:bg-cyan-900/80 transition-all cursor-pointer shadow-sm"
                title="View prior study comparison"
              >
                <History className="w-3 h-3 text-cyan-400" />
                <span>Prior: {studyData.priorExam?.examDate || 'Documented'} ↗</span>
              </button>
            ) : (
              <button
                type="button"
                id="btn-add-prior-exam"
                onClick={() => onNavigateTab('previous')}
                className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold text-slate-400 hover:text-cyan-300 bg-slate-900/60 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer"
              >
                <History className="w-3 h-3" />
                <span>+ Compare Prior Study</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Toggle Button */}
        <div className="flex items-center gap-2 self-end md:self-center shrink-0">
          <button
            type="button"
            id="toggle-edit-patient-details"
            onClick={() => setIsExpanded(!isExpanded)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
              isExpanded
                ? 'bg-cyan-600 text-slate-950 border-cyan-500 font-extrabold'
                : 'bg-[#0f172a] text-slate-300 border-slate-700 hover:bg-[#1e293b] hover:text-white'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isExpanded ? 'Hide Edit Panel' : 'Edit Patient & Exam'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expanded Inline Editing Form */}
      {isExpanded && (
        <div className="p-4 sm:p-5 bg-[#090f20] border-t border-slate-800 space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
            <span className="text-[10px] font-extrabold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5" /> Patient Demographics & Examination Metadata
            </span>
            <span className="text-[10px] text-slate-400">All fields auto-save immediately to structured report</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-300 uppercase mb-1">Patient Full Name</label>
              <input
                type="text"
                id="input-scan-patient-name"
                placeholder="e.g. Smith, John"
                value={studyData.patientName}
                onChange={(e) => onUpdateStudy({ patientName: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg bg-[#0f172a] border border-slate-700 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-300 uppercase mb-1">MRN / Accession ID</label>
              <input
                type="text"
                id="input-scan-patient-id"
                placeholder="e.g. MRN-984210"
                value={studyData.patientId}
                onChange={(e) => onUpdateStudy({ patientId: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg bg-[#0f172a] border border-slate-700 text-xs font-mono text-slate-100 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-300 uppercase mb-1">Exam Date</label>
              <input
                type="date"
                id="input-scan-exam-date"
                value={studyData.examDate}
                onChange={(e) => onUpdateStudy({ examDate: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg bg-[#0f172a] border border-slate-700 text-xs font-mono text-slate-100 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-300 uppercase mb-1">Reporting Sonographer</label>
              <input
                type="text"
                id="input-scan-sonographer"
                placeholder="e.g. Jane Doe, AMS"
                value={studyData.sonographer}
                onChange={(e) => onUpdateStudy({ sonographer: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg bg-[#0f172a] border border-slate-700 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-300 uppercase mb-1">Interpreting Physician</label>
              <input
                type="text"
                id="input-scan-physician"
                placeholder="e.g. Dr. R. Vance, MD"
                value={studyData.interpretingPhysician}
                onChange={(e) => onUpdateStudy({ interpretingPhysician: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg bg-[#0f172a] border border-slate-700 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-300 uppercase mb-1">Diagnostic Protocol</label>
              <select
                id="select-scan-classification-system"
                value={studyData.classificationSystem}
                onChange={(e) => onUpdateStudy({ classificationSystem: e.target.value as ClassificationSystem })}
                className="w-full px-2.5 py-1.5 rounded-lg bg-[#0f172a] border border-cyan-700 text-xs font-bold text-cyan-300 focus:border-cyan-400 focus:outline-none"
              >
                <option value="ASUM_2021">ASUM 2021 Guidelines</option>
                <option value="MODIFIED_SRU_2021">Modified SRU / IAC</option>
                <option value="SRU_2003">SRU Consensus (2003)</option>
                <option value="NASCET_INDEX">Sonographic NASCET</option>
                <option value="CUSTOM">Custom Laboratory</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
