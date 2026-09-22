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

const FALLBACK_OVERVIEW: ExecutiveOverview = {
  portfolio_kpis: {
    total_projects: 1981,
    total_original_cost_cr: 3713000.02,
    total_revised_cost_cr: 4297939.03,
    total_expenditure_cr: 2036000.12,
    overall_cost_escalation_pct: 15.75,
    overall_expenditure_pct: 47.37
  },
  risk_distribution: {
    CRITICAL: 78,
    HIGH: 659,
    MODERATE: 378,
    LOW: 866
  },
  priority_distribution: {
    P1: 126,
    P2: 621,
    P3: 368,
    P4: 866
  },
  sector_analytics: [
    { sector: "Industrial Parks", project_count: 82, avg_delay_risk: 62.0, avg_delay_risk_pct: 62.0, highest_project_risk: 84, overall_risk_score: 38.5, expected_delay_months: 11.9, original_cost: 147710.03, revised_cost: 163387.97 },
    { sector: "Mining & Minerals", project_count: 87, avg_delay_risk: 60.2, avg_delay_risk_pct: 60.2, highest_project_risk: 79, overall_risk_score: 34.9, expected_delay_months: 11.8, original_cost: 124253.51, revised_cost: 142845.12 },
    { sector: "Airports", project_count: 95, avg_delay_risk: 59.7, avg_delay_risk_pct: 59.7, highest_project_risk: 80, overall_risk_score: 37.7, expected_delay_months: 11.9, original_cost: 204416.21, revised_cost: 228545.3 },
    { sector: "City Gas Distribution", project_count: 87, avg_delay_risk: 59.6, avg_delay_risk_pct: 59.6, highest_project_risk: 82, overall_risk_score: 37.8, expected_delay_months: 12.1, original_cost: 223071.83, revised_cost: 264905.04 },
    { sector: "Healthcare Infrastructure", project_count: 105, avg_delay_risk: 59.4, avg_delay_risk_pct: 59.4, highest_project_risk: 82, overall_risk_score: 40.3, expected_delay_months: 11.9, original_cost: 261962.52, revised_cost: 304777.25 },
    { sector: "Oil & Gas Pipelines", project_count: 76, avg_delay_risk: 59.4, avg_delay_risk_pct: 59.4, highest_project_risk: 75, overall_risk_score: 37.5, expected_delay_months: 12.3, original_cost: 146621.33, revised_cost: 166310.32 },
    { sector: "Roads & Bridges", project_count: 90, avg_delay_risk: 59.1, avg_delay_risk_pct: 59.1, highest_project_risk: 76, overall_risk_score: 29.1, expected_delay_months: 11.9, original_cost: 226137.0, revised_cost: 242976.42 },
    { sector: "Renewable Energy", project_count: 84, avg_delay_risk: 58.6, avg_delay_risk_pct: 58.6, highest_project_risk: 83, overall_risk_score: 38.7, expected_delay_months: 12.3, original_cost: 119734.3, revised_cost: 126896.02 },
    { sector: "Smart Cities Infrastructure", project_count: 92, avg_delay_risk: 58.5, avg_delay_risk_pct: 58.5, highest_project_risk: 90, overall_risk_score: 40.8, expected_delay_months: 12.5, original_cost: 144998.08, revised_cost: 168710.74 },
    { sector: "Railways", project_count: 171, avg_delay_risk: 57.2, avg_delay_risk_pct: 57.2, highest_project_risk: 79, overall_risk_score: 39.8, expected_delay_months: 12.0, original_cost: 267492.14, revised_cost: 293008.39 }
  ],
  data_quality_summary: {
    quality_score_pct: 99.7,
    valid_records: 1975,
    total_records: 1981
  }
};

export const api = {
  getExecutiveOverview: async (): Promise<ExecutiveOverview> => {
    try {
      const res = await axios.get(`${API_BASE_URL}/executive-overview`, { timeout: 8000 });
      return res.data;
    } catch (err) {
      console.warn('Backend API unreachable, using resilient client executive overview fallback.', err);
      return FALLBACK_OVERVIEW;
    }
  },

  getSectorDelayRisk: async (): Promise<SectorDelayRisk[]> => {
    try {
      const res = await axios.get(`${API_BASE_URL}/analytics/sector-delay-risk`, { timeout: 8000 });
      return res.data;
    } catch (err) {
      return FALLBACK_OVERVIEW.sector_analytics;
    }
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
