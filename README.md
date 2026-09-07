# DRISHTI

### Infrastructure Project Intelligence & Early Warning System
**Smart India Hackathon 2026 — Problem ID: SIH26103**  
**Ministry of Statistics and Programme Implementation (MoSPI)**

---

## 📌 Executive Summary

**DRISHTI** (*Data → Prediction → Risk → Insight → Early Warning*) is an AI-powered infrastructure project monitoring and decision-support platform. It augments existing government monitoring systems (PAIMANA / OCMS) by providing predictive risk analytics, Explainable AI (SHAP), normalized risk decomposition (0–100), automated early warning prioritisations (P1–P4), cross-sector peer benchmarking, multi-format data ingestion (including scanned PDF OCR), and a grounded RAG analyst query portal.

---

## 🎯 Official Problem Context (SIH26103)

The Infrastructure & Project Monitoring Division (IPMD), Ministry of Statistics and Programme Implementation (MoSPI), monitors Central Sector Infrastructure Projects costing ₹150 Crore and above. **DRISHTI** delivers predictive foresight:

* **What happened? / What is happening?** *(Existing PAIMANA / OCMS Monitoring)*
* **What is likely to happen? Why is it happening? What action should be taken?** *(DRISHTI Intelligence Upgrade)*

---

## 🚀 Key Modules & Architecture

1. **Portfolio Executive Overview**: Live risk metrics, total financial exposure, delay probabilities, priority review queues, and Leaflet Geo Risk map.
2. **Predictive ML Engine**: XGBoost, Random Forest, and LightGBM models trained for cost overrun probability, schedule delay duration forecasting, and time overrun classification.
3. **Explainable AI (SHAP XAI)**: Project-level feature importance attribution detailing specific root-cause risk drivers (Land acquisition, milestone slippage, payment delays, litigation).
4. **Early Warning & Action Prioritization**: Categorized P1 (Critical) to P4 (Low) priority queues with prescriptive administrative recommendations.
5. **Peer Sector & Scale Benchmarking**: Comparative performance metrics across 22 Central Infrastructure Sectors against national cohort medians.
6. **Multi-Format Data Ingestion**: Structured CSV/XLSX ingestion alongside automated PDF Report extraction with `pdfplumber` OCR fallback.
   > *“PDF-based data ingestion with OCR support when structured/API data is unavailable.”*
7. **Grounded RAG Analyst Query Portal**: Natural language project intelligence querying backed directly by database records.

---

## 🛠️ Technology Stack

* **Frontend**: React, TypeScript, Tailwind CSS, Recharts, Lucide React, Leaflet Maps, Vite.
* **Backend**: FastAPI (Python), Uvicorn, Pandas, NumPy, Scikit-learn, XGBoost, SHAP, PyPDF, PDFPlumber.
* **Database & RAG**: Grounded In-Memory Vector & Relational Query Store.

---

## 🚦 Quick Start Guide

### Prerequisites
* Python 3.10+
* Node.js 18+

### 1. Backend Setup
```bash
cd backend
python -m venv .venv
# Activate virtualenv (Windows: .venv\Scripts\activate | Linux/Mac: source .venv/bin/activate)
pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```
Backend API will be live at `http://127.0.0.1:8000` (Docs: `http://127.0.0.1:8000/docs`).

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend Dashboard will be live at `http://localhost:5173`.

---

## 📜 License & Citation

Developed for **Smart India Hackathon 2026 (SIH26103)** under MoSPI infrastructure monitoring guidelines.
