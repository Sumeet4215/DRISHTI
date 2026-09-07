import React, { useEffect, useState } from 'react';
import { X, Zap } from 'lucide-react';
import { api } from '../services/api';

interface ModelStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ModelStatusModal: React.FC<ModelStatusModalProps> = ({ isOpen, onClose }) => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      api.getModelStatus().then((res) => setData(res));
    }
  }, [isOpen]);

  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-2xl p-6 shadow-2xl space-y-5 text-white max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold">DRISHTI Model Status & Evaluation Report</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Model Metadata */}
        <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950 p-3 rounded-lg border border-slate-800">
          <div>
            <span className="text-slate-400">Model Version:</span>
            <div className="font-bold text-emerald-400">{data.version}</div>
          </div>
          <div>
            <span className="text-slate-400">Best Cost Model:</span>
            <div className="font-bold text-white">{data.metrics.best_cost_model}</div>
          </div>
          <div>
            <span className="text-slate-400">Best Time Model:</span>
            <div className="font-bold text-white">{data.metrics.best_time_model}</div>
          </div>
          <div>
            <span className="text-slate-400">Delay Duration Regressor MAE:</span>
            <div className="font-bold text-amber-400">{data.metrics.delay_duration_metrics.mae_months} months</div>
          </div>
        </div>

        {/* Global Feature Importances */}
        <div className="space-y-2 text-xs">
          <h3 className="font-bold text-slate-300">Global Feature Importance (XGBoost):</h3>
          <div className="space-y-1.5 max-h-48 overflow-y-auto scrollbar-thin">
            {Object.entries(data.metrics.global_feature_importance).map(([feat, score]: any, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800">
                <span className="font-semibold text-slate-300">{feat}</span>
                <span className="font-mono font-bold text-emerald-400">{score}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
