import React, { useState } from 'react';
import { AlertOctagon, AlertTriangle, ChevronRight } from 'lucide-react';
import type { Project } from '../types';

interface EarlyWarningModuleProps {
  projects: Project[];
  onSelectProject: (projectId: string) => void;
}

export const EarlyWarningModule: React.FC<EarlyWarningModuleProps> = ({ projects, onSelectProject }) => {
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState<string>('P1');

  // Filter projects by priority
  const criticalP1 = projects.filter((p) => p.priority_level === 'P1');
  const highP2 = projects.filter((p) => p.priority_level === 'P2');
  const moderateP3 = projects.filter((p) => p.priority_level === 'P3');
  const lowP4 = projects.filter((p) => p.priority_level === 'P4');

  const displayed =
    selectedPriorityFilter === 'P1'
      ? criticalP1
      : selectedPriorityFilter === 'P2'
      ? highP2
      : selectedPriorityFilter === 'P3'
      ? moderateP3
      : lowP4;

  return (
    <div className="space-y-6">
      {/* Module Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span>Early Warning & Alert Prioritization Engine</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Automated early detection of cost, schedule, and execution bottlenecks before failure occurs.
          </p>
        </div>

        {/* Priority Tabs */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setSelectedPriorityFilter('P1')}
            className={`px-3 py-1.5 rounded text-xs font-bold transition flex items-center gap-1.5 ${
              selectedPriorityFilter === 'P1'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>P1 Critical ({criticalP1.length})</span>
          </button>
          <button
            onClick={() => setSelectedPriorityFilter('P2')}
            className={`px-3 py-1.5 rounded text-xs font-bold transition ${
              selectedPriorityFilter === 'P2'
                ? 'bg-orange-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>P2 High ({highP2.length})</span>
          </button>
          <button
            onClick={() => setSelectedPriorityFilter('P3')}
            className={`px-3 py-1.5 rounded text-xs font-bold transition ${
              selectedPriorityFilter === 'P3'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>P3 Moderate ({moderateP3.length})</span>
          </button>
          <button
            onClick={() => setSelectedPriorityFilter('P4')}
            className={`px-3 py-1.5 rounded text-xs font-bold transition ${
              selectedPriorityFilter === 'P4'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>P4 Low ({lowP4.length})</span>
          </button>
        </div>
      </div>

      {/* Projects List with Alert Cards */}
      <div className="space-y-4">
        {displayed.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 text-xs shadow-sm">
            No active projects flagged under priority level {selectedPriorityFilter}.
          </div>
        ) : (
          displayed.slice(0, 15).map((p) => (
            <div
              key={p.project_id}
              onClick={() => onSelectProject(p.project_id)}
              className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-5 shadow-sm hover:shadow transition cursor-pointer group space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-teal-700 font-bold">{p.project_id}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                      {p.sector}
                    </span>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded font-extrabold border ${
                        p.priority_level === 'P1'
                          ? 'bg-red-100 text-red-800 border-red-300'
                          : p.priority_level === 'P2'
                          ? 'bg-orange-100 text-orange-800 border-orange-300'
                          : 'bg-amber-100 text-amber-800 border-amber-300'
                      }`}
                    >
                      Priority {p.priority_level}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-teal-700 transition mt-1">
                    {p.project_name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {p.ministry} • Agency: {p.implementing_agency}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <div>
                    <div className="text-[10px] text-slate-500 font-medium">Financial Exposure</div>
                    <div className="text-sm font-bold text-slate-900">₹{p.revised_cost.toLocaleString()} Cr</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 font-medium">Risk Score</div>
                    <div className="text-sm font-extrabold text-red-700">{p.overall_risk_score}/100</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-teal-700 transition" />
                </div>
              </div>

              {/* Warnings & Signals */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                  <div className="text-slate-500 text-[10px]">Predicted Delay</div>
                  <div className="font-bold text-amber-700 mt-0.5">+{p.expected_delay_months} Months</div>
                  <div className="text-[10px] text-slate-500">Delay Prob: {p.time_overrun_prob}%</div>
                </div>

                <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                  <div className="text-slate-500 text-[10px]">Cost Overrun Risk</div>
                  <div className="font-bold text-red-700 mt-0.5">Probability: {p.cost_overrun_prob}%</div>
                  <div className="text-[10px] text-slate-500">Physical Progress: {p.physical_progress_pct}%</div>
                </div>

                <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                  <div className="text-slate-500 text-[10px]">Primary Execution Bottleneck</div>
                  <div className="font-semibold text-slate-800 mt-0.5 truncate">{p.primary_delay_reason || 'Milestone Slippage'}</div>
                  <div className="text-[10px] text-teal-700 font-semibold">Review Recommended</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
