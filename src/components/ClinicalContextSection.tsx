import React, { useState } from 'react';
import { StudyData, ArchVariant, BifurcationVariant } from '../types';
import { CAROTID_INDICATIONS } from '../constants';
import { FileText, ShieldAlert, Check, ChevronDown, ChevronUp, Activity, AlertCircle, Sparkles, Tag, GitFork } from 'lucide-react';

interface ClinicalContextSectionProps {
  studyData: StudyData;
  onUpdateStudy: (updates: Partial<StudyData>) => void;
}

const COMMON_LIMITATIONS = [
  'Acoustic shadowing from calcification',
  'Vessel tortuosity / kinking',
  'High carotid bifurcation (submandibular)',
  'Deep vessel position',
  'Patient body habitus / short neck',
  'Patient movement / tachypnoea',
  'Poor acoustic window',
  'Dense vessel wall calcification'
];

export const ClinicalContextSection: React.FC<ClinicalContextSectionProps> = ({
  studyData,
  onUpdateStudy,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [activeSubTab, setActiveSubTab] = useState<'indications' | 'history' | 'limitations' | 'anatomy'>('indications');

  const handleIndicationToggle = (ind: string) => {
    const current = [...studyData.clinicalIndications];
    const index = current.indexOf(ind);
    if (index >= 0) {
      current.splice(index, 1);
    } else {
      current.push(ind);
    }
    onUpdateStudy({ clinicalIndications: current });
  };

  const handleToggleLimitation = (limitation: string) => {
    let currentComments = studyData.studyComments || '';
    if (currentComments.includes(limitation)) {
      // Remove it
      const regex = new RegExp(`(?:,\\s*)?${limitation}`, 'g');
      currentComments = currentComments.replace(regex, '').replace(/^,\s*/, '').trim();
    } else {
      // Add it
      currentComments = currentComments ? `${currentComments}, ${limitation}` : limitation;
    }
    onUpdateStudy({ studyComments: currentComments });
  };

  const indicationCount = studyData.clinicalIndications.length;
  const historyText = studyData.vascularHistory.trim();
  const limitationsText = studyData.studyComments.trim();
  const archVariantLabel =
    studyData.anatomyVariants?.archVariant === 'bovine_common_origin'
      ? 'Bovine Arch'
      : studyData.anatomyVariants?.archVariant === 'left_vertebral_from_arch'
      ? 'L Vert from Arch'
      : studyData.anatomyVariants?.archVariant === 'aberrant_right_subclavian'
      ? 'Aberrant R Subcl'
      : studyData.anatomyVariants?.archVariant === 'separate_rcca_and_rsa'
      ? 'Separate RCCA/RSA'
      : studyData.variantLeftBct
      ? 'Variant BCT'
      : 'Standard Arch';

  return (
    <div
      id="clinical-context-section"
      className="bg-[#0b1329] border border-slate-800 rounded-xl shadow-md overflow-hidden transition-all"
    >
      {/* Header Bar / Summary Trigger */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-3 sm:p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-2.5 bg-[#0d162f] cursor-pointer hover:bg-[#101c3d] transition-all"
      >
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            <FileText className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-slate-100 uppercase tracking-wider">
                Clinical Indications & Context
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                {indicationCount} Indication{indicationCount !== 1 ? 's' : ''}
              </span>
            </div>
            {/* Collapsed quick preview line */}
            <div className="text-[11px] text-slate-400 flex items-center gap-2 flex-wrap mt-0.5">
              <span>
                Indications:{' '}
                <strong className="text-slate-200">
                  {indicationCount > 0 ? studyData.clinicalIndications.slice(0, 2).join(', ') + (indicationCount > 2 ? ` +${indicationCount - 2} more` : '') : 'None specified'}
                </strong>
              </span>
              <span>•</span>
              <span>
                History:{' '}
                <strong className="text-slate-200">
                  {historyText ? (historyText.length > 25 ? historyText.substring(0, 25) + '…' : historyText) : 'None documented'}
                </strong>
              </span>
              <span>•</span>
              <span>
                Anatomy: <strong className="text-cyan-400">{archVariantLabel}</strong>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-center shrink-0">
          <button
            type="button"
            className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            <span>{isExpanded ? 'Collapse' : 'Expand & Edit'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expanded Accordion Body */}
      {isExpanded && (
        <div className="p-4 sm:p-5 bg-[#090f20] border-t border-slate-800 space-y-4 animate-in fade-in duration-200">
          {/* Internal sub-tab pills */}
          <div className="flex items-center gap-1.5 border-b border-slate-800/80 pb-2 overflow-x-auto">
            {[
              { id: 'indications', label: 'Indications & Presentation', count: indicationCount },
              { id: 'history', label: 'Vascular History & Risks', count: historyText ? 1 : 0 },
              { id: 'limitations', label: 'Technical Limitations & Notes', count: limitationsText ? 1 : 0 },
              { id: 'anatomy', label: 'Anatomy Variants', count: studyData.anatomyVariants?.archVariant !== 'standard' ? 1 : 0 },
            ].map(subTab => (
              <button
                key={subTab.id}
                type="button"
                id={`subtab-${subTab.id}`}
                onClick={() => setActiveSubTab(subTab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeSubTab === subTab.id
                    ? 'bg-cyan-600 text-slate-950 font-extrabold shadow-sm'
                    : 'bg-[#0f172a] text-slate-300 hover:bg-[#1e293b]'
                }`}
              >
                <span>{subTab.label}</span>
                {subTab.count > 0 && (
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                    activeSubTab === subTab.id ? 'bg-slate-950 text-cyan-300' : 'bg-slate-800 text-cyan-400'
                  }`}>
                    {subTab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Sub-tab 1: Indications */}
          {activeSubTab === 'indications' && (
            <div className="space-y-4">
              {/* Symptom Side & Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg bg-[#0f172a] border border-slate-800">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-slate-200">Patient Presentation Status:</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => onUpdateStudy({ symptomatic: false, symptomSide: 'none' })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      !studyData.symptomatic
                        ? 'bg-emerald-600 text-slate-950 font-black shadow-sm'
                        : 'bg-[#0b101f] text-slate-300 border border-slate-700 hover:bg-slate-800'
                    }`}
                  >
                    Asymptomatic
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateStudy({ symptomatic: true })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      studyData.symptomatic
                        ? 'bg-amber-600 text-slate-950 font-black shadow-sm'
                        : 'bg-[#0b101f] text-slate-300 border border-slate-700 hover:bg-slate-800'
                    }`}
                  >
                    Symptomatic
                  </button>
                  {studyData.symptomatic && (
                    <select
                      id="select-context-symptom-side"
                      value={studyData.symptomSide}
                      onChange={(e) => onUpdateStudy({ symptomSide: e.target.value as any })}
                      className="px-2.5 py-1.5 rounded-lg bg-amber-950/80 border border-amber-600 text-xs font-bold text-amber-200 focus:outline-none"
                    >
                      <option value="none">Side Unspecified</option>
                      <option value="right">Right Hemisphere / Eye Symptoms</option>
                      <option value="left">Left Hemisphere / Eye Symptoms</option>
                      <option value="bilateral">Bilateral / Vertebrobasilar Symptoms</option>
                    </select>
                  )}
                </div>
              </div>

              {/* Indications Grid */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">
                  Select Study Indications:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                  {CAROTID_INDICATIONS.map(ind => {
                    const isSelected = studyData.clinicalIndications.includes(ind);
                    return (
                      <button
                        key={ind}
                        type="button"
                        onClick={() => handleIndicationToggle(ind)}
                        className={`p-2 rounded-lg border text-left text-[11px] font-medium flex items-start gap-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-cyan-950/50 border-cyan-500 text-cyan-200 shadow-sm'
                            : 'bg-[#0f172a] border-slate-800 text-slate-300 hover:bg-[#152038]'
                        }`}
                      >
                        <div className={`w-3.5 h-3.5 rounded flex items-center justify-center shrink-0 mt-0.5 border ${
                          isSelected ? 'bg-cyan-600 border-cyan-600 text-slate-950' : 'border-slate-700 bg-[#0b101f]'
                        }`}>
                          {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                        <span className="leading-tight">{ind}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Sub-tab 2: Vascular History */}
          {activeSubTab === 'history' && (
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">
                  Prior Vascular Procedures & Neurological Events:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    'Prior carotid surgery (CEA)',
                    'Prior carotid stent (CAS)',
                    'Prior stroke / CVA',
                    'Prior TIA',
                    'Previous carotid ultrasound',
                    'Coronary artery disease',
                    'Peripheral arterial disease',
                    'Atrial fibrillation'
                  ].map(item => {
                    const isIncluded = studyData.vascularHistory.includes(item);
                    const handleToggleHistory = () => {
                      let currentArr = studyData.vascularHistory ? studyData.vascularHistory.split(', ').filter(Boolean) : [];
                      if (isIncluded) {
                        currentArr = currentArr.filter(x => x !== item);
                      } else {
                        currentArr.push(item);
                      }
                      onUpdateStudy({ vascularHistory: currentArr.join(', ') });
                    };
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={handleToggleHistory}
                        className={`p-2 rounded-lg border text-left text-[11px] font-medium flex items-center gap-2 transition-all cursor-pointer ${
                          isIncluded
                            ? 'bg-cyan-950/50 border-cyan-500 text-cyan-200'
                            : 'bg-[#0f172a] border-slate-800 text-slate-300 hover:bg-[#152038]'
                        }`}
                      >
                        <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border shrink-0 ${
                          isIncluded ? 'bg-cyan-600 border-cyan-600 text-slate-950' : 'border-slate-700 bg-[#0b101f]'
                        }`}>
                          {isIncluded && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                        <span className="truncate">{item}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Vascular History & Risk Factors Notes:
                </label>
                <textarea
                  id="textarea-context-vascular-history"
                  rows={2}
                  placeholder="e.g. Hypertension, dyslipidaemia, smoking history, family history of stroke..."
                  value={studyData.vascularHistory}
                  onChange={(e) => onUpdateStudy({ vascularHistory: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#0f172a] border border-slate-700 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Sub-tab 3: Technical Limitations */}
          {activeSubTab === 'limitations' && (
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">
                  Quick Technical Limitation Tags:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                  {COMMON_LIMITATIONS.map(lim => {
                    const isSelected = studyData.studyComments?.includes(lim);
                    return (
                      <button
                        key={lim}
                        type="button"
                        onClick={() => handleToggleLimitation(lim)}
                        className={`p-2 rounded-lg border text-left text-[11px] font-medium flex items-center gap-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-950/40 border-amber-500 text-amber-200'
                            : 'bg-[#0f172a] border-slate-800 text-slate-300 hover:bg-[#152038]'
                        }`}
                      >
                        <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border shrink-0 ${
                          isSelected ? 'bg-amber-600 border-amber-600 text-slate-950' : 'border-slate-700 bg-[#0b101f]'
                        }`}>
                          {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                        <span className="leading-tight">{lim}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Examination Comments & Limitations Free-Text:
                </label>
                <textarea
                  id="textarea-context-study-comments"
                  rows={2}
                  placeholder="Document acoustic shadowing, vessel depth, positioning difficulties, or examination caveats..."
                  value={studyData.studyComments}
                  onChange={(e) => onUpdateStudy({ studyComments: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#0f172a] border border-slate-700 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Sub-tab 4: Anatomy Variants */}
          {activeSubTab === 'anatomy' && (
            <div className="space-y-4">
              <div className="p-3 bg-[#0f172a] rounded-lg border border-slate-800 space-y-3">
                <div className="flex items-center gap-2">
                  <GitFork className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-slate-200">
                    Aortic Arch & Carotid Bifurcation Anatomy:
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                      Aortic Arch Branch Configuration:
                    </label>
                    <select
                      value={studyData.anatomyVariants?.archVariant || 'standard'}
                      onChange={(e) => {
                        const newArch = e.target.value as ArchVariant;
                        onUpdateStudy({
                          anatomyVariants: {
                            ...studyData.anatomyVariants,
                            archVariant: newArch,
                          },
                          variantLeftBct: newArch === 'bovine_common_origin',
                        });
                      }}
                      className="w-full px-3 py-1.5 rounded-lg bg-[#0b101f] border border-slate-700 text-xs font-bold text-slate-100 focus:border-cyan-500 focus:outline-none"
                    >
                      <option value="standard">Standard Trifurcation (BCT, LCCA, LSA)</option>
                      <option value="bovine_common_origin">Bovine Arch (Common Origin of BCT & LCCA)</option>
                      <option value="left_vertebral_from_arch">Left Vertebral Directly from Arch</option>
                      <option value="aberrant_right_subclavian">Aberrant Right Subclavian (Retro-oesophageal)</option>
                      <option value="separate_rcca_and_rsa">Separate RCCA and RSA Direct from Arch</option>
                      <option value="other">Other Anatomical Variation</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                      Carotid Bifurcation Level:
                    </label>
                    <select
                      value={studyData.anatomyVariants?.bifurcationVariant || 'normal'}
                      onChange={(e) => {
                        onUpdateStudy({
                          anatomyVariants: {
                            ...studyData.anatomyVariants,
                            bifurcationVariant: e.target.value as BifurcationVariant,
                          },
                        });
                      }}
                      className="w-full px-3 py-1.5 rounded-lg bg-[#0b101f] border border-slate-700 text-xs font-bold text-slate-100 focus:border-cyan-500 focus:outline-none"
                    >
                      <option value="normal">Standard Mid-Cervical Level (C3-C4 / Thyroid Cartilage)</option>
                      <option value="high">High Bifurcation (C1-C2 / Submandibular)</option>
                      <option value="low">Low Bifurcation (C5-C6 / Supraclavicular)</option>
                    </select>
                  </div>
                </div>

                <p className="text-[10px] text-cyan-400/90 italic">
                  Tip: You can also switch variations visually using the compact tabs directly above the Anatomical Map diagram.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
