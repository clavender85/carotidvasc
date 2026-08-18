import React, { useState } from 'react';
import { 
  Info, 
  Check, 
  ExternalLink, 
  Sparkles, 
  ArrowRight, 
  AlertTriangle, 
  ShieldAlert, 
  Zap, 
  HelpCircle, 
  GitCompare, 
  Activity,
  Layers,
  X
} from 'lucide-react';
import { 
  WAVEFORM_DESCRIPTORS, 
  WaveformDescriptor, 
  VesselCategory, 
  getWaveformOptionsForVessel 
} from '../data/waveformDescriptors';
import { WaveformSchematicSvg } from './WaveformSchematicSvg';

interface WaveformDescriptorGuideProps {
  isOpen: boolean;
  onClose: () => void;
  initialDescriptorId?: string;
  category?: VesselCategory;
  segmentName?: string;
  onApplyDescriptor?: (descriptor: WaveformDescriptor) => void;
  embedMode?: boolean; // For embedding inside Protocol tab
}

export const WaveformDescriptorGuide: React.FC<WaveformDescriptorGuideProps> = ({
  isOpen,
  onClose,
  initialDescriptorId = 'normal',
  category = 'ica',
  segmentName,
  onApplyDescriptor,
  embedMode = false,
}) => {
  const [selectedId, setSelectedId] = useState<string>(initialDescriptorId);
  const [activeTab, setActiveTab] = useState<'descriptors' | 'comparison' | 'vertebral_progression'>(
    category === 'vertebral' && initialDescriptorId.includes('steal') ? 'vertebral_progression' : 'descriptors'
  );
  const [appliedNotification, setAppliedNotification] = useState<string | null>(null);

  if (!isOpen && !embedMode) return null;

  const currentDescriptor = WAVEFORM_DESCRIPTORS[selectedId] || WAVEFORM_DESCRIPTORS.normal;
  const vesselOptions = getWaveformOptionsForVessel(category);

  const handleApply = (desc: WaveformDescriptor) => {
    if (onApplyDescriptor) {
      onApplyDescriptor(desc);
      setAppliedNotification(desc.label);
      setTimeout(() => {
        setAppliedNotification(null);
        if (!embedMode) onClose();
      }, 700);
    }
  };

  const content = (
    <div className="flex flex-col h-full bg-[#0b1329] text-slate-200">
      {/* Modal / Header Bar */}
      {!embedMode && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0f172a]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-700/50 text-cyan-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-slate-100 tracking-tight">
                  Clinical Waveform & Hemodynamic Guide
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-cyan-950/70 border border-cyan-800 text-cyan-300">
                  {category.toUpperCase()} Context
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Standardized diagnostic descriptors, morphological criteria, and dynamic protocol triggers
                {segmentName && <span> for <strong className="text-slate-200">{segmentName}</strong></span>}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close Guide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Top View Selector Tabs */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-slate-800/80 bg-[#090f1f]">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('descriptors')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'descriptors'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-950/50'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Waveform Descriptors</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('comparison')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'comparison'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-950/50'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span>Damped vs. Tardus-parvus</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('vertebral_progression')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'vertebral_progression'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-950/50'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Vertebral Steal Spectrum</span>
          </button>
        </div>

        {appliedNotification && (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-950 border border-emerald-600 text-emerald-300 rounded-lg text-xs font-bold animate-pulse">
            <Check className="w-4 h-4" />
            <span>Applied "{appliedNotification}" to worksheet!</span>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* VIEW 1: DESCRIPTORS BROWSER */}
        {activeTab === 'descriptors' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Quick Option List */}
            <div className="lg:col-span-4 flex flex-col gap-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                  Applicable Descriptors ({category.toUpperCase()})
                </span>
                <span className="text-[10px] text-slate-500">Click to inspect</span>
              </div>

              <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
                {vesselOptions.map(desc => {
                  const isSelected = selectedId === desc.id;
                  let badgeColor = 'bg-slate-800 text-slate-300';
                  if (desc.severity === 'normal') badgeColor = 'bg-emerald-950/60 border-emerald-700/50 text-emerald-400';
                  else if (desc.severity === 'warning') badgeColor = 'bg-amber-950/60 border-amber-700/50 text-amber-300';
                  else if (desc.severity === 'alert') badgeColor = 'bg-rose-950/60 border-rose-700/50 text-rose-300';

                  return (
                    <button
                      key={desc.id}
                      type="button"
                      onClick={() => setSelectedId(desc.id)}
                      className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-cyan-950/40 border-cyan-500 shadow-md shadow-cyan-950/30'
                          : 'bg-[#0f172a] border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-black ${isSelected ? 'text-cyan-300' : 'text-slate-200'}`}>
                            {desc.label}
                          </span>
                          {desc.id === 'normal' && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 font-bold border border-emerald-800">
                              Standard
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-1">
                          {desc.shortDefinition}
                        </p>
                      </div>
                      <ArrowRight className={`w-4 h-4 transition-transform ${isSelected ? 'text-cyan-400 translate-x-0.5' : 'text-slate-600'}`} />
                    </button>
                  );
                })}
              </div>

              {/* Quick tip box */}
              <div className="mt-4 p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-400 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-slate-200 text-[11px] uppercase tracking-wider">
                  <Info className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Clinical Standard</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  In the Scan worksheet, standard baseline waveforms are simply recorded as <strong>Normal</strong>. 
                  Vessel-specific bed resistance (low resistance for ICA/Vertebral; high resistance for ECA/Subclavian) is evaluated automatically by the clinical engine.
                </p>
              </div>
            </div>

            {/* Right Column: Selected Descriptor Full Detail View */}
            <div className="lg:col-span-8 flex flex-col gap-4">
              {/* Header Box */}
              <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-lg font-black text-slate-100 tracking-tight">
                      {currentDescriptor.label}
                    </h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                      currentDescriptor.severity === 'normal'
                        ? 'bg-emerald-950/70 border-emerald-700 text-emerald-300'
                        : currentDescriptor.severity === 'warning'
                        ? 'bg-amber-950/70 border-amber-700 text-amber-300'
                        : currentDescriptor.severity === 'alert'
                        ? 'bg-rose-950/70 border-rose-700 text-rose-300'
                        : 'bg-cyan-950/70 border-cyan-700 text-cyan-300'
                    }`}>
                      {currentDescriptor.severity === 'normal' ? 'Normal Baseline' : `${currentDescriptor.severity?.toUpperCase()} HEURISTIC`}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    {currentDescriptor.shortDefinition}
                  </p>
                </div>

                {onApplyDescriptor && (
                  <button
                    type="button"
                    onClick={() => handleApply(currentDescriptor)}
                    className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-cyan-950/60 cursor-pointer whitespace-nowrap"
                  >
                    <Check className="w-4 h-4" />
                    <span>Use this descriptor</span>
                  </button>
                )}
              </div>

              {/* Schematic Waveform Graphic Display */}
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                    Schematic Spectral Profile ({category.toUpperCase()} Demonstration)
                  </span>
                  <span className="text-[10px] text-cyan-400 font-bold">Vector SVG Illustration</span>
                </div>

                <WaveformSchematicSvg
                  descriptorId={currentDescriptor.id}
                  category={category}
                  height={180}
                  showAnnotations={true}
                />
              </div>

              {/* Vessel Specific Context Note (if present) */}
              {currentDescriptor.vesselNotes?.[category] && (
                <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-800/60 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-black uppercase tracking-wider text-cyan-300">
                      {category.toUpperCase()} Vascular Bed Physiology
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {currentDescriptor.vesselNotes[category]?.physiology}
                  </p>
                </div>
              )}

              {/* Detail Tabs: Visual Features, Interpretation, Protocol Consequence */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. What it looks like */}
                <div className="p-4 rounded-xl bg-[#080d19] border border-slate-800 space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    1. Morphological Features
                  </span>
                  <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                    {currentDescriptor.appearance.map((feat, idx) => (
                      <li key={idx} className="leading-snug text-slate-300 text-[11px]">
                        {feat}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 2. What it means / Clinical Interpretation */}
                <div className="p-4 rounded-xl bg-[#080d19] border border-slate-800 space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    2. Clinical Interpretation
                  </span>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {currentDescriptor.interpretation}
                  </p>
                </div>

                {/* 3. Next Steps & Dynamic Protocol Response */}
                <div className="p-4 rounded-xl bg-[#080d19] border border-slate-800 space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-400" />
                    3. Dynamic Protocol Response
                  </span>
                  <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                    {currentDescriptor.protocolConsequence || 'Standard protocol sweep maintained.'}
                  </p>
                  {currentDescriptor.nextStep && (
                    <div className="pt-1 text-[10px] text-cyan-300">
                      <strong>Next step:</strong> {currentDescriptor.nextStep}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: DAMPED VS TARDUS-PARVUS SIDE-BY-SIDE TUTORIAL */}
        {activeTab === 'comparison' && (
          <div className="space-y-6 max-w-5xl mx-auto">
            <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/30 via-slate-900 to-amber-950/30 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2">
                <GitCompare className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-black text-slate-100 uppercase tracking-wider">
                  Diagnostic Differentiation: Damped vs. Tardus-parvus
                </h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                While both patterns demonstrate blunted morphology, <strong>Tardus-parvus</strong> is a specific hemodynamic hallmark of 
                hemodynamically significant upstream inflow obstruction (such as high-grade proximal stenosis or occlusion), characterized by 
                a prolonged systolic acceleration time. <strong>Damped</strong> flow represents a non-specific reduction in amplitude without delayed upstroke.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card A: DAMPED */}
              <div className="p-5 rounded-2xl bg-[#0f172a] border border-purple-900/60 shadow-lg space-y-4">
                <div className="flex items-center justify-between border-b border-purple-900/40 pb-3">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-purple-400">
                      Non-Specific Attenuation
                    </span>
                    <h4 className="text-base font-black text-purple-200">Damped Waveform</h4>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-800">
                    Advisory
                  </span>
                </div>

                <WaveformSchematicSvg
                  descriptorId="damped"
                  category="cca"
                  height={150}
                  showAnnotations={true}
                />

                <div className="space-y-3 text-xs">
                  <div>
                    <h5 className="font-bold text-slate-200 text-[11px] uppercase tracking-wider">Core Definition</h5>
                    <p className="text-slate-300 text-[11px] mt-0.5">
                      General reduction or blunting of the normal waveform contour/amplitude.
                    </p>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-200 text-[11px] uppercase tracking-wider">Acceleration Time</h5>
                    <p className="text-slate-300 text-[11px] mt-0.5">
                      <strong>Normal systolic upstroke acceleration time (&lt; 70 ms)</strong>, but with lower peak height and blunted dicrotic notch.
                    </p>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-200 text-[11px] uppercase tracking-wider">Etiology & Interpretation</h5>
                    <p className="text-slate-300 text-[11px] mt-0.5">
                      Low cardiac stroke volume, aortic valve stenosis, diffuse microvascular resistance, or systemic hypotension. Does <em>not</em> automatically prove severe upstream focal stenosis.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-purple-950/30 border border-purple-800/40 text-[11px] text-purple-200">
                    <strong>Protocol Action:</strong> Non-blocking advisory to correlate with contralateral carotid velocities and cardiac status.
                  </div>
                </div>

                {onApplyDescriptor && (
                  <button
                    type="button"
                    onClick={() => handleApply(WAVEFORM_DESCRIPTORS.damped)}
                    className="w-full py-2 bg-purple-950/70 hover:bg-purple-900 border border-purple-700 text-purple-200 rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Select Damped
                  </button>
                )}
              </div>

              {/* Card B: TARDUS-PARVUS */}
              <div className="p-5 rounded-2xl bg-[#0f172a] border border-amber-900/60 shadow-lg space-y-4">
                <div className="flex items-center justify-between border-b border-amber-900/40 pb-3">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                      Severe Inflow Obstruction
                    </span>
                    <h4 className="text-base font-black text-amber-200">Tardus-parvus Waveform</h4>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                    High-Priority Warning
                  </span>
                </div>

                <WaveformSchematicSvg
                  descriptorId="tardus_parvus"
                  category="cca"
                  height={150}
                  showAnnotations={true}
                />

                <div className="space-y-3 text-xs">
                  <div>
                    <h5 className="font-bold text-slate-200 text-[11px] uppercase tracking-wider">Core Definition</h5>
                    <p className="text-slate-300 text-[11px] mt-0.5">
                      Delayed systolic upstroke with reduced systolic amplitude.
                    </p>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-200 text-[11px] uppercase tracking-wider">Acceleration Time</h5>
                    <p className="text-slate-300 text-[11px] mt-0.5">
                      <strong>Significantly prolonged acceleration time (&gt; 70–80 ms)</strong> with sluggish rounded upstroke ("tardus") and small peak ("parvus").
                    </p>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-200 text-[11px] uppercase tracking-wider">Etiology & Interpretation</h5>
                    <p className="text-slate-300 text-[11px] mt-0.5">
                      High-grade proximal stenosis or occlusion upstream from the sample site (e.g. BCT/Arch origin disease for CCA; severe bulb/proximal ICA disease for distal ICA).
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-800/40 text-[11px] text-amber-200">
                    <strong>Protocol Action:</strong> Triggers mandatory upstream inflow review (BCT / aortic arch origin / proximal carotid segments).
                  </div>
                </div>

                {onApplyDescriptor && (
                  <button
                    type="button"
                    onClick={() => handleApply(WAVEFORM_DESCRIPTORS.tardus_parvus)}
                    className="w-full py-2 bg-amber-950/70 hover:bg-amber-900 border border-amber-700 text-amber-200 rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Select Tardus-parvus
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: VERTEBRAL STEAL PROGRESSION */}
        {activeTab === 'vertebral_progression' && (
          <div className="space-y-6 max-w-5xl mx-auto">
            <div className="p-5 rounded-2xl bg-gradient-to-r from-sky-950/30 via-slate-900 to-rose-950/30 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-rose-400" />
                <h3 className="text-sm font-black text-slate-100 uppercase tracking-wider">
                  Vertebrobasilar Hemodynamic Steal Spectrum (Subclavian Steal Physiology)
                </h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Progressive proximal subclavian or brachiocephalic stenosis creates a siphon pressure gradient that systematically 
                transforms the ipsilateral vertebral artery spectral waveform across 4 recognizable physiological stages.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Stage 1 */}
              <div className="p-4 rounded-xl bg-[#0f172a] border border-sky-800/60 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-sky-400 uppercase">Stage 1: Occult Steal</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-sky-950 text-sky-300 font-bold border border-sky-800">
                      Antegrade
                    </span>
                  </div>
                  <h4 className="text-xs font-black text-slate-100">Early Systolic Deceleration</h4>
                  <WaveformSchematicSvg
                    descriptorId="early_systolic_deceleration"
                    category="vertebral"
                    height={110}
                    compact={true}
                  />
                  <p className="text-[11px] text-slate-300 leading-tight">
                    Transient mid-systolic velocity notch during peak arm systole. Waveform remains entirely above baseline.
                  </p>
                </div>
                {onApplyDescriptor && (
                  <button
                    type="button"
                    onClick={() => handleApply(WAVEFORM_DESCRIPTORS.early_systolic_deceleration)}
                    className="w-full py-1.5 bg-sky-950 hover:bg-sky-900 border border-sky-700 text-sky-200 rounded-lg text-[10px] font-bold uppercase transition-colors"
                  >
                    Select Stage 1
                  </button>
                )}
              </div>

              {/* Stage 2 */}
              <div className="p-4 rounded-xl bg-[#0f172a] border border-amber-800/60 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-amber-400 uppercase">Stage 2: Pre-Steal</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 font-bold border border-amber-800">
                      Antegrade
                    </span>
                  </div>
                  <h4 className="text-xs font-black text-slate-100">Bunny / Pre-Steal</h4>
                  <WaveformSchematicSvg
                    descriptorId="bunny_pre_steal"
                    category="vertebral"
                    height={110}
                    compact={true}
                  />
                  <p className="text-[11px] text-slate-300 leading-tight">
                    Characteristic twin-peak "bunny ear" contour. Deep notch reaches the zero baseline without frank reversal.
                  </p>
                </div>
                {onApplyDescriptor && (
                  <button
                    type="button"
                    onClick={() => handleApply(WAVEFORM_DESCRIPTORS.bunny_pre_steal)}
                    className="w-full py-1.5 bg-amber-950 hover:bg-amber-900 border border-amber-700 text-amber-200 rounded-lg text-[10px] font-bold uppercase transition-colors"
                  >
                    Select Stage 2
                  </button>
                )}
              </div>

              {/* Stage 3 */}
              <div className="p-4 rounded-xl bg-[#0f172a] border border-rose-800/60 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-rose-400 uppercase">Stage 3: Partial Steal</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 font-bold border border-rose-800">
                      Bidirectional
                    </span>
                  </div>
                  <h4 className="text-xs font-black text-slate-100">Bidirectional Flow</h4>
                  <WaveformSchematicSvg
                    descriptorId="bidirectional_partial_steal"
                    category="vertebral"
                    height={110}
                    compact={true}
                  />
                  <p className="text-[11px] text-slate-300 leading-tight">
                    To-and-fro pattern: flow reverses below baseline in systole, but returns to forward antegrade flow in diastole.
                  </p>
                </div>
                {onApplyDescriptor && (
                  <button
                    type="button"
                    onClick={() => handleApply(WAVEFORM_DESCRIPTORS.bidirectional_partial_steal)}
                    className="w-full py-1.5 bg-rose-950 hover:bg-rose-900 border border-rose-700 text-rose-200 rounded-lg text-[10px] font-bold uppercase transition-colors"
                  >
                    Select Stage 3
                  </button>
                )}
              </div>

              {/* Stage 4 */}
              <div className="p-4 rounded-xl bg-[#0f172a] border border-red-800/60 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-red-400 uppercase">Stage 4: Complete Steal</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-950 text-red-300 font-bold border border-red-800">
                      Retrograde
                    </span>
                  </div>
                  <h4 className="text-xs font-black text-slate-100">Complete Flow Reversal</h4>
                  <WaveformSchematicSvg
                    descriptorId="complete_reversal"
                    category="vertebral"
                    height={110}
                    compact={true}
                  />
                  <p className="text-[11px] text-slate-300 leading-tight">
                    100% retrograde flow throughout both systole and diastole feeding the upper extremity from the circle of Willis.
                  </p>
                </div>
                {onApplyDescriptor && (
                  <button
                    type="button"
                    onClick={() => handleApply(WAVEFORM_DESCRIPTORS.complete_reversal)}
                    className="w-full py-1.5 bg-red-950 hover:bg-red-900 border border-red-700 text-red-200 rounded-lg text-[10px] font-bold uppercase transition-colors"
                  >
                    Select Stage 4
                  </button>
                )}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 font-black uppercase text-[11px]">
                <ShieldAlert className="w-4 h-4" />
                <span>Protocol Verification Mandate</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                When early systolic deceleration, bunny morphology, bidirectional, or retrograde flow is documented, the dynamic protocol engine automatically mandates:
                (1) Subclavian artery interrogation, (2) bilateral brachial systolic blood pressure measurements (&gt;15–20 mmHg differential indicates subclavian disease), 
                and (3) aortic arch origin anatomical review.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (embedMode) {
    return content;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-5xl h-[85vh] max-h-[850px] rounded-2xl overflow-hidden border border-slate-700 shadow-2xl flex flex-col">
        {content}
      </div>
    </div>
  );
};
