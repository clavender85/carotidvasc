import React from 'react';
import { ClassificationSystem, SiteProtocolConfig } from '../../types';
import { AUSTRALIA_DEFAULT_CONFIG, AUSTRALIA_PROTOCOL_META } from '../../data/protocols/australia';
import { UNITED_STATES_DEFAULT_CONFIG, UNITED_STATES_PROTOCOL_META } from '../../data/protocols/unitedStates';
import { UNIVERSAL_CORE_DEFAULT_DATASET } from '../../data/protocols/universalCore';
import { Globe, CheckCircle2, ShieldCheck, Copy, ArrowRight } from 'lucide-react';

interface ProtocolPresetCardProps {
  activePresetId: string;
  activeCriteria: ClassificationSystem;
  onSelectPreset: (
    presetId: 'universal_core' | 'australia_asum' | 'united_states_iac' | 'custom_site',
    criteriaSystem: ClassificationSystem,
    defaultConfig: SiteProtocolConfig
  ) => void;
  onCloneAsSiteProtocol: () => void;
}

export const ProtocolPresetCard: React.FC<ProtocolPresetCardProps> = ({
  activePresetId,
  activeCriteria,
  onSelectPreset,
  onCloneAsSiteProtocol
}) => {
  return (
    <div id="protocol-preset-cards-section" className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h2 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <Globe className="w-4 h-4 text-cyan-400" />
          Standard Protocol Presets & Department Templates
        </h2>
        <span className="text-[11px] text-slate-400">
          Select standard base or customize with site-specific addendum
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Preset 1: Universal Core */}
        <div
          id="preset-card-universal-core"
          className={`border rounded-2xl p-4 flex flex-col justify-between transition-all relative shadow-md ${
            activePresetId === 'universal_core'
              ? 'bg-[#0f243a] border-cyan-500/80 ring-1 ring-cyan-500/50'
              : 'bg-[#0f172a] border-slate-800 hover:border-slate-700'
          }`}
        >
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-bold uppercase tracking-wider">
                UNIVERSAL CORE
              </span>
              <span className="px-2 py-0.5 rounded-full bg-blue-950/60 border border-blue-800 text-blue-300 text-[10px] font-bold">
                EVIDENCE BASE
              </span>
            </div>

            <h3 className="text-sm font-black text-slate-100 mt-2.5">
              Universal Core Carotid Duplex Template
            </h3>
            <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
              Comprehensive baseline examination framework with Section A–T procedural specifications.
            </p>

            <div className="mt-3 space-y-1 text-[11px] text-slate-300 bg-[#131d35] p-2.5 rounded-xl border border-slate-800/80">
              <div className="flex justify-between">
                <span className="text-slate-400">Stenosis Criteria:</span>
                <span className="font-semibold text-cyan-300">ASUM 2021 / Multi-system</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Diameter Method:</span>
                <span className="font-semibold text-emerald-300">NASCET supportive</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Subclavian:</span>
                <span className="font-semibold text-slate-300">Conditional</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
            {activePresetId === 'universal_core' ? (
              <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400">
                <CheckCircle2 className="w-4 h-4" /> Active Base Protocol
              </div>
            ) : (
              <button
                type="button"
                id="btn-use-universal-core"
                onClick={() => {
                  const uniConfig: SiteProtocolConfig = {
                    ...AUSTRALIA_DEFAULT_CONFIG,
                    protocolPresetId: 'universal_core',
                    localProtocolName: 'Universal Core Carotid Duplex Protocol',
                    organisation: 'Universal Standard',
                    site: 'Vascular Services',
                  };
                  onSelectPreset('universal_core', 'ASUM_2021', uniConfig);
                }}
                className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all text-center cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Use as Active Protocol</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Preset 2: Australia (ASUM 2021) */}
        <div
          id="preset-card-australia"
          className={`border rounded-2xl p-4 flex flex-col justify-between transition-all relative shadow-md ${
            activePresetId === 'australia_asum'
              ? 'bg-[#0f243a] border-cyan-500/80 ring-1 ring-cyan-500/50'
              : 'bg-[#0f172a] border-slate-800 hover:border-slate-700'
          }`}
        >
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="px-2 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-[10px] font-black uppercase tracking-wider">
                AUSTRALIA
              </span>
              <span className="px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-800 text-cyan-300 text-[10px] font-bold">
                ASUM 2021
              </span>
            </div>

            <h3 className="text-sm font-black text-slate-100 mt-2.5">
              Australian Standard Carotid Duplex
            </h3>
            <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
              ASUM 2021 consensus standard with distal CCA reference and NASCET supportive diameter reduction.
            </p>

            <div className="mt-3 space-y-1 text-[11px] text-slate-300 bg-[#131d35] p-2.5 rounded-xl border border-slate-800/80">
              <div className="flex justify-between">
                <span className="text-slate-400">Stenosis Criteria:</span>
                <span className="font-semibold text-emerald-300">ASUM 2021 (Current)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Diameter Method:</span>
                <span className="font-semibold text-emerald-300">NASCET supportive</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">CCA Coverage:</span>
                <span className="font-semibold text-slate-300">Prox, Mid, Distal</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
            {activePresetId === 'australia_asum' ? (
              <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400">
                <CheckCircle2 className="w-4 h-4" /> Active Base Protocol
              </div>
            ) : (
              <button
                type="button"
                id="btn-use-australia"
                onClick={() => {
                  onSelectPreset('australia_asum', 'ASUM_2021', AUSTRALIA_DEFAULT_CONFIG);
                }}
                className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all text-center cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Use as Active Protocol</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Preset 3: United States (IAC Modified SRU 2023) */}
        <div
          id="preset-card-united-states"
          className={`border rounded-2xl p-4 flex flex-col justify-between transition-all relative shadow-md ${
            activePresetId === 'united_states_iac'
              ? 'bg-[#0f243a] border-cyan-500/80 ring-1 ring-cyan-500/50'
              : 'bg-[#0f172a] border-slate-800 hover:border-slate-700'
          }`}
        >
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="px-2 py-0.5 rounded-full bg-indigo-950/70 border border-indigo-800 text-indigo-300 text-[10px] font-black uppercase tracking-wider">
                UNITED STATES
              </span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-950/60 border border-indigo-800 text-indigo-300 text-[10px] font-bold">
                IAC / SRU 2023
              </span>
            </div>

            <h3 className="text-sm font-black text-slate-100 mt-2.5">
              United States IAC Standard Duplex
            </h3>
            <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
              IAC 2023 updated recommendation incorporating the 180 cm/s 50% stenosis threshold.
            </p>

            <div className="mt-3 space-y-1 text-[11px] text-slate-300 bg-[#131d35] p-2.5 rounded-xl border border-slate-800/80">
              <div className="flex justify-between">
                <span className="text-slate-400">Stenosis Criteria:</span>
                <span className="font-semibold text-indigo-300">IAC Modified SRU 2023</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Diameter Method:</span>
                <span className="font-semibold text-emerald-300">NASCET Diameter</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Acquisition:</span>
                <span className="font-semibold text-slate-300">IAC Standard Dataset</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
            {activePresetId === 'united_states_iac' ? (
              <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400">
                <CheckCircle2 className="w-4 h-4" /> Active Base Protocol
              </div>
            ) : (
              <button
                type="button"
                id="btn-use-united-states"
                onClick={() => {
                  onSelectPreset('united_states_iac', 'IAC_MODIFIED_SRU_2023', UNITED_STATES_DEFAULT_CONFIG);
                }}
                className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all text-center cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Use as Active Protocol</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Clone as Site Protocol action banner */}
      <div className="bg-[#111c38] border border-slate-800/90 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 text-slate-300">
          <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            Need site-specific requirements or local laboratory instructions?
          </span>
        </div>
        <button
          type="button"
          id="btn-clone-site-protocol"
          onClick={onCloneAsSiteProtocol}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-300 text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
        >
          <Copy className="w-3.5 h-3.5" />
          <span>Edit Site-Specific Addendum & Overrides</span>
        </button>
      </div>
    </div>
  );
};
