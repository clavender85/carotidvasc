import React from 'react';
import { StudyData } from '../../types';
import { BookOpen, FileCheck, Printer, CheckSquare, Layers, ShieldCheck, MapPin, Award } from 'lucide-react';

interface ProtocolHeaderProps {
  studyData: StudyData;
  activeView: 'protocol' | 'checklist';
  onToggleView: (view: 'protocol' | 'checklist') => void;
  onPrintProtocol: () => void;
  onPrintChecklist: () => void;
}

export const ProtocolHeader: React.FC<ProtocolHeaderProps> = ({
  studyData,
  activeView,
  onToggleView,
  onPrintProtocol,
  onPrintChecklist
}) => {
  const protocolConfig = studyData.siteProtocol;
  const protocolName = protocolConfig?.localProtocolName || 'Standard Carotid Duplex Protocol';
  const criteriaName = studyData.classificationSystem === 'ASUM_2021'
    ? 'ASUM 2021'
    : (studyData.classificationSystem === 'IAC_MODIFIED_SRU_2023' || studyData.classificationSystem === 'MODIFIED_SRU_2021')
    ? 'IAC Modified SRU 2023'
    : studyData.classificationSystem === 'SRU_2003'
    ? 'SRU 2003 (Legacy)'
    : studyData.classificationSystem === 'UK_JOINT'
    ? 'UK Joint Recommendations'
    : 'Custom Lab Criteria';

  const orgSite = protocolConfig?.organisation && protocolConfig?.site
    ? `${protocolConfig.organisation} • ${protocolConfig.site}`
    : (protocolConfig?.organisation || protocolConfig?.site || 'Generic / Not configured');

  return (
    <div id="protocol-header-container" className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
      {/* Top Title & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 shadow-sm">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black text-slate-100 tracking-tight flex items-center gap-2">
              CAROTID ULTRASOUND PROTOCOL
              <span className="px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-700 text-cyan-300 text-[10px] font-bold uppercase tracking-wider">
                Vascular Laboratory Specification
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Standard examination framework, diagnostic criteria and site-specific instructions
            </p>
          </div>
        </div>

        {/* View Switches & Print Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            id="btn-toggle-protocol-view"
            onClick={() => onToggleView(activeView === 'protocol' ? 'checklist' : 'protocol')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer ${
              activeView === 'checklist'
                ? 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 font-extrabold shadow-cyan-500/20'
                : 'bg-[#1e293b] border border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white'
            }`}
          >
            {activeView === 'checklist' ? (
              <>
                <Layers className="w-4 h-4" />
                <span>View Full Protocol Spec</span>
              </>
            ) : (
              <>
                <CheckSquare className="w-4 h-4 text-cyan-400" />
                <span>View as Scan Checklist</span>
              </>
            )}
          </button>

          {activeView === 'protocol' ? (
            <button
              type="button"
              id="btn-print-protocol"
              onClick={onPrintProtocol}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1e293b] border border-slate-700 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all shadow-sm cursor-pointer"
              title="Print standard protocol specification document"
            >
              <Printer className="w-3.5 h-3.5 text-slate-400" />
              <span>Print Protocol</span>
            </button>
          ) : (
            <button
              type="button"
              id="btn-print-checklist"
              onClick={onPrintChecklist}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1e293b] border border-slate-700 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all shadow-sm cursor-pointer"
              title="Print acquisition scan checklist"
            >
              <Printer className="w-3.5 h-3.5 text-slate-400" />
              <span>Print Checklist</span>
            </button>
          )}
        </div>
      </div>

      {/* 4 Compact Status Badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 pt-2 border-t border-slate-800/80">
        
        {/* 1. Active Site Protocol */}
        <div className="bg-[#131d35] border border-slate-800 rounded-xl p-2.5 flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-950/70 border border-cyan-800/50 text-cyan-400 shrink-0">
            <Award className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">
              Active Site Protocol
            </span>
            <span className="text-xs font-black text-slate-100 truncate block mt-0.5" title={protocolName}>
              {protocolName}
            </span>
          </div>
        </div>

        {/* 2. Active Stenosis Criteria */}
        <div className="bg-[#131d35] border border-slate-800 rounded-xl p-2.5 flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-indigo-950/70 border border-indigo-800/50 text-indigo-400 shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">
              Active Stenosis Criteria
            </span>
            <span className="text-xs font-black text-indigo-300 truncate block mt-0.5" title={criteriaName}>
              {criteriaName}
            </span>
          </div>
        </div>

        {/* 3. Diameter Method */}
        <div className="bg-[#131d35] border border-slate-800 rounded-xl p-2.5 flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-emerald-950/70 border border-emerald-800/50 text-emerald-400 shrink-0">
            <FileCheck className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">
              Diameter Method
            </span>
            <span className="text-xs font-black text-emerald-300 truncate block mt-0.5">
              NASCET Method
            </span>
          </div>
        </div>

        {/* 4. Site / Organisation */}
        <div className="bg-[#131d35] border border-slate-800 rounded-xl p-2.5 flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-amber-950/70 border border-amber-800/50 text-amber-400 shrink-0">
            <MapPin className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">
              Site / Department
            </span>
            <span className="text-xs font-black text-amber-300 truncate block mt-0.5" title={orgSite}>
              {orgSite}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
