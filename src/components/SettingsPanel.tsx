import React from 'react';
import { StudyData, ClassificationSystem, CustomThresholds } from '../types';
import { Settings, User, Heart, ShieldAlert, Layers } from 'lucide-react';

interface SettingsPanelProps {
  studyData: StudyData;
  onUpdateStudyData: (updates: Partial<StudyData>) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  studyData,
  onUpdateStudyData,
}) => {

  const handleDemographicChange = (field: keyof StudyData, value: string) => {
    onUpdateStudyData({ [field]: value });
  };

  const handleSystemChange = (system: ClassificationSystem) => {
    onUpdateStudyData({ classificationSystem: system });
  };

  const handleImtThresholdChange = (val: string) => {
    const num = parseFloat(val);
    onUpdateStudyData({ imtThresholdMm: isNaN(num) ? 1.1 : num });
  };

  const handleCustomThresholdChange = (key: keyof CustomThresholds, val: string) => {
    const num = parseFloat(val);
    if (!isNaN(num)) {
      onUpdateStudyData({
        customThresholds: {
          ...studyData.customThresholds,
          [key]: num,
        },
      });
    }
  };

  const systems: { id: ClassificationSystem; name: string; desc: string }[] = [
    { id: 'ASUM_2021', name: 'ASUM 2021 Guidelines', desc: 'Australasian standard using Peak velocities & ratios.' },
    { id: 'MODIFIED_SRU_2021', name: 'Modified SRU / IAC 2021', desc: 'Intersocietal standard requiring combined criteria & exception clauses.' },
    { id: 'SRU_2003', name: 'SRU Consensus 2003', desc: 'Classic classic consensus criteria using PSV <125, 125-230, >230.' },
    { id: 'NASCET_INDEX', name: 'Sonographic NASCET Index', desc: 'Ratio-based estimation correlating direct angiographic trial results.' },
    { id: 'CUSTOM', name: 'Custom Laboratory Limits', desc: 'Define your localized lab velocity boundaries.' },
  ];

  return (
    <div id="settings-panel-container" className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
      
      {/* Header */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
        <Settings className="w-4 h-4 text-slate-500" />
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Patient Demographics & Criteria Configuration</h3>
      </div>

      <div className="p-5 flex-1 overflow-y-auto space-y-6">
        
        {/* 1. Patient Demographics section */}
        <div className="space-y-3">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <User className="w-3.5 h-3.5" /> Patient Demographics & Study Context
          </span>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[10px] font-semibold text-slate-600 mb-1">Patient Full Name</label>
              <input
                id="input-patient-name"
                type="text"
                placeholder="e.g. Eleanor Vance"
                value={studyData.patientName}
                onChange={(e) => handleDemographicChange('patientName', e.target.value)}
                className="w-full px-2.5 py-1.5 rounded border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-600 mb-1">Medical Record ID</label>
              <input
                id="input-patient-id"
                type="text"
                placeholder="e.g. MRN-9842"
                value={studyData.patientId}
                onChange={(e) => handleDemographicChange('patientId', e.target.value)}
                className="w-full px-2.5 py-1.5 rounded border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-600 mb-1">Exam Date</label>
              <input
                id="input-exam-date"
                type="date"
                value={studyData.examDate}
                onChange={(e) => handleDemographicChange('examDate', e.target.value)}
                className="w-full px-2.5 py-1.5 rounded border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-600 mb-1">Reporting Sonographer</label>
              <input
                id="input-sonographer-name"
                type="text"
                placeholder="e.g. Sarah Connor, RVT"
                value={studyData.sonographer}
                onChange={(e) => handleDemographicChange('sonographer', e.target.value)}
                className="w-full px-2.5 py-1.5 rounded border border-slate-200 text-xs focus:outline-none"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-[10px] font-semibold text-slate-600 mb-1">Interpreting Physician</label>
              <input
                id="input-interpreting-physician"
                type="text"
                placeholder="e.g. Dr. Arthur Selby, MD"
                value={studyData.interpretingPhysician}
                onChange={(e) => handleDemographicChange('interpretingPhysician', e.target.value)}
                className="w-full px-2.5 py-1.5 rounded border border-slate-200 text-xs focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* 2. Global Classification Criteria */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" /> Select Consensus Classification Protocol
          </span>

          <div className="space-y-2">
            {systems.map(s => (
              <label
                key={s.id}
                id={`label-system-${s.id.toLowerCase()}`}
                className={`flex items-start gap-3 p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                  studyData.classificationSystem === s.id
                    ? 'border-blue-500 bg-blue-50/20 text-blue-900'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="classification_system_radio"
                  checked={studyData.classificationSystem === s.id}
                  onChange={() => handleSystemChange(s.id)}
                  className="mt-0.5 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="text-[11px] font-bold block">{s.name}</span>
                  <span className="text-[10px] text-slate-500 leading-normal block">{s.desc}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* 3. Intima-Media Thickness Threshold config */}
        <div className="space-y-2 pt-4 border-t border-slate-100">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Heart className="w-3.5 h-3.5" /> Intima-Media Thickness (IMT) Calibration
          </span>

          <div className="bg-slate-50 p-3 rounded-lg flex items-center justify-between gap-4">
            <div className="max-w-[240px]">
              <span className="text-[11px] font-bold text-slate-700 block">Thickened Wall Cutoff</span>
              <span className="text-[10px] text-slate-500 leading-normal block">
                Thicknesses in mm strictly greater than this threshold will be flagged as pathological intimal thickening.
              </span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <input
                id="input-imt-threshold"
                type="number"
                step="0.05"
                value={studyData.imtThresholdMm}
                onChange={(e) => handleImtThresholdChange(e.target.value)}
                className="w-16 px-2 py-1 rounded border border-slate-200 text-xs font-mono text-center focus:outline-none"
              />
              <span className="text-xs text-slate-500">mm</span>
            </div>
          </div>
        </div>

        {/* 4. Custom Laboratory Threshold config */}
        {studyData.classificationSystem === 'CUSTOM' && (
          <div className="space-y-3 pt-4 border-t border-slate-100 bg-indigo-50/25 p-4 rounded-xl border border-dashed border-indigo-100">
            <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" /> Configure Custom Lab Criteria Limits
            </span>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Define the boundaries below. Changing these automatically updates suggested stenosis classifications across all patient worksheets.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-[10px] text-slate-600 font-semibold mb-1">Normal Peak PSV (cm/s)</label>
                <input
                  id="custom-normal-psv"
                  type="number"
                  value={studyData.customThresholds.normalMaxPsv}
                  onChange={(e) => handleCustomThresholdChange('normalMaxPsv', e.target.value)}
                  className="w-full bg-white px-2 py-1 border border-slate-200 rounded text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-600 font-semibold mb-1">Normal Max Ratio</label>
                <input
                  id="custom-normal-ratio"
                  type="number"
                  step="0.1"
                  value={studyData.customThresholds.normalMaxRatio}
                  onChange={(e) => handleCustomThresholdChange('normalMaxRatio', e.target.value)}
                  className="w-full bg-white px-2 py-1 border border-slate-200 rounded text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-600 font-semibold mb-1">50-69% PSV Cutoff (cm/s)</label>
                <input
                  id="custom-50-psv"
                  type="number"
                  value={studyData.customThresholds.stenosis50MaxPsv}
                  onChange={(e) => handleCustomThresholdChange('stenosis50MaxPsv', e.target.value)}
                  className="w-full bg-white px-2 py-1 border border-slate-200 rounded text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-600 font-semibold mb-1">50-69% Max Ratio</label>
                <input
                  id="custom-50-ratio"
                  type="number"
                  step="0.1"
                  value={studyData.customThresholds.stenosis50MaxRatio}
                  onChange={(e) => handleCustomThresholdChange('stenosis50MaxRatio', e.target.value)}
                  className="w-full bg-white px-2 py-1 border border-slate-200 rounded text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-600 font-semibold mb-1">70%+ PSV Cutoff (cm/s)</label>
                <input
                  id="custom-70-psv"
                  type="number"
                  value={studyData.customThresholds.stenosis70MaxPsv}
                  onChange={(e) => handleCustomThresholdChange('stenosis70MaxPsv', e.target.value)}
                  className="w-full bg-white px-2 py-1 border border-slate-200 rounded text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-600 font-semibold mb-1">70%+ Max Ratio</label>
                <input
                  id="custom-70-ratio"
                  type="number"
                  step="0.1"
                  value={studyData.customThresholds.stenosis70MaxRatio}
                  onChange={(e) => handleCustomThresholdChange('stenosis70MaxRatio', e.target.value)}
                  className="w-full bg-white px-2 py-1 border border-slate-200 rounded text-xs font-mono"
                />
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
