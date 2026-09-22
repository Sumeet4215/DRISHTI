import React, { useEffect, useState } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  BarChart2,
  CheckCircle2,
  Compass,
  X,
  Zap
} from 'lucide-react';
import { api } from '../services/api';
import type { ProjectDetailResponse } from '../types';

interface ProjectDetailModalProps {
  projectId: string | null;
  onClose: () => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({ projectId, onClose }) => {
  const [data, setData] = useState<ProjectDetailResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    api
      .getProjectDetail(projectId)
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to fetch project detail');
        setLoading(false);
      });
  }, [projectId]);

  if (!projectId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-xl relative text-slate-900">
        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 border border-slate-200 transition z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {loading ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
            <span>Running AI Explainability & Risk Scoring models for {projectId}...</span>
          </div>
        ) : error || !data ? (
          <div className="p-8 text-center text-red-600 font-medium">
            {error || 'Failed to load project details.'}
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Header Banner */}
            <div className="border-b border-slate-200 pb-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-slate-100 text-teal-800 border border-slate-200 font-semibold">
                      {data.project.project_id}
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                      {data.project.sector}
                    </span>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded font-extrabold border ${
                        data.early_warning.priority_level === 'P1'
                          ? 'bg-red-100 text-red-800 border-red-300'
                          : data.early_warning.priority_level === 'P2'
                          ? 'bg-orange-100 text-orange-800 border-orange-300'
                          : 'bg-amber-100 text-amber-800 border-amber-300'
                      }`}
                    >
                      Priority {data.early_warning.priority_level}
                    </span>
                  </div>
                  <h1 className="text-xl font-bold mt-2 text-slate-900">{data.project.project_name}</h1>
                  <p className="text-xs text-slate-500 mt-1">
                    {data.project.ministry} • Agency: <span className="text-slate-800 font-semibold">{data.project.implementing_agency}</span> • {data.project.state}
                  </p>
                </div>

                {/* Risk Score Badge */}
                <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="text-right">
                    <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                      Overall Risk Score
                    </div>
                    <div className="text-2xl font-black text-slate-900">
                      {data.risk_assessment.overall_risk_score}/100
                    </div>
                  </div>
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black ${
                      data.risk_assessment.risk_level === 'CRITICAL'
                        ? 'bg-red-600 text-white shadow-sm'
                        : data.risk_assessment.risk_level === 'HIGH'
                        ? 'bg-orange-600 text-white shadow-sm'
                        : 'bg-amber-600 text-white shadow-sm'
                    }`}
                  >
                    {data.risk_assessment.risk_level.substring(0, 1)}
                  </div>
                </div>
              </div>
            </div>

            {/* Financial & Schedule Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <span className="text-[10px] font-semibold text-slate-500 uppercase">Original Sanction</span>
                <div className="text-lg font-bold text-slate-900 mt-1">₹{data.project.original_cost.toLocaleString()} Cr</div>
                <div className="text-[10px] text-slate-500 mt-1">Approved Baseline</div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <span className="text-[10px] font-semibold text-slate-500 uppercase">Revised Cost</span>
                <div className="text-lg font-bold text-red-700 mt-1">₹{data.project.revised_cost.toLocaleString()} Cr</div>
                <div className="text-[10px] text-red-700 font-semibold mt-1">
                  Escalation: +{(((data.project.revised_cost / data.project.original_cost) - 1) * 100).toFixed(1)}%
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <span className="text-[10px] font-semibold text-slate-500 uppercase">Cumulative Spent</span>
                <div className="text-lg font-bold text-teal-700 mt-1">₹{data.project.cumulative_expenditure.toLocaleString()} Cr</div>
                <div className="text-[10px] text-teal-700 mt-1">
                  Financial Progress: {data.project.financial_progress_pct}%
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <span className="text-[10px] font-semibold text-slate-500 uppercase">Predicted Delay</span>
                <div className="text-lg font-bold text-amber-700 mt-1">+{data.ml_predictions.expected_delay_months} Months</div>
                <div className="text-[10px] text-amber-700 mt-1">Range: {data.ml_predictions.delay_range}</div>
              </div>
            </div>

            {/* Progress Mismatch Bar */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900">Physical vs Financial Execution Mismatch</span>
                <span className="text-amber-700 font-semibold">
                  Mismatch Gap: +{(data.project.financial_progress_pct - data.project.physical_progress_pct).toFixed(1)}%
                </span>
              </div>
              <div className="space-y-2">
                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                    <span>Physical Execution Progress</span>
                    <span className="font-bold text-teal-700">{data.project.physical_progress_pct}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-teal-600 h-full rounded-full"
                      style={{ width: `${Math.min(100, data.project.physical_progress_pct)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                    <span>Financial Disbursement Progress</span>
                    <span className="font-bold text-cyan-700">{data.project.financial_progress_pct}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-cyan-600 h-full rounded-full"
                      style={{ width: `${Math.min(100, data.project.financial_progress_pct)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Explainable AI (SHAP) & Risk Components */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* SHAP Top Risk Drivers */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-600" />
                  <span>Explainable AI — Top Risk Drivers (SHAP)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Feature contributions identified by XGBoost SHAP explainer for this specific project:
                </p>

                <div className="space-y-2">
                  {data.ml_predictions.top_risk_drivers.map((driver, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded bg-white border border-slate-200 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-400">{idx + 1}.</span>
                        <span className="font-semibold text-slate-800">{formatFeatureName(driver.feature)}</span>
                      </div>
                      <span
                        className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                          driver.impact === 'INCREASES_RISK'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {driver.impact === 'INCREASES_RISK' ? '+' : ''}{driver.importance_score}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk Components Decomposition */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-teal-600" />
                  <span>Normalized Risk Decomposition (0–100)</span>
                </h3>
                <p className="text-xs text-slate-500">Weighted risk components contributing to overall risk score:</p>

                <div className="space-y-2.5 text-xs">
                  <div>
                    <div className="flex justify-between text-slate-700 mb-1 font-medium">
                      <span>Cost Escalation Risk</span>
                      <span className="font-bold text-red-700">{data.risk_assessment.components.cost_risk}/100</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-red-600 h-full" style={{ width: `${data.risk_assessment.components.cost_risk}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-700 mb-1 font-medium">
                      <span>Schedule Delay Risk</span>
                      <span className="font-bold text-orange-700">{data.risk_assessment.components.schedule_risk}/100</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-orange-600 h-full" style={{ width: `${data.risk_assessment.components.schedule_risk}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-700 mb-1 font-medium">
                      <span>Milestone Slippage Risk</span>
                      <span className="font-bold text-amber-700">{data.risk_assessment.components.milestone_risk}/100</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-amber-600 h-full" style={{ width: `${data.risk_assessment.components.milestone_risk}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-700 mb-1 font-medium">
                      <span>Financial-Progress Mismatch Risk</span>
                      <span className="font-bold text-teal-700">{data.risk_assessment.components.mismatch_risk}/100</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-teal-600 h-full" style={{ width: `${data.risk_assessment.components.mismatch_risk}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Early Warning Signals & Decision Support Recommendations */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span>Early Warning Signals & Actionable Decision Support</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Signals */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Detected Warning Signals</span>
                  {data.early_warning.early_warning_signals.map((sig, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-red-50/80 border border-red-200 text-xs">
                      <div className="font-bold text-red-800 flex items-center gap-1.5">
                        <AlertOctagon className="w-3.5 h-3.5 text-red-600" />
                        <span>{sig.title}</span>
                      </div>
                      <p className="text-slate-700 mt-1">{sig.description}</p>
                    </div>
                  ))}
                </div>

                {/* Recommendations */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Prescriptive Recommendations</span>
                  {data.early_warning.prescriptive_recommendations.map((rec, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-emerald-50/80 border border-emerald-200 text-xs">
                      <div className="font-bold text-emerald-800 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{rec.category}</span>
                      </div>
                      <p className="text-slate-900 font-medium mt-1">{rec.action}</p>
                      <p className="text-slate-600 text-[11px] mt-1 font-italic">Rationale: {rec.rationale}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Benchmarking Section */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Compass className="w-4 h-4 text-blue-600" />
                <span>Sector & Cost Scale Benchmarking</span>
              </h3>
              <p className="text-xs text-slate-500">
                Comparing this project against peer median performance in <span className="text-slate-900 font-semibold">{data.benchmark.cohort_name}</span> (Cohort size: {data.benchmark.cohort_sample_size} projects):
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-2">
                <div className="p-3 rounded-lg bg-white border border-slate-200">
                  <div className="text-slate-500">Cost Escalation Benchmark</div>
                  <div className="text-base font-bold text-slate-900 mt-1">
                    {data.benchmark.target_project.cost_escalation_pct}% vs {data.benchmark.benchmark.median_cost_escalation_pct}% Median
                  </div>
                  <div className="text-[10px] font-bold text-amber-700 mt-1">
                    {data.benchmark.performance_comparison.cost_status}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-white border border-slate-200">
                  <div className="text-slate-500">Schedule Delay Benchmark</div>
                  <div className="text-base font-bold text-slate-900 mt-1">
                    +{data.benchmark.target_project.schedule_delay_months}m vs +{data.benchmark.benchmark.median_schedule_delay_months}m Median
                  </div>
                  <div className="text-[10px] font-bold text-amber-700 mt-1">
                    {data.benchmark.performance_comparison.delay_status}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-white border border-slate-200">
                  <div className="text-slate-500">Risk Score Benchmark</div>
                  <div className="text-base font-bold text-slate-900 mt-1">
                    {data.benchmark.target_project.risk_score} vs {data.benchmark.benchmark.median_risk_score} Median
                  </div>
                  <div className="text-[10px] font-bold text-red-700 mt-1">
                    {data.benchmark.performance_comparison.risk_status}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

function formatFeatureName(name: string): string {
  const map: Record<string, string> = {
    original_cost: 'Original Sanction Cost (₹ Cr)',
    planned_duration_months: 'Planned Duration (Months)',
    physical_progress_pct: 'Physical Progress (%)',
    financial_progress_pct: 'Financial Progress (%)',
    project_age_months: 'Project Age (Months)',
    progress_velocity: 'Execution Progress Velocity',
    fin_phys_mismatch_pct: 'Financial-Progress Mismatch Gap',
    milestone_delay_rate: 'Milestone Slippage Rate',
    cost_efficiency_ratio: 'Cost Expenditure Ratio',
    land_acquisition_ratio: 'Land Handover Completion Ratio',
    contractor_score_norm: 'Contractor Performance Score',
    litigation_flag: 'Active Court Litigation Flag',
    payment_delay_months: 'Payment Clearance Delay Days',
    regulatory_cleared_flag: 'Regulatory & Forest Clearances'
  };
  return map[name] || name;
}
