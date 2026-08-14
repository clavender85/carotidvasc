import React, { useState } from 'react';
import { SiteProtocolConfig, RequirementLevel, SpecialExamType } from '../../types';
import { UNIVERSAL_CORE_DEFAULT_DATASET } from '../../data/protocols/universalCore';
import { SEGMENTS_META } from '../../constants';
import { Edit3, Save, RotateCcw, AlertCircle, Building2, UserCheck, Calendar, ShieldAlert, Sparkles, Check } from 'lucide-react';

interface SiteProtocolEditorProps {
  config: SiteProtocolConfig;
  onUpdateConfig: (newConfig: SiteProtocolConfig) => void;
  onResetToUniversal: () => void;
}

export const SiteProtocolEditor: React.FC<SiteProtocolEditorProps> = ({
  config,
  onUpdateConfig,
  onResetToUniversal
}) => {
  const [localData, setLocalData] = useState<SiteProtocolConfig>({ ...config });
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleChange = <K extends keyof SiteProtocolConfig>(key: K, value: SiteProtocolConfig[K]) => {
    setLocalData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSegmentReqChange = (segmentId: string, level: RequirementLevel) => {
    setLocalData(prev => ({
      ...prev,
      segmentRequirements: {
        ...(prev.segmentRequirements || UNIVERSAL_CORE_DEFAULT_DATASET),
        [segmentId]: level
      }
    }));
  };

  const handleSave = () => {
    onUpdateConfig(localData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Group segments by side
  const rightSegments = Object.values(SEGMENTS_META).filter(s => s.side === 'right' && s.id !== 'arch');
  const leftSegments = Object.values(SEGMENTS_META).filter(s => s.side === 'left' && s.id !== 'arch');

  return (
    <div id="site-protocol-editor-section" className="space-y-5 bg-[#0f172a] border border-slate-800 rounded-2xl p-5 shadow-md">
      
      {/* Header & Save/Reset Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-black text-slate-100 uppercase tracking-tight flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-400" />
              Site-Specific Protocol Addendum & Local Overrides
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-amber-950/70 border border-amber-800 text-amber-300 text-[10px] font-bold">
              DEPARTMENT OVERRIDES
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure local healthcare organisation details, acquisition requirements, and clinical escalation triggers
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            id="btn-reset-site-protocol"
            onClick={() => {
              if (window.confirm('Reset site addendum to Universal Core defaults?')) {
                onResetToUniversal();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Core</span>
          </button>

          <button
            type="button"
            id="btn-save-site-protocol"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold transition-all cursor-pointer shadow-sm"
          >
            {saveSuccess ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            <span>{saveSuccess ? 'Saved!' : 'Save Addendum'}</span>
          </button>
        </div>
      </div>

      {/* Safety Notice */}
      <div className="bg-[#131d35] border border-slate-800 rounded-xl p-3 text-xs text-slate-300 flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-cyan-300">Architectural Note:</strong> Departmental customizations add site-specific governance and overrides to the worksheet without modifying the underlying Universal Core evidence framework.
        </div>
      </div>

      {/* 1. Administrative & Governance Fields */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
          1. Governance & Laboratory Identification
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1">
              Organisation / Hospital
            </label>
            <input
              type="text"
              value={localData.organisation}
              onChange={(e) => handleChange('organisation', e.target.value)}
              placeholder="e.g. Monash Health / Cleveland Clinic"
              className="w-full bg-[#131d35] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1">
              Site / Department
            </label>
            <input
              type="text"
              value={localData.site}
              onChange={(e) => handleChange('site', e.target.value)}
              placeholder="e.g. Vascular Laboratory, Main Hospital"
              className="w-full bg-[#131d35] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1">
              Local Protocol Name
            </label>
            <input
              type="text"
              value={localData.localProtocolName}
              onChange={(e) => handleChange('localProtocolName', e.target.value)}
              placeholder="e.g. Department Carotid Performance Standard"
              className="w-full bg-[#131d35] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1">
              Protocol Owner / Technical Director
            </label>
            <input
              type="text"
              value={localData.protocolOwner}
              onChange={(e) => handleChange('protocolOwner', e.target.value)}
              placeholder="e.g. Chief Vascular Sonographer (AMSU / RVT)"
              className="w-full bg-[#131d35] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1">
              Approved By / Medical Director
            </label>
            <input
              type="text"
              value={localData.approvedBy}
              onChange={(e) => handleChange('approvedBy', e.target.value)}
              placeholder="e.g. Head of Vascular Surgery / Radiologist"
              className="w-full bg-[#131d35] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1">
              Version & Review Date
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={localData.version}
                onChange={(e) => handleChange('version', e.target.value)}
                placeholder="v3.1"
                className="w-full bg-[#131d35] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              />
              <input
                type="date"
                value={localData.reviewDate}
                onChange={(e) => handleChange('reviewDate', e.target.value)}
                className="w-full bg-[#131d35] border border-slate-700 rounded-xl px-2 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Acquisition & Extent Configuration Overrides */}
      <div className="space-y-3 pt-3 border-t border-slate-800">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
          2. Acquisition Scope & Policy Switches
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          
          {/* Subclavian Routine */}
          <div className="bg-[#131d35] border border-slate-800 rounded-xl p-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-300">
                Subclavian Artery Assessment
              </label>
              {localData.subclavianRoutine !== 'conditional' && (
                <span className="px-1.5 py-0.5 rounded bg-amber-950/70 border border-amber-800 text-amber-300 text-[9px] font-bold">
                  Override
                </span>
              )}
            </div>
            <select
              value={localData.subclavianRoutine}
              onChange={(e) => handleChange('subclavianRoutine', e.target.value as any)}
              className="w-full bg-[#0f172a] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="conditional">Conditional (As Indicated / Suspected Steal)</option>
              <option value="routine">Routine (Acquire on every patient)</option>
            </select>
          </div>

          {/* Vertebral Extent */}
          <div className="bg-[#131d35] border border-slate-800 rounded-xl p-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-300">
                Vertebral Artery Extent
              </label>
              {localData.vertebralExtent !== 'representative' && (
                <span className="px-1.5 py-0.5 rounded bg-amber-950/70 border border-amber-800 text-amber-300 text-[9px] font-bold">
                  Override
                </span>
              )}
            </div>
            <select
              value={localData.vertebralExtent}
              onChange={(e) => handleChange('vertebralExtent', e.target.value as any)}
              className="w-full bg-[#0f172a] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="representative">Representative (Mid-cervical V2 segment)</option>
              <option value="full">Full (Proximal origin, Mid, and Distal)</option>
            </select>
          </div>

          {/* CCA Extent */}
          <div className="bg-[#131d35] border border-slate-800 rounded-xl p-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-300">
                CCA Acquisition Extent
              </label>
              {localData.ccaExtent !== 'prox_mid_dist' && (
                <span className="px-1.5 py-0.5 rounded bg-amber-950/70 border border-amber-800 text-amber-300 text-[9px] font-bold">
                  Override
                </span>
              )}
            </div>
            <select
              value={localData.ccaExtent}
              onChange={(e) => handleChange('ccaExtent', e.target.value as any)}
              className="w-full bg-[#0f172a] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="prox_mid_dist">Proximal, Mid & Distal CCA</option>
              <option value="prox_dist">Proximal & Distal CCA only</option>
            </select>
          </div>

          {/* Special Exam Type */}
          <div className="bg-[#131d35] border border-slate-800 rounded-xl p-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-300">
                Examination Type Protocol
              </label>
              {localData.specialExamType !== 'routine_native' && (
                <span className="px-1.5 py-0.5 rounded bg-amber-950/70 border border-amber-800 text-amber-300 text-[9px] font-bold">
                  Special Exam
                </span>
              )}
            </div>
            <select
              value={localData.specialExamType}
              onChange={(e) => handleChange('specialExamType', e.target.value as SpecialExamType)}
              className="w-full bg-[#0f172a] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="routine_native">Routine Native Carotid Study</option>
              <option value="post_cea">Post Carotid Endarterectomy (CEA)</option>
              <option value="post_stent">Post Carotid Artery Stent (CAS)</option>
              <option value="subclavian_steal">Suspected Subclavian Steal Assessment</option>
              <option value="known_occlusion">Known Carotid Occlusion Follow-up</option>
              <option value="limited_targeted">Limited / Targeted Carotid Study</option>
            </select>
          </div>

          {/* IMT Extent */}
          <div className="bg-[#131d35] border border-slate-800 rounded-xl p-3 space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300">
              Intima-Media Thickness (IMT)
            </label>
            <select
              value={localData.imtExtent}
              onChange={(e) => handleChange('imtExtent', e.target.value as any)}
              className="w-full bg-[#0f172a] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="conditional">Conditional / As Indicated</option>
              <option value="routine">Routine on all screening exams</option>
              <option value="not_performed">Not Performed routinely</option>
            </select>
          </div>

          {/* NASCET B-Mode Extent */}
          <div className="bg-[#131d35] border border-slate-800 rounded-xl p-3 space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300">
              NASCET Caliper Measurements
            </label>
            <select
              value={localData.nascetBModeExtent}
              onChange={(e) => handleChange('nascetBModeExtent', e.target.value as any)}
              className="w-full bg-[#0f172a] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="conditional">Conditional (Visible focal stenosis)</option>
              <option value="routine_above_threshold">Routine whenever PSV &gt; 125 cm/s</option>
              <option value="not_performed">Doppler velocity grading only</option>
            </select>
          </div>

        </div>
      </div>

      {/* 3. Clinical Escalation & Safety Triggers */}
      <div className="space-y-3 pt-3 border-t border-slate-800">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          3. Clinical Escalation Pathways & Special Scenarios
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1">
              Second Sonographer / Senior Review Trigger
            </label>
            <textarea
              rows={2}
              value={localData.secondSonographerReviewTrigger}
              onChange={(e) => handleChange('secondSonographerReviewTrigger', e.target.value)}
              placeholder="e.g. PSV > 230 cm/s, string sign / near occlusion, or discrepancy > 1 category"
              className="w-full bg-[#131d35] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 resize-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1">
              Urgent / Critical Result Notification Pathway
            </label>
            <textarea
              rows={2}
              value={localData.crossSectionalEscalation}
              onChange={(e) => handleChange('crossSectionalEscalation', e.target.value)}
              placeholder="e.g. Critical notification to referring physician for symptomatic severe stenosis within 2 hours"
              className="w-full bg-[#131d35] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 resize-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1">
              Mobile / ICU / Ward Exam Instructions
            </label>
            <textarea
              rows={2}
              value={localData.mobileExamInstructions}
              onChange={(e) => handleChange('mobileExamInstructions', e.target.value)}
              placeholder="e.g. Limit study to core diagnostic vessels; note neck lines/dressings; recommend lab repeat if suboptimal"
              className="w-full bg-[#131d35] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 resize-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1">
              After-Hours / On-Call Focused Exam Dataset
            </label>
            <textarea
              rows={2}
              value={localData.afterHoursDataset}
              onChange={(e) => handleChange('afterHoursDataset', e.target.value)}
              placeholder="e.g. Acute stroke protocol: Bilateral Prox/Dist CCA, Bulb, Prox/Mid ICA, ECA, Vertebral direction"
              className="w-full bg-[#131d35] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 resize-none"
            />
          </div>
        </div>

        {/* Site Notes */}
        <div>
          <label className="text-[11px] font-bold text-slate-400 block mb-1">
            General Site Notes & Local Accreditation References
          </label>
          <textarea
            rows={2}
            value={localData.siteNotes}
            onChange={(e) => handleChange('siteNotes', e.target.value)}
            placeholder="e.g. Specific local reporting phrases or PACS storage policies"
            className="w-full bg-[#131d35] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 resize-none"
          />
        </div>
      </div>

      {/* 4. Per-Segment Requirement Matrix */}
      <div className="space-y-3 pt-3 border-t border-slate-800">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          4. Per-Segment Acquisition Requirement Levels
        </h4>
        <p className="text-[11px] text-slate-400">
          Configure whether each anatomical vessel segment is Required, Recommended, Conditional, Optional, or Not Performed at your site.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          
          {/* Right Segments */}
          <div className="bg-[#131d35] border border-slate-800 rounded-xl p-3 space-y-2">
            <span className="text-xs font-bold text-cyan-300 block pb-1 border-b border-slate-800">
              Right Carotid & Vertebral Segments
            </span>
            <div className="space-y-1.5">
              {rightSegments.map(seg => {
                const currentLevel: RequirementLevel = localData.segmentRequirements?.[seg.id] || 'recommended';
                return (
                  <div key={seg.id} className="flex items-center justify-between gap-2 text-xs py-1 border-b border-slate-800/50 last:border-0">
                    <span className="text-slate-200 font-medium truncate">{seg.name}</span>
                    <select
                      value={currentLevel}
                      onChange={(e) => handleSegmentReqChange(seg.id, e.target.value as RequirementLevel)}
                      className={`text-[11px] rounded-lg px-2 py-1 border focus:outline-none cursor-pointer ${
                        currentLevel === 'required'
                          ? 'bg-cyan-950/70 border-cyan-700 text-cyan-300 font-bold'
                          : currentLevel === 'recommended'
                          ? 'bg-blue-950/50 border-blue-800 text-blue-300'
                          : currentLevel === 'conditional'
                          ? 'bg-amber-950/50 border-amber-800 text-amber-300'
                          : currentLevel === 'optional'
                          ? 'bg-slate-800 border-slate-700 text-slate-400'
                          : 'bg-rose-950/50 border-rose-800 text-rose-300'
                      }`}
                    >
                      <option value="required">Required</option>
                      <option value="recommended">Recommended</option>
                      <option value="conditional">Conditional</option>
                      <option value="optional">Optional</option>
                      <option value="not_performed">Not Performed</option>
                    </select>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Left Segments */}
          <div className="bg-[#131d35] border border-slate-800 rounded-xl p-3 space-y-2">
            <span className="text-xs font-bold text-cyan-300 block pb-1 border-b border-slate-800">
              Left Carotid & Vertebral Segments
            </span>
            <div className="space-y-1.5">
              {leftSegments.map(seg => {
                const currentLevel: RequirementLevel = localData.segmentRequirements?.[seg.id] || 'recommended';
                return (
                  <div key={seg.id} className="flex items-center justify-between gap-2 text-xs py-1 border-b border-slate-800/50 last:border-0">
                    <span className="text-slate-200 font-medium truncate">{seg.name}</span>
                    <select
                      value={currentLevel}
                      onChange={(e) => handleSegmentReqChange(seg.id, e.target.value as RequirementLevel)}
                      className={`text-[11px] rounded-lg px-2 py-1 border focus:outline-none cursor-pointer ${
                        currentLevel === 'required'
                          ? 'bg-cyan-950/70 border-cyan-700 text-cyan-300 font-bold'
                          : currentLevel === 'recommended'
                          ? 'bg-blue-950/50 border-blue-800 text-blue-300'
                          : currentLevel === 'conditional'
                          ? 'bg-amber-950/50 border-amber-800 text-amber-300'
                          : currentLevel === 'optional'
                          ? 'bg-slate-800 border-slate-700 text-slate-400'
                          : 'bg-rose-950/50 border-rose-800 text-rose-300'
                      }`}
                    >
                      <option value="required">Required</option>
                      <option value="recommended">Recommended</option>
                      <option value="conditional">Conditional</option>
                      <option value="optional">Optional</option>
                      <option value="not_performed">Not Performed</option>
                    </select>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
