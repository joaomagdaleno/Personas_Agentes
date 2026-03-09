use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Serialize, Deserialize)]
pub struct ScoreRequest {
    pub map_data: HashMap<String, FileInfo>,
    pub alerts: Vec<Alert>,
    pub qa_data: Option<QaData>,
    pub cognitive: Option<CognitiveStatus>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct FileInfo {
    pub component_type: String,
    pub complexity: f64,
    pub has_test: bool,
    pub has_telemetry: bool,
    pub purpose: String,
    pub advanced_metrics: Option<AdvancedMetrics>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AdvancedMetrics {
    pub cyclomatic_complexity: f64,
    pub cognitive_complexity: f64,
    pub maintainability_index: f64,
    pub quality_gate: String,
    pub nesting_depth: f64,
    pub cbo: f64,
    pub dit: f64,
    pub defect_density: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Alert {
    pub severity: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct QaData {
    pub matrix: Vec<MatrixItem>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct MatrixItem {
    pub file: String,
    pub advanced_metrics: AdvancedMetrics,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CognitiveStatus {
    pub status: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ScoreResponse {
    pub score: f64,
    pub breakdown: HashMap<String, f64>,
}

pub fn calculate_score(request: ScoreRequest) -> ScoreResponse {
    let mut breakdown = HashMap::new();
    let total_files = request.map_data.len() as f64;
    if total_files == 0.0 {
        return ScoreResponse { score: 0.0, breakdown };
    }

    // 1. Pillars
    let stability = calc_stability(&request.map_data);
    let purity = calc_purity(&request.map_data, total_files);
    let observability = calc_observability(&request.map_data);
    let security = calc_security(&request.alerts);
    let excellence = calc_excellence(&request.map_data, total_files);

    // 2. Adjustments (Penalties)
    let adj = get_adjustments(&request.map_data, &request.alerts, &request.qa_data, &request.cognitive);

    // 3. Raw Score & Final Score
    let pillar_sum = stability.0 + purity.0 + observability.0 + security.0 + excellence.0;
    let quality_bonus = calc_quality_bonus(&request.qa_data);
    let raw = pillar_sum + (quality_bonus / total_files);

    // Final Logic: Ceiling & Drain
    let total_drain: f64 = adj.iter()
        .filter(|(k, _)| k.starts_with("Quality (") || k.starts_with("Cognitive ("))
        .map(|(_, v)| *v)
        .sum();

    let mut ceiling = 100.0;
    let has_crit_high = request.alerts.iter().any(|a| a.severity == "critical" || a.severity == "high");
    let has_med = request.alerts.iter().any(|a| a.severity == "medium");

    if has_crit_high { ceiling = 70.0; }
    else if has_med { ceiling = 95.0; }

    let final_score = (raw.min(ceiling) - total_drain).max(0.0).round();

    // 4. Build Breakdown
    breakdown.insert("Stability (Coverage)".to_string(), (stability.0 - adj.get("Stability (Coverage)").unwrap_or(&0.0)).max(0.0));
    breakdown.insert("Purity (Complexity)".to_string(), (purity.0 - adj.get("Quality (CC > 20 - High Risk)").unwrap_or(&0.0)).max(0.0));
    breakdown.insert("Observability (Telemetry)".to_string(), observability.0);
    breakdown.insert("Security (Vulnerabilities)".to_string(), (security.0 - adj.get("Security (Vulnerabilities)").unwrap_or(&0.0)).max(0.0));
    breakdown.insert("Excellence (Documentation)".to_string(), (excellence.0 - adj.get("Excellence (Documentation)").unwrap_or(&0.0)).max(0.0));

    // Add quality adjustments to breakdown
    for (k, v) in adj.iter() {
        if !breakdown.contains_key(k) {
            breakdown.insert(k.clone(), *v);
        }
    }

    ScoreResponse { score: final_score, breakdown }
}

fn calc_stability(map: &HashMap<String, FileInfo>) -> (f64, f64, f64) {
    let core_types = vec!["AGENT", "CORE", "LOGIC", "UTIL", "UNKNOWN"];
    let relevant: Vec<_> = map.iter().filter(|(f, i)| 
        (core_types.contains(&i.component_type.as_str()) || i.complexity >= 1.0) &&
        !vec!["DOC", "TEST"].contains(&i.component_type.as_str()) &&
        !f.contains("/test/") && !f.contains("__init__.py")
    ).collect();

    let markers: Vec<_> = map.values().filter(|i| 
        vec!["PACKAGE_MARKER", "CONFIG"].contains(&i.component_type.as_str())
    ).collect();

    let total = (relevant.len() + markers.len()) as f64;
    let covered: f64 = relevant.iter().map(|(_, i)| {
        if i.has_test || i.advanced_metrics.as_ref().map_or(false, |m| m.quality_gate == "GREEN") { 1.0 }
        else if i.advanced_metrics.as_ref().map_or(false, |m| m.quality_gate == "YELLOW") { 0.5 }
        else { 0.0 }
    }).sum();

    let final_covered = (covered + markers.len() as f64).min(total);
    let score = (final_covered / total.max(1.0)) * 40.0;
    (score, final_covered, total)
}

fn calc_purity(map: &HashMap<String, FileInfo>, total: f64) -> (f64, f64) {
    let mut total_cc = 0.0;
    let mut count_adv = 0.0;
    for i in map.values() {
        if let Some(adv) = &i.advanced_metrics {
            total_cc += adv.cyclomatic_complexity;
            count_adv += 1.0;
        }
    }

    let avg = if count_adv > 0.0 {
        let avg_cc = total_cc / count_adv;
        let simple_avg = map.values().map(|i| i.complexity).sum::<f64>() / total;
        (avg_cc + simple_avg) / 2.0
    } else {
        map.values().map(|i| i.complexity).sum::<f64>() / total
    };

    let score = (20.0 - ((avg - 7.0).max(0.0) * 2.0)).max(0.0);
    (score, avg)
}

fn calc_observability(map: &HashMap<String, FileInfo>) -> (f64, f64, f64) {
    let excluded = vec!["TEST", "PACKAGE_MARKER", "CONFIG"];
    let relevant: Vec<_> = map.values().filter(|i| 
        !excluded.contains(&i.component_type.as_str()) || i.complexity > 1.0
    ).collect();

    let tel_count = relevant.iter().filter(|i| i.has_telemetry).count() as f64;
    let score = (tel_count / (relevant.len() as f64).max(1.0)) * 15.0;
    (score, tel_count, relevant.len() as f64)
}

fn calc_security(alerts: &[Alert]) -> (f64, f64) {
    let high = alerts.iter().filter(|a| vec!["critical", "high"].contains(&a.severity.as_str())).count() as f64;
    ( (15.0 - (high * 5.0)).max(0.0), high )
}

fn calc_excellence(map: &HashMap<String, FileInfo>, total: f64) -> (f64, f64) {
    let kdoc = map.values().filter(|i| 
        i.purpose != "UNKNOWN" || vec!["PACKAGE_MARKER", "CONFIG"].contains(&i.component_type.as_str())
    ).count() as f64;
    ((kdoc / total.max(1.0)) * 10.0, kdoc)
}

fn get_adjustments(map: &HashMap<String, FileInfo>, alerts: &[Alert], qa: &Option<QaData>, cog: &Option<CognitiveStatus>) -> HashMap<String, f64> {
    let mut adj = HashMap::new();
    
    // Quality adjustments from QA matrix if available
    let (cc_count, cog_count, nest_count, cbo_count, dit_count, mi_l_count, mi_c_count, def_count, red_count, shad_count, total_qa) = if let Some(q) = qa {
        let mut cc = 0.0; let mut cg = 0.0; let mut ns = 0.0; let mut cb = 0.0; let mut dt = 0.0;
        let mut ml = 0.0; let mut mc = 0.0; let mut df = 0.0; let mut rd = 0.0; let _sh = 0.0;
        for item in &q.matrix {
            let m = &item.advanced_metrics;
            if m.cyclomatic_complexity > 20.0 { cc += 1.0; }
            if m.cognitive_complexity > 15.0 { cg += 1.0; }
            if m.nesting_depth > 3.0 { ns += 1.0; }
            if m.cbo > 10.0 { cb += 1.0; }
            if m.dit > 5.0 { dt += 1.0; }
            if m.maintainability_index < 10.0 { ml += 1.0; }
            if m.maintainability_index < 5.0 { mc += 1.0; }
            if m.defect_density > 1.0 { df += 1.0; } // Assuming 1/KLOC
            if m.quality_gate == "RED" { rd += 1.0; }
            // Shadow compliance not fully implemented in this trait-based struct yet
        }
        (cc, cg, ns, cb, dt, ml, mc, df, rd, _sh, q.matrix.len() as f64)
    } else { (0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0) };

    let prop = |count: f64, cap: f64| ((count / total_qa.max(1.0)) * cap).min(cap);

    adj.insert("Quality (CC > 20 - High Risk)".to_string(), prop(cc_count, 5.0));
    adj.insert("Quality (Cognitive > 15)".to_string(), prop(cog_count, 4.0));
    adj.insert("Quality (Nesting > 3)".to_string(), prop(nest_count, 3.0));
    adj.insert("Quality (CBO > 10 - High Coupling)".to_string(), prop(cbo_count, 3.0));
    adj.insert("Quality (DIT > 5 - Deep Inheritance)".to_string(), prop(dit_count, 2.0));
    adj.insert("Quality (MI < 10 - Low Maint)".to_string(), prop(mi_l_count, 4.0));
    adj.insert("Quality (MI < 5 - Critical)".to_string(), prop(mi_c_count, 3.0));
    adj.insert("Quality (Defect Density > 1/KLOC)".to_string(), prop(def_count, 3.0));
    adj.insert("Quality (Gate RED)".to_string(), prop(red_count, 3.0));
    adj.insert("Quality (Shadow Non-Compliant)".to_string(), prop(shad_count, 3.0));

    let cog_penalty = match cog.as_ref().map(|c| c.status.as_str()) {
        Some("FAIL") => 5.0,
        Some("DEGRADED") => 2.0,
        _ => 0.0,
    };
    adj.insert("Cognitive (System Sanity)".to_string(), cog_penalty);

    adj.insert("Security (Vulnerabilities)".to_string(), alerts.iter().filter(|a| a.severity == "critical" || a.severity == "high").count() as f64 * 10.0);
    adj.insert("Excellence (Documentation)".to_string(), excellence_drain(map, total_qa));

    adj
}

fn excellence_drain(_map: &HashMap<String, FileInfo>, _total: f64) -> f64 {
    // Legacy mapping drain logic
    0.0 // Placeholder for specific documentation drain if needed
}

fn calc_quality_bonus(qa: &Option<QaData>) -> f64 {
    if let Some(q) = qa {
        q.matrix.iter().map(|item| {
            let m = &item.advanced_metrics;
            let mut b = if m.maintainability_index >= 50.0 { 1.0 } else if m.maintainability_index >= 20.0 { 0.5 } else { 0.0 };
            if m.quality_gate == "GREEN" { b += 0.3; }
            if m.cyclomatic_complexity <= 10.0 { b += 0.2; }
            // riskLevel LOW bonus would go here
            b
        }).sum()
    } else { 0.0 }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_calc_security() {
        let alerts = vec![
            Alert { severity: "critical".to_string() },
            Alert { severity: "high".to_string() },
            Alert { severity: "low".to_string() }
        ];
        let (score, count) = calc_security(&alerts);
        assert_eq!(count, 2.0); // critical and high
        assert_eq!(score, 5.0); // 15 - 10
    }

    #[test]
    fn test_calc_observability() {
        let mut map = HashMap::new();
        map.insert("f1".to_string(), FileInfo {
            component_type: "LOGIC".to_string(), complexity: 2.0, has_test: false, has_telemetry: true,
            purpose: "UNKNOWN".to_string(), advanced_metrics: None
        });
        map.insert("f2".to_string(), FileInfo {
            component_type: "LOGIC".to_string(), complexity: 2.0, has_test: false, has_telemetry: false,
            purpose: "UNKNOWN".to_string(), advanced_metrics: None
        });
        let (score, tel_count, total) = calc_observability(&map);
        assert_eq!(tel_count, 1.0);
        assert_eq!(total, 2.0);
        assert_eq!(score, 7.5); // (1/2) * 15
    }
}
