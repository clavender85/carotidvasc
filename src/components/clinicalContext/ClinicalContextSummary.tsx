import React from 'react';
import { ClinicalContextData } from '../../types/clinicalContext';
import { generateClinicalContextSummary } from '../../utils/clinicalContextSummary';

interface ClinicalContextSummaryProps {
  context: ClinicalContextData;
}

export const ClinicalContextSummary: React.FC<ClinicalContextSummaryProps> = ({ context }) => {
  const summary = generateClinicalContextSummary(context);

  if (summary.isEmpty) {
    return (
      <div className="mt-2.5 pt-2.5 border-t border-slate-800/80 text-xs text-slate-500 italic">
        No clinical information entered
      </div>
    );
  }

  return (
    <div className="mt-2.5 pt-2.5 border-t border-slate-800/80 space-y-1.5 text-xs">
      {/* 1. Indications */}
      {summary.indicationsText && (
        <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider shrink-0 sm:w-36">
            INDICATIONS:
          </span>
          <span className="text-cyan-200 font-semibold text-xs leading-tight">
            {summary.indicationsText}
          </span>
        </div>
      )}

      {/* 2. Relevant History */}
      {summary.historyText && (
        <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider shrink-0 sm:w-36">
            RELEVANT HISTORY:
          </span>
          <span className="text-slate-200 font-medium text-xs leading-tight">
            {summary.historyText}
          </span>
        </div>
      )}

      {/* 3. Prior Imaging / Procedures */}
      {summary.priorImagingText && (
        <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider shrink-0 sm:w-36">
            PRIOR IMAGING:
          </span>
          <span className="text-indigo-200 font-medium text-xs leading-tight">
            {summary.priorImagingText}
          </span>
        </div>
      )}

      {/* 4. Additional Notes (only shown if populated) */}
      {summary.notesText && (
        <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider shrink-0 sm:w-36">
            ADDITIONAL NOTES:
          </span>
          <span className="text-amber-300 font-medium text-xs leading-tight">
            {summary.notesText}
          </span>
        </div>
      )}
    </div>
  );
};
