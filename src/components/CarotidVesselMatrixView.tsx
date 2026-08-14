import React from 'react';
import { StudyData, SegmentData, FlowDirection } from '../types';
import { SEGMENTS_META } from '../constants';
import { ArrowUp, ArrowDown, ArrowUpDown, X, HelpCircle, Check, AlertTriangle, Layers, Edit3, ShieldAlert } from 'lucide-react';

interface CarotidVesselMatrixViewProps {
  studyData: StudyData;
  activeSegmentId: string | null;
  selectedSegmentIds: string[];
  onSelectSegment: (id: string, isMulti: boolean) => void;
  onAssessSegment: (id: string) => void;
  onUpdateSegment: (id: string, updates: Partial<SegmentData>) => void;
  onQuickMarkNormal: (ids: string[]) => void;
  onMarkSideNormal: (side: 'right' | 'left') => void;
}

interface AnatomicalRow {
  rowLabel: string;
  category: 'cca' | 'bulb' | 'ica' | 'eca' | 'vert' | 'subcl' | 'bct';
  rightId: string | null;
  leftId: string | null;
}

export const CarotidVesselMatrixView: React.FC<CarotidVesselMatrixViewProps> = ({
  studyData,
  activeSegmentId,
  selectedSegmentIds,
  onSelectSegment,
  onAssessSegment,
  onUpdateSegment,
  onQuickMarkNormal,
  onMarkSideNormal,
}) => {
  const anatomicalRows: AnatomicalRow[] = [
    { rowLabel: 'Common Carotid Artery (Proximal)', category: 'cca', rightId: 'r_cca_prox', leftId: 'l_cca_prox' },
    { rowLabel: 'Common Carotid Artery (Mid)', category: 'cca', rightId: 'r_cca_mid', leftId: 'l_cca_mid' },
    { rowLabel: 'Common Carotid Artery (Distal - Ref)', category: 'cca', rightId: 'r_cca_dist', leftId: 'l_cca_dist' },
    { rowLabel: 'Carotid Bulb / Bifurcation', category: 'bulb', rightId: 'r_bulb', leftId: 'l_bulb' },
    { rowLabel: 'Internal Carotid Artery (Proximal)', category: 'ica', rightId: 'r_ica_prox', leftId: 'l_ica_prox' },
    { rowLabel: 'Internal Carotid Artery (Mid)', category: 'ica', rightId: 'r_ica_mid', leftId: 'l_ica_mid' },
    { rowLabel: 'Internal Carotid Artery (Distal)', category: 'ica', rightId: 'r_ica_dist', leftId: 'l_ica_dist' },
    { rowLabel: 'External Carotid Artery (Proximal)', category: 'eca', rightId: 'r_eca_prox', leftId: 'l_eca_prox' },
    { rowLabel: 'External Carotid Artery (Mid)', category: 'eca', rightId: 'r_eca_mid', leftId: 'l_eca_mid' },
    { rowLabel: 'External Carotid Artery (Distal)', category: 'eca', rightId: 'r_eca_dist', leftId: 'l_eca_dist' },
    { rowLabel: 'Vertebral Artery (V1 / Proximal)', category: 'vert', rightId: 'r_vert_prox', leftId: 'l_vert_prox' },
    { rowLabel: 'Vertebral Artery (V2 / Mid)', category: 'vert', rightId: 'r_vert_mid', leftId: 'l_vert_mid' },
    { rowLabel: 'Vertebral Artery (V3 / Distal)', category: 'vert', rightId: 'r_vert_dist', leftId: 'l_vert_dist' },
    { rowLabel: 'Subclavian Artery (Proximal)', category: 'subcl', rightId: 'r_subcl_prox', leftId: 'l_subcl_prox' },
    { rowLabel: 'Subclavian Artery (Distal)', category: 'subcl', rightId: 'r_subcl_dist', leftId: 'l_subcl_dist' },
    { rowLabel: 'Brachiocephalic Trunk (BCT)', category: 'bct', rightId: 'r_bct_prox', leftId: studyData.variantLeftBct ? 'l_bct_prox' : null },
  ];

  const renderFlowIcon = (dir: FlowDirection) => {
    switch (dir) {
      case 'antegrade':
        return <ArrowUp className="w-3.5 h-3.5 text-emerald-400" title="Antegrade Flow" />;
      case 'retrograde':
        return <ArrowDown className="w-3.5 h-3.5 text-rose-400 animate-pulse" title="Retrograde Flow" />;
      case 'bidirectional':
        return <ArrowUpDown className="w-3.5 h-3.5 text-amber-400" title="Bidirectional Flow" />;
      case 'absent':
        return <X className="w-3.5 h-3.5 text-slate-500" title="Absent Flow" />;
      default:
        return <HelpCircle className="w-3.5 h-3.5 text-slate-600" title="Not Assessed" />;
    }
  };

  const renderCell = (id: string | null) => {
    if (!id) {
      return (
        <div className="p-2 text-slate-600 italic text-[10px] text-center bg-[#0a0f1d]/50 rounded-lg">
          Not present in standard anatomy
        </div>
      );
    }

    const s = studyData.segments[id];
    const meta = SEGMENTS_META[id];
    if (!s || !meta) return null;

    const isActive = activeSegmentId === id;
    const isSelected = selectedSegmentIds.includes(id);
    const isStenotic = s.stenosisPresent;
    const isPlaque = s.plaquePresent;
    const isOccluded = s.flowDirection === 'absent';
    const isRetrograde = s.flowDirection === 'retrograde';

    let cardBg = 'bg-[#0f172a] hover:bg-[#152038] border-slate-800';
    if (isActive) {
      cardBg = 'bg-cyan-950/40 border-cyan-500 ring-1 ring-cyan-500 shadow-md shadow-cyan-950/40';
    } else if (isSelected) {
      cardBg = 'bg-cyan-950/20 border-cyan-700';
    } else if (isOccluded || isRetrograde) {
      cardBg = 'bg-rose-950/20 border-rose-800';
    } else if (isStenotic) {
      cardBg = 'bg-rose-950/15 border-rose-800/80';
    } else if (isPlaque) {
      cardBg = 'bg-amber-950/15 border-amber-800/60';
    }

    return (
      <div
        id={`matrix-cell-${id}`}
        onClick={(e) => {
          const isMulti = e.ctrlKey || e.metaKey || e.shiftKey;
          onSelectSegment(id, isMulti);
        }}
        onDoubleClick={() => onAssessSegment(id)}
        className={`p-2.5 rounded-lg border transition-all cursor-pointer select-none flex items-center justify-between gap-2 ${cardBg}`}
      >
        {/* Left info: Flow icon + Short Name + Waveform */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-md bg-[#0b101f] border border-slate-800 flex items-center justify-center shrink-0">
            {renderFlowIcon(s.flowDirection)}
          </div>
          <div className="min-w-0">
            <span className={`text-[11px] font-bold block truncate ${isActive ? 'text-cyan-300' : 'text-slate-200'}`}>
              {meta.shortName}
            </span>
            <span className="text-[8.5px] text-slate-400 truncate block">
              {s.waveform || 'Not assessed'}
            </span>
          </div>
        </div>

        {/* Right metrics: PSV / EDV values + badges */}
        <div className="flex items-center gap-2 shrink-0 font-mono">
          <div className="text-right">
            <span className={`text-xs font-black block leading-none ${
              isOccluded ? 'text-rose-500 line-through' :
              s.psv && s.psv >= 230 ? 'text-rose-400 font-extrabold' :
              s.psv && s.psv >= 125 ? 'text-amber-400 font-extrabold' :
              s.psv !== null ? 'text-emerald-400' : 'text-slate-500'
            }`}>
              {s.psv !== null ? `${s.psv}` : '—'}
              <span className="text-[7.5px] text-slate-500 font-sans ml-0.5">cm/s</span>
            </span>
            <span className="text-[8.5px] text-slate-400 block leading-none mt-0.5">
              {s.edv !== null ? `E:${s.edv}` : 'E:—'}
            </span>
          </div>

          {/* Quick status badges */}
          <div className="flex flex-col gap-0.5">
            {isStenotic && (
              <span className="px-1 py-0.2 rounded text-[7.5px] font-extrabold uppercase bg-rose-950 border border-rose-800 text-rose-300 text-center">
                STEN
              </span>
            )}
            {isPlaque && !isStenotic && (
              <span className="px-1 py-0.2 rounded text-[7.5px] font-extrabold uppercase bg-amber-950 border border-amber-800 text-amber-300 text-center">
                PLQ
              </span>
            )}
            {s.intimalThickening && !isPlaque && !isStenotic && (
              <span className="px-1 py-0.2 rounded text-[7.5px] font-extrabold uppercase bg-blue-950 border border-blue-800 text-blue-300 text-center">
                IMT
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div id="carotid-vessel-matrix-container" className="bg-[#0b1329] border border-slate-800 rounded-xl overflow-hidden shadow-lg flex flex-col">
      {/* Matrix Header */}
      <div className="p-4 bg-[#0f172a] border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Layers className="w-4 h-4 text-cyan-400" />
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-100">
              Bilateral Hemodynamic Matrix & Quick Entry
            </h3>
            <span className="text-[10px] text-slate-400">
              Single-click to select node. Double-click to open full parameter editor.
            </span>
          </div>
        </div>

        {/* Quick actions per side */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onMarkSideNormal('right')}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-[10px] font-bold transition-all cursor-pointer"
          >
            Mark Right Normal
          </button>
          <button
            type="button"
            onClick={() => onMarkSideNormal('left')}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-[10px] font-bold transition-all cursor-pointer"
          >
            Mark Left Normal
          </button>
        </div>
      </div>

      {/* Matrix Table */}
      <div className="p-4 space-y-2 overflow-x-auto">
        <div className="grid grid-cols-12 gap-3 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-800/80">
          <div className="col-span-3">Anatomical Region</div>
          <div className="col-span-4 flex items-center justify-between">
            <span className="text-cyan-400">Right Carotid System (Viewer Left)</span>
            <span className="text-[9px] font-mono text-slate-500 font-bold">PSV / EDV</span>
          </div>
          <div className="col-span-4 flex items-center justify-between">
            <span className="text-cyan-400">Left Carotid System (Viewer Right)</span>
            <span className="text-[9px] font-mono text-slate-500 font-bold">PSV / EDV</span>
          </div>
          <div className="col-span-1 text-center">Row</div>
        </div>

        {anatomicalRows.map(row => {
          const rowSegmentIds = [row.rightId, row.leftId].filter(Boolean) as string[];
          return (
            <div
              key={row.rowLabel}
              className="grid grid-cols-12 gap-3 items-center p-1.5 rounded-lg bg-[#0d1527]/40 hover:bg-[#0d1527]/80 border border-slate-800/40 transition-colors"
            >
              {/* Row Label */}
              <div className="col-span-3">
                <span className="text-xs font-bold text-slate-200 block">{row.rowLabel}</span>
                <span className="text-[8.5px] uppercase font-mono text-slate-500 font-bold">
                  {row.category.toUpperCase()} Bed
                </span>
              </div>

              {/* Right Side Cell */}
              <div className="col-span-4">
                {renderCell(row.rightId)}
              </div>

              {/* Left Side Cell */}
              <div className="col-span-4">
                {renderCell(row.leftId)}
              </div>

              {/* Row Action: Quick Normal for both sides */}
              <div className="col-span-1 flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => onQuickMarkNormal(rowSegmentIds)}
                  className="p-1 rounded bg-[#0b101f] hover:bg-slate-800 text-slate-400 hover:text-emerald-400 border border-slate-800 transition-colors"
                  title={`Quick mark ${row.rowLabel} as Normal`}
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
