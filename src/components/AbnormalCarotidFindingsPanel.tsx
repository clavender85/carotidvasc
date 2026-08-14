import React, { useState } from 'react';
import { StudyData } from '../types';
import { generateSideSummary, checkSubclavianSteal, calculateIcaCcaRatio } from '../utils/calculations';
import { ShieldAlert, AlertTriangle, ChevronDown, ChevronUp, Activity, CheckCircle2, AlertCircle, Info, Sparkles, Layers } from 'lucide-react';

interface AbnormalCarotidFindingsPanelProps {
  studyData: StudyData;
  onSelectSegment?: (id: string, isMulti: boolean) => void;
  onNavigateTab?: (tab: 'assessment' | 'nascet' | 'plaque' | 'associated' | 'report') => void;
}

export const AbnormalCarotidFindingsPanel: React.FC<AbnormalCarotidFindingsPanelProps> = ({
  studyData,
  onSelectSegment,
  onNavigateTab,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const rightSummary = generateSideSummary('right', studyData);
  const leftSummary = generateSideSummary('left', studyData);

  const rightSteal = checkSubclavianSteal('right', studyData);
  const leftSteal = checkSubclavianSteal('left', studyData);

  const rightRatio = calculateIcaCcaRatio('right', studyData);
  const leftRatio = calculateIcaCcaRatio('left', studyData);

  // Determine abnormality states
  const hasRightAbnormality =
    rightSummary.highestIcaPsv !== null &&
    (rightSummary.highestIcaPsv >= 125 ||
      rightSummary.suggestedClassification.includes('Moderate') ||
      rightSummary.suggestedClassification.includes('Severe') ||
      rightSummary.suggestedClassification.includes('Occlusion') ||
      rightSummary.plaqueMorphology !== null ||
      rightSteal);

  const hasLeftAbnormality =
    leftSummary.highestIcaPsv !== null &&
    (leftSummary.highestIcaPsv >= 125 ||
      leftSummary.suggestedClassification.includes('Moderate') ||
      leftSummary.suggestedClassification.includes('Severe') ||
      leftSummary.suggestedClassification.includes('Occlusion') ||
      leftSummary.plaqueMorphology !== null ||
      leftSteal);

  const hasNonCarotidFindings = studyData.nonCarotidFindings.length > 0;
  const hasCriticalAlert = rightSteal || leftSteal ||
    (rightSummary.highestIcaPsv !== null && rightSummary.highestIcaPsv >= 230) ||
    (leftSummary.highestIcaPsv !== null && leftSummary.highestIcaPsv >= 230);

  const getSeverityBadgeClass = (category: string) => {
    if (category.includes('Severe') || category.includes('80') || category.includes('70')) {
      return 'bg-rose-950/80 border-rose-700 text-rose-300';
    }
    if (category.includes('Moderate') || category.includes('50')) {
      return 'bg-orange-950/80 border-orange-700 text-orange-300';
    }
    if (category.includes('Mild') || category.includes('<50')) {
      return 'bg-amber-950/80 border-amber-700 text-amber-300';
    }
    if (category.includes('Occlusion') || category.includes('OCC')) {
      return 'bg-red-950/90 border-red-600 text-red-200';
    }
    if (category.includes('Normal')) {
      return 'bg-emerald-950/80 border-emerald-700 text-emerald-300';
    }
    return 'bg-slate-800 border-slate-700 text-slate-400';
  };

  return (
    <div
      id="abnormal-findings-persistent-panel"
      className="bg-[#0b1329] border border-slate-800 rounded-xl overflow-hidden shadow-lg transition-all"
    >
      {/* Header bar */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-4 py-3 bg-[#0f172a] hover:bg-[#131c33] border-b border-slate-800/80 flex items-center justify-between cursor-pointer select-none transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center border ${
            hasCriticalAlert
              ? 'bg-rose-950/60 border-rose-700 text-rose-400 animate-pulse'
              : hasRightAbnormality || hasLeftAbnormality
              ? 'bg-amber-950/60 border-amber-700 text-amber-400'
              : 'bg-cyan-950/60 border-cyan-800 text-cyan-400'
          }`}>
            {hasCriticalAlert ? (
              <ShieldAlert className="w-4 h-4" />
            ) : hasRightAbnormality || hasLeftAbnormality ? (
              <AlertCircle className="w-4 h-4" />
            ) : (
              <Activity className="w-4 h-4" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-100">
                Active Findings & Hemodynamic Summary
              </span>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold border border-slate-700">
                {studyData.classificationSystem.replace('_', ' ')}
              </span>
              {hasCriticalAlert && (
                <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded bg-rose-900/60 border border-rose-700 text-rose-300">
                  Critical Hemodynamics
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono">
            <span className="text-slate-400">R ICA:</span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${getSeverityBadgeClass(rightSummary.suggestedClassification)}`}>
              {rightSummary.highestIcaPsv !== null ? `${rightSummary.highestIcaPsv} cm/s` : '—'}
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">L ICA:</span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${getSeverityBadgeClass(leftSummary.suggestedClassification)}`}>
              {leftSummary.highestIcaPsv !== null ? `${leftSummary.highestIcaPsv} cm/s` : '—'}
            </span>
          </div>

          <button
            type="button"
            className="p-1 text-slate-400 hover:text-white transition-colors"
            title={isExpanded ? 'Collapse findings' : 'Expand findings'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded body content */}
      {isExpanded && (
        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          
          {/* ================= RIGHT CAROTID SUMMARY ================= */}
          <div className="bg-[#10192e] border border-slate-800 rounded-xl p-3.5 space-y-2.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span className="font-extrabold uppercase text-[11px] text-cyan-300">Right Carotid System</span>
                </div>
                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${getSeverityBadgeClass(rightSummary.suggestedClassification)}`}>
                  {rightSummary.suggestedClassification}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 text-center font-mono">
                <div className="bg-[#0b101f] p-2 rounded-lg border border-slate-800/80">
                  <span className="text-[8.5px] uppercase font-sans text-slate-400 block font-bold">Peak PSV</span>
                  <span className={`text-sm font-black ${rightSummary.highestIcaPsv && rightSummary.highestIcaPsv >= 125 ? 'text-amber-400' : 'text-slate-100'}`}>
                    {rightSummary.highestIcaPsv !== null ? `${rightSummary.highestIcaPsv}` : '—'}
                  </span>
                  <span className="text-[7.5px] text-slate-500 font-sans block">cm/s</span>
                </div>

                <div className="bg-[#0b101f] p-2 rounded-lg border border-slate-800/80">
                  <span className="text-[8.5px] uppercase font-sans text-slate-400 block font-bold">EDV</span>
                  <span className="text-sm font-black text-slate-200">
                    {rightSummary.correspondingIcaEdv !== null ? `${rightSummary.correspondingIcaEdv}` : '—'}
                  </span>
                  <span className="text-[7.5px] text-slate-500 font-sans block">cm/s</span>
                </div>

                <div className="bg-[#0b101f] p-2 rounded-lg border border-slate-800/80">
                  <span className="text-[8.5px] uppercase font-sans text-slate-400 block font-bold">ICA/CCA</span>
                  <span className="text-sm font-black text-cyan-400">
                    {rightRatio ? rightRatio.ratio.toFixed(2) : '—'}
                  </span>
                  <span className="text-[7.5px] text-slate-500 font-sans block">ratio</span>
                </div>
              </div>

              <div className="mt-2.5 space-y-1 text-[10.5px] text-slate-300">
                <div className="flex justify-between items-center py-0.5 border-t border-slate-800/40">
                  <span className="text-slate-400">Vertebral Flow:</span>
                  <span className={`font-bold font-mono ${rightSteal ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
                    {rightSummary.vertebralFlowDirection.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between items-center py-0.5 border-t border-slate-800/40">
                  <span className="text-slate-400">Plaque Burden:</span>
                  <span className="text-slate-200 font-medium truncate max-w-[140px]">
                    {rightSummary.maxPlaqueLocation || 'None detected'}
                  </span>
                </div>
              </div>
            </div>

            {rightSteal && (
              <div className="p-2 bg-rose-950/60 border border-rose-800 rounded-lg text-[10px] text-rose-300 font-bold flex items-center gap-1.5 mt-2">
                <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-rose-400 animate-pulse" />
                <span>Suspected Subclavian Steal</span>
              </div>
            )}
          </div>

          {/* ================= LEFT CAROTID SUMMARY ================= */}
          <div className="bg-[#10192e] border border-slate-800 rounded-xl p-3.5 space-y-2.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span className="font-extrabold uppercase text-[11px] text-cyan-300">Left Carotid System</span>
                </div>
                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${getSeverityBadgeClass(leftSummary.suggestedClassification)}`}>
                  {leftSummary.suggestedClassification}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 text-center font-mono">
                <div className="bg-[#0b101f] p-2 rounded-lg border border-slate-800/80">
                  <span className="text-[8.5px] uppercase font-sans text-slate-400 block font-bold">Peak PSV</span>
                  <span className={`text-sm font-black ${leftSummary.highestIcaPsv && leftSummary.highestIcaPsv >= 125 ? 'text-amber-400' : 'text-slate-100'}`}>
                    {leftSummary.highestIcaPsv !== null ? `${leftSummary.highestIcaPsv}` : '—'}
                  </span>
                  <span className="text-[7.5px] text-slate-500 font-sans block">cm/s</span>
                </div>

                <div className="bg-[#0b101f] p-2 rounded-lg border border-slate-800/80">
                  <span className="text-[8.5px] uppercase font-sans text-slate-400 block font-bold">EDV</span>
                  <span className="text-sm font-black text-slate-200">
                    {leftSummary.correspondingIcaEdv !== null ? `${leftSummary.correspondingIcaEdv}` : '—'}
                  </span>
                  <span className="text-[7.5px] text-slate-500 font-sans block">cm/s</span>
                </div>

                <div className="bg-[#0b101f] p-2 rounded-lg border border-slate-800/80">
                  <span className="text-[8.5px] uppercase font-sans text-slate-400 block font-bold">ICA/CCA</span>
                  <span className="text-sm font-black text-cyan-400">
                    {leftRatio ? leftRatio.ratio.toFixed(2) : '—'}
                  </span>
                  <span className="text-[7.5px] text-slate-500 font-sans block">ratio</span>
                </div>
              </div>

              <div className="mt-2.5 space-y-1 text-[10.5px] text-slate-300">
                <div className="flex justify-between items-center py-0.5 border-t border-slate-800/40">
                  <span className="text-slate-400">Vertebral Flow:</span>
                  <span className={`font-bold font-mono ${leftSteal ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
                    {leftSummary.vertebralFlowDirection.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between items-center py-0.5 border-t border-slate-800/40">
                  <span className="text-slate-400">Plaque Burden:</span>
                  <span className="text-slate-200 font-medium truncate max-w-[140px]">
                    {leftSummary.maxPlaqueLocation || 'None detected'}
                  </span>
                </div>
              </div>
            </div>

            {leftSteal && (
              <div className="p-2 bg-rose-950/60 border border-rose-800 rounded-lg text-[10px] text-rose-300 font-bold flex items-center gap-1.5 mt-2">
                <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-rose-400 animate-pulse" />
                <span>Suspected Subclavian Steal</span>
              </div>
            )}
          </div>

          {/* ================= ALERTS & INCIDENTAL PATHOLOGY ================= */}
          <div className="bg-[#10192e] border border-slate-800 rounded-xl p-3.5 space-y-2.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-extrabold uppercase text-[11px] text-amber-300">Clinical Alerts & Neck Findings</span>
                </div>
                <span className="text-[9px] font-bold text-slate-400">
                  {studyData.nonCarotidFindings.length} Non-Carotid
                </span>
              </div>

              <div className="pt-2 space-y-2 text-[11px]">
                {studyData.nonCarotidFindings.length > 0 ? (
                  <div className="space-y-1.5">
                    {studyData.nonCarotidFindings.slice(0, 3).map(f => (
                      <div key={f.id} className="p-1.5 bg-[#0b101f] border border-slate-800/80 rounded-lg flex items-center justify-between">
                        <span className="font-bold text-slate-200 truncate">{f.type} {f.sizeMm ? `(${f.sizeMm}mm)` : ''}</span>
                        <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                          {f.side}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-[#0b101f] border border-slate-800/60 rounded-lg text-slate-400 text-center italic text-[10px]">
                    No incidental non-carotid neck findings recorded.
                  </div>
                )}

                {/* Plaque count summary */}
                <div className="flex items-center justify-between p-2 bg-[#0b101f] rounded-lg border border-slate-800/80 text-[10.5px]">
                  <span className="text-slate-400">Registered Plaques:</span>
                  <span className="font-bold font-mono text-amber-300">{studyData.plaques.length} profile(s)</span>
                </div>
              </div>
            </div>

            {onNavigateTab && (
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => onNavigateTab('report')}
                  className="flex-1 py-1 px-2 rounded bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 text-[10px] font-bold transition-all cursor-pointer text-center"
                >
                  View Full Report →
                </button>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
};
