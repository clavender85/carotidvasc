import React from 'react';
import { ClinicalContextData, ConditionalContextRule } from '../../types/clinicalContext';
import { AlertCircle } from 'lucide-react';

interface ConditionalContextFieldsProps {
  context: ClinicalContextData;
  rules?: ConditionalContextRule[];
  onChangeAnswer: (fieldId: string, value: any) => void;
}

export const ConditionalContextFields: React.FC<ConditionalContextFieldsProps> = ({
  context,
  rules = [],
  onChangeAnswer,
}) => {
  const activeRules = rules.filter(rule => rule.triggerCondition(context));

  if (activeRules.length === 0) return null;

  return (
    <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-800/50 space-y-3 animate-in fade-in duration-150">
      <div className="flex items-center gap-2">
        <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
        <span className="text-[11px] font-bold text-amber-200 uppercase tracking-wider">
          Indication-Specific Context Questions
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {activeRules.map(rule => {
          const currentValue = context.conditionalAnswers?.[rule.fieldId] || '';

          return (
            <div key={rule.id} className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-slate-200">
                  {rule.fieldLabel}
                </label>
                {rule.helpText && (
                  <span className="text-[9px] text-slate-500">{rule.helpText}</span>
                )}
              </div>

              {rule.fieldType === 'select' && rule.options && (
                <select
                  value={currentValue}
                  onChange={(e) => onChangeAnswer(rule.fieldId, e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-md bg-[#080d19] border border-amber-700/60 text-xs text-amber-100 font-semibold focus:border-amber-500 focus:outline-none"
                >
                  <option value="">-- Select option --</option>
                  {rule.options.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              )}

              {rule.fieldType === 'text' && (
                <input
                  type="text"
                  placeholder={rule.placeholder || 'Enter details...'}
                  value={currentValue}
                  onChange={(e) => onChangeAnswer(rule.fieldId, e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-md bg-[#080d19] border border-amber-700/60 text-xs text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
