import React, { useState } from 'react';
import { StudyData, ArchVariant, BifurcationVariant } from '../types';
import { CAROTID_INDICATIONS } from '../constants';
import { AUSTRALIA_DEFAULT_CONFIG } from '../data/protocols/australia';
import { UNITED_STATES_DEFAULT_CONFIG } from '../data/protocols/unitedStates';
import { UNIVERSAL_CORE_DEFAULT_DATASET } from '../data/protocols/universalCore';
import { FileText, ShieldAlert, Check, ChevronDown, ChevronUp, Activity, AlertCircle, Sparkles, Tag, GitFork, Sliders } from 'lucide-react';

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

  const currentPresetId = studyData.siteProtocol?.protocolPresetId ||
    (studyData.classificationSystem === 'IAC_MODIFIED_SRU_2023' || studyData.classificationSystem === 'MODIFIED_SRU_2021'
      ? 'united_states_iac'
      : 'australia_asum');

  const handleSelectPreset = (presetId: string) => {
    if (presetId === 'australia_asum') {
      onUpdateStudy({
        classificationSystem: 'ASUM_2021',
        siteProtocol: {
          ...AUSTRALIA_DEFAULT_CONFIG,
          protocolPresetId: 'australia_asum',
          localProtocolName: 'Australian Standard Carotid Duplex Protocol'
        }
      });
    } else if (presetId === 'united_states_iac') {
      onUpdateStudy({
        classificationSystem: 'IAC_MODIFIED_SRU_2023',
        siteProtocol: {
          ...UNITED_STATES_DEFAULT_CONFIG,
          protocolPresetId: 'united_states_iac',
          localProtocolName: 'US IAC Carotid Duplex Performance Protocol'
        }
      });
    } else if (presetId === 'universal_core') {
      onUpdateStudy({
        classificationSystem: 'ASUM_2021',
        siteProtocol: {
          ...AUSTRALIA_DEFAULT_CONFIG,
          protocolPresetId: 'universal_core',
          localProtocolName: 'Universal Core Carotid Protocol',
          segmentRequirements: { ...UNIVERSAL_CORE_DEFAULT_DATASET }
        }
      });
    } else if (presetId === 'custom_site') {
      onUpdateStudy({
        classificationSystem: 'CUSTOM',
        siteProtocol: {
          ...(studyData.siteProtocol || AUSTRALIA_DEFAULT_CONFIG),
          protocolPresetId: 'custom_site',
          localProtocolName: studyData.siteProtocol?.localProtocolName || 'Custom Site Protocol'
        }
      });
    }
  };

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
  
  const historyItems = historyText
    ? historyText.split(/[,;\n]+/).map(s => s.trim()).filter(Boolean)
    : [];

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

  const protocolDisplayNames: Record<string, string> = {
    australia_asum: 'Australia — ASUM',
    united_states_iac: 'United States — IAC',
    universal_core: 'Universal / Core Carotid',
    custom_site: 'Site Specific / Custom'
  };

  return (
    <div
      id="clinical-context-section"
      className="bg-[#0b1329] border border-slate-800 rounded-xl shadow-md overflow-hidden transition-all"
    >
      {/* Header Bar / Summary Trigger */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-3.5 sm:p-4 bg-[#0d162f] cursor-pointer hover:bg-[#101c3d] transition-all"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Left: Title & Count */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs sm:text-sm font-black text-slate-100 uppercase tracking-wide">
                  Clinical Indications & Context
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono font-bold border border-slate-700">
                  {indicationCount} Indication{indicationCount !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Protocol Preset Selector & Toggle Button */}
          <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
            {/* Single Unified Protocol Preset Control */}
            <div
              className="flex items-center gap-1.5 bg-[#080d19] px-2.5 py-1.5 rounded-lg border border-cyan-700/80 shadow-xs"
              onClick={(e) => e.stopPropagation()}
              title="Select active clinical duplex protocol preset"
            >
              <Sliders className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <select
                id="select-clinical-protocol-preset"
                value={currentPresetId}
                onChange={(e) => handleSelectPreset(e.target.value)}
                className="bg-transparent text-cyan-300 text-xs font-black focus:outline-none cursor-pointer pr-1"
              >
                <option value="australia_asum" className="bg-[#0b1329] text-slate-100 font-bold">ASUM 2021 preset</option>
                <option value="united_states_iac" className="bg-[#0b1329] text-slate-100 font-bold">IAC 2023 preset</option>
                <option value="universal_core" className="bg-[#0b1329] text-slate-100 font-bold">Universal Core preset</option>
                <option value="custom_site" className="bg-[#0b1329] text-slate-100 font-bold">Custom Site preset</option>
              </select>
            </div>

            <button
              type="button"
              id="toggle-clinical-context-expand"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                isExpanded
                  ? 'bg-cyan-600 text-slate-950 border-cyan-500 font-extrabold'
                  : 'bg-[#0f172a] text-cyan-400 border-slate-700 hover:bg-[#1e293b] hover:text-cyan-300'
              }`}
            >
              <span>{isExpanded ? 'Collapse' : 'Expand & Edit'}</span>
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Collapsed Complete Summary Display (Shows ALL selected items wrapped with no truncation) */}
        {!isExpanded && (
          <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2.5 text-xs">
            {/* Row 1: All Indications as chips */}
            <div className="flex flex-wrap items-start gap-1.5">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider shrink-0 mt-0.5 w-36">
                Indications:
              </span>
              <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-[200px]">
                {studyData.clinicalIndications.length > 0 ? (
                  studyData.clinicalIndications.map(ind => (
                    <span
                      key={ind}
                      className="px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-800/80 text-cyan-200 text-[11px] font-semibold tracking-tight shadow-xs"
                    >
                      {ind}
                    </span>
                  ))
                ) : (
                  <span className="text-[11px] text-slate-400 italic font-sans">
                    No indications selected
                  </span>
                )}
              </div>
            </div>

            {/* Row 2: History and Risk Factors chips */}
            <div className="flex flex-wrap items-start gap-1.5">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider shrink-0 mt-0.5 w-36">
                History / Risk Factors:
              </span>
              <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-[200px]">
                {historyItems.length > 0 ? (
                  historyItems.map((hist, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-slate-800/90 border border-slate-700 text-slate-200 text-[11px] font-medium shadow-xs"
                    >
                      {hist}
                    </span>
                  ))
                ) : (
                  <span className="text-[11px] text-slate-400 italic font-sans">
                    No relevant history recorded
                  </span>
                )}
              </div>
            </div>

            {/* Row 3: Anatomy and any Limitations */}
            <div className="flex flex-wrap items-start gap-1.5 pt-0.5">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider shrink-0 mt-0.5 w-36">
                Anatomy:
              </span>
              <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[200px]">
                <span className="px-2 py-0.5 rounded bg-indigo-950/70 border border-indigo-800 text-indigo-200 text-[11px] font-bold shadow-xs">
                  {archVariantLabel}
                </span>

                {limitationsText && (
                  <div className="flex items-center gap-1 text-[11px] text-slate-400 ml-2">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Notes:</span>
                    <span className="text-amber-300 font-medium truncate max-w-xs">{limitationsText}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Expanded Accordion Body */}
      {isExpanded && (
        <div className="p-4 sm:p-5 bg-[#090f20] border-t border-slate-800 space-y-4 animate-in fade-in duration-200">
          {/* Internal sub-tab pills */}
          <div className="flex items-center gap-1.5 border-b border-slate-800/80 pb-2 overflow-x-auto">
            {[
              { id: 'indications', label: 'Indications & Presentation', count: indicationCount },
              { id: 'history', label: 'Vascular History & Risks', count: historyItems.length },
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
