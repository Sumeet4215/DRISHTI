import React, { useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { ExecutiveOverview } from './components/ExecutiveOverview';
import { ProjectTable } from './components/ProjectTable';
import { ProjectDetailModal } from './components/ProjectDetailModal';
import { SectorAnalytics } from './components/SectorAnalytics';
import { BenchmarkingModule } from './components/BenchmarkingModule';
import { EarlyWarningModule } from './components/EarlyWarningModule';
import { CUFExperimentModule } from './components/CUFExperimentModule';
import { DataUploadModule } from './components/DataUploadModule';
import { AIAssistant } from './components/AIAssistant';
import { ConfigModal } from './components/ConfigModal';
import { ModelStatusModal } from './components/ModelStatusModal';
import { api } from './services/api';
import type { ExecutiveOverview as ExecutiveOverviewType, Project } from './types';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [overview, setOverview] = useState<ExecutiveOverviewType | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [totalProjects, setTotalProjects] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Filters
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedMinistry, setSelectedMinistry] = useState<string>('');
  const [selectedSector, setSelectedSector] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<string>('');

  // Modals
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isConfigOpen, setIsConfigOpen] = useState<boolean>(false);
  const [isModelStatusOpen, setIsModelStatusOpen] = useState<boolean>(false);

  // Loading & Error States
  const [isLoadingOverview, setIsLoadingOverview] = useState<boolean>(true);
  const [overviewError, setOverviewError] = useState<string | null>(null);

  const fetchOverviewData = () => {
    setIsLoadingOverview(true);
    setOverviewError(null);
    api
      .getExecutiveOverview()
      .then((data) => {
        setOverview(data);
        setIsLoadingOverview(false);
      })
      .catch((err) => {
        console.error(err);
        setOverviewError(err.message || 'Failed to connect to DRISHTI Backend Service.');
        setIsLoadingOverview(false);
      });
  };

  const fetchProjectsData = () => {
    api
      .getProjects({
        search: searchTerm || undefined,
        ministry: selectedMinistry || undefined,
        sector: selectedSector || undefined,
        priority: selectedPriority || undefined,
        page: currentPage,
        limit: 20
      })
      .then((res) => {
        setProjects(res.projects);
        setTotalProjects(res.total);
        setTotalPages(res.total_pages);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  useEffect(() => {
    fetchOverviewData();
  }, []);

  useEffect(() => {
    fetchProjectsData();
  }, [searchTerm, selectedMinistry, selectedSector, selectedPriority, currentPage]);

  const handleRefresh = () => {
    fetchOverviewData();
    fetchProjectsData();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openConfig={() => setIsConfigOpen(true)}
        openModelStatus={() => setIsModelStatusOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {activeTab === 'overview' && (
          <ExecutiveOverview
            overview={overview}
            projects={projects}
            onSelectProject={(id) => setSelectedProjectId(id)}
            onNavigateTab={(tab) => setActiveTab(tab)}
            isLoading={isLoadingOverview}
            error={overviewError}
            onRetry={fetchOverviewData}
          />
        )}

        {activeTab === 'projects' && (
          <ProjectTable
            projects={projects}
            totalProjects={totalProjects}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
            onSelectProject={(id) => setSelectedProjectId(id)}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedMinistry={selectedMinistry}
            setSelectedMinistry={setSelectedMinistry}
            selectedSector={selectedSector}
            setSelectedSector={setSelectedSector}
            selectedPriority={selectedPriority}
            setSelectedPriority={setSelectedPriority}
          />
        )}

        {activeTab === 'alerts' && (
          <EarlyWarningModule
            projects={projects}
            onSelectProject={(id) => setSelectedProjectId(id)}
          />
        )}

        {activeTab === 'analytics' && <SectorAnalytics overview={overview} />}

        {activeTab === 'benchmarking' && <BenchmarkingModule overview={overview} />}

        {activeTab === 'cuf' && <CUFExperimentModule />}

        {activeTab === 'upload' && (
          <DataUploadModule onDatasetUploaded={handleRefresh} />
        )}

        {activeTab === 'assistant' && <AIAssistant />}
      </main>

      <footer className="bg-white border-t border-slate-200 text-slate-500 py-4 text-center text-xs font-medium">
        DRISHTI — Infrastructure Project Intelligence & Early Warning System • Ministry of Statistics and Programme Implementation (MoSPI) • SIH26103
      </footer>

      <ProjectDetailModal
        projectId={selectedProjectId}
        onClose={() => setSelectedProjectId(null)}
      />

      <ConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        onConfigSaved={handleRefresh}
      />

      <ModelStatusModal
        isOpen={isModelStatusOpen}
        onClose={() => setIsModelStatusOpen(false)}
      />
    </div>
  );
};

export default App;
