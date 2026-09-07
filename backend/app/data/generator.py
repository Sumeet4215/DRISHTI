import random
import datetime
import numpy as np
import pandas as pd
from typing import List, Dict, Any

MINISTRIES = [
    "Ministry of Road Transport and Highways",
    "Ministry of Railways",
    "Ministry of Power",
    "Ministry of Coal",
    "Ministry of Petroleum and Natural Gas",
    "Ministry of Housing and Urban Affairs",
    "Ministry of Ports, Shipping and Waterways",
    "Ministry of Jal Shakti (Water Resources)",
    "Ministry of Civil Aviation",
    "Ministry of Steel",
    "Ministry of Mines",
    "Ministry of Communications",
    "Ministry of Heavy Industries",
    "Ministry of Atomic Energy",
    "Ministry of Health and Family Welfare",
    "Ministry of Education",
    "Ministry of Chemicals and Fertilizers"
]

SECTORS = [
    "Roads & Bridges",
    "Railways",
    "Power Transmission",
    "Renewable Energy",
    "Coal Mining",
    "Steel Production",
    "Oil & Gas Pipelines",
    "Urban Infra & Metro",
    "Ports & Shipping",
    "Airports",
    "Water Supply & Sanitation",
    "Telecommunications",
    "Healthcare Infrastructure",
    "Educational Infrastructure",
    "Industrial Parks",
    "Hydro Power",
    "Thermal Power",
    "City Gas Distribution",
    "Mining & Minerals",
    "Railway Electrification",
    "Multi-Modal Logistics Parks",
    "Smart Cities Infrastructure"
]

STATES_LAT_LNG = {
    "Maharashtra": (19.7515, 75.7139),
    "Uttar Pradesh": (26.8467, 80.9462),
    "Tamil Nadu": (11.1271, 78.6569),
    "Gujarat": (22.2587, 71.1924),
    "Karnataka": (15.3173, 75.7139),
    "West Bengal": (22.9868, 87.8550),
    "Rajasthan": (27.0238, 74.2179),
    "Odisha": (20.9517, 85.0985),
    "Andhra Pradesh": (15.9129, 79.7400),
    "Madhya Pradesh": (22.9734, 78.6569),
    "Bihar": (25.0961, 85.3131),
    "Jharkhand": (23.6102, 85.2799),
    "Assam": (26.2006, 92.9376),
    "Telangana": (18.1124, 79.0193),
    "Kerala": (10.8505, 76.2711),
    "Punjab": (31.1471, 75.3412),
    "Haryana": (29.0588, 76.0856),
    "Chhattisgarh": (21.2787, 81.8661),
    "Uttarakhand": (30.0668, 79.0193),
    "Himachal Pradesh": (31.1048, 77.1734),
    "Jammu and Kashmir": (33.7782, 76.5762),
    "Delhi NCR": (28.7041, 77.1025)
}

AGENCIES = [
    "NHAI (National Highways Authority of India)",
    "Indian Railways (RVNL / IRCON)",
    "NTPC Limited",
    "Coal India Limited (CIL)",
    "Power Grid Corporation of India (PGCIL)",
    "GAIL (India) Limited",
    "IOCL (Indian Oil Corporation)",
    "CPWD (Central Public Works Department)",
    "NBCC (India) Limited",
    "AAI (Airports Authority of India)",
    "Delhi Metro Rail Corporation (DMRC)",
    "NPCIL (Nuclear Power Corporation)",
    "SAIL (Steel Authority of India)",
    "NALCO",
    "BHEL"
]

DELAY_REASONS_LIST = [
    "Land Acquisition Bottlenecks",
    "Environmental & Forest Clearance Delays",
    "Contractor Resource Constraints & Slow Mobilization",
    "Right of Way (RoW) Disputes",
    "Equipment & Material Supply Chain Disruptions",
    "Financial & Fund Flow Reconciliation Delays",
    "Local Administrative & Law & Order Issues",
    "Geological Anomalies & Severe Weather Disruptions",
    "Design Variations & Scope Changes",
    "Litigations and Court Stay Orders"
]

def generate_paimana_dataset(n_projects: int = 1981, seed: int = 42) -> pd.DataFrame:
    """
    Generates a high-fidelity synthetic PAIMANA dataset of 1,981 Central Sector Infrastructure Projects
    scaled to match MoSPI macro statistics:
    - Original Cost ~ ₹37.13 Lakh Cr
    - Revised Cost ~ ₹42.78 Lakh Cr
    - Cumulative Expenditure ~ ₹20.36 Lakh Cr
    """
    random.seed(seed)
    np.random.seed(seed)
    
    records = []
    current_date = datetime.date(2026, 4, 1)
    
    for i in range(1, n_projects + 1):
        proj_id = f"PRJ-2026-{i:04d}"
        proj_name = f"Central Infrastructure Project {i} - {random.choice(['Expansion', 'Phase II', 'Corridor', 'Modernization', 'Augmentation', 'Greenfield Facility'])}"
        ministry = random.choice(MINISTRIES)
        sector = random.choice(SECTORS)
        agency = random.choice(AGENCIES)
        state, (base_lat, base_lng) = random.choice(list(STATES_LAT_LNG.items()))
        
        lat = round(base_lat + random.uniform(-0.8, 0.8), 4)
        lng = round(base_lng + random.uniform(-0.8, 0.8), 4)
        
        size_category = random.choices(['Medium', 'Large', 'Mega'], weights=[0.6, 0.3, 0.1])[0]
        if size_category == 'Medium':
            orig_cost = round(random.uniform(150, 800), 2)
        elif size_category == 'Large':
            orig_cost = round(random.uniform(800, 3500), 2)
        else: # Mega
            orig_cost = round(random.uniform(3500, 42000), 2)
            
        is_risky = random.random() < 0.42
        
        if is_risky:
            cost_escalation_factor = random.uniform(1.08, 1.85)
            schedule_delay_months = random.randint(6, 48)
            physical_progress = round(random.uniform(15.0, 78.0), 2)
            financial_progress = round(min(100.0, physical_progress + random.uniform(5.0, 30.0)), 2)
        else:
            cost_escalation_factor = random.uniform(1.0, 1.05)
            schedule_delay_months = random.randint(0, 5)
            physical_progress = round(random.uniform(40.0, 98.0), 2)
            financial_progress = round(max(0.0, physical_progress + random.uniform(-4.0, 4.0)), 2)
            
        revised_cost = round(orig_cost * cost_escalation_factor, 2)
        expenditure = round(revised_cost * (financial_progress / 100.0) * random.uniform(0.92, 1.02), 2)
        expenditure = min(expenditure, revised_cost)
        
        start_days_ago = random.randint(300, 2200)
        start_date = current_date - datetime.timedelta(days=start_days_ago)
        planned_duration_months = random.randint(24, 72)
        orig_completion_date = start_date + datetime.timedelta(days=planned_duration_months * 30)
        rev_completion_date = orig_completion_date + datetime.timedelta(days=schedule_delay_months * 30)
        
        total_milestones = random.randint(8, 25)
        if is_risky:
            delayed_milestones = random.randint(int(total_milestones * 0.3), int(total_milestones * 0.8))
        else:
            delayed_milestones = random.randint(0, max(1, int(total_milestones * 0.15)))
            
        land_acquired_pct = round(random.uniform(45.0, 100.0) if not is_risky else random.uniform(20.0, 75.0), 2)
        regulatory_clearances_obtained = random.choice([True, False]) if is_risky else True
        contractor_performance_rating = round(random.uniform(1.8, 3.5) if is_risky else random.uniform(3.6, 5.0), 1)
        litigation_cases = random.randint(1, 6) if is_risky and random.random() < 0.5 else 0
        payment_clearance_delay_days = random.randint(30, 120) if is_risky else random.randint(5, 30)
        change_orders_count = random.randint(2, 12) if is_risky else random.randint(0, 3)
        primary_delay_reason = random.choice(DELAY_REASONS_LIST) if is_risky else "None / Minor Routine Adjustment"
        
        status = "Ongoing"
        if physical_progress >= 99.0:
            status = "Commissioned / Near Completion"
        elif is_risky and (rev_completion_date < current_date or delayed_milestones > total_milestones * 0.5):
            status = "Delayed / High Risk"
            
        records.append({
            "project_id": proj_id,
            "project_name": proj_name,
            "ministry": ministry,
            "sector": sector,
            "implementing_agency": agency,
            "state": state,
            "latitude": lat,
            "longitude": lng,
            "original_cost": orig_cost,
            "revised_cost": revised_cost,
            "cumulative_expenditure": expenditure,
            "start_date": start_date.strftime("%Y-%m-%d"),
            "original_completion_date": orig_completion_date.strftime("%Y-%m-%d"),
            "revised_completion_date": rev_completion_date.strftime("%Y-%m-%d"),
            "planned_duration_months": planned_duration_months,
            "physical_progress_pct": physical_progress,
            "financial_progress_pct": financial_progress,
            "total_milestones": total_milestones,
            "delayed_milestones": delayed_milestones,
            "status": status,
            "primary_delay_reason": primary_delay_reason,
            # Proposed Additional Variables (CUF +)
            "land_acquired_pct": land_acquired_pct,
            "regulatory_clearance_status": "Cleared" if regulatory_clearances_obtained else "Pending Clearance",
            "contractor_rating": contractor_performance_rating,
            "active_litigations": litigation_cases,
            "avg_payment_delay_days": payment_clearance_delay_days,
            "scope_change_orders": change_orders_count
        })
        
    df = pd.DataFrame(records)
    
    # Scale to MoSPI PAIMANA April 2026 totals (~37.13L Cr Orig, ~42.78L Cr Rev, ~20.36L Cr Exp)
    curr_orig_sum = df["original_cost"].sum()
    curr_rev_sum = df["revised_cost"].sum()
    curr_exp_sum = df["cumulative_expenditure"].sum()
    
    scale_orig = 3713000.0 / curr_orig_sum
    scale_rev = 4278000.0 / curr_rev_sum
    scale_exp = 2036000.0 / curr_exp_sum
    
    df["original_cost"] = (df["original_cost"] * scale_orig).round(2)
    df["revised_cost"] = (df["revised_cost"] * scale_rev).round(2)
    df["cumulative_expenditure"] = (df["cumulative_expenditure"] * scale_exp).round(2)
    
    df["cumulative_expenditure"] = np.minimum(df["cumulative_expenditure"], df["revised_cost"])
    
    return df

if __name__ == "__main__":
    df = generate_paimana_dataset(1981)
    df.to_csv("paimana_master_dataset.csv", index=False)
    print(f"Generated PAIMANA dataset with {len(df)} records.")
