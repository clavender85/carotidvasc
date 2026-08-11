import React from 'react';
import { StudyData, SideSummary } from '../types';
import { generateSideSummary, checkCcaSuitability } from '../utils/calculations';
import { SEGMENTS_META } from '../constants';
import { FileText, Copy, Printer, Check, Clipboard, RefreshCw, AlertTriangle, ChevronRight } from 'lucide-react';

interface ClinicalReportProps {
  studyData: StudyData;
  onConfirmClassification: (side: 'right' | 'left', category: string) => void;
  onResetAll: () => void;
}

export const ClinicalReport: React.FC<ClinicalReportProps> = ({
  studyData,
  onConfirmClassification,
  onResetAll,
}) => {
  const rightSummary = generateSideSummary('right', studyData);
  const leftSummary = generateSideSummary('left', studyData);

  const [copied, setCopied] = React.useState(false);

  // Quick categories for manual override dropdown list
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
    } else if (studyData.classificationSystem === 'MODIFIED_SRU_2021') {
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

  // Generate plain text version for copy to clipboard
  const generatePlainTextReport = (): string => {
    const r = rightSummary;
    const l = leftSummary;
    
    let text = `==================================================================\n`;
    text += `CAROTID ULTRASOUND WORKSHEET & CLINICAL REPORT\n`;
    text += `==================================================================\n\n`;
    
    text += `PATIENT & EXAM DETAILS\n`;
    text += `------------------------------------------------------------------\n`;
    text += `Patient Name: ${studyData.patientName || 'Not entered'}\n`;
    text += `Patient ID/MRN: ${studyData.patientId || 'Not entered'}\n`;
    text += `Exam Date: ${studyData.examDate}\n`;
    text += `Sonographer: ${studyData.sonographer || 'Not entered'}\n`;
    text += `Interpreting Physician: ${studyData.interpretingPhysician || 'Not entered'}\n`;
    text += `Classification Protocol: ${studyData.classificationSystem.replace('_', ' ')}\n\n`;

    text += `CLINICAL IMPRESSION SUMMARY\n`;
    text += `------------------------------------------------------------------\n`;
    text += `RIGHT INTERNAL CAROTID ARTERY (ICA):\n`;
    text += `  - Suggested Grade: ${r.suggestedClassification}\n`;
    text += `  - Confirmed Grade: ${r.confirmedClassification}\n`;
    text += `  - Peak Stenotic PSV: ${r.highestIcaPsv !== null ? r.highestIcaPsv + ' cm/s' : 'N/A'}\n`;
    text += `  - Corresponding EDV: ${r.correspondingIcaEdv !== null ? r.correspondingIcaEdv + ' cm/s' : 'N/A'}\n`;
    text += `  - Distal CCA PSV: ${r.distalCcaPsv !== null ? r.distalCcaPsv + ' cm/s' : 'N/A'}\n`;
    text += `  - ICA/CCA PSV Ratio: ${r.icaCcaRatio !== null ? r.icaCcaRatio : 'N/A'}\n`;
    text += `  - Max Plaque Site: ${r.maxPlaqueLocation || 'None detected'}\n`;
    text += `  - Plaque Morphology: ${r.plaqueMorphology || 'N/A'}\n`;
    text += `  - NASCET Longitudinal Estimate: ${r.nascetEstimateLongitudinal !== null ? r.nascetEstimateLongitudinal + '%' : 'N/A'}\n`;
    text += `  - NASCET Transverse Estimate: ${r.nascetEstimateTransverse !== null ? r.nascetEstimateTransverse + '%' : 'N/A'}\n`;
    text += `  - Vertebral Flow Direction: ${r.vertebralFlowDirection.toUpperCase()}\n`;
    text += `  - Subclavian Findings: ${r.subclavianFindings}\n`;
    text += `  - Intima-Media Thickness (IMT): ${r.imtMm !== null ? r.imtMm + ' mm' : 'N/A'} (Cutoff: >${studyData.imtThresholdMm} mm)\n\n`;

    text += `LEFT INTERNAL CAROTID ARTERY (ICA):\n`;
    text += `  - Suggested Grade: ${l.suggestedClassification}\n`;
    text += `  - Confirmed Grade: ${l.confirmedClassification}\n`;
    text += `  - Peak Stenotic PSV: ${l.highestIcaPsv !== null ? l.highestIcaPsv + ' cm/s' : 'N/A'}\n`;
    text += `  - Corresponding EDV: ${l.correspondingIcaEdv !== null ? l.correspondingIcaEdv + ' cm/s' : 'N/A'}\n`;
    text += `  - Distal CCA PSV: ${l.distalCcaPsv !== null ? l.distalCcaPsv + ' cm/s' : 'N/A'}\n`;
    text += `  - ICA/CCA PSV Ratio: ${l.icaCcaRatio !== null ? l.icaCcaRatio : 'N/A'}\n`;
    text += `  - Max Plaque Site: ${l.maxPlaqueLocation || 'None detected'}\n`;
    text += `  - Plaque Morphology: ${l.plaqueMorphology || 'N/A'}\n`;
    text += `  - NASCET Longitudinal Estimate: ${l.nascetEstimateLongitudinal !== null ? l.nascetEstimateLongitudinal + '%' : 'N/A'}\n`;
    text += `  - NASCET Transverse Estimate: ${l.nascetEstimateTransverse !== null ? l.nascetEstimateTransverse + '%' : 'N/A'}\n`;
    text += `  - Vertebral Flow Direction: ${l.vertebralFlowDirection.toUpperCase()}\n`;
    text += `  - Subclavian Findings: ${l.subclavianFindings}\n`;
    text += `  - Intima-Media Thickness (IMT): ${l.imtMm !== null ? l.imtMm + ' mm' : 'N/A'} (Cutoff: >${studyData.imtThresholdMm} mm)\n\n`;

    if (studyData.plaques.length > 0) {
      text += `REGISTERED PLAQUE MORPHOLOGY PROFILE\n`;
      text += `------------------------------------------------------------------\n`;
      studyData.plaques.forEach((pl, idx) => {
        text += `Plaque #${idx + 1} (${pl.locationDescription}):\n`;
        text += `  - Point of Max Thickness: ${SEGMENTS_META[pl.maxPlaqueSite]?.shortName || pl.maxPlaqueSite} (${pl.maxThicknessMm !== null ? pl.maxThicknessMm + ' mm' : 'Not measured'})\n`;
        text += `  - Composition: ${pl.composition}\n`;
        text += `  - Surface Profile: ${pl.surface}\n`;
        text += `  - Calcific Shadowing: ${pl.calcificShadowing}\n`;
        text += `  - Luminal Narrowing visible: ${pl.luminalNarrowingVisible}\n`;
        if (pl.freeTextDescription) {
          text += `  - Notes: ${pl.freeTextDescription}\n`;
        }
        text += `\n`;
      });
    }

    text += `DETAILED VESSEL MEASUREMENTS MATRIX\n`;
    text += `------------------------------------------------------------------\n`;
    text += `Segment ID | Side | PSV (cm/s) | EDV (cm/s) | Flow | Waveform | Pathologies\n`;
    text += `------------------------------------------------------------------\n`;
    Object.keys(studyData.segments).forEach(id => {
      const s = studyData.segments[id];
      const m = SEGMENTS_META[id];
      if (!m) return;
      if (id.startsWith('l_bct_') && !studyData.variantLeftBct) return;
      
      const psvStr = s.psv !== null ? s.psv.toString().padStart(5) : ' N/A ';
      const edvStr = s.edv !== null ? s.edv.toString().padStart(5) : ' N/A ';
      const pathList: string[] = [];
      if (s.plaquePresent) pathList.push('Plaque');
      if (s.stenosisPresent) pathList.push('Stenosis');
      if (s.intimalThickening) pathList.push('Thickened IMT');
      const pathsStr = pathList.length > 0 ? pathList.join(', ') : 'None';

      text += `${m.shortName.padEnd(16)} | ${s.side.padEnd(6)} | ${psvStr} | ${edvStr} | ${s.flowDirection.padEnd(12)} | ${(s.waveform || 'N/A').padEnd(16)} | ${pathsStr}\n`;
    });
    
    if (studyData.studyComments) {
      text += `\nSONOGRAPHER CONCLUSION & DISCUSSION\n`;
      text += `------------------------------------------------------------------\n`;
      text += `${studyData.studyComments}\n`;
    }

    text += `\nReport compiled automatically in AI Studio on: ${new Date().toLocaleString()}\n`;
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
    <div id="clinical-report-root" className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
      
      {/* Header toolbar */}
      <div className="p-4 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-400" />
          <div>
            <h3 className="text-sm font-bold tracking-wide">Live Consolidated Clinical Report</h3>
            <span className="text-[10px] text-slate-400">Updates continuously with entered canvas values. Ready for EMR copying.</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            id="report-copy-btn"
            onClick={handleCopyToClipboard}
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-xs font-bold transition-all"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy EMR Text</span>
              </>
            )}
          </button>
          <button
            id="report-print-btn"
            onClick={handlePrint}
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-xs font-bold transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Demographics Block */}
      <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-slate-600">
        <div>
          <span className="font-bold text-slate-400 block uppercase text-[9px] mb-0.5">Patient Name</span>
          <span className="font-bold text-slate-800 text-sm">{studyData.patientName || '—'}</span>
        </div>
        <div>
          <span className="font-bold text-slate-400 block uppercase text-[9px] mb-0.5">MRID / CHART ID</span>
          <span className="font-semibold text-slate-800 font-mono text-sm">{studyData.patientId || '—'}</span>
        </div>
        <div>
          <span className="font-bold text-slate-400 block uppercase text-[9px] mb-0.5">Exam Date</span>
          <span className="font-semibold text-slate-800">{studyData.examDate}</span>
        </div>
        <div>
          <span className="font-bold text-slate-400 block uppercase text-[9px] mb-0.5">Standard Protocol</span>
          <span className="font-bold text-blue-600 uppercase text-[10px]">{studyData.classificationSystem.replace('_', ' ')}</span>
        </div>
        {studyData.sonographer && (
          <div>
            <span className="font-bold text-slate-400 block uppercase text-[9px] mb-0.5">Sonographer</span>
            <span className="font-medium text-slate-700">{studyData.sonographer}</span>
          </div>
        )}
        {studyData.interpretingPhysician && (
          <div>
            <span className="font-bold text-slate-400 block uppercase text-[9px] mb-0.5">Physician</span>
            <span className="font-medium text-slate-700">{studyData.interpretingPhysician}</span>
          </div>
        )}
      </div>

      {/* Side-by-side Classification Overrides & Summary Panels */}
      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 border-b border-slate-200">
        
        {/* ==================== RIGHT SIDE REPORT ==================== */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
              <ChevronRight className="w-4 h-4 text-blue-500" /> Right System Haemodynamics
            </span>
          </div>

          {/* ICA Classification Section */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Suggested Classification</span>
                <span className="text-sm font-extrabold text-blue-700 block mt-0.5">{rightSummary.suggestedClassification}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Confirmed Classification</span>
                <span className="text-sm font-extrabold text-emerald-700 block mt-0.5">{rightSummary.confirmedClassification}</span>
              </div>
            </div>

            <div className="bg-white border border-slate-100 p-2.5 rounded-lg flex flex-col gap-2">
              <span className="text-[9px] font-bold text-slate-400 uppercase">Confirm or Override Stenosis Grade</span>
              <div className="flex gap-2">
                <button
                  id="btn-confirm-right"
                  onClick={() => onConfirmClassification('right', rightSummary.suggestedClassification)}
                  className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded transition-all"
                >
                  Confirm Suggested ({rightSummary.suggestedClassification.split(' ')[0]})
                </button>
                <select
                  id="select-override-right"
                  value={studyData.classifications.right.confirmed}
                  onChange={(e) => onConfirmClassification('right', e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded px-2 text-[10px] focus:outline-none"
                >
                  <option value="Not Classified">Manual Override...</option>
                  {options.map(o => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Core Velocity Summaries */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-white border border-slate-100 p-3 rounded-lg">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Peak ICA PSV</span>
              <span className="font-mono text-base font-bold text-slate-800">
                {rightSummary.highestIcaPsv !== null ? `${rightSummary.highestIcaPsv} cm/s` : '—'}
              </span>
            </div>
            <div className="bg-white border border-slate-100 p-3 rounded-lg">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Corresponding EDV</span>
              <span className="font-mono text-base font-bold text-slate-800">
                {rightSummary.correspondingIcaEdv !== null ? `${rightSummary.correspondingIcaEdv} cm/s` : '—'}
              </span>
            </div>
            <div className="bg-white border border-slate-100 p-3 rounded-lg col-span-2 sm:col-span-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase">ICA/CCA Ratio</span>
                {!rCcaSuitability.suitable && rightSummary.highestIcaPsv !== null && (
                  <span className="text-amber-500" title="CCA Reference segment is abnormal. Ratio may be unreliable.">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  </span>
                )}
              </div>
              <span className="font-mono text-base font-bold text-slate-800 block">
                {rightSummary.icaCcaRatio !== null ? rightSummary.icaCcaRatio : '—'}
              </span>
            </div>
          </div>

          {/* Ratio Warning Banner */}
          {!rCcaSuitability.suitable && rightSummary.highestIcaPsv !== null && (
            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-[10px] text-amber-800 flex items-start gap-1.5 leading-normal">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">ICA/CCA ratio may be unreliable:</span> Standard CCA distal reference segment is abnormal ({rCcaSuitability.reason}).
              </div>
            </div>
          )}

          {/* Morphology Summary */}
          <div className="space-y-2 text-xs text-slate-600 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
            <div>
              <span className="font-bold text-slate-400 block uppercase text-[9px]">Max Plaque Location</span>
              <span className="font-medium text-slate-800">{rightSummary.maxPlaqueLocation || 'No plaques registered'}</span>
            </div>
            {rightSummary.plaqueMorphology && (
              <div>
                <span className="font-bold text-slate-400 block uppercase text-[9px]">Plaque Morphology</span>
                <span className="font-medium text-slate-800">{rightSummary.plaqueMorphology}</span>
              </div>
            )}
            <div>
              <span className="font-bold text-slate-400 block uppercase text-[9px]">Vertebral flow direction</span>
              <span className="font-semibold text-slate-800 uppercase">{rightSummary.vertebralFlowDirection}</span>
            </div>
            <div>
              <span className="font-bold text-slate-400 block uppercase text-[9px]">Subclavian findings</span>
              <span className="font-medium text-slate-800 leading-relaxed block">{rightSummary.subclavianFindings}</span>
            </div>
            {rightSummary.imtMm !== null && (
              <div>
                <span className="font-bold text-slate-400 block uppercase text-[9px]">Intima-Media Thickness (IMT)</span>
                <span className={`font-semibold ${rightSummary.imtMm > studyData.imtThresholdMm ? 'text-blue-600 font-bold' : 'text-slate-800'}`}>
                  {rightSummary.imtMm} mm {rightSummary.imtMm > studyData.imtThresholdMm ? '(Thickened / Increased)' : '(Normal)'}
                </span>
              </div>
            )}
            {(rightSummary.nascetEstimateLongitudinal !== null || rightSummary.nascetEstimateTransverse !== null) && (
              <div className="border-t border-slate-200/60 pt-2 grid grid-cols-2 gap-2">
                {rightSummary.nascetEstimateLongitudinal !== null && (
                  <div>
                    <span className="font-bold text-slate-400 block uppercase text-[9px]">NASCET Longitudinal</span>
                    <span className="font-mono font-bold text-slate-800 text-[11px]">{rightSummary.nascetEstimateLongitudinal}% diameter reduction</span>
                  </div>
                )}
                {rightSummary.nascetEstimateTransverse !== null && (
                  <div>
                    <span className="font-bold text-slate-400 block uppercase text-[9px]">NASCET Transverse</span>
                    <span className="font-mono font-bold text-slate-800 text-[11px]">{rightSummary.nascetEstimateTransverse}% diameter reduction</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ==================== LEFT SIDE REPORT ==================== */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
              <ChevronRight className="w-4 h-4 text-blue-500" /> Left System Haemodynamics
            </span>
          </div>

          {/* ICA Classification Section */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Suggested Classification</span>
                <span className="text-sm font-extrabold text-blue-700 block mt-0.5">{leftSummary.suggestedClassification}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Confirmed Classification</span>
                <span className="text-sm font-extrabold text-emerald-700 block mt-0.5">{leftSummary.confirmedClassification}</span>
              </div>
            </div>

            <div className="bg-white border border-slate-100 p-2.5 rounded-lg flex flex-col gap-2">
              <span className="text-[9px] font-bold text-slate-400 uppercase">Confirm or Override Stenosis Grade</span>
              <div className="flex gap-2">
                <button
                  id="btn-confirm-left"
                  onClick={() => onConfirmClassification('left', leftSummary.suggestedClassification)}
                  className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded transition-all"
                >
                  Confirm Suggested ({leftSummary.suggestedClassification.split(' ')[0]})
                </button>
                <select
                  id="select-override-left"
                  value={studyData.classifications.left.confirmed}
                  onChange={(e) => onConfirmClassification('left', e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded px-2 text-[10px] focus:outline-none"
                >
                  <option value="Not Classified">Manual Override...</option>
                  {options.map(o => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Core Velocity Summaries */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-white border border-slate-100 p-3 rounded-lg">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Peak ICA PSV</span>
              <span className="font-mono text-base font-bold text-slate-800">
                {leftSummary.highestIcaPsv !== null ? `${leftSummary.highestIcaPsv} cm/s` : '—'}
              </span>
            </div>
            <div className="bg-white border border-slate-100 p-3 rounded-lg">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Corresponding EDV</span>
              <span className="font-mono text-base font-bold text-slate-800">
                {leftSummary.correspondingIcaEdv !== null ? `${leftSummary.correspondingIcaEdv} cm/s` : '—'}
              </span>
            </div>
            <div className="bg-white border border-slate-100 p-3 rounded-lg col-span-2 sm:col-span-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase">ICA/CCA Ratio</span>
                {!lCcaSuitability.suitable && leftSummary.highestIcaPsv !== null && (
                  <span className="text-amber-500" title="CCA Reference segment is abnormal. Ratio may be unreliable.">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  </span>
                )}
              </div>
              <span className="font-mono text-base font-bold text-slate-800 block">
                {leftSummary.icaCcaRatio !== null ? leftSummary.icaCcaRatio : '—'}
              </span>
            </div>
          </div>

          {/* Ratio Warning Banner */}
          {!lCcaSuitability.suitable && leftSummary.highestIcaPsv !== null && (
            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-[10px] text-amber-800 flex items-start gap-1.5 leading-normal">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">ICA/CCA ratio may be unreliable:</span> Standard CCA distal reference segment is abnormal ({lCcaSuitability.reason}).
              </div>
            </div>
          )}

          {/* Morphology Summary */}
          <div className="space-y-2 text-xs text-slate-600 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
            <div>
              <span className="font-bold text-slate-400 block uppercase text-[9px]">Max Plaque Location</span>
              <span className="font-medium text-slate-800">{leftSummary.maxPlaqueLocation || 'No plaques registered'}</span>
            </div>
            {leftSummary.plaqueMorphology && (
              <div>
                <span className="font-bold text-slate-400 block uppercase text-[9px]">Plaque Morphology</span>
                <span className="font-medium text-slate-800">{leftSummary.plaqueMorphology}</span>
              </div>
            )}
            <div>
              <span className="font-bold text-slate-400 block uppercase text-[9px]">Vertebral flow direction</span>
              <span className="font-semibold text-slate-800 uppercase">{leftSummary.vertebralFlowDirection}</span>
            </div>
            <div>
              <span className="font-bold text-slate-400 block uppercase text-[9px]">Subclavian findings</span>
              <span className="font-medium text-slate-800 leading-relaxed block">{leftSummary.subclavianFindings}</span>
            </div>
            {leftSummary.imtMm !== null && (
              <div>
                <span className="font-bold text-slate-400 block uppercase text-[9px]">Intima-Media Thickness (IMT)</span>
                <span className={`font-semibold ${leftSummary.imtMm > studyData.imtThresholdMm ? 'text-blue-600 font-bold' : 'text-slate-800'}`}>
                  {leftSummary.imtMm} mm {leftSummary.imtMm > studyData.imtThresholdMm ? '(Thickened / Increased)' : '(Normal)'}
                </span>
              </div>
            )}
            {(leftSummary.nascetEstimateLongitudinal !== null || leftSummary.nascetEstimateTransverse !== null) && (
              <div className="border-t border-slate-200/60 pt-2 grid grid-cols-2 gap-2">
                {leftSummary.nascetEstimateLongitudinal !== null && (
                  <div>
                    <span className="font-bold text-slate-400 block uppercase text-[9px]">NASCET Longitudinal</span>
                    <span className="font-mono font-bold text-slate-800 text-[11px]">{leftSummary.nascetEstimateLongitudinal}% diameter reduction</span>
                  </div>
                )}
                {leftSummary.nascetEstimateTransverse !== null && (
                  <div>
                    <span className="font-bold text-slate-400 block uppercase text-[9px]">NASCET Transverse</span>
                    <span className="font-mono font-bold text-slate-800 text-[11px]">{leftSummary.nascetEstimateTransverse}% diameter reduction</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Comprehensive Raw Tabular Matrix of all segments */}
      <div className="p-6 space-y-3">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Comprehensive Segment Measurement Matrix</span>
        <div className="border border-slate-200 rounded-xl overflow-hidden overflow-x-auto bg-white shadow-sm">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900 text-white font-bold uppercase tracking-wider text-[10px]">
                <th className="p-3">Arterial Segment</th>
                <th className="p-3">Side</th>
                <th className="p-3 font-mono">PSV (cm/s)</th>
                <th className="p-3 font-mono">EDV (cm/s)</th>
                <th className="p-3">Flow Direction</th>
                <th className="p-3">Waveform</th>
                <th className="p-3">Wall Findings / Pathology</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {Object.keys(studyData.segments).map(id => {
                const s = studyData.segments[id];
                const meta = SEGMENTS_META[id];
                if (!meta) return null;
                if (id === 'arch') return null; // skip common root
                if (id.startsWith('l_bct_') && !studyData.variantLeftBct) return null; // hide variant

                let textClass = 'text-slate-800';
                if (s.stenosisPresent) textClass = 'text-red-600 font-bold';
                else if (s.plaquePresent) textClass = 'text-amber-700 font-bold';

                const paths: string[] = [];
                if (s.stenosisPresent) paths.push('Stenosis');
                if (s.plaquePresent) paths.push('Plaque');
                if (s.intimalThickening) paths.push('Increased IMT');

                return (
                  <tr key={id} className={`hover:bg-slate-50/50 ${textClass}`}>
                    <td className="p-3 font-semibold">{meta.name}</td>
                    <td className="p-3 capitalize">{s.side}</td>
                    <td className="p-3 font-mono">{s.psv !== null ? s.psv : '—'}</td>
                    <td className="p-3 font-mono">{s.edv !== null ? s.edv : '—'}</td>
                    <td className="p-3 uppercase font-semibold text-[10px]">
                      {s.flowDirection === 'not_assessed' ? 'Unassessed' : s.flowDirection}
                    </td>
                    <td className="p-3 italic text-slate-500">{s.waveform}</td>
                    <td className="p-3">
                      {paths.length > 0 ? (
                        <div className="flex gap-1.5 flex-wrap">
                          {s.stenosisPresent && <span className="bg-red-100 text-red-800 text-[9px] font-bold px-1.5 py-0.5 rounded border border-red-200">Stenosis</span>}
                          {s.plaquePresent && <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.5 rounded border border-amber-200">Plaque</span>}
                          {s.intimalThickening && <span className="bg-blue-100 text-blue-800 text-[9px] font-bold px-1.5 py-0.5 rounded border border-blue-200">Thickened IMT</span>}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">No abnormalities</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Narrative Comments and Manual Input Conclusion Area */}
      <div className="p-6 border-t border-slate-200 bg-slate-50 space-y-4">
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Overall Study Comments, Impression & Technical Limitations</label>
          <textarea
            id="report-narrative-comments"
            placeholder="Type comprehensive conclusions, diagnostic recommendations, and technical caveats..."
            value={studyData.studyComments}
            onChange={(e) => onResetAll ? onConfirmClassification('right', rightSummary.confirmedClassification) : null} // dummy link to update state
            className="w-full h-24 bg-white border border-slate-200 rounded-xl p-3 text-xs focus:outline-none"
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              studyData.studyComments = target.value;
            }}
          />
        </div>
      </div>
      
    </div>
  );
};
