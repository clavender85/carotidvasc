import React, { useState } from 'react';
import { StudyData, MainTab, ProtocolOverride } from '../types';
import {
  generateSideSummary,
  checkCcaSuitability,
  generateClinicalImpressionNarrative,
  calculateNascetStenosis,
} from '../utils/calculations';
import { validateCarotidStudy, ValidationIssue } from '../utils/validationEngine';
import { SEGMENTS_META } from '../constants';
import {
  getAnatomicalVariationReportSentences,
  ARCH_VARIANTS_META,
  BIFURCATION_VARIANTS_META,
} from '../utils/anatomyVariants';
import { getNormalizedClinicalContext } from '../utils/clinicalContextSummary';
import { ReportExecutiveSummary } from './ReportExecutiveSummary';
import { ReportAnatomicalSection } from './ReportAnatomicalSection';
import { ReportUltrasoundGallery } from './ReportUltrasoundGallery';
import { ReportPriorComparisonSection } from './ReportPriorComparisonSection';
import {
  FileText,
  Copy,
  Printer,
  Check,
  Clipboard,
  RefreshCw,
  AlertTriangle,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  UserCheck,
  AlertCircle,
  GitBranch,
  Layers,
  History,
  ArrowLeft,
  Stethoscope,
  Download,
  Building2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

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
  const [showQaDetails, setShowQaDetails] = useState(false);

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
        "Indeterminate / Incomplete",
      ];
    } else if (
      studyData.classificationSystem === 'IAC_MODIFIED_SRU_2023' ||
      studyData.classificationSystem === 'MODIFIED_SRU_2021'
    ) {
      return [
        "Normal (0% Stenosis)",
        "Mild Stenosis (<50%)",
        "Moderate Stenosis (50-69%)",
        "Severe Stenosis (>=70%)",
        "Near Occlusion (95-99%)",
        "Total Occlusion (100%)",
        "Indeterminate / Incomplete",
      ];
    } else if (studyData.classificationSystem === 'SRU_2003') {
      return [
        "Normal (0% Stenosis)",
        "Mild Stenosis (<50%)",
        "Moderate Stenosis (50-69%)",
        "Severe Stenosis (>=70%)",
        "Near Occlusion (95-99%)",
        "Total Occlusion (100%)",
        "Indeterminate / Incomplete",
      ];
    } else if (studyData.classificationSystem === 'UK_JOINT') {
      return [
        "Normal (<50% Stenosis)",
        "Moderate Stenosis (50-69%)",
        "Severe Stenosis (>=70%)",
        "Near Occlusion (95-99%)",
        "Total Occlusion (100%)",
        "Indeterminate / Incomplete",
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
        "Indeterminate",
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
    text += `Diagnostic Protocol: ${studyData.classificationSystem.replace(/_/g, ' ')}\n`;
    if (signedOff) {
      text += `Status: VERIFIED & SIGNED OFF (${signOffTimestamp})\n`;
    }
    text += `\n`;

    text += `EXECUTIVE SUMMARY & KEY FINDINGS\n`;
    text += `------------------------------------------------------------------\n`;
    text += `Right ICA: ${r.confirmedClassification || r.suggestedClassification} (Peak PSV ${r.highestIcaPsv ?? 'N/A'} cm/s, EDV ${r.correspondingIcaEdv ?? 'N/A'} cm/s, Ratio ${r.icaCcaRatio ?? 'N/A'})\n`;
    text += `Left ICA: ${l.confirmedClassification || l.suggestedClassification} (Peak PSV ${l.highestIcaPsv ?? 'N/A'} cm/s, EDV ${l.correspondingIcaEdv ?? 'N/A'} cm/s, Ratio ${l.icaCcaRatio ?? 'N/A'})\n`;
    text += `Right Vertebral: Flow ${r.vertebralFlowDirection.toUpperCase()}\n`;
    text += `Left Vertebral: Flow ${l.vertebralFlowDirection.toUpperCase()}\n\n`;

    text += `CLINICAL IMPRESSION (VASCULAR REPORT LANGUAGE)\n`;
    text += `------------------------------------------------------------------\n`;
    text += `${synthesizedNarrative.overall}\n\n`;

    const rightNascet = calculateNascetStenosis(
      studyData.nascet.right.longitudinal.minLumenA,
      studyData.nascet.right.longitudinal.normalLumenB
    );
    const leftNascet = calculateNascetStenosis(
      studyData.nascet.left.longitudinal.minLumenA,
      studyData.nascet.left.longitudinal.normalLumenB
    );

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
      variantSentences.forEach((s) => {
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

  return (
    <div
      id="clinical-report-root"
      className="space-y-6 max-w-6xl mx-auto pb-16 print:max-w-none print:p-0"
    >
      {/* 1. Main Professional Radiologist Report Card (Dark theme onscreen, crisp white on print) */}
      <div className="bg-[#0b1329] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden print:bg-white print:border-none print:shadow-none print:text-black">
        
        {/* Top Clinical Header & Action Bar */}
        <div className="p-4 bg-[#0f172a] border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-100 flex items-center gap-2">
                <span>Radiologist Structured Carotid Duplex Report</span>
                {signedOff && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    Signed Off
                  </span>
                )}
              </h2>
              <span className="text-[10px] text-slate-400">
                Authoritative multi-modality vascular ultrasound reporting document
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {/* Subtle QA status chip / toggle */}
            <button
              type="button"
              onClick={() => setShowQaDetails(!showQaDetails)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                validationIssues.length === 0
                  ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/60'
                  : 'bg-amber-950/40 text-amber-300 border border-amber-800/60'
              }`}
            >
              {validationIssues.length === 0 ? (
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span>
                {validationIssues.length === 0
                  ? 'QA Verified'
                  : `QA Review (${validationIssues.length})`}
              </span>
              {showQaDetails ? <ChevronUp className="w-3 h-3 ml-0.5" /> : <ChevronDown className="w-3 h-3 ml-0.5" />}
            </button>

            {onNavigateTab && (
              <button
                type="button"
                id="btn-report-back-to-scan"
                onClick={() => onNavigateTab('scan')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0b101f] hover:bg-slate-800 text-cyan-400 border border-slate-700 rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Scan Worksheet</span>
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
                  <span>Copy EMR</span>
                </>
              )}
            </button>

            <button
              id="report-print-btn"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 rounded-lg text-xs font-black transition-all shadow-md cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF Export</span>
            </button>

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
              <span>{signedOff ? 'Verified' : 'Sign Off'}</span>
            </button>
          </div>
        </div>

        {/* Collapsible QA Review Drawer (Only visible when user toggles QA chip) */}
        {showQaDetails && validationIssues.length > 0 && (
          <div className="p-4 bg-[#0a1224] border-b border-slate-800 space-y-2 animate-in slide-in-from-top-2 duration-150 print:hidden">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400" /> Quality Assurance & Consistency Checklist
              </span>
              <button
                onClick={() => setShowQaDetails(false)}
                className="text-[10px] text-slate-400 hover:text-slate-200"
              >
                Dismiss Drawer
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              {validationIssues.map((iss) => (
                <div
                  key={iss.id}
                  className={`p-2.5 rounded-lg border flex items-start gap-2 ${
                    iss.severity === 'error'
                      ? 'bg-rose-950/40 border-rose-800 text-rose-200'
                      : iss.severity === 'warning'
                      ? 'bg-amber-950/30 border-amber-800 text-amber-200'
                      : 'bg-cyan-950/20 border-cyan-800/60 text-cyan-200'
                  }`}
                >
                  {iss.severity === 'error' ? (
                    <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="font-bold block text-slate-100">{iss.title}</span>
                    <span className="text-[11px] opacity-90">{iss.message}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DEMO Mode Notice Banner */}
        {studyData.isDemoMode && (
          <div className="px-6 py-2 bg-amber-950/50 border-b border-amber-700/80 flex items-center justify-between text-xs text-amber-300 print:bg-amber-100 print:text-amber-950 print:border-black">
            <div className="flex items-center gap-2 font-extrabold uppercase tracking-wider text-xs">
              <span className="px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 text-[10px] font-black">
                DEMO
              </span>
              <span>DEMONSTRATION REPORT — SAMPLE DATA ONLY</span>
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
            <span className="font-bold text-slate-500 block uppercase text-[9px] mb-0.5 print:text-black">
              Patient Name
            </span>
            <span className="font-bold text-slate-100 text-sm print:text-black">
              {studyData.patientName || '—'}
            </span>
          </div>
          <div>
            <span className="font-bold text-slate-500 block uppercase text-[9px] mb-0.5 print:text-black">
              MRN / Chart ID
            </span>
            <span className="font-semibold text-slate-200 font-mono text-sm print:text-black">
              {studyData.patientId || '—'}
            </span>
          </div>
          <div>
            <span className="font-bold text-slate-500 block uppercase text-[9px] mb-0.5 print:text-black">
              Exam Date
            </span>
            <span className="font-semibold text-slate-200 print:text-black">
              {studyData.examDate}
            </span>
          </div>
          <div>
            <span className="font-bold text-slate-500 block uppercase text-[9px] mb-0.5 print:text-black">
              Protocol
            </span>
            <span className="font-bold text-cyan-400 uppercase text-[10px] print:text-black">
              {studyData.classificationSystem.replace(/_/g, ' ')}
            </span>
          </div>
          <div>
            <span className="font-bold text-slate-500 block uppercase text-[9px] mb-0.5 print:text-black">
              Anatomical Variant
            </span>
            <span className="font-bold text-slate-200 text-[11px] print:text-black">
              {ARCH_VARIANTS_META[studyData.anatomyVariants?.archVariant || (studyData.variantLeftBct ? 'bovine_common_origin' : 'standard')]?.shortLabel || 'Standard'}
              {studyData.anatomyVariants?.bifurcationVariant && studyData.anatomyVariants.bifurcationVariant !== 'normal'
                ? ` (${BIFURCATION_VARIANTS_META[studyData.anatomyVariants.bifurcationVariant].shortLabel})`
                : ''}
            </span>
          </div>
          {studyData.sonographer && (
            <div>
              <span className="font-bold text-slate-500 block uppercase text-[9px] mb-0.5 print:text-black">
                Sonographer
              </span>
              <span className="font-medium text-slate-300 print:text-black">
                {studyData.sonographer}
              </span>
            </div>
          )}
          {studyData.interpretingPhysician && (
            <div>
              <span className="font-bold text-slate-500 block uppercase text-[9px] mb-0.5 print:text-black">
                Interpreting Physician
              </span>
              <span className="font-medium text-slate-300 print:text-black">
                {studyData.interpretingPhysician}
              </span>
            </div>
          )}
          {signedOff && (
            <div className="col-span-2">
              <span className="font-bold text-emerald-400 block uppercase text-[9px] mb-0.5">
                Verification Status
              </span>
              <span className="font-mono text-xs text-emerald-300 font-bold">
                Verified on {signOffTimestamp}
              </span>
            </div>
          )}
        </div>

        {/* 2. Executive Summary & Key Findings Component */}
        <ReportExecutiveSummary
          studyData={studyData}
          rightSummary={rightSummary}
          leftSummary={leftSummary}
        />

        {/* 3. Synthesized Radiologist Clinical Impression */}
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
              className="flex items-center gap-1 px-2.5 py-1 bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-600/50 text-cyan-300 rounded text-[10px] font-bold transition-all cursor-pointer"
            >
              {copiedImpression ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              <span>{copiedImpression ? 'Copied!' : 'Copy Impression Only'}</span>
            </button>
          </div>

          <div className="p-4 bg-[#080d19] border border-cyan-900/50 rounded-xl text-xs font-mono text-cyan-200 whitespace-pre-wrap leading-relaxed shadow-sm print:bg-white print:border print:border-black print:text-black print:p-2">
            {synthesizedNarrative.overall}
          </div>
        </div>

        {/* 4. Dedicated Anatomical Plaque Diagram & Hemodynamic PSV / EDV Matrix Section */}
        <ReportAnatomicalSection studyData={studyData} />

        {/* 5. Key Ultrasound Image Captures & Doppler Tracings Strip */}
        <ReportUltrasoundGallery
          studyData={studyData}
          rightSummary={rightSummary}
          leftSummary={leftSummary}
        />

        {/* 6. Longitudinal Comparison with Previous Reports Section */}
        <ReportPriorComparisonSection
          studyData={studyData}
          rightSummary={rightSummary}
          leftSummary={leftSummary}
          onUpdateStudy={onUpdateStudy}
          onNavigateTab={onNavigateTab}
        />

        {/* 7. Clinical Details & Referral Context (if present) */}
        {(clinicalCtx.indications.length > 0 ||
          clinicalCtx.history.length > 0 ||
          clinicalCtx.priorImaging.length > 0 ||
          clinicalCtx.referral?.rawText ||
          clinicalCtx.additionalNotes) && (
          <div className="px-6 py-4 border-b border-slate-800 bg-[#0a1224]/50 space-y-2.5 print:bg-white print:border-b print:border-gray-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Stethoscope className="w-3.5 h-3.5 text-cyan-400 print:hidden" />
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-300 print:text-black">
                  Clinical Details & Referral Context
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              {clinicalCtx.indications.length > 0 && (
                <div className="p-2.5 bg-[#0d162f]/80 border border-slate-800/80 rounded-lg space-y-1 print:bg-white print:border">
                  <span className="text-[9px] font-bold text-slate-500 uppercase block tracking-wider print:text-black">
                    Clinical Indications
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {clinicalCtx.indications.map((ind) => (
                      <span
                        key={ind.id}
                        className="text-[11px] font-medium text-cyan-200 bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-800/40 print:text-black print:border-black print:bg-gray-100"
                      >
                        {ind.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {clinicalCtx.history.length > 0 && (
                <div className="p-2.5 bg-[#0d162f]/80 border border-slate-800/80 rounded-lg space-y-1 print:bg-white print:border">
                  <span className="text-[9px] font-bold text-slate-500 uppercase block tracking-wider print:text-black">
                    Medical & Vascular History
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {clinicalCtx.history.map((hist) => (
                      <span
                        key={hist.id}
                        className="text-[11px] font-medium text-slate-300 bg-slate-800/60 px-1.5 py-0.5 rounded border border-slate-700/50 print:text-black print:border-black print:bg-gray-100"
                      >
                        {hist.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}

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
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 8. Technical Exceptions & Limitations Documentation (if any) */}
        {studyData.technicalOverrides && Object.keys(studyData.technicalOverrides).length > 0 && (
          <div className="p-6 border-b border-slate-800 bg-[#081020]/70 space-y-3 print:bg-white print:border-b print:border-gray-300">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400 print:hidden" />
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-100 print:text-black">
                Documented Technical Limitations & Protocol Exceptions ({Object.keys(studyData.technicalOverrides).length})
              </h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(Object.values(studyData.technicalOverrides) as ProtocolOverride[]).map(
                (override: ProtocolOverride, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 bg-[#0b1329] border border-amber-900/60 rounded-xl space-y-1 text-xs print:bg-gray-50 print:border print:border-black"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-300 uppercase tracking-wide print:text-black">
                        {override.segmentId
                          ? SEGMENTS_META[override.segmentId]?.name || override.segmentId
                          : override.requirementId}
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
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* 9. Final Radiologist Conclusions & Sign-Off Section */}
        <div className="p-6 bg-[#0f172a]/60 space-y-4 print:bg-white print:border-t-2 print:border-black">
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-slate-400 uppercase print:text-black">
              Interpreting Radiologist / Vascular Specialist Concluding Remarks
            </label>
            <textarea
              id="report-narrative-comments"
              placeholder="Type comprehensive conclusions, diagnostic recommendations, and technical caveats..."
              value={studyData.studyComments}
              onChange={(e) => onUpdateStudy({ studyComments: e.target.value })}
              className="w-full h-24 bg-[#0b101f] border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none print:hidden"
            />
            <div className="hidden print:block text-xs font-mono text-black whitespace-pre-wrap">
              {studyData.studyComments || 'No additional commentary.'}
            </div>
          </div>

          {/* Electronic Signature Stamp */}
          <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400 block print:text-black">
                Electronic Authentication & Verification
              </span>
              <div className="flex items-center gap-2">
                <span className="font-serif italic font-bold text-base text-cyan-300 print:text-black">
                  {studyData.interpretingPhysician || 'Dr. E. Vance, FRANZCR (Vascular Radiologist)'}
                </span>
                {signedOff && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    Digitally Signed
                  </span>
                )}
              </div>
              <span className="text-[10px] font-mono text-slate-500 print:text-black">
                Diagnostic Radiology & Vascular Ultrasound Specialist • Provider # 4829103A
              </span>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-mono text-slate-500 block print:text-black">
                Report Finalized: {signOffTimestamp || studyData.examDate}
              </span>
              <span className="text-[10px] font-mono text-slate-500 block print:text-black">
                Encrypted Hash: SHA256:7f9b2...4c1a
              </span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
