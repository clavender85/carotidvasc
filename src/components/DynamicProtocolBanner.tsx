import React, { useState } from 'react';
import { StudyData, DynamicProtocolEvaluation, ProtocolRequirement } from '../types';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Activity,
  ArrowRight,
  Sliders,
  FileText,
  Info,
  Layers,
  Sparkles
} from 'lucide-react';

interface DynamicProtocolBannerProps {
  studyData: StudyData;
  evaluation: DynamicProtocolEvaluation;
  onSelectSegment: (segmentId: string) => void;
  onOpenTechnicalModal: (req?: ProtocolRequirement) => void;
  onNavigateTab: (tab: 'scan' | 'previous' | 'report' | 'protocol') => void;
}

export const DynamicProtocolBanner: React.FC<DynamicProtocolBannerProps> = ({
  studyData,
  evaluation,
  onSelectSegment,
  onOpenTechnicalModal,
  onNavigateTab
}) => {
  const [isChecklistExpanded, setIsChecklistExpanded] = useState<boolean>(false);
  const { summaryStats, warnings, outstandingRequired, outstandingRecommended, triggeredRequirements } = evaluation;

  const isComplete = evaluation.canCompleteStudy;
  const protocolName = studyData.siteProtocol?.localProtocolName || 'Standard Carotid Protocol';
  const criteriaName = studyData.classificationSystem.replace(/_/g, ' ');
  const hasTriggeredAlerts = warnings.length > 0;

  return (
    <div id="dynamic-protocol-contextual-container" className="space-y-2">
      {/* 1. PROMINENT CONTEXTUAL TRIGGER ALERTS (Shown when dynamic requirements/warnings are active) */}
      {hasTriggeredAlerts && (
        <div
          id="dynamic-protocol-triggered-alert"
          className="bg-amber-950/40 border-2 border-amber-500/80 rounded-xl p-3.5 sm:p-4 shadow-lg animate-in fade-in duration-200"
        >
          <div className="space-y-3">
            {warnings.map(warn => {
              // Collect all outstanding items related to this trigger or segment
              const relatedReqs = outstandingRequired.filter(
                r => r.targetSegmentId === warn.targetSegmentId || (r.isDynamicTriggered && r.reason.toLowerCase().includes(warn.targetSegmentId ? warn.targetSegmentId.replace('_', ' ') : ''))
              );

              return (
                <div key={warn.id} className="flex flex-col md:flex-row md:items-start justify-between gap-3 bg-[#0d162e]/90 p-3.5 rounded-lg border border-amber-600/60">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500 flex items-center justify-center text-amber-400 shrink-0 mt-0.5 animate-pulse">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs sm:text-sm font-black text-amber-300 uppercase tracking-wide">
                          {warn.title}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 border border-amber-700 text-amber-200 font-bold">
                          Protocol Trigger
                        </span>
                      </div>
                      <p className="text-xs text-slate-200 mt-1 leading-relaxed">
                        {warn.message}
                      </p>

                      {/* Explicit Required Sub-items */}
                      {relatedReqs.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-amber-900/60">
                          <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wider block mb-1">
                            Required Additional Imaging:
                          </span>
                          <ul className="text-[11px] text-slate-300 space-y-1 font-medium">
                            {relatedReqs.map(r => (
                              <li key={r.id} className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                                <span className="font-bold text-slate-100">{r.label}</span>
                                {r.reason && <span className="text-slate-400 text-[10px]">({r.reason})</span>}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Direct Action Buttons */}
                  <div className="flex sm:flex-col gap-2 shrink-0 self-end md:self-center">
                    {warn.targetSegmentId && warn.actionLabel && (
                      <button
                        type="button"
                        onClick={() => onSelectSegment(warn.targetSegmentId!)}
                        className="px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                      >
                        <span>{warn.actionLabel}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onOpenTechnicalModal()}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[10.5px] font-bold text-slate-300 hover:text-cyan-300 transition-all cursor-pointer text-center"
                    >
                      Record Waiver
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. COMPACT PROTOCOL STATUS STRIP (Subtle & space-efficient) */}
      <div
        id="dynamic-protocol-compact-strip"
        className={`px-3 py-2 rounded-xl border flex flex-wrap items-center justify-between gap-2.5 text-xs transition-all ${
          isComplete
            ? 'bg-[#08171f] border-emerald-900/80 text-slate-300'
            : 'bg-[#0b1329] border-slate-800 text-slate-300'
        }`}
      >
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5">
            {isComplete ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <Activity className="w-4 h-4 text-cyan-400 shrink-0" />
            )}
            <span className="font-extrabold text-[11px] uppercase tracking-wide">
              {isComplete ? (
                <span className="text-emerald-400">✓ Protocol Satisfied</span>
              ) : (
                <span className="text-slate-300">Protocol In Progress</span>
              )}
            </span>
          </div>

          <span className="text-slate-600 hidden sm:inline">•</span>

          <span className="text-[11px] text-slate-400 font-mono">
            {protocolName} ({criteriaName})
          </span>

          <span className="text-slate-600 hidden sm:inline">•</span>

          <span className="text-[11px] text-slate-300 font-mono">
            Baseline: <strong className="text-slate-100">{summaryStats.baselineCompleted}/{summaryStats.baselineTotal}</strong>
            {summaryStats.dynamicTotal > 0 && (
              <> | Dynamic: <strong className="text-amber-300">{summaryStats.dynamicCompleted}/{summaryStats.dynamicTotal}</strong></>
            )}
            {summaryStats.technicalExceptionsCount > 0 && (
              <> | Waivers: <strong className="text-cyan-300">{summaryStats.technicalExceptionsCount}</strong></>
            )}
          </span>
        </div>

        <div className="flex items-center gap-2 ml-auto sm:ml-0">
          <button
            type="button"
            onClick={() => onOpenTechnicalModal()}
            className="px-2 py-1 rounded bg-[#0f172a] hover:bg-slate-800 border border-slate-700 text-[10.5px] font-bold text-slate-300 hover:text-cyan-300 transition-all cursor-pointer flex items-center gap-1"
          >
            <ShieldAlert className="w-3 h-3 text-amber-400" />
            <span>Waiver</span>
          </button>

          <button
            type="button"
            onClick={() => setIsChecklistExpanded(!isChecklistExpanded)}
            className="px-2 py-1 rounded bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 text-[10.5px] font-bold transition-all cursor-pointer flex items-center gap-1"
          >
            <span>{isChecklistExpanded ? 'Hide Checklist' : 'Checklist'}</span>
            {isChecklistExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* 3. OPTIONAL EXPANDABLE CHECKLIST ACCORDION */}
      {isChecklistExpanded && (
        <div className="p-4 bg-[#090f20] border border-slate-800 rounded-xl space-y-4 animate-in fade-in duration-200 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Outstanding Required Items */}
            <div className="p-3 bg-[#0d162f] rounded-lg border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Outstanding Required ({outstandingRequired.length})
                </span>
                <span className="text-[10px] text-slate-400">Must acquire or waive</span>
              </div>

              {outstandingRequired.length === 0 ? (
                <div className="p-2.5 bg-emerald-950/40 border border-emerald-800/60 rounded-lg text-emerald-300 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>All required baseline & dynamic items complete!</span>
                </div>
              ) : (
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {outstandingRequired.map(req => (
                    <div
                      key={req.id}
                      className="p-2 bg-[#080d19] border border-amber-900/60 rounded-lg flex items-center justify-between gap-2"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-slate-200 truncate">
                          {req.label}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {req.reason}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {req.targetSegmentId && (
                          <button
                            type="button"
                            onClick={() => onSelectSegment(req.targetSegmentId!)}
                            className="px-2 py-0.5 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-700 text-cyan-300 text-[10px] font-bold"
                          >
                            Acquire
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onOpenTechnicalModal(req)}
                          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-[10px] font-bold"
                          title="Record waiver reason"
                        >
                          Waive
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Completed & Protocol Governance */}
            <div className="p-3 bg-[#0d162f] rounded-lg border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  Protocol Summary & Governance
                </span>
                <button
                  type="button"
                  onClick={() => onNavigateTab('protocol')}
                  className="text-[10px] text-cyan-300 font-bold hover:underline flex items-center gap-1"
                >
                  <span>Protocol Library</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="p-2 bg-[#080d19] rounded-lg border border-slate-800 space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span>Completed Items:</span>
                  <strong className="text-emerald-400 font-mono">{evaluation.completedRequirements.length}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Technical Exceptions Documented:</span>
                  <strong className="text-cyan-400 font-mono">{summaryStats.technicalExceptionsCount}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Dynamic Requirements Triggered:</span>
                  <strong className="text-amber-400 font-mono">{summaryStats.dynamicTotal}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Ready for Final Report Sign-off:</span>
                  <strong className={isComplete ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                    {isComplete ? 'YES (Unrestricted)' : 'NO (Pending items)'}
                  </strong>
                </div>
              </div>

              {outstandingRecommended.length > 0 && (
                <div className="pt-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    Recommended (Non-blocking):
                  </span>
                  <div className="text-[11px] text-slate-300 mt-1 space-y-1">
                    {outstandingRecommended.map(r => (
                      <div key={r.id} className="flex items-center justify-between text-[10px] text-slate-400">
                        <span>• {r.label}</span>
                        {r.targetSegmentId && (
                          <button
                            type="button"
                            onClick={() => onSelectSegment(r.targetSegmentId!)}
                            className="text-cyan-400 hover:underline"
                          >
                            Jump
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
