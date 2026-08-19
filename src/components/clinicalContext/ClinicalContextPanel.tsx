import React, { useState, useMemo } from 'react';
import { StudyData } from '../../types';
import { ClinicalContextData, ReferralImportResult } from '../../types/clinicalContext';
import { getContextTemplate } from '../../data/clinicalContext';
import { getNormalizedClinicalContext, generateClinicalContextSummary } from '../../utils/clinicalContextSummary';
import { ClinicalContextSummary } from './ClinicalContextSummary';
import { ClinicalContextEditor } from './ClinicalContextEditor';
import { FileText, ChevronDown, ChevronUp, Download, Edit3 } from 'lucide-react';

interface ClinicalContextPanelProps {
  studyData: StudyData;
  examType?: string;
  initialReferralData?: ReferralImportResult;
  onUpdateStudy: (updates: Partial<StudyData>) => void;
}

export const ClinicalContextPanel: React.FC<ClinicalContextPanelProps> = ({
  studyData,
  examType = 'carotid',
  initialReferralData,
  onUpdateStudy,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Normalized clinical context
  const context: ClinicalContextData = useMemo(() => {
    return getNormalizedClinicalContext(studyData);
  }, [
    studyData.clinicalContext,
    studyData.clinicalIndications,
    studyData.vascularHistory,
    studyData.studyComments,
    studyData.symptomSide,
  ]);

  // Exam vocabulary template
  const template = useMemo(() => {
    return getContextTemplate(examType);
  }, [examType]);

  // Summary statistics for collapsed header
  const summary = useMemo(() => {
    return generateClinicalContextSummary(context);
  }, [context]);

  // Unified context updater
  const handleUpdateContext = (updater: (prev: ClinicalContextData) => ClinicalContextData) => {
    const updated = updater(context);

    // Keep legacy string / array fields in sync on StudyData for backward compatibility
    const updatedIndications = updated.indications.map(i => i.label);
    const updatedHistoryStr = updated.history.map(h => h.label).join(', ');
    const updatedNotesStr = updated.additionalNotes || '';
    const updatedSymptomSide = updated.conditionalAnswers?.symptomSide || studyData.symptomSide || 'none';

    onUpdateStudy({
      clinicalContext: updated,
      clinicalIndications: updatedIndications,
      vascularHistory: updatedHistoryStr,
      studyComments: updatedNotesStr,
      symptomSide: updatedSymptomSide,
      symptomatic: updated.indications.some(i => {
        const l = i.label.toLowerCase();
        return l.includes('tia') || l.includes('stroke') || l.includes('visual') || l.includes('amaurosis');
      }),
    });
  };

  const isImported = summary.provenance === 'imported';

  return (
    <div
      id="clinical-details-referral-context-panel"
      className="bg-[#0b1329] border border-slate-800 rounded-xl shadow-md overflow-hidden transition-all"
    >
      {/* Header Bar / Summary Trigger */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-3.5 sm:p-4 bg-[#0d162f] cursor-pointer hover:bg-[#101c3d] transition-all"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Left: Section Title & Badges */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs sm:text-sm font-black text-slate-100 uppercase tracking-wide">
                  Clinical Details & Referral Context
                </span>
                
                {summary.totalItems > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300 font-mono font-bold border border-slate-700">
                    {summary.totalItems} {summary.totalItems === 1 ? 'ITEM' : 'ITEMS'}
                  </span>
                )}

                {isImported ? (
                  <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700 font-mono font-bold">
                    <Download className="w-2.5 h-2.5" />
                    Imported
                  </span>
                ) : !summary.isEmpty ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-400 border border-slate-700 font-mono font-medium">
                    Manual Entry
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          {/* Right: Toggle Button */}
          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <button
              type="button"
              id="toggle-clinical-context-expand"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                isExpanded
                  ? 'bg-cyan-600 text-slate-950 border-cyan-500 font-extrabold shadow-sm'
                  : 'bg-[#0f172a] text-cyan-400 border-slate-700 hover:bg-[#1e293b] hover:text-cyan-300'
              }`}
            >
              <span>{isExpanded ? 'Collapse' : 'Expand & Edit'}</span>
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Collapsed Compact Summary View */}
        {!isExpanded && (
          <ClinicalContextSummary context={context} />
        )}
      </div>

      {/* Expanded Editing Body */}
      {isExpanded && (
        <ClinicalContextEditor
          context={context}
          template={template}
          onChangeContext={handleUpdateContext}
        />
      )}
    </div>
  );
};
