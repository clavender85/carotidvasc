import React, { useState } from 'react';
import { ClassificationSystem } from '../../types';
import { ASUM_2021_META, ASUM_2021_TABLE } from '../../data/criteria/asum2021';
import { IAC_MODIFIED_SRU_2023_META, IAC_MODIFIED_SRU_2023_TABLE } from '../../data/criteria/iacModifiedSru2023';
import { SRU_2003_META, SRU_2003_TABLE } from '../../data/criteria/sru2003';
import { NASCET_METHOD_META, ECST_METHOD_META } from '../../data/criteria/nascet';
import { UK_JOINT_META, UK_JOINT_TABLE } from '../../data/criteria/ukJoint';
import { ShieldCheck, CheckCircle2, AlertTriangle, ArrowRight, BookOpen, Layers, Info } from 'lucide-react';

interface CriteriaLibraryProps {
  activeCriteria: ClassificationSystem;
  onSelectCriteria: (system: ClassificationSystem) => void;
}

export const CriteriaLibrary: React.FC<CriteriaLibraryProps> = ({
  activeCriteria,
  onSelectCriteria
}) => {
  const [activeTab, setActiveTab] = useState<'asum' | 'iac' | 'sru' | 'nascet' | 'uk' | 'custom'>('asum');

  return (
    <div id="stenosis-criteria-library" className="space-y-4">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2">
        <div>
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            Stenosis Diagnostic Criteria & Diameter Measurement Library
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Recognised professional consensus standards and anatomical diameter reduction methods
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-800 scrollbar-thin">
        
        {/* ASUM 2021 */}
        <button
          type="button"
          id="tab-criteria-asum"
          onClick={() => setActiveTab('asum')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'asum'
              ? 'bg-cyan-500/20 border border-cyan-500/60 text-cyan-300 font-extrabold shadow-sm'
              : 'bg-[#131d35] border border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>ASUM 2021</span>
          <span className="px-1.5 py-0.2 rounded bg-emerald-950/80 text-emerald-400 text-[9px] font-bold">CURRENT</span>
          {activeCriteria === 'ASUM_2021' && (
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
          )}
        </button>

        {/* IAC Modified SRU 2023 */}
        <button
          type="button"
          id="tab-criteria-iac"
          onClick={() => setActiveTab('iac')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'iac'
              ? 'bg-cyan-500/20 border border-cyan-500/60 text-cyan-300 font-extrabold shadow-sm'
              : 'bg-[#131d35] border border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>IAC Modified SRU 2023</span>
          <span className="px-1.5 py-0.2 rounded bg-indigo-950/80 text-indigo-400 text-[9px] font-bold">CURRENT</span>
          {(activeCriteria === 'IAC_MODIFIED_SRU_2023' || activeCriteria === 'MODIFIED_SRU_2021') && (
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
          )}
        </button>

        {/* SRU 2003 Legacy */}
        <button
          type="button"
          id="tab-criteria-sru"
          onClick={() => setActiveTab('sru')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'sru'
              ? 'bg-cyan-500/20 border border-cyan-500/60 text-cyan-300 font-extrabold shadow-sm'
              : 'bg-[#131d35] border border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>SRU 2003</span>
          <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 text-[9px] font-bold">LEGACY</span>
          {activeCriteria === 'SRU_2003' && (
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
          )}
        </button>

        {/* NASCET Method */}
        <button
          type="button"
          id="tab-criteria-nascet"
          onClick={() => setActiveTab('nascet')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'nascet'
              ? 'bg-cyan-500/20 border border-cyan-500/60 text-cyan-300 font-extrabold shadow-sm'
              : 'bg-[#131d35] border border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-emerald-400" />
          <span>NASCET Diameter Method</span>
          <span className="px-1.5 py-0.2 rounded bg-amber-950/80 text-amber-300 text-[9px] font-bold">CALIPER METHOD</span>
        </button>

        {/* UK Joint */}
        <button
          type="button"
          id="tab-criteria-uk"
          onClick={() => setActiveTab('uk')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'uk'
              ? 'bg-cyan-500/20 border border-cyan-500/60 text-cyan-300 font-extrabold shadow-sm'
              : 'bg-[#131d35] border border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>UK Joint Recs</span>
          <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 text-[9px] font-bold">REFERENCE</span>
          {activeCriteria === 'UK_JOINT' && (
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
          )}
        </button>

      </div>

      {/* Tab Content Display */}

      {/* 1. ASUM 2021 */}
      {activeTab === 'asum' && (
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-slate-100">
                  {ASUM_2021_META.name}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-[10px] font-black">
                  CURRENT ASUM GUIDELINE
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {ASUM_2021_META.description}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {activeCriteria === 'ASUM_2021' ? (
                <span className="px-3 py-1.5 rounded-xl bg-cyan-950/80 border border-cyan-800 text-cyan-400 text-xs font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Active in Classification Engine
                </span>
              ) : (
                <button
                  type="button"
                  id="btn-activate-asum"
                  onClick={() => onSelectCriteria('ASUM_2021')}
                  className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <span>Set as Active Criteria</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="bg-cyan-950/30 border border-cyan-900/60 rounded-xl p-3 text-xs text-cyan-200/90 flex items-start gap-2">
            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <span>{ASUM_2021_META.disclaimer}</span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#131d35] text-slate-300 font-bold border-b border-slate-800">
                  <th className="py-2.5 px-3">Stenosis Category</th>
                  <th className="py-2.5 px-3">NASCET %</th>
                  <th className="py-2.5 px-3">ICA PSV</th>
                  <th className="py-2.5 px-3">ICA EDV</th>
                  <th className="py-2.5 px-3">ICA/CCA Ratio</th>
                  <th className="py-2.5 px-3">Plaque & Morphologic Features</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-200">
                {ASUM_2021_TABLE.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-cyan-300">{row.category}</td>
                    <td className="py-2.5 px-3 text-slate-400 font-mono">{row.nascetEquivalent}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-100">{row.psvRange}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-300">{row.edvRange}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-300">{row.icaCcaRatioRange}</td>
                    <td className="py-2.5 px-3 text-slate-400 text-[11px]">{row.plaqueGrayscale}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. IAC Modified SRU 2023 */}
      {activeTab === 'iac' && (
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-slate-100">
                  {IAC_MODIFIED_SRU_2023_META.name}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-indigo-950/70 border border-indigo-800 text-indigo-300 text-[10px] font-black">
                  CURRENT IAC RECOMMENDATION
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {IAC_MODIFIED_SRU_2023_META.description}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {(activeCriteria === 'IAC_MODIFIED_SRU_2023' || activeCriteria === 'MODIFIED_SRU_2021') ? (
                <span className="px-3 py-1.5 rounded-xl bg-cyan-950/80 border border-cyan-800 text-cyan-400 text-xs font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Active in Classification Engine
                </span>
              ) : (
                <button
                  type="button"
                  id="btn-activate-iac"
                  onClick={() => onSelectCriteria('IAC_MODIFIED_SRU_2023')}
                  className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <span>Set as Active Criteria</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="bg-indigo-950/30 border border-indigo-900/60 rounded-xl p-3 text-xs text-indigo-200/90 flex items-start gap-2">
            <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <span>{IAC_MODIFIED_SRU_2023_META.disclaimer}</span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#131d35] text-slate-300 font-bold border-b border-slate-800">
                  <th className="py-2.5 px-3">Stenosis Category</th>
                  <th className="py-2.5 px-3">NASCET %</th>
                  <th className="py-2.5 px-3">ICA PSV</th>
                  <th className="py-2.5 px-3">ICA EDV</th>
                  <th className="py-2.5 px-3">ICA/CCA Ratio</th>
                  <th className="py-2.5 px-3">Plaque & Morphologic Features</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-200">
                {IAC_MODIFIED_SRU_2023_TABLE.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-indigo-300">{row.category}</td>
                    <td className="py-2.5 px-3 text-slate-400 font-mono">{row.nascetEquivalent}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-100">{row.psvRange}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-300">{row.edvRange}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-300">{row.icaCcaRatioRange}</td>
                    <td className="py-2.5 px-3 text-slate-400 text-[11px]">{row.plaqueGrayscale}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. SRU 2003 Legacy */}
      {activeTab === 'sru' && (
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-slate-100">
                  {SRU_2003_META.name}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400 text-[10px] font-black">
                  LEGACY / HISTORICAL
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {SRU_2003_META.description}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {activeCriteria === 'SRU_2003' ? (
                <span className="px-3 py-1.5 rounded-xl bg-cyan-950/80 border border-cyan-800 text-cyan-400 text-xs font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Active in Classification Engine
                </span>
              ) : (
                <button
                  type="button"
                  id="btn-activate-sru"
                  onClick={() => onSelectCriteria('SRU_2003')}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <span>Set as Active Criteria (Legacy)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="bg-amber-950/30 border border-amber-900/60 rounded-xl p-3 text-xs text-amber-300 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>{SRU_2003_META.disclaimer}</span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#131d35] text-slate-300 font-bold border-b border-slate-800">
                  <th className="py-2.5 px-3">Stenosis Category</th>
                  <th className="py-2.5 px-3">NASCET %</th>
                  <th className="py-2.5 px-3">ICA PSV</th>
                  <th className="py-2.5 px-3">ICA EDV</th>
                  <th className="py-2.5 px-3">ICA/CCA Ratio</th>
                  <th className="py-2.5 px-3">Plaque & Morphologic Features</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-200">
                {SRU_2003_TABLE.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-slate-300">{row.category}</td>
                    <td className="py-2.5 px-3 text-slate-400 font-mono">{row.nascetEquivalent}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-100">{row.psvRange}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-300">{row.edvRange}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-300">{row.icaCcaRatioRange}</td>
                    <td className="py-2.5 px-3 text-slate-400 text-[11px]">{row.plaqueGrayscale}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. NASCET Diameter Method */}
      {activeTab === 'nascet' && (
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-slate-100">
                {NASCET_METHOD_META.name}
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-[10px] font-black uppercase">
                DIAMETER METHOD ONLY
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {NASCET_METHOD_META.description}
            </p>
          </div>

          {/* Distinction Callout */}
          <div className="bg-emerald-950/30 border border-emerald-900/60 rounded-xl p-3.5 space-y-1.5">
            <span className="text-xs font-black text-emerald-300 uppercase tracking-wider block">
              Methodological Distinction
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">
              NASCET is a geometric <strong>diameter reduction calculation method</strong>, not a standalone duplex velocity table. It measures morphological caliber restriction and serves as valuable supportive evidence when correlated with velocity and Doppler criteria.
            </p>
          </div>

          {/* Formula & Diagram Box */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#131d35] p-4 rounded-xl border border-slate-800">
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400">
                NASCET Equation
              </span>
              <div className="p-3 bg-[#0a1020] rounded-lg border border-slate-800 font-mono text-xs text-cyan-300 font-bold text-center">
                {NASCET_METHOD_META.formula}
              </div>
              <div className="space-y-1.5 text-xs text-slate-300 pt-1">
                <p><strong>A:</strong> {NASCET_METHOD_META.formulaComponents.residualLumenA}</p>
                <p><strong>B:</strong> {NASCET_METHOD_META.formulaComponents.normalDistalLumenB}</p>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                Safety & Quality Mandates
              </span>
              <ul className="space-y-1 text-[11px] text-slate-300 list-disc pl-4">
                {NASCET_METHOD_META.safetyGuidelines.map((rule, idx) => (
                  <li key={idx}>{rule}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 5. UK Joint Recommendations */}
      {activeTab === 'uk' && (
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-slate-100">
                  {UK_JOINT_META.name}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400 text-[10px] font-bold">
                  INTERNATIONAL REFERENCE
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {UK_JOINT_META.description}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {activeCriteria === 'UK_JOINT' ? (
                <span className="px-3 py-1.5 rounded-xl bg-cyan-950/80 border border-cyan-800 text-cyan-400 text-xs font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Active in Classification Engine
                </span>
              ) : (
                <button
                  type="button"
                  id="btn-activate-uk"
                  onClick={() => onSelectCriteria('UK_JOINT')}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <span>Set as Active Criteria</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#131d35] text-slate-300 font-bold border-b border-slate-800">
                  <th className="py-2.5 px-3">Stenosis Category</th>
                  <th className="py-2.5 px-3">NASCET %</th>
                  <th className="py-2.5 px-3">ICA PSV</th>
                  <th className="py-2.5 px-3">ICA EDV</th>
                  <th className="py-2.5 px-3">ICA/CCA Ratio</th>
                  <th className="py-2.5 px-3">Plaque & Features</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-200">
                {UK_JOINT_TABLE.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-slate-300">{row.category}</td>
                    <td className="py-2.5 px-3 text-slate-400 font-mono">{row.nascetEquivalent}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-100">{row.psvRange}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-300">{row.edvRange}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-300">{row.icaCcaRatioRange}</td>
                    <td className="py-2.5 px-3 text-slate-400 text-[11px]">{row.plaqueGrayscale}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
