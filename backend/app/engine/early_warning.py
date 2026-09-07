import pandas as pd
import numpy as np
from typing import Dict, Any, List

def generate_early_warnings_and_recommendations(
    project_row: Dict[str, Any],
    risk_info: Dict[str, Any],
    ml_preds: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Detects specific early warning signals, assigns alert priority (P1-P4),
    and generates prescriptive decision-support recommendations.
    """
    signals = []
    recommendations = []
    
    cost_prob = ml_preds.get("cost_overrun_probability", 0.0)
    time_prob = ml_preds.get("time_overrun_probability", 0.0)
    delay_m = ml_preds.get("expected_delay_months", 0.0)
    overall_score = risk_info.get("overall_risk_score", 0.0)
    
    phys_pct = float(project_row.get("physical_progress_pct", 0.0))
    fin_pct = float(project_row.get("financial_progress_pct", 0.0))
    milestone_rate = float(project_row.get("milestone_delay_rate", 0.0)) if "milestone_delay_rate" in project_row else (
        float(project_row.get("delayed_milestones", 0)) / max(1, float(project_row.get("total_milestones", 1)))
    )
    land_pct = float(project_row.get("land_acquired_pct", 100.0))
    contractor_rating = float(project_row.get("contractor_rating", 5.0))
    litigations = int(project_row.get("active_litigations", 0))
    rev_cost = float(project_row.get("revised_cost", project_row.get("original_cost", 0.0)))
    
    # 1. Milestone Slippage Signal
    if milestone_rate > 0.4:
        signals.append({
            "code": "SIGNAL_MILESTONE_SLIPPAGE",
            "title": "Severe Milestone Slippage",
            "severity": "CRITICAL" if milestone_rate > 0.6 else "HIGH",
            "description": f"{int(milestone_rate*100)}% of project milestones are delayed beyond target schedule."
        })
        recommendations.append({
            "category": "Milestone Review",
            "action": "Conduct immediate milestone dependency review with implementing agency and contractor.",
            "rationale": "High milestone slippage directly correlates with subsequent multi-year project completion delays."
        })
        
    # 2. Financial-Progress Mismatch Signal
    if fin_pct - phys_pct > 15.0:
        signals.append({
            "code": "SIGNAL_FINANCIAL_MISMATCH",
            "title": "High Expenditure Relative to Physical Progress",
            "severity": "HIGH",
            "description": f"Financial progress ({fin_pct}%) leads physical execution ({phys_pct}%) by {round(fin_pct - phys_pct, 1)} percentage points."
        })
        recommendations.append({
            "category": "Financial Reconciliation",
            "action": "Order financial-progress audit to verify value of work completed against cumulative disbursements.",
            "rationale": "Premature expenditure disbursements indicate billing anomalies or inventory stockpiling."
        })
        
    # 3. Low Physical Progress Velocity Signal
    if phys_pct < 40.0 and time_prob > 70.0:
        signals.append({
            "code": "SIGNAL_LOW_PROGRESS",
            "title": "Sluggish Execution Velocity",
            "severity": "HIGH",
            "description": f"Physical completion is only {phys_pct}% despite being past midpoint of planned timeline."
        })
        recommendations.append({
            "category": "Resource Augmentation",
            "action": "Assess site-level manpower, machinery mobilization, and sub-contractor deployment.",
            "rationale": "Slow progress velocity requires immediate site resource augmentation to avoid severe delay penalties."
        })
        
    # 4. Land Acquisition & RoW Bottleneck Signal
    if land_pct < 70.0 and phys_pct < 50.0:
        signals.append({
            "code": "SIGNAL_LAND_BOTTLENECK",
            "title": "Land Acquisition & RoW Lag",
            "severity": "HIGH",
            "description": f"Only {land_pct}% of required project land has been handed over to contractor."
        })
        recommendations.append({
            "category": "Inter-Ministerial / State Coordination",
            "action": "Convene joint task force meeting with State Revenue Department & District Magistrate for land handover.",
            "rationale": "Unresolved land rights create severe contractor idle-time claims and cost escalation."
        })
        
    # 5. Litigation / Legal Hold Signal
    if litigations > 0:
        signals.append({
            "code": "SIGNAL_LITIGATION_RISK",
            "title": "Active Legal Disputes",
            "severity": "MEDIUM",
            "description": f"Project is hampered by {litigations} active court stay orders or legal disputes."
        })
        recommendations.append({
            "category": "Legal Expediting",
            "action": "Engage Standing Government Counsel to file expedited hearing applications in High Court / Tribunal.",
            "rationale": "Legal stays halt critical work packages completely."
        })

    # Alert Priority Assignment
    # Priority rank factors: Risk Score (0-100), Financial Exposure (revised cost in Cr), Delay Probability
    financial_exposure_cr = rev_cost
    
    if overall_score >= 75.0 or (overall_score >= 65.0 and financial_exposure_cr > 2000.0):
        priority = "P1"
        priority_label = "CRITICAL — Immediate Review Required"
        priority_color = "red"
    elif overall_score >= 50.0 or (overall_score >= 40.0 and financial_exposure_cr > 1000.0):
        priority = "P2"
        priority_label = "HIGH — Priority Monitoring"
        priority_color = "orange"
    elif overall_score >= 25.0:
        priority = "P3"
        priority_label = "MODERATE — Regular Oversight"
        priority_color = "yellow"
    else:
        priority = "P4"
        priority_label = "LOW — Routine Monitoring"
        priority_color = "green"
        
    # Default recommendation if no specific signals triggered
    if len(recommendations) == 0:
        recommendations.append({
            "category": "Routine Monitoring",
            "action": "Maintain periodic CUF monthly update monitoring and track milestone dates.",
            "rationale": "Project parameters are within normal variance thresholds."
        })

    return {
        "priority_level": priority,
        "priority_label": priority_label,
        "priority_color": priority_color,
        "financial_exposure_cr": financial_exposure_cr,
        "early_warning_signals": signals,
        "prescriptive_recommendations": recommendations
    }
