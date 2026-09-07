import pandas as pd
import numpy as np
import datetime
from typing import Tuple

def extract_features(df: pd.DataFrame, current_date_str: str = "2026-04-01") -> pd.DataFrame:
    """
    Transforms raw PAIMANA project records into rich numerical features for ML models and risk engines.
    Strictly avoids temporal data leakage.
    """
    df_feat = df.copy()
    curr_dt = pd.to_datetime(current_date_str)
    
    # Parse dates safely
    df_feat["start_dt"] = pd.to_datetime(df_feat["start_date"], errors="coerce")
    df_feat["orig_comp_dt"] = pd.to_datetime(df_feat["original_completion_date"], errors="coerce")
    df_feat["rev_comp_dt"] = pd.to_datetime(df_feat["revised_completion_date"], errors="coerce")
    
    # 1. Project Age (in months from start date to observation date)
    df_feat["project_age_months"] = np.maximum(
        1.0, 
        ((curr_dt - df_feat["start_dt"]).dt.days / 30.44).fillna(12.0)
    )
    
    # 2. Planned Duration (months)
    df_feat["planned_duration_months"] = np.maximum(
        1.0, 
        ((df_feat["orig_comp_dt"] - df_feat["start_dt"]).dt.days / 30.44).fillna(df_feat.get("planned_duration_months", 36.0))
    )
    
    # 3. Schedule Deviation Ratio (Current/Revised Duration vs Planned Duration)
    rev_duration = ((df_feat["rev_comp_dt"] - df_feat["start_dt"]).dt.days / 30.44).fillna(df_feat["planned_duration_months"])
    df_feat["schedule_deviation_ratio"] = (rev_duration / df_feat["planned_duration_months"]).round(4)
    
    # 4. Schedule Delay Months
    df_feat["schedule_delay_months"] = np.maximum(
        0.0, 
        ((df_feat["rev_comp_dt"] - df_feat["orig_comp_dt"]).dt.days / 30.44).fillna(0.0)
    )
    
    # 5. Cost Escalation Ratio (Revised Cost / Original Cost)
    df_feat["original_cost"] = np.maximum(1.0, df_feat["original_cost"])
    df_feat["revised_cost"] = np.maximum(df_feat["original_cost"], df_feat["revised_cost"])
    df_feat["cost_escalation_ratio"] = (df_feat["revised_cost"] / df_feat["original_cost"]).round(4)
    df_feat["cost_overrun_pct"] = ((df_feat["cost_escalation_ratio"] - 1.0) * 100.0).round(2)
    
    # 6. Cost Efficiency (Cumulative Expenditure / Original Cost)
    df_feat["cost_efficiency_ratio"] = (df_feat["cumulative_expenditure"] / df_feat["original_cost"]).round(4)
    
    # 7. Physical Progress Velocity (% per month of project age)
    df_feat["progress_velocity"] = (df_feat["physical_progress_pct"] / df_feat["project_age_months"]).round(4)
    
    # 8. Financial-Progress Mismatch (Financial Progress % - Physical Progress %)
    df_feat["fin_phys_mismatch_pct"] = (df_feat["financial_progress_pct"] - df_feat["physical_progress_pct"]).round(2)
    
    # 9. Milestone Delay Rate (Delayed Milestones / Total Milestones)
    total_m = np.maximum(1, df_feat["total_milestones"])
    df_feat["milestone_delay_rate"] = (df_feat["delayed_milestones"] / total_m).round(4)
    
    # 10. Additional Extended CUF+ Variables
    df_feat["land_acquisition_ratio"] = (df_feat.get("land_acquired_pct", 80.0) / 100.0).round(4)
    df_feat["contractor_score_norm"] = (df_feat.get("contractor_rating", 3.5) / 5.0).round(4)
    df_feat["litigation_flag"] = (df_feat.get("active_litigations", 0) > 0).astype(int)
    df_feat["payment_delay_months"] = (df_feat.get("avg_payment_delay_days", 30) / 30.0).round(2)
    df_feat["regulatory_cleared_flag"] = (df_feat.get("regulatory_clearance_status", "Cleared") == "Cleared").astype(int)
    
    # ------------------ Target Variable Labeling ------------------
    # Target A: Cost Overrun Binary (>5% escalation)
    df_feat["target_cost_overrun_binary"] = (df_feat["cost_escalation_ratio"] > 1.05).astype(int)
    
    # Target B: Cost Overrun Category
    def classify_cost_overrun(pct):
        if pct <= 0.0: return "No Overrun"
        elif pct <= 10.0: return "Low Overrun"
        elif pct <= 25.0: return "Moderate Overrun"
        else: return "High Overrun"
    df_feat["target_cost_overrun_cat"] = df_feat["cost_overrun_pct"].apply(classify_cost_overrun)
    
    # Target C: Time Overrun Binary (>3 months delay)
    df_feat["target_time_overrun_binary"] = (df_feat["schedule_delay_months"] > 3.0).astype(int)
    
    # Target D: Time Overrun Category
    def classify_time_overrun(m):
        if m < 3.0: return "On Schedule"
        elif m < 9.0: return "Minor Delay"
        elif m < 18.0: return "Moderate Delay"
        else: return "Severe Delay"
    df_feat["target_time_overrun_cat"] = df_feat["schedule_delay_months"].apply(classify_time_overrun)
    
    return df_feat
