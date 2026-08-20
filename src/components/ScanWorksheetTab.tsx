import React, { useState, useMemo } from 'react';
import { StudyData, SegmentData, PlaqueData, MainTab, ProtocolRequirement, ProtocolOverride, ProtocolAuditEvent } from '../types';
import { suggestIcaStenosisCategory, generateSideSummary } from '../utils/calculations';
import { evaluateDynamicProtocol } from '../utils/dynamicProtocolEngine';
import { ClinicalContextPanel } from './clinicalContext';
import { DynamicProtocolBanner } from './DynamicProtocolBanner';
import { TechnicalExceptionModal } from './TechnicalExceptionModal';
import { CarotidWorksheetMap } from './CarotidWorksheetMap';
import { SegmentAssessment } from './SegmentAssessment';
import { AssociatedPathologyTab } from './AssociatedPathologyTab';
import { CriteriaReferenceTab } from './CriteriaReferenceTab';
import { 
  ClipboardList, 
  ShieldAlert, 
  BookOpen, 
  ChevronDown, 
  ChevronUp, 
  Activity
} from 'lucide-react';

interface ScanWorksheetTabProps {
  studyData: StudyData;
  selectedSegmentIds: string[];
  activeSegmentId: string | null;
  assessmentViewMode?: 'diagram_tree' | 'matrix';
  onSetAssessmentViewMode?: (mode: 'diagram_tree' | 'matrix') => void;
  onSelectSegment: (id: string, isMulti: boolean) => void;
  onSetActiveSegment: (id: string) => void;
  onRemoveSelectedSegment: (id: string) => void;
  onAssessSegment: (id: string) => void;
  onUpdateSegment: (id: string, updates: Partial<SegmentData>) => void;
  onUpdateSegmentsBulk: (ids: string[], updates: Partial<SegmentData>) => void;
  onAddPlaque: (plaque: PlaqueData) => void;
  onRemovePlaque: (id: string) => void;
  onUpdateNascet: (
    side: 'right' | 'left',
    plane: 'longitudinal' | 'transverse',
    minLumenA: number | null,
    normalLumenB: number | null
  ) => void;
  onUpdateStudy: (updates: Partial<StudyData>) => void;
  onQuickMarkNormal: (ids: string[]) => void;
  onMarkSideNormal: (side: 'right' | 'left') => void;
  onResetAll: () => void;
  onNavigateTab: (tab: MainTab) => void;
}

export const ScanWorksheetTab: React.FC<ScanWorksheetTabProps> = ({
  studyData,
  selectedSegmentIds,
  activeSegmentId,
  assessmentViewMode,
  onSetAssessmentViewMode,
  onSelectSegment,
  onSetActiveSegment,
  onRemoveSelectedSegment,
  onAssessSegment,
  onUpdateSegment,
  onUpdateSegmentsBulk,
  onAddPlaque,
  onRemovePlaque,
  onUpdateNascet,
  onUpdateStudy,
  onQuickMarkNormal,
  onMarkSideNormal,
  onResetAll,
  onNavigateTab,
}) => {
  // Collapsible Secondary Tools state
  const [isAssociatedExpanded, setIsAssociatedExpanded] = useState<boolean>(studyData.nonCarotidFindings.length > 0);
  const [isCriteriaExpanded, setIsCriteriaExpanded] = useState<boolean>(false);

  // Technical Waiver Modal state
  const [isTechModalOpen, setIsTechModalOpen] = useState<boolean>(false);
  const [targetTechRequirement, setTargetTechRequirement] = useState<ProtocolRequirement | null>(null);

  // Evaluate Dynamic Protocol Live
  const dynamicEvaluation = useMemo(() => {
    return evaluateDynamicProtocol({
      study: studyData,
      activeProtocol: studyData.siteProtocol,
      previousStudy: studyData.priorExam,
      anatomy: studyData.anatomyVariants,
      criteria: studyData.classificationSystem
    });
  }, [
    studyData.segments,
    studyData.plaques,
    studyData.nascet,
    studyData.siteProtocol,
    studyData.anatomyVariants,
    studyData.classificationSystem,
    studyData.technicalOverrides,
    studyData.priorExam
  ]);

  const outstandingSegmentIds = useMemo(() => {
    return dynamicEvaluation.outstandingRequired
      .map(r => r.targetSegmentId)
      .filter((id): id is string => Boolean(id));
  }, [dynamicEvaluation]);

  const handleOpenTechModal = (req?: ProtocolRequirement) => {
    if (req) {
      setTargetTechRequirement(req);
    } else if (activeSegmentId) {
      // Find matching requirement or fallback
      const allEvaluated = [
        ...dynamicEvaluation.baselineRequirements,
        ...dynamicEvaluation.triggeredRequirements,
        ...dynamicEvaluation.completedRequirements,
      ];
      const matchingReq: ProtocolRequirement = allEvaluated.find(r => r.targetSegmentId === activeSegmentId) || {
        id: `override_${activeSegmentId}`,
        label: `Assessment for ${activeSegmentId}`,
        category: 'baseline',
        level: 'required',
        blocking: true,
        allowTechnicalOverride: true,
        satisfied: false,
        reason: 'Manual technical exception documented by sonographer',
        targetSegmentId: activeSegmentId
      };
      setTargetTechRequirement(matchingReq);
    } else {
      // Default to first outstanding required requirement
      setTargetTechRequirement(dynamicEvaluation.outstandingRequired[0] || null);
    }
    setIsTechModalOpen(true);
  };

  const handleSaveOverride = (override: ProtocolOverride) => {
    const updatedOverrides = {
      ...(studyData.technicalOverrides || {}),
      [override.requirementId]: override
    };

    const newAuditLog: ProtocolAuditEvent[] = [
      ...(studyData.protocolAuditLog || []),
      {
        id: `audit_${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'EXCEPTION_RECORDED',
        description: `Technical waiver recorded for ${override.segmentId || override.requirementId}: ${override.reason} (${override.comment || 'No comment'})`,
        details: override.sonographer
      }
    ];

    // Also update segment technical limitations field if segment exists
    let updatedSegments = { ...studyData.segments };
    if (override.segmentId && updatedSegments[override.segmentId]) {
      updatedSegments[override.segmentId] = {
        ...updatedSegments[override.segmentId],
        technicalLimitations: `${override.reason}: ${override.comment}`
      };
    }

    onUpdateStudy({
      technicalOverrides: updatedOverrides,
      protocolAuditLog: newAuditLog,
      segments: updatedSegments
    });
  };

  return (
    <div id="scan-worksheet-tab-container" className="space-y-4">
      
      {/* 1. Clinical Details & Referral Context Panel */}
      <ClinicalContextPanel
        studyData={studyData}
        examType="carotid"
        onUpdateStudy={onUpdateStudy}
      />

      {/* 2. CAROTID ANATOMICAL MAP & HEMODYNAMIC WORKSPACE (Primary Workspace) */}
      <section id="carotid-anatomical-workspace-section" className="space-y-3">
        
        {/* Workspace Toolbar: Title & Quick Normal Actions */}
        <div className="bg-[#0b1329] border border-slate-800 p-2.5 sm:p-3 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-md">
          {/* Left: Section Title */}
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <h2 className="text-xs sm:text-sm font-black text-slate-100 uppercase tracking-tight">
              CAROTID ANATOMICAL MAP & HEMODYNAMIC WORKSPACE
            </h2>
          </div>

          {/* Right: Quick Normal Actions */}
          <div className="flex flex-wrap items-center gap-1.5 ml-auto md:ml-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden lg:inline">
              Quick Actions:
            </span>
            <button
              type="button"
              id="btn-quick-right-normal"
              onClick={() => onMarkSideNormal('right')}
              className="px-2.5 py-1 rounded-lg bg-[#0f172a] hover:bg-slate-800 border border-slate-700 text-[10.5px] font-bold text-slate-200 hover:text-cyan-300 transition-all cursor-pointer"
              title="Mark all right carotid and vertebral segments normal"
            >
              Right Normal
            </button>
            <button
              type="button"
              id="btn-quick-left-normal"
              onClick={() => onMarkSideNormal('left')}
              className="px-2.5 py-1 rounded-lg bg-[#0f172a] hover:bg-slate-800 border border-slate-700 text-[10.5px] font-bold text-slate-200 hover:text-cyan-300 transition-all cursor-pointer"
              title="Mark all left carotid and vertebral segments normal"
            >
              Left Normal
            </button>
            <button
              type="button"
              id="btn-quick-bilateral-normal"
              onClick={() => {
                onMarkSideNormal('right');
                onMarkSideNormal('left');
              }}
              className="px-2.5 py-1 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-700 text-[10.5px] font-extrabold text-emerald-300 transition-all cursor-pointer shadow-xs"
              title="Mark all bilateral segments normal"
            >
              ✓ Bilateral Normal
            </button>
          </div>
        </div>

        {/* Dynamic Protocol Contextual Trigger Alerts & Compact Status */}
        <DynamicProtocolBanner
          studyData={studyData}
          evaluation={dynamicEvaluation}
          onSelectSegment={(id) => {
            onSelectSegment(id, false);
            onSetActiveSegment(id);
          }}
          onOpenTechnicalModal={handleOpenTechModal}
          onNavigateTab={onNavigateTab}
        />

        {/* Carotid Anatomical Workspace & Detailed Assessment Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
          {/* Main Vascular Workspace (7 cols) */}
          <main className="xl:col-span-7 flex flex-col h-full">
            {/* Interactive Anatomical Diagram with Variant Toolbar */}
            <CarotidWorksheetMap
              studyData={studyData}
              selectedSegmentIds={selectedSegmentIds}
              activeSegmentId={activeSegmentId}
              outstandingSegmentIds={outstandingSegmentIds}
              onSelectSegment={onSelectSegment}
              onAssessSegment={onAssessSegment}
              onToggleVariant={() => onUpdateStudy({ variantLeftBct: !studyData.variantLeftBct })}
              onUpdateStudy={onUpdateStudy}
            />
          </main>

          {/* Right Side Assessment Panel with Key Findings Footer (5 cols) */}
          <aside className="xl:col-span-5 flex flex-col h-full">
            <SegmentAssessment
              studyData={studyData}
              selectedIds={selectedSegmentIds}
              activeId={activeSegmentId}
              onSelectSegment={onSelectSegment}
              onSetActiveSegment={onSetActiveSegment}
              onRemoveSelectedSegment={onRemoveSelectedSegment}
              onUpdateSegment={onUpdateSegment}
              onUpdateSegmentsBulk={onUpdateSegmentsBulk}
              onAddPlaque={onAddPlaque}
              onUpdateStudy={onUpdateStudy}
            />
          </aside>
        </div>
      </section>

      {/* 3. Detailed Pathology & Secondary Clinical Tools (Collapsible Accordions) */}
      <div className="space-y-4 pt-4 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-cyan-400" />
            Specialized Reference & Associated Findings
          </h3>
          <span className="text-[10px] text-slate-400">Expand as needed during examination</span>
        </div>

        {/* Accordion: Associated / Non-Carotid Findings */}
        <div className="bg-[#0b1329] border border-slate-800 rounded-xl overflow-hidden shadow-md">
          <div
            onClick={() => setIsAssociatedExpanded(!isAssociatedExpanded)}
            className="p-3.5 bg-[#0d162f] flex items-center justify-between cursor-pointer hover:bg-[#101c3d] transition-all"
          >
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="w-4 h-4 text-cyan-400" />
              <div>
                <span className="text-xs font-extrabold text-slate-100 uppercase tracking-wider">
                  Associated Cervical & Non-Carotid Findings
                </span>
                <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                  {studyData.nonCarotidFindings.length} Finding{studyData.nonCarotidFindings.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-cyan-400">
                {isAssociatedExpanded ? 'Collapse' : 'Expand Findings'}
              </span>
              {isAssociatedExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </div>
          </div>

          {isAssociatedExpanded && (
            <div className="p-4 sm:p-5 bg-[#090f20] border-t border-slate-800 animate-in fade-in duration-200">
              <AssociatedPathologyTab
                studyData={studyData}
                onUpdateStudy={onUpdateStudy}
              />
            </div>
          )}
        </div>

        {/* Accordion 4: Consensus Criteria Reference */}
        <div className="bg-[#0b1329] border border-slate-800 rounded-xl overflow-hidden shadow-md">
          <div
            onClick={() => setIsCriteriaExpanded(!isCriteriaExpanded)}
            className="p-3.5 bg-[#0d162f] flex items-center justify-between cursor-pointer hover:bg-[#101c3d] transition-all"
          >
            <div className="flex items-center gap-2.5">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <div>
                <span className="text-xs font-extrabold text-slate-100 uppercase tracking-wider">
                  Consensus Criteria Reference Tables
                </span>
                <span className="ml-2 text-[10px] text-cyan-400 font-mono font-bold">
                  {studyData.classificationSystem.replace(/_/g, ' ')}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-cyan-400">
                {isCriteriaExpanded ? 'Collapse' : 'Expand Reference'}
              </span>
              {isCriteriaExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </div>
          </div>

          {isCriteriaExpanded && (
            <div className="p-4 sm:p-5 bg-[#090f20] border-t border-slate-800 animate-in fade-in duration-200">
              <CriteriaReferenceTab
                studyData={studyData}
              />
            </div>
          )}
        </div>
      </div>

      {/* Technical Waiver & Exception Modal */}
      <TechnicalExceptionModal
        isOpen={isTechModalOpen}
        onClose={() => setIsTechModalOpen(false)}
        requirement={targetTechRequirement}
        studyData={studyData}
        onSaveOverride={handleSaveOverride}
      />
    </div>
  );
};
