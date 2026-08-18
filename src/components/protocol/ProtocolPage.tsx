import React, { useState } from 'react';
import { StudyData, ClassificationSystem, SiteProtocolConfig } from '../../types';
import { UNIVERSAL_CORE_SECTIONS, UNIVERSAL_CORE_DEFAULT_DATASET } from '../../data/protocols/universalCore';
import { AUSTRALIA_DEFAULT_CONFIG } from '../../data/protocols/australia';
import { UNITED_STATES_DEFAULT_CONFIG } from '../../data/protocols/unitedStates';
import { PROTOCOL_REFERENCES, getSiteOverrides } from '../../utils/protocolEngine';
import { ProtocolHeader } from './ProtocolHeader';
import { ProtocolPresetCard } from './ProtocolPresetCard';
import { ProtocolSection } from './ProtocolSection';
import { CriteriaLibrary } from './CriteriaLibrary';
import { SiteProtocolEditor } from './SiteProtocolEditor';
import { ProtocolChecklist } from './ProtocolChecklist';
import { ProtocolTestSuiteRunner } from './ProtocolTestSuiteRunner';
import { WaveformDescriptorGuide } from '../WaveformDescriptorGuide';
import { BookOpen, ShieldCheck, Building2, ChevronDown, ChevronRight, ExternalLink, FileText, CheckCircle2, Terminal, Activity } from 'lucide-react';

interface ProtocolPageProps {
  studyData: StudyData;
  onUpdateStudyData: (updater: (prev: StudyData) => StudyData) => void;
}

export const ProtocolPage: React.FC<ProtocolPageProps> = ({
  studyData,
  onUpdateStudyData
}) => {
  const [activeView, setActiveView] = useState<'protocol' | 'checklist'>('protocol');
  const [activePresetTab, setActivePresetTab] = useState<'universal' | 'criteria' | 'waveform_reference' | 'site_addendum' | 'test_suite'>('universal');
  const [referencesOpen, setReferencesOpen] = useState(false);

  const siteConfig = studyData.siteProtocol || AUSTRALIA_DEFAULT_CONFIG;
  const siteOverrides = getSiteOverrides(siteConfig);

  // Switch preset
  const handleSelectPreset = (
    presetId: 'universal_core' | 'australia_asum' | 'united_states_iac' | 'custom_site',
    criteriaSystem: ClassificationSystem,
    defaultConfig: SiteProtocolConfig
  ) => {
    onUpdateStudyData(prev => {
      // Check if user has confirmed classifications
      const hasConfirmed = prev.classifications.right.confirmed !== 'Not Classified' || prev.classifications.left.confirmed !== 'Not Classified';
      
      return {
        ...prev,
        classificationSystem: criteriaSystem,
        siteProtocol: { ...defaultConfig, protocolPresetId: presetId }
      };
    });
  };

  // Clone as site protocol
  const handleCloneAsSiteProtocol = () => {
    setActivePresetTab('site_addendum');
  };

  // Update site config
  const handleUpdateSiteConfig = (newConfig: SiteProtocolConfig) => {
    onUpdateStudyData(prev => ({
      ...prev,
      siteProtocol: { ...newConfig }
    }));
  };

  // Reset to universal
  const handleResetToUniversal = () => {
    onUpdateStudyData(prev => ({
      ...prev,
      siteProtocol: {
        ...AUSTRALIA_DEFAULT_CONFIG,
        protocolPresetId: 'universal_core',
        organisation: '',
        site: '',
        siteNotes: '',
        subclavianRoutine: 'conditional',
        vertebralExtent: 'representative',
        ccaExtent: 'prox_mid_dist',
        ecaExtent: 'prox_only',
        imtExtent: 'conditional',
        nascetBModeExtent: 'conditional',
        specialExamType: 'routine_native',
        segmentRequirements: { ...UNIVERSAL_CORE_DEFAULT_DATASET }
      }
    }));
  };

  // Switch criteria in classification engine
  const handleSelectCriteria = (system: ClassificationSystem) => {
    onUpdateStudyData(prev => ({
      ...prev,
      classificationSystem: system
    }));
  };

  // Print Handlers
  const handlePrintProtocol = () => {
    window.print();
  };

  const handlePrintChecklist = () => {
    setActiveView('checklist');
    setTimeout(() => {
      window.print();
    }, 100);
  };

  return (
    <div id="protocol-library-page" className="max-w-7xl mx-auto space-y-5 pb-16">
      
      {/* 1. Protocol Header */}
      <ProtocolHeader
        studyData={studyData}
        activeView={activeView}
        onToggleView={setActiveView}
        onPrintProtocol={handlePrintProtocol}
        onPrintChecklist={handlePrintChecklist}
      />

      {/* Checklist View Mode */}
      {activeView === 'checklist' ? (
        <ProtocolChecklist
          studyData={studyData}
          onPrintChecklist={handlePrintChecklist}
          onBackToProtocol={() => setActiveView('protocol')}
        />
      ) : (
        /* Full Protocol Library Specification View */
        <div className="space-y-6">
          
          {/* 2. Preset Cards */}
          <ProtocolPresetCard
            activePresetId={siteConfig.protocolPresetId || 'australia_asum'}
            activeCriteria={studyData.classificationSystem}
            onSelectPreset={handleSelectPreset}
            onCloneAsSiteProtocol={handleCloneAsSiteProtocol}
          />

          {/* 3. Section Navigation Tabs */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-1.5 flex items-center gap-1.5 overflow-x-auto scrollbar-thin">
            <button
              type="button"
              id="tab-view-universal-core"
              onClick={() => setActivePresetTab('universal')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activePresetTab === 'universal'
                  ? 'bg-cyan-500/20 border border-cyan-500/60 text-cyan-300 font-extrabold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>Universal Core Framework (Sections A–T)</span>
            </button>

            <button
              type="button"
              id="tab-view-criteria-library"
              onClick={() => setActivePresetTab('criteria')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activePresetTab === 'criteria'
                  ? 'bg-indigo-500/20 border border-indigo-500/60 text-indigo-300 font-extrabold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>Stenosis Criteria & Diameter Library</span>
            </button>

            <button
              type="button"
              id="tab-view-waveform-reference"
              onClick={() => setActivePresetTab('waveform_reference')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activePresetTab === 'waveform_reference'
                  ? 'bg-emerald-500/20 border border-emerald-500/60 text-emerald-300 font-extrabold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Waveform & Hemodynamic Reference</span>
            </button>

            <button
              type="button"
              id="tab-view-site-addendum"
              onClick={() => setActivePresetTab('site_addendum')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activePresetTab === 'site_addendum'
                  ? 'bg-amber-500/20 border border-amber-500/60 text-amber-300 font-extrabold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Building2 className="w-4 h-4 text-amber-400" />
              <span>Site-Specific Addendum & Overrides</span>
              {siteOverrides.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-bold">
                  {siteOverrides.length}
                </span>
              )}
            </button>

            <button
              type="button"
              id="tab-view-test-suite"
              onClick={() => setActivePresetTab('test_suite')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activePresetTab === 'test_suite'
                  ? 'bg-cyan-500/20 border border-cyan-500/60 text-cyan-300 font-extrabold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>Verification Test Suite</span>
              <span className="px-1.5 py-0.2 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] font-bold font-mono">
                12 Cases
              </span>
            </button>
          </div>

          {/* Active Tab Panel */}
          {activePresetTab === 'universal' && (
            <ProtocolSection
              sections={UNIVERSAL_CORE_SECTIONS}
              siteOverrides={siteOverrides}
            />
          )}

          {activePresetTab === 'criteria' && (
            <CriteriaLibrary
              activeCriteria={studyData.classificationSystem}
              onSelectCriteria={handleSelectCriteria}
            />
          )}

          {activePresetTab === 'waveform_reference' && (
            <div className="bg-[#0b1329] border border-slate-800 rounded-2xl p-6 shadow-xl">
              <WaveformDescriptorGuide
                isOpen={true}
                onClose={() => {}}
                embedMode={true}
                category="ica"
              />
            </div>
          )}

          {activePresetTab === 'site_addendum' && (
            <SiteProtocolEditor
              config={siteConfig}
              onUpdateConfig={handleUpdateSiteConfig}
              onResetToUniversal={handleResetToUniversal}
            />
          )}

          {activePresetTab === 'test_suite' && (
            <ProtocolTestSuiteRunner
              studyData={studyData}
              onLoadTestCase={(newStudy) => onUpdateStudyData(newStudy)}
            />
          )}

          {/* 4. Evidence & References Accordion */}
          <div id="protocol-references-section" className="bg-[#0f172a] border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <button
              type="button"
              onClick={() => setReferencesOpen(!referencesOpen)}
              className="w-full px-5 py-4 flex items-center justify-between gap-3 text-left hover:bg-slate-800/40 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-blue-950/80 border border-blue-800/60 text-blue-400">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-slate-100 uppercase tracking-tight">
                    Professional Society References & Evidence Base
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Consensus statements, clinical trial definitions and practice parameter citations
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-slate-400">
                <span className="text-[11px] font-bold text-slate-400 hidden sm:inline">
                  {PROTOCOL_REFERENCES.length} References
                </span>
                <div className="w-5 h-5 rounded-md bg-slate-800 flex items-center justify-center">
                  {referencesOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </div>
              </div>
            </button>

            {referencesOpen && (
              <div className="px-5 pb-5 pt-2 border-t border-slate-800/80 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  {PROTOCOL_REFERENCES.map((ref, idx) => (
                    <div
                      key={idx}
                      className="bg-[#131d35] border border-slate-800 rounded-xl p-3.5 space-y-1.5 text-xs text-slate-300"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-cyan-300 text-[11px] uppercase tracking-wider">
                          {ref.organisation}
                        </span>
                        <span className={`px-2 py-0.2 rounded-full text-[9px] font-bold uppercase ${
                          ref.status === 'CURRENT' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {ref.status} • {ref.yearVersion}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-100 leading-snug">
                        {ref.title}
                      </h4>

                      <p className="text-[11px] text-slate-400 italic">
                        {ref.citation}
                      </p>

                      <div className="pt-1 text-[11px] text-slate-300 border-t border-slate-800/60 flex items-center justify-between">
                        <span>{ref.notes}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
