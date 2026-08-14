import React from 'react';
import { StudyData, FlowDirection } from '../types';
import { SEGMENTS_META } from '../constants';
import { checkSubclavianSteal } from '../utils/calculations';
import { ArrowUp, ArrowDown, ArrowUpDown, X, HelpCircle, Check, AlertTriangle } from 'lucide-react';

interface VesselTreeListProps {
  studyData: StudyData;
  selectedSegmentIds: string[];
  activeSegmentId: string | null;
  onSelectSegment: (id: string, isMulti: boolean) => void;
  onAssessSegment: (id: string) => void;
  onQuickMarkNormal: (ids: string[]) => void;
  onMarkSideNormal: (side: 'right' | 'left') => void;
}

export const VesselTreeList: React.FC<VesselTreeListProps> = ({
  studyData,
  selectedSegmentIds,
  activeSegmentId,
  onSelectSegment,
  onAssessSegment,
  onQuickMarkNormal,
  onMarkSideNormal,
}) => {
  const isRightSteal = checkSubclavianSteal('right', studyData);
  const isLeftSteal = checkSubclavianSteal('left', studyData);

  const rightSegmentIds = [
    'r_bct_prox', 'r_bct_dist',
    'r_subcl_prox', 'r_subcl_dist',
    'r_vert_prox', 'r_vert_mid', 'r_vert_dist',
    'r_cca_prox', 'r_cca_mid', 'r_cca_dist',
    'r_bulb',
    'r_ica_prox', 'r_ica_mid', 'r_ica_dist',
    'r_eca_prox', 'r_eca_mid', 'r_eca_dist',
  ];

  const isBovine = studyData.variantLeftBct || studyData.anatomyVariants?.archVariant === 'bovine_common_origin';

  const leftSegmentIds = [
    ...(isBovine ? ['l_bct_prox', 'l_bct_dist'] : []),
    'l_subcl_prox', 'l_subcl_dist',
    'l_vert_prox', 'l_vert_mid', 'l_vert_dist',
    'l_cca_prox', 'l_cca_mid', 'l_cca_dist',
    'l_bulb',
    'l_ica_prox', 'l_ica_mid', 'l_ica_dist',
    'l_eca_prox', 'l_eca_mid', 'l_eca_dist',
  ];

  const renderFlowIcon = (dir: FlowDirection) => {
    switch (dir) {
      case 'antegrade':
        return <ArrowUp className="w-3 h-3 text-emerald-600" title="Antegrade" />;
      case 'retrograde':
        return <ArrowDown className="w-3 h-3 text-rose-600 animate-pulse" title="Retrograde" />;
      case 'bidirectional':
        return <ArrowUpDown className="w-3 h-3 text-amber-600" title="Bidirectional" />;
      case 'absent':
        return <X className="w-3 h-3 text-slate-500" title="Absent Flow" />;
      default:
        return <HelpCircle className="w-3 h-3 text-slate-300" title="Unassessed" />;
    }
  };

  const renderSegmentItem = (id: string) => {
    const s = studyData.segments[id];
    const meta = SEGMENTS_META[id];
    if (!s || !meta) return null;

    const isActive = activeSegmentId === id;
    const isSelected = selectedSegmentIds.includes(id);
    const hasPsv = s.psv !== null;
    const isStenotic = s.stenosisPresent;
    const isPlaque = s.plaquePresent;

    let bgClass = 'bg-[#0f172a] hover:bg-[#152038]';
    let borderClass = 'border-slate-800';

    if (isActive) {
      bgClass = 'bg-cyan-950/50';
      borderClass = 'border-cyan-400 ring-1 ring-cyan-400';
    } else if (isSelected) {
      bgClass = 'bg-cyan-950/30';
      borderClass = 'border-cyan-600';
    } else if (s.flowDirection === 'absent' || s.flowDirection === 'retrograde') {
      bgClass = 'bg-rose-950/30';
      borderClass = 'border-rose-700';
    } else if (isStenotic) {
      bgClass = 'bg-rose-950/20';
      borderClass = 'border-rose-800';
    } else if (isPlaque) {
      bgClass = 'bg-amber-950/20';
      borderClass = 'border-amber-800';
    }

    return (
      <div
        key={id}
        id={`vessel-tree-item-${id}`}
        onClick={(e) => {
          const isMulti = e.ctrlKey || e.metaKey || e.shiftKey;
          onSelectSegment(id, isMulti);
        }}
        onDoubleClick={() => onAssessSegment(id)}
        className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all flex items-center justify-between ${bgClass} ${borderClass}`}
      >
        <div className="flex items-center gap-2">
          <div className="flex flex-col">
            <span className={`text-xs font-bold ${isActive ? 'text-cyan-300' : 'text-slate-100'}`}>{meta.shortName}</span>
            <span className="text-[9px] text-slate-400 font-medium truncate max-w-[120px]">{meta.name}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Flow Direction Indicator */}
          <div className="w-5 h-5 rounded-full bg-[#0b101f] flex items-center justify-center border border-slate-700">
            {renderFlowIcon(s.flowDirection)}
          </div>

          {/* PSV / EDV values */}
          <div className="text-right font-mono text-[11px]">
            <span className={`font-black ${
              s.flowDirection === 'absent' ? 'text-rose-500 line-through' :
              isStenotic || (s.psv && s.psv >= 230) ? 'text-rose-400 font-extrabold' :
              s.psv && s.psv >= 125 ? 'text-amber-400 font-extrabold' :
              hasPsv ? 'text-emerald-400 font-bold' : 'text-slate-500'
            }`}>
              {s.psv !== null ? s.psv : '—'}
            </span>
            <span className="text-[9px] text-slate-400 block">
              {s.edv !== null ? `E:${s.edv}` : 'E:—'} cm/s
            </span>
          </div>

          {/* Status Badges */}
          {isStenotic && (
            <span className="px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase bg-rose-950 text-rose-300 border border-rose-800">
              STEN
            </span>
          )}
          {isPlaque && !isStenotic && (
            <span className="px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase bg-amber-950 text-amber-300 border border-amber-800">
              PLQ
            </span>
          )}
          {s.intimalThickening && !isPlaque && !isStenotic && (
            <span className="px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase bg-cyan-950 text-cyan-300 border border-cyan-800">
              IMT
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div id="vessel-tree-grid" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* RIGHT CAROTID SYSTEM */}
      <div className="bg-[#0b1329] border border-slate-800 rounded-xl shadow-md p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
            <h3 className="text-xs font-black text-slate-100 uppercase tracking-wider">Right Carotid & Vertebral System</h3>
          </div>
          <button
            type="button"
            id="btn-mark-right-normal"
            onClick={() => onMarkSideNormal('right')}
            className="text-[10px] text-cyan-300 hover:text-white font-bold px-2.5 py-1 bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-800 rounded-lg transition-all cursor-pointer"
          >
            Mark Right Normal
          </button>
        </div>

        {isRightSteal && (
          <div className="p-2 bg-rose-950/50 border border-rose-800 rounded-lg flex items-center gap-2 text-rose-300 text-[11px]">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 animate-pulse" />
            <span>Subclavian / Vertebral Steal physiology suspected on Right side.</span>
          </div>
        )}

        <div className="space-y-1.5 max-h-[580px] overflow-y-auto pr-1">
          {rightSegmentIds.map(id => renderSegmentItem(id))}
        </div>
      </div>

      {/* LEFT CAROTID SYSTEM */}
      <div className="bg-[#0b1329] border border-slate-800 rounded-xl shadow-md p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
            <h3 className="text-xs font-black text-slate-100 uppercase tracking-wider">Left Carotid & Vertebral System</h3>
          </div>
          <button
            type="button"
            id="btn-mark-left-normal"
            onClick={() => onMarkSideNormal('left')}
            className="text-[10px] text-cyan-300 hover:text-white font-bold px-2.5 py-1 bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-800 rounded-lg transition-all cursor-pointer"
          >
            Mark Left Normal
          </button>
        </div>

        {isLeftSteal && (
          <div className="p-2 bg-rose-950/50 border border-rose-800 rounded-lg flex items-center gap-2 text-rose-300 text-[11px]">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 animate-pulse" />
            <span>Retrograde vertebral flow / Subclavian steal suspected on Left side.</span>
          </div>
        )}

        <div className="space-y-1.5 max-h-[580px] overflow-y-auto pr-1">
          {leftSegmentIds.map(id => renderSegmentItem(id))}
        </div>
      </div>

    </div>
  );
};
