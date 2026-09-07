import pandas as pd
import numpy as np
import datetime
from typing import Dict, Any, List

def validate_dataset(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Performs comprehensive data quality validation on uploaded or default PAIMANA project dataset.
    Returns detailed metrics, anomaly list, and overall data quality score %.
    """
    total_records = len(df)
    if total_records == 0:
        return {
            "total_records": 0,
            "valid_records": 0,
            "missing_value_count": 0,
            "duplicate_count": 0,
            "invalid_date_count": 0,
            "negative_cost_count": 0,
            "invalid_pct_count": 0,
            "impossible_duration_count": 0,
            "expenditure_anomaly_count": 0,
            "outliers_count": 0,
            "overall_quality_pct": 0.0,
            "anomalies": []
        }
        
    anomalies = []
    invalid_rows = set()
    
    # 1. Missing Values
    missing_mask = df.isnull().any(axis=1)
    missing_indices = df[missing_mask].index.tolist()
    missing_count = len(missing_indices)
    for idx in missing_indices:
        invalid_rows.add(idx)
        anomalies.append({
            "row_index": int(idx),
            "project_id": str(df.loc[idx, "project_id"]) if "project_id" in df.columns else f"Row {idx}",
            "issue_type": "Missing Values",
            "severity": "MEDIUM",
            "details": f"Missing values in columns: {df.columns[df.loc[idx].isnull()].tolist()}"
        })
        
    # 2. Duplicate Projects
    duplicate_count = 0
    if "project_id" in df.columns:
        dups = df.duplicated(subset=["project_id"], keep=False)
        dup_indices = df[dups].index.tolist()
        duplicate_count = len(dup_indices)
        for idx in dup_indices:
            invalid_rows.add(idx)
            anomalies.append({
                "row_index": int(idx),
                "project_id": str(df.loc[idx, "project_id"]),
                "issue_type": "Duplicate Project ID",
                "severity": "HIGH",
                "details": "Project ID appears multiple times in dataset"
            })
            
    # 3. Invalid Dates & Impossible Durations
    invalid_date_count = 0
    impossible_duration_count = 0
    for idx, row in df.iterrows():
        try:
            start_dt = pd.to_datetime(row.get("start_date"))
            orig_comp_dt = pd.to_datetime(row.get("original_completion_date"))
            if pd.isnull(start_dt) or pd.isnull(orig_comp_dt):
                invalid_date_count += 1
                invalid_rows.add(idx)
                anomalies.append({
                    "row_index": int(idx),
                    "project_id": str(row.get("project_id", idx)),
                    "issue_type": "Invalid Date",
                    "severity": "HIGH",
                    "details": "Unparseable date format"
                })
            elif orig_comp_dt <= start_dt:
                impossible_duration_count += 1
                invalid_rows.add(idx)
                anomalies.append({
                    "row_index": int(idx),
                    "project_id": str(row.get("project_id", idx)),
                    "issue_type": "Impossible Duration",
                    "severity": "HIGH",
                    "details": f"Completion date ({orig_comp_dt.date()}) is before or equal to start date ({start_dt.date()})"
                })
        except Exception:
            invalid_date_count += 1
            invalid_rows.add(idx)
            
    # 4. Negative Costs & Logical Inconsistencies
    negative_cost_count = 0
    expenditure_anomaly_count = 0
    for idx, row in df.iterrows():
        orig_cost = row.get("original_cost", 0)
        rev_cost = row.get("revised_cost", 0)
        exp = row.get("cumulative_expenditure", 0)
        
        if orig_cost < 0 or rev_cost < 0 or exp < 0:
            negative_cost_count += 1
            invalid_rows.add(idx)
            anomalies.append({
                "row_index": int(idx),
                "project_id": str(row.get("project_id", idx)),
                "issue_type": "Negative Cost",
                "severity": "CRITICAL",
                "details": f"Cost values cannot be negative: orig={orig_cost}, rev={rev_cost}, exp={exp}"
            })
            
        if exp > rev_cost * 1.15 and rev_cost > 0: # Expenditure exceeds 115% of revised cost
            expenditure_anomaly_count += 1
            invalid_rows.add(idx)
            anomalies.append({
                "row_index": int(idx),
                "project_id": str(row.get("project_id", idx)),
                "issue_type": "Expenditure Anomaly",
                "severity": "HIGH",
                "details": f"Cumulative expenditure (₹{exp} Cr) exceeds revised cost (₹{rev_cost} Cr)"
            })
            
    # 5. Invalid Percentages (> 100% or < 0%)
    invalid_pct_count = 0
    for idx, row in df.iterrows():
        phys_pct = row.get("physical_progress_pct", 0)
        fin_pct = row.get("financial_progress_pct", 0)
        if phys_pct < 0 or phys_pct > 100.0 or fin_pct < 0 or fin_pct > 100.0:
            invalid_pct_count += 1
            invalid_rows.add(idx)
            anomalies.append({
                "row_index": int(idx),
                "project_id": str(row.get("project_id", idx)),
                "issue_type": "Invalid Percentage",
                "severity": "MEDIUM",
                "details": f"Physical progress ({phys_pct}%) or Financial progress ({fin_pct}%) outside [0, 100]"
            })
            
    # 6. Outliers Detection (IQR on Original Cost)
    q1 = df["original_cost"].quantile(0.25)
    q3 = df["original_cost"].quantile(0.75)
    iqr = q3 - q1
    upper_bound = q3 + 3.0 * iqr
    outlier_mask = df["original_cost"] > upper_bound
    outliers_count = int(outlier_mask.sum())
    
    valid_count = total_records - len(invalid_rows)
    quality_score = round((valid_count / total_records) * 100.0, 1) if total_records > 0 else 0.0
    
    return {
        "total_records": total_records,
        "valid_records": valid_count,
        "records_with_missing_values": missing_count,
        "duplicate_records": duplicate_count,
        "invalid_dates": invalid_date_count,
        "negative_costs": negative_cost_count,
        "invalid_percentages": invalid_pct_count,
        "impossible_durations": impossible_duration_count,
        "expenditure_anomalies": expenditure_anomaly_count,
        "outliers_detected": outliers_count,
        "overall_quality_pct": quality_score,
        "anomalies": anomalies[:50] # Return top 50 detailed anomalies for report UI
    }
