import React from 'react';
import { BarChart3 } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import type { ExecutiveOverview } from '../types';

interface SectorAnalyticsProps {
  overview: ExecutiveOverview | null;
}

export const SectorAnalytics: React.FC<SectorAnalyticsProps> = ({ overview }) => {
  if (!overview) return null;

  const data = overview.sector_analytics;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-teal-700" />
          <span>Exploratory Data Analysis (EDA) & Sector Performance</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Historical project execution trends, sector-wise risk exposure, cost escalation, and schedule slippages across 22 Central Infrastructure Sectors.
        </p>
      </div>

      {/* Sector Risk & Expected Delay Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Sector-Wise Average Risk Score (0–100)</h3>
          <p className="text-xs text-slate-500 mb-4">Higher scores indicate elevated cost and schedule overrun probability.</p>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={{ left: 40 }}>
                <XAxis type="number" stroke="#64748b" fontSize={10} domain={[0, 100]} />
                <YAxis dataKey="sector" type="category" stroke="#334155" fontSize={9} width={120} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', color: '#0f172a', fontSize: '11px' }} />
                <Bar dataKey="overall_risk_score" name="Avg Risk Score" fill="#dc2626" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Sector-Wise Original vs Revised Cost (₹ Cr)</h3>
          <p className="text-xs text-slate-500 mb-4">Comparing aggregate sanctioned original capital vs current revised capital.</p>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.slice(0, 8)}>
                <XAxis dataKey="sector" stroke="#334155" fontSize={9} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', color: '#0f172a', fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#334155' }} />
                <Bar dataKey="original_cost" name="Original Cost (Cr)" fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="revised_cost" name="Revised Cost (Cr)" fill="#ea580c" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
