import React, { useEffect, useState } from 'react';
import { CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { api } from '../services/api';

export const CUFExperimentModule: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    api.getCUFExperiment().then((res) => {
      setData(res);
      setLoading(false);
    });
  }, []);

  if (loading || !data) {
    return (
      <div className="p-12 text-center text-slate-500 font-medium">
        Running Common Upload Form (CUF) Variable Ablation Experiment...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-2">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-600" />
          <h2 className="text-base font-bold text-slate-900">
            Common Upload Form (CUF) Ablation Experiment
          </h2>
          <span className="text-xs px-2.5 py-0.5 rounded bg-teal-100 text-teal-800 font-semibold border border-teal-200">
            Experiment 1 vs Experiment 2
          </span>
        </div>
        <p className="text-xs text-slate-500">
          Comparing prediction performance of models trained on <b>Existing CUF Standard Fields</b> vs models augmented with <b>Proposed Additional Variables</b> (Land acquisition %, Contractor rating, Payment delays, Litigation).
        </p>
      </div>

      {/* Key Finding Alert Box */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3 shadow-sm">
        <ShieldCheck className="w-6 h-6 text-emerald-700 flex-shrink-0 mt-0.5" />
        <div>
          <div className="font-bold text-emerald-800 text-sm">Experimental Key Finding:</div>
          <p className="text-xs text-slate-800 mt-1">{data.key_finding}</p>
        </div>
      </div>

      {/* Model Performance Comparison Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Empirical Model Performance Table</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <th className="py-3 px-3">Algorithm</th>
                <th className="py-3 px-3 text-center">Feature Set</th>
                <th className="py-3 px-3 text-center">Accuracy</th>
                <th className="py-3 px-3 text-center">Precision</th>
                <th className="py-3 px-3 text-center">Recall (Sensitivity)</th>
                <th className="py-3 px-3 text-center">F1-Score</th>
                <th className="py-3 px-3 text-center">ROC-AUC</th>
                <th className="py-3 px-3 text-center">PR-AUC</th>
                <th className="py-3 px-3 text-center">ROC Delta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {data.comparison.map((row: any, idx: number) => (
                <React.Fragment key={idx}>
                  {/* CUF Only Row */}
                  <tr className="bg-white text-slate-700">
                    <td className="py-2.5 px-3 font-bold text-slate-900 border-b border-slate-200" rowSpan={2}>
                      {row.model_name}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-slate-500">
                      CUF Standard (9 fields)
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono">{row.cuf_only.accuracy}</td>
                    <td className="py-2.5 px-3 text-center font-mono">{row.cuf_only.precision}</td>
                    <td className="py-2.5 px-3 text-center font-mono text-amber-700 font-bold">{row.cuf_only.recall}</td>
                    <td className="py-2.5 px-3 text-center font-mono">{row.cuf_only.f1_score}</td>
                    <td className="py-2.5 px-3 text-center font-mono">{row.cuf_only.roc_auc}</td>
                    <td className="py-2.5 px-3 text-center font-mono">{row.cuf_only.pr_auc}</td>
                    <td className="py-2.5 px-3 text-center font-mono text-slate-500 border-b border-slate-200" rowSpan={2}>
                      <span className="text-teal-700 font-extrabold">+{row.roc_auc_delta_pct}%</span>
                    </td>
                  </tr>

                  {/* CUF + Additional Row */}
                  <tr className="bg-teal-50/50 text-slate-900 border-b border-slate-200">
                    <td className="py-2.5 px-3 text-center font-mono text-teal-800 font-bold">
                      CUF + Additional (14 fields)
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-900">{row.cuf_plus_additional.accuracy}</td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-900">{row.cuf_plus_additional.precision}</td>
                    <td className="py-2.5 px-3 text-center font-mono font-extrabold text-teal-800">{row.cuf_plus_additional.recall}</td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-900">{row.cuf_plus_additional.f1_score}</td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-teal-800">{row.cuf_plus_additional.roc_auc}</td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-900">{row.cuf_plus_additional.pr_auc}</td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Proposed Additional Variables List */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-slate-900">Proposed Additional CUF Variables:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {data.additional_variables.map((v: string, i: number) => (
            <div key={i} className="flex items-center gap-2 p-2.5 rounded bg-slate-50 border border-slate-200">
              <CheckCircle2 className="w-4 h-4 text-teal-700 flex-shrink-0" />
              <span className="text-slate-800 font-medium">{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
