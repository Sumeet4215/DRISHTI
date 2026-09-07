import axios from 'axios';
import type {
  ExecutiveOverview,
  SectorDelayRisk,
  Project,
  ProjectDetailResponse,
  DataQualityReport,
  ModelMetrics
} from '../types';

const API_BASE_URL = 'http://localhost:8000/api';

export const api = {
  getExecutiveOverview: async (): Promise<ExecutiveOverview> => {
    const res = await axios.get(`${API_BASE_URL}/executive-overview`);
    return res.data;
  },

  getSectorDelayRisk: async (): Promise<SectorDelayRisk[]> => {
    const res = await axios.get(`${API_BASE_URL}/analytics/sector-delay-risk`);
    return res.data;
  },

  getProjects: async (params?: {
    search?: string;
    ministry?: string;
    sector?: string;
    priority?: string;
    risk_level?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    total: number;
    page: number;
    limit: number;
    total_pages: number;
    projects: Project[];
  }> => {
    const res = await axios.get(`${API_BASE_URL}/projects`, { params });
    return res.data;
  },

  getProjectDetail: async (projectId: string): Promise<ProjectDetailResponse> => {
    const res = await axios.get(`${API_BASE_URL}/projects/${projectId}`);
    return res.data;
  },

  uploadDataset: async (file: File): Promise<{
    message: string;
    data_quality_report: DataQualityReport;
  }> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await axios.post(`${API_BASE_URL}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  uploadPdfReport: async (file: File): Promise<{
    message: string;
    pdf_metadata: {
      pages_processed: number;
      ocr_triggered: boolean;
      extracted_projects_count: number;
      ingestion_type: string;
      label: string;
      source: string;
    };
    data_quality_report: DataQualityReport;
  }> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await axios.post(`${API_BASE_URL}/upload-pdf`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  getCUFExperiment: async (): Promise<any> => {
    const res = await axios.get(`${API_BASE_URL}/cuf-experiment`);
    return res.data;
  },

  getModelStatus: async (): Promise<{
    version: string;
    training_date: string;
    dataset_name: string;
    metrics: ModelMetrics;
  }> => {
    const res = await axios.get(`${API_BASE_URL}/model-status`);
    return res.data;
  },

  askAssistant: async (query: string): Promise<{
    query: string;
    answer: string;
    cited_projects: string[];
    grounded_records_count: number;
  }> => {
    const res = await axios.post(`${API_BASE_URL}/assistant`, { query });
    return res.data;
  },

  updateConfig: async (weights?: Record<string, number>, thresholds?: Record<string, number>): Promise<any> => {
    const res = await axios.post(`${API_BASE_URL}/config`, { weights, thresholds });
    return res.data;
  }
};
