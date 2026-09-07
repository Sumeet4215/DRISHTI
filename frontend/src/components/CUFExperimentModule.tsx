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
      <div className="p-12 text-center text-slate-400">
        Running Common Upload Form (CUF) Variable Ablation Experiment...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-2">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-400" />
          <h2 className="text-base font-bold text-white">
            Common Upload Form (CUF) Ablation Experiment
          </h2>
          <span className="text-xs px-2.5 py-0.5 rounded bg-emerald-950 text-emerald-400 font-semibold border border-emerald-800">
            Experiment 1 vs Experiment 2
          </span>
        </div>
        <p className="text-xs text-slate-400">
          Comparing prediction performance of models trained on <b>Existing CUF Standard Fields</b> vs models augmented with <b>Proposed Additional Variables</b> (Land acquisition %, Contractor rating, Payment delays, Litigation).
        </p>
      </div>

      {/* Key Finding Alert Box */}
      <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-xl p-4 flex items-start gap-3 shadow-md">
        <ShieldCheck className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
        <div>
          <div className="font-bold text-emerald-400 text-sm">Experimental Key Finding:</div>
          <p className="text-xs text-slate-200 mt-1">{data.key_finding}</p>
        </div>
      </div>

      {/* Model Performance Comparison Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
        <h3 className="text-sm font-bold text-white">Empirical Model Performance Table</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
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
            <tbody className="divide-y divide-slate-800/60">
              {data.comparison.map((row: any, idx: number) => (
                <React.Fragment key={idx}>
                  {/* CUF Only Row */}
                  <tr className="bg-slate-900/50 text-slate-300">
                    <td className="py-2.5 px-3 font-bold text-white" rowSpan={2}>
                      {row.model_name}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-slate-400">
                      CUF Standard (9 fields)
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono">{row.cuf_only.accuracy}</td>
                    <td className="py-2.5 px-3 text-center font-mono">{row.cuf_only.precision}</td>
                    <td className="py-2.5 px-3 text-center font-mono text-amber-400 font-bold">{row.cuf_only.recall}</td>
                    <td className="py-2.5 px-3 text-center font-mono">{row.cuf_only.f1_score}</td>
                    <td className="py-2.5 px-3 text-center font-mono">{row.cuf_only.roc_auc}</td>
                    <td className="py-2.5 px-3 text-center font-mono">{row.cuf_only.pr_auc}</td>
                    <td className="py-2.5 px-3 text-center font-mono text-slate-500" rowSpan={2}>
                      <span className="text-emerald-400 font-extrabold">+{row.roc_auc_delta_pct}%</span>
                    </td>
                  </tr>

                  {/* CUF + Additional Row */}
                  <tr className="bg-emerald-950/20 text-slate-200 border-b border-slate-800">
                    <td className="py-2.5 px-3 text-center font-mono text-emerald-400 font-bold">
                      CUF + Additional (14 fields)
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-white">{row.cuf_plus_additional.accuracy}</td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-white">{row.cuf_plus_additional.precision}</td>
                    <td className="py-2.5 px-3 text-center font-mono font-extrabold text-emerald-400">{row.cuf_plus_additional.recall}</td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-white">{row.cuf_plus_additional.f1_score}</td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-emerald-400">{row.cuf_plus_additional.roc_auc}</td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-white">{row.cuf_plus_additional.pr_auc}</td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Proposed Additional Variables List */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
        <h3 className="text-sm font-bold text-white">Proposed Additional CUF Variables:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {data.additional_variables.map((v: string, i: number) => (
            <div key={i} className="flex items-center gap-2 p-2.5 rounded bg-slate-950 border border-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span className="text-slate-200 font-medium">{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
