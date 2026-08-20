import React, { useState } from 'react';
import { StudyData, SideSummary } from '../types';
import { calculateNascetStenosis } from '../utils/calculations';
import { Eye, Camera, Maximize2, X, Download, ZoomIn, Activity, Sliders, Check } from 'lucide-react';
import { RealUltrasoundCanvas } from './RealUltrasoundCanvas';

interface ReportUltrasoundGalleryProps {
  studyData: StudyData;
  rightSummary: SideSummary;
  leftSummary: SideSummary;
}

interface UltrasoundCapture {
  id: string;
  title: string;
  subTitle: string;
  findingType: 'stenosis' | 'plaque' | 'normal' | 'vertebral';
  side: 'right' | 'left' | 'bilateral';
  psvText: string;
  edvText?: string;
  caliperText?: string;
  psvVal?: number;
  edvVal?: number;
  telemetry: {
    probe: string;
    freq: string;
    gain: string;
    angle: string;
    depth: string;
    prf: string;
  };
  sonographerNote: string;
}

export const ReportUltrasoundGallery: React.FC<ReportUltrasoundGalleryProps> = ({
  studyData,
  rightSummary,
  leftSummary,
}) => {
  const [selectedCaptureId, setSelectedCaptureId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'standard' | 'sepia' | 'inverted'>('standard');

  const rPsv = rightSummary.highestIcaPsv || 290;
  const rEdv = rightSummary.correspondingIcaEdv || 92;
  const lPsv = leftSummary.highestIcaPsv || 82;
  const lEdv = leftSummary.correspondingIcaEdv || 24;

  const rightNascet = calculateNascetStenosis(
    studyData.nascet.right.longitudinal.minLumenA,
    studyData.nascet.right.longitudinal.normalLumenB
  ) || 69;

  const captures: UltrasoundCapture[] = [
    {
      id: 'img_r_ica_stenosis',
      title: 'Right ICA Stenosis Jet & Spectral Doppler',
      subTitle: 'Longitudinal Color & Spectral Doppler with Angle Correction',
      findingType: 'stenosis',
      side: 'right',
      psvText: `PSV ${rPsv} cm/s`,
      edvText: `EDV ${rEdv} cm/s`,
      psvVal: rPsv,
      edvVal: rEdv,
      telemetry: {
        probe: '9L-D Linear Matrix',
        freq: '7.5 MHz',
        gain: '54 dB',
        angle: '60°',
        depth: '3.5 cm',
        prf: '6.5 kHz',
      },
      sonographerNote: `Longitudinal duplex capture at the right proximal ICA stenosis. Color Doppler shows high-velocity aliasing jet and post-stenotic turbulence. Spectral Doppler tracing records peak systolic velocity of ${rPsv} cm/s and end diastolic velocity of ${rEdv} cm/s.`,
    },
    {
      id: 'img_bulb_plaque_calipers',
      title: 'Carotid Bulb Plaque & NASCET Calipers',
      subTitle: 'High-Resolution B-Mode Grayscale & Caliper Measurements',
      findingType: 'plaque',
      side: 'right',
      caliperText: `D1: 2.1mm | D2: 6.8mm (${rightNascet}% NASCET)`,
      psvText: 'B-Mode Plaque',
      telemetry: {
        probe: '9L-D Linear Matrix',
        freq: '9.0 MHz',
        gain: '58 dB',
        angle: '0°',
        depth: '3.0 cm',
        prf: 'N/A',
      },
      sonographerNote: `B-mode longitudinal magnification of the carotid bifurcation. Prominent heterogeneous calcified plaque with posterior acoustic shadowing is identified along the posterior and lateral walls, causing luminal diameter reduction of ${rightNascet}%.`,
    },
    {
      id: 'img_l_bifurcation_normal',
      title: 'Left Carotid Bifurcation & Reference Lumen',
      subTitle: 'Longitudinal Color Flow & Laminar Envelope',
      findingType: 'normal',
      side: 'left',
      psvText: `PSV ${lPsv} cm/s`,
      edvText: `EDV ${lEdv} cm/s`,
      psvVal: lPsv,
      edvVal: lEdv,
      telemetry: {
        probe: '9L-D Linear Matrix',
        freq: '7.5 MHz',
        gain: '50 dB',
        angle: '60°',
        depth: '3.5 cm',
        prf: '3.2 kHz',
      },
      sonographerNote: `Left common and internal carotid artery bifurcation demonstrating normal intimal contour, absence of flow-limiting plaque, and normal low-resistance spectral waveform envelope (PSV ${lPsv} cm/s).`,
    },
    {
      id: 'img_vertebral_waveform',
      title: 'Vertebral Artery Pulsed Wave Duplex',
      subTitle: 'Intertransverse Space (V2 Segment) Spectral Tracing',
      findingType: 'vertebral',
      side: 'bilateral',
      psvText: 'Antegrade Flow (PSV 48 cm/s)',
      psvVal: 48,
      edvVal: 16,
      telemetry: {
        probe: '9L-D Linear Matrix',
        freq: '5.0 MHz',
        gain: '56 dB',
        angle: '60°',
        depth: '4.5 cm',
        prf: '2.5 kHz',
      },
      sonographerNote: `Vertebral artery imaged between the transverse processes of the cervical vertebrae. Demonstrates normal forward antegrade low-resistance flow throughout systole and diastole without evidence of subclavian steal physiology.`,
    },
  ];

  const activeCapture = captures.find(c => c.id === selectedCaptureId) || null;

  return (
    <div className="p-6 border-b border-slate-800 bg-[#0a1224] space-y-4 print:bg-white print:border-b-2 print:border-black">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-cyan-400 print:hidden" />
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-100 print:text-black">
            Key Diagnostic Ultrasound Image Captures & Doppler Tracings
          </h3>
        </div>
        <span className="text-[10px] text-slate-400 font-mono hidden sm:inline print:text-black">
          Standard Diagnostic Image Strip (Click image to inspect telemetry & calipers)
        </span>
      </div>

      {/* 4-Image Grid Gallery */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {captures.map((capture, idx) => (
          <div
            key={capture.id}
            onClick={() => setSelectedCaptureId(capture.id)}
            className="group bg-[#060b17] border border-slate-800 hover:border-cyan-500/80 rounded-xl overflow-hidden shadow-md hover:shadow-cyan-950/40 transition-all cursor-pointer flex flex-col print:bg-white print:border print:border-black"
          >
            {/* Ultrasound Screen Header Overlay */}
            <div className="bg-[#0b101f] px-3 py-1.5 border-b border-slate-800 flex items-center justify-between text-[9px] font-mono text-slate-400 print:bg-gray-100 print:text-black">
              <span className="font-bold text-cyan-400 print:text-black">FIG {idx + 1}</span>
              <span className="truncate max-w-[120px] text-slate-300 print:text-black">{capture.telemetry.probe}</span>
              <Maximize2 className="w-3 h-3 text-slate-500 group-hover:text-cyan-400 transition-colors print:hidden" />
            </div>

            {/* Authentic Clinical Ultrasound Display */}
            <div className="relative aspect-[4/3] bg-[#02050b] overflow-hidden flex items-center justify-center border-b border-slate-800">
              <RealUltrasoundCanvas
                type={capture.findingType}
                psv={capture.psvVal || (capture.findingType === 'stenosis' ? rPsv : capture.findingType === 'normal' ? lPsv : 48)}
                edv={capture.edvVal || (capture.findingType === 'stenosis' ? rEdv : capture.findingType === 'normal' ? lEdv : 16)}
                caliperD1={2.1}
                caliperD2={6.8}
                nascetPct={rightNascet}
                patientName={studyData.patientName || 'DOE, J.'}
                examDate={studyData.examDate || '2026-08-19'}
                width={400}
                height={300}
                className="w-full h-full object-cover"
              />

              {/* Doppler Overlay Chips on Thumbnail */}
              <div className="absolute top-2 right-2 bg-slate-950/85 backdrop-blur-sm border border-slate-700/80 px-2 py-0.5 rounded text-[9px] font-mono text-cyan-300 font-bold shadow">
                {capture.psvText}
              </div>
            </div>

            {/* Card Caption & Meta */}
            <div className="p-3 bg-[#0a1224] flex-1 flex flex-col justify-between space-y-1.5 print:bg-white">
              <div>
                <h5 className="text-[11px] font-bold text-slate-200 group-hover:text-cyan-300 transition-colors leading-snug print:text-black">
                  {capture.title}
                </h5>
                <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5 print:text-black">
                  {capture.subTitle}
                </p>
              </div>
              
              <div className="pt-1 border-t border-slate-800/80 flex items-center justify-between text-[9px] text-slate-400 font-mono print:border-gray-300 print:text-black">
                <span>Angle {capture.telemetry.angle}</span>
                <span className="text-cyan-400 font-bold print:text-black">Click to Expand</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ================= LIGHTBOX MODAL ================= */}
      {activeCapture && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 print:hidden">
          <div className="bg-[#0b1329] border border-slate-700 rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-[#0f172a] border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Camera className="w-5 h-5 text-cyan-400" />
                <div>
                  <h4 className="text-sm font-black text-slate-100 uppercase tracking-wide">
                    {activeCapture.title}
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    {activeCapture.subTitle}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Palette Filter Toggle */}
                <div className="flex items-center bg-[#080d1a] border border-slate-700 rounded-lg p-0.5 text-[10px] font-bold text-slate-300">
                  <button
                    onClick={() => setActiveFilter('standard')}
                    className={`px-2 py-1 rounded cursor-pointer ${activeFilter === 'standard' ? 'bg-cyan-600 text-white font-black' : 'hover:text-white'}`}
                  >
                    Color Duplex
                  </button>
                  <button
                    onClick={() => setActiveFilter('sepia')}
                    className={`px-2 py-1 rounded cursor-pointer ${activeFilter === 'sepia' ? 'bg-amber-600 text-white font-black' : 'hover:text-white'}`}
                  >
                    High Contrast
                  </button>
                  <button
                    onClick={() => setActiveFilter('inverted')}
                    className={`px-2 py-1 rounded cursor-pointer ${activeFilter === 'inverted' ? 'bg-slate-700 text-white font-black' : 'hover:text-white'}`}
                  >
                    B-Mode Grayscale
                  </button>
                </div>

                <button
                  onClick={() => setSelectedCaptureId(null)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: Large Image & Telemetry Bar */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
              
              {/* Main Ultrasound Screen */}
              <div className="md:col-span-8 bg-[#02050b] p-6 flex flex-col items-center justify-center relative min-h-[380px]">
                
                {/* Display Top Telemetry Stamp */}
                <div className="w-full flex items-center justify-between text-[10px] font-mono text-cyan-300/80 mb-2 border-b border-slate-800/80 pb-1">
                  <span>GE LOGIQ E10 • VASCULAR DUPLEX SCANNER</span>
                  <span>{studyData.patientName || 'PATIENT, SAMPLE'} • {studyData.examDate}</span>
                  <span>TIS: 0.4 TIB: 0.4</span>
                </div>

                {/* Main Authentic Ultrasound Canvas Render Area with chosen filter */}
                <div className="w-full max-w-xl aspect-[4/3] bg-[#02050b] rounded-lg border border-slate-800 flex items-center justify-center relative overflow-hidden shadow-2xl">
                  <RealUltrasoundCanvas
                    type={activeCapture.findingType}
                    psv={activeCapture.psvVal || (activeCapture.findingType === 'stenosis' ? rPsv : activeCapture.findingType === 'normal' ? lPsv : 48)}
                    edv={activeCapture.edvVal || (activeCapture.findingType === 'stenosis' ? rEdv : activeCapture.findingType === 'normal' ? lEdv : 16)}
                    caliperD1={2.1}
                    caliperD2={6.8}
                    nascetPct={rightNascet}
                    filterMode={activeFilter}
                    patientName={studyData.patientName || 'PATIENT, SAMPLE'}
                    examDate={studyData.examDate || '2026-08-19'}
                    width={640}
                    height={480}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Bottom Status Scale */}
                <div className="w-full flex items-center justify-between text-[9px] font-mono text-slate-400 mt-2">
                  <span>SCALE: {activeCapture.findingType === 'stenosis' ? '+350 / -100 cm/s' : '+120 / -40 cm/s'}</span>
                  <span>WALL FILTER: 100 Hz</span>
                  <span>ANGLE: {activeCapture.telemetry.angle}</span>
                </div>
              </div>

              {/* Right Sidebar: Telemetry & Sonographer Findings */}
              <div className="md:col-span-4 bg-[#091122] border-t md:border-t-0 md:border-l border-slate-800 p-5 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Acoustic Telemetry & Settings
                  </span>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-2 bg-[#060b17] border border-slate-800 rounded-lg">
                      <span className="text-[9px] text-slate-500 uppercase block font-sans">Transducer</span>
                      <span className="font-bold text-slate-200 text-[11px]">{activeCapture.telemetry.probe}</span>
                    </div>
                    <div className="p-2 bg-[#060b17] border border-slate-800 rounded-lg">
                      <span className="text-[9px] text-slate-500 uppercase block font-sans">Frequency</span>
                      <span className="font-bold text-slate-200 text-[11px]">{activeCapture.telemetry.freq}</span>
                    </div>
                    <div className="p-2 bg-[#060b17] border border-slate-800 rounded-lg">
                      <span className="text-[9px] text-slate-500 uppercase block font-sans">Steering Angle</span>
                      <span className="font-bold text-cyan-300 text-[11px]">{activeCapture.telemetry.angle}</span>
                    </div>
                    <div className="p-2 bg-[#060b17] border border-slate-800 rounded-lg">
                      <span className="text-[9px] text-slate-500 uppercase block font-sans">Acoustic Gain</span>
                      <span className="font-bold text-slate-200 text-[11px]">{activeCapture.telemetry.gain}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Radiologist / Sonographer Analysis
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed bg-[#060b17] p-3 rounded-xl border border-slate-800">
                      {activeCapture.sonographerNote}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-end">
                  <button
                    onClick={() => setSelectedCaptureId(null)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    Close Inspection
                  </button>
                </div>

              </div>

            </div>

          </div>
        </div>
      )}
    </div>
  );
};
