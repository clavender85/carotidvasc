import React from 'react';
import { StudyData } from '../types';
import { ShieldCheck, BookOpen, Ruler, HelpCircle, Activity, Info } from 'lucide-react';

interface CriteriaReferenceTabProps {
  studyData: StudyData;
}

export const CriteriaReferenceTab: React.FC<CriteriaReferenceTabProps> = ({ studyData }) => {
  const system = studyData.classificationSystem;

  const getCriteriaTitle = () => {
    switch (system) {
      case 'ASUM_2021': return 'ASUM 2021 Carotid Doppler Guidelines';
      case 'MODIFIED_SRU_2021': return 'Modified SRU / IAC Consensus Guidelines';
      case 'SRU_2003': return 'SRU Consensus (2003) Standard Criteria';
      case 'NASCET_INDEX': return 'Sonographic NASCET Index Protocol';
      case 'CUSTOM': return 'Custom Laboratory Protocol Thresholds';
    }
  };

  const getCriteriaDescription = () => {
    switch (system) {
      case 'ASUM_2021':
        return 'Australasian Society for Ultrasound in Medicine guidelines incorporating PSV, EDV, and ICA/CCA velocity ratios with gray-scale plaque quantification.';
      case 'MODIFIED_SRU_2021':
        return 'Updated multi-society consensus for ICA stenosis combining direct velocity thresholds and spectral Doppler waveform analysis.';
      case 'SRU_2003':
        return 'Standard Radiologists\' Ultrasound Consensus criteria for carotid artery stenosis stratification.';
      case 'NASCET_INDEX':
        return 'Direct anatomic and velocity index correlation emphasizing NASCET diameter reduction measurements.';
      case 'CUSTOM':
        return 'Institution-specific diagnostic criteria configured for local laboratory vascular standards.';
    }
  };

  return (
    <div id="criteria-reference-container" className="space-y-6 max-w-5xl mx-auto pb-12">
      
      {/* Header card */}
      <div className="bg-[#0b1329] border border-slate-800 rounded-xl shadow-lg p-6 space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
          <BookOpen className="w-5 h-5 text-cyan-400" />
          <div>
            <h3 className="text-xs font-black text-slate-100 uppercase tracking-wider">
              Carotid Ultrasound Consensus Criteria & Diagnostic Reference
            </h3>
            <p className="text-[11px] text-slate-400">
              Live reference matrix matching the active laboratory protocol.
            </p>
          </div>
        </div>

        {/* Current Active Criteria Highlight */}
        <div className="p-4 bg-[#0f172a] border border-cyan-800/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
          <div>
            <span className="text-[10px] font-extrabold text-cyan-400 uppercase tracking-wider block">Active Protocol</span>
            <span className="text-sm font-black text-slate-100">{getCriteriaTitle()}</span>
            <p className="text-[11px] text-slate-400 mt-0.5">{getCriteriaDescription()}</p>
          </div>
          <span className="px-3 py-1.5 bg-cyan-950/80 border border-cyan-700 text-cyan-300 text-[10px] font-extrabold uppercase rounded-lg self-start sm:self-center shadow-sm">
            Active in Study
          </span>
        </div>

        {/* Consensus Tables Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          
          {/* Active Consensus Threshold Table */}
          <div className="border border-slate-800 rounded-xl overflow-hidden shadow-md flex flex-col bg-[#0f172a]">
            <div className="bg-[#080d19] p-3 border-b border-slate-800 font-bold text-xs text-slate-200 uppercase flex items-center justify-between">
              <span>{getCriteriaTitle()} Thresholds</span>
              <span className="text-[10px] font-mono text-cyan-400 font-bold">ICA Criteria</span>
            </div>
            <table className="w-full text-left text-xs flex-1">
              <thead className="bg-[#0b1329] text-slate-400 border-b border-slate-800 text-[10px] uppercase font-bold">
                <tr>
                  <th className="p-2.5">Stenosis Category</th>
                  <th className="p-2.5">ICA PSV (cm/s)</th>
                  <th className="p-2.5">ICA EDV (cm/s)</th>
                  <th className="p-2.5">ICA/CCA Ratio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px] text-slate-300">
                <tr>
                  <td className="p-2.5 font-sans font-bold text-emerald-400">Normal / 0%</td>
                  <td className="p-2.5">&lt; 125</td>
                  <td className="p-2.5">&lt; 40</td>
                  <td className="p-2.5">&lt; 2.0</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-sans font-bold text-amber-400">&lt; 50% Mild</td>
                  <td className="p-2.5">&lt; 125</td>
                  <td className="p-2.5">&lt; 40</td>
                  <td className="p-2.5">&lt; 2.0</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-sans font-bold text-orange-400">50 – 69% Mod</td>
                  <td className="p-2.5">125 – 230</td>
                  <td className="p-2.5">40 – 100</td>
                  <td className="p-2.5">2.0 – 4.0</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-sans font-bold text-rose-400">≥ 70% Severe</td>
                  <td className="p-2.5">&gt; 230</td>
                  <td className="p-2.5">&gt; 100</td>
                  <td className="p-2.5">&gt; 4.0</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-sans font-bold text-rose-300">Near Occlusion</td>
                  <td className="p-2.5">Variable / String</td>
                  <td className="p-2.5">Variable</td>
                  <td className="p-2.5">Variable</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-sans font-bold text-slate-400">Total Occlusion</td>
                  <td className="p-2.5">No signal</td>
                  <td className="p-2.5">None</td>
                  <td className="p-2.5">N/A</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* NASCET Formula & Methodology */}
          <div className="border border-slate-800 rounded-xl overflow-hidden shadow-md flex flex-col bg-[#0f172a]">
            <div className="bg-[#080d19] p-3 border-b border-slate-800 font-bold text-xs text-slate-200 uppercase flex items-center gap-2">
              <Ruler className="w-4 h-4 text-cyan-400" />
              <span>NASCET Diameter Reduction Protocol</span>
            </div>
            <div className="p-4 space-y-4 flex-1 text-xs text-slate-300 leading-relaxed flex flex-col justify-between">
              <p>
                The North American Symptomatic Carotid Endarterectomy Trial (NASCET) method calculates percentage stenosis by comparing the residual lumen diameter at the site of maximum narrowing with the normal distal ICA lumen diameter.
              </p>
              
              <div className="p-3 bg-[#080d19] rounded-lg border border-cyan-900/60 font-mono text-center font-bold text-cyan-300 text-sm">
                NASCET % = [ 1 - ( A / B ) ] × 100
              </div>

              <ul className="space-y-1.5 text-[11px] text-slate-400 list-disc list-inside">
                <li><strong className="text-slate-200">A</strong> = Minimum residual lumen diameter at stenosis (mm).</li>
                <li><strong className="text-slate-200">B</strong> = Normal distal cervical ICA lumen diameter distal to plaque (mm).</li>
                <li>Indicated for lesions demonstrating &gt;50% velocity acceleration or plaque encroachment.</li>
              </ul>
            </div>
          </div>

        </div>

        {/* Waveform / Morphology Support Section */}
        <div className="p-4 bg-[#0f172a] border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-slate-200 font-bold text-xs uppercase">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>Waveform, Morphology & Hemodynamic Support Notes</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Carotid ultrasound interpretations should not rely on peak systolic velocity (PSV) alone. Accurate grading requires multi-parameter correlation including:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
            <div className="p-3 bg-[#0b101f] border border-slate-800 rounded-lg text-[11px]">
              <strong className="text-slate-200 block mb-0.5">Plaque Visibility & Composition</strong>
              <span className="text-slate-400">Document echogenicity (hypoechoic vs calcific) and surface regularity (smooth vs ulcerated).</span>
            </div>
            <div className="p-3 bg-[#0b101f] border border-slate-800 rounded-lg text-[11px]">
              <strong className="text-slate-200 block mb-0.5">Spectral Broadening & Turbulence</strong>
              <span className="text-slate-400">Assess fill-in of spectral window and post-stenotic flow disturbances in the distal ICA.</span>
            </div>
            <div className="p-3 bg-[#0b101f] border border-slate-800 rounded-lg text-[11px]">
              <strong className="text-slate-200 block mb-0.5">Vertebral & Subclavian Flow</strong>
              <span className="text-slate-400">Evaluate vertebral artery antegrade/retrograde status for subclavian steal physiology.</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
