import io
import os
import pandas as pd
import numpy as np
from fastapi import FastAPI, UploadFile, File, HTTPException, Query, Body
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any, List, Optional
from pydantic import BaseModel

from app.data.generator import generate_paimana_dataset
from app.data.validator import validate_dataset
from app.data.features import extract_features
from app.data.pdf_ocr import extract_paimana_pdf_data
from app.data.sector_utils import get_sector_delay_risk_aggregates, clean_and_normalize_sector
from app.models.ml_engine import ml_engine, ALL_FEATURE_COLS
from app.models.cuf_experiment import run_cuf_experiment
from app.engine.risk_scoring import risk_engine
from app.engine.early_warning import generate_early_warnings_and_recommendations
from app.engine.benchmarking import benchmark_project
from app.assistant.rag_assistant import query_project_assistant

app = FastAPI(
    title="DRISHTI Infrastructure Project Intelligence API",
    description="DRISHTI — Infrastructure Project Intelligence & Early Warning System (MoSPI • SIH26103)",
    version="2.1.0"
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global State Store
state: Dict[str, Any] = {
    "raw_df": None,
    "featured_df": None,
    "validation_report": None,
    "model_metrics": None,
    "cuf_experiment_results": None,
    "pdf_ingestion_metadata": None,
    "is_initialized": False
}

def initialize_system(df: pd.DataFrame):
    """
    Runs full ETL, Data Validation, Feature Extraction, Model Training, and Risk Scoring.
    """
    # 1. Validate Dataset
    val_report = validate_dataset(df)
    
    # 2. Extract Features
    df_feat = extract_features(df)
    
    # 2b. Normalize Sector field to prevent project names/states as sectors
    normalized_secs = []
    for idx, r in df_feat.iterrows():
        raw_s = str(r.get("sector", ""))
        min_s = str(r.get("ministry", ""))
        prj_s = str(r.get("project_name", ""))
        normalized_secs.append(clean_and_normalize_sector(raw_s, min_s, prj_s))
    df_feat["sector"] = normalized_secs
    df["sector"] = normalized_secs

    # 3. Train ML Models
    metrics = ml_engine.train_models(df_feat)
    
    # 4. Run Predictions & Risk Scoring for all projects
    risk_scores = []
    priorities = []
    cost_probs = []
    time_probs = []
    delay_months = []
    
    for idx, row in df_feat.iterrows():
        feat_dict = {col: row[col] for col in ALL_FEATURE_COLS}
        pred = ml_engine.predict_project(feat_dict)
        
        c_prob = pred["cost_overrun_probability"]
        t_prob = pred["time_overrun_probability"]
        del_m = pred["expected_delay_months"]
        
        cost_probs.append(c_prob)
        time_probs.append(t_prob)
        delay_months.append(del_m)
        
        risk_res = risk_engine.calculate_project_risk(
            cost_overrun_prob=c_prob,
            time_overrun_prob=t_prob,
            physical_progress_pct=row["physical_progress_pct"],
            financial_progress_pct=row["financial_progress_pct"],
            planned_duration_months=row["planned_duration_months"],
            project_age_months=row["project_age_months"],
            milestone_delay_rate=row["milestone_delay_rate"],
            land_acquired_pct=row.get("land_acquired_pct", 80.0),
            contractor_rating=row.get("contractor_rating", 3.5)
        )
        
        risk_scores.append(risk_res["overall_risk_score"])
        ew = generate_early_warnings_and_recommendations(row.to_dict(), risk_res, pred)
        priorities.append(ew["priority_level"])
        
    df_feat["cost_overrun_prob"] = cost_probs
    df_feat["time_overrun_prob"] = time_probs
    df_feat["expected_delay_months"] = delay_months
    df_feat["overall_risk_score"] = risk_scores
    df_feat["priority_level"] = priorities
    
    df["overall_risk_score"] = risk_scores
    df["priority_level"] = priorities
    df["cost_overrun_prob"] = cost_probs
    df["time_overrun_prob"] = time_probs
    df["expected_delay_months"] = delay_months
    
    # 5. Run CUF Experiment
    cuf_res = run_cuf_experiment(df_feat)
    
    state["raw_df"] = df
    state["featured_df"] = df_feat
    state["validation_report"] = val_report
    state["model_metrics"] = metrics
    state["cuf_experiment_results"] = cuf_res
    state["is_initialized"] = True

@app.on_event("startup")
def on_startup():
    """Generates initial 1,981 project PAIMANA dataset and initializes ML models on startup."""
    print("Generating PAIMANA 1,981 project dataset...")
    df_init = generate_paimana_dataset(1981)
    initialize_system(df_init)
    print("PAIMANA System Initialized successfully.")

# ----------------- API ENDPOINTS -----------------

@app.get("/api/executive-overview")
def get_executive_overview():
    if not state["is_initialized"]:
        raise HTTPException(status_code=500, detail="System not initialized")
        
    df = state["featured_df"]
    
    total_projects = len(df)
    total_orig_cost = float(df["original_cost"].sum())
    total_rev_cost = float(df["revised_cost"].sum())
    total_expenditure = float(df["cumulative_expenditure"].sum())
    
    risk_counts = {
        "CRITICAL": int((df["overall_risk_score"] >= 75).sum()),
        "HIGH": int(((df["overall_risk_score"] >= 50) & (df["overall_risk_score"] < 75)).sum()),
        "MODERATE": int(((df["overall_risk_score"] >= 25) & (df["overall_risk_score"] < 50)).sum()),
        "LOW": int((df["overall_risk_score"] < 25).sum())
    }
    
    priority_counts = {
        "P1": int((df["priority_level"] == "P1").sum()),
        "P2": int((df["priority_level"] == "P2").sum()),
        "P3": int((df["priority_level"] == "P3").sum()),
        "P4": int((df["priority_level"] == "P4").sum())
    }
    
    sector_list = get_sector_delay_risk_aggregates(df)
    
    return {
        "portfolio_kpis": {
            "total_projects": total_projects,
            "total_original_cost_cr": round(total_orig_cost, 2),
            "total_revised_cost_cr": round(total_rev_cost, 2),
            "total_expenditure_cr": round(total_expenditure, 2),
            "overall_cost_escalation_pct": round(((total_rev_cost / max(1.0, total_orig_cost)) - 1.0) * 100.0, 2),
            "overall_expenditure_pct": round((total_expenditure / max(1.0, total_rev_cost)) * 100.0, 2)
        },
        "risk_distribution": risk_counts,
        "priority_distribution": priority_counts,
        "sector_analytics": sector_list,
        "data_quality_summary": {
            "quality_score_pct": state["validation_report"]["overall_quality_pct"],
            "valid_records": state["validation_report"]["valid_records"],
            "total_records": state["validation_report"]["total_records"]
        },
        "pdf_ingestion_metadata": state["pdf_ingestion_metadata"]
    }

@app.get("/api/analytics/sector-delay-risk")
def get_sector_delay_risk():
    """
    Dedicated endpoint returning normalized sector-level delay risk aggregates.
    Response format:
    [
      {
        "sector": "Roads & Bridges",
        "project_count": 47,
        "avg_delay_risk": 42.3,
        "highest_project_risk": 92
      }, ...
    ]
    """
    if not state["is_initialized"]:
        raise HTTPException(status_code=500, detail="System not initialized")
    df = state["featured_df"]
    return get_sector_delay_risk_aggregates(df)

@app.get("/api/projects")
def get_projects(
    search: Optional[str] = Query(None),
    ministry: Optional[str] = Query(None),
    sector: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    risk_level: Optional[str] = Query(None),
    page: int = 1,
    limit: int = 20
):
    if not state["is_initialized"]:
        raise HTTPException(status_code=500, detail="System not initialized")
        
    df = state["featured_df"].copy()
    
    if search:
        s = search.lower()
        df = df[df["project_name"].str.lower().str.contains(s) | df["project_id"].str.lower().str.contains(s) | df["implementing_agency"].str.lower().str.contains(s)]
    if ministry:
        df = df[df["ministry"] == ministry]
    if sector:
        df = df[df["sector"] == sector]
    if priority:
        df = df[df["priority_level"] == priority]
    if risk_level:
        if risk_level == "CRITICAL": df = df[df["overall_risk_score"] >= 75]
        elif risk_level == "HIGH": df = df[(df["overall_risk_score"] >= 50) & (df["overall_risk_score"] < 75)]
        elif risk_level == "MODERATE": df = df[(df["overall_risk_score"] >= 25) & (df["overall_risk_score"] < 50)]
        elif risk_level == "LOW": df = df[df["overall_risk_score"] < 25]
        
    df = df.sort_values(by="overall_risk_score", ascending=False)
    
    total_matched = len(df)
    start_idx = (page - 1) * limit
    end_idx = start_idx + limit
    
    paged_df = df.iloc[start_idx:end_idx]
    
    records = paged_df[[
        "project_id", "project_name", "ministry", "sector", "state", "latitude", "longitude",
        "original_cost", "revised_cost", "cumulative_expenditure", "physical_progress_pct",
        "financial_progress_pct", "planned_duration_months", "overall_risk_score",
        "priority_level", "cost_overrun_prob", "time_overrun_prob", "expected_delay_months", "status"
    ]].to_dict(orient="records")
    
    return {
        "total": total_matched,
        "page": page,
        "limit": limit,
        "total_pages": int(np.ceil(total_matched / limit)) if total_matched > 0 else 1,
        "projects": records
    }

@app.get("/api/projects/{project_id}")
def get_project_detail(project_id: str):
    if not state["is_initialized"]:
        raise HTTPException(status_code=500, detail="System not initialized")
        
    df = state["featured_df"]
    match = df[df["project_id"] == project_id]
    if match.empty:
        raise HTTPException(status_code=404, detail="Project not found")
        
    row = match.iloc[0].to_dict()
    feat_dict = {col: row[col] for col in ALL_FEATURE_COLS}
    pred = ml_engine.predict_project(feat_dict)
    
    risk_info = risk_engine.calculate_project_risk(
        cost_overrun_prob=pred["cost_overrun_probability"],
        time_overrun_prob=pred["time_overrun_probability"],
        physical_progress_pct=row["physical_progress_pct"],
        financial_progress_pct=row["financial_progress_pct"],
        planned_duration_months=row["planned_duration_months"],
        project_age_months=row["project_age_months"],
        milestone_delay_rate=row["milestone_delay_rate"],
        land_acquired_pct=row.get("land_acquired_pct", 80.0),
        contractor_rating=row.get("contractor_rating", 3.5)
    )
    
    ew_info = generate_early_warnings_and_recommendations(row, risk_info, pred)
    bm_info = benchmark_project(row, df)
    
    return {
        "project": row,
        "ml_predictions": pred,
        "risk_assessment": risk_info,
        "early_warning": ew_info,
        "benchmark": bm_info
    }

@app.post("/api/upload")
async def upload_dataset(file: UploadFile = File(...)):
    """Handles CSV or Excel dataset file upload."""
    contents = await file.read()
    filename = file.filename.lower()
    
    try:
        if filename.endswith(".csv"):
            df_uploaded = pd.read_csv(io.BytesIO(contents))
        elif filename.endswith((".xls", ".xlsx")):
            df_uploaded = pd.read_excel(io.BytesIO(contents))
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format. Please upload CSV or Excel (.xlsx).")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse uploaded file: {str(e)}")
        
    state["pdf_ingestion_metadata"] = None
    initialize_system(df_uploaded)
    
    return {
        "message": f"Successfully ingested and processed {file.filename}",
        "data_quality_report": state["validation_report"]
    }

@app.post("/api/upload-pdf")
async def upload_pdf_report(file: UploadFile = File(...)):
    """
    PAIMANA PDF + OCR Data Ingestion Layer:
    Upload PAIMANA Project Monitoring Report (April 2026 PDF), extract parameters via Text/Table/OCR parsing,
    clean & validate dataset, and update pipeline models.
    """
    contents = await file.read()
    filename = file.filename.lower()
    
    if not filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a PAIMANA PDF report (.pdf).")
        
    try:
        df_pdf, pdf_meta = extract_paimana_pdf_data(contents)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF extraction failed: {str(e)}")
        
    state["pdf_ingestion_metadata"] = pdf_meta
    initialize_system(df_pdf)
    
    return {
        "message": f"Successfully ingested PDF report: {file.filename}",
        "pdf_metadata": pdf_meta,
        "data_quality_report": state["validation_report"]
    }

@app.get("/api/cuf-experiment")
def get_cuf_experiment():
    if not state["is_initialized"]:
        raise HTTPException(status_code=500, detail="System not initialized")
    return state["cuf_experiment_results"]

@app.get("/api/model-status")
def get_model_status():
    if not state["is_initialized"]:
        raise HTTPException(status_code=500, detail="System not initialized")
    return {
        "version": "v2.1-XGBoost-SHAP-PDF-OCR",
        "training_date": "2026-04-01",
        "dataset_name": "DRISHTI Central Sector Infrastructure Dataset (PAIMANA/OCMS Records)",
        "metrics": state["model_metrics"]
    }

class AssistantRequest(BaseModel):
    query: str

@app.post("/api/assistant")
def ask_assistant(req: AssistantRequest):
    if not state["is_initialized"]:
        raise HTTPException(status_code=500, detail="System not initialized")
    return query_project_assistant(req.query, state["featured_df"])

class ConfigRequest(BaseModel):
    weights: Optional[Dict[str, float]] = None
    thresholds: Optional[Dict[str, float]] = None

@app.post("/api/config")
def update_config(req: ConfigRequest):
    risk_engine.update_config(weights=req.weights, thresholds=req.thresholds)
    df_feat = state["featured_df"]
    risk_scores = []
    priorities = []
    
    for idx, row in df_feat.iterrows():
        c_prob = row["cost_overrun_prob"]
        t_prob = row["time_overrun_prob"]
        risk_res = risk_engine.calculate_project_risk(
            cost_overrun_prob=c_prob,
            time_overrun_prob=t_prob,
            physical_progress_pct=row["physical_progress_pct"],
            financial_progress_pct=row["financial_progress_pct"],
            planned_duration_months=row["planned_duration_months"],
            project_age_months=row["project_age_months"],
            milestone_delay_rate=row["milestone_delay_rate"]
        )
        risk_scores.append(risk_res["overall_risk_score"])
        pred_dict = {"cost_overrun_probability": c_prob, "time_overrun_probability": t_prob, "expected_delay_months": row["expected_delay_months"]}
        ew = generate_early_warnings_and_recommendations(row.to_dict(), risk_res, pred_dict)
        priorities.append(ew["priority_level"])
        
    df_feat["overall_risk_score"] = risk_scores
    df_feat["priority_level"] = priorities
    state["featured_df"] = df_feat
    
    return {"message": "Risk Engine parameters updated and project risk scores recalculated successfully."}
