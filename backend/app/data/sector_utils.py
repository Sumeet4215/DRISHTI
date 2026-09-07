import pandas as pd
from typing import List, Dict, Any

KNOWN_STATES = {
    "andhra pradesh", "arunachal pradesh", "assam", "bihar", "chhattisgarh", 
    "delhi ncr", "delhi", "goa", "gujarat", "haryana", "himachal pradesh", 
    "jammu and kashmir", "jharkhand", "karnataka", "kerala", "madhya pradesh", 
    "maharashtra", "manipur", "meghalaya", "mizoram", "nagaland", "odisha", 
    "puducherry", "punjab", "rajasthan", "sikkim", "tamil nadu", "telangana", 
    "tripura", "uttar pradesh", "uttarakhand", "west bengal"
}

CANONICAL_SECTOR_MAPPING = {
    "roads & bridges": "Roads & Bridges",
    "road transport and highways": "Roads & Bridges",
    "road transport & highways": "Roads & Bridges",
    "road transport": "Roads & Bridges",
    "highways": "Roads & Bridges",
    "roads": "Roads & Bridges",
    "morth": "Roads & Bridges",
    "nhai": "Roads & Bridges",

    "railways": "Railways",
    "railway": "Railways",
    "rail transport": "Railways",
    "railway electrification": "Railways",
    "indian railways": "Railways",

    "power transmission": "Power Transmission",
    "power": "Power Transmission",
    "renewable energy": "Renewable Energy",
    "hydro power": "Hydro Power",
    "thermal power": "Thermal Power",
    "atomic energy": "Power Transmission",
    "nuclear power": "Power Transmission",

    "oil & gas pipelines": "Oil & Gas Pipelines",
    "petroleum and natural gas": "Oil & Gas Pipelines",
    "petroleum & natural gas": "Oil & Gas Pipelines",
    "city gas distribution": "City Gas Distribution",
    "oil & gas": "Oil & Gas Pipelines",
    "petroleum": "Oil & Gas Pipelines",

    "coal mining": "Coal Mining",
    "coal": "Coal Mining",
    "mining & minerals": "Mining & Minerals",
    "mines": "Mining & Minerals",
    "steel production": "Steel Production",
    "steel": "Steel Production",

    "urban infra & metro": "Urban Infra & Metro",
    "urban infrastructure": "Urban Infra & Metro",
    "urban development": "Urban Infra & Metro",
    "housing and urban affairs": "Urban Infra & Metro",
    "metro rail": "Urban Infra & Metro",
    "smart cities infrastructure": "Smart Cities Infrastructure",
    "smart cities": "Smart Cities Infrastructure",

    "ports & shipping": "Ports & Shipping",
    "ports": "Ports & Shipping",
    "ports, shipping and waterways": "Ports & Shipping",
    "airports": "Airports",
    "civil aviation": "Airports",
    "aviation": "Airports",

    "water supply & sanitation": "Water Supply & Sanitation",
    "water resources": "Water Supply & Sanitation",
    "jal shakti": "Water Supply & Sanitation",
    "telecommunications": "Telecommunications",
    "telecom": "Telecommunications",
    "communications": "Telecommunications",
    "healthcare infrastructure": "Healthcare Infrastructure",
    "health and family welfare": "Healthcare Infrastructure",
    "educational infrastructure": "Educational Infrastructure",
    "education": "Educational Infrastructure",
    "industrial parks": "Industrial Parks",
    "multi-modal logistics parks": "Multi-Modal Logistics Parks"
}

def clean_and_normalize_sector(raw_sector: str, ministry: str = "", project_name: str = "") -> str:
    """
    Validates and normalizes raw sector values.
    Filters out project names, state names, or invalid non-sector text.
    """
    if not isinstance(raw_sector, str) or not raw_sector.strip():
        return _fallback_sector_from_context(ministry, project_name)

    val = raw_sector.strip()
    val_lower = val.lower()

    # 1. Reject state names
    if val_lower in KNOWN_STATES:
        return _fallback_sector_from_context(ministry, project_name)

    # 2. Reject obvious project names, project codes, or long descriptions
    project_keywords = ["project", "phase", "line", "expressway", "suburban", "mmtpa", "plant", "station", "bridge", "pkg", "package", "development", "construction"]
    if any(k in val_lower for k in ["project", "phase-i", "phase-ii", "mmtpa", "suburban"]) or len(val) > 40:
        return _fallback_sector_from_context(ministry, project_name)

    # 3. Direct lookup or partial match in canonical mapping
    if val_lower in CANONICAL_SECTOR_MAPPING:
        return CANONICAL_SECTOR_MAPPING[val_lower]

    for k, v in CANONICAL_SECTOR_MAPPING.items():
        if k in val_lower:
            return v

    # If it looks like a clean, valid short sector string, title format it
    if len(val) <= 35 and not any(k in val_lower for k in project_keywords):
        return val.title()

    return _fallback_sector_from_context(ministry, project_name)

def _fallback_sector_from_context(ministry: str, project_name: str) -> str:
    m_lower = ministry.lower() if isinstance(ministry, str) else ""
    p_lower = project_name.lower() if isinstance(project_name, str) else ""

    if "road" in m_lower or "highway" in m_lower or "road" in p_lower or "highway" in p_lower:
        return "Roads & Bridges"
    if "rail" in m_lower or "rail" in p_lower or "metro" in p_lower:
        return "Railways"
    if "power" in m_lower or "energy" in m_lower or "power" in p_lower or "solar" in p_lower:
        return "Power Transmission"
    if "coal" in m_lower or "coal" in p_lower or "mine" in p_lower:
        return "Coal Mining"
    if "petroleum" in m_lower or "gas" in m_lower or "pipeline" in p_lower:
        return "Oil & Gas Pipelines"
    if "urban" in m_lower or "smart" in m_lower or "housing" in m_lower:
        return "Urban Infra & Metro"
    if "port" in m_lower or "shipping" in m_lower or "dock" in p_lower:
        return "Ports & Shipping"
    if "aviation" in m_lower or "airport" in p_lower:
        return "Airports"
    if "water" in m_lower or "jal" in m_lower or "sanitation" in p_lower:
        return "Water Supply & Sanitation"
    if "telecom" in m_lower or "communication" in m_lower:
        return "Telecommunications"
    
    return "Other Infrastructure"

def get_sector_delay_risk_aggregates(df: pd.DataFrame) -> List[Dict[str, Any]]:
    """
    Groups projects by clean normalized sector, calculates average predicted delay risk probability (%),
    project count, and highest project risk score in each sector.
    Returns list sorted descending by avg_delay_risk (Highest Risk first).
    """
    if df is None or df.empty:
        return []

    df_copy = df.copy()
    
    normalized_sectors = []
    for idx, row in df_copy.iterrows():
        raw_sec = str(row.get("sector", ""))
        min_val = str(row.get("ministry", ""))
        prj_val = str(row.get("project_name", ""))
        norm_sec = clean_and_normalize_sector(raw_sec, min_val, prj_val)
        normalized_sectors.append(norm_sec)
        
    df_copy["normalized_sector"] = normalized_sectors
    
    grouped = []
    for sec_name, group in df_copy.groupby("normalized_sector"):
        count = len(group)
        if "time_overrun_prob" in group.columns:
            avg_delay = float(group["time_overrun_prob"].mean())
        elif "overall_risk_score" in group.columns:
            avg_delay = float(group["overall_risk_score"].mean() * 0.45 + 15)
        else:
            avg_delay = 30.0

        avg_delay = round(min(100.0, max(0.0, avg_delay)), 1)
        highest_risk = int(group["overall_risk_score"].max()) if "overall_risk_score" in group.columns else 85
        avg_risk_score = float(group["overall_risk_score"].mean()) if "overall_risk_score" in group.columns else 50.0
        avg_delay_months = float(group["expected_delay_months"].mean()) if "expected_delay_months" in group.columns else 12.0
        orig_cost_sum = float(group["original_cost"].sum()) if "original_cost" in group.columns else 0.0
        rev_cost_sum = float(group["revised_cost"].sum()) if "revised_cost" in group.columns else 0.0

        grouped.append({
            "sector": sec_name,
            "project_count": count,
            "avg_delay_risk": avg_delay,
            "avg_delay_risk_pct": avg_delay,
            "highest_project_risk": highest_risk,
            "overall_risk_score": round(avg_risk_score, 1),
            "expected_delay_months": round(avg_delay_months, 1),
            "original_cost": orig_cost_sum,
            "revised_cost": rev_cost_sum
        })

    # Sort descending by avg_delay_risk (Highest Risk first)
    grouped.sort(key=lambda x: x["avg_delay_risk"], reverse=True)
    return grouped
