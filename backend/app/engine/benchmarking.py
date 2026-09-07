import pandas as pd
import numpy as np
from typing import Dict, Any, List

def benchmark_project(
    target_project: Dict[str, Any],
    all_projects_df: pd.DataFrame
) -> Dict[str, Any]:
    """
    Compares target project against peer projects in the same sector and cost scale.
    Calculates median sector benchmarks and relative performance indicators.
    """
    sector = target_project.get("sector")
    orig_cost = float(target_project.get("original_cost", 0.0))
    
    # Filter peer projects by sector
    peer_df = all_projects_df[all_projects_df["sector"] == sector].copy()
    if len(peer_df) < 5:
        # Fallback to all projects if sector has too few records
        peer_df = all_projects_df.copy()
        
    # Cost scale filter
    if orig_cost < 800:
        cost_scale = "Medium (₹150-800 Cr)"
        peer_df_scale = peer_df[peer_df["original_cost"] < 800]
    elif orig_cost < 3500:
        cost_scale = "Large (₹800-3500 Cr)"
        peer_df_scale = peer_df[(peer_df["original_cost"] >= 800) & (peer_df["original_cost"] < 3500)]
    else:
        cost_scale = "Mega (>₹3500 Cr)"
        peer_df_scale = peer_df[peer_df["original_cost"] >= 3500]
        
    if len(peer_df_scale) >= 3:
        cohort_df = peer_df_scale
        cohort_name = f"Sector: {sector} | Scale: {cost_scale}"
    else:
        cohort_df = peer_df
        cohort_name = f"Sector: {sector} (All Cost Scales)"
        
    # Calculate cohort statistics
    median_orig_cost = float(cohort_df["original_cost"].median())
    median_rev_cost = float(cohort_df["revised_cost"].median())
    median_cost_escalation = float((cohort_df["revised_cost"] / cohort_df["original_cost"]).median() - 1.0) * 100.0
    median_duration = float(cohort_df["planned_duration_months"].median())
    median_delay = float(cohort_df.get("schedule_delay_months", 0.0).median())
    median_phys_progress = float(cohort_df["physical_progress_pct"].median())
    median_risk_score = float(cohort_df.get("overall_risk_score", 45.0).median())
    
    # Target project metrics
    proj_rev_cost = float(target_project.get("revised_cost", orig_cost))
    proj_escalation = ((proj_rev_cost / max(1.0, orig_cost)) - 1.0) * 100.0
    proj_delay = float(target_project.get("schedule_delay_months", 0.0))
    proj_risk = float(target_project.get("overall_risk_score", 0.0))
    proj_phys = float(target_project.get("physical_progress_pct", 0.0))
    
    cost_status = "ABOVE BENCHMARK (Higher Overrun)" if proj_escalation > median_cost_escalation + 2.0 else (
        "BELOW BENCHMARK (Lower Overrun)" if proj_escalation < median_cost_escalation - 2.0 else "ON PAR WITH BENCHMARK"
    )
    
    delay_status = "ABOVE BENCHMARK (Longer Delay)" if proj_delay > median_delay + 2.0 else (
        "BELOW BENCHMARK (Shorter Delay)" if proj_delay < median_delay - 2.0 else "ON PAR WITH BENCHMARK"
    )
    
    risk_status = "HIGHER RISK" if proj_risk > median_risk_score + 5.0 else (
        "LOWER RISK" if proj_risk < median_risk_score - 5.0 else "AVERAGE RISK"
    )
    
    return {
        "cohort_name": cohort_name,
        "cohort_sample_size": len(cohort_df),
        "target_project": {
            "project_id": target_project.get("project_id"),
            "project_name": target_project.get("project_name"),
            "original_cost": orig_cost,
            "cost_escalation_pct": round(proj_escalation, 2),
            "planned_duration_months": float(target_project.get("planned_duration_months", 36)),
            "schedule_delay_months": round(proj_delay, 1),
            "physical_progress_pct": proj_phys,
            "risk_score": round(proj_risk, 1)
        },
        "benchmark": {
            "median_original_cost": round(median_orig_cost, 2),
            "median_cost_escalation_pct": round(median_cost_escalation, 2),
            "median_planned_duration_months": round(median_duration, 1),
            "median_schedule_delay_months": round(median_delay, 1),
            "median_physical_progress_pct": round(median_phys_progress, 1),
            "median_risk_score": round(median_risk_score, 1)
        },
        "performance_comparison": {
            "cost_status": cost_status,
            "delay_status": delay_status,
            "risk_status": risk_status
        }
    }
