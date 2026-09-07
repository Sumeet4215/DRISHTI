import React, { useState } from 'react';
import { Compass, TrendingUp, ShieldAlert, Award } from 'lucide-react';
import type { ExecutiveOverview } from '../types';

interface BenchmarkingModuleProps {
  overview: ExecutiveOverview | null;
}

export const BenchmarkingModule: React.FC<BenchmarkingModuleProps> = ({ overview }) => {
  const [selectedSector, setSelectedSector] = useState<string>('Road Transport & Highways');

  if (!overview) return null;

  const sectors = overview.sector_analytics;
  const currentSectorData = sectors.find((s) => s.sector === selectedSector) || sectors[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Compass className="w-5 h-5 text-teal-400" />
            <span>Peer Sector & Project Scale Benchmarking Engine</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Comparative performance metrics against national cohort medians across 22 Central Sector infrastructure categories.
          </p>
        </div>

        {/* Sector Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400 font-semibold">Select Sector Cohort:</label>
          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-teal-500 font-semibold"
          >
            {sectors.map((s) => (
              <option key={s.sector} value={s.sector}>
                {s.sector} ({s.project_count} Projects)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Cohort KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">Cohort Monitored Projects</div>
          <div className="text-2xl font-black text-white mt-1">{currentSectorData.project_count}</div>
          <div className="text-[10px] text-slate-500 mt-1">Central Sector Portfolio</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">Cohort Total Sanction Cost</div>
          <div className="text-2xl font-black text-teal-400 mt-1">
            ₹{(currentSectorData.original_cost ?? 0).toLocaleString()} Cr
          </div>
          <div className="text-[10px] text-teal-500 font-semibold mt-1">
            Revised: ₹{(currentSectorData.revised_cost ?? 0).toLocaleString()} Cr
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">Cohort Avg Cost Escalation</div>
          <div className="text-2xl font-black text-red-400 mt-1">
            +{(
              (((currentSectorData.revised_cost ?? 0) - (currentSectorData.original_cost ?? 0)) /
                Math.max(1, currentSectorData.original_cost ?? 1)) *
              100
            ).toFixed(1)}%
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Aggregate Cost Variance</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">Cohort Avg Risk Score</div>
          <div className="text-2xl font-black text-amber-400 mt-1">
            {currentSectorData.overall_risk_score ?? 50}/100
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Normalized Risk Index</div>
        </div>
      </div>

      {/* Peer Sector Benchmarking Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span>Cross-Sector Performance Benchmark Table</span>
        </h3>

        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <th className="py-2.5 px-3">Sector Name</th>
                <th className="py-2.5 px-3 text-center">Projects</th>
                <th className="py-2.5 px-3 text-right">Sanction Cost (Cr)</th>
                <th className="py-2.5 px-3 text-right">Revised Cost (Cr)</th>
                <th className="py-2.5 px-3 text-center">Cost Escalation</th>
                <th className="py-2.5 px-3 text-center">Avg Risk Index</th>
                <th className="py-2.5 px-3 text-center">Benchmark Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {sectors.map((sec) => {
                const origCost = sec.original_cost ?? 0;
                const revCost = sec.revised_cost ?? 0;
                const riskScore = sec.overall_risk_score ?? 50;
                const escalation = ((revCost - origCost) / Math.max(1, origCost)) * 100;
                const isSelected = sec.sector === selectedSector;
                return (
                  <tr
                    key={sec.sector}
                    onClick={() => setSelectedSector(sec.sector)}
                    className={`cursor-pointer transition ${
                      isSelected ? 'bg-teal-950/40 border-l-4 border-l-teal-500' : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="py-2.5 px-3 font-semibold text-slate-200">{sec.sector}</td>
                    <td className="py-2.5 px-3 text-center font-mono text-slate-300">{sec.project_count}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-300">
                      ₹{origCost.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-200 font-bold">
                      ₹{revCost.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono">
                      <span className={escalation > 20 ? 'text-red-400 font-bold' : 'text-amber-400'}>
                        +{escalation.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded font-extrabold text-[11px] ${
                          riskScore >= 70
                            ? 'bg-red-950 text-red-400 border border-red-800'
                            : riskScore >= 45
                            ? 'bg-orange-950 text-orange-400 border border-orange-800'
                            : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        }`}
                      >
                        {riskScore}/100
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {riskScore < 45 ? (
                        <span className="text-[10px] text-emerald-400 font-semibold flex items-center justify-center gap-1">
                          <Award className="w-3 h-3" /> Outperforming
                        </span>
                      ) : riskScore >= 70 ? (
                        <span className="text-[10px] text-red-400 font-semibold flex items-center justify-center gap-1">
                          <ShieldAlert className="w-3 h-3" /> Underperforming
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">At Peer Median</span>
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
  );
};
