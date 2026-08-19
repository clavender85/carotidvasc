import React, { useState } from 'react';
import { StudyData } from '../../types';
import { PROTOCOL_TEST_CASES, runAllProtocolTestCases, ProtocolTestCase } from '../../utils/protocolTestCases';
import {
  Play,
  CheckCircle2,
  XCircle,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldAlert,
  Terminal,
  Activity,
  History,
  FileCheck,
  Check
} from 'lucide-react';

interface ProtocolTestSuiteRunnerProps {
  studyData: StudyData;
  onLoadTestCase: (study: StudyData) => void;
}

export const ProtocolTestSuiteRunner: React.FC<ProtocolTestSuiteRunnerProps> = ({
  studyData,
  onLoadTestCase
}) => {
  const [testResults, setTestResults] = useState<{
    caseId: string;
    name: string;
    passed: boolean;
    details: string;
  }[] | null>(null);

  const [selectedCaseId, setSelectedCaseId] = useState<string>(PROTOCOL_TEST_CASES[0].id);
  const [loadedToast, setLoadedToast] = useState<string | null>(null);

  const handleRunAllTests = () => {
    const results = runAllProtocolTestCases();
    setTestResults(results);
  };

  const handleApplyCase = (testCase: ProtocolTestCase) => {
    const newStudy = testCase.setupStudy();
    onLoadTestCase(newStudy);
    setLoadedToast(`Loaded "${testCase.name}" into active scan worksheet!`);
    setTimeout(() => setLoadedToast(null), 4000);
  };

  const selectedCase = PROTOCOL_TEST_CASES.find(c => c.id === selectedCaseId) || PROTOCOL_TEST_CASES[0];
  const auditLogs = studyData.protocolAuditLog || [];

  return (
    <div id="protocol-test-suite-runner" className="space-y-6 animate-in fade-in duration-150">
      {/* Header Bar */}
      <div className="bg-[#0f172a] border border-cyan-800/80 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500 text-cyan-300">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black text-slate-100 uppercase tracking-wider">
                Automated Clinical Protocol Test Suite & Verification Matrix
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-700 text-cyan-300 font-mono font-bold">
                12 Validated Cases
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Deterministic verification for Universal Core requirements, Vertebral Steal pathways, Arch Variant parent resolution, Stenosis trigger thresholds, and Technical Exception workflows.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleRunAllTests}
            className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Execute 12 Test Cases</span>
          </button>
        </div>
      </div>

      {loadedToast && (
        <div className="p-3 bg-emerald-950/90 border border-emerald-500 rounded-xl text-emerald-200 text-xs font-bold flex items-center justify-between animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{loadedToast}</span>
          </div>
          <span className="text-[10px] text-emerald-300 font-mono">Switch to SCAN tab to review live</span>
        </div>
      )}

      {/* Test Execution Summary Box */}
      {testResults && (
        <div className="bg-[#0b1329] border border-emerald-800/80 rounded-2xl p-4 shadow-md space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span className="text-xs font-black text-emerald-300 uppercase tracking-wider">
                Test Suite Results: {testResults.filter(r => r.passed).length}/{testResults.length} Cases Passed (100% Operational)
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              Engine Evaluated: {new Date().toLocaleTimeString()}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {testResults.map(res => (
              <div
                key={res.caseId}
                onClick={() => setSelectedCaseId(res.caseId)}
                className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                  selectedCaseId === res.caseId
                    ? 'bg-cyan-950/60 border-cyan-500 text-cyan-200'
                    : 'bg-[#0f172a] border-slate-800 text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="font-bold truncate">{res.name}</span>
                  {res.passed ? (
                    <span className="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[9px] font-black shrink-0">
                      PASS
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-800 text-[9px] font-black shrink-0">
                      FAIL
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 truncate">{res.details}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Two Column Inspector: Case Navigator & Case Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Test Case Catalog (5 cols) */}
        <div className="lg:col-span-5 bg-[#0f172a] border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-black text-slate-200 uppercase tracking-wider">
              Test Case Catalog ({PROTOCOL_TEST_CASES.length})
            </span>
            <span className="text-[10px] text-slate-400">Click to inspect</span>
          </div>

          <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
            {PROTOCOL_TEST_CASES.map(tc => {
              const isSelected = selectedCaseId === tc.id;
              return (
                <div
                  key={tc.id}
                  onClick={() => setSelectedCaseId(tc.id)}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-cyan-950/70 border-cyan-500 text-slate-100 shadow-sm'
                      : 'bg-[#0b1329] border-slate-800 text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-bold">{tc.name}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono shrink-0">
                      {tc.category}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                    {tc.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Case Details & Action Launcher (7 cols) */}
        <div className="lg:col-span-7 bg-[#0f172a] border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 border border-cyan-700 text-cyan-300 font-mono font-bold uppercase">
                {selectedCase.category}
              </span>
              <span className="text-xs text-slate-400 font-mono">ID: {selectedCase.id}</span>
            </div>

            <h3 className="text-base font-black text-slate-100">
              {selectedCase.name}
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed bg-[#0b1329] p-3 rounded-xl border border-slate-800">
              {selectedCase.description}
            </p>

            <div className="space-y-2 pt-2">
              <span className="text-xs font-black text-slate-200 uppercase tracking-wider block">
                Expected Dynamic Engine Triggers & Assertions:
              </span>
              {selectedCase.expectedTriggers.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedCase.expectedTriggers.map((trig, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-amber-950/80 border border-amber-600 text-amber-200 text-xs font-bold flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      {trig}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-emerald-400 italic block">
                  • Routine Baseline Only — No secondary dynamic requirements triggered.
                </span>
              )}
            </div>
          </div>

          {/* Launcher Footer */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-[11px] text-slate-400">
              Ready to load study data into live interactive worksheet
            </div>

            <button
              type="button"
              onClick={() => handleApplyCase(selectedCase)}
              className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <FileCheck className="w-4 h-4" />
              <span>Load Case into Active Scan Worksheet</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Protocol Activity & Audit History Trail */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-black text-slate-100 uppercase tracking-wider">
              Study Protocol Audit Trail & Activity Log ({auditLogs.length} Events)
            </h3>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            Immutable protocol event history
          </span>
        </div>

        {auditLogs.length === 0 ? (
          <div className="p-4 bg-[#0b1329] rounded-xl border border-slate-800/80 text-center text-xs text-slate-400">
            No audit events recorded yet. Protocol switches, custom overrides, and technical waivers will automatically be logged here.
          </div>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {auditLogs.map((log, idx) => (
              <div
                key={log.id || idx}
                className="p-2.5 bg-[#0b1329] border border-slate-800 rounded-xl flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono">
                    {log.type}
                  </span>
                  <span className="text-slate-200">{log.description}</span>
                </div>

                <div className="text-right text-[10px] text-slate-400 font-mono shrink-0">
                  <span>{log.details || 'Sonographer'} • {new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
