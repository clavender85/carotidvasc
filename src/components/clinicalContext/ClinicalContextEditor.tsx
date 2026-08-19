import React from 'react';
import { ClinicalContextData, ClinicalContextItem, ClinicalContextTemplate } from '../../types/clinicalContext';
import { ReferralSourcePanel } from './ReferralSourcePanel';
import { ContextMultiSelect } from './ContextMultiSelect';
import { PriorImagingEditor } from './PriorImagingEditor';
import { ConditionalContextFields } from './ConditionalContextFields';
import { StickyNote } from 'lucide-react';

interface ClinicalContextEditorProps {
  context: ClinicalContextData;
  template: ClinicalContextTemplate;
  onChangeContext: (updater: (prev: ClinicalContextData) => ClinicalContextData) => void;
}

export const ClinicalContextEditor: React.FC<ClinicalContextEditorProps> = ({
  context,
  template,
  onChangeContext,
}) => {
  // Handlers for Indications
  const handleAddIndication = (item: Omit<ClinicalContextItem, 'id'>) => {
    onChangeContext(prev => ({
      ...prev,
      indications: [
        ...prev.indications,
        { ...item, id: `ind_${Date.now()}_${Math.random().toString(36).substr(2, 5)}` },
      ],
    }));
  };

  const handleRemoveIndication = (id: string) => {
    onChangeContext(prev => ({
      ...prev,
      indications: prev.indications.filter(i => i.id !== id),
    }));
  };

  // Handlers for History
  const handleAddHistory = (item: Omit<ClinicalContextItem, 'id'>) => {
    onChangeContext(prev => ({
      ...prev,
      history: [
        ...prev.history,
        { ...item, id: `hist_${Date.now()}_${Math.random().toString(36).substr(2, 5)}` },
      ],
    }));
  };

  const handleRemoveHistory = (id: string) => {
    onChangeContext(prev => ({
      ...prev,
      history: prev.history.filter(i => i.id !== id),
    }));
  };

  // Handlers for Prior Imaging / Procedures
  const handleAddPriorImaging = (item: Omit<ClinicalContextItem, 'id'>) => {
    onChangeContext(prev => ({
      ...prev,
      priorImaging: [
        ...prev.priorImaging,
        { ...item, id: `prior_${Date.now()}_${Math.random().toString(36).substr(2, 5)}` },
      ],
    }));
  };

  const handleRemovePriorImaging = (id: string) => {
    onChangeContext(prev => ({
      ...prev,
      priorImaging: prev.priorImaging.filter(i => i.id !== id),
    }));
  };

  // Handler for Conditional Answers
  const handleConditionalAnswer = (fieldId: string, value: any) => {
    onChangeContext(prev => ({
      ...prev,
      conditionalAnswers: {
        ...(prev.conditionalAnswers || {}),
        [fieldId]: value,
      },
    }));
  };

  return (
    <div className="p-4 sm:p-5 bg-[#090f20] border-t border-slate-800 space-y-4 animate-in fade-in duration-150">
      {/* 1. Original Referral Panel (Full Width) */}
      <ReferralSourcePanel
        referral={context.referral}
        onChange={(ref) => onChangeContext(prev => ({ ...prev, referral: ref }))}
      />

      {/* 2 & 3. Responsive 2-Column Row for Indications & Relevant History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Category: INDICATIONS */}
        <div className="p-3.5 rounded-xl bg-[#0b1329] border border-slate-800 space-y-3 flex flex-col justify-between">
          <ContextMultiSelect
            category="indication"
            title="Clinical Indications (Reason for Exam)"
            selectedItems={context.indications}
            availableOptions={template.indicationOptions}
            onAddItem={handleAddIndication}
            onRemoveItem={handleRemoveIndication}
            placeholder="Search indications or add custom clinical question..."
          />

          {/* Conditional Context Questions triggered by specific indications */}
          {template.conditionalQuestions && template.conditionalQuestions.length > 0 && (
            <ConditionalContextFields
              context={context}
              rules={template.conditionalQuestions}
              onChangeAnswer={handleConditionalAnswer}
            />
          )}
        </div>

        {/* Category: RELEVANT HISTORY */}
        <div className="p-3.5 rounded-xl bg-[#0b1329] border border-slate-800 flex flex-col">
          <ContextMultiSelect
            category="history"
            title="Relevant Medical & Surgical History"
            selectedItems={context.history}
            availableOptions={template.historyOptions}
            onAddItem={handleAddHistory}
            onRemoveItem={handleRemoveHistory}
            placeholder="Search history / risk factors or add custom history..."
          />
        </div>
      </div>

      {/* 4 & 5. Responsive 2-Column Row for Prior Imaging & Clinical Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Category: PRIOR IMAGING / PROCEDURES */}
        <div className="p-3.5 rounded-xl bg-[#0b1329] border border-slate-800">
          <PriorImagingEditor
            items={context.priorImaging}
            availableProcedures={template.priorProcedureOptions}
            onAddItem={handleAddPriorImaging}
            onRemoveItem={handleRemovePriorImaging}
          />
        </div>

        {/* Category: ADDITIONAL CLINICAL NOTES */}
        <div className="p-3.5 rounded-xl bg-[#0b1329] border border-slate-800 flex flex-col justify-between space-y-2">
          <div className="flex items-center gap-1.5">
            <StickyNote className="w-3.5 h-3.5 text-cyan-400" />
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
              Additional Clinical & Technical Notes
            </label>
          </div>
          <textarea
            id="textarea-additional-clinical-notes"
            rows={3}
            placeholder="Supplementary sonographer observations, patient mobility/cooperation, unusual presentation details..."
            value={context.additionalNotes}
            onChange={(e) => onChangeContext(prev => ({ ...prev, additionalNotes: e.target.value }))}
            className="w-full h-full min-h-[90px] px-3 py-2 rounded-lg bg-[#080d19] border border-slate-700/80 text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
};
