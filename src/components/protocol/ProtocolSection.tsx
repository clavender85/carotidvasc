import React, { useState } from 'react';
import { ProtocolSectionItem } from '../../data/protocols/universalCore';
import { SiteOverrideItem } from '../../utils/protocolEngine';
import { ChevronDown, ChevronRight, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';

interface ProtocolSectionProps {
  sections: ProtocolSectionItem[];
  siteOverrides: SiteOverrideItem[];
}

export const ProtocolSection: React.FC<ProtocolSectionProps> = ({
  sections,
  siteOverrides
}) => {
  // State for expanded accordions
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'section_a_purpose': true,
    'section_b_scope': true,
    'section_h_dataset': true,
    'section_j_ica_stenosis': true,
  });

  const toggleSection = (id: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    sections.forEach(s => { all[s.id] = true; });
    setExpandedSections(all);
  };

  const collapseAll = () => {
    setExpandedSections({});
  };

  // Helper to check if this section has an active site override
  const getSectionOverride = (sectionLetter: string): SiteOverrideItem | undefined => {
    if (sectionLetter === 'P' || sectionLetter === 'B') {
      return siteOverrides.find(o => o.key === 'subclavianRoutine');
    }
    if (sectionLetter === 'O') {
      return siteOverrides.find(o => o.key === 'vertebralExtent');
    }
    if (sectionLetter === 'E' || sectionLetter === 'H') {
      return siteOverrides.find(o => o.key === 'ccaExtent');
    }
    if (sectionLetter === 'S') {
      return siteOverrides.find(o => o.key === 'specialExamType');
    }
    return undefined;
  };

  return (
    <div id="universal-core-protocol-spec" className="space-y-4">
      
      {/* Header with expand/collapse all */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2">
        <div>
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            Universal Core Examination Framework (Sections A – T)
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Standard clinical requirements from which regional templates and site addenda inherit
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={expandAll}
            className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 px-2 py-1 rounded bg-slate-800/80 border border-slate-700 hover:bg-slate-700 cursor-pointer"
          >
            Expand All
          </button>
          <button
            type="button"
            onClick={collapseAll}
            className="text-[11px] font-bold text-slate-400 hover:text-slate-300 px-2 py-1 rounded bg-slate-800/80 border border-slate-700 hover:bg-slate-700 cursor-pointer"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Accordion List */}
      <div className="space-y-2.5">
        {sections.map(sec => {
          const isOpen = !!expandedSections[sec.id];
          const override = getSectionOverride(sec.letter);

          return (
            <div
              key={sec.id}
              id={`protocol-accordion-${sec.id}`}
              className="bg-[#0f172a] border border-slate-800 rounded-2xl overflow-hidden shadow-sm transition-all"
            >
              {/* Accordion Header */}
              <button
                type="button"
                onClick={() => toggleSection(sec.id)}
                className="w-full px-4 py-3.5 flex items-center justify-between gap-3 text-left hover:bg-slate-800/40 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-6 h-6 rounded-lg bg-cyan-950/80 border border-cyan-800/70 text-cyan-400 text-xs font-black flex items-center justify-center shrink-0">
                    {sec.letter}
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-100 truncate">
                      {sec.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 truncate hidden sm:block">
                      {sec.summary}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  {override && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-950/70 border border-amber-800 text-amber-300 text-[10px] font-bold">
                      Site Override Active
                    </span>
                  )}
                  <div className="w-5 h-5 rounded-md bg-slate-800 flex items-center justify-center text-slate-400">
                    {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  </div>
                </div>
              </button>

              {/* Accordion Body */}
              {isOpen && (
                <div className="px-5 pb-5 pt-2 border-t border-slate-800/80 space-y-3.5 text-xs text-slate-300">
                  
                  {/* Site Override Warning Banner if applicable */}
                  {override && (
                    <div className="bg-amber-950/30 border border-amber-800/60 rounded-xl p-3 flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <span className="font-bold text-amber-300 block">
                          Site-Specific Override: {override.label}
                        </span>
                        <div className="text-slate-300 mt-0.5 flex flex-wrap gap-x-4">
                          <span>Local Site Policy: <strong className="text-amber-200">{override.siteValue}</strong></span>
                          <span>Universal Recommendation: <span className="text-slate-400">{override.universalValue}</span></span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Section Paragraphs */}
                  <div className="space-y-2 leading-relaxed text-slate-300">
                    {sec.content.map((p, idx) => (
                      <p key={idx} className="whitespace-pre-line">
                        {p}
                      </p>
                    ))}
                  </div>

                  {/* Key Rules Callout */}
                  {sec.keyRules && sec.keyRules.length > 0 && (
                    <div className="bg-[#131d35] border border-cyan-900/40 rounded-xl p-3 space-y-1.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Protocol Quality Mandates
                      </span>
                      <ul className="space-y-1 text-[11px] text-slate-300 pl-1">
                        {sec.keyRules.map((r, rIdx) => (
                          <li key={rIdx} className="flex items-start gap-1.5">
                            <span className="text-cyan-400 font-bold">•</span>
                            <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};
