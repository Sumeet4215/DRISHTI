import React from 'react';
import { ExternalLink, Search } from 'lucide-react';
import type { Project } from '../types';

interface ProjectTableProps {
  projects: Project[];
  totalProjects: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onSelectProject: (projectId: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedMinistry: string;
  setSelectedMinistry: (m: string) => void;
  selectedSector: string;
  setSelectedSector: (s: string) => void;
  selectedPriority: string;
  setSelectedPriority: (p: string) => void;
}

export const ProjectTable: React.FC<ProjectTableProps> = ({
  projects,
  totalProjects,
  currentPage,
  totalPages,
  onPageChange,
  onSelectProject,
  searchTerm,
  setSearchTerm,
  selectedPriority,
  setSelectedPriority
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
      {/* Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>Project Monitoring Portfolio</span>
            <span className="text-xs px-2.5 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold border border-slate-200">
              {totalProjects.toLocaleString()} Projects Matched
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Ranked by AI Predictive Risk Score and P1–P4 Priority Tier.
          </p>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search project name, ID, agency..."
              className="pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:bg-white w-64"
            />
          </div>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-700 focus:outline-none focus:border-teal-600 focus:bg-white"
          >
            <option value="">All Priorities</option>
            <option value="P1">P1 — Critical</option>
            <option value="P2">P2 — High</option>
            <option value="P3">P3 — Moderate</option>
            <option value="P4">P4 — Low</option>
          </select>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <th className="py-3 px-3">Project & ID</th>
              <th className="py-3 px-3">Ministry & Sector</th>
              <th className="py-3 px-3 text-right">Original Cost</th>
              <th className="py-3 px-3 text-right">Revised Cost</th>
              <th className="py-3 px-3 text-center">Progress %</th>
              <th className="py-3 px-3 text-center">Cost Risk %</th>
              <th className="py-3 px-3 text-center">Time Risk %</th>
              <th className="py-3 px-3 text-center">Predicted Delay</th>
              <th className="py-3 px-3 text-center">Risk Score</th>
              <th className="py-3 px-3 text-center">Priority</th>
              <th className="py-3 px-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {projects.length === 0 ? (
              <tr>
                <td colSpan={11} className="text-center py-8 text-slate-500">
                  No projects match the selected criteria.
                </td>
              </tr>
            ) : (
              projects.map((p) => {
                const escalationPct = ((p.revised_cost / maxOne(p.original_cost)) - 1.0) * 100;
                return (
                  <tr
                    key={p.project_id}
                    className="hover:bg-slate-50/80 transition group cursor-pointer"
                    onClick={() => onSelectProject(p.project_id)}
                  >
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900 group-hover:text-teal-700 transition">
                        {p.project_name}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">{p.project_id} • {p.state}</div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="text-slate-800 font-medium">{p.sector}</div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[180px]">{p.ministry}</div>
                    </td>

                    <td className="py-3 px-3 text-right font-mono text-slate-600">
                      ₹{p.original_cost.toLocaleString()} Cr
                    </td>

                    <td className="py-3 px-3 text-right font-mono">
                      <span className="text-slate-900 font-semibold">₹{p.revised_cost.toLocaleString()} Cr</span>
                      {escalationPct > 1 && (
                        <div className="text-[10px] text-red-600 font-bold">+{escalationPct.toFixed(1)}%</div>
                      )}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <div className="w-16 mx-auto bg-slate-200 h-2 rounded-full overflow-hidden mb-1">
                        <div
                          className="bg-teal-600 h-full rounded-full"
                          style={{ width: `${Math.min(100, p.physical_progress_pct)}%` }}
                        />
                      </div>
                      <span className="font-semibold text-slate-700">{p.physical_progress_pct}%</span>
                    </td>

                    <td className="py-3 px-3 text-center font-bold text-slate-800">
                      {p.cost_overrun_prob}%
                    </td>

                    <td className="py-3 px-3 text-center font-bold text-slate-800">
                      {p.time_overrun_prob}%
                    </td>

                    <td className="py-3 px-3 text-center font-semibold text-amber-700">
                      +{p.expected_delay_months} m
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-full font-extrabold text-xs inline-block ${
                          p.overall_risk_score >= 75
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : p.overall_risk_score >= 50
                            ? 'bg-orange-50 text-orange-700 border border-orange-200'
                            : p.overall_risk_score >= 25
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {p.overall_risk_score}/100
                      </span>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded font-bold text-[10px] border ${
                          p.priority_level === 'P1'
                            ? 'bg-red-100 text-red-800 border-red-300'
                            : p.priority_level === 'P2'
                            ? 'bg-orange-100 text-orange-800 border-orange-300'
                            : p.priority_level === 'P3'
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        }`}
                      >
                        {p.priority_level}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onSelectProject(p.project_id)}
                        className="px-2.5 py-1 bg-teal-50 hover:bg-teal-700 text-teal-700 hover:text-white rounded border border-teal-200 text-[11px] font-semibold transition flex items-center gap-1 mx-auto"
                      >
                        <span>Deep Dive</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-200 text-xs text-slate-500">
        <div>
          Page <span className="font-bold text-slate-900">{currentPage}</span> of{' '}
          <span className="font-bold text-slate-900">{totalPages}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 font-medium transition border border-slate-200"
          >
            Previous
          </button>
          <button
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 font-medium transition border border-slate-200"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

function maxOne(val: number): number {
  return val <= 0 ? 1 : val;
}
