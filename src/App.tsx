import React, { useState } from 'react';
import { StudyData, SegmentData, PlaqueData } from './types';
import { getInitialStudyData, SAMPLE_CASES, SEGMENTS_META } from './constants';
import { suggestIcaStenosisCategory } from './utils/calculations';
import { VesselTreeList } from './components/VesselTreeList';
import { SegmentAssessment } from './components/SegmentAssessment';
import { NascetCalculator } from './components/NascetCalculator';
import { PlaqueRegister } from './components/PlaqueRegister';
import { DemographicsTab } from './components/DemographicsTab';
import { AssociatedPathologyTab } from './components/AssociatedPathologyTab';
import { CriteriaReferenceTab } from './components/CriteriaReferenceTab';
import { ClinicalReport } from './components/ClinicalReport';
import { CarotidDiagram } from './components/CarotidDiagram';
import { Activity, FileText, Ruler, ClipboardList, Settings, Sparkles, Heart, RefreshCw, Layers, BookOpen, User, ShieldAlert } from 'lucide-react';

export default function App() {
  const [studyData, setStudyData] = useState<StudyData>(getInitialStudyData());
  const [selectedSegmentIds, setSelectedSegmentIds] = useState<string[]>([]);
  const [activeSegmentId, setActiveSegmentId] = useState<string | null>(null);
  
  // Top-level worksheet tabs inspired by DVT app structure
  const [activeTab, setActiveTab] = useState<'assessment' | 'nascet' | 'plaque' | 'demographics' | 'associated' | 'reference' | 'report'>('assessment');

  // Multi-select or single select handler
  const handleSelectSegment = (id: string, isMulti: boolean) => {
    if (isMulti) {
      setSelectedSegmentIds(prev => {
        if (prev.includes(id)) {
          const next = prev.filter(x => x !== id);
          if (activeSegmentId === id) {
            setActiveSegmentId(next.length > 0 ? next[next.length - 1] : null);
          }
          return next;
        } else {
          setActiveSegmentId(id);
          return [...prev, id];
        }
      });
    } else {
      setSelectedSegmentIds(prev => {
        if (!prev.includes(id)) {
          return [...prev, id];
        }
        return prev;
      });
      setActiveSegmentId(id);
    }
  };

  const handleSetActiveSegment = (id: string) => {
    setActiveSegmentId(id);
    if (!selectedSegmentIds.includes(id)) {
      setSelectedSegmentIds(prev => [...prev, id]);
    }
  };

  const handleRemoveSelectedSegment = (id: string) => {
    setSelectedSegmentIds(prev => {
      const next = prev.filter(x => x !== id);
      if (activeSegmentId === id) {
        setActiveSegmentId(next.length > 0 ? next[next.length - 1] : null);
      }
      return next;
    });
  };

  const handleAssessSegment = (id: string) => {
    if (!selectedSegmentIds.includes(id)) {
      setSelectedSegmentIds(prev => [...prev, id]);
    }
    setActiveSegmentId(id);
    setActiveTab('assessment');
  };

  // Update a single segment's data
  const handleUpdateSegment = (id: string, updates: Partial<SegmentData>) => {
    setStudyData(prev => {
      const nextSegs = { ...prev.segments };
      nextSegs[id] = { ...nextSegs[id], ...updates };

      const nextState = { ...prev, segments: nextSegs };
      const rightSug = suggestIcaStenosisCategory('right', nextState);
      const leftSug = suggestIcaStenosisCategory('left', nextState);

      return {
        ...nextState,
        classifications: {
          right: { suggested: rightSug.category, confirmed: prev.classifications.right.confirmed },
          left: { suggested: leftSug.category, confirmed: prev.classifications.left.confirmed },
        }
      };
    });
  };

  // Bulk update multiple segments
  const handleUpdateSegmentsBulk = (ids: string[], updates: Partial<SegmentData>) => {
    setStudyData(prev => {
      const nextSegs = { ...prev.segments };
      for (const id of ids) {
        nextSegs[id] = { ...nextSegs[id], ...updates };
      }

      const nextState = { ...prev, segments: nextSegs };
      const rightSug = suggestIcaStenosisCategory('right', nextState);
      const leftSug = suggestIcaStenosisCategory('left', nextState);

      return {
        ...nextState,
        classifications: {
          right: { suggested: rightSug.category, confirmed: prev.classifications.right.confirmed },
          left: { suggested: leftSug.category, confirmed: prev.classifications.left.confirmed },
        }
      };
    });
  };

  // Add plaque profile
  const handleAddPlaque = (plaque: PlaqueData) => {
    setStudyData(prev => {
      const nextSegs = { ...prev.segments };
      for (const segId of plaque.segments) {
        if (nextSegs[segId]) {
          nextSegs[segId].plaquePresent = true;
        }
      }

      return {
        ...prev,
        segments: nextSegs,
        plaques: [...prev.plaques, plaque],
      };
    });
    setActiveTab('plaque');
  };

  const handleAddPlaqueFromSegments = (ids: string[]) => {
    setActiveTab('plaque');
  };

  // Remove plaque profile
  const handleRemovePlaque = (id: string) => {
    setStudyData(prev => ({
      ...prev,
      plaques: prev.plaques.filter(p => p.id !== id),
    }));
  };

  // Update NASCET calculator values
  const handleUpdateNascet = (
    side: 'right' | 'left',
    plane: 'longitudinal' | 'transverse',
    minLumenA: number | null,
    normalLumenB: number | null
  ) => {
    setStudyData(prev => {
      const nextNascet = { ...prev.nascet };
      const sideNascet = { ...nextNascet[side] };
      
      let calcVal: number | null = null;
      if (minLumenA !== null && normalLumenB !== null && normalLumenB > 0) {
        calcVal = Number(((1 - minLumenA / normalLumenB) * 100).toFixed(1));
      }

      sideNascet[plane] = {
        plane,
        minLumenA,
        normalLumenB,
        calculatedStenosis: calcVal,
      };

      nextNascet[side] = sideNascet;
      return {
        ...prev,
        nascet: nextNascet,
      };
    });
  };

  const handleConfirmClassification = (side: 'right' | 'left', category: string) => {
    setStudyData(prev => {
      const nextClassifications = { ...prev.classifications };
      nextClassifications[side] = {
        ...nextClassifications[side],
        confirmed: category,
      };
      return {
        ...prev,
        classifications: nextClassifications,
      };
    });
  };

  // Update study data fields
  const handleUpdateStudy = (updates: Partial<StudyData>) => {
    setStudyData(prev => {
      const nextState = { ...prev, ...updates };
      const rightSug = suggestIcaStenosisCategory('right', nextState);
      const leftSug = suggestIcaStenosisCategory('left', nextState);

      return {
        ...nextState,
        classifications: {
          right: { suggested: rightSug.category, confirmed: prev.classifications.right.confirmed },
          left: { suggested: leftSug.category, confirmed: prev.classifications.left.confirmed },
        }
      };
    });
  };

  // Quick normalise selected segments
  const handleQuickMarkNormal = (ids: string[]) => {
    const normalUpdates: Partial<SegmentData> = {
      flowDirection: 'antegrade',
      waveform: 'Normal',
      plaquePresent: false,
      intimalThickening: false,
      stenosisPresent: false,
      comments: '',
      technicalLimitations: '',
    };

    setStudyData(prev => {
      const nextSegs = { ...prev.segments };
      for (const id of ids) {
        const meta = SEGMENTS_META[id];
        let standardPsv = 70;
        let standardEdv = 18;

        if (meta?.type === 'cca') { standardPsv = 75; standardEdv = 18; }
        else if (meta?.type === 'ica') { standardPsv = 68; standardEdv = 22; }
        else if (meta?.type === 'eca') { standardPsv = 70; standardEdv = 12; }
        else if (meta?.type === 'bulb') { standardPsv = 60; standardEdv = 15; }
        else if (meta?.type === 'vertebral') { standardPsv = 45; standardEdv = 12; }
        else if (meta?.type === 'subclavian' || meta?.type === 'bct') { standardPsv = 95; standardEdv = 10; }

        nextSegs[id] = {
          ...nextSegs[id],
          ...normalUpdates,
          psv: standardPsv,
          edv: standardEdv,
        };
      }

      const nextState = { ...prev, segments: nextSegs };
      const rightSug = suggestIcaStenosisCategory('right', nextState);
      const leftSug = suggestIcaStenosisCategory('left', nextState);

      return {
        ...nextState,
        classifications: {
          right: { suggested: rightSug.category, confirmed: prev.classifications.right.confirmed },
          left: { suggested: leftSug.category, confirmed: prev.classifications.left.confirmed },
        }
      };
    });
    setSelectedSegmentIds([]);
  };

  const handleMarkSideNormal = (side: 'right' | 'left') => {
    const ids = Object.keys(SEGMENTS_META).filter(id => id.startsWith(side === 'right' ? 'r_' : 'l_'));
    handleQuickMarkNormal(ids);
  };

  const handleResetAll = () => {
    if (window.confirm("Are you sure you want to reset all worksheet measurements and patient details?")) {
      setStudyData(getInitialStudyData());
      setSelectedSegmentIds([]);
    }
  };

  const loadPreset = (presetName: string) => {
    const preset = SAMPLE_CASES.find(c => c.name === presetName);
    if (preset) {
      const freshData = preset.action(getInitialStudyData());
      setStudyData(freshData);
      setSelectedSegmentIds([]);
    }
  };

  return (
    <div id="carotid-worksheet-app" className="min-h-screen bg-[#080d19] text-slate-100 flex flex-col antialiased font-sans">
      
      {/* Top Header */}
      <header className="bg-[#0f172a] border-b border-slate-800 px-6 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-md">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
              CAROTID ULTRASOUND CLINICAL WORKSHEET
              <span className="px-2 py-0.5 rounded-full bg-cyan-950/50 border border-cyan-800 text-cyan-400 text-[10px] font-bold">
                DVT-STYLE WORKFLOW
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
              <span>Patient: <strong className="text-slate-200">{studyData.patientName || 'Unassigned'}</strong></span>
              <span>•</span>
              <span>MRN: <strong className="text-slate-200">{studyData.patientId || 'N/A'}</strong></span>
              <span>•</span>
              <span>Protocol: <strong className="text-cyan-400">{studyData.classificationSystem.replace('_', ' ')}</strong></span>
            </p>
          </div>
        </div>

        {/* Clinical Presets & Reset */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Presets:
          </span>
          <div className="flex gap-1.5">
            {SAMPLE_CASES.map(c => (
              <button
                key={c.name}
                id={`preset-${c.name.replace(/\s+/g, '-').toLowerCase()}`}
                onClick={() => loadPreset(c.name)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-800 bg-[#1e293b] hover:bg-[#2c3e50] text-slate-200 hover:text-white text-xs font-semibold transition-all shadow-sm cursor-pointer"
                title={c.description}
              >
                {c.name.split(' (')[0]}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Top DVT-style Worksheet Navigation Tabs */}
      <nav className="bg-[#0f172a]/90 border-b border-slate-800 px-6 flex items-center gap-2 overflow-x-auto shrink-0 sticky top-[73px] z-30">
        {[
          { id: 'assessment', label: 'Vessel Tree & Diagram', icon: Layers },
          { id: 'nascet', label: 'NASCET Calculator', icon: Ruler },
          { id: 'plaque', label: 'Plaque Register', icon: ClipboardList },
          { id: 'demographics', label: 'Patient & Indications', icon: User },
          { id: 'associated', label: 'Associated Pathology', icon: ShieldAlert },
          { id: 'reference', label: 'Criteria Reference', icon: BookOpen },
          { id: 'report', label: 'Structured Report', icon: FileText },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'border-cyan-400 text-cyan-400 bg-cyan-505/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 p-6">
        {activeTab === 'assessment' && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            <main className="xl:col-span-8 space-y-6">
              {/* Anatomical Diagram View */}
              <CarotidDiagram
                studyData={studyData}
                selectedSegmentIds={selectedSegmentIds}
                activeSegmentId={activeSegmentId}
                onSelectSegment={handleSelectSegment}
                onAssessSegment={handleAssessSegment}
                onToggleVariant={() => handleUpdateStudy({ variantLeftBct: !studyData.variantLeftBct })}
              />

              {/* DVT-Style Left/Right Vessel Tree Structured Panels */}
              <VesselTreeList
                studyData={studyData}
                selectedSegmentIds={selectedSegmentIds}
                activeSegmentId={activeSegmentId}
                onSelectSegment={handleSelectSegment}
                onAssessSegment={handleAssessSegment}
                onQuickMarkNormal={handleQuickMarkNormal}
                onMarkSideNormal={handleMarkSideNormal}
              />
            </main>

            <aside className="xl:col-span-4 sticky top-[136px] h-[calc(100vh-160px)] flex flex-col">
              <SegmentAssessment
                studyData={studyData}
                selectedIds={selectedSegmentIds}
                activeId={activeSegmentId}
                onSetActiveSegment={handleSetActiveSegment}
                onRemoveSelectedSegment={handleRemoveSelectedSegment}
                onUpdateSegment={handleUpdateSegment}
                onUpdateSegmentsBulk={handleUpdateSegmentsBulk}
                onAddPlaqueFromSegments={handleAddPlaqueFromSegments}
              />
            </aside>
          </div>
        )}

        {activeTab === 'nascet' && (
          <NascetCalculator
            studyData={studyData}
            onUpdateNascet={handleUpdateNascet}
          />
        )}

        {activeTab === 'plaque' && (
          <PlaqueRegister
            studyData={studyData}
            selectedSegmentIds={selectedSegmentIds}
            onAddPlaque={handleAddPlaque}
            onRemovePlaque={handleRemovePlaque}
          />
        )}

        {activeTab === 'demographics' && (
          <DemographicsTab
            studyData={studyData}
            onUpdateStudy={handleUpdateStudy}
          />
        )}

        {activeTab === 'associated' && (
          <AssociatedPathologyTab
            studyData={studyData}
            onUpdateStudy={handleUpdateStudy}
          />
        )}

        {activeTab === 'reference' && (
          <CriteriaReferenceTab
            studyData={studyData}
          />
        )}

        {activeTab === 'report' && (
          <ClinicalReport
            studyData={studyData}
            onConfirmClassification={handleConfirmClassification}
            onUpdateStudy={handleUpdateStudy}
            onResetAll={handleResetAll}
          />
        )}
      </div>

      {/* Footer */}
      <footer className="bg-[#0f172a] border-t border-slate-800 py-4 px-6 text-center text-[10px] text-slate-500 mt-auto">
        Carotid Ultrasound Clinical Worksheet • DVT-Style Left/Right Structured Workflow • ASUM 2021 & SRU Consensus Standards
      </footer>

    </div>
  );
}
