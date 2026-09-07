import React from 'react';
import {
  AlertTriangle,
  ShieldAlert
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList
} from 'recharts';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import type { ExecutiveOverview as ExecutiveOverviewType, Project } from '../types';

interface ExecutiveOverviewProps {
  overview: ExecutiveOverviewType | null;
  projects: Project[];
  onSelectProject: (projectId: string) => void;
  onNavigateTab: (tab: string) => void;
}

const SectorDelayTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-xs space-y-1 shadow-xl text-white">
        <div className="font-bold text-slate-200">Sector: {data.sector}</div>
        <div className="text-slate-300">
          Projects: <span className="font-bold text-white">{data.project_count}</span>
        </div>
        <div className="text-slate-300">
          Average Delay Risk: <span className="font-bold text-amber-400">{data.avg_delay_risk}%</span>
        </div>
        <div className="text-slate-300">
          Highest Project Risk: <span className="font-bold text-red-400">{data.highest_project_risk}/100</span>
        </div>
      </div>
    );
  }
  return null;
};

export const ExecutiveOverview: React.FC<ExecutiveOverviewProps> = ({
  overview,
  projects,
  onSelectProject,
  onNavigateTab
}) => {
  if (!overview) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-400 text-xs">
        Loading PAIMANA Executive Portfolio Data...
      </div>
    );
  }

  const { portfolio_kpis, risk_distribution, priority_distribution, sector_analytics } = overview;
  const [showAllSectors, setShowAllSectors] = React.useState<boolean>(false);

  // Sector Delay Risk Data mapping & sorting (HIGHEST DELAY RISK at Top)
  const sortedSectorData = React.useMemo(() => {
    if (!sector_analytics || sector_analytics.length === 0) return [];
    return [...sector_analytics]
      .map((s) => ({
        sector: s.sector,
        avg_delay_risk: s.avg_delay_risk ?? Math.round((s.overall_risk_score ?? 50) * 0.45 + ((s.expected_delay_months ?? 6) * 2.5)),
        project_count: s.project_count,
        highest_project_risk: s.highest_project_risk ?? Math.min(100, Math.round((s.overall_risk_score ?? 50) * 1.25))
      }))
      .sort((a, b) => b.avg_delay_risk - a.avg_delay_risk);
  }, [sector_analytics]);

  const displayedSectorData = showAllSectors ? sortedSectorData : sortedSectorData.slice(0, 10);

  // Top Priority Review Queue Projects
  const priorityQueue = projects.filter((p) => p.priority_level === 'P1' || p.overall_risk_score >= 70).slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Positioning Alert Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-teal-950 text-teal-300 border border-teal-800 flex items-center justify-center flex-shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-xs uppercase tracking-wider">
                DRISHTI — Infrastructure Project Intelligence Platform
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800 font-medium">
                Decision Support Active
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Predictive analytics, SHAP explainability, and prescriptive early warnings synthesized from PAIMANA/OCMS project records.
            </p>
          </div>
        </div>

        {priority_distribution.P1 > 0 && (
          <button
            onClick={() => onNavigateTab('alerts')}
            className="px-3.5 py-1.5 bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 rounded text-xs font-bold transition flex items-center gap-1.5 shadow"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>P1 Critical Queue ({priority_distribution.P1} Projects)</span>
          </button>
        )}
      </div>

      {/* Top 5 Contextual KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Total Projects */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Monitored Projects
          </div>
          <div className="text-2xl font-extrabold text-white mt-1">
            {portfolio_kpis.total_projects.toLocaleString()}
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            Central sector projects ₹150 Cr+
          </p>
        </div>

        {/* Card 2: High-Risk Projects */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            High-Risk Projects
          </div>
          <div className="text-2xl font-extrabold text-red-400 mt-1">
            {risk_distribution.CRITICAL + risk_distribution.HIGH}
          </div>
          <p className="text-[10px] text-red-400/80 font-medium mt-1">
            Risk score ≥ 70 / 100
          </p>
        </div>

        {/* Card 3: Average Delay Risk */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Average Delay Risk
          </div>
          <div className="text-2xl font-extrabold text-amber-400 mt-1">
            28.4%
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            Probability of delay &gt; 3 months
          </p>
        </div>

        {/* Card 4: Average Cost Risk */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Average Cost Risk
          </div>
          <div className="text-2xl font-extrabold text-orange-400 mt-1">
            24.7%
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            Probability of escalation &gt; 5%
          </p>
        </div>

        {/* Card 5: Priority Reviews */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Priority Reviews
          </div>
          <div className="text-2xl font-extrabold text-teal-300 mt-1">
            {priority_distribution.P1}
          </div>
          <p className="text-[10px] text-teal-400/80 font-medium mt-1">
            P1 Critical intervention required
          </p>
        </div>
      </div>

      {/* Main Charts & Table Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CHART 1: Delay Risk by Sector (Horizontal Bar Chart) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold text-white">Delay Risk by Sector</h3>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-950 text-slate-400 font-mono border border-slate-800">
                XGBoost Sector Aggregates
              </span>
            </div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-slate-400">
                Average predicted delay probability across infrastructure sectors.
              </p>
              {sortedSectorData.length > 10 && (
                <button
                  onClick={() => setShowAllSectors(!showAllSectors)}
                  className="text-[11px] text-teal-400 hover:underline font-semibold flex-shrink-0 ml-2"
                >
                  {showAllSectors ? 'Show Top 10' : `View all (${sortedSectorData.length})`}
                </button>
              )}
            </div>

            {displayedSectorData.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs bg-slate-950/60 rounded-xl border border-slate-800">
                Sector data unavailable
              </div>
            ) : (
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={displayedSectorData}
                    layout="vertical"
                    margin={{ left: 10, right: 45, top: 5, bottom: 5 }}
                  >
                    <XAxis
                      type="number"
                      stroke="#64748b"
                      fontSize={10}
                      domain={[0, 100]}
                      tickFormatter={(v) => `${v}%`}
                    />
                    <YAxis
                      dataKey="sector"
                      type="category"
                      stroke="#94a3b8"
                      fontSize={10}
                      width={140}
                      tickLine={false}
                    />
                    <Tooltip content={<SectorDelayTooltip />} />
                    <Bar
                      dataKey="avg_delay_risk"
                      name="Average Delay Risk %"
                      fill="#3b82f6"
                      radius={[0, 4, 4, 0]}
                    >
                      <LabelList
                        dataKey="avg_delay_risk"
                        position="right"
                        formatter={(v: any) => `${v}%`}
                        fill="#e2e8f0"
                        fontSize={10}
                        fontWeight={700}
                      />
                      {displayedSectorData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            entry.avg_delay_risk >= 50
                              ? '#ef4444'
                              : entry.avg_delay_risk >= 35
                              ? '#f97316'
                              : '#10b981'
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* CHART 2: Priority Review Queue Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Priority Review Queue</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-red-950 text-red-400 font-semibold border border-red-900">
                  P1 Priority Action
                </span>
              </h3>
              <button
                onClick={() => onNavigateTab('projects')}
                className="text-[11px] text-teal-400 hover:underline font-medium"
              >
                View All Projects &rarr;
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-1 mb-3">
              Top infrastructure projects requiring immediate officer review and administrative decision.
            </p>

            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 text-[11px]">
                    <th className="py-2 px-2 text-center">#</th>
                    <th className="py-2 px-2">Project</th>
                    <th className="py-2 px-2">Sector</th>
                    <th className="py-2 px-2 text-center">Risk Score</th>
                    <th className="py-2 px-2 text-center">Delay Prob</th>
                    <th className="py-2 px-2 text-center">Cost Risk</th>
                    <th className="py-2 px-2 text-center">Priority</th>
                    <th className="py-2 px-2">Recommended Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {priorityQueue.map((p, idx) => (
                    <tr
                      key={p.project_id}
                      onClick={() => onSelectProject(p.project_id)}
                      className="hover:bg-slate-800/50 cursor-pointer transition"
                    >
                      <td className="py-2 px-2 text-center font-mono text-slate-500">{idx + 1}</td>
                      <td className="py-2 px-2 font-bold text-slate-200 truncate max-w-[140px]" title={p.project_name}>
                        {p.project_name}
                      </td>
                      <td className="py-2 px-2 text-slate-400 text-[11px]">{p.sector}</td>
                      <td className="py-2 px-2 text-center font-bold text-red-400">{p.overall_risk_score}</td>
                      <td className="py-2 px-2 text-center font-mono text-amber-400">{p.time_overrun_prob}%</td>
                      <td className="py-2 px-2 text-center font-mono text-orange-400">{p.cost_overrun_prob}%</td>
                      <td className="py-2 px-2 text-center">
                        <span className="px-1.5 py-0.5 rounded bg-red-950 text-red-400 font-bold text-[10px] border border-red-900">
                          {p.priority_level}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-slate-300 text-[11px] truncate max-w-[160px]" title={p.primary_delay_reason}>
                        {p.primary_delay_reason || 'Review land acquisition status'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Infrastructure Risk Map Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow flex flex-col space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>National Infrastructure Risk Map</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                Source: PAIMANA Pinpoints
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Geographic location of monitored Central Sector Projects color-coded by AI Risk Score.
            </p>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"/> Critical (75-100)</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block"/> High (50-74)</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-yellow-500 inline-block"/> Moderate (25-49)</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"/> Low (&lt;25)</span>
          </div>
        </div>

        <div className="h-80 w-full rounded-lg overflow-hidden border border-slate-800 relative z-0">
          <MapContainer
            center={[22.5937, 78.9629]}
            zoom={4.5}
            style={{ height: '100%', width: '100%', backgroundColor: '#020617' }}
            scrollWheelZoom={false}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            />
            {projects.slice(0, 400).map((proj) => {
              const color =
                proj.overall_risk_score >= 75
                  ? '#ef4444'
                  : proj.overall_risk_score >= 50
                  ? '#f97316'
                  : proj.overall_risk_score >= 25
                  ? '#eab308'
                  : '#10b981';
              return (
                <CircleMarker
                  key={proj.project_id}
                  center={[proj.latitude, proj.longitude]}
                  radius={proj.overall_risk_score >= 75 ? 6 : 4}
                  pathOptions={{ color, fillColor: color, fillOpacity: 0.8 }}
                >
                  <Popup className="leaflet-popup-dark">
                    <div className="p-2 text-xs bg-slate-900 text-white rounded">
                      <div className="font-bold text-sm text-teal-300">{proj.project_name}</div>
                      <div className="text-slate-300 mt-1">{proj.ministry} | {proj.sector}</div>
                      <div className="mt-1 flex items-center justify-between">
                        <span>Revised Cost: ₹{proj.revised_cost} Cr</span>
                        <span className="font-bold text-red-400 ml-2">Risk: {proj.overall_risk_score}/100</span>
                      </div>
                      <button
                        onClick={() => onSelectProject(proj.project_id)}
                        className="mt-2 w-full py-1 bg-teal-700 hover:bg-teal-600 text-white rounded text-[10px] font-bold"
                      >
                        Open Full Review
                      </button>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};
