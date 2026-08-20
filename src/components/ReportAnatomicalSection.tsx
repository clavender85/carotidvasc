import React, { useState } from 'react';
import { StudyData, SegmentData, ArchVariant, BifurcationVariant } from '../types';
import { SEGMENTS_META } from '../constants';
import { calculateIcaCcaRatio, calculateLocalPsvRatio } from '../utils/calculations';
import { Activity, Layers, Info, ArrowUp, ArrowDown, ArrowUpDown, ChevronRight, ShieldCheck, Check } from 'lucide-react';

interface ReportAnatomicalSectionProps {
  studyData: StudyData;
}

export const ReportAnatomicalSection: React.FC<ReportAnatomicalSectionProps> = ({ studyData }) => {
  const [hoveredSegmentId, setHoveredSegmentId] = useState<string | null>(null);

  const isBovine = studyData.anatomyVariants?.archVariant === 'bovine_common_origin' || studyData.variantLeftBct;
  const isSeparateRcca = studyData.anatomyVariants?.archVariant === 'separate_rcca_and_rsa';
  const isLeftVertArch = studyData.anatomyVariants?.archVariant === 'left_vertebral_from_arch';

  // Helper to color segment based on velocity / stenosis
  const getSegmentColor = (id: string) => {
    const s = studyData.segments[id];
    if (!s) return '#334155'; // slate-700
    if (s.flowDirection === 'retrograde') return '#ef4444'; // red-500
    if (s.flowDirection === 'bidirectional') return '#f59e0b'; // amber-500
    if (s.stenosisPresent || (s.psv && s.psv >= 230)) return '#ef4444'; // severe stenosis
    if (s.psv && s.psv >= 125) return '#f59e0b'; // moderate stenosis
    if (s.plaquePresent || s.intimalThickening) return '#06b6d4'; // mild/plaque (cyan)
    if (s.psv && s.psv > 0) return '#38bdf8'; // normal flow (sky)
    return '#475569'; // unassessed (slate-600)
  };

  const getPlaqueForSegment = (id: string) => {
    return studyData.plaques.find(p => p.segments.includes(id) || p.maxPlaqueSite === id);
  };

  const rightSegmentList = [
    { id: 'r_cca_prox', label: 'Right CCA (Proximal)' },
    { id: 'r_cca_mid', label: 'Right CCA (Mid)' },
    { id: 'r_cca_dist', label: 'Right CCA (Distal - Ref)' },
    { id: 'r_bulb', label: 'Right Carotid Bulb' },
    { id: 'r_ica_prox', label: 'Right ICA (Proximal)' },
    { id: 'r_ica_mid', label: 'Right ICA (Mid)' },
    { id: 'r_ica_dist', label: 'Right ICA (Distal)' },
    { id: 'r_eca', label: 'Right ECA' },
    { id: 'r_vert', label: 'Right Vertebral' },
    { id: 'r_subclavian', label: 'Right Subclavian' },
  ];

  const leftSegmentList = [
    ...(isBovine ? [{ id: 'l_bct_stem', label: 'Left Common Trunk (Bovine)' }] : []),
    { id: 'l_cca_prox', label: 'Left CCA (Proximal)' },
    { id: 'l_cca_mid', label: 'Left CCA (Mid)' },
    { id: 'l_cca_dist', label: 'Left CCA (Distal - Ref)' },
    { id: 'l_bulb', label: 'Left Carotid Bulb' },
    { id: 'l_ica_prox', label: 'Left ICA (Proximal)' },
    { id: 'l_ica_mid', label: 'Left ICA (Mid)' },
    { id: 'l_ica_dist', label: 'Left ICA (Distal)' },
    { id: 'l_eca', label: 'Left ECA' },
    { id: 'l_vert', label: 'Left Vertebral' },
    { id: 'l_subclavian', label: 'Left Subclavian' },
  ];

  return (
    <div className="p-6 border-b border-slate-800 bg-[#091122]/90 space-y-5 print:bg-white print:border-b-2 print:border-black">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400 print:hidden" />
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-100 print:text-black">
            Vascular Anatomical Diagram & Hemodynamic PSV / EDV Matrix
          </h3>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono print:text-black">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block"></span> Normal / Flow
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span> Moderate (≥125 cm/s)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span> Severe / Stenosis (≥230 cm/s)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-amber-300 inline-block"></span> Plaque Placed
          </span>
        </div>
      </div>

      {/* Grid: Anatomical Map (Left 5 cols) + Hemodynamic Table (Right 7 cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* ================= 1. SVG ANATOMICAL CAROTID MAP ================= */}
        <div className="xl:col-span-5 bg-[#060b17] border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center relative overflow-hidden shadow-lg print:bg-white print:border print:border-black">
          <div className="w-full flex items-center justify-between mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider print:text-black">
            <span>Anatomical Plaque & Flow Map</span>
            <span className="text-cyan-400 font-mono text-[9px]">
              {isBovine ? 'Bovine Arch Variant' : 'Standard Arch'}
            </span>
          </div>

          <svg
            viewBox="80 0 740 640"
            className="w-full h-auto max-h-[500px] select-none"
          >
            <defs>
              {/* Plaque Pattern */}
              <pattern id="report-plaque-calc" width="8" height="8" patternUnits="userSpaceOnUse">
                <rect width="8" height="8" fill="#fbbf24" />
                <circle cx="4" cy="4" r="1.5" fill="#78350f" />
              </pattern>
              <pattern id="report-plaque-lipid" width="6" height="6" patternUnits="userSpaceOnUse">
                <rect width="6" height="6" fill="#fef08a" />
                <path d="M 0 3 L 6 3" stroke="#d97706" strokeWidth="1" />
              </pattern>

              {/* Glow filter */}
              <filter id="report-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Background Grid Accent */}
            <g stroke="#1e293b" strokeWidth="0.5" opacity="0.3">
              <line x1="100" y1="100" x2="800" y2="100" />
              <line x1="100" y1="200" x2="800" y2="200" />
              <line x1="100" y1="300" x2="800" y2="300" />
              <line x1="100" y1="400" x2="800" y2="400" />
              <line x1="100" y1="500" x2="800" y2="500" />
              <line x1="450" y1="50" x2="450" y2="600" strokeDasharray="4 4" />
            </g>

            {/* Aortic Arch Base */}
            <path
              d="M 230 580 C 230 490, 670 490, 670 580"
              fill="none"
              stroke="#e11d48"
              strokeWidth="28"
              strokeLinecap="round"
            />
            <text x="450" y="545" fill="#f43f5e" fontSize="11" fontWeight="bold" textAnchor="middle" letterSpacing="2">
              AORTIC ARCH
            </text>

            {/* ================= RIGHT VASCULAR TREE ================= */}
            {/* Right Innominate Trunk (BCT) */}
            <path
              d="M 330 515 C 320 480, 290 450, 270 420"
              fill="none"
              stroke={getSegmentColor('r_bct')}
              strokeWidth="22"
              strokeLinecap="round"
            />

            {/* Right Subclavian */}
            <path
              d="M 270 420 C 240 400, 170 410, 130 440"
              fill="none"
              stroke={getSegmentColor('r_subclavian')}
              strokeWidth="16"
              strokeLinecap="round"
            />
            <text x="135" y="460" fill="#94a3b8" fontSize="10" fontWeight="600">R Subclavian</text>

            {/* Right Vertebral */}
            <path
              d="M 210 408 C 210 320, 220 220, 220 120"
              fill="none"
              stroke={getSegmentColor('r_vert')}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={studyData.segments['r_vert']?.flowDirection === 'retrograde' ? '6 4' : 'none'}
            />
            <text x="210" y="105" fill="#38bdf8" fontSize="10" fontWeight="bold" textAnchor="middle">R Vertebral</text>
            {studyData.segments['r_vert']?.psv && (
              <text x="210" y="240" fill="#38bdf8" fontSize="9" fontWeight="bold" textAnchor="middle" className="font-mono">
                {studyData.segments['r_vert'].psv} cm/s
              </text>
            )}

            {/* Right CCA Trunk */}
            <path
              d="M 270 420 C 280 370, 290 320, 300 270"
              fill="none"
              stroke={getSegmentColor('r_cca_prox')}
              strokeWidth="18"
              strokeLinecap="round"
            />
            <path
              d="M 300 270 C 305 240, 310 210, 315 180"
              fill="none"
              stroke={getSegmentColor('r_cca_dist')}
              strokeWidth="18"
            />
            <text x="330" y="320" fill="#94a3b8" fontSize="10" fontWeight="bold">R CCA</text>
            {studyData.segments['r_cca_dist']?.psv && (
              <text x="335" y="235" fill="#38bdf8" fontSize="9" fontWeight="bold" className="font-mono">
                PSV: {studyData.segments['r_cca_dist'].psv}
              </text>
            )}

            {/* Right Bulb */}
            <path
              d="M 315 180 C 315 155, 305 135, 300 120"
              fill="none"
              stroke={getSegmentColor('r_bulb')}
              strokeWidth="24"
              strokeLinecap="round"
            />
            <text x="260" y="150" fill="#cbd5e1" fontSize="10" fontWeight="bold">R Bulb</text>

            {/* Right Plaque Indicator on Bulb/ICA */}
            {(studyData.segments['r_bulb']?.plaquePresent || studyData.segments['r_ica_prox']?.plaquePresent) && (
              <g>
                <ellipse cx="298" cy="130" rx="9" ry="16" fill="url(#report-plaque-calc)" stroke="#d97706" strokeWidth="1.5" />
                <text x="245" y="130" fill="#fbbf24" fontSize="9" fontWeight="extrabold">PLAQUE</text>
              </g>
            )}

            {/* Right ICA */}
            <path
              d="M 300 120 C 290 90, 285 60, 280 25"
              fill="none"
              stroke={getSegmentColor('r_ica_prox')}
              strokeWidth="14"
              strokeLinecap="round"
            />
            <text x="250" y="45" fill="#38bdf8" fontSize="11" fontWeight="extrabold" textAnchor="end">
              R ICA {studyData.segments['r_ica_prox']?.psv ? `(${studyData.segments['r_ica_prox'].psv} cm/s)` : ''}
            </text>

            {/* Right ECA */}
            <path
              d="M 322 135 C 340 100, 360 65, 375 30"
              fill="none"
              stroke={getSegmentColor('r_eca')}
              strokeWidth="11"
              strokeLinecap="round"
            />
            <text x="385" y="45" fill="#94a3b8" fontSize="10" fontWeight="600">R ECA</text>

            {/* ================= LEFT VASCULAR TREE ================= */}
            {/* Left CCA Origin (Bovine vs Standard) */}
            {isBovine ? (
              <path
                d="M 330 515 C 410 470, 520 400, 580 340"
                fill="none"
                stroke={getSegmentColor('l_cca_prox')}
                strokeWidth="18"
                strokeLinecap="round"
              />
            ) : (
              <path
                d="M 470 500 C 490 440, 530 380, 570 320"
                fill="none"
                stroke={getSegmentColor('l_cca_prox')}
                strokeWidth="18"
                strokeLinecap="round"
              />
            )}

            {/* Left Subclavian Origin */}
            <path
              d="M 570 515 C 620 480, 680 430, 750 440"
              fill="none"
              stroke={getSegmentColor('l_subclavian')}
              strokeWidth="16"
              strokeLinecap="round"
            />
            <text x="710" y="465" fill="#94a3b8" fontSize="10" fontWeight="600">L Subclavian</text>

            {/* Left Vertebral */}
            <path
              d="M 670 440 C 670 330, 660 220, 660 120"
              fill="none"
              stroke={getSegmentColor('l_vert')}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={studyData.segments['l_vert']?.flowDirection === 'retrograde' ? '6 4' : 'none'}
            />
            <text x="660" y="105" fill="#38bdf8" fontSize="10" fontWeight="bold" textAnchor="middle">L Vertebral</text>
            {studyData.segments['l_vert']?.psv && (
              <text x="660" y="240" fill="#38bdf8" fontSize="9" fontWeight="bold" textAnchor="middle" className="font-mono">
                {studyData.segments['l_vert'].psv} cm/s
              </text>
            )}

            {/* Left CCA Trunk */}
            <path
              d="M 570 320 C 575 270, 580 220, 585 180"
              fill="none"
              stroke={getSegmentColor('l_cca_dist')}
              strokeWidth="18"
            />
            <text x="540" y="280" fill="#94a3b8" fontSize="10" fontWeight="bold">L CCA</text>
            {studyData.segments['l_cca_dist']?.psv && (
              <text x="535" y="235" fill="#38bdf8" fontSize="9" fontWeight="bold" className="font-mono">
                PSV: {studyData.segments['l_cca_dist'].psv}
              </text>
            )}

            {/* Left Bulb */}
            <path
              d="M 585 180 C 585 155, 595 135, 600 120"
              fill="none"
              stroke={getSegmentColor('l_bulb')}
              strokeWidth="24"
              strokeLinecap="round"
            />
            <text x="620" y="150" fill="#cbd5e1" fontSize="10" fontWeight="bold">L Bulb</text>

            {/* Left Plaque Indicator on Bulb/ICA */}
            {(studyData.segments['l_bulb']?.plaquePresent || studyData.segments['l_ica_prox']?.plaquePresent) && (
              <g>
                <ellipse cx="602" cy="130" rx="9" ry="16" fill="url(#report-plaque-calc)" stroke="#d97706" strokeWidth="1.5" />
                <text x="625" y="130" fill="#fbbf24" fontSize="9" fontWeight="extrabold">PLAQUE</text>
              </g>
            )}

            {/* Left ICA */}
            <path
              d="M 600 120 C 610 90, 615 60, 620 25"
              fill="none"
              stroke={getSegmentColor('l_ica_prox')}
              strokeWidth="14"
              strokeLinecap="round"
            />
            <text x="635" y="45" fill="#38bdf8" fontSize="11" fontWeight="extrabold">
              L ICA {studyData.segments['l_ica_prox']?.psv ? `(${studyData.segments['l_ica_prox'].psv} cm/s)` : ''}
            </text>

            {/* Left ECA */}
            <path
              d="M 578 135 C 560 100, 540 65, 525 30"
              fill="none"
              stroke={getSegmentColor('l_eca')}
              strokeWidth="11"
              strokeLinecap="round"
            />
            <text x="480" y="45" fill="#94a3b8" fontSize="10" fontWeight="600">L ECA</text>
          </svg>
        </div>

        {/* ================= 2. COMPLETE HEMODYNAMIC PSV/EDV TABLE ================= */}
        <div className="xl:col-span-7 space-y-4">
          
          {/* Dual Carotid Table (Right & Left) */}
          <div className="border border-slate-800 rounded-xl overflow-hidden bg-[#0a1224] print:bg-white print:border print:border-black">
            <div className="bg-[#0f172a] px-4 py-2.5 border-b border-slate-800 flex items-center justify-between print:bg-gray-100 print:text-black">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-200 print:text-black">
                Comprehensive Hemodynamic Velocities Matrix
              </span>
              <span className="text-[10px] text-slate-400 font-mono print:text-black">Units: cm/s</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#060b17] text-slate-400 font-bold uppercase tracking-wider text-[9px] border-b border-slate-800 print:bg-gray-50 print:text-black">
                    <th className="py-2.5 px-3">Segment</th>
                    <th className="py-2.5 px-2 font-mono text-right">PSV</th>
                    <th className="py-2.5 px-2 font-mono text-right">EDV</th>
                    <th className="py-2.5 px-2">Flow Dir</th>
                    <th className="py-2.5 px-2">Waveform</th>
                    <th className="py-2.5 px-3">Wall / Plaque</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium text-slate-300 print:text-black print:divide-gray-200">
                  
                  {/* Right System Header */}
                  <tr className="bg-slate-900/90 text-cyan-400 font-black text-[10px] uppercase tracking-wider print:bg-gray-200 print:text-black">
                    <td colSpan={6} className="py-1.5 px-3">
                      Right Carotid Arterial System
                    </td>
                  </tr>

                  {rightSegmentList.map(item => {
                    const s = studyData.segments[item.id];
                    if (!s) return null;
                    const plaque = getPlaqueForSegment(item.id);
                    const isElevated = s.psv && s.psv >= 125;
                    const isSevere = s.psv && s.psv >= 230;

                    return (
                      <tr
                        key={item.id}
                        onMouseEnter={() => setHoveredSegmentId(item.id)}
                        onMouseLeave={() => setHoveredSegmentId(null)}
                        className={`hover:bg-slate-800/40 transition-colors ${
                          hoveredSegmentId === item.id ? 'bg-cyan-950/30' : ''
                        }`}
                      >
                        <td className="py-2 px-3 font-semibold text-slate-200 print:text-black">
                          {item.label}
                        </td>
                        <td className={`py-2 px-2 font-mono text-right font-bold ${
                          isSevere ? 'text-rose-400 font-black' : isElevated ? 'text-amber-400' : 'text-slate-100 print:text-black'
                        }`}>
                          {s.psv !== null ? s.psv : '—'}
                        </td>
                        <td className="py-2 px-2 font-mono text-right text-slate-300 print:text-black">
                          {s.edv !== null ? s.edv : '—'}
                        </td>
                        <td className="py-2 px-2 uppercase text-[10px] font-mono">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            s.flowDirection === 'retrograde'
                              ? 'bg-rose-950 text-rose-300 border border-rose-800'
                              : s.flowDirection === 'bidirectional'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : 'text-slate-300'
                          }`}>
                            {s.flowDirection}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-[11px] text-slate-400 italic print:text-black">
                          {s.waveform || 'Laminar'}
                        </td>
                        <td className="py-2 px-3">
                          {s.stenosisPresent ? (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-rose-900/60 text-rose-200 border border-rose-700">
                              Stenosis ({s.psv} cm/s)
                            </span>
                          ) : s.plaquePresent ? (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-950/60 text-amber-300 border border-amber-800">
                              {plaque?.composition ? plaque.composition : 'Plaque Present'}
                            </span>
                          ) : s.intimalThickening ? (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-cyan-950/40 text-cyan-300 border border-cyan-800/40">
                              Thickened IMT
                            </span>
                          ) : (
                            <span className="text-slate-500 text-[11px] italic print:text-black">Normal / Smooth</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}

                  {/* Left System Header */}
                  <tr className="bg-slate-900/90 text-cyan-400 font-black text-[10px] uppercase tracking-wider print:bg-gray-200 print:text-black">
                    <td colSpan={6} className="py-1.5 px-3">
                      Left Carotid Arterial System
                    </td>
                  </tr>

                  {leftSegmentList.map(item => {
                    const s = studyData.segments[item.id];
                    if (!s) return null;
                    const plaque = getPlaqueForSegment(item.id);
                    const isElevated = s.psv && s.psv >= 125;
                    const isSevere = s.psv && s.psv >= 230;

                    return (
                      <tr
                        key={item.id}
                        onMouseEnter={() => setHoveredSegmentId(item.id)}
                        onMouseLeave={() => setHoveredSegmentId(null)}
                        className={`hover:bg-slate-800/40 transition-colors ${
                          hoveredSegmentId === item.id ? 'bg-cyan-950/30' : ''
                        }`}
                      >
                        <td className="py-2 px-3 font-semibold text-slate-200 print:text-black">
                          {item.label}
                        </td>
                        <td className={`py-2 px-2 font-mono text-right font-bold ${
                          isSevere ? 'text-rose-400 font-black' : isElevated ? 'text-amber-400' : 'text-slate-100 print:text-black'
                        }`}>
                          {s.psv !== null ? s.psv : '—'}
                        </td>
                        <td className="py-2 px-2 font-mono text-right text-slate-300 print:text-black">
                          {s.edv !== null ? s.edv : '—'}
                        </td>
                        <td className="py-2 px-2 uppercase text-[10px] font-mono">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            s.flowDirection === 'retrograde'
                              ? 'bg-rose-950 text-rose-300 border border-rose-800'
                              : s.flowDirection === 'bidirectional'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : 'text-slate-300'
                          }`}>
                            {s.flowDirection}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-[11px] text-slate-400 italic print:text-black">
                          {s.waveform || 'Laminar'}
                        </td>
                        <td className="py-2 px-3">
                          {s.stenosisPresent ? (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-rose-900/60 text-rose-200 border border-rose-700">
                              Stenosis ({s.psv} cm/s)
                            </span>
                          ) : s.plaquePresent ? (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-950/60 text-amber-300 border border-amber-800">
                              {plaque?.composition ? plaque.composition : 'Plaque Present'}
                            </span>
                          ) : s.intimalThickening ? (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-cyan-950/40 text-cyan-300 border border-cyan-800/40">
                              Thickened IMT
                            </span>
                          ) : (
                            <span className="text-slate-500 text-[11px] italic print:text-black">Normal / Smooth</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}

                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
