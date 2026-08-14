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
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const { summaryStats, warnings, outstandingRequired, outstandingRecommended, triggeredRequirements } = evaluation;

  const isComplete = evaluation.canCompleteStudy;
  const protocolName = studyData.siteProtocol?.localProtocolName || 'Standard Carotid Protocol';
  const criteriaName = studyData.classificationSystem.replace(/_/g, ' ');

  return (
    <div id="dynamic-protocol-banner" className="bg-[#0b1329] border border-cyan-800/80 rounded-xl shadow-lg overflow-hidden transition-all">
      {/* Top Banner Row */}
      <div className="p-3 sm:p-4 bg-[#0d1630] flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Protocol Identity & Status */}
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
              isComplete
                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                : 'bg-amber-950/80 border-amber-500 text-amber-300 animate-pulse'
            }`}
          >
            {isComplete ? <CheckCircle2 className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-black text-slate-100 uppercase tracking-wider">
                {protocolName}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-700 text-cyan-300 font-mono font-bold">
                {criteriaName}
              </span>
              {triggeredRequirements.length > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950/90 border border-amber-600 text-amber-300 font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {triggeredRequirements.length} Dynamic Trigger{triggeredRequirements.length > 1 ? 's' : ''}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-400 mt-0.5">
              <span>
                Baseline: <strong className="text-slate-200">{summaryStats.baselineCompleted}/{summaryStats.baselineTotal}</strong>
              </span>
              {summaryStats.dynamicTotal > 0 && (
                <>
                  <span>•</span>
                  <span>
                    Dynamic: <strong className="text-amber-300">{summaryStats.dynamicCompleted}/{summaryStats.dynamicTotal}</strong>
                  </span>
                </>
              )}
              {summaryStats.technicalExceptionsCount > 0 && (
                <>
                  <span>•</span>
                  <span>
                    Waivers: <strong className="text-cyan-300">{summaryStats.technicalExceptionsCount}</strong>
                  </span>
                </>
              )}
              <span>•</span>
              <span className={isComplete ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                {evaluation.protocolCompletionPercent}% Complete
              </span>
            </div>
          </div>
        </div>

        {/* Right: Actions & Expand Button */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Progress Mini Bar */}
          <div className="hidden lg:flex flex-col items-end mr-2 w-32">
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
              <div
                className={`h-full transition-all duration-300 ${
                  isComplete ? 'bg-emerald-500' : 'bg-gradient-to-r from-amber-500 to-cyan-500'
                }`}
                style={{ width: `${Math.min(100, evaluation.protocolCompletionPercent)}%` }}
              />
            </div>
            <span className="text-[9px] text-slate-400 font-mono mt-0.5">
              {isComplete ? 'Protocol Satisfied' : `${summaryStats.blockingRemainingCount} Required Pending`}
            </span>
          </div>

          <button
            type="button"
            onClick={() => onOpenTechnicalModal()}
            className="px-2.5 py-1.5 rounded-lg bg-[#0f172a] hover:bg-slate-800 border border-slate-700 text-[11px] font-bold text-slate-300 hover:text-cyan-300 transition-all cursor-pointer flex items-center gap-1.5"
            title="Record technical waiver for unobtainable vessel"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>Record Technical Waiver</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-3 py-1.5 rounded-lg bg-cyan-950/70 hover:bg-cyan-900/90 border border-cyan-700 text-cyan-300 font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span>{isExpanded ? 'Hide Protocol Checklist' : 'Review Protocol Checklist'}</span>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Dynamic Alerts Banner (Always visible when active warnings exist) */}
      {warnings.length > 0 && (
        <div className="px-4 py-2.5 bg-amber-950/40 border-t border-b border-amber-800/60 flex flex-col gap-2">
          {warnings.map(warn => (
            <div key={warn.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold text-amber-300 uppercase tracking-wide mr-2">
                    {warn.title}
                  </span>
                  <span className="text-slate-300 text-[11px] leading-relaxed">
                    {warn.message}
                  </span>
                </div>
              </div>

              {warn.targetSegmentId && warn.actionLabel && (
                <button
                  type="button"
                  onClick={() => onSelectSegment(warn.targetSegmentId!)}
                  className="px-2.5 py-1 rounded-lg bg-amber-900 hover:bg-amber-800 border border-amber-600 text-amber-100 font-bold text-[10.5px] uppercase tracking-wider shrink-0 transition-all cursor-pointer flex items-center gap-1"
                >
                  <span>{warn.actionLabel}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Expandable Protocol Checklist & Outstanding Items */}
      {isExpanded && (
        <div className="p-4 sm:p-5 bg-[#090f20] border-t border-slate-800 space-y-4 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Outstanding Required Items */}
            <div className="p-3.5 bg-[#0d162f] rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" />
                  Outstanding Required Items ({outstandingRequired.length})
                </span>
                <span className="text-[10px] text-slate-400">Must be completed or waived</span>
              </div>

              {outstandingRequired.length === 0 ? (
                <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-lg text-emerald-300 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>All mandatory baseline and triggered requirements completed!</span>
                </div>
              ) : (
                <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
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
                            className="px-2 py-1 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-700 text-cyan-300 text-[10px] font-bold"
                          >
                            Acquire
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onOpenTechnicalModal(req)}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-[10px] font-bold"
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

            {/* Recommended & Completed Summary */}
            <div className="p-3.5 bg-[#0d162f] rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4" />
                  Completed Items & Protocol Governance
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

              <div className="p-2.5 bg-[#080d19] rounded-lg border border-slate-800 space-y-1.5 text-xs text-slate-300">
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
                    {isComplete ? 'YES (Unrestricted)' : 'NO (Blocking items outstanding)'}
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
