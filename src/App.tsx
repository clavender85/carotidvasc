import React, { useState } from 'react';
import { StudyData, SegmentData, PlaqueData, MainTab } from './types';
import { getInitialStudyData, SEGMENTS_META } from './constants';
import { getDemoCaseById } from './data/demoCases';
import { suggestIcaStenosisCategory } from './utils/calculations';
import { AppHeader } from './components/AppHeader';
import { ScanWorksheetTab } from './components/ScanWorksheetTab';
import { PriorComparisonTab } from './components/PriorComparisonTab';
import { ClinicalReport } from './components/ClinicalReport';
import { ProtocolPage } from './components/protocol/ProtocolPage';
import { Activity, FileText, History, Layers, Sparkles, RefreshCw, CheckCircle2, BookOpen } from 'lucide-react';

export default function App() {
  const [studyData, setStudyData] = useState<StudyData>(getInitialStudyData());
  const [selectedSegmentIds, setSelectedSegmentIds] = useState<string[]>([]);
  const [activeSegmentId, setActiveSegmentId] = useState<string | null>(null);
  
  // Clean 4-Tab Architecture: 'scan' | 'previous' | 'report' | 'protocol'
  const [activeTab, setActiveTab] = useState<MainTab>('scan');

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
        if (prev.includes(id) && activeSegmentId === id) {
          setActiveSegmentId(null);
          return [];
        } else {
          setActiveSegmentId(id);
          return [id];
        }
      });
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

  const handleLoadDemoCase = (caseId: string) => {
    const demoCase = getDemoCaseById(caseId);
    if (demoCase) {
      const freshData = demoCase.load();
      setStudyData(freshData);
      setSelectedSegmentIds([]);
      setActiveTab('scan');
    }
  };

  const handleExitDemo = () => {
    setStudyData(getInitialStudyData());
    setSelectedSegmentIds([]);
    setActiveTab('scan');
  };

  return (
    <div id="carotid-worksheet-app" className="min-h-screen bg-[#080d19] text-slate-100 flex flex-col antialiased font-sans">
      
      {/* 1. Main Application Header & Tab Navigation */}
      <AppHeader
        studyData={studyData}
        activeTab={activeTab}
        onNavigateTab={setActiveTab}
        onUpdateStudy={handleUpdateStudy}
        onLoadDemoCase={handleLoadDemoCase}
        onExitDemo={handleExitDemo}
      />

      {/* 2. Main Workspace Body */}
      <div className="flex-1 px-4 sm:px-6 py-4 sm:py-6 space-y-6 w-full">
        
        {/* Tab 1: SCAN (Consolidated Primary Scanning Workspace) */}
        {activeTab === 'scan' && (
          <ScanWorksheetTab
            studyData={studyData}
            selectedSegmentIds={selectedSegmentIds}
            activeSegmentId={activeSegmentId}
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

        {/* Tab 4: PROTOCOL (Standard Protocol Library & Site Addendum Builder) */}
        {activeTab === 'protocol' && (
          <ProtocolPage
            studyData={studyData}
            onUpdateStudyData={setStudyData}
          />
        )}

      </div>

      {/* 4. Footer */}
      <footer className="bg-[#0f172a] border-t border-slate-800 py-3.5 px-6 text-center text-[10px] text-slate-500 mt-auto">
        Vascular Ultrasound Clinical Workstation • 4-Tab Standardised Suite • ASUM 2021, IAC 2023 & NASCET Protocol Framework
      </footer>

    </div>
  );
}
