import numpy as np
import pandas as pd
from typing import Dict, Any, List

DEFAULT_WEIGHTS = {
    "cost_risk": 0.25,
    "schedule_risk": 0.25,
    "progress_risk": 0.20,
    "mismatch_risk": 0.15,
    "milestone_risk": 0.15
}

DEFAULT_THRESHOLDS = {
    "LOW": 24.9,
    "MODERATE": 49.9,
    "HIGH": 74.9,
    "CRITICAL": 100.0
}

class RiskScoringEngine:
    def __init__(self, weights: Dict[str, float] = None, thresholds: Dict[str, float] = None):
        self.weights = weights if weights else DEFAULT_WEIGHTS.copy()
        self.thresholds = thresholds if thresholds else DEFAULT_THRESHOLDS.copy()

    def update_config(self, weights: Dict[str, float] = None, thresholds: Dict[str, float] = None):
        if weights:
            # Normalize weights to sum to 1.0
            total_w = sum(weights.values())
            self.weights = {k: v / total_w for k, v in weights.items()}
        if thresholds:
            self.thresholds = thresholds.copy()

    def calculate_project_risk(
        self,
        cost_overrun_prob: float,
        time_overrun_prob: float,
        physical_progress_pct: float,
        financial_progress_pct: float,
        planned_duration_months: float,
        project_age_months: float,
        milestone_delay_rate: float,
        land_acquired_pct: float = 80.0,
        contractor_rating: float = 3.5
    ) -> Dict[str, Any]:
        """
        Calculates unified 0–100 Project Risk Score with component decomposition.
        """
        # 1. Cost Risk (0-100)
        c_risk = min(100.0, cost_overrun_prob)
        
        # 2. Schedule Risk (0-100)
        s_risk = min(100.0, time_overrun_prob)
        
        # 3. Progress Risk (0-100)
        # Expected physical progress based on age vs planned duration
        expected_progress = min(100.0, (project_age_months / planned_duration_months) * 100.0)
        progress_gap = max(0.0, expected_progress - physical_progress_pct)
        p_risk = min(100.0, progress_gap * 1.5)
        
        # 4. Financial-Progress Mismatch Risk (0-100)
        mismatch_gap = max(0.0, financial_progress_pct - physical_progress_pct)
        m_risk = min(100.0, mismatch_gap * 2.5) # High financial burn with low progress is severe
        
        # 5. Milestone Risk (0-100)
        ms_risk = min(100.0, milestone_delay_rate * 100.0)
        
        # Weighted Overall Risk Calculation
        w_cost = self.weights.get("cost_risk", 0.25)
        w_sched = self.weights.get("schedule_risk", 0.25)
        w_prog = self.weights.get("progress_risk", 0.20)
        w_mismatch = self.weights.get("mismatch_risk", 0.15)
        w_ms = self.weights.get("milestone_risk", 0.15)
        
        raw_overall = (
            (c_risk * w_cost) +
            (s_risk * w_sched) +
            (p_risk * w_prog) +
            (m_risk * w_mismatch) +
            (ms_risk * w_ms)
        )
        
        overall_score = round(min(100.0, max(0.0, raw_overall)), 1)
        
        # Risk Category classification
        if overall_score <= self.thresholds.get("LOW", 24.9):
            level = "LOW"
            color = "green"
        elif overall_score <= self.thresholds.get("MODERATE", 49.9):
            level = "MODERATE"
            color = "yellow"
        elif overall_score <= self.thresholds.get("HIGH", 74.9):
            level = "HIGH"
            color = "orange"
        else:
            level = "CRITICAL"
            color = "red"
            
        return {
            "overall_risk_score": overall_score,
            "risk_level": level,
            "risk_color": color,
            "components": {
                "cost_risk": round(c_risk, 1),
                "schedule_risk": round(s_risk, 1),
                "progress_risk": round(p_risk, 1),
                "mismatch_risk": round(m_risk, 1),
                "milestone_risk": round(ms_risk, 1)
            },
            "weights_used": self.weights,
            "thresholds_used": self.thresholds
        }

risk_engine = RiskScoringEngine()
