import React from 'react';
import { ReferralSource } from '../../types/clinicalContext';
import { FileText, Download, Edit3, Shield } from 'lucide-react';

interface ReferralSourcePanelProps {
  referral?: ReferralSource;
  onChange: (referral: ReferralSource) => void;
}

export const ReferralSourcePanel: React.FC<ReferralSourcePanelProps> = ({
  referral,
  onChange,
}) => {
  const isImported = referral?.source === 'electronic_referral' || referral?.source === 'ris';
  const rawText = referral?.rawText || '';

  const handleTextChange = (text: string) => {
    onChange({
      rawText: text,
      source: referral?.source || 'manual',
      importedAt: referral?.importedAt,
      sourceId: referral?.sourceId,
    });
  };

  return (
    <div className="p-3.5 rounded-xl bg-[#0b1329] border border-slate-800 space-y-2.5">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <FileText className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wide">
            Original Referral
          </span>
          {isImported ? (
            <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800 font-semibold font-mono">
              <Download className="w-2.5 h-2.5" />
              Imported from referral
            </span>
          ) : (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-400 border border-slate-700 font-semibold font-mono">
              Manual entry
            </span>
          )}
        </div>
        <span className="text-[10px] text-slate-400 hidden sm:inline">
          Preserved separately from structured interpretation
        </span>
      </div>

      <textarea
        id="textarea-original-referral-text"
        rows={2}
        placeholder="Enter or paste electronic referral text, clinical question, or RIS order details..."
        value={rawText}
        onChange={(e) => handleTextChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg bg-[#080d19] border border-slate-700/80 text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition-all leading-relaxed"
      />
    </div>
  );
};
