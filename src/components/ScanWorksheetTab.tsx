import React, { useState, useMemo } from 'react';
import { StudyData, SegmentData, PlaqueData, MainTab, ProtocolRequirement, ProtocolOverride } from '../types';
import { suggestIcaStenosisCategory, generateSideSummary } from '../utils/calculations';
import { evaluateDynamicProtocol } from '../utils/dynamicProtocolEngine';
import { PatientExaminationHeader } from './PatientExaminationHeader';
import { ClinicalContextSection } from './ClinicalContextSection';
import { AbnormalCarotidFindingsPanel } from './AbnormalCarotidFindingsPanel';
import { DynamicProtocolBanner } from './DynamicProtocolBanner';
import { TechnicalExceptionModal } from './TechnicalExceptionModal';
import { CarotidDiagram } from './CarotidDiagram';
import { VesselTreeList } from './VesselTreeList';
import { CarotidVesselMatrixView } from './CarotidVesselMatrixView';
import { SegmentAssessment } from './SegmentAssessment';
import { PlaqueRegister } from './PlaqueRegister';
import { NascetCalculator } from './NascetCalculator';
import { AssociatedPathologyTab } from './AssociatedPathologyTab';
import { CriteriaReferenceTab } from './CriteriaReferenceTab';
import { 
  Layers, 
  LayoutGrid, 
  ClipboardList, 
  Ruler, 
  ShieldAlert, 
  BookOpen, 
  CheckCheck, 
  ChevronDown, 
  ChevronUp, 
  FileText, 
  ArrowRight,
  Sparkles,
  RefreshCw,
  Activity,
  Check
} from 'lucide-react';

interface ScanWorksheetTabProps {
  studyData: StudyData;
  selectedSegmentIds: string[];
  activeSegmentId: string | null;
  assessmentViewMode: 'diagram_tree' | 'matrix';
  onSetAssessmentViewMode: (mode: 'diagram_tree' | 'matrix') => void;
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
  const [isPlaqueExpanded, setIsPlaqueExpanded] = useState<boolean>(studyData.plaques.length > 0);
  const [isNascetExpanded, setIsNascetExpanded] = useState<boolean>(false);
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
      const matchingReq = dynamicEvaluation.allEvaluatedRequirements.find(r => r.targetSegmentId === activeSegmentId) || {
        id: `override_${activeSegmentId}`,
        label: `Assessment for ${activeSegmentId}`,
        tier: 'baseline',
        isMandatory: true,
        isCompleted: false,
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

    const newAuditLog = [
      ...(studyData.protocolAuditLog || []),
      {
        id: `audit_${Date.now()}`,
        timestamp: new Date().toISOString(),
        eventType: 'exception_granted' as const,
        description: `Technical waiver recorded for ${override.segmentId || override.requirementId}: ${override.reason} (${override.comment || 'No comment'})`,
        author: override.sonographer
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

  // Live summaries for bottom overview
  const rightSummary = generateSideSummary('right', studyData);
  const leftSummary = generateSideSummary('left', studyData);

  const nascetRightSummary = studyData.nascet.right.longitudinal.calculatedStenosis !== null 
    ? `${studyData.nascet.right.longitudinal.calculatedStenosis}% (Long)` 
    : studyData.nascet.right.transverse.calculatedStenosis !== null 
    ? `${studyData.nascet.right.transverse.calculatedStenosis}% (Trans)` 
    : null;

  const nascetLeftSummary = studyData.nascet.left.longitudinal.calculatedStenosis !== null 
    ? `${studyData.nascet.left.longitudinal.calculatedStenosis}% (Long)` 
    : studyData.nascet.left.transverse.calculatedStenosis !== null 
    ? `${studyData.nascet.left.transverse.calculatedStenosis}% (Trans)` 
    : null;

  const handleAddPlaqueFromSegments = (ids: string[]) => {
    setIsPlaqueExpanded(true);
  };

  return (
    <div id="scan-worksheet-tab-container" className="space-y-5">
      
      {/* 1. Patient Demographics & Examination Profile Bar (Collapsible Header) */}
      <PatientExaminationHeader
        studyData={studyData}
        onUpdateStudy={onUpdateStudy}
        onNavigateTab={onNavigateTab}
      />

      {/* 2. Persistent High-Level Abnormal Carotid Findings & Steal Alert Banner */}
      <AbnormalCarotidFindingsPanel
        studyData={studyData}
        onSelectSegment={onSelectSegment}
        onNavigateTab={(tab) => {
          if (tab === 'plaque') setIsPlaqueExpanded(true);
          else if (tab === 'nascet') setIsNascetExpanded(true);
          else if (tab === 'associated') setIsAssociatedExpanded(true);
          else if (tab === 'report') onNavigateTab('report');
        }}
      />

      {/* 3. Clinical Indications & Context Section (Collapsible) */}
      <ClinicalContextSection
        studyData={studyData}
        onUpdateStudy={onUpdateStudy}
      />

      {/* 3b. Active Clinical Dynamic Protocol Governance & Trigger Banner */}
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

      {/* 4. Quick Scanning Controls Bar & View Switcher */}
      <div className="bg-[#0b1329] border border-slate-800 p-2.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
        {/* Left: View Mode Toggle */}
        <div className="flex items-center gap-1.5 bg-[#080d19] p-1 rounded-lg border border-slate-800 shrink-0">
          <button
            type="button"
            id="btn-scan-view-diagram"
            onClick={() => onSetAssessmentViewMode('diagram_tree')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              assessmentViewMode === 'diagram_tree'
                ? 'bg-cyan-600 text-slate-950 font-black shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Anatomical Map & Tree</span>
          </button>
          <button
            type="button"
            id="btn-scan-view-matrix"
            onClick={() => onSetAssessmentViewMode('matrix')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              assessmentViewMode === 'matrix'
                ? 'bg-cyan-600 text-slate-950 font-black shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Bilateral Hemodynamic Matrix</span>
          </button>
        </div>

        {/* Right: Quick Normal Actions */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden md:inline">
            Quick Actions:
          </span>
          <button
            type="button"
            id="btn-quick-right-normal"
            onClick={() => onMarkSideNormal('right')}
            className="px-2.5 py-1 rounded-lg bg-[#0f172a] hover:bg-slate-800 border border-slate-700 text-[11px] font-bold text-slate-200 hover:text-cyan-300 transition-all cursor-pointer"
            title="Mark all right carotid and vertebral segments normal"
          >
            Routine Right Normal
          </button>
          <button
            type="button"
            id="btn-quick-left-normal"
            onClick={() => onMarkSideNormal('left')}
            className="px-2.5 py-1 rounded-lg bg-[#0f172a] hover:bg-slate-800 border border-slate-700 text-[11px] font-bold text-slate-200 hover:text-cyan-300 transition-all cursor-pointer"
            title="Mark all left carotid and vertebral segments normal"
          >
            Routine Left Normal
          </button>
          <button
            type="button"
            id="btn-quick-bilateral-normal"
            onClick={() => {
              onMarkSideNormal('right');
              onMarkSideNormal('left');
            }}
            className="px-2.5 py-1 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-700 text-[11px] font-extrabold text-emerald-300 transition-all cursor-pointer shadow-sm"
            title="Mark all bilateral segments normal"
          >
            ✓ Bilateral Normal
          </button>
        </div>
      </div>

      {/* 5. Primary Active Scanning Workspace Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Main Vascular Workspace (8 cols) */}
        <main className="xl:col-span-8 space-y-6">
          {assessmentViewMode === 'diagram_tree' ? (
            <>
              {/* Interactive Anatomical Diagram with Variant Toolbar */}
              <CarotidDiagram
                studyData={studyData}
                selectedSegmentIds={selectedSegmentIds}
                activeSegmentId={activeSegmentId}
                outstandingSegmentIds={outstandingSegmentIds}
                onSelectSegment={onSelectSegment}
                onAssessSegment={onAssessSegment}
                onToggleVariant={() => onUpdateStudy({ variantLeftBct: !studyData.variantLeftBct })}
                onUpdateStudy={onUpdateStudy}
              />

              {/* DVT-Style Left/Right Structured Vessel Trees */}
              <VesselTreeList
                studyData={studyData}
                selectedSegmentIds={selectedSegmentIds}
                activeSegmentId={activeSegmentId}
                outstandingSegmentIds={outstandingSegmentIds}
                onSelectSegment={onSelectSegment}
                onAssessSegment={onAssessSegment}
                onQuickMarkNormal={onQuickMarkNormal}
                onMarkSideNormal={onMarkSideNormal}
              />
            </>
          ) : (
            /* Fast Matrix View */
            <CarotidVesselMatrixView
              studyData={studyData}
              activeSegmentId={activeSegmentId}
              selectedSegmentIds={selectedSegmentIds}
              outstandingSegmentIds={outstandingSegmentIds}
              onSelectSegment={onSelectSegment}
              onAssessSegment={onAssessSegment}
              onUpdateSegment={onUpdateSegment}
              onQuickMarkNormal={onQuickMarkNormal}
              onMarkSideNormal={onMarkSideNormal}
            />
          )}
        </main>

        {/* Sticky Right Side Assessment Panel (4 cols) */}
        <aside className="xl:col-span-4 sticky top-[136px] h-[calc(100vh-160px)] flex flex-col">
          <SegmentAssessment
            studyData={studyData}
            selectedIds={selectedSegmentIds}
            activeId={activeSegmentId}
            onSetActiveSegment={onSetActiveSegment}
            onRemoveSelectedSegment={onRemoveSelectedSegment}
            onUpdateSegment={onUpdateSegment}
            onUpdateSegmentsBulk={onUpdateSegmentsBulk}
            onAddPlaqueFromSegments={handleAddPlaqueFromSegments}
          />
        </aside>
      </div>

      {/* 6. Detailed Pathology & Secondary Clinical Tools (Collapsible Accordions) */}
      <div className="space-y-4 pt-4 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-cyan-400" />
            Specialized Pathology Modules & Reference Tools
          </h3>
          <span className="text-[10px] text-slate-400">Expand as needed during examination</span>
        </div>

        {/* Accordion 1: Plaque Assessment Register */}
        <div className="bg-[#0b1329] border border-slate-800 rounded-xl overflow-hidden shadow-md">
          <div
            onClick={() => setIsPlaqueExpanded(!isPlaqueExpanded)}
            className="p-3.5 bg-[#0d162f] flex items-center justify-between cursor-pointer hover:bg-[#101c3d] transition-all"
          >
            <div className="flex items-center gap-2.5">
              <ClipboardList className="w-4 h-4 text-cyan-400" />
              <div>
                <span className="text-xs font-extrabold text-slate-100 uppercase tracking-wider">
                  Plaque Assessment & Characterisation Register
                </span>
                <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                  {studyData.plaques.length} Plaque{studyData.plaques.length !== 1 ? 's' : ''} Documented
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-cyan-400">
                {isPlaqueExpanded ? 'Collapse' : 'Expand Plaque Register'}
              </span>
              {isPlaqueExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </div>
          </div>

          {isPlaqueExpanded && (
            <div className="p-4 sm:p-5 bg-[#090f20] border-t border-slate-800 animate-in fade-in duration-200">
              <PlaqueRegister
                studyData={studyData}
                selectedSegmentIds={selectedSegmentIds}
                onAddPlaque={onAddPlaque}
                onRemovePlaque={onRemovePlaque}
              />
            </div>
          )}
        </div>

        {/* Accordion 2: NASCET Diameter Calculator */}
        <div className="bg-[#0b1329] border border-slate-800 rounded-xl overflow-hidden shadow-md">
          <div
            onClick={() => setIsNascetExpanded(!isNascetExpanded)}
            className="p-3.5 bg-[#0d162f] flex items-center justify-between cursor-pointer hover:bg-[#101c3d] transition-all"
          >
            <div className="flex items-center gap-2.5">
              <Ruler className="w-4 h-4 text-cyan-400" />
              <div>
                <span className="text-xs font-extrabold text-slate-100 uppercase tracking-wider">
                  NASCET Diameter Reduction Calculator
                </span>
                <span className="ml-2 text-[10px] text-slate-400 font-mono">
                  {nascetRightSummary || nascetLeftSummary
                    ? `Right: ${nascetRightSummary || '—'} • Left: ${nascetLeftSummary || '—'}`
                    : 'Optional Anatomical Diameter Ratio (% Stenosis = [1 - A/B] × 100)'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-cyan-400">
                {isNascetExpanded ? 'Collapse' : 'Expand Calculator'}
              </span>
              {isNascetExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </div>
          </div>

          {isNascetExpanded && (
            <div className="p-4 sm:p-5 bg-[#090f20] border-t border-slate-800 animate-in fade-in duration-200">
              <NascetCalculator
                studyData={studyData}
                onUpdateNascet={onUpdateNascet}
              />
            </div>
          )}
        </div>

        {/* Accordion 3: Associated / Non-Carotid Findings */}
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
                  Active: {studyData.classificationSystem.replace('_', ' ')}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-cyan-400">
                {isCriteriaExpanded ? 'Collapse' : 'View Guidelines & Thresholds'}
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

      {/* 7. Live Study Impression Summary & Structured Report Navigation Banner */}
      <div className="p-5 bg-[#0b1329] border border-cyan-700/80 rounded-xl shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[10px] font-extrabold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5" /> Real-time Hemodynamic Impression Preview
          </span>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300">
            <span>
              Right ICA: <strong className="text-slate-100">{rightSummary.confirmedClassification || rightSummary.suggestedClassification}</strong> (PSV {rightSummary.highestIcaPsv ?? '—'} cm/s)
            </span>
            <span>•</span>
            <span>
              Left ICA: <strong className="text-slate-100">{leftSummary.confirmedClassification || leftSummary.suggestedClassification}</strong> (PSV {leftSummary.highestIcaPsv ?? '—'} cm/s)
            </span>
            <span>•</span>
            <span>
              Vertebrals: <strong className="text-slate-100 capitalize">R: {rightSummary.vertebralFlowDirection} / L: {leftSummary.vertebralFlowDirection}</strong>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            id="btn-navigate-to-structured-report"
            onClick={() => onNavigateTab('report')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>Review Structured Report</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Technical Exception / Protocol Waiver Modal */}
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
