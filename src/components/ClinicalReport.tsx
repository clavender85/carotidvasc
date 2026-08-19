import React, { useState } from 'react';
import { StudyData, MainTab, ProtocolOverride } from '../types';
import { generateSideSummary, checkCcaSuitability, generateClinicalImpressionNarrative, calculateNascetStenosis } from '../utils/calculations';
import { validateCarotidStudy, ValidationIssue } from '../utils/validationEngine';
import { SEGMENTS_META } from '../constants';
import { getAnatomicalVariationReportSentences, ARCH_VARIANTS_META, BIFURCATION_VARIANTS_META } from '../utils/anatomyVariants';
import { getNormalizedClinicalContext } from '../utils/clinicalContextSummary';
import { FileText, Copy, Printer, Check, Clipboard, RefreshCw, AlertTriangle, ChevronRight, Sparkles, ShieldCheck, ShieldAlert, CheckCircle2, UserCheck, AlertCircle, GitBranch, Layers, History, ArrowLeft, Stethoscope, Download } from 'lucide-react';

interface ClinicalReportProps {
  studyData: StudyData;
  onConfirmClassification: (side: 'right' | 'left', category: string) => void;
  onUpdateStudy: (updates: Partial<StudyData>) => void;
  onResetAll: () => void;
  onNavigateTab?: (tab: MainTab) => void;
}

export const ClinicalReport: React.FC<ClinicalReportProps> = ({
  studyData,
  onConfirmClassification,
  onUpdateStudy,
  onResetAll,
  onNavigateTab,
}) => {
  const rightSummary = generateSideSummary('right', studyData);
  const leftSummary = generateSideSummary('left', studyData);
  const synthesizedNarrative = generateClinicalImpressionNarrative(studyData);
  const validationIssues = validateCarotidStudy(studyData);
  const clinicalCtx = getNormalizedClinicalContext(studyData);

  const [copied, setCopied] = useState(false);
  const [copiedImpression, setCopiedImpression] = useState(false);
  const [signedOff, setSignedOff] = useState(false);
  const [signOffTimestamp, setSignOffTimestamp] = useState<string | null>(null);

  const handleToggleSignOff = () => {
    if (!signedOff) {
      setSignedOff(true);
      setSignOffTimestamp(new Date().toLocaleString());
    } else {
      setSignedOff(false);
      setSignOffTimestamp(null);
    }
  };

  const handleCopyImpression = () => {
    navigator.clipboard.writeText(synthesizedNarrative.overall).then(() => {
      setCopiedImpression(true);
      setTimeout(() => setCopiedImpression(false), 2000);
    });
  };

  const getClassificationOptions = () => {
    if (studyData.classificationSystem === 'ASUM_2021') {
      return [
        "Normal (0% Stenosis)",
        "Mild Stenosis (<50%)",
        "Moderate Stenosis (50-69%)",
        "Severe Stenosis (70-79%)",
        "Critical Stenosis (80-94%)",
        "Near Occlusion (95-99%)",
        "Total Occlusion (100%)",
        "Indeterminate / Incomplete"
      ];
    } else if (studyData.classificationSystem === 'IAC_MODIFIED_SRU_2023' || studyData.classificationSystem === 'MODIFIED_SRU_2021') {
      return [
        "Normal (0% Stenosis)",
        "Mild Stenosis (<50%)",
        "Moderate Stenosis (50-69%)",
        "Severe Stenosis (>=70%)",
        "Near Occlusion (95-99%)",
        "Total Occlusion (100%)",
        "Indeterminate / Incomplete"
      ];
    } else if (studyData.classificationSystem === 'SRU_2003') {
      return [
        "Normal (0% Stenosis)",
        "Mild Stenosis (<50%)",
        "Moderate Stenosis (50-69%)",
        "Severe Stenosis (>=70%)",
        "Near Occlusion (95-99%)",
        "Total Occlusion (100%)",
        "Indeterminate / Incomplete"
      ];
    } else if (studyData.classificationSystem === 'UK_JOINT') {
      return [
        "Normal (<50% Stenosis)",
        "Moderate Stenosis (50-69%)",
        "Severe Stenosis (>=70%)",
        "Near Occlusion (95-99%)",
        "Total Occlusion (100%)",
        "Indeterminate / Incomplete"
      ];
    } else if (studyData.classificationSystem === 'NASCET_INDEX') {
      return [
        "Normal (0% Stenosis)",
        "Mild Stenosis (<30%)",
        "Mild Stenosis (30-49%)",
        "Moderate Stenosis (50-59%)",
        "Moderate-Severe Stenosis (60-69%)",
        "Severe Stenosis (>=70%)",
        "Near Occlusion",
        "Total Occlusion",
        "Indeterminate"
      ];
    }
    return ["Normal", "Mild", "Moderate", "Severe", "Near Occlusion", "Total Occlusion"];
  };

  const options = getClassificationOptions();

  // Generate structured plain text report for EMR
  const generatePlainTextReport = (): string => {
    const r = rightSummary;
    const l = leftSummary;
    
    let text = `==================================================================\n`;
    text += `CAROTID ARTERIAL DUPLEX ULTRASOUND REPORT\n`;
    text += `==================================================================\n\n`;
    
    text += `PATIENT & EXAM DETAILS\n`;
    text += `------------------------------------------------------------------\n`;
    text += `Patient Name: ${studyData.patientName || 'Not entered'}\n`;
    text += `Patient ID/MRN: ${studyData.patientId || 'Not entered'}\n`;
    text += `Exam Date: ${studyData.examDate}\n`;
    text += `Reporting Sonographer: ${studyData.sonographer || 'Not entered'}\n`;
    text += `Interpreting Physician: ${studyData.interpretingPhysician || 'Not entered'}\n`;
    text += `Diagnostic Protocol: ${studyData.classificationSystem.replace('_', ' ')}\n`;
    if (signedOff) {
      text += `Status: VERIFIED & SIGNED OFF (${signOffTimestamp})\n`;
    }
    text += `\n`;

    text += `CLINICAL IMPRESSION & SUMMARY\n`;
    text += `------------------------------------------------------------------\n`;
    text += `${synthesizedNarrative.overall}\n\n`;

    const rightNascet = calculateNascetStenosis(studyData.nascet.right.longitudinal.minLumenA, studyData.nascet.right.longitudinal.normalLumenB);
    const leftNascet = calculateNascetStenosis(studyData.nascet.left.longitudinal.minLumenA, studyData.nascet.left.longitudinal.normalLumenB);

    text += `HEMODYNAMIC MEASUREMENTS SUMMARY\n`;
    text += `------------------------------------------------------------------\n`;
    text += `RIGHT SYSTEM:\n`;
    text += `  - Suggested Grade: ${r.suggestedClassification}\n`;
    text += `  - Confirmed Grade: ${r.confirmedClassification}\n`;
    text += `  - Peak Stenotic PSV: ${r.highestIcaPsv !== null ? r.highestIcaPsv + ' cm/s' : 'N/A'}\n`;
    text += `  - Corresponding EDV: ${r.correspondingIcaEdv !== null ? r.correspondingIcaEdv + ' cm/s' : 'N/A'}\n`;
    text += `  - Distal CCA PSV: ${r.distalCcaPsv !== null ? r.distalCcaPsv + ' cm/s' : 'N/A'}\n`;
    text += `  - ICA/CCA PSV Ratio: ${r.icaCcaRatio !== null ? r.icaCcaRatio : 'N/A'}\n`;
    if (rightNascet !== null) {
      text += `  - NASCET Diameter Reduction: ${rightNascet}%\n`;
    }
    text += `  - Max Plaque Site: ${r.maxPlaqueLocation || 'None detected'}\n`;
    text += `  - Vertebral Flow: ${r.vertebralFlowDirection.toUpperCase()}\n`;
    text += `  - Subclavian Findings: ${r.subclavianFindings}\n\n`;

    text += `LEFT SYSTEM:\n`;
    text += `  - Suggested Grade: ${l.suggestedClassification}\n`;
    text += `  - Confirmed Grade: ${l.confirmedClassification}\n`;
    text += `  - Peak Stenotic PSV: ${l.highestIcaPsv !== null ? l.highestIcaPsv + ' cm/s' : 'N/A'}\n`;
    text += `  - Corresponding EDV: ${l.correspondingIcaEdv !== null ? l.correspondingIcaEdv + ' cm/s' : 'N/A'}\n`;
    text += `  - Distal CCA PSV: ${l.distalCcaPsv !== null ? l.distalCcaPsv + ' cm/s' : 'N/A'}\n`;
    text += `  - ICA/CCA PSV Ratio: ${l.icaCcaRatio !== null ? l.icaCcaRatio : 'N/A'}\n`;
    if (leftNascet !== null) {
      text += `  - NASCET Diameter Reduction: ${leftNascet}%\n`;
    }
    text += `  - Max Plaque Site: ${l.maxPlaqueLocation || 'None detected'}\n`;
    text += `  - Vertebral Flow: ${l.vertebralFlowDirection.toUpperCase()}\n`;
    text += `  - Subclavian Findings: ${l.subclavianFindings}\n\n`;

    const variantSentences = getAnatomicalVariationReportSentences(studyData);
    if (variantSentences.length > 0) {
      text += `ANATOMICAL VARIATION\n`;
      text += `------------------------------------------------------------------\n`;
      variantSentences.forEach(s => {
        text += `  - ${s}\n`;
      });
      text += `\n`;
    }

    if (studyData.priorExam?.hasPriorExam && studyData.priorExam.examDate) {
      text += `LONGITUDINAL COMPARISON (Prior Exam: ${studyData.priorExam.examDate}${studyData.priorExam.facility ? ` at ${studyData.priorExam.facility}` : ''})\n`;
      text += `------------------------------------------------------------------\n`;
      text += `  - Right ICA: Prior Grade: ${studyData.priorExam.rightIcaClassification} (PSV ${studyData.priorExam.rightIcaPsv ?? 'N/A'} cm/s) vs Current: ${r.confirmedClassification} (PSV ${r.highestIcaPsv ?? 'N/A'} cm/s)\n`;
      text += `  - Left ICA: Prior Grade: ${studyData.priorExam.leftIcaClassification} (PSV ${studyData.priorExam.leftIcaPsv ?? 'N/A'} cm/s) vs Current: ${l.confirmedClassification} (PSV ${l.highestIcaPsv ?? 'N/A'} cm/s)\n`;
      if (studyData.priorExam.comparisonNotes) {
        text += `  - Comparison Notes: ${studyData.priorExam.comparisonNotes}\n`;
      }
      text += `\n`;
    }

    if (studyData.nonCarotidFindings.length > 0) {
      text += `NON-CAROTID / ASSOCIATED FINDINGS:\n`;
      studyData.nonCarotidFindings.forEach(f => {
        text += `  - [${f.side.toUpperCase()}] ${f.type}${f.sizeMm ? ` (${f.sizeMm} mm)` : ''}: ${f.comments || 'Visualized'}\n`;
      });
      text += `\n`;
    }

    if (studyData.studyComments) {
      text += `SONOGRAPHER NOTES & DISCUSSION:\n`;
      text += `------------------------------------------------------------------\n`;
      text += `${studyData.studyComments}\n\n`;
    }

    text += `Report compiled on: ${new Date().toLocaleString()}\n`;
    return text;
  };

  const handleCopyToClipboard = () => {
    const rawText = generatePlainTextReport();
    navigator.clipboard.writeText(rawText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const rCcaDist = studyData.segments['r_cca_dist'];
  const lCcaDist = studyData.segments['l_cca_dist'];
  const rCcaSuitability = checkCcaSuitability(rCcaDist);
  const lCcaSuitability = checkCcaSuitability(lCcaDist);

  return (
    <div id="clinical-report-root" className="space-y-6 max-w-6xl mx-auto pb-12 print:max-w-none print:p-0">
      
      {/* 1. Validation & Quality Assurance Banner */}
      <div className="bg-[#0b1329] border border-slate-800 rounded-xl p-5 shadow-lg print:hidden">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            {validationIssues.length === 0 ? (
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            ) : (
              <ShieldAlert className="w-5 h-5 text-amber-400" />
            )}
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-100">
                Quality Assurance & Clinical Consistency Engine
              </h3>
              <span className="text-[10px] text-slate-400">
                {validationIssues.length === 0
                  ? 'All hemodynamic parameters, flow directions, and reference segments passed validation.'
                  : `${validationIssues.length} issue(s) flagged for sonographer review.`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleSignOff}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                signedOff
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/50'
                  : 'bg-[#0f172a] hover:bg-slate-800 text-slate-300 border border-slate-700'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>{signedOff ? 'Study Verified & Signed Off' : 'Sign Off Study'}</span>
            </button>
          </div>
        </div>

        {validationIssues.length > 0 && (
          <div className="mt-3 space-y-2">
            {validationIssues.map(iss => (
              <div
                key={iss.id}
                className={`p-2.5 rounded-lg border text-xs flex items-start gap-2.5 ${
                  iss.severity === 'error'
                    ? 'bg-rose-950/40 border-rose-800 text-rose-200'
                    : iss.severity === 'warning'
                    ? 'bg-amber-950/30 border-amber-800 text-amber-200'
                    : 'bg-cyan-950/20 border-cyan-800/60 text-cyan-200'
                }`}
              >
                {iss.severity === 'error' ? (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                ) : iss.severity === 'warning' ? (
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                ) : (
                  <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="font-bold block text-slate-100">{iss.title}</span>
                  <span className="text-[11px] opacity-90">{iss.message}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Main Report Paper Card (Dark theme onscreen, crisp white on print) */}
      <div className="bg-[#0b1329] border border-slate-800 rounded-xl shadow-xl overflow-hidden print:bg-white print:border-none print:shadow-none print:text-black">
        
        {/* Header Toolbar */}
        <div className="p-4 bg-[#0f172a] border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-100">
                Consolidated Carotid Duplex Clinical Report
              </h3>
              <span className="text-[10px] text-slate-400">
                Live synchronization with worksheet measurements.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onNavigateTab && (
              <button
                type="button"
                id="btn-report-back-to-scan"
                onClick={() => onNavigateTab('scan')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0b101f] hover:bg-slate-800 text-cyan-400 border border-slate-700 rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Scan Worksheet</span>
              </button>
            )}
            <button
              id="report-copy-btn"
              onClick={handleCopyToClipboard}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0b101f] hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-lg text-xs font-bold transition-all cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Copy EMR Report</span>
                </>
              )}
            </button>
            <button
              id="report-print-btn"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 rounded-lg text-xs font-black transition-all shadow-md cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Worksheet</span>
            </button>
          </div>
        </div>

        {/* DEMO Mode Notice Banner */}
        {studyData.isDemoMode && (
          <div className="px-6 py-2.5 bg-amber-950/50 border-b border-amber-700/80 flex items-center justify-between text-xs text-amber-300 print:bg-amber-100 print:text-amber-950 print:border-black">
            <div className="flex items-center gap-2 font-extrabold uppercase tracking-wider text-xs">
              <span className="px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 text-[10px] font-black">
                DEMO
              </span>
              <span>DEMONSTRATION REPORT — SAMPLE DATA ONLY — NOT FOR CLINICAL USE</span>
            </div>
            {studyData.demoCaseTitle && (
              <span className="text-[11px] font-semibold text-amber-400/90 hidden sm:inline">
                Case: {studyData.demoCaseTitle}
              </span>
            )}
          </div>
        )}

        {/* Patient Demographics & Exam Details Banner */}
        <div className="px-6 py-4 bg-[#0f172a]/60 border-b border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-slate-400 print:bg-white print:border-b-2 print:border-black print:text-black">
          <div>
            <span className="font-bold text-slate-500 block uppercase text-[9px] mb-0.5 print:text-black">Patient Name</span>
            <span className="font-bold text-slate-100 text-sm print:text-black">{studyData.patientName || '—'}</span>
          </div>
          <div>
            <span className="font-bold text-slate-500 block uppercase text-[9px] mb-0.5 print:text-black">MRN / Chart ID</span>
            <span className="font-semibold text-slate-200 font-mono text-sm print:text-black">{studyData.patientId || '—'}</span>
          </div>
          <div>
            <span className="font-bold text-slate-500 block uppercase text-[9px] mb-0.5 print:text-black">Exam Date</span>
            <span className="font-semibold text-slate-200 print:text-black">{studyData.examDate}</span>
          </div>
          <div>
            <span className="font-bold text-slate-500 block uppercase text-[9px] mb-0.5 print:text-black">Protocol</span>
            <span className="font-bold text-cyan-400 uppercase text-[10px] print:text-black">{studyData.classificationSystem.replace('_', ' ')}</span>
          </div>
          <div>
            <span className="font-bold text-slate-500 block uppercase text-[9px] mb-0.5 print:text-black">Anatomical Variant</span>
            <span className="font-bold text-slate-200 text-[11px] print:text-black">
              {ARCH_VARIANTS_META[studyData.anatomyVariants?.archVariant || (studyData.variantLeftBct ? 'bovine_common_origin' : 'standard')]?.shortLabel || 'Standard'}
              {studyData.anatomyVariants?.bifurcationVariant && studyData.anatomyVariants.bifurcationVariant !== 'normal'
                ? ` (${BIFURCATION_VARIANTS_META[studyData.anatomyVariants.bifurcationVariant].shortLabel})`
                : ''}
            </span>
          </div>
          {studyData.sonographer && (
            <div>
              <span className="font-bold text-slate-500 block uppercase text-[9px] mb-0.5 print:text-black">Sonographer</span>
              <span className="font-medium text-slate-300 print:text-black">{studyData.sonographer}</span>
            </div>
          )}
          {studyData.interpretingPhysician && (
            <div>
              <span className="font-bold text-slate-500 block uppercase text-[9px] mb-0.5 print:text-black">Physician</span>
              <span className="font-medium text-slate-300 print:text-black">{studyData.interpretingPhysician}</span>
            </div>
          )}
          {signedOff && (
            <div className="col-span-2">
              <span className="font-bold text-emerald-400 block uppercase text-[9px] mb-0.5">Verification Status</span>
              <span className="font-mono text-xs text-emerald-300 font-bold">Verified on {signOffTimestamp}</span>
            </div>
          )}
        </div>

        {/* Clinical Details & Referral Context in Report */}
        {(clinicalCtx.indications.length > 0 || clinicalCtx.history.length > 0 || clinicalCtx.priorImaging.length > 0 || clinicalCtx.referral?.rawText || clinicalCtx.additionalNotes) && (
          <div className="px-6 py-4 border-b border-slate-800 bg-[#0a1224]/50 space-y-2.5 print:bg-white print:border-b print:border-gray-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Stethoscope className="w-3.5 h-3.5 text-cyan-400 print:hidden" />
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-300 print:text-black">
                  Clinical Details & Referral Context
                </span>
              </div>
              {clinicalCtx.referral?.source === 'electronic_referral' && (
                <span className="flex items-center gap-1 text-[9px] px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800 text-cyan-300 font-mono print:border-black print:text-black">
                  <Download className="w-2.5 h-2.5 print:hidden" />
                  Imported Referral {clinicalCtx.referral.sourceId ? `(${clinicalCtx.referral.sourceId})` : ''}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              {/* Indications */}
              {clinicalCtx.indications.length > 0 && (
                <div className="p-2.5 bg-[#0d162f]/80 border border-slate-800/80 rounded-lg space-y-1 print:bg-white print:border">
                  <span className="text-[9px] font-bold text-slate-500 uppercase block tracking-wider print:text-black">
                    Clinical Indications
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {clinicalCtx.indications.map((ind) => (
                      <span key={ind.id} className="text-[11px] font-medium text-cyan-200 bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-800/40 print:text-black print:border-black print:bg-gray-100">
                        {ind.label}
                      </span>
                    ))}
                  </div>
                  {clinicalCtx.conditionalAnswers?.symptomSide && (
                    <div className="text-[10px] text-slate-400 font-mono mt-1 print:text-black">
                      Side: <strong className="text-slate-200 uppercase print:text-black">{clinicalCtx.conditionalAnswers.symptomSide}</strong>
                      {clinicalCtx.conditionalAnswers.symptomOnset && ` • Onset: ${clinicalCtx.conditionalAnswers.symptomOnset}`}
                    </div>
                  )}
                </div>
              )}

              {/* History */}
              {clinicalCtx.history.length > 0 && (
                <div className="p-2.5 bg-[#0d162f]/80 border border-slate-800/80 rounded-lg space-y-1 print:bg-white print:border">
                  <span className="text-[9px] font-bold text-slate-500 uppercase block tracking-wider print:text-black">
                    Relevant Medical / Vascular History
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {clinicalCtx.history.map((hist) => (
                      <span key={hist.id} className="text-[11px] font-medium text-slate-300 bg-slate-800/60 px-1.5 py-0.5 rounded border border-slate-700/50 print:text-black print:border-black print:bg-gray-100">
                        {hist.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Prior Imaging & Procedures */}
              {clinicalCtx.priorImaging.length > 0 && (
                <div className="p-2.5 bg-[#0d162f]/80 border border-slate-800/80 rounded-lg space-y-1 print:bg-white print:border">
                  <span className="text-[9px] font-bold text-slate-500 uppercase block tracking-wider print:text-black">
                    Prior Imaging & Procedures
                  </span>
                  <div className="space-y-1">
                    {clinicalCtx.priorImaging.map((img) => (
                      <div key={img.id} className="text-[11px] text-slate-300 print:text-black">
                        <span className="font-semibold text-slate-200 print:text-black">{img.label}</span>
                        {img.date && <span className="text-slate-400 font-mono text-[10px]"> ({img.date})</span>}
                        {img.detail && <span className="text-slate-400 block text-[10px] italic"> {img.detail}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Original Referral Text Quote */}
            {clinicalCtx.referral?.rawText && (
              <div className="text-[11px] text-slate-400 italic bg-[#080e1e] p-2 rounded-lg border border-slate-800 print:bg-gray-50 print:border print:border-black print:text-black">
                <span className="font-semibold text-slate-400 not-italic uppercase text-[9px] mr-1 print:text-black">Referral:</span>
                "{clinicalCtx.referral.rawText}"
              </div>
            )}

            {/* Additional Clinical Notes */}
            {clinicalCtx.additionalNotes && (
              <div className="text-[11px] text-slate-300 bg-[#080e1e] p-2 rounded-lg border border-slate-800 print:bg-gray-50 print:border print:border-black print:text-black">
                <span className="font-semibold text-slate-400 uppercase text-[9px] mr-1 print:text-black">Clinical Notes:</span>
                {clinicalCtx.additionalNotes}
              </div>
            )}
          </div>
        )}

        {/* Synthesized Impression Card */}
        <div className="p-6 border-b border-slate-800 bg-[#0d1527]/50 space-y-3 print:bg-white print:border-b print:border-gray-300">
          <div className="flex items-center justify-between print:hidden">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-100">
                Synthesized Clinical Impression (Vascular Report Language)
              </h4>
            </div>
            <button
              id="copy-impression-only-btn"
              onClick={handleCopyImpression}
              className="flex items-center gap-1 px-2.5 py-1 bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-600/50 text-cyan-300 rounded text-[10px] font-bold transition-all"
            >
              {copiedImpression ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              <span>{copiedImpression ? 'Copied!' : 'Copy Impression Only'}</span>
            </button>
          </div>

          <div className="p-4 bg-[#080d19] border border-cyan-900/50 rounded-xl text-xs font-mono text-cyan-200 whitespace-pre-wrap leading-relaxed shadow-sm print:bg-white print:border print:border-black print:text-black print:p-2">
            {synthesizedNarrative.overall}
          </div>
        </div>

        {/* Dedicated Anatomical Variation Findings Section */}
        {getAnatomicalVariationReportSentences(studyData).length > 0 && (
          <div className="p-6 border-b border-slate-800 bg-[#091122]/60 space-y-3 print:bg-white print:border-b print:border-gray-300">
            <div className="flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-cyan-400 print:hidden" />
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-100 print:text-black">
                Anatomical Variation & Vascular Configuration
              </h4>
            </div>
            <div className="p-3.5 bg-[#080d19] border border-cyan-900/60 rounded-xl space-y-2 print:bg-gray-50 print:border-black print:text-black">
              {getAnatomicalVariationReportSentences(studyData).map((sentence, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-200 print:text-black leading-relaxed">
                  <span className="text-cyan-400 font-bold shrink-0 mt-0.5">•</span>
                  <span>{sentence}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Prior Study Comparison Section */}
        {studyData.priorExam?.hasPriorExam && studyData.priorExam.examDate && (
          <div className="p-6 border-b border-slate-800 bg-[#081020]/70 space-y-3 print:bg-white print:border-b print:border-gray-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-cyan-400 print:hidden" />
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-100 print:text-black">
                  Longitudinal Comparison with Prior Examination ({studyData.priorExam.examDate}{studyData.priorExam.facility ? ` • ${studyData.priorExam.facility}` : ''})
                </h4>
              </div>
              {onNavigateTab && (
                <button
                  type="button"
                  onClick={() => onNavigateTab('previous')}
                  className="text-[10px] text-cyan-400 hover:underline font-bold print:hidden"
                >
                  Edit Prior Comparison Details →
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3 bg-[#0b1329] border border-slate-800 rounded-lg space-y-1 print:bg-white print:border">
                <span className="text-[10px] font-bold text-slate-400 uppercase block font-sans print:text-black">Right Carotid Interval</span>
                <div className="text-slate-200 print:text-black">
                  Prior: {studyData.priorExam.rightIcaClassification || 'N/A'} (PSV {studyData.priorExam.rightIcaPsv ?? '—'} cm/s)
                </div>
                <div className="font-bold text-cyan-300 print:text-black">
                  Current: {rightSummary.confirmedClassification || rightSummary.suggestedClassification} (PSV {rightSummary.highestIcaPsv ?? '—'} cm/s)
                </div>
              </div>
              <div className="p-3 bg-[#0b1329] border border-slate-800 rounded-lg space-y-1 print:bg-white print:border">
                <span className="text-[10px] font-bold text-slate-400 uppercase block font-sans print:text-black">Left Carotid Interval</span>
                <div className="text-slate-200 print:text-black">
                  Prior: {studyData.priorExam.leftIcaClassification || 'N/A'} (PSV {studyData.priorExam.leftIcaPsv ?? '—'} cm/s)
                </div>
                <div className="font-bold text-cyan-300 print:text-black">
                  Current: {leftSummary.confirmedClassification || leftSummary.suggestedClassification} (PSV {leftSummary.highestIcaPsv ?? '—'} cm/s)
                </div>
              </div>
            </div>
            {studyData.priorExam.comparisonNotes && (
              <div className="text-xs text-slate-300 italic print:text-black">
                {studyData.priorExam.comparisonNotes}
              </div>
            )}
          </div>
        )}

        {/* Technical Exception / Protocol Waiver Documentation */}
        {studyData.technicalOverrides && Object.keys(studyData.technicalOverrides).length > 0 && (
          <div className="p-6 border-b border-slate-800 bg-[#081020]/70 space-y-3 print:bg-white print:border-b print:border-gray-300">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400 print:hidden" />
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-100 print:text-black">
                Documented Technical Limitations & Protocol Exceptions ({Object.keys(studyData.technicalOverrides).length})
              </h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(Object.values(studyData.technicalOverrides) as ProtocolOverride[]).map((override: ProtocolOverride, idx: number) => (
                <div
                  key={idx}
                  className="p-3 bg-[#0b1329] border border-amber-900/60 rounded-xl space-y-1 text-xs print:bg-gray-50 print:border print:border-black"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-300 uppercase tracking-wide print:text-black">
                      {override.segmentId ? (SEGMENTS_META[override.segmentId]?.name || override.segmentId) : override.requirementId}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono print:text-black">
                      {override.timestamp}
                    </span>
                  </div>
                  <div className="text-slate-200 print:text-black font-semibold">
                    Limitation: <span className="text-amber-200 capitalize">{override.reason.replace(/_/g, ' ')}</span>
                  </div>
                  {override.comment && (
                    <p className="text-[11px] text-slate-400 italic print:text-black">
                      "{override.comment}"
                    </p>
                  )}
                  {override.sonographer && (
                    <div className="text-[10px] text-slate-500 font-mono print:text-black">
                      Recorded by: {override.sonographer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Side-by-Side Hemodynamic Panels */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 border-b border-slate-800 print:grid-cols-2 print:border-b print:border-gray-300">
          
          {/* ================= RIGHT SIDE REPORT ================= */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 print:border-black">
              <span className="text-xs font-black uppercase text-slate-100 flex items-center gap-1.5 print:text-black">
                <ChevronRight className="w-4 h-4 text-cyan-400 print:hidden" /> Right Carotid System
              </span>
            </div>

            {/* Suggested & Confirmed Grade */}
            <div className="bg-[#0f172a] border border-slate-800 p-4 rounded-xl space-y-3 print:bg-white print:border print:border-gray-300">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block print:text-black">Suggested Grade</span>
                  <span className="text-sm font-black text-cyan-400 block mt-0.5 print:text-black">{rightSummary.suggestedClassification}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block print:text-black">Confirmed Grade</span>
                  <span className="text-sm font-black text-emerald-400 block mt-0.5 print:text-black">{rightSummary.confirmedClassification}</span>
                </div>
              </div>

              <div className="bg-[#0b101f] border border-slate-800 p-2.5 rounded-lg flex flex-col gap-2 print:hidden">
                <span className="text-[9px] font-bold text-slate-400 uppercase">Confirm or Override Stenosis Grade</span>
                <div className="flex gap-2">
                  <button
                    id="btn-confirm-right"
                    onClick={() => onConfirmClassification('right', rightSummary.suggestedClassification)}
                    className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-[10px] rounded transition-all cursor-pointer"
                  >
                    Confirm Suggested
                  </button>
                  <select
                    id="select-override-right"
                    value={studyData.classifications.right.confirmed}
                    onChange={(e) => onConfirmClassification('right', e.target.value)}
                    className="bg-[#0f172a] border border-slate-700 rounded px-2 text-[10px] text-slate-200 focus:outline-none"
                  >
                    <option value="Not Classified">Manual Override...</option>
                    {options.map(o => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Core Velocity Metrics */}
            <div className="grid grid-cols-3 gap-3 text-xs font-mono">
              <div className="bg-[#0f172a] border border-slate-800 p-3 rounded-xl print:bg-white print:border">
                <span className="text-[10px] font-bold text-slate-400 uppercase block font-sans print:text-black">Peak PSV</span>
                <span className="text-base font-black text-slate-100 print:text-black">
                  {rightSummary.highestIcaPsv !== null ? `${rightSummary.highestIcaPsv} cm/s` : '—'}
                </span>
              </div>
              <div className="bg-[#0f172a] border border-slate-800 p-3 rounded-xl print:bg-white print:border">
                <span className="text-[10px] font-bold text-slate-400 uppercase block font-sans print:text-black">ICA EDV</span>
                <span className="text-base font-black text-slate-100 print:text-black">
                  {rightSummary.correspondingIcaEdv !== null ? `${rightSummary.correspondingIcaEdv} cm/s` : '—'}
                </span>
              </div>
              <div className="bg-[#0f172a] border border-slate-800 p-3 rounded-xl print:bg-white print:border">
                <span className="text-[10px] font-bold text-slate-400 uppercase block font-sans print:text-black">ICA/CCA Ratio</span>
                <span className="text-base font-black text-cyan-400 print:text-black">
                  {rightSummary.icaCcaRatio !== null ? rightSummary.icaCcaRatio : '—'}
                </span>
              </div>
            </div>

            {/* Additional details */}
            <div className="bg-[#0f172a]/60 border border-slate-800 p-3.5 rounded-xl space-y-1.5 text-xs text-slate-300 print:bg-white print:border">
              <div className="flex justify-between">
                <span className="text-slate-400 print:text-black">Vertebral Flow:</span>
                <span className="font-bold uppercase text-slate-100 print:text-black">{rightSummary.vertebralFlowDirection}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 print:text-black">Subclavian Artery:</span>
                <span className="text-slate-200 print:text-black">{rightSummary.subclavianFindings}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 print:text-black">Plaque Burden:</span>
                <span className="text-slate-200 print:text-black">{rightSummary.maxPlaqueLocation || 'None'}</span>
              </div>
            </div>
          </div>

          {/* ================= LEFT SIDE REPORT ================= */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 print:border-black">
              <span className="text-xs font-black uppercase text-slate-100 flex items-center gap-1.5 print:text-black">
                <ChevronRight className="w-4 h-4 text-cyan-400 print:hidden" /> Left Carotid System
              </span>
            </div>

            {/* Suggested & Confirmed Grade */}
            <div className="bg-[#0f172a] border border-slate-800 p-4 rounded-xl space-y-3 print:bg-white print:border print:border-gray-300">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block print:text-black">Suggested Grade</span>
                  <span className="text-sm font-black text-cyan-400 block mt-0.5 print:text-black">{leftSummary.suggestedClassification}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block print:text-black">Confirmed Grade</span>
                  <span className="text-sm font-black text-emerald-400 block mt-0.5 print:text-black">{leftSummary.confirmedClassification}</span>
                </div>
              </div>

              <div className="bg-[#0b101f] border border-slate-800 p-2.5 rounded-lg flex flex-col gap-2 print:hidden">
                <span className="text-[9px] font-bold text-slate-400 uppercase">Confirm or Override Stenosis Grade</span>
                <div className="flex gap-2">
                  <button
                    id="btn-confirm-left"
                    onClick={() => onConfirmClassification('left', leftSummary.suggestedClassification)}
                    className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-[10px] rounded transition-all cursor-pointer"
                  >
                    Confirm Suggested
                  </button>
                  <select
                    id="select-override-left"
                    value={studyData.classifications.left.confirmed}
                    onChange={(e) => onConfirmClassification('left', e.target.value)}
                    className="bg-[#0f172a] border border-slate-700 rounded px-2 text-[10px] text-slate-200 focus:outline-none"
                  >
                    <option value="Not Classified">Manual Override...</option>
                    {options.map(o => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Core Velocity Metrics */}
            <div className="grid grid-cols-3 gap-3 text-xs font-mono">
              <div className="bg-[#0f172a] border border-slate-800 p-3 rounded-xl print:bg-white print:border">
                <span className="text-[10px] font-bold text-slate-400 uppercase block font-sans print:text-black">Peak PSV</span>
                <span className="text-base font-black text-slate-100 print:text-black">
                  {leftSummary.highestIcaPsv !== null ? `${leftSummary.highestIcaPsv} cm/s` : '—'}
                </span>
              </div>
              <div className="bg-[#0f172a] border border-slate-800 p-3 rounded-xl print:bg-white print:border">
                <span className="text-[10px] font-bold text-slate-400 uppercase block font-sans print:text-black">ICA EDV</span>
                <span className="text-base font-black text-slate-100 print:text-black">
                  {leftSummary.correspondingIcaEdv !== null ? `${leftSummary.correspondingIcaEdv} cm/s` : '—'}
                </span>
              </div>
              <div className="bg-[#0f172a] border border-slate-800 p-3 rounded-xl print:bg-white print:border">
                <span className="text-[10px] font-bold text-slate-400 uppercase block font-sans print:text-black">ICA/CCA Ratio</span>
                <span className="text-base font-black text-cyan-400 print:text-black">
                  {leftSummary.icaCcaRatio !== null ? leftSummary.icaCcaRatio : '—'}
                </span>
              </div>
            </div>

            {/* Additional details */}
            <div className="bg-[#0f172a]/60 border border-slate-800 p-3.5 rounded-xl space-y-1.5 text-xs text-slate-300 print:bg-white print:border">
              <div className="flex justify-between">
                <span className="text-slate-400 print:text-black">Vertebral Flow:</span>
                <span className="font-bold uppercase text-slate-100 print:text-black">{leftSummary.vertebralFlowDirection}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 print:text-black">Subclavian Artery:</span>
                <span className="text-slate-200 print:text-black">{leftSummary.subclavianFindings}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 print:text-black">Plaque Burden:</span>
                <span className="text-slate-200 print:text-black">{leftSummary.maxPlaqueLocation || 'None'}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Detailed Vessel Matrix Table */}
        <div className="p-6 space-y-3">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block print:text-black">
            Comprehensive Segment Measurements Matrix
          </span>
          <div className="border border-slate-800 rounded-xl overflow-hidden overflow-x-auto bg-[#0f172a] print:bg-white print:border print:border-black">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#080d19] text-slate-300 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800 print:bg-gray-100 print:text-black print:border-black">
                  <th className="p-3">Arterial Segment</th>
                  <th className="p-3">Side</th>
                  <th className="p-3 font-mono">PSV (cm/s)</th>
                  <th className="p-3 font-mono">EDV (cm/s)</th>
                  <th className="p-3">Flow Direction</th>
                  <th className="p-3">Waveform</th>
                  <th className="p-3">Wall Findings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium text-slate-300 print:text-black print:divide-gray-300">
                {Object.keys(studyData.segments).map(id => {
                  const s = studyData.segments[id];
                  const meta = SEGMENTS_META[id];
                  if (!meta) return null;
                  if (id === 'arch') return null;
                  if (id.startsWith('l_bct_') && !studyData.variantLeftBct) return null;

                  const paths: string[] = [];
                  if (s.stenosisPresent) paths.push('Stenosis');
                  if (s.plaquePresent) paths.push('Plaque');
                  if (s.intimalThickening) paths.push('Thickened IMT');

                  return (
                    <tr key={id} className="hover:bg-slate-800/30">
                      <td className="p-3 font-semibold text-slate-100 print:text-black">{meta.name}</td>
                      <td className="p-3 capitalize">{s.side}</td>
                      <td className="p-3 font-mono font-bold">{s.psv !== null ? s.psv : '—'}</td>
                      <td className="p-3 font-mono">{s.edv !== null ? s.edv : '—'}</td>
                      <td className="p-3 uppercase text-[10px]">{s.flowDirection}</td>
                      <td className="p-3 italic text-slate-400 print:text-black">{s.waveform}</td>
                      <td className="p-3">
                        {paths.length > 0 ? (
                          <div className="flex gap-1 flex-wrap">
                            {paths.map(p => (
                              <span key={p} className="px-1.5 py-0.5 rounded text-[8.5px] font-bold bg-slate-800 text-slate-300 border border-slate-700 print:bg-gray-200 print:text-black">
                                {p}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-500 italic print:text-black">Normal</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Narrative Comments */}
        <div className="p-6 border-t border-slate-800 bg-[#0f172a]/60 space-y-2 print:bg-white print:border-t print:border-black">
          <label className="block text-[10px] font-bold text-slate-400 uppercase print:text-black">
            Sonographer & Physician Conclusions / Custom Notes
          </label>
          <textarea
            id="report-narrative-comments"
            placeholder="Type comprehensive conclusions, diagnostic recommendations, and technical caveats..."
            value={studyData.studyComments}
            onChange={(e) => onUpdateStudy({ studyComments: e.target.value })}
            className="w-full h-24 bg-[#0b101f] border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none print:hidden"
          />
          <div className="hidden print:block text-xs font-mono text-black whitespace-pre-wrap">
            {studyData.studyComments || 'No additional comments.'}
          </div>
        </div>

      </div>
    </div>
  );
};
