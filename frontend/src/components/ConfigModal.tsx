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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-lg p-6 shadow-xl space-y-5 text-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-teal-700" />
            <h2 className="text-base font-bold text-slate-900">Configure Risk Weights & Thresholds</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 border border-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Weights Sliders */}
        <div className="space-y-3 text-xs">
          <h3 className="font-bold text-slate-800">Risk Component Weights (Must sum to 1.0)</h3>
          {Object.entries(weights).map(([key, val]) => (
            <div key={key} className="space-y-1">
              <div className="flex justify-between text-slate-600 font-medium">
                <span className="capitalize">{key.replace('_', ' ')}</span>
                <span className="font-bold text-teal-700">{val.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.50"
                step="0.05"
                value={val}
                onChange={(e) => setWeights({ ...weights, [key]: parseFloat(e.target.value) })}
                className="w-full accent-teal-700"
              />
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 text-xs">
          <button onClick={onClose} className="px-4 py-2 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold border border-slate-200">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded bg-teal-700 hover:bg-teal-800 text-white font-bold transition shadow-sm"
          >
            {saving ? 'Recalculating Project Risks...' : 'Save & Recalculate Portfolio'}
          </button>
        </div>
      </div>
    </div>
  );
};
