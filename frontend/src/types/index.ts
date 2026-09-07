export interface Project {
  project_id: string;
  project_name: string;
  ministry: string;
  sector: string;
  implementing_agency: string;
  state: string;
  latitude: number;
  longitude: number;
  original_cost: number;
  revised_cost: number;
  cumulative_expenditure: number;
  physical_progress_pct: number;
  financial_progress_pct: number;
  planned_duration_months: number;
  overall_risk_score: number;
  priority_level: 'P1' | 'P2' | 'P3' | 'P4';
  cost_overrun_prob: number;
  time_overrun_prob: number;
  expected_delay_months: number;
  status: string;
  start_date?: string;
  original_completion_date?: string;
  revised_completion_date?: string;
  delayed_milestones?: number;
  total_milestones?: number;
  land_acquired_pct?: number;
  contractor_rating?: number;
  active_litigations?: number;
  primary_delay_reason?: string;
}

export interface RiskComponentBreakdown {
  cost_risk: number;
  schedule_risk: number;
  progress_risk: number;
  mismatch_risk: number;
  milestone_risk: number;
}

export interface RiskAssessment {
  overall_risk_score: number;
  risk_level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  risk_color: string;
  components: RiskComponentBreakdown;
  weights_used: Record<string, number>;
  thresholds_used: Record<string, number>;
}

export interface RiskDriver {
  feature: string;
  importance_score: number;
  impact: 'INCREASES_RISK' | 'REDUCES_RISK';
}

export interface MLPredictions {
  cost_overrun_probability: number;
  time_overrun_probability: number;
  expected_delay_months: number;
  delay_range: string;
  top_risk_drivers: RiskDriver[];
}

export interface EarlyWarningSignal {
  code: string;
  title: string;
  severity: string;
  description: string;
}

export interface Recommendation {
  category: string;
  action: string;
  rationale: string;
}

export interface EarlyWarningInfo {
  priority_level: 'P1' | 'P2' | 'P3' | 'P4';
  priority_label: string;
  priority_color: string;
  financial_exposure_cr: number;
  early_warning_signals: EarlyWarningSignal[];
  prescriptive_recommendations: Recommendation[];
}

export interface BenchmarkComparison {
  cohort_name: string;
  cohort_sample_size: number;
  target_project: {
    project_id: string;
    project_name: string;
    original_cost: number;
    cost_escalation_pct: number;
    planned_duration_months: number;
    schedule_delay_months: number;
    physical_progress_pct: number;
    risk_score: number;
  };
  benchmark: {
    median_original_cost: number;
    median_cost_escalation_pct: number;
    median_planned_duration_months: number;
    median_schedule_delay_months: number;
    median_physical_progress_pct: number;
    median_risk_score: number;
  };
  performance_comparison: {
    cost_status: string;
    delay_status: string;
    risk_status: string;
  };
}

export interface ProjectDetailResponse {
  project: Project;
  ml_predictions: MLPredictions;
  risk_assessment: RiskAssessment;
  early_warning: EarlyWarningInfo;
  benchmark: BenchmarkComparison;
}

export interface SectorDelayRisk {
  sector: string;
  project_count: number;
  avg_delay_risk: number;
  avg_delay_risk_pct?: number;
  highest_project_risk: number;
  overall_risk_score?: number;
  expected_delay_months?: number;
  original_cost?: number;
  revised_cost?: number;
}

export interface ExecutiveOverview {
  portfolio_kpis: {
    total_projects: number;
    total_original_cost_cr: number;
    total_revised_cost_cr: number;
    total_expenditure_cr: number;
    overall_cost_escalation_pct: number;
    overall_expenditure_pct: number;
  };
  risk_distribution: {
    CRITICAL: number;
    HIGH: number;
    MODERATE: number;
    LOW: number;
  };
  priority_distribution: {
    P1: number;
    P2: number;
    P3: number;
    P4: number;
  };
  sector_analytics: SectorDelayRisk[];
  data_quality_summary: {
    quality_score_pct: number;
    valid_records: number;
    total_records: number;
  };
}

export interface DataQualityReport {
  total_records: number;
  valid_records: number;
  records_with_missing_values: number;
  duplicate_records: number;
  invalid_dates: number;
  negative_costs: number;
  invalid_percentages: number;
  impossible_durations: number;
  expenditure_anomalies: number;
  outliers_detected: number;
  overall_quality_pct: number;
  anomalies: Array<{
    row_index: number;
    project_id: string;
    issue_type: string;
    severity: string;
    details: string;
  }>;
}

export interface ModelMetrics {
  best_cost_model: string;
  best_time_model: string;
  cost_overrun_comparison: Record<string, any>;
  time_overrun_comparison: Record<string, any>;
  delay_duration_metrics: {
    mae_months: number;
    rmse_months: number;
    r2_score: number;
  };
  global_feature_importance: Record<string, number>;
  training_samples: number;
  testing_samples: number;
}
