import React from 'react';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Compass,
  FileSpreadsheet,
  Layers,
  Search,
  Settings,
  ShieldCheck,
  Zap
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openConfig: () => void;
  openModelStatus: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  openConfig,
  openModelStatus
}) => {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'projects', label: 'Project Portfolio', icon: Layers },
    { id: 'alerts', label: 'Risk & Early Warnings', icon: AlertTriangle },
    { id: 'analytics', label: 'Sector Analytics', icon: BarChart3 },
    { id: 'benchmarking', label: 'Benchmarking', icon: Compass },
    { id: 'cuf', label: 'CUF Experiment', icon: Zap },
    { id: 'upload', label: 'Data Quality & Integration', icon: FileSpreadsheet },
    { id: 'assistant', label: 'AI Insights', icon: Search }
  ];

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-xl">
      {/* Top Government Header */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Left Identity Block */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-teal-800/80 border border-teal-600 flex items-center justify-center font-bold text-teal-200 shadow-md">
            <ShieldCheck className="w-6 h-6 text-teal-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-wider text-white flex items-center gap-2">
                <span className="text-teal-400">DRISHTI</span>
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold border border-slate-700">
                MoSPI • SIH26103
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-300">
              Infrastructure Project Intelligence & Early Warning System
            </p>
            <p className="text-[11px] text-slate-400">
              Predictive Analytics & Early Warning for Infrastructure Projects
            </p>
          </div>
        </div>

        {/* Right Metadata Block */}
        <div className="flex items-center gap-4 text-xs">
          <div className="hidden lg:flex items-center gap-3 border-r border-slate-800 pr-4 text-slate-300">
            <div>
              <span className="text-slate-500 text-[10px] block">AI MODEL STATUS</span>
              <span className="font-semibold text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" /> Active
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">MODEL VERSION</span>
              <span className="font-mono text-slate-200">v2.1 (XGBoost)</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">LAST SYNCHRONIZED</span>
              <span className="text-slate-200">April 2026</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={openModelStatus}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 border border-slate-700 transition"
              title="View Model Performance & Versioning"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Model Specs</span>
            </button>

            <button
              onClick={openConfig}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 border border-slate-700 transition"
              title="Configure Risk Weights"
            >
              <Settings className="w-3.5 h-3.5 text-teal-400" />
              <span>Weights</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="max-w-7xl mx-auto px-4 flex space-x-1 overflow-x-auto scrollbar-none border-t border-slate-800">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition ${
                isActive
                  ? 'border-teal-500 text-teal-300 bg-slate-800/60 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-teal-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
