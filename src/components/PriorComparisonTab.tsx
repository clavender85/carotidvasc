import React, { useState } from 'react';
import { StudyData } from '../types';
import { generateSideSummary } from '../utils/calculations';
import { Calendar, History, ArrowRight, ArrowUpRight, ArrowDownRight, Minus, Check, Copy, Sparkles, ShieldAlert, Layers } from 'lucide-react';

interface PriorComparisonTabProps {
  studyData: StudyData;
  onUpdateStudy: (updates: Partial<StudyData>) => void;
}

export interface PriorStudyRecord {
  examDate: string;
  facility: string;
  rightIcaPsv: number | null;
  rightIcaEdv: number | null;
  rightIcaGrade: string;
  rightPlaqueDesc: string;
  rightVertFlow: string;
  leftIcaPsv: number | null;
  leftIcaEdv: number | null;
  leftIcaGrade: string;
  leftPlaqueDesc: string;
  leftVertFlow: string;
  priorIntervention: string;
  notes: string;
}

export const PriorComparisonTab: React.FC<PriorComparisonTabProps> = ({ studyData, onUpdateStudy }) => {
  const rightCurrent = generateSideSummary('right', studyData);
  const leftCurrent = generateSideSummary('left', studyData);

  // Prior study state
  const [priorDate, setPriorDate] = useState<string>('2024-03-15');
  const [facility, setFacility] = useState<string>('St. Jude Vascular Ultrasound Lab');
  const [priorRightPsv, setPriorRightPsv] = useState<string>('85');
  const [priorRightGrade, setPriorRightGrade] = useState<string>('Mild Stenosis (<50%)');
  const [priorRightPlaque, setPriorRightPlaque] = useState<string>('Soft mixed plaque at bulb');
  const [priorRightVert, setPriorRightVert] = useState<string>('antegrade');

  const [priorLeftPsv, setPriorLeftPsv] = useState<string>('185');
  const [priorLeftGrade, setPriorLeftGrade] = useState<string>('Moderate Stenosis (50-69%)');
  const [priorLeftPlaque, setPriorLeftPlaque] = useState<string>('Calcified plaque proximal ICA');
  const [priorLeftVert, setPriorLeftVert] = useState<string>('antegrade');

  const [priorIntervention, setPriorIntervention] = useState<string>('None');
  const [priorNotes, setPriorNotes] = useState<string>('Prior baseline study for asymptomatic carotid bruit.');

  const [copiedComparison, setCopiedComparison] = useState(false);

  // Velocity Deltas
  const curRightPsv = rightCurrent.highestIcaPsv;
  const numPriorRightPsv = parseFloat(priorRightPsv);
  const rightPsvDelta = (curRightPsv !== null && !isNaN(numPriorRightPsv)) ? curRightPsv - numPriorRightPsv : null;

  const curLeftPsv = leftCurrent.highestIcaPsv;
  const numPriorLeftPsv = parseFloat(priorLeftPsv);
  const leftPsvDelta = (curLeftPsv !== null && !isNaN(numPriorLeftPsv)) ? curLeftPsv - numPriorLeftPsv : null;

  // Synthesize comparison summary text
  const generateComparisonText = (): string => {
    let lines: string[] = [];
    lines.push(`COMPARISON WITH PRIOR STUDY (${priorDate || 'Previous Date'}):`);
    
    // Right Side interval change
    const rCurrentGrade = rightCurrent.suggestedClassification;
    let rInterval = 'Stable';
    if (rCurrentGrade !== priorRightGrade) {
      rInterval = `Interval change: previously ${priorRightGrade}, currently ${rCurrentGrade}`;
    } else {
      rInterval = `Stable (${rCurrentGrade})`;
    }
    const rVelChange = rightPsvDelta !== null ? ` (PSV Δ: ${rightPsvDelta > 0 ? '+' : ''}${rightPsvDelta} cm/s)` : '';
    lines.push(`- Right ICA: ${rInterval}${rVelChange}. Prior PSV ${priorRightPsv || 'N/A'} cm/s vs Current ${curRightPsv ?? 'N/A'} cm/s.`);

    // Left Side interval change
    const lCurrentGrade = leftCurrent.suggestedClassification;
    let lInterval = 'Stable';
    if (lCurrentGrade !== priorLeftGrade) {
      lInterval = `Interval change: previously ${priorLeftGrade}, currently ${lCurrentGrade}`;
    } else {
      lInterval = `Stable (${lCurrentGrade})`;
    }
    const lVelChange = leftPsvDelta !== null ? ` (PSV Δ: ${leftPsvDelta > 0 ? '+' : ''}${leftPsvDelta} cm/s)` : '';
    lines.push(`- Left ICA: ${lInterval}${lVelChange}. Prior PSV ${priorLeftPsv || 'N/A'} cm/s vs Current ${curLeftPsv ?? 'N/A'} cm/s.`);

    // Vertebral flow
    if (priorRightVert !== rightCurrent.vertebralFlowDirection || priorLeftVert !== leftCurrent.vertebralFlowDirection) {
      lines.push(`- Vertebral Flow: Dynamic interval change noted (Right: ${rightCurrent.vertebralFlowDirection}, Left: ${leftCurrent.vertebralFlowDirection}).`);
    } else {
      lines.push(`- Vertebral Flow: Stable bilateral antegrade flow maintained.`);
    }

    if (priorIntervention && priorIntervention !== 'None') {
      lines.push(`- Prior Procedures: ${priorIntervention}.`);
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
    alert("Comparison text appended to Study Comments!");
  };

  const loadComparisonPreset = (type: 'stable' | 'progression' | 'post-cea') => {
    if (type === 'stable') {
      setPriorDate('2023-11-10');
      setPriorRightPsv('72');
      setPriorRightGrade('Normal (0% Stenosis)');
      setPriorLeftPsv('68');
      setPriorLeftGrade('Normal (0% Stenosis)');
      setPriorIntervention('None');
      setPriorNotes('Annual surveillance - stable appearance.');
    } else if (type === 'progression') {
      setPriorDate('2023-04-12');
      setPriorRightPsv('90');
      setPriorRightGrade('Mild Stenosis (<50%)');
      setPriorLeftPsv('135');
      setPriorLeftGrade('Moderate Stenosis (50-69%)');
      setPriorIntervention('None');
      setPriorNotes('Demonstrated progression of left internal carotid plaque burden.');
    } else if (type === 'post-cea') {
      setPriorDate('2024-01-20');
      setPriorRightPsv('290');
      setPriorRightGrade('Severe Stenosis (70-79%)');
      setPriorLeftPsv('80');
      setPriorLeftGrade('Normal (0% Stenosis)');
      setPriorIntervention('Right Carotid Endarterectomy (CEA) 6 months prior');
      setPriorNotes('Post-operative baseline assessment of endarterectomy site.');
    }
  };

  return (
    <div id="prior-comparison-container" className="space-y-6 max-w-6xl mx-auto pb-12">
      
      {/* Header card */}
      <div className="bg-[#0b1329] border border-slate-800 rounded-xl p-6 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-100">
              Prior Study Longitudinal & Interval Comparison Workspace
            </h3>
            <p className="text-xs text-slate-400">
              Correlate current velocities and plaque morphology with historical ultrasound records.
            </p>
          </div>
        </div>

        {/* Quick presets */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Presets:</span>
          <button
            type="button"
            onClick={() => loadComparisonPreset('stable')}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold border border-slate-700 transition-colors"
          >
            Stable Normal
          </button>
          <button
            type="button"
            onClick={() => loadComparisonPreset('progression')}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold border border-slate-700 transition-colors"
          >
            Progression
          </button>
          <button
            type="button"
            onClick={() => loadComparisonPreset('post-cea')}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold border border-slate-700 transition-colors"
          >
            Post-CEA Follow-up
          </button>
        </div>
      </div>

      {/* Side-by-side comparison tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* ================= RIGHT CAROTID INTERVAL COMPARISON ================= */}
        <div className="bg-[#0b1329] border border-slate-800 rounded-xl p-5 space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-100">Right Carotid System</h4>
            </div>
            {rightPsvDelta !== null && (
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold flex items-center gap-1 ${
                rightPsvDelta > 40 ? 'bg-rose-950/80 border border-rose-700 text-rose-300' :
                rightPsvDelta < -40 ? 'bg-emerald-950/80 border border-emerald-700 text-emerald-300' :
                'bg-slate-800 border border-slate-700 text-slate-300'
              }`}>
                {rightPsvDelta > 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : rightPsvDelta < 0 ? <ArrowDownRight className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
                Δ {rightPsvDelta > 0 ? '+' : ''}{rightPsvDelta} cm/s
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Prior Record */}
            <div className="bg-[#0f172a] p-3.5 rounded-xl border border-slate-800 space-y-2.5">
              <span className="text-[10px] font-bold uppercase text-slate-400 block border-b border-slate-800 pb-1">
                Prior Exam ({priorDate})
              </span>
              <div>
                <label className="text-[9px] text-slate-400 font-bold uppercase block mb-0.5">Prior Peak PSV (cm/s)</label>
                <input
                  type="number"
                  value={priorRightPsv}
                  onChange={(e) => setPriorRightPsv(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded bg-[#0b101f] border border-slate-700 text-xs font-mono text-slate-100"
                />
              </div>
              <div>
                <label className="text-[9px] text-slate-400 font-bold uppercase block mb-0.5">Prior Stenosis Grade</label>
                <input
                  type="text"
                  value={priorRightGrade}
                  onChange={(e) => setPriorRightGrade(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded bg-[#0b101f] border border-slate-700 text-xs text-slate-100"
                />
              </div>
              <div>
                <label className="text-[9px] text-slate-400 font-bold uppercase block mb-0.5">Prior Plaque Morphology</label>
                <input
                  type="text"
                  value={priorRightPlaque}
                  onChange={(e) => setPriorRightPlaque(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded bg-[#0b101f] border border-slate-700 text-xs text-slate-100"
                />
              </div>
            </div>

            {/* Current Exam Record */}
            <div className="bg-[#0f172a] p-3.5 rounded-xl border border-cyan-900/60 space-y-2.5">
              <span className="text-[10px] font-bold uppercase text-cyan-400 block border-b border-cyan-900/40 pb-1">
                Current Study ({studyData.examDate})
              </span>
              <div>
                <span className="text-[9px] text-slate-400 font-bold uppercase block mb-0.5">Current Peak PSV</span>
                <span className="text-base font-mono font-black text-cyan-300 block">
                  {curRightPsv !== null ? `${curRightPsv} cm/s` : 'Unassessed'}
                </span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 font-bold uppercase block mb-0.5">Current Stenosis Grade</span>
                <span className="text-xs font-bold text-slate-200 block">
                  {rightCurrent.suggestedClassification}
                </span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 font-bold uppercase block mb-0.5">Current Plaque Burden</span>
                <span className="text-xs text-slate-300 block">
                  {rightCurrent.maxPlaqueLocation || 'None detected'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ================= LEFT CAROTID INTERVAL COMPARISON ================= */}
        <div className="bg-[#0b1329] border border-slate-800 rounded-xl p-5 space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-100">Left Carotid System</h4>
            </div>
            {leftPsvDelta !== null && (
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold flex items-center gap-1 ${
                leftPsvDelta > 40 ? 'bg-rose-950/80 border border-rose-700 text-rose-300' :
                leftPsvDelta < -40 ? 'bg-emerald-950/80 border border-emerald-700 text-emerald-300' :
                'bg-slate-800 border border-slate-700 text-slate-300'
              }`}>
                {leftPsvDelta > 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : leftPsvDelta < 0 ? <ArrowDownRight className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
                Δ {leftPsvDelta > 0 ? '+' : ''}{leftPsvDelta} cm/s
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Prior Record */}
            <div className="bg-[#0f172a] p-3.5 rounded-xl border border-slate-800 space-y-2.5">
              <span className="text-[10px] font-bold uppercase text-slate-400 block border-b border-slate-800 pb-1">
                Prior Exam ({priorDate})
              </span>
              <div>
                <label className="text-[9px] text-slate-400 font-bold uppercase block mb-0.5">Prior Peak PSV (cm/s)</label>
                <input
                  type="number"
                  value={priorLeftPsv}
                  onChange={(e) => setPriorLeftPsv(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded bg-[#0b101f] border border-slate-700 text-xs font-mono text-slate-100"
                />
              </div>
              <div>
                <label className="text-[9px] text-slate-400 font-bold uppercase block mb-0.5">Prior Stenosis Grade</label>
                <input
                  type="text"
                  value={priorLeftGrade}
                  onChange={(e) => setPriorLeftGrade(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded bg-[#0b101f] border border-slate-700 text-xs text-slate-100"
                />
              </div>
              <div>
                <label className="text-[9px] text-slate-400 font-bold uppercase block mb-0.5">Prior Plaque Morphology</label>
                <input
                  type="text"
                  value={priorLeftPlaque}
                  onChange={(e) => setPriorLeftPlaque(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded bg-[#0b101f] border border-slate-700 text-xs text-slate-100"
                />
              </div>
            </div>

            {/* Current Exam Record */}
            <div className="bg-[#0f172a] p-3.5 rounded-xl border border-cyan-900/60 space-y-2.5">
              <span className="text-[10px] font-bold uppercase text-cyan-400 block border-b border-cyan-900/40 pb-1">
                Current Study ({studyData.examDate})
              </span>
              <div>
                <span className="text-[9px] text-slate-400 font-bold uppercase block mb-0.5">Current Peak PSV</span>
                <span className="text-base font-mono font-black text-cyan-300 block">
                  {curLeftPsv !== null ? `${curLeftPsv} cm/s` : 'Unassessed'}
                </span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 font-bold uppercase block mb-0.5">Current Stenosis Grade</span>
                <span className="text-xs font-bold text-slate-200 block">
                  {leftCurrent.suggestedClassification}
                </span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 font-bold uppercase block mb-0.5">Current Plaque Burden</span>
                <span className="text-xs text-slate-300 block">
                  {leftCurrent.maxPlaqueLocation || 'None detected'}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Prior Study Metadata & Prior Interventions */}
      <div className="bg-[#0b1329] border border-slate-800 rounded-xl p-5 space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Prior Study Historical Details & Vascular Interventions
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Prior Exam Date</label>
            <input
              type="date"
              value={priorDate}
              onChange={(e) => setPriorDate(e.target.value)}
              className="w-full px-3 py-2 rounded bg-[#0f172a] border border-slate-700 text-xs font-mono text-slate-100"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Prior Facility / Imaging Lab</label>
            <input
              type="text"
              value={facility}
              onChange={(e) => setFacility(e.target.value)}
              className="w-full px-3 py-2 rounded bg-[#0f172a] border border-slate-700 text-xs text-slate-100"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Prior Carotid Stent / CEA</label>
            <input
              type="text"
              placeholder="e.g. Right Carotid Stent (2021)"
              value={priorIntervention}
              onChange={(e) => setPriorIntervention(e.target.value)}
              className="w-full px-3 py-2 rounded bg-[#0f172a] border border-slate-700 text-xs text-slate-100"
            />
          </div>
        </div>
      </div>

      {/* Generated Longitudinal Comparison Narrative Card */}
      <div className="bg-[#0b1329] border border-slate-800 rounded-xl p-6 space-y-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-100">
              Synthesized Longitudinal Comparison Narrative
            </h4>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleApplyToComments}
              className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700"
            >
              Append to Study Comments
            </button>
            <button
              type="button"
              onClick={handleCopyComparison}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-black transition-all shadow-md"
            >
              {copiedComparison ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedComparison ? 'Copied!' : 'Copy Comparison Narrative'}</span>
            </button>
          </div>
        </div>

        <div className="p-4 bg-[#0f172a] border border-cyan-900/50 rounded-xl text-xs font-mono text-cyan-200 whitespace-pre-wrap leading-relaxed">
          {generateComparisonText()}
        </div>
      </div>

    </div>
  );
};
