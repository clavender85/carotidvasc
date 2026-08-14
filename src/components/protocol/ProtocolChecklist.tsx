import React from 'react';
import { StudyData } from '../../types';
import { generateScanChecklist, calculateScanCompleteness, ScanChecklistItem } from '../../utils/protocolEngine';
import { CheckCircle2, Circle, AlertCircle, Printer, ShieldCheck, Activity, Award, HelpCircle } from 'lucide-react';

interface ProtocolChecklistProps {
  studyData: StudyData;
  onPrintChecklist: () => void;
  onBackToProtocol?: () => void;
}

export const ProtocolChecklist: React.FC<ProtocolChecklistProps> = ({
  studyData,
  onPrintChecklist,
  onBackToProtocol
}) => {
  const checklist = generateScanChecklist(studyData);
  const completeness = calculateScanCompleteness(studyData);

  const preScanItems = checklist.filter(i => i.category === 'PRE_SCAN');
  const bmodeItems = checklist.filter(i => i.category === 'GRAYSCALE_COLOUR');
  const spectralItems = checklist.filter(i => i.category === 'SPECTRAL_DOPPLER');
  const abnItems = checklist.filter(i => i.category === 'ABNORMAL_PATHOLOGY');

  const protocolName = studyData.siteProtocol?.localProtocolName || 'Standard Carotid Duplex Protocol';

  return (
    <div id="protocol-scan-checklist" className="space-y-4">
      
      {/* Completeness Summary Banner */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-800 text-cyan-300 text-[10px] font-black uppercase">
                DYNAMIC SCAN CHECKLIST
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Protocol: {protocolName}
              </span>
            </div>
            <h2 className="text-sm sm:text-base font-black text-slate-100 mt-1">
              Active Examination Completeness & Quality Verification
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Circular / Progress Indicator */}
            <div className="flex items-center gap-2.5 bg-[#131d35] px-3.5 py-1.5 rounded-xl border border-slate-800">
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Completeness</span>
                <span className={`text-base font-black ${
                  completeness.percentage >= 90 ? 'text-emerald-400' : completeness.percentage >= 60 ? 'text-amber-400' : 'text-cyan-400'
                }`}>
                  {completeness.percentage}%
                </span>
              </div>
              <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-cyan-400 border border-slate-700">
                <Activity className="w-4 h-4" />
              </div>
            </div>

            <button
              type="button"
              id="btn-print-checklist-action"
              onClick={onPrintChecklist}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-extrabold transition-all cursor-pointer shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Checklist</span>
            </button>
          </div>
        </div>

        {/* Required Items Alert if incomplete */}
        {!completeness.isReadyForReport && (
          <div className="bg-amber-950/40 border border-amber-800/80 rounded-xl p-3 text-xs text-amber-200 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-300 font-bold">Missing Required Protocol Elements:</strong>
              <span className="text-slate-300 ml-1">
                {completeness.missingRequired.slice(0, 3).join(' • ')}
                {completeness.missingRequired.length > 3 && ` (+${completeness.missingRequired.length - 3} more)`}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Checklist Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Section 1: Before Scan */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-xs font-black text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              1. Before Scan — Identity & Indications
            </h3>
            <span className="text-[10px] text-slate-400">Pre-Scan Verification</span>
          </div>

          <div className="space-y-2">
            {preScanItems.map(item => (
              <div
                key={item.id}
                className={`p-2.5 rounded-xl border flex items-start gap-2.5 transition-all ${
                  item.isComplete
                    ? 'bg-emerald-950/20 border-emerald-900/40 text-slate-200'
                    : 'bg-[#131d35] border-slate-800 text-slate-300'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {item.isComplete ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-500" />
                  )}
                </div>
                <div className="min-w-0 flex-1 text-xs">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold">{item.label}</span>
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                      item.requirement === 'required' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {item.requirement}
                    </span>
                  </div>
                  {item.notes && (
                    <p className="text-[11px] text-slate-400 mt-0.5">{item.notes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Bilateral Grayscale & Colour */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-xs font-black text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-cyan-400" />
              2. Bilateral Grayscale & Colour Sweeps
            </h3>
            <span className="text-[10px] text-slate-400">Anatomical Survey</span>
          </div>

          <div className="space-y-2">
            {bmodeItems.map(item => (
              <div
                key={item.id}
                className={`p-2.5 rounded-xl border flex items-start gap-2.5 transition-all ${
                  item.isComplete
                    ? 'bg-emerald-950/20 border-emerald-900/40 text-slate-200'
                    : 'bg-[#131d35] border-slate-800 text-slate-300'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {item.isComplete ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-500" />
                  )}
                </div>
                <div className="min-w-0 flex-1 text-xs">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold">{item.label}</span>
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                      item.requirement === 'required' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {item.requirement}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Spectral Doppler Acquisition */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4 space-y-3 lg:col-span-2">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-xs font-black text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              3. Spectral Doppler Acquisition by Segment
            </h3>
            <span className="text-[10px] text-slate-400">
              {completeness.completedRequired} / {completeness.totalRequired} Required Segments Acquired
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {spectralItems.map(item => (
              <div
                key={item.id}
                className={`p-2.5 rounded-xl border flex items-start gap-2.5 transition-all ${
                  item.isComplete
                    ? 'bg-emerald-950/20 border-emerald-900/40 text-slate-200'
                    : 'bg-[#131d35] border-slate-800 text-slate-300'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {item.isComplete ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-500" />
                  )}
                </div>
                <div className="min-w-0 flex-1 text-xs">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold truncate">{item.label}</span>
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase shrink-0 ${
                      item.requirement === 'required'
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                        : item.requirement === 'recommended'
                        ? 'bg-blue-950 text-blue-300 border border-blue-800'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {item.requirement}
                    </span>
                  </div>
                  {item.notes && (
                    <p className={`text-[11px] mt-0.5 font-mono ${item.isComplete ? 'text-emerald-300' : 'text-slate-500'}`}>
                      {item.notes}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: If Abnormal / Pathology Checklist */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4 space-y-3 lg:col-span-2">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-xs font-black text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              4. Abnormal Pathology & Quality Verification
            </h3>
            <span className="text-[10px] text-slate-400">Plaque & Steal Evaluation</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {abnItems.map(item => (
              <div
                key={item.id}
                className={`p-2.5 rounded-xl border flex items-start gap-2.5 transition-all ${
                  item.isComplete
                    ? 'bg-emerald-950/20 border-emerald-900/40 text-slate-200'
                    : 'bg-[#131d35] border-slate-800 text-slate-300'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {item.isComplete ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-500" />
                  )}
                </div>
                <div className="min-w-0 flex-1 text-xs">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold">{item.label}</span>
                  </div>
                  {item.notes && (
                    <p className="text-[11px] text-slate-400 mt-0.5">{item.notes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
