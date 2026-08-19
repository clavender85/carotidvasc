import React, { useState } from 'react';
import { StudyData, MainTab } from '../types';
import { DEMO_CASES, DemoCaseMeta } from '../data/demoCases';
import { 
  Edit3, 
  Activity, 
  X, 
  Check, 
  Layers, 
  History, 
  FileText, 
  BookOpen, 
  Play, 
  AlertTriangle, 
  RotateCcw,
  Sparkles,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

interface AppHeaderProps {
  studyData: StudyData;
  activeTab: MainTab;
  onNavigateTab: (tab: MainTab) => void;
  onUpdateStudy: (updates: Partial<StudyData>) => void;
  onLoadDemoCase: (caseId: string) => void;
  onExitDemo: () => void;
}

/**
 * Formats a date string (YYYY-MM-DD or similar) into a clean, human-readable medical format like '12 May 1964'.
 */
function formatReadableDate(dateStr?: string | null): string {
  if (!dateStr || !dateStr.trim()) return '—';
  
  const trimmed = dateStr.trim();
  // Check if standard YYYY-MM-DD
  const ymdMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (ymdMatch) {
    const year = parseInt(ymdMatch[1], 10);
    const month = parseInt(ymdMatch[2], 10) - 1;
    const day = parseInt(ymdMatch[3], 10);
    const date = new Date(year, month, day);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    }
  }

  // Check if DD/MM/YYYY
  const dmyMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10) - 1;
    const year = parseInt(dmyMatch[3], 10);
    const date = new Date(year, month, day);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    }
  }

  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    return parsed.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  return dateStr;
}

/**
 * Checks if the current non-demo study has user-entered data that would be overwritten.
 */
function hasActiveWorksheetData(data: StudyData): boolean {
  if (data.isDemoMode) return false;
  if (data.patientName && data.patientName.trim()) return true;
  if (data.patientId && data.patientId.trim()) return true;
  if (data.plaques && data.plaques.length > 0) return true;
  for (const seg of Object.values(data.segments)) {
    if (seg.psv !== null || seg.edv !== null || seg.plaquePresent) return true;
  }
  return false;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  studyData,
  activeTab,
  onNavigateTab,
  onUpdateStudy,
  onLoadDemoCase,
  onExitDemo,
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [pendingDemoCase, setPendingDemoCase] = useState<DemoCaseMeta | null>(null);

  // Form state for editing patient & study details
  const [formData, setFormData] = useState({
    patientName: studyData.patientName || '',
    patientDob: studyData.patientDob || '',
    patientId: studyData.patientId || '',
    examDate: studyData.examDate || '',
    location: studyData.location || '',
    company: studyData.company || '',
    sonographer: studyData.sonographer || '',
  });

  const handleOpenEdit = () => {
    setFormData({
      patientName: studyData.patientName || '',
      patientDob: studyData.patientDob || '',
      patientId: studyData.patientId || '',
      examDate: studyData.examDate || '',
      location: studyData.location || '',
      company: studyData.company || '',
      sonographer: studyData.sonographer || '',
    });
    setIsEditModalOpen(true);
  };

  const handleSaveDetails = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateStudy({
      patientName: formData.patientName.trim(),
      patientDob: formData.patientDob.trim(),
      patientId: formData.patientId.trim(),
      examDate: formData.examDate.trim(),
      location: formData.location.trim(),
      company: formData.company.trim(),
      sonographer: formData.sonographer.trim(),
    });
    setIsEditModalOpen(false);
  };

  const handleSelectCase = (demoCase: DemoCaseMeta) => {
    if (hasActiveWorksheetData(studyData)) {
      setPendingDemoCase(demoCase);
    } else {
      onLoadDemoCase(demoCase.id);
      setIsDemoModalOpen(false);
      setPendingDemoCase(null);
    }
  };

  const handleConfirmLoadDemo = () => {
    if (pendingDemoCase) {
      onLoadDemoCase(pendingDemoCase.id);
      setPendingDemoCase(null);
      setIsDemoModalOpen(false);
    }
  };

  const isDemoActive = Boolean(studyData.isDemoMode);

  return (
    <header id="main-application-header" className="bg-[#0f172a] border-b border-slate-800 sticky top-0 z-40 shadow-md">
      
      {/* 1. Main Header Container */}
      <div className="px-4 sm:px-6 py-2.5 space-y-2">
        
        {/* Top Row: Application Title + Action Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 shadow-sm">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-xs sm:text-sm font-extrabold text-slate-100 uppercase tracking-tight flex items-center gap-2">
                <span>CAROTID ULTRASOUND CLINICAL WORKSHEET</span>
                <span className="hidden md:inline-block px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 text-[10px] font-mono font-medium">
                  v2.4
                </span>
              </h1>
            </div>
          </div>

          {/* Right Action Controls: Demo Mode Control & Edit Details */}
          <div className="flex items-center gap-2 flex-wrap ml-auto sm:ml-0">
            
            {/* Demo Mode Badge & Controls */}
            {isDemoActive ? (
              <div className="flex items-center gap-2">
                {/* Persistent Amber Demo Badge */}
                <div 
                  id="header-demo-badge"
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-950/60 border border-amber-700/80 text-amber-300 text-xs font-bold shadow-xs"
                >
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span>DEMO MODE</span>
                  <span className="hidden md:inline text-amber-400/80 text-[10px] font-normal font-sans">
                    • Sample data — not for clinical use
                  </span>
                </div>

                {/* Change Demo Case Button */}
                <button
                  type="button"
                  id="btn-header-change-demo"
                  onClick={() => setIsDemoModalOpen(true)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer shadow-xs"
                  title="Switch to another demo case"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Switch Case</span>
                </button>

                {/* Exit Demo Button */}
                <button
                  type="button"
                  id="btn-header-exit-demo"
                  onClick={onExitDemo}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 border border-amber-800/80 transition-all cursor-pointer shadow-xs"
                  title="Clear demo data and return to blank worksheet"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                  <span>Exit Demo</span>
                </button>
              </div>
            ) : (
              /* Compact Demo Mode Button when Demo Mode is OFF */
              <button
                type="button"
                id="btn-header-open-demo"
                onClick={() => setIsDemoModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 transition-all cursor-pointer shadow-xs"
                title="Open sample demonstration cases for testing and training"
              >
                <Play className="w-3 h-3 fill-cyan-400 text-cyan-400" />
                <span>Demo Mode</span>
              </button>
            )}

            {/* Edit Details Button */}
            <button
              type="button"
              id="btn-header-edit-details"
              onClick={handleOpenEdit}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-cyan-950/70 hover:bg-cyan-900/90 text-cyan-300 border border-cyan-700/80 transition-all shadow-sm cursor-pointer"
              title="Edit patient and study details"
            >
              <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Edit Details</span>
            </button>
          </div>
        </div>

        {/* 2. Patient & Examination Information Strip */}
        <div
          id="header-patient-info-strip"
          className="flex flex-wrap items-center gap-x-6 sm:gap-x-8 gap-y-2 text-xs pt-0.5"
        >
          {/* 1. Patient Name */}
          <div className="min-w-[120px] max-w-[200px]">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              PATIENT
            </span>
            <span className="font-extrabold text-slate-100 text-xs sm:text-sm truncate block" title={studyData.patientName || 'Unassigned'}>
              {studyData.patientName || <span className="text-slate-500 italic font-normal">Unassigned</span>}
            </span>
          </div>

          {/* 2. DOB */}
          <div className="min-w-[90px]">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              DOB
            </span>
            <span className="font-bold text-slate-200 text-xs sm:text-sm block">
              {formatReadableDate(studyData.patientDob)}
            </span>
          </div>

          {/* 3. UR / MRN */}
          <div className="min-w-[80px]">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              UR / MRN
            </span>
            <span className="font-bold text-slate-200 font-mono text-xs sm:text-sm block">
              {studyData.patientId || <span className="text-slate-500 italic font-sans font-normal">—</span>}
            </span>
          </div>

          {/* 4. Study Date */}
          <div className="min-w-[90px]">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              STUDY DATE
            </span>
            <span className="font-bold text-slate-200 text-xs sm:text-sm block">
              {formatReadableDate(studyData.examDate)}
            </span>
          </div>

          {/* 5. Location */}
          <div className="min-w-[120px] max-w-[180px]">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              LOCATION
            </span>
            <span className="font-bold text-slate-200 text-xs sm:text-sm truncate block" title={studyData.location || '—'}>
              {studyData.location || <span className="text-slate-500 italic font-normal">—</span>}
            </span>
          </div>

          {/* 6. Company / Organisation */}
          <div className="min-w-[130px] max-w-[200px]">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              COMPANY
            </span>
            <span className="font-bold text-slate-200 text-xs sm:text-sm truncate block" title={studyData.company || '—'}>
              {studyData.company || <span className="text-slate-500 italic font-normal">—</span>}
            </span>
          </div>

          {/* 7. Sonographer */}
          <div className="min-w-[100px] max-w-[160px]">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              SONOGRAPHER
            </span>
            <span className="font-bold text-slate-200 text-xs sm:text-sm truncate block" title={studyData.sonographer || '—'}>
              {studyData.sonographer || <span className="text-slate-500 italic font-normal">—</span>}
            </span>
          </div>
        </div>

      </div>

      {/* 3. Primary 4 Navigation Tabs Underneath */}
      <nav
        id="header-main-navigation"
        className="bg-[#0b1329] border-t border-slate-800/80 px-4 sm:px-6 flex items-center gap-1 overflow-x-auto shrink-0 scrollbar-none"
      >
        <button
          type="button"
          id="nav-tab-scan"
          onClick={() => onNavigateTab('scan')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-black uppercase tracking-wider border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'scan'
              ? 'border-cyan-400 text-cyan-400 bg-cyan-950/20 shadow-sm'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>1. SCAN</span>
        </button>

        <button
          type="button"
          id="nav-tab-previous"
          onClick={() => onNavigateTab('previous')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-black uppercase tracking-wider border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'previous'
              ? 'border-cyan-400 text-cyan-400 bg-cyan-950/20 shadow-sm'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>2. PREVIOUS EXAMINATION</span>
          {studyData.priorExam?.hasPriorExam && (
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          )}
        </button>

        <button
          type="button"
          id="nav-tab-report"
          onClick={() => onNavigateTab('report')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-black uppercase tracking-wider border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'report'
              ? 'border-cyan-400 text-cyan-400 bg-cyan-950/20 shadow-sm'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>3. STRUCTURED REPORT</span>
        </button>

        <button
          type="button"
          id="nav-tab-protocol"
          onClick={() => onNavigateTab('protocol')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-black uppercase tracking-wider border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'protocol'
              ? 'border-cyan-400 text-cyan-400 bg-cyan-950/20 shadow-sm'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>4. PROTOCOL</span>
        </button>
      </nav>

      {/* 4. Demonstration Cases Modal */}
      {isDemoModalOpen && (
        <div
          id="modal-demo-cases"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget && !pendingDemoCase) setIsDemoModalOpen(false);
          }}
        >
          <div className="bg-[#0f172a] border border-slate-700 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="px-5 py-4 bg-[#131d35] border-b border-slate-700 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-100 uppercase tracking-tight">
                    LOAD DEMONSTRATION CASE
                  </h3>
                  <p className="text-[11px] text-amber-400 font-semibold mt-0.5 flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3" />
                    <span>Demonstration data only — not for clinical use</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                id="btn-close-demo-modal"
                onClick={() => {
                  setPendingDemoCase(null);
                  setIsDemoModalOpen(false);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body: Replacement Safety Confirmation or Case Selection List */}
            {pendingDemoCase ? (
              /* Safety Confirmation Dialog */
              <div className="p-6 space-y-5 bg-[#0b101f]">
                <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-600/60 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-1 text-xs">
                    <h4 className="font-extrabold text-amber-300 uppercase tracking-wider text-sm">
                      Replace Active Worksheet Data?
                    </h4>
                    <p className="text-slate-200 leading-relaxed">
                      Loading a demonstration case will replace the current worksheet data.
                    </p>
                    <p className="text-slate-400 text-[11px]">
                      Selected Case: <strong className="text-white">{pendingDemoCase.title}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    id="btn-cancel-load-demo"
                    onClick={() => setPendingDemoCase(null)}
                    className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-bold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    id="btn-confirm-load-demo"
                    onClick={handleConfirmLoadDemo}
                    className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Load Demo Case</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Case Selection List */
              <div className="p-5 space-y-3 overflow-y-auto flex-1 text-xs">
                <p className="text-slate-400 text-xs mb-2">
                  Select an example case to populate sample vascular findings, hemodynamic measurements, and protocol triggers for testing and demonstration:
                </p>

                <div className="space-y-2.5">
                  {DEMO_CASES.map((c) => (
                    <div
                      key={c.id}
                      id={`demo-case-card-${c.id}`}
                      onClick={() => handleSelectCase(c)}
                      className="p-3.5 rounded-xl border border-slate-800 bg-[#0d162f] hover:bg-[#132044] hover:border-cyan-600/50 transition-all cursor-pointer group shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-extrabold text-slate-100 text-sm group-hover:text-cyan-300 transition-colors">
                            {c.title}
                          </h4>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-800 text-cyan-400 border border-slate-700">
                            {c.badge}
                          </span>
                        </div>
                        <p className="text-slate-300 text-xs leading-relaxed">
                          {c.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400 pt-0.5">
                          {c.clinicalHighlights.map((hl, idx) => (
                            <span key={idx} className="flex items-center gap-1">
                              <span className="text-cyan-400 font-bold">•</span>
                              <span>{hl}</span>
                            </span>
                          ))}
                        </div>
                      </div>

                      <button
                        type="button"
                        id={`btn-select-case-${c.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectCase(c);
                        }}
                        className="px-3.5 py-2 rounded-lg bg-cyan-950/70 hover:bg-cyan-600 hover:text-slate-950 text-cyan-300 border border-cyan-800/80 font-extrabold text-xs flex items-center gap-1.5 transition-all self-start sm:self-center shrink-0 cursor-pointer shadow-sm"
                      >
                        <span>Load Case</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Footer */}
            <div className="px-5 py-3 bg-[#0c1326] border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
              <span>All demo data runs through the native hemodynamic & protocol engines.</span>
              <button
                type="button"
                id="btn-close-demo-modal-footer"
                onClick={() => {
                  setPendingDemoCase(null);
                  setIsDemoModalOpen(false);
                }}
                className="text-slate-400 hover:text-slate-200 font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 5. Compact Edit Details Modal */}
      {isEditModalOpen && (
        <div
          id="modal-edit-patient-details"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsEditModalOpen(false);
          }}
        >
          <div className="bg-[#0f172a] border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-[#131d35] border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-extrabold text-slate-100 uppercase tracking-tight">
                  Edit Patient & Study Details
                </h3>
              </div>
              <button
                type="button"
                id="btn-close-edit-details-modal"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveDetails} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                
                {/* 1. Patient Name */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Patient Name
                  </label>
                  <input
                    type="text"
                    id="input-edit-patient-name"
                    value={formData.patientName}
                    onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                    placeholder="e.g. John Smith"
                    className="w-full bg-[#090e1a] border border-slate-700 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-medium"
                    autoFocus
                  />
                </div>

                {/* 2. Date of Birth */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Date of Birth (DOB)
                  </label>
                  <input
                    type="date"
                    id="input-edit-patient-dob"
                    value={formData.patientDob}
                    onChange={(e) => setFormData({ ...formData, patientDob: e.target.value })}
                    className="w-full bg-[#090e1a] border border-slate-700 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-medium cursor-pointer"
                  />
                </div>

                {/* 3. UR / MRN */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    UR / MRN
                  </label>
                  <input
                    type="text"
                    id="input-edit-patient-ur"
                    value={formData.patientId}
                    onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                    placeholder="e.g. 12345678"
                    className="w-full bg-[#090e1a] border border-slate-700 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-mono font-medium"
                  />
                </div>

                {/* 4. Study Date */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Study Date
                  </label>
                  <input
                    type="date"
                    id="input-edit-study-date"
                    value={formData.examDate}
                    onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
                    className="w-full bg-[#090e1a] border border-slate-700 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-medium cursor-pointer"
                  />
                </div>

                {/* 5. Sonographer */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Sonographer
                  </label>
                  <input
                    type="text"
                    id="input-edit-sonographer"
                    value={formData.sonographer}
                    onChange={(e) => setFormData({ ...formData, sonographer: e.target.value })}
                    placeholder="e.g. Jane Smith"
                    className="w-full bg-[#090e1a] border border-slate-700 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-medium"
                  />
                </div>

                {/* 6. Location */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    id="input-edit-location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Main Imaging Site"
                    className="w-full bg-[#090e1a] border border-slate-700 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-medium"
                  />
                </div>

                {/* 7. Company / Organisation */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Company / Organisation
                  </label>
                  <input
                    type="text"
                    id="input-edit-company"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="e.g. Example Health Service"
                    className="w-full bg-[#090e1a] border border-slate-700 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-medium"
                  />
                </div>

              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-700 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  id="btn-cancel-edit-details"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition-all font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="btn-save-edit-details"
                  className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-extrabold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Details</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </header>
  );
};
