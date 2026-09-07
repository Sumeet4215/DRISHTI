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
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
      {/* Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>Project Monitoring Portfolio</span>
            <span className="text-xs px-2.5 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold border border-slate-700">
              {totalProjects.toLocaleString()} Projects Matched
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
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
              className="pl-9 pr-4 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-64"
            />
          </div>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
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
            <tr className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800">
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
          <tbody className="divide-y divide-slate-800/60">
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
                    className="hover:bg-slate-800/40 transition group cursor-pointer"
                    onClick={() => onSelectProject(p.project_id)}
                  >
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-200 group-hover:text-emerald-400 transition">
                        {p.project_name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{p.project_id} • {p.state}</div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="text-slate-300 font-medium">{p.sector}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[180px]">{p.ministry}</div>
                    </td>

                    <td className="py-3 px-3 text-right font-mono text-slate-300">
                      ₹{p.original_cost.toLocaleString()} Cr
                    </td>

                    <td className="py-3 px-3 text-right font-mono">
                      <span className="text-slate-200 font-semibold">₹{p.revised_cost.toLocaleString()} Cr</span>
                      {escalationPct > 1 && (
                        <div className="text-[10px] text-red-400 font-bold">+{escalationPct.toFixed(1)}%</div>
                      )}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <div className="w-16 mx-auto bg-slate-800 h-2 rounded-full overflow-hidden mb-1">
                        <div
                          className="bg-emerald-500 h-full rounded-full"
                          style={{ width: `${Math.min(100, p.physical_progress_pct)}%` }}
                        />
                      </div>
                      <span className="font-semibold text-slate-300">{p.physical_progress_pct}%</span>
                    </td>

                    <td className="py-3 px-3 text-center font-bold text-slate-200">
                      {p.cost_overrun_prob}%
                    </td>

                    <td className="py-3 px-3 text-center font-bold text-slate-200">
                      {p.time_overrun_prob}%
                    </td>

                    <td className="py-3 px-3 text-center font-semibold text-amber-400">
                      +{p.expected_delay_months} m
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-full font-extrabold text-xs inline-block ${
                          p.overall_risk_score >= 75
                            ? 'bg-red-950 text-red-400 border border-red-800'
                            : p.overall_risk_score >= 50
                            ? 'bg-orange-950 text-orange-400 border border-orange-800'
                            : p.overall_risk_score >= 25
                            ? 'bg-yellow-950 text-yellow-400 border border-yellow-800'
                            : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        }`}
                      >
                        {p.overall_risk_score}/100
                      </span>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded font-bold text-[10px] border ${
                          p.priority_level === 'P1'
                            ? 'bg-red-600 text-white border-red-500'
                            : p.priority_level === 'P2'
                            ? 'bg-orange-600 text-white border-orange-500'
                            : p.priority_level === 'P3'
                            ? 'bg-yellow-600/30 text-yellow-300 border-yellow-600'
                            : 'bg-emerald-900/40 text-emerald-300 border-emerald-700'
                        }`}
                      >
                        {p.priority_level}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onSelectProject(p.project_id)}
                        className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded border border-emerald-500/40 text-[11px] font-semibold transition flex items-center gap-1 mx-auto"
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
      <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs text-slate-400">
        <div>
          Page <span className="font-bold text-white">{currentPage}</span> of{' '}
          <span className="font-bold text-white">{totalPages}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition"
          >
            Previous
          </button>
          <button
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition"
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
