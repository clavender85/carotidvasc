import React from 'react';
import { StudyData, SideSummary } from '../types';
import { calculateNascetStenosis } from '../utils/calculations';
import { Activity, AlertTriangle, CheckCircle2, ShieldAlert, ArrowUpRight, ArrowDownRight, Minus, Stethoscope, Sparkles } from 'lucide-react';

interface ReportExecutiveSummaryProps {
  studyData: StudyData;
  rightSummary: SideSummary;
  leftSummary: SideSummary;
}

export const ReportExecutiveSummary: React.FC<ReportExecutiveSummaryProps> = ({
  studyData,
  rightSummary,
  leftSummary,
}) => {
  const rightGrade = rightSummary.confirmedClassification || rightSummary.suggestedClassification;
  const leftGrade = leftSummary.confirmedClassification || leftSummary.suggestedClassification;

  const getSeverityColor = (grade: string) => {
    const g = grade.toLowerCase();
    if (g.includes('severe') || g.includes('critical') || g.includes('occlusion') || g.includes('>=70') || g.includes('70-79') || g.includes('80-94') || g.includes('95-99')) {
      return {
        bg: 'bg-rose-950/40',
        border: 'border-rose-800/80',
        badgeBg: 'bg-rose-500/20',
        badgeText: 'text-rose-300',
        badgeBorder: 'border-rose-700/60',
        iconColor: 'text-rose-400',
        level: 'Significant Stenosis'
      };
    }
    if (g.includes('moderate') || g.includes('50-69')) {
      return {
        bg: 'bg-amber-950/30',
        border: 'border-amber-800/70',
        badgeBg: 'bg-amber-500/20',
        badgeText: 'text-amber-300',
        badgeBorder: 'border-amber-700/60',
        iconColor: 'text-amber-400',
        level: 'Moderate Stenosis'
      };
    }
    if (g.includes('mild') || g.includes('<50') || g.includes('<30') || g.includes('30-49')) {
      return {
        bg: 'bg-cyan-950/30',
        border: 'border-cyan-800/60',
        badgeBg: 'bg-cyan-500/20',
        badgeText: 'text-cyan-300',
        badgeBorder: 'border-cyan-700/60',
        iconColor: 'text-cyan-400',
        level: 'Mild Disease'
      };
    }
    return {
      bg: 'bg-emerald-950/20',
      border: 'border-emerald-800/50',
      badgeBg: 'bg-emerald-500/20',
      badgeText: 'text-emerald-300',
      badgeBorder: 'border-emerald-700/50',
      iconColor: 'text-emerald-400',
      level: 'Hemodynamically Normal'
    };
  };

  const rightStyle = getSeverityColor(rightGrade);
  const leftStyle = getSeverityColor(leftGrade);

  const rightNascet = calculateNascetStenosis(
    studyData.nascet.right.longitudinal.minLumenA,
    studyData.nascet.right.longitudinal.normalLumenB
  );
  const leftNascet = calculateNascetStenosis(
    studyData.nascet.left.longitudinal.minLumenA,
    studyData.nascet.left.longitudinal.normalLumenB
  );

  // Generate automated clinical recommendation based on severity
  const getClinicalRecommendation = () => {
    const isSevereOrWorse =
      rightGrade.includes('Severe') ||
      rightGrade.includes('Critical') ||
      rightGrade.includes('Near Occlusion') ||
      leftGrade.includes('Severe') ||
      leftGrade.includes('Critical') ||
      leftGrade.includes('Near Occlusion');

    const isModerate =
      rightGrade.includes('Moderate') || leftGrade.includes('Moderate');

    if (isSevereOrWorse) {
      return {
        action: 'Urgent Vascular Surgical Referral & Corroborative CTA/MRA',
        text: 'Hemodynamically significant carotid stenosis identified. Prompt specialist vascular surgical evaluation and cross-sectional angiography (CTA/MRA) recommended for procedural planning.',
        urgency: 'high'
      };
    }
    if (isModerate) {
      return {
        action: '6-Month Surveillance Duplex & Cardiovascular Risk Optimization',
        text: 'Moderate stenosis identified without critical hemodynamic velocity thresholds. Recommend repeat carotid duplex in 6 months to assess rate of disease progression, plus aggressive medical risk management (lipid lowering, antiplatelet therapy).',
        urgency: 'medium'
      };
    }
    return {
      action: 'Routine 12-Month Surveillance or Clinical Follow-Up',
      text: 'No hemodynamically significant internal carotid stenosis detected. Routine clinical follow-up or interval 12-month duplex surveillance as clinically indicated based on symptoms.',
      urgency: 'low'
    };
  };

  const recommendation = getClinicalRecommendation();

  return (
    <div className="p-6 border-b border-slate-800 bg-[#0c1427]/80 space-y-4 print:bg-white print:border-b-2 print:border-black">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400 print:hidden" />
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-100 print:text-black">
            Executive Summary & Key Findings
          </h3>
        </div>
        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wide print:text-black">
          Protocol: <strong className="text-cyan-300 print:text-black">{studyData.classificationSystem.replace(/_/g, ' ')}</strong>
        </span>
      </div>

      {/* Dual Column Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Right System Summary Card */}
        <div className={`p-4 rounded-xl border ${rightStyle.bg} ${rightStyle.border} space-y-3 print:bg-white print:border-2 print:border-black`}>
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block print:text-black">
                Right Carotid System
              </span>
              <h4 className="text-sm font-black text-slate-100 mt-0.5 print:text-black">
                {rightGrade}
              </h4>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${rightStyle.badgeBg} ${rightStyle.badgeText} ${rightStyle.badgeBorder} print:bg-gray-100 print:text-black print:border-black`}>
              {rightStyle.level}
            </span>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2 p-2.5 bg-[#080d1a]/80 border border-slate-800/80 rounded-lg text-xs font-mono print:bg-gray-50 print:border-black">
            <div>
              <span className="text-[9px] text-slate-400 uppercase block font-sans print:text-black">Peak PSV</span>
              <span className="font-black text-slate-100 text-sm print:text-black">
                {rightSummary.highestIcaPsv !== null ? `${rightSummary.highestIcaPsv} cm/s` : '—'}
              </span>
            </div>
            <div>
              <span className="text-[9px] text-slate-400 uppercase block font-sans print:text-black">EDV</span>
              <span className="font-bold text-slate-200 text-sm print:text-black">
                {rightSummary.correspondingIcaEdv !== null ? `${rightSummary.correspondingIcaEdv} cm/s` : '—'}
              </span>
            </div>
            <div>
              <span className="text-[9px] text-slate-400 uppercase block font-sans print:text-black">ICA/CCA</span>
              <span className="font-black text-cyan-400 text-sm print:text-black">
                {rightSummary.icaCcaRatio !== null ? rightSummary.icaCcaRatio : '—'}
              </span>
            </div>
          </div>

          {/* Summary Bullets */}
          <div className="space-y-1 text-xs text-slate-300 print:text-black">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400 print:text-black">Plaque Location:</span>
              <span className="font-medium text-slate-200 print:text-black">{rightSummary.maxPlaqueLocation || 'None detected'}</span>
            </div>
            {rightNascet !== null && (
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400 print:text-black">NASCET Diameter Caliper:</span>
                <span className="font-bold text-amber-300 print:text-black">{rightNascet}% reduction</span>
              </div>
            )}
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400 print:text-black">Vertebral Flow:</span>
              <span className="font-bold uppercase text-slate-200 print:text-black">{rightSummary.vertebralFlowDirection}</span>
            </div>
          </div>
        </div>

        {/* Left System Summary Card */}
        <div className={`p-4 rounded-xl border ${leftStyle.bg} ${leftStyle.border} space-y-3 print:bg-white print:border-2 print:border-black`}>
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block print:text-black">
                Left Carotid System
              </span>
              <h4 className="text-sm font-black text-slate-100 mt-0.5 print:text-black">
                {leftGrade}
              </h4>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${leftStyle.badgeBg} ${leftStyle.badgeText} ${leftStyle.badgeBorder} print:bg-gray-100 print:text-black print:border-black`}>
              {leftStyle.level}
            </span>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2 p-2.5 bg-[#080d1a]/80 border border-slate-800/80 rounded-lg text-xs font-mono print:bg-gray-50 print:border-black">
            <div>
              <span className="text-[9px] text-slate-400 uppercase block font-sans print:text-black">Peak PSV</span>
              <span className="font-black text-slate-100 text-sm print:text-black">
                {leftSummary.highestIcaPsv !== null ? `${leftSummary.highestIcaPsv} cm/s` : '—'}
              </span>
            </div>
            <div>
              <span className="text-[9px] text-slate-400 uppercase block font-sans print:text-black">EDV</span>
              <span className="font-bold text-slate-200 text-sm print:text-black">
                {leftSummary.correspondingIcaEdv !== null ? `${leftSummary.correspondingIcaEdv} cm/s` : '—'}
              </span>
            </div>
            <div>
              <span className="text-[9px] text-slate-400 uppercase block font-sans print:text-black">ICA/CCA</span>
              <span className="font-black text-cyan-400 text-sm print:text-black">
                {leftSummary.icaCcaRatio !== null ? leftSummary.icaCcaRatio : '—'}
              </span>
            </div>
          </div>

          {/* Summary Bullets */}
          <div className="space-y-1 text-xs text-slate-300 print:text-black">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400 print:text-black">Plaque Location:</span>
              <span className="font-medium text-slate-200 print:text-black">{leftSummary.maxPlaqueLocation || 'None detected'}</span>
            </div>
            {leftNascet !== null && (
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400 print:text-black">NASCET Diameter Caliper:</span>
                <span className="font-bold text-amber-300 print:text-black">{leftNascet}% reduction</span>
              </div>
            )}
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400 print:text-black">Vertebral Flow:</span>
              <span className="font-bold uppercase text-slate-200 print:text-black">{leftSummary.vertebralFlowDirection}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Clinical Recommendation Banner */}
      <div className={`p-3.5 rounded-xl border flex items-start gap-3 ${
        recommendation.urgency === 'high'
          ? 'bg-rose-950/30 border-rose-800/80 text-rose-200'
          : recommendation.urgency === 'medium'
          ? 'bg-amber-950/25 border-amber-800/60 text-amber-200'
          : 'bg-cyan-950/20 border-cyan-800/50 text-cyan-200'
      } print:bg-white print:border print:border-black print:text-black`}>
        <Stethoscope className="w-5 h-5 shrink-0 mt-0.5 text-cyan-400 print:hidden" />
        <div className="space-y-0.5">
          <span className="text-[10px] font-black uppercase tracking-wider block text-slate-100 print:text-black">
            Clinical Recommendation: {recommendation.action}
          </span>
          <p className="text-xs text-slate-300 print:text-black leading-relaxed">
            {recommendation.text}
          </p>
        </div>
      </div>
    </div>
  );
};
