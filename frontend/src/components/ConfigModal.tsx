import React, { useState } from 'react';
import { Settings, X } from 'lucide-react';
import { api } from '../services/api';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved: () => void;
}

export const ConfigModal: React.FC<ConfigModalProps> = ({ isOpen, onClose, onConfigSaved }) => {
  const [weights, setWeights] = useState({
    cost_risk: 0.25,
    schedule_risk: 0.25,
    progress_risk: 0.2,
    mismatch_risk: 0.15,
    milestone_risk: 0.15
  });

  const [thresholds] = useState({
    LOW: 24.9,
    MODERATE: 49.9,
    HIGH: 74.9,
    CRITICAL: 100.0
  });

  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateConfig(weights, thresholds);
      setSaving(false);
      onConfigSaved();
      onClose();
    } catch (err) {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-lg p-6 shadow-2xl space-y-5 text-white">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold">Configure Risk Weights & Thresholds</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Weights Sliders */}
        <div className="space-y-3 text-xs">
          <h3 className="font-bold text-slate-300">Risk Component Weights (Must sum to 1.0)</h3>
          {Object.entries(weights).map(([key, val]) => (
            <div key={key} className="space-y-1">
              <div className="flex justify-between text-slate-400">
                <span className="capitalize">{key.replace('_', ' ')}</span>
                <span className="font-bold text-emerald-400">{val.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.50"
                step="0.05"
                value={val}
                onChange={(e) => setWeights({ ...weights, [key]: parseFloat(e.target.value) })}
                className="w-full accent-emerald-500"
              />
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-3 border-t border-slate-800 text-xs">
          <button onClick={onClose} className="px-4 py-2 rounded bg-slate-800 text-slate-300 font-semibold">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition shadow-md"
          >
            {saving ? 'Recalculating Project Risks...' : 'Save & Recalculate Portfolio'}
          </button>
        </div>
      </div>
    </div>
  );
};
