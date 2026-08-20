import React, { useState } from 'react';
import { StudyData, SideSummary, PriorExamData, MainTab } from '../types';
import { History, ArrowRight, ArrowUpRight, ArrowDownRight, Minus, Check, Copy, Calendar, Building2, Stethoscope, RefreshCw, AlertTriangle, ShieldCheck } from 'lucide-react';

interface ReportPriorComparisonSectionProps {
  studyData: StudyData;
  rightSummary: SideSummary;
  leftSummary: SideSummary;
  onUpdateStudy: (updates: Partial<StudyData>) => void;
  onNavigateTab?: (tab: MainTab) => void;
}

export const ReportPriorComparisonSection: React.FC<ReportPriorComparisonSectionProps> = ({
  studyData,
  rightSummary,
  leftSummary,
  onUpdateStudy,
  onNavigateTab,
}) => {
  const [copied, setCopied] = useState(false);
  const [showPresetMenu, setShowPresetMenu] = useState(false);

  // Defaults if studyData.priorExam is missing or unconfigured
  const priorExam: PriorExamData = studyData.priorExam || {
    hasPriorExam: true,
    examDate: '2024-03-15',
    facility: 'St. Jude Vascular Ultrasound Lab',
    sonographer: 'J. Miller, AMS',
    interpretingPhysician: 'Dr. E. Vance, FRANZCR',
    hasPriorReport: true,
    rightIcaPsv: 85,
    rightIcaEdv: 24,
    rightIcaRatio: 1.2,
    rightIcaClassification: 'Mild Stenosis (<50%)',
    rightCcaPsv: 70,
    rightPlaqueLocation: 'Carotid Bulb',
    rightPlaqueThicknessMm: 1.8,
    rightPlaqueMorphology: 'Heterogeneous mixed plaque',
    rightPlaqueSurface: 'smooth',
    rightVertFlow: 'antegrade',
    rightSubclavian: 'Normal triphasic',
    rightIntervention: 'None',
    leftIcaPsv: 80,
    leftIcaEdv: 22,
    leftIcaRatio: 1.1,
    leftIcaClassification: 'Normal (0% Stenosis)',
    leftCcaPsv: 72,
    leftPlaqueLocation: 'None',
    leftPlaqueThicknessMm: null,
    leftPlaqueMorphology: 'Normal intimal contour',
    leftPlaqueSurface: 'smooth',
    leftVertFlow: 'antegrade',
    leftSubclavian: 'Normal triphasic',
    leftIntervention: 'None',
    priorReportText: 'Mild right ICA stenosis (<50%) with smooth bulb plaque. Normal left carotid arterial system. Bilateral antegrade vertebral flow.',
    comparisonNotes: 'Previous baseline ultrasound performed 2 years ago for cardiovascular risk stratification.',
  };

  const updatePrior = (fields: Partial<PriorExamData>) => {
    const updated: PriorExamData = {
      ...priorExam,
      ...fields,
      hasPriorExam: true,
    };
    onUpdateStudy({ priorExam: updated });
  };

  // Deltas
  const curRightPsv = rightSummary.highestIcaPsv;
  const priorRightPsv = priorExam.rightIcaPsv;
  const rightPsvDelta = curRightPsv !== null && priorRightPsv !== null ? curRightPsv - priorRightPsv : null;

  const curLeftPsv = leftSummary.highestIcaPsv;
  const priorLeftPsv = priorExam.leftIcaPsv;
  const leftPsvDelta = curLeftPsv !== null && priorLeftPsv !== null ? curLeftPsv - priorLeftPsv : null;

  const curRightGrade = rightSummary.confirmedClassification || rightSummary.suggestedClassification;
  const curLeftGrade = leftSummary.confirmedClassification || leftSummary.suggestedClassification;

  // Progression analysis
  const isRightProgressed = rightPsvDelta !== null && rightPsvDelta >= 50;
  const isLeftProgressed = leftPsvDelta !== null && leftPsvDelta >= 50;

  const getDeltaBadge = (delta: number | null) => {
    if (delta === null) return null;
    if (delta >= 50) {
      return (
        <span className="flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-black bg-rose-950/80 text-rose-300 border border-rose-700 print:border-black print:text-black">
          <ArrowUpRight className="w-3 h-3 text-rose-400" />
          +{delta} cm/s (Progression)
        </span>
      );
    }
    if (delta <= -40) {
      return (
        <span className="flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-700 print:border-black print:text-black">
          <ArrowDownRight className="w-3 h-3 text-emerald-400" />
          {delta} cm/s (Regression / Post-op)
        </span>
      );
    }
    return (
      <span className="flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700 print:border-black print:text-black">
        <Minus className="w-3 h-3 text-slate-400" />
        {delta > 0 ? `+${delta}` : delta} cm/s (Stable)
      </span>
    );
  };

  const handleCopyComparisonText = () => {
    const text = `LONGITUDINAL COMPARISON (Prior Exam: ${priorExam.examDate} at ${priorExam.facility}):\n` +
      `• Right ICA: Prior Grade ${priorExam.rightIcaClassification} (PSV ${priorExam.rightIcaPsv} cm/s) vs Current Grade ${curRightGrade} (PSV ${curRightPsv ?? '—'} cm/s) [Δ: ${rightPsvDelta !== null ? (rightPsvDelta > 0 ? `+${rightPsvDelta}` : rightPsvDelta) + ' cm/s' : 'N/A'}].\n` +
      `• Left ICA: Prior Grade ${priorExam.leftIcaClassification} (PSV ${priorExam.leftIcaPsv} cm/s) vs Current Grade ${curLeftGrade} (PSV ${curLeftPsv ?? '—'} cm/s) [Δ: ${leftPsvDelta !== null ? (leftPsvDelta > 0 ? `+${leftPsvDelta}` : leftPsvDelta) + ' cm/s' : 'N/A'}].\n` +
      `• Bilateral Vertebral Flow: Prior ${priorExam.rightVertFlow}/${priorExam.leftVertFlow} vs Current ${rightSummary.vertebralFlowDirection}/${leftSummary.vertebralFlowDirection}.\n` +
      `• Radiologist Comment: ${priorExam.comparisonNotes || 'Interval comparison documented above.'}`;

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const loadScenario = (type: 'progression' | 'stable' | 'post-op') => {
    if (type === 'progression') {
      updatePrior({
        examDate: '2024-01-20',
        facility: 'Regional Vascular Surgery Centre',
        rightIcaPsv: 95,
        rightIcaEdv: 28,
        rightIcaClassification: 'Mild Stenosis (<50%)',
        leftIcaPsv: 80,
        leftIcaEdv: 22,
        leftIcaClassification: 'Normal (0% Stenosis)',
        comparisonNotes: 'Marked interval progression of right internal carotid stenosis over the 30-month interval, with peak velocity increasing from 95 cm/s to current elevated levels. Urgent surgical referral indicated.',
      });
    } else if (type === 'stable') {
      updatePrior({
        examDate: '2025-08-14',
        facility: 'Metropolitan Vascular Imaging',
        rightIcaPsv: curRightPsv || 85,
        rightIcaEdv: rightSummary.correspondingIcaEdv || 24,
        rightIcaClassification: curRightGrade,
        leftIcaPsv: curLeftPsv || 80,
        leftIcaEdv: leftSummary.correspondingIcaEdv || 22,
        leftIcaClassification: curLeftGrade,
        comparisonNotes: 'Stable findings compared to previous examination 12 months ago with no significant velocity acceleration or morphological plaque progression.',
      });
    } else if (type === 'post-op') {
      updatePrior({
        examDate: '2023-11-10',
        facility: 'St. Jude Vascular Surgery Unit',
        rightIcaPsv: 290,
        rightIcaEdv: 95,
        rightIcaClassification: 'Severe Stenosis (70-79%)',
        leftIcaPsv: 85,
        leftIcaEdv: 24,
        leftIcaClassification: 'Normal (0% Stenosis)',
        rightIntervention: 'Right Carotid Endarterectomy (CEA)',
        comparisonNotes: 'Prior pre-operative baseline examination demonstrating severe right ICA stenosis. Current study assesses post-revascularization patency.',
      });
    }
    setShowPresetMenu(false);
  };

  return (
    <div className="p-6 border-b border-slate-800 bg-[#080f20] space-y-4 print:bg-white print:border-b-2 print:border-black">
      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-cyan-400 print:hidden" />
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-100 print:text-black">
              Longitudinal Comparison with Previous Reports
            </h3>
            <span className="text-[10px] text-slate-400 font-mono print:text-black">
              Prior Baseline: <strong className="text-slate-200 print:text-black">{priorExam.examDate}</strong> • {priorExam.facility || 'External Lab'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 print:hidden">
          {/* Quick Scenario Preset Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowPresetMenu(!showPresetMenu)}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-[#0d162e] hover:bg-slate-800 border border-slate-700 text-cyan-300 rounded text-[10px] font-bold transition-all cursor-pointer"
            >
              <RefreshCw className="w-3 h-3 text-cyan-400" />
              <span>Load Comparison Scenario</span>
            </button>

            {showPresetMenu && (
              <div className="absolute right-0 mt-1 w-56 bg-[#0f1a36] border border-slate-700 rounded-xl shadow-2xl p-1.5 z-30 space-y-1 text-xs">
                <button
                  onClick={() => loadScenario('progression')}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-rose-950/60 hover:text-rose-200 text-slate-200 text-[11px] font-medium"
                >
                  📈 Rapid Progression (+Velocities)
                </button>
                <button
                  onClick={() => loadScenario('stable')}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-emerald-950/60 hover:text-emerald-200 text-slate-200 text-[11px] font-medium"
                >
                  ✓ Stable 12-Month Surveillance
                </button>
                <button
                  onClick={() => loadScenario('post-op')}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-cyan-950/60 hover:text-cyan-200 text-slate-200 text-[11px] font-medium"
                >
                  🏥 Post-CEA Revascularization Baseline
                </button>
              </div>
            )}
          </div>

          <button
            onClick={handleCopyComparisonText}
            className="flex items-center gap-1 px-2.5 py-1 bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-600/50 text-cyan-300 rounded text-[10px] font-bold transition-all cursor-pointer"
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied!' : 'Copy Comparison Text'}</span>
          </button>
        </div>
      </div>

      {/* Interval Evolution Summary Banner */}
      {(isRightProgressed || isLeftProgressed) && (
        <div className="p-3 bg-rose-950/40 border border-rose-800 rounded-xl flex items-start gap-2.5 text-xs text-rose-200 print:bg-white print:border print:border-black print:text-black">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5 print:hidden" />
          <div>
            <span className="font-extrabold uppercase tracking-wider block text-rose-300 print:text-black text-[10px]">
              Clinically Significant Interval Disease Progression Detected
            </span>
            <p className="text-[11px] text-rose-200/90 print:text-black mt-0.5 leading-relaxed">
              Hemodynamic peak systolic velocity acceleration of &ge; 50 cm/s observed since prior examination ({priorExam.examDate}). Close vascular specialist follow-up is recommended.
            </p>
          </div>
        </div>
      )}

      {/* Side-by-Side Longitudinal Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Right Carotid Interval Card */}
        <div className="p-4 bg-[#060b17] border border-slate-800 rounded-xl space-y-3 print:bg-white print:border print:border-black">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <span className="text-[10px] font-extrabold uppercase text-slate-300 tracking-wider print:text-black">
              Right Carotid Interval
            </span>
            {getDeltaBadge(rightPsvDelta)}
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 bg-[#0b1329] border border-slate-800 rounded-lg space-y-1 print:bg-gray-50 print:border">
              <span className="text-[9px] font-bold text-slate-500 uppercase block font-sans print:text-black">
                Prior Study ({priorExam.examDate})
              </span>
              <div className="font-bold text-slate-300 print:text-black">
                {priorExam.rightIcaClassification || 'Mild (<50%)'}
              </div>
              <div className="text-[11px] font-mono text-slate-400 print:text-black">
                PSV: <strong className="text-slate-200 print:text-black">{priorExam.rightIcaPsv ?? '—'} cm/s</strong> • EDV: {priorExam.rightIcaEdv ?? '—'} cm/s
              </div>
              <div className="text-[10px] text-slate-400 truncate print:text-black">
                Plaque: {priorExam.rightPlaqueLocation || 'None'}
              </div>
            </div>

            <div className="p-2.5 bg-[#0b1329] border border-slate-800 rounded-lg space-y-1 print:bg-gray-50 print:border">
              <span className="text-[9px] font-bold text-cyan-400 uppercase block font-sans print:text-black">
                Current Study ({studyData.examDate})
              </span>
              <div className="font-bold text-cyan-300 print:text-black">
                {curRightGrade}
              </div>
              <div className="text-[11px] font-mono text-cyan-200 print:text-black">
                PSV: <strong className="text-cyan-100 print:text-black">{curRightPsv ?? '—'} cm/s</strong> • EDV: {rightSummary.correspondingIcaEdv ?? '—'} cm/s
              </div>
              <div className="text-[10px] text-slate-400 truncate print:text-black">
                Plaque: {rightSummary.maxPlaqueLocation || 'None'}
              </div>
            </div>
          </div>
        </div>

        {/* Left Carotid Interval Card */}
        <div className="p-4 bg-[#060b17] border border-slate-800 rounded-xl space-y-3 print:bg-white print:border print:border-black">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <span className="text-[10px] font-extrabold uppercase text-slate-300 tracking-wider print:text-black">
              Left Carotid Interval
            </span>
            {getDeltaBadge(leftPsvDelta)}
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 bg-[#0b1329] border border-slate-800 rounded-lg space-y-1 print:bg-gray-50 print:border">
              <span className="text-[9px] font-bold text-slate-500 uppercase block font-sans print:text-black">
                Prior Study ({priorExam.examDate})
              </span>
              <div className="font-bold text-slate-300 print:text-black">
                {priorExam.leftIcaClassification || 'Normal (0%)'}
              </div>
              <div className="text-[11px] font-mono text-slate-400 print:text-black">
                PSV: <strong className="text-slate-200 print:text-black">{priorExam.leftIcaPsv ?? '—'} cm/s</strong> • EDV: {priorExam.leftIcaEdv ?? '—'} cm/s
              </div>
              <div className="text-[10px] text-slate-400 truncate print:text-black">
                Plaque: {priorExam.leftPlaqueLocation || 'None'}
              </div>
            </div>

            <div className="p-2.5 bg-[#0b1329] border border-slate-800 rounded-lg space-y-1 print:bg-gray-50 print:border">
              <span className="text-[9px] font-bold text-cyan-400 uppercase block font-sans print:text-black">
                Current Study ({studyData.examDate})
              </span>
              <div className="font-bold text-cyan-300 print:text-black">
                {curLeftGrade}
              </div>
              <div className="text-[11px] font-mono text-cyan-200 print:text-black">
                PSV: <strong className="text-cyan-100 print:text-black">{curLeftPsv ?? '—'} cm/s</strong> • EDV: {leftSummary.correspondingIcaEdv ?? '—'} cm/s
              </div>
              <div className="text-[10px] text-slate-400 truncate print:text-black">
                Plaque: {leftSummary.maxPlaqueLocation || 'None'}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Prior Commentary & Notes */}
      {priorExam.comparisonNotes && (
        <div className="p-3 bg-[#060b17] border border-slate-800 rounded-xl text-xs space-y-1 print:bg-white print:border print:text-black">
          <span className="text-[9px] font-bold text-slate-400 uppercase block tracking-wider print:text-black">
            Radiologist Longitudinal Comparison Impression
          </span>
          <p className="text-slate-200 italic leading-relaxed print:text-black">
            "{priorExam.comparisonNotes}"
          </p>
        </div>
      )}
    </div>
  );
};
