use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Deserialize)]
pub struct PenaltyRequest {
    pub raw_score: f64,
    pub alerts: Vec<Alert>,
    pub matrix: Vec<MatrixItem>,
    pub cognitive: Option<CognitiveInfo>,
}

#[derive(Deserialize)]
pub struct Alert {
    pub severity: Option<String>,
}

#[derive(Deserialize)]
#[allow(dead_code)]
pub struct MatrixItem {
    pub file: String,
    pub advanced_metrics: Option<AdvancedMetrics>,
    pub component_type: Option<String>,
    pub test_status: Option<String>,
}

#[derive(Deserialize)]
pub struct AdvancedMetrics {
    pub cyclomatic_complexity: Option<i32>,
    pub cognitive_complexity: Option<i32>,
    pub nesting_depth: Option<i32>,
    pub cbo: Option<i32>,
    pub dit: Option<i32>,
    pub maintainability_index: Option<f64>,
    pub defect_density: Option<f64>,
    pub quality_gate: Option<String>,
    pub is_shadow: Option<bool>,
    pub shadow_compliance_compliant: Option<bool>,
}

#[derive(Deserialize)]
pub struct CognitiveInfo {
    pub status: String,
}

#[derive(Serialize)]
pub struct PenaltyResponse {
    pub final_score: i32,
    pub adjustments: HashMap<String, f64>,
    pub ceiling: i32,
    pub total_drain: f64,
}

struct Stats {
    cc: i32,
    cog: i32,
    nest: i32,
    cbo: i32,
    dit: i32,
    mi_l: i32,
    mi_c: i32,
    def: i32,
    red: i32,
    shad: i32,
    total: usize,
    shallow: i32,
}

pub fn calculate_penalty(req: PenaltyRequest) -> PenaltyResponse {
    let caps = [
        ("cc", 5.0), ("cognitive", 4.0), ("nesting", 3.0), ("cbo", 3.0),
        ("dit", 2.0), ("mi_low", 4.0), ("mi_critical", 3.0), ("defect", 3.0),
        ("gate_red", 3.0), ("shadow", 3.0)
    ].iter().cloned().collect::<HashMap<_, _>>();

    let mut stats = Stats {
        cc: 0, cog: 0, nest: 0, cbo: 0, dit: 0, mi_l: 0, mi_c: 0, 
        def: 0, red: 0, shad: 0, total: req.matrix.len(), shallow: 0 
    };

    for item in &req.matrix {
        if let Some(m) = &item.advanced_metrics {
            if m.cyclomatic_complexity.unwrap_or(0) > 20 { stats.cc += 1; }
            if m.cognitive_complexity.unwrap_or(0) > 15 { stats.cog += 1; }
            if m.nesting_depth.unwrap_or(0) > 3 { stats.nest += 1; }
            if m.cbo.unwrap_or(0) > 10 { stats.cbo += 1; }
            if m.dit.unwrap_or(0) > 5 { stats.dit += 1; }
            
            let mi = m.maintainability_index.unwrap_or(0.0);
            if mi > 0.0 && mi < 10.0 { stats.mi_l += 1; }
            if mi > 0.0 && mi < 5.0 { stats.mi_c += 1; }
            
            if m.defect_density.unwrap_or(0.0) > 1.0 { stats.def += 1; }
            if m.quality_gate.as_deref() == Some("RED") { stats.red += 1; }
            if m.is_shadow.unwrap_or(false) && m.shadow_compliance_compliant == Some(false) { stats.shad += 1; }

            // Shallow test detection
            let comp = item.component_type.as_deref().unwrap_or("UNKNOWN");
            let is_logic = ["AGENT", "CORE", "LOGIC", "UTIL", "UNKNOWN"].contains(&comp);
            if item.test_status.as_deref() == Some("SHALLOW") && is_logic && m.quality_gate.as_deref() != Some("GREEN") {
                stats.shallow += 1;
            }
        }
    }

    let prop = |count: i32, cap: f64| -> f64 {
        let total = stats.total.max(1) as f64;
        let p = (count as f64 / total) * cap;
        (p.min(cap) * 10.0).round() / 10.0
    };

    let cog_penalty = match req.cognitive.map(|c| c.status).as_deref() {
        Some("FAIL") => 5.0,
        Some("DEGRADED") => 2.0,
        _ => 0.0,
    };

    let mut adjustments = HashMap::new();
    adjustments.insert("Cognitive (System Sanity)".to_string(), cog_penalty);
    adjustments.insert("Quality (CC > 20 - High Risk)".to_string(), prop(stats.cc, *caps.get("cc").unwrap()));
    adjustments.insert("Quality (Cognitive > 15)".to_string(), prop(stats.cog, *caps.get("cognitive").unwrap()));
    adjustments.insert("Quality (Nesting > 3)".to_string(), prop(stats.nest, *caps.get("nesting").unwrap()));
    adjustments.insert("Quality (CBO > 10 - High Coupling)".to_string(), prop(stats.cbo, *caps.get("cbo").unwrap()));
    adjustments.insert("Quality (DIT > 5 - Deep Inheritance)".to_string(), prop(stats.dit, *caps.get("dit").unwrap()));
    adjustments.insert("Quality (MI < 10 - Low Maint)".to_string(), prop(stats.mi_l, *caps.get("mi_low").unwrap()));
    adjustments.insert("Quality (MI < 5 - Critical)".to_string(), prop(stats.mi_c, *caps.get("mi_critical").unwrap()));
    adjustments.insert("Quality (Defect Density > 1/KLOC)".to_string(), prop(stats.def, *caps.get("defect").unwrap()));
    adjustments.insert("Quality (Gate RED)".to_string(), prop(stats.red, *caps.get("gate_red").unwrap()));
    adjustments.insert("Quality (Shadow Non-Compliant)".to_string(), prop(stats.shad, *caps.get("shadow").unwrap()));
    adjustments.insert("Stability (Coverage)".to_string(), stats.shallow as f64 * 0.01);

    // Security & Excellence (count based)
    let sec_count = req.alerts.iter().filter(|a| matches!(a.severity.as_deref(), Some("critical") | Some("high"))).count();
    adjustments.insert("Security (Vulnerabilities)".to_string(), sec_count as f64 * 10.0);
    
    // Note: TS code uses string alerts for documentation excellence, we'll need to pass them too if needed.
    // For now, let's assume alerts are objects.

    let total_drain: f64 = adjustments.iter()
        .filter(|(k, _)| k.starts_with("Quality (") || k.starts_with("Cognitive ("))
        .map(|(_, v)| *v)
        .sum();

    let mut ceiling = 100;
    let sevs: Vec<String> = req.alerts.iter().filter_map(|a| a.severity.clone().map(|s| s.to_lowercase())).collect();
    if sevs.contains(&"critical".to_string()) || sevs.contains(&"high".to_string()) {
        ceiling = 70;
    } else if sevs.contains(&"medium".to_string()) {
        ceiling = 95;
    }

    let final_score = ((req.raw_score.min(ceiling as f64) - total_drain).max(0.0).round()) as i32;

    PenaltyResponse {
        final_score,
        adjustments,
        ceiling,
        total_drain,
    }
}
