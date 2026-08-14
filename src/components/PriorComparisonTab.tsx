import React, { useState, useEffect } from 'react';
import { StudyData, PriorExamData, FlowDirection, MainTab } from '../types';
import { generateSideSummary } from '../utils/calculations';
import { Calendar, History, ArrowRight, ArrowUpRight, ArrowDownRight, Minus, Check, Copy, Sparkles, ShieldAlert, Layers, Activity, AlertTriangle, FileText, Building2, User, Stethoscope, RefreshCw } from 'lucide-react';

interface PriorComparisonTabProps {
  studyData: StudyData;
  onUpdateStudy: (updates: Partial<StudyData>) => void;
  onNavigateTab?: (tab: MainTab) => void;
}

const STENOSIS_OPTIONS = [
  'Normal (0% Stenosis)',
  'Mild Stenosis (<50%)',
  'Moderate Stenosis (50-69%)',
  'Severe Stenosis (70-79%)',
  'Critical Stenosis (80-99%)',
  'Near Occlusion (String Flow)',
  'Total Occlusion (100%)',
  'Not Specified',
];

export const PriorComparisonTab: React.FC<PriorComparisonTabProps> = ({
  studyData,
  onUpdateStudy,
  onNavigateTab,
}) => {
  const rightCurrent = generateSideSummary('right', studyData);
  const leftCurrent = generateSideSummary('left', studyData);

  // Initialize from studyData.priorExam or sensible defaults
  const priorExam: PriorExamData = studyData.priorExam || {
    hasPriorExam: true,
    examDate: '2024-03-15',
    facility: 'St. Jude Vascular Ultrasound Lab',
    sonographer: '',
    interpretingPhysician: '',
    hasPriorReport: true,
    rightIcaPsv: 85,
    rightIcaEdv: 24,
    rightIcaRatio: 1.2,
    rightIcaClassification: 'Mild Stenosis (<50%)',
    rightCcaPsv: 70,
    rightPlaqueLocation: 'Bulb / proximal ICA',
    rightPlaqueThicknessMm: 1.8,
    rightPlaqueMorphology: 'Heterogeneous mixed plaque',
    rightPlaqueSurface: 'smooth',
    rightVertFlow: 'antegrade',
    rightSubclavian: 'Normal triphasic',
    rightIntervention: 'None',
    leftIcaPsv: 185,
    leftIcaEdv: 55,
    leftIcaRatio: 2.8,
    leftIcaClassification: 'Moderate Stenosis (50-69%)',
    leftCcaPsv: 66,
    leftPlaqueLocation: 'Proximal ICA',
    leftPlaqueThicknessMm: 2.4,
    leftPlaqueMorphology: 'Calcified mixed plaque',
    leftPlaqueSurface: 'irregular',
    leftVertFlow: 'antegrade',
    leftSubclavian: 'Normal triphasic',
    leftIntervention: 'None',
    priorReportText: 'Mild right ICA stenosis (<50%). Moderate left ICA stenosis (50-69%) with mixed calcified plaque. Bilateral antegrade vertebral artery waveforms.',
    comparisonNotes: 'Prior baseline study for asymptomatic carotid bruit.',
  };

  const updatePrior = (fields: Partial<PriorExamData>) => {
    const updated: PriorExamData = {
      ...priorExam,
      ...fields,
      hasPriorExam: true,
    };
    onUpdateStudy({ priorExam: updated });
  };

  const [copiedComparison, setCopiedComparison] = useState(false);
  const [appliedNotification, setAppliedNotification] = useState(false);

  // Velocity Deltas
  const curRightPsv = rightCurrent.highestIcaPsv;
  const priorRightPsv = priorExam.rightIcaPsv;
  const rightPsvDelta = (curRightPsv !== null && priorRightPsv !== null) ? curRightPsv - priorRightPsv : null;

  const curLeftPsv = leftCurrent.highestIcaPsv;
  const priorLeftPsv = priorExam.leftIcaPsv;
  const leftPsvDelta = (curLeftPsv !== null && priorLeftPsv !== null) ? curLeftPsv - priorLeftPsv : null;

  // Synthesize comparison summary text
  const generateComparisonText = (): string => {
    let lines: string[] = [];
    lines.push(`COMPARISON WITH PRIOR STUDY (${priorExam.examDate || 'Previous Date'}${priorExam.facility ? ` at ${priorExam.facility}` : ''}):`);
    
    // Right Side interval change
    const rCurrentGrade = rightCurrent.confirmedClassification || rightCurrent.suggestedClassification;
    let rInterval = 'Stable';
    if (priorExam.rightIcaClassification && priorExam.rightIcaClassification !== 'Not Specified' && rCurrentGrade !== priorExam.rightIcaClassification) {
      rInterval = `Interval change: previously ${priorExam.rightIcaClassification}, currently ${rCurrentGrade}`;
    } else {
      rInterval = `Stable (${rCurrentGrade})`;
    }
    const rVelChange = rightPsvDelta !== null ? ` (PSV Δ: ${rightPsvDelta > 0 ? '+' : ''}${rightPsvDelta} cm/s)` : '';
    lines.push(`• Right Carotid: ${rInterval}${rVelChange}. Prior PSV ${priorExam.rightIcaPsv ?? 'N/A'} cm/s vs Current ${curRightPsv ?? 'N/A'} cm/s.`);

    // Left Side interval change
    const lCurrentGrade = leftCurrent.confirmedClassification || leftCurrent.suggestedClassification;
    let lInterval = 'Stable';
    if (priorExam.leftIcaClassification && priorExam.leftIcaClassification !== 'Not Specified' && lCurrentGrade !== priorExam.leftIcaClassification) {
      lInterval = `Interval change: previously ${priorExam.leftIcaClassification}, currently ${lCurrentGrade}`;
    } else {
      lInterval = `Stable (${lCurrentGrade})`;
    }
    const lVelChange = leftPsvDelta !== null ? ` (PSV Δ: ${leftPsvDelta > 0 ? '+' : ''}${leftPsvDelta} cm/s)` : '';
    lines.push(`• Left Carotid: ${lInterval}${lVelChange}. Prior PSV ${priorExam.leftIcaPsv ?? 'N/A'} cm/s vs Current ${curLeftPsv ?? 'N/A'} cm/s.`);

    // Vertebral flow
    if (priorExam.rightVertFlow !== rightCurrent.vertebralFlowDirection || priorExam.leftVertFlow !== leftCurrent.vertebralFlowDirection) {
      lines.push(`• Vertebral Flow: Dynamic interval change noted (Right: ${rightCurrent.vertebralFlowDirection}, Left: ${leftCurrent.vertebralFlowDirection}).`);
    } else {
      lines.push(`• Vertebral Flow: Stable bilateral antegrade flow maintained.`);
    }

    if (priorExam.rightIntervention && priorExam.rightIntervention !== 'None') {
      lines.push(`• Right Intervention History: ${priorExam.rightIntervention}.`);
    }
    if (priorExam.leftIntervention && priorExam.leftIntervention !== 'None') {
      lines.push(`• Left Intervention History: ${priorExam.leftIntervention}.`);
    }

    return lines.join('\n');
  };

  const handleCopyComparison = () => {
    navigator.clipboard.writeText(generateComparisonText()).then(() => {
      setCopiedComparison(true);
      setTimeout(() => setCopiedComparison(false), 2000);
    });
  };

  const handleApplyToComments = () => {
    const comparisonBlock = generateComparisonText();
    const existing = studyData.studyComments || '';
    const updated = existing ? `${existing}\n\n${comparisonBlock}` : comparisonBlock;
    onUpdateStudy({ studyComments: updated });
    setAppliedNotification(true);
    setTimeout(() => setAppliedNotification(false), 3000);
  };

  const loadComparisonPreset = (type: 'stable' | 'progression' | 'post-cea' | 'clear') => {
    if (type === 'stable') {
      updatePrior({
        hasPriorExam: true,
        examDate: '2023-11-10',
        facility: 'Metropolitan Vascular Centre',
        rightIcaPsv: 72,
        rightIcaEdv: 20,
        rightIcaRatio: 1.0,
        rightIcaClassification: 'Normal (0% Stenosis)',
        rightCcaPsv: 72,
        rightPlaqueLocation: 'None',
        rightPlaqueThicknessMm: null,
        rightPlaqueMorphology: 'No plaque',
        rightPlaqueSurface: 'smooth',
        rightVertFlow: 'antegrade',
        rightIntervention: 'None',
        leftIcaPsv: 68,
        leftIcaEdv: 22,
        leftIcaRatio: 1.0,
        leftIcaClassification: 'Normal (0% Stenosis)',
        leftCcaPsv: 68,
        leftPlaqueLocation: 'None',
        leftPlaqueThicknessMm: null,
        leftPlaqueMorphology: 'No plaque',
        leftPlaqueSurface: 'smooth',
        leftVertFlow: 'antegrade',
        leftIntervention: 'None',
        priorReportText: 'Normal bilateral carotid duplex examination. No haemodynamically significant stenosis or discrete plaque identified.',
        comparisonNotes: 'Annual surveillance - stable appearance.',
      });
    } else if (type === 'progression') {
      updatePrior({
        hasPriorExam: true,
        examDate: '2023-04-12',
        facility: 'St. Jude Vascular Ultrasound Lab',
        rightIcaPsv: 90,
        rightIcaEdv: 26,
        rightIcaRatio: 1.3,
        rightIcaClassification: 'Mild Stenosis (<50%)',
        rightCcaPsv: 70,
        rightPlaqueLocation: 'Carotid bulb',
        rightPlaqueThicknessMm: 1.6,
        rightPlaqueMorphology: 'Smooth fibrous plaque',
        rightPlaqueSurface: 'smooth',
        rightVertFlow: 'antegrade',
        rightIntervention: 'None',
        leftIcaPsv: 135,
        leftIcaEdv: 42,
        leftIcaRatio: 2.1,
        leftIcaClassification: 'Moderate Stenosis (50-69%)',
        leftCcaPsv: 65,
        leftPlaqueLocation: 'Proximal ICA',
        leftPlaqueThicknessMm: 2.2,
        leftPlaqueMorphology: 'Heterogeneous calcified plaque',
        leftPlaqueSurface: 'smooth',
        leftVertFlow: 'antegrade',
        leftIntervention: 'None',
        priorReportText: 'Mild right ICA stenosis (<50%). Moderate left ICA stenosis (50-69%) with focal velocity elevation.',
        comparisonNotes: 'Demonstrated progressive increase in velocities and plaque burden on follow-up.',
      });
    } else if (type === 'post-cea') {
      updatePrior({
        hasPriorExam: true,
        examDate: '2024-01-20',
        facility: 'Regional Vascular Surgery Centre',
        rightIcaPsv: 290,
        rightIcaEdv: 95,
        rightIcaRatio: 4.8,
        rightIcaClassification: 'Severe Stenosis (70-79%)',
        rightCcaPsv: 60,
        rightPlaqueLocation: 'Severe bulb and proximal ICA plaque',
        rightPlaqueThicknessMm: 3.5,
        rightPlaqueMorphology: 'Ulcerated calcified plaque',
        rightPlaqueSurface: 'ulcerated',
        rightVertFlow: 'antegrade',
        rightIntervention: 'Right Carotid Endarterectomy (CEA) performed post-study',
        leftIcaPsv: 80,
        leftIcaEdv: 24,
        leftIcaRatio: 1.1,
        leftIcaClassification: 'Normal (0% Stenosis)',
        leftCcaPsv: 72,
        leftPlaqueLocation: 'Minor intimal thickening',
        leftPlaqueThicknessMm: null,
        leftPlaqueMorphology: 'Minimal',
        leftPlaqueSurface: 'smooth',
        leftVertFlow: 'antegrade',
        leftIntervention: 'None',
        priorReportText: 'Severe right internal carotid artery stenosis (70-79%) with irregular ulcerated plaque. Patient subsequently underwent uncomplicated right CEA.',
        comparisonNotes: 'Post-operative baseline assessment of endarterectomy site.',
      });
    } else if (type === 'clear') {
      updatePrior({
        hasPriorExam: false,
        examDate: '',
        facility: '',
        sonographer: '',
        interpretingPhysician: '',
        rightIcaPsv: null,
        rightIcaEdv: null,
        rightIcaRatio: null,
        rightIcaClassification: 'Not Specified',
        rightCcaPsv: null,
        rightPlaqueLocation: '',
        rightPlaqueThicknessMm: null,
        rightPlaqueMorphology: '',
        rightPlaqueSurface: 'smooth',
        rightVertFlow: 'antegrade',
        rightIntervention: 'None',
        leftIcaPsv: null,
        leftIcaEdv: null,
        leftIcaRatio: null,
        leftIcaClassification: 'Not Specified',
        leftCcaPsv: null,
        leftPlaqueLocation: '',
        leftPlaqueThicknessMm: null,
        leftPlaqueMorphology: '',
        leftPlaqueSurface: 'smooth',
        leftVertFlow: 'antegrade',
        leftIntervention: 'None',
        priorReportText: '',
        comparisonNotes: '',
      });
    }
  };

  return (
    <div id="prior-examination-tab-container" className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* 1. Header Card & Presets */}
      <div className="bg-[#0b1329] border border-slate-800 rounded-xl p-5 sm:p-6 shadow-lg flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
              PREVIOUS CAROTID EXAMINATION & LONGITUDINAL COMPARISON
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Enter previous ultrasound findings to calculate hemodynamic velocity deltas and generate automated interval comparison statements.
            </p>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Presets:
          </span>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              id="btn-preset-stable"
              onClick={() => loadComparisonPreset('stable')}
              className="px-2.5 py-1.5 rounded-lg border border-slate-800 bg-[#1e293b] hover:bg-[#2c3e50] text-slate-200 hover:text-white text-xs font-semibold transition-all cursor-pointer"
            >
              Annual Stable (0%)
            </button>
            <button
              type="button"
              id="btn-preset-progression"
              onClick={() => loadComparisonPreset('progression')}
              className="px-2.5 py-1.5 rounded-lg border border-slate-800 bg-[#1e293b] hover:bg-[#2c3e50] text-slate-200 hover:text-white text-xs font-semibold transition-all cursor-pointer"
            >
              Progression (50-69%)
            </button>
            <button
              type="button"
              id="btn-preset-postcea"
              onClick={() => loadComparisonPreset('post-cea')}
              className="px-2.5 py-1.5 rounded-lg border border-slate-800 bg-[#1e293b] hover:bg-[#2c3e50] text-slate-200 hover:text-white text-xs font-semibold transition-all cursor-pointer"
            >
              Post-CEA Follow-up
            </button>
            <button
              type="button"
              id="btn-preset-clear"
              onClick={() => loadComparisonPreset('clear')}
              className="px-2.5 py-1.5 rounded-lg border border-slate-800 bg-[#141b2d] hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 text-xs font-semibold transition-all cursor-pointer"
            >
              Clear Prior
            </button>
          </div>
        </div>
      </div>

      {/* 2. Prior Study Metadata & Facility Form */}
      <div className="bg-[#0b1329] border border-slate-800 rounded-xl p-5 sm:p-6 shadow-lg space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-black text-slate-100 uppercase tracking-wider">
              Previous Study Information & Facility Metadata
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase">Prior Study Status:</label>
            <select
              value={priorExam.hasPriorExam ? 'yes' : 'no'}
              onChange={(e) => updatePrior({ hasPriorExam: e.target.value === 'yes' })}
              className="px-2.5 py-1 rounded bg-[#0f172a] border border-slate-700 text-xs font-bold text-slate-200"
            >
              <option value="yes">Prior Study Available</option>
              <option value="no">No Prior Study (Baseline)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Previous Exam Date</label>
            <input
              type="date"
              id="input-prior-date"
              value={priorExam.examDate}
              onChange={(e) => updatePrior({ examDate: e.target.value })}
              className="w-full px-3 py-1.5 rounded-lg bg-[#0f172a] border border-slate-700 text-xs font-mono text-slate-100 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Previous Facility / Laboratory</label>
            <input
              type="text"
              id="input-prior-facility"
              placeholder="e.g. St. Jude Vascular Lab"
              value={priorExam.facility}
              onChange={(e) => updatePrior({ facility: e.target.value })}
              className="w-full px-3 py-1.5 rounded-lg bg-[#0f172a] border border-slate-700 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Prior Reporting Sonographer</label>
            <input
              type="text"
              id="input-prior-sonographer"
              placeholder="e.g. Prior Sonographer"
              value={priorExam.sonographer || ''}
              onChange={(e) => updatePrior({ sonographer: e.target.value })}
              className="w-full px-3 py-1.5 rounded-lg bg-[#0f172a] border border-slate-700 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Prior Interpreting Physician</label>
            <input
              type="text"
              id="input-prior-physician"
              placeholder="e.g. Dr. Previous, MD"
              value={priorExam.interpretingPhysician || ''}
              onChange={(e) => updatePrior({ interpretingPhysician: e.target.value })}
              className="w-full px-3 py-1.5 rounded-lg bg-[#0f172a] border border-slate-700 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 3. Bilateral Prior Study Hemodynamic Entry Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Right Prior Side */}
        <div className="bg-[#0b1329] border border-slate-800 rounded-xl p-5 space-y-4 shadow-md">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-black text-cyan-400 uppercase tracking-wider">
              Right Carotid System (Prior Study)
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 font-mono">
              RIGHT ICA
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Peak ICA PSV (cm/s)</label>
              <input
                type="number"
                id="input-prior-right-psv"
                value={priorExam.rightIcaPsv ?? ''}
                onChange={(e) => updatePrior({ rightIcaPsv: e.target.value ? parseFloat(e.target.value) : null })}
                placeholder="e.g. 85"
                className="w-full px-3 py-1.5 rounded-lg bg-[#0f172a] border border-slate-700 text-xs font-mono font-bold text-slate-100 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">ICA EDV (cm/s)</label>
              <input
                type="number"
                id="input-prior-right-edv"
                value={priorExam.rightIcaEdv ?? ''}
                onChange={(e) => updatePrior({ rightIcaEdv: e.target.value ? parseFloat(e.target.value) : null })}
                placeholder="e.g. 24"
                className="w-full px-3 py-1.5 rounded-lg bg-[#0f172a] border border-slate-700 text-xs font-mono font-bold text-slate-100 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Distal CCA PSV</label>
              <input
                type="number"
                id="input-prior-right-cca"
                value={priorExam.rightCcaPsv ?? ''}
                onChange={(e) => updatePrior({ rightCcaPsv: e.target.value ? parseFloat(e.target.value) : null })}
                placeholder="e.g. 70"
                className="w-full px-3 py-1.5 rounded-lg bg-[#0f172a] border border-slate-700 text-xs font-mono font-bold text-slate-100 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Prior Stenosis Category</label>
            <select
              id="select-prior-right-grade"
              value={priorExam.rightIcaClassification}
              onChange={(e) => updatePrior({ rightIcaClassification: e.target.value })}
              className="w-full px-3 py-1.5 rounded-lg bg-[#0f172a] border border-slate-700 text-xs font-bold text-slate-200 focus:border-cyan-500 focus:outline-none"
            >
              {STENOSIS_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Plaque Location & Morphology</label>
              <input
                type="text"
                value={priorExam.rightPlaqueLocation}
                onChange={(e) => updatePrior({ rightPlaqueLocation: e.target.value })}
                placeholder="e.g. Soft plaque bulb"
                className="w-full px-3 py-1.5 rounded-lg bg-[#0f172a] border border-slate-700 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Max Thickness (mm)</label>
              <input
                type="number"
                step="0.1"
                value={priorExam.rightPlaqueThicknessMm ?? ''}
                onChange={(e) => updatePrior({ rightPlaqueThicknessMm: e.target.value ? parseFloat(e.target.value) : null })}
                placeholder="e.g. 1.8"
                className="w-full px-3 py-1.5 rounded-lg bg-[#0f172a] border border-slate-700 text-xs font-mono text-slate-100 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Right Vertebral Flow</label>
              <select
                value={priorExam.rightVertFlow}
                onChange={(e) => updatePrior({ rightVertFlow: e.target.value as FlowDirection })}
                className="w-full px-3 py-1.5 rounded-lg bg-[#0f172a] border border-slate-700 text-xs font-bold text-slate-200"
              >
                <option value="antegrade">Antegrade</option>
                <option value="retrograde">Retrograde (Complete Steal)</option>
                <option value="bidirectional">Bidirectional (To-and-fro)</option>
                <option value="absent">Absent / Occluded</option>
                <option value="not_assessed">Not Assessed</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Prior Right Interventions</label>
              <input
                type="text"
                value={priorExam.rightIntervention}
                onChange={(e) => updatePrior({ rightIntervention: e.target.value })}
                placeholder="e.g. None or Prior CEA (2020)"
                className="w-full px-3 py-1.5 rounded-lg bg-[#0f172a] border border-slate-700 text-xs text-slate-100"
              />
            </div>
          </div>
        </div>

        {/* Left Prior Side */}
        <div className="bg-[#0b1329] border border-slate-800 rounded-xl p-5 space-y-4 shadow-md">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-black text-cyan-400 uppercase tracking-wider">
              Left Carotid System (Prior Study)
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 font-mono">
              LEFT ICA
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Peak ICA PSV (cm/s)</label>
              <input
                type="number"
                id="input-prior-left-psv"
                value={priorExam.leftIcaPsv ?? ''}
                onChange={(e) => updatePrior({ leftIcaPsv: e.target.value ? parseFloat(e.target.value) : null })}
                placeholder="e.g. 185"
                className="w-full px-3 py-1.5 rounded-lg bg-[#0f172a] border border-slate-700 text-xs font-mono font-bold text-slate-100 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">ICA EDV (cm/s)</label>
              <input
                type="number"
                id="input-prior-left-edv"
                value={priorExam.leftIcaEdv ?? ''}
                onChange={(e) => updatePrior({ leftIcaEdv: e.target.value ? parseFloat(e.target.value) : null })}
                placeholder="e.g. 55"
                className="w-full px-3 py-1.5 rounded-lg bg-[#0f172a] border border-slate-700 text-xs font-mono font-bold text-slate-100 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Distal CCA PSV</label>
              <input
                type="number"
                id="input-prior-left-cca"
                value={priorExam.leftCcaPsv ?? ''}
                onChange={(e) => updatePrior({ leftCcaPsv: e.target.value ? parseFloat(e.target.value) : null })}
                placeholder="e.g. 66"
                className="w-full px-3 py-1.5 rounded-lg bg-[#0f172a] border border-slate-700 text-xs font-mono font-bold text-slate-100 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Prior Stenosis Category</label>
            <select
              id="select-prior-left-grade"
              value={priorExam.leftIcaClassification}
              onChange={(e) => updatePrior({ leftIcaClassification: e.target.value })}
              className="w-full px-3 py-1.5 rounded-lg bg-[#0f172a] border border-slate-700 text-xs font-bold text-slate-200 focus:border-cyan-500 focus:outline-none"
            >
              {STENOSIS_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Plaque Location & Morphology</label>
              <input
                type="text"
                value={priorExam.leftPlaqueLocation}
                onChange={(e) => updatePrior({ leftPlaqueLocation: e.target.value })}
                placeholder="e.g. Calcified plaque prox ICA"
                className="w-full px-3 py-1.5 rounded-lg bg-[#0f172a] border border-slate-700 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Max Thickness (mm)</label>
              <input
                type="number"
                step="0.1"
                value={priorExam.leftPlaqueThicknessMm ?? ''}
                onChange={(e) => updatePrior({ leftPlaqueThicknessMm: e.target.value ? parseFloat(e.target.value) : null })}
                placeholder="e.g. 2.4"
                className="w-full px-3 py-1.5 rounded-lg bg-[#0f172a] border border-slate-700 text-xs font-mono text-slate-100 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Left Vertebral Flow</label>
              <select
                value={priorExam.leftVertFlow}
                onChange={(e) => updatePrior({ leftVertFlow: e.target.value as FlowDirection })}
                className="w-full px-3 py-1.5 rounded-lg bg-[#0f172a] border border-slate-700 text-xs font-bold text-slate-200"
              >
                <option value="antegrade">Antegrade</option>
                <option value="retrograde">Retrograde (Complete Steal)</option>
                <option value="bidirectional">Bidirectional (To-and-fro)</option>
                <option value="absent">Absent / Occluded</option>
                <option value="not_assessed">Not Assessed</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Prior Left Interventions</label>
              <input
                type="text"
                value={priorExam.leftIntervention}
                onChange={(e) => updatePrior({ leftIntervention: e.target.value })}
                placeholder="e.g. None or Prior CAS"
                className="w-full px-3 py-1.5 rounded-lg bg-[#0f172a] border border-slate-700 text-xs text-slate-100"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Side-by-Side Current vs Previous Comparison Matrix */}
      <div className="bg-[#0b1329] border border-slate-800 rounded-xl p-5 sm:p-6 shadow-lg space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-black text-slate-100 uppercase tracking-wider">
              Hemodynamic Interval Comparison Matrix & Velocity Deltas
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            Δ = Current ({studyData.examDate || 'Today'}) − Prior ({priorExam.examDate || 'Past'})
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#080d19] text-slate-400 border-b border-slate-800 text-[10px] uppercase font-bold">
                <th className="p-3">Vascular Bed / Parameter</th>
                <th className="p-3">Prior Value ({priorExam.examDate || 'Prior'})</th>
                <th className="p-3">Current Active Value</th>
                <th className="p-3">Interval Delta / Change</th>
                <th className="p-3">Clinical Assessment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 text-slate-200">
              {/* Right ICA PSV */}
              <tr>
                <td className="p-3 font-semibold text-cyan-300">Right ICA Peak PSV</td>
                <td className="p-3 font-mono">{priorExam.rightIcaPsv !== null ? `${priorExam.rightIcaPsv} cm/s` : 'N/A'}</td>
                <td className="p-3 font-mono font-bold">{curRightPsv !== null ? `${curRightPsv} cm/s` : 'Not recorded'}</td>
                <td className="p-3 font-mono font-extrabold">
                  {rightPsvDelta !== null ? (
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] ${
                      Math.abs(rightPsvDelta) <= 15
                        ? 'bg-slate-800 text-slate-300'
                        : rightPsvDelta > 0
                        ? 'bg-rose-950/80 border border-rose-700 text-rose-300'
                        : 'bg-emerald-950/80 border border-emerald-700 text-emerald-300'
                    }`}>
                      {rightPsvDelta > 0 ? <ArrowUpRight className="w-3 h-3" /> : rightPsvDelta < 0 ? <ArrowDownRight className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                      {rightPsvDelta > 0 ? `+${rightPsvDelta}` : rightPsvDelta} cm/s
                    </span>
                  ) : '—'}
                </td>
                <td className="p-3 text-[11px]">
                  {rightPsvDelta === null ? 'Insufficient data' : Math.abs(rightPsvDelta) <= 15 ? 'Stable hemodynamics' : rightPsvDelta > 0 ? 'Interval velocity increase' : 'Interval velocity reduction'}
                </td>
              </tr>

              {/* Right Stenosis Grade */}
              <tr>
                <td className="p-3 font-semibold text-cyan-300">Right Stenosis Stratification</td>
                <td className="p-3 text-slate-400">{priorExam.rightIcaClassification}</td>
                <td className="p-3 font-bold text-slate-100">{rightCurrent.confirmedClassification || rightCurrent.suggestedClassification}</td>
                <td className="p-3 font-medium" colSpan={2}>
                  {priorExam.rightIcaClassification === (rightCurrent.confirmedClassification || rightCurrent.suggestedClassification) ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" /> Stable grade category
                    </span>
                  ) : (
                    <span className="text-amber-400 font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Category changed: {priorExam.rightIcaClassification} → {rightCurrent.confirmedClassification || rightCurrent.suggestedClassification}
                    </span>
                  )}
                </td>
              </tr>

              {/* Left ICA PSV */}
              <tr>
                <td className="p-3 font-semibold text-cyan-300">Left ICA Peak PSV</td>
                <td className="p-3 font-mono">{priorExam.leftIcaPsv !== null ? `${priorExam.leftIcaPsv} cm/s` : 'N/A'}</td>
                <td className="p-3 font-mono font-bold">{curLeftPsv !== null ? `${curLeftPsv} cm/s` : 'Not recorded'}</td>
                <td className="p-3 font-mono font-extrabold">
                  {leftPsvDelta !== null ? (
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] ${
                      Math.abs(leftPsvDelta) <= 15
                        ? 'bg-slate-800 text-slate-300'
                        : leftPsvDelta > 0
                        ? 'bg-rose-950/80 border border-rose-700 text-rose-300'
                        : 'bg-emerald-950/80 border border-emerald-700 text-emerald-300'
                    }`}>
                      {leftPsvDelta > 0 ? <ArrowUpRight className="w-3 h-3" /> : leftPsvDelta < 0 ? <ArrowDownRight className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                      {leftPsvDelta > 0 ? `+${leftPsvDelta}` : leftPsvDelta} cm/s
                    </span>
                  ) : '—'}
                </td>
                <td className="p-3 text-[11px]">
                  {leftPsvDelta === null ? 'Insufficient data' : Math.abs(leftPsvDelta) <= 15 ? 'Stable hemodynamics' : leftPsvDelta > 0 ? 'Interval velocity increase' : 'Interval velocity reduction'}
                </td>
              </tr>

              {/* Left Stenosis Grade */}
              <tr>
                <td className="p-3 font-semibold text-cyan-300">Left Stenosis Stratification</td>
                <td className="p-3 text-slate-400">{priorExam.leftIcaClassification}</td>
                <td className="p-3 font-bold text-slate-100">{leftCurrent.confirmedClassification || leftCurrent.suggestedClassification}</td>
                <td className="p-3 font-medium" colSpan={2}>
                  {priorExam.leftIcaClassification === (leftCurrent.confirmedClassification || leftCurrent.suggestedClassification) ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" /> Stable grade category
                    </span>
                  ) : (
                    <span className="text-amber-400 font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Category changed: {priorExam.leftIcaClassification} → {leftCurrent.confirmedClassification || leftCurrent.suggestedClassification}
                    </span>
                  )}
                </td>
              </tr>

              {/* Vertebral Flow Direction */}
              <tr>
                <td className="p-3 font-semibold text-cyan-300">Vertebral Artery Flow</td>
                <td className="p-3 text-slate-400 capitalize">
                  R: {priorExam.rightVertFlow} / L: {priorExam.leftVertFlow}
                </td>
                <td className="p-3 font-bold capitalize">
                  R: {rightCurrent.vertebralFlowDirection} / L: {leftCurrent.vertebralFlowDirection}
                </td>
                <td className="p-3" colSpan={2}>
                  {priorExam.rightVertFlow === rightCurrent.vertebralFlowDirection && priorExam.leftVertFlow === leftCurrent.vertebralFlowDirection ? (
                    <span className="text-emerald-400 font-bold">Stable antegrade bilateral vertebral waveforms</span>
                  ) : (
                    <span className="text-rose-400 font-extrabold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Dynamic change in vertebral direction detected!
                    </span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Automated Structured Comparison Synthesis & Action Bar */}
      <div className="bg-[#0b1329] border border-cyan-800/80 rounded-xl p-5 sm:p-6 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-black text-slate-100 uppercase tracking-wider">
              Automated Longitudinal Comparison Synthesis
            </h3>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              id="btn-copy-comparison-text"
              onClick={handleCopyComparison}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-[#0f172a] hover:bg-slate-800 text-slate-200 text-xs font-bold transition-all cursor-pointer"
            >
              {copiedComparison ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedComparison ? 'Copied to Clipboard!' : 'Copy Comparison Text'}</span>
            </button>

            <button
              type="button"
              id="btn-apply-comparison-to-comments"
              onClick={handleApplyToComments}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply to Study Comments & Report</span>
            </button>
          </div>
        </div>

        {appliedNotification && (
          <div className="p-3 bg-emerald-950/70 border border-emerald-600 rounded-lg text-xs font-bold text-emerald-300 flex items-center gap-2 animate-in fade-in duration-200">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Successfully appended comparison statements into Study Comments and Structured Report!</span>
          </div>
        )}

        <div className="p-4 bg-[#080d19] border border-slate-800 rounded-lg font-mono text-xs text-slate-300 whitespace-pre-line leading-relaxed">
          {generateComparisonText()}
        </div>

        {/* Prior Full Report Text */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
            Prior Examination Full Report Text / Past Findings Reference:
          </label>
          <textarea
            id="textarea-prior-report-text"
            rows={3}
            placeholder="Paste or type full prior report text for clinical reference..."
            value={priorExam.priorReportText}
            onChange={(e) => updatePrior({ priorReportText: e.target.value })}
            className="w-full px-3 py-2 rounded-lg bg-[#0f172a] border border-slate-700 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
          />
        </div>

        {/* Bottom Navigation Back to Scan */}
        {onNavigateTab && (
          <div className="pt-2 flex justify-between items-center border-t border-slate-800">
            <button
              type="button"
              onClick={() => onNavigateTab('scan')}
              className="flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-all cursor-pointer"
            >
              <span>← Return to Primary Scan Worksheet</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab('report')}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer"
            >
              <span>Proceed to Structured Report →</span>
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
