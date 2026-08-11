import React, { useState } from 'react';
import { StudyData, SegmentData, PlaqueData } from './types';
import { getInitialStudyData, SAMPLE_CASES, SEGMENTS_META } from './constants';
import { suggestIcaStenosisCategory } from './utils/calculations';
import { AnatomicalTree } from './components/AnatomicalTree';
import { SegmentAssessment } from './components/SegmentAssessment';
import { NascetCalculator } from './components/NascetCalculator';
import { PlaqueRegister } from './components/PlaqueRegister';
import { SettingsPanel } from './components/SettingsPanel';
import { ClinicalReport } from './components/ClinicalReport';
import { Activity, FileText, Ruler, ClipboardList, Settings, Sparkles, ShieldCheck, Heart, RefreshCw, Layers } from 'lucide-react';

export default function App() {
  const [studyData, setStudyData] = useState<StudyData>(getInitialStudyData());
  const [selectedSegmentIds, setSelectedSegmentIds] = useState<string[]>([]);
  const [activeSegmentId, setActiveSegmentId] = useState<string | null>(null);
  const [activeSidebarTab, setActiveSidebarTab] = useState<'assess' | 'nascet' | 'plaque' | 'settings'>('assess');

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
    // Automatically switch sidebar to assess tab when segments are clicked
    setActiveSidebarTab('assess');
  };

  const handleSetActiveSegment = (id: string) => {
    setActiveSegmentId(id);
    if (!selectedSegmentIds.includes(id)) {
      setSelectedSegmentIds(prev => [...prev, id]);
    }
    setActiveSidebarTab('assess');
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

  // Assess segment (Double-click/Right-click triggers this to focus tab)
  const handleAssessSegment = (id: string) => {
    if (!selectedSegmentIds.includes(id)) {
      setSelectedSegmentIds(prev => [...prev, id]);
    }
    setActiveSegmentId(id);
    setActiveSidebarTab('assess');
  };

  // Update a single segment's data
  const handleUpdateSegment = (id: string, updates: Partial<SegmentData>) => {
    setStudyData(prev => {
      const nextSegs = { ...prev.segments };
      nextSegs[id] = { ...nextSegs[id], ...updates };

      // Re-trigger suggestions in state
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
      // Mark all associated segments as having plaquePresent = true
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
    setActiveSidebarTab('plaque');
  };

  // Create/Add plaque from a selection of segments directly
  const handleAddPlaqueFromSegments = (ids: string[]) => {
    setActiveSidebarTab('plaque');
    // We pass selected segment IDs which will prefill the plaque register state inside the component
  };

  // Remove plaque profile
  const handleRemovePlaque = (id: string) => {
    setStudyData(prev => ({
      ...prev,
      plaques: prev.plaques.filter(p => p.id !== id),
    }));
  };

  // Update NASCET diameter calculator values
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

  // Confirm / Override classification suggest
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

  // Toggle Left BCT Variant
  const handleToggleVariant = () => {
    setStudyData(prev => ({
      ...prev,
      variantLeftBct: !prev.variantLeftBct,
    }));
  };

  // Update other generic study keys (patient name, comments, system)
  const handleUpdateStudyData = (updates: Partial<StudyData>) => {
    setStudyData(prev => {
      const nextState = { ...prev, ...updates };
      // If we updated the system, let's recalculate the suggested categories
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

  // Mark an entire side as normal
  const handleMarkSideNormal = (side: 'right' | 'left') => {
    const ids = Object.keys(SEGMENTS_META).filter(id => id.startsWith(side === 'right' ? 'r_' : 'l_'));
    handleQuickMarkNormal(ids);
  };

  // Reset Entire Form
  const handleResetAll = () => {
    if (window.confirm("Are you sure you want to reset all worksheet measurements and demographics back to blank unassessed states?")) {
      setStudyData(getInitialStudyData());
      setSelectedSegmentIds([]);
    }
  };

  // Load a preset clinical case
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
      
      {/* Premium Application Header */}
      <header className="bg-[#0f172a] border-b border-slate-800 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-md shadow-cyan-950/20">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
              CAROTID ULTRASOUND WORKSHEET
              <span className="px-2 py-0.5 rounded-full bg-cyan-950/50 border border-cyan-800 text-cyan-400 text-[10px] font-bold tracking-wider">
                VERSION 1.2
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Enterprise Operating System for Anatomical Carotid Hemodynamics and Atherosclerotic Plaque Registries
            </p>
          </div>
        </div>

        {/* Case Preset Selector & Quick reset */}
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Fast-Load Clinical Presets:
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

      {/* Main split work space */}
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-12 gap-6 p-6">
        
        {/* Left column (Arterial Canvas & Clinical Report) */}
        <main className="xl:col-span-8 space-y-6 flex flex-col">
          
          {/* 1. Anatomical Tree */}
          <AnatomicalTree
            studyData={studyData}
            selectedSegmentIds={selectedSegmentIds}
            activeSegmentId={activeSegmentId}
            onSelectSegment={handleSelectSegment}
            onAssessSegment={handleAssessSegment}
            onQuickMarkNormal={handleQuickMarkNormal}
            onMarkSideNormal={handleMarkSideNormal}
            onResetAll={handleResetAll}
            onToggleVariant={handleToggleVariant}
          />

          {/* 2. Live Updating Clinical Report */}
          <ClinicalReport
            studyData={studyData}
            onConfirmClassification={handleConfirmClassification}
            onResetAll={handleResetAll}
          />

        </main>

        {/* Right column (Diagnostic terminal - Sticky Sidebar) */}
        <aside className="xl:col-span-4 flex flex-col gap-4">
          
          {/* Tabs header for sidebar */}
          <div className="flex bg-[#0f172a] p-1 rounded-xl gap-1 shrink-0 border border-slate-800">
            <button
              id="sidebar-tab-assess"
              onClick={() => setActiveSidebarTab('assess')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeSidebarTab === 'assess'
                  ? 'bg-[#1e293b] text-cyan-400 border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:bg-[#1e293b]/40 hover:text-slate-200'
              }`}
            >
              <Heart className="w-3.5 h-3.5" />
              <span>Assessment</span>
            </button>
            <button
              id="sidebar-tab-nascet"
              onClick={() => setActiveSidebarTab('nascet')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeSidebarTab === 'nascet'
                  ? 'bg-[#1e293b] text-cyan-400 border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:bg-[#1e293b]/40 hover:text-slate-200'
              }`}
            >
              <Ruler className="w-3.5 h-3.5" />
              <span>NASCET</span>
            </button>
            <button
              id="sidebar-tab-plaque"
              onClick={() => setActiveSidebarTab('plaque')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeSidebarTab === 'plaque'
                  ? 'bg-[#1e293b] text-cyan-400 border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:bg-[#1e293b]/40 hover:text-slate-200'
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5" />
              <span>Plaques</span>
            </button>
            <button
              id="sidebar-tab-settings"
              onClick={() => setActiveSidebarTab('settings')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeSidebarTab === 'settings'
                  ? 'bg-[#1e293b] text-cyan-400 border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:bg-[#1e293b]/40 hover:text-slate-200'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Demographics</span>
            </button>
          </div>

          {/* Sticky view holder for tabs */}
          <div className="flex-1 sticky top-[92px] max-h-[calc(100vh-140px)] min-h-[460px] flex flex-col">
            {activeSidebarTab === 'assess' && (
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
            )}
            
            {activeSidebarTab === 'nascet' && (
              <NascetCalculator
                studyData={studyData}
                onUpdateNascet={handleUpdateNascet}
              />
            )}

            {activeSidebarTab === 'plaque' && (
              <PlaqueRegister
                studyData={studyData}
                selectedSegmentIds={selectedSegmentIds}
                onAddPlaque={handleAddPlaque}
                onRemovePlaque={handleRemovePlaque}
              />
            )}

            {activeSidebarTab === 'settings' && (
              <SettingsPanel
                studyData={studyData}
                onUpdateStudyData={handleUpdateStudyData}
              />
            )}
          </div>

        </aside>

      </div>

      {/* High-end minimalist footer */}
      <footer className="bg-[#0f172a] border-t border-slate-800 py-4 px-6 text-center text-[10px] text-slate-500 mt-auto">
        Designed strictly for enterprise clinical workloads. Underpinned by ASUM 2021, SRU 2003, and modified IAC criteria. All computations run sandboxed, client-side.
      </footer>

    </div>
  );
}
