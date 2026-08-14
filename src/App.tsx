import React, { useState } from 'react';
import { StudyData, SegmentData, PlaqueData, MainTab } from './types';
import { getInitialStudyData, SAMPLE_CASES, SEGMENTS_META } from './constants';
import { suggestIcaStenosisCategory } from './utils/calculations';
import { ScanWorksheetTab } from './components/ScanWorksheetTab';
import { PriorComparisonTab } from './components/PriorComparisonTab';
import { ClinicalReport } from './components/ClinicalReport';
import { Activity, FileText, History, Layers, Sparkles, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [studyData, setStudyData] = useState<StudyData>(getInitialStudyData());
  const [selectedSegmentIds, setSelectedSegmentIds] = useState<string[]>([]);
  const [activeSegmentId, setActiveSegmentId] = useState<string | null>(null);
  
  // Clean 3-Tab Architecture: 'scan' | 'previous' | 'report'
  const [activeTab, setActiveTab] = useState<MainTab>('scan');
  
  // Sub-view toggle inside SCAN: diagram vs matrix
  const [assessmentViewMode, setAssessmentViewMode] = useState<'diagram_tree' | 'matrix'>('diagram_tree');

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
    setActiveTab('scan');
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
      
      {/* 1. Main Header */}
      <header className="bg-[#0f172a] border-b border-slate-800 px-5 sm:px-6 py-3.5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 sticky top-0 z-40 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-md shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
              CAROTID ARTERIAL DUPLEX WORKSTATION
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-cyan-950/50 border border-cyan-800 text-cyan-400 text-[10px] font-bold">
                CLINICAL SUITE
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 mt-0.5 flex flex-wrap items-center gap-x-2">
              <span>Patient: <strong className="text-slate-200">{studyData.patientName || 'Unassigned'}</strong></span>
              <span>•</span>
              <span>MRN: <strong className="text-slate-200">{studyData.patientId || 'N/A'}</strong></span>
              <span>•</span>
              <span>Protocol: <strong className="text-cyan-400">{studyData.classificationSystem.replace('_', ' ')}</strong></span>
            </p>
          </div>
        </div>

        {/* Clinical Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-cyan-400" /> Presets:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {SAMPLE_CASES.map(c => (
              <button
                key={c.name}
                id={`preset-${c.name.replace(/\s+/g, '-').toLowerCase()}`}
                onClick={() => loadPreset(c.name)}
                className="px-2.5 py-1 rounded-lg border border-slate-800 bg-[#1e293b] hover:bg-[#2c3e50] text-slate-200 hover:text-white text-xs font-semibold transition-all shadow-sm cursor-pointer"
                title={c.description}
              >
                {c.name.split(' (')[0]}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* 2. Primary 3-Tab Vascular Navigation */}
      <nav className="bg-[#0b1329] border-b border-slate-800 px-5 sm:px-6 flex items-center gap-1.5 overflow-x-auto shrink-0 sticky top-[69px] z-30 shadow-inner">
        <button
          type="button"
          id="nav-tab-scan"
          onClick={() => setActiveTab('scan')}
          className={`flex items-center gap-2.5 px-5 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'scan'
              ? 'border-cyan-400 text-cyan-400 bg-cyan-950/20 shadow-sm'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>1. SCAN</span>
        </button>

        <button
          type="button"
          id="nav-tab-previous"
          onClick={() => setActiveTab('previous')}
          className={`flex items-center gap-2.5 px-5 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'previous'
              ? 'border-cyan-400 text-cyan-400 bg-cyan-950/20 shadow-sm'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
          }`}
        >
          <History className="w-4 h-4" />
          <span>2. PREVIOUS EXAMINATION</span>
          {studyData.priorExam?.hasPriorExam && (
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          )}
        </button>

        <button
          type="button"
          id="nav-tab-report"
          onClick={() => setActiveTab('report')}
          className={`flex items-center gap-2.5 px-5 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'report'
              ? 'border-cyan-400 text-cyan-400 bg-cyan-950/20 shadow-sm'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>3. STRUCTURED REPORT</span>
        </button>
      </nav>

      {/* 3. Main Workspace Body */}
      <div className="flex-1 p-4 sm:p-6 space-y-6 max-w-[1600px] w-full mx-auto">
        
        {/* Tab 1: SCAN (Consolidated Primary Scanning Workspace) */}
        {activeTab === 'scan' && (
          <ScanWorksheetTab
            studyData={studyData}
            selectedSegmentIds={selectedSegmentIds}
            activeSegmentId={activeSegmentId}
            assessmentViewMode={assessmentViewMode}
            onSetAssessmentViewMode={setAssessmentViewMode}
            onSelectSegment={handleSelectSegment}
            onSetActiveSegment={handleSetActiveSegment}
            onRemoveSelectedSegment={handleRemoveSelectedSegment}
            onAssessSegment={handleAssessSegment}
            onUpdateSegment={handleUpdateSegment}
            onUpdateSegmentsBulk={handleUpdateSegmentsBulk}
            onAddPlaque={handleAddPlaque}
            onRemovePlaque={handleRemovePlaque}
            onUpdateNascet={handleUpdateNascet}
            onUpdateStudy={handleUpdateStudy}
            onQuickMarkNormal={handleQuickMarkNormal}
            onMarkSideNormal={handleMarkSideNormal}
            onResetAll={handleResetAll}
            onNavigateTab={setActiveTab}
          />
        )}

        {/* Tab 2: PREVIOUS EXAMINATION (Longitudinal Prior Study Comparison) */}
        {activeTab === 'previous' && (
          <PriorComparisonTab
            studyData={studyData}
            onUpdateStudy={handleUpdateStudy}
            onNavigateTab={setActiveTab}
          />
        )}

        {/* Tab 3: STRUCTURED REPORT (Final Report, Impression & Verification) */}
        {activeTab === 'report' && (
          <ClinicalReport
            studyData={studyData}
            onConfirmClassification={handleConfirmClassification}
            onUpdateStudy={handleUpdateStudy}
            onResetAll={handleResetAll}
            onNavigateTab={setActiveTab}
          />
        )}

      </div>

      {/* 4. Footer */}
      <footer className="bg-[#0f172a] border-t border-slate-800 py-3.5 px-6 text-center text-[10px] text-slate-500 mt-auto">
        Vascular Ultrasound Clinical Workstation • 3-Tab Streamlined Worksheet • ASUM 2021 & SRU Consensus Standards
      </footer>

    </div>
  );
}
