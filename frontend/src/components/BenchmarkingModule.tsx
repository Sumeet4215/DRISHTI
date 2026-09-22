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
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Compass className="w-5 h-5 text-teal-700" />
            <span>Peer Sector & Project Scale Benchmarking Engine</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Comparative performance metrics against national cohort medians across 22 Central Sector infrastructure categories.
          </p>
        </div>

        {/* Sector Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-600 font-semibold">Select Sector Cohort:</label>
          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-teal-600 font-semibold"
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
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="text-[10px] text-slate-500 uppercase font-semibold">Cohort Monitored Projects</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{currentSectorData.project_count}</div>
          <div className="text-[10px] text-slate-500 mt-1">Central Sector Portfolio</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="text-[10px] text-slate-500 uppercase font-semibold">Cohort Total Sanction Cost</div>
          <div className="text-2xl font-black text-teal-700 mt-1">
            ₹{(currentSectorData.original_cost ?? 0).toLocaleString()} Cr
          </div>
          <div className="text-[10px] text-teal-700 font-semibold mt-1">
            Revised: ₹{(currentSectorData.revised_cost ?? 0).toLocaleString()} Cr
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="text-[10px] text-slate-500 uppercase font-semibold">Cohort Avg Cost Escalation</div>
          <div className="text-2xl font-black text-red-700 mt-1">
            +{(
              (((currentSectorData.revised_cost ?? 0) - (currentSectorData.original_cost ?? 0)) /
                Math.max(1, currentSectorData.original_cost ?? 1)) *
              100
            ).toFixed(1)}%
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Aggregate Cost Variance</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="text-[10px] text-slate-500 uppercase font-semibold">Cohort Avg Risk Score</div>
          <div className="text-2xl font-black text-amber-700 mt-1">
            {currentSectorData.overall_risk_score ?? 50}/100
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Normalized Risk Index</div>
        </div>
      </div>

      {/* Peer Sector Benchmarking Grid */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-teal-700" />
          <span>Cross-Sector Performance Benchmark Table</span>
        </h3>

        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 font-semibold">
                <th className="py-2.5 px-3">Sector Name</th>
                <th className="py-2.5 px-3 text-center">Projects</th>
                <th className="py-2.5 px-3 text-right">Sanction Cost (Cr)</th>
                <th className="py-2.5 px-3 text-right">Revised Cost (Cr)</th>
                <th className="py-2.5 px-3 text-center">Cost Escalation</th>
                <th className="py-2.5 px-3 text-center">Avg Risk Index</th>
                <th className="py-2.5 px-3 text-center">Benchmark Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
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
                      isSelected ? 'bg-teal-50/70 border-l-4 border-l-teal-600' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{sec.sector}</td>
                    <td className="py-2.5 px-3 text-center font-mono text-slate-600">{sec.project_count}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                      ₹{origCost.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-900 font-bold">
                      ₹{revCost.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono">
                      <span className={escalation > 20 ? 'text-red-700 font-bold' : 'text-amber-700 font-semibold'}>
                        +{escalation.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded font-extrabold text-[11px] ${
                          riskScore >= 70
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : riskScore >= 45
                            ? 'bg-orange-50 text-orange-700 border border-orange-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {riskScore}/100
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {riskScore < 45 ? (
                        <span className="text-[10px] text-emerald-700 font-semibold flex items-center justify-center gap-1">
                          <Award className="w-3 h-3" /> Outperforming
                        </span>
                      ) : riskScore >= 70 ? (
                        <span className="text-[10px] text-red-700 font-semibold flex items-center justify-center gap-1">
                          <ShieldAlert className="w-3 h-3" /> Underperforming
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500">At Peer Median</span>
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
