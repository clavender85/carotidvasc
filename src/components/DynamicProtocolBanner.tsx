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
  Layers,
  Sparkles,
  Info
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
  const { summaryStats, warnings, outstandingRequired, outstandingRecommended } = evaluation;

  const isComplete = evaluation.canCompleteStudy;
  const protocolName = studyData.siteProtocol?.localProtocolName || 'Standard Carotid Protocol';
  const criteriaName = studyData.classificationSystem.replace(/_/g, ' ');

  // Get active trigger alerts / outstanding requirements as compact chips
  const dynamicOutstanding = outstandingRequired.filter(r => r.category !== 'baseline');
  const allOutstanding = outstandingRequired;

  return (
    <div id="dynamic-protocol-compact-container" className="space-y-2">
      {/* 1. COMPACT PROTOCOL STRIP (Unified single bar) */}
      <div
        id="dynamic-protocol-compact-strip"
        className={`px-3.5 py-2 rounded-xl border flex flex-wrap items-center justify-between gap-2.5 text-xs transition-all shadow-xs ${
          isComplete
            ? 'bg-[#08171f] border-emerald-900/80 text-slate-300'
            : warnings.length > 0
            ? 'bg-[#14120a] border-amber-800/80 text-slate-300'
            : 'bg-[#0b1329] border-slate-800 text-slate-300'
        }`}
      >
        {/* Left: Protocol Status & Progress */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 font-extrabold text-[11px] uppercase tracking-wide">
            {isComplete ? (
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Protocol Satisfied</span>
              </span>
            ) : (
              <span className="text-cyan-300 flex items-center gap-1 font-bold">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                <span>ACTIVE PROTOCOL • {studyData.siteProtocol?.protocolPresetId === 'australia_asum' ? 'ASUM 2021' : studyData.siteProtocol?.protocolPresetId === 'united_states_iac' ? 'IAC / SRU' : studyData.siteProtocol?.localProtocolName || 'Standard Carotid Protocol'}</span>
              </span>
            )}
          </div>

          <span className="text-slate-600 hidden sm:inline">•</span>

          <span className="text-[11px] text-slate-300 font-mono">
            Baseline: <strong className="text-slate-100">{summaryStats.baselineCompleted}/{summaryStats.baselineTotal}</strong>
            {summaryStats.dynamicTotal > 0 && (
              <> • Dynamic: <strong className="text-amber-300">{summaryStats.dynamicCompleted}/{summaryStats.dynamicTotal}</strong></>
            )}
            {summaryStats.technicalExceptionsCount > 0 && (
              <> • Waivers: <strong className="text-cyan-300">{summaryStats.technicalExceptionsCount}</strong></>
            )}
          </span>

          {/* Compact Clickable Requirement & Warning Chips */}
          {allOutstanding.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap ml-1">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-400" />
                {allOutstanding.length} Outstanding:
              </span>
              {allOutstanding.slice(0, 3).map(req => (
                <button
                  key={req.id}
                  type="button"
                  onClick={() => {
                    if (req.targetSegmentId) {
                      onSelectSegment(req.targetSegmentId);
                    } else {
                      onOpenTechnicalModal(req);
                    }
                  }}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-950/80 hover:bg-amber-900 border border-amber-600/80 text-amber-200 hover:text-white text-[10px] font-bold transition-all cursor-pointer shadow-2xs"
                  title={`${req.label} — ${req.reason || 'Click to assess vessel'}`}
                >
                  <span>{req.label}</span>
                  <ArrowRight className="w-2.5 h-2.5 text-amber-400" />
                </button>
              ))}
              {allOutstanding.length > 3 && (
                <button
                  type="button"
                  onClick={() => setIsChecklistExpanded(true)}
                  className="text-[10px] text-amber-400 font-bold hover:underline"
                >
                  +{allOutstanding.length - 3} more
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right: Actions (Waiver & Checklist Toggle) */}
        <div className="flex items-center gap-2 ml-auto">
          <button
            type="button"
            onClick={() => onOpenTechnicalModal()}
            className="px-2 py-1 rounded-lg bg-[#0f172a] hover:bg-slate-800 border border-slate-700 text-[10.5px] font-bold text-slate-300 hover:text-cyan-300 transition-all cursor-pointer flex items-center gap-1"
            title="Record sonographer technical limitation / exception"
          >
            <ShieldAlert className="w-3 h-3 text-amber-400" />
            <span className="hidden sm:inline">Record Waiver</span>
            <span className="sm:hidden">Waiver</span>
          </button>

          <button
            type="button"
            onClick={() => setIsChecklistExpanded(!isChecklistExpanded)}
            className="px-2.5 py-1 rounded-lg bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 text-[10.5px] font-bold transition-all cursor-pointer flex items-center gap-1"
          >
            <span>{isChecklistExpanded ? 'Hide Checklist' : 'Checklist'}</span>
            {isChecklistExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* 2. EXPANDABLE PROTOCOL REQUIREMENTS DRAWER (Appears on click) */}
      {isChecklistExpanded && (
        <div className="p-4 bg-[#090f20] border border-slate-800 rounded-xl space-y-4 animate-in fade-in duration-150 text-xs shadow-lg">
          {/* Active Warnings Detail if present */}
          {warnings.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10.5px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                Active Clinical Triggers & Guideline Warnings:
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {warnings.map(warn => (
                  <div key={warn.id} className="p-2.5 bg-[#0d162e] border border-amber-700/60 rounded-lg flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-amber-300 text-xs">{warn.title}</div>
                      <div className="text-slate-300 text-[11px] mt-0.5">{warn.message}</div>
                    </div>
                    {warn.targetSegmentId && (
                      <button
                        type="button"
                        onClick={() => onSelectSegment(warn.targetSegmentId!)}
                        className="px-2 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[10px] uppercase shrink-0 transition-all cursor-pointer"
                      >
                        {warn.actionLabel || 'Assess'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

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
