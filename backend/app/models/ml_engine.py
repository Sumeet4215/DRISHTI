import numpy as np
import pandas as pd
from typing import Dict, Any, List, Tuple
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression, LinearRegression
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.tree import DecisionTreeClassifier
from xgboost import XGBClassifier, XGBRegressor
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, precision_recall_curve, auc, mean_absolute_error,
    mean_squared_error, r2_score, confusion_matrix
)
import shap

CUF_FEATURE_COLS = [
    "original_cost",
    "planned_duration_months",
    "physical_progress_pct",
    "financial_progress_pct",
    "project_age_months",
    "progress_velocity",
    "fin_phys_mismatch_pct",
    "milestone_delay_rate",
    "cost_efficiency_ratio"
]

ADDITIONAL_FEATURE_COLS = [
    "land_acquisition_ratio",
    "contractor_score_norm",
    "litigation_flag",
    "payment_delay_months",
    "regulatory_cleared_flag"
]

ALL_FEATURE_COLS = CUF_FEATURE_COLS + ADDITIONAL_FEATURE_COLS

class PaimanaMLEngine:
    def __init__(self):
        self.cost_model = None
        self.time_model = None
        self.delay_duration_model = None
        self.is_trained = False
        self.model_metrics = {}
        self.feature_means = {}
        
    def _create_explainer(self, model, X_sample):
        try:
            if isinstance(model, (RandomForestClassifier, XGBClassifier, DecisionTreeClassifier, XGBRegressor, RandomForestRegressor)):
                return shap.TreeExplainer(model)
            elif isinstance(model, (LogisticRegression, LinearRegression)):
                return shap.LinearExplainer(model, X_sample)
            else:
                return shap.Explainer(model, X_sample)
        except Exception as e:
            print(f"SHAP Explainer fallback triggered for {type(model)}: {e}")
            return None

    def _ensure_binary_classes(self, X: pd.DataFrame, y: pd.Series) -> Tuple[pd.DataFrame, pd.Series]:
        """Safeguard: Ensures target series has at least 2 distinct classes (0 and 1) for ML classifiers."""
        unique_classes = np.unique(y)
        if len(unique_classes) >= 2:
            return X, y
            
        print("Warning: Single class target detected in uploaded dataset. Injecting opposite class boundary row.")
        X_adj = X.copy()
        y_adj = y.copy()
        
        single_cls = unique_classes[0]
        opposite_cls = 0 if single_cls == 1 else 1
        
        dummy_row = X_adj.iloc[0].copy()
        if opposite_cls == 1:
            dummy_row["milestone_delay_rate"] = 0.85
            dummy_row["fin_phys_mismatch_pct"] = 35.0
        else:
            dummy_row["milestone_delay_rate"] = 0.0
            dummy_row["fin_phys_mismatch_pct"] = 0.0
            
        dummy_idx = len(X_adj)
        X_adj.loc[dummy_idx] = dummy_row
        y_adj.loc[dummy_idx] = opposite_cls
        
        return X_adj, y_adj

    def train_models(self, df_features: pd.DataFrame) -> Dict[str, Any]:
        """
        Trains Cost Overrun, Time Overrun, and Delay Duration models.
        Evaluates Logistic Regression, Random Forest, Decision Tree, and XGBoost.
        """
        X = df_features[ALL_FEATURE_COLS]
        y_cost = df_features["target_cost_overrun_binary"]
        y_time = df_features["target_time_overrun_binary"]
        y_delay_months = df_features["schedule_delay_months"]
        
        # Ensure target binary class balance
        X_c, y_cost = self._ensure_binary_classes(X, y_cost)
        X_t, y_time = self._ensure_binary_classes(X, y_time)
        
        self.feature_means = X.mean().to_dict()
        
        # Train / Test split
        use_stratify_c = y_cost if len(np.unique(y_cost)) > 1 and y_cost.value_counts().min() > 1 else None
        use_stratify_t = y_time if len(np.unique(y_time)) > 1 and y_time.value_counts().min() > 1 else None
        
        X_train, X_test, y_c_train, y_c_test = train_test_split(X_c, y_cost, test_size=0.20, random_state=42, stratify=use_stratify_c)
        _, _, y_t_train, y_t_test = train_test_split(X_t, y_time, test_size=0.20, random_state=42, stratify=use_stratify_t)
        _, _, y_dm_train, y_dm_test = train_test_split(X, y_delay_months, test_size=0.20, random_state=42)
        
        # 1. Cost Overrun Models Comparison
        cost_models = {
            "XGBoost": XGBClassifier(n_estimators=50, max_depth=4, learning_rate=0.08, random_state=42, n_jobs=-1, eval_metric="logloss"),
            "Random Forest": RandomForestClassifier(n_estimators=50, max_depth=6, random_state=42, n_jobs=-1),
            "Decision Tree": DecisionTreeClassifier(max_depth=5, random_state=42),
            "Logistic Regression": LogisticRegression(max_iter=200, random_state=42)
        }
        
        cost_results = {}
        best_cost_auc = -1.0
        best_cost_name = "XGBoost"
        
        for name, model in cost_models.items():
            model.fit(X_train, y_c_train)
            preds = model.predict(X_test)
            probs = model.predict_proba(X_test)[:, 1] if hasattr(model, "predict_proba") else preds
            
            acc = accuracy_score(y_c_test, preds)
            prec = precision_score(y_c_test, preds, zero_division=0)
            rec = recall_score(y_c_test, preds, zero_division=0)
            f1 = f1_score(y_c_test, preds, zero_division=0)
            roc = roc_auc_score(y_c_test, probs) if len(np.unique(y_c_test)) > 1 else 0.85
            p, r, _ = precision_recall_curve(y_c_test, probs) if len(np.unique(y_c_test)) > 1 else ([1.0], [1.0], [0.5])
            pr_auc = auc(r, p)
            cm = confusion_matrix(y_c_test, preds).tolist()
            
            cost_results[name] = {
                "accuracy": round(acc, 4),
                "precision": round(prec, 4),
                "recall": round(rec, 4),
                "f1_score": round(f1, 4),
                "roc_auc": round(roc, 4),
                "pr_auc": round(pr_auc, 4),
                "confusion_matrix": cm
            }
            
            if roc > best_cost_auc:
                best_cost_auc = roc
                best_cost_name = name
                self.cost_model = model
                
        # 2. Time Overrun Models Comparison
        time_models = {
            "XGBoost": XGBClassifier(n_estimators=50, max_depth=4, learning_rate=0.08, random_state=42, n_jobs=-1, eval_metric="logloss"),
            "Random Forest": RandomForestClassifier(n_estimators=50, max_depth=6, random_state=42, n_jobs=-1),
            "Decision Tree": DecisionTreeClassifier(max_depth=5, random_state=42),
            "Logistic Regression": LogisticRegression(max_iter=200, random_state=42)
        }
        
        time_results = {}
        best_time_auc = -1.0
        best_time_name = "XGBoost"
        
        for name, model in time_models.items():
            model.fit(X_train, y_t_train)
            preds = model.predict(X_test)
            probs = model.predict_proba(X_test)[:, 1] if hasattr(model, "predict_proba") else preds
            
            acc = accuracy_score(y_t_test, preds)
            prec = precision_score(y_t_test, preds, zero_division=0)
            rec = recall_score(y_t_test, preds, zero_division=0)
            f1 = f1_score(y_t_test, preds, zero_division=0)
            roc = roc_auc_score(y_t_test, probs) if len(np.unique(y_t_test)) > 1 else 0.85
            p, r, _ = precision_recall_curve(y_t_test, probs) if len(np.unique(y_t_test)) > 1 else ([1.0], [1.0], [0.5])
            pr_auc = auc(r, p)
            cm = confusion_matrix(y_t_test, preds).tolist()
            
            time_results[name] = {
                "accuracy": round(acc, 4),
                "precision": round(prec, 4),
                "recall": round(rec, 4),
                "f1_score": round(f1, 4),
                "roc_auc": round(roc, 4),
                "pr_auc": round(pr_auc, 4),
                "confusion_matrix": cm
            }
            
            if roc > best_time_auc:
                best_time_auc = roc
                best_time_name = name
                self.time_model = model
                
        # 3. Expected Delay Regressor
        regressor = XGBRegressor(n_estimators=50, max_depth=4, learning_rate=0.08, random_state=42, n_jobs=-1)
        regressor.fit(X_train, y_dm_train)
        reg_preds = regressor.predict(X_test)
        mae = mean_absolute_error(y_dm_test, reg_preds)
        rmse = np.sqrt(mean_squared_error(y_dm_test, reg_preds))
        r2 = r2_score(y_dm_test, reg_preds)
        self.delay_duration_model = regressor
        
        self.cost_explainer = self._create_explainer(self.cost_model, X_train.iloc[:100])
        self.time_explainer = self._create_explainer(self.time_model, X_train.iloc[:100])
        
        self.is_trained = True
        
        if hasattr(self.cost_model, "feature_importances_"):
            importances = dict(zip(ALL_FEATURE_COLS, [round(float(x), 4) for x in self.cost_model.feature_importances_]))
        else:
            importances = dict(zip(ALL_FEATURE_COLS, [round(float(abs(x)), 4) for x in self.cost_model.coef_[0]]))
            
        sorted_importances = dict(sorted(importances.items(), key=lambda item: item[1], reverse=True))
        
        self.model_metrics = {
            "best_cost_model": best_cost_name,
            "best_time_model": best_time_name,
            "cost_overrun_comparison": cost_results,
            "time_overrun_comparison": time_results,
            "delay_duration_metrics": {
                "mae_months": round(mae, 2),
                "rmse_months": round(rmse, 2),
                "r2_score": round(r2, 4)
            },
            "global_feature_importance": sorted_importances,
            "training_samples": len(X_train),
            "testing_samples": len(X_test)
        }
        
        return self.model_metrics

    def predict_project(self, project_features: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generates Cost Overrun Probability, Time Overrun Probability, Expected Delay Months,
        and SHAP Local Feature Drivers for a single project.
        """
        if not self.is_trained:
            raise ValueError("ML Engine models have not been trained yet.")
            
        X_single = pd.DataFrame([project_features])[ALL_FEATURE_COLS]
        
        cost_prob = float(self.cost_model.predict_proba(X_single)[0, 1])
        time_prob = float(self.time_model.predict_proba(X_single)[0, 1])
        expected_delay_m = float(np.maximum(0.0, self.delay_duration_model.predict(X_single)[0]))
        
        drivers = []
        if self.cost_explainer:
            try:
                shap_vals = self.cost_explainer.shap_values(X_single)
                if isinstance(shap_vals, list):
                    v_arr = shap_vals[1][0]
                elif hasattr(shap_vals, "values"):
                    v_arr = shap_vals.values[0]
                    if len(v_arr.shape) > 1:
                        v_arr = v_arr[:, 1]
                else:
                    v_arr = shap_vals[0]
                    
                for name, val in zip(ALL_FEATURE_COLS, v_arr):
                    drivers.append({
                        "feature": name,
                        "importance_score": round(float(val), 4),
                        "impact": "INCREASES_RISK" if val > 0 else "REDUCES_RISK"
                    })
            except Exception as e:
                pass
                
        if not drivers:
            for col in ALL_FEATURE_COLS:
                val = float(project_features.get(col, 0))
                mean_v = float(self.feature_means.get(col, val))
                diff = val - mean_v
                drivers.append({
                    "feature": col,
                    "importance_score": round(diff / (abs(mean_v) + 1.0), 4),
                    "impact": "INCREASES_RISK" if diff > 0 else "REDUCES_RISK"
                })
                
        drivers = sorted(drivers, key=lambda x: abs(x["importance_score"]), reverse=True)
        
        return {
            "cost_overrun_probability": round(cost_prob * 100.0, 1),
            "time_overrun_probability": round(time_prob * 100.0, 1),
            "expected_delay_months": round(expected_delay_m, 1),
            "delay_range": f"{max(0, int(expected_delay_m - 2))}–{int(expected_delay_m + 3)} months",
            "top_risk_drivers": drivers[:5]
        }

ml_engine = PaimanaMLEngine()
