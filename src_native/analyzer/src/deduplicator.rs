use std::collections::HashMap;
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize, Clone)]
pub struct RawFinding {
    pub file: String,
    pub agent: String,
    pub role: String,
    pub emoji: String,
    pub issue: String,
    pub severity: String,
    pub stack: String,
    pub evidence: String,
    pub line: Option<usize>,
}

#[inline]
fn severity_weight(s: &str) -> u8 {
    match s.to_uppercase().as_str() {
        "CRITICAL" => 5,
        "HIGH" => 4,
        "MEDIUM" => 3,
        "LOW" => 2,
        "STRATEGIC" => 1,
        "HEALED" => 0,
        _ => 3,
    }
}

#[inline]
fn generate_coordinate(f: &RawFinding) -> String {
    let clean_file = f.file.replace('\\', "/");
    // Complexity findings are usually per-file
    if f.issue.to_lowercase().contains("complexity") || f.issue.to_lowercase().contains("complexidade") {
        return format!("COMPLEXITY:{}", clean_file);
    }
    // Generic coordinate: file + line + issue
    format!("{}:{}:{}", clean_file, f.line.unwrap_or(0), f.issue)
}

pub fn deduplicate(findings: Vec<RawFinding>) -> Vec<RawFinding> {
    let mut map: HashMap<String, RawFinding> = HashMap::with_capacity(findings.len());

    for finding in findings {
        let coord = generate_coordinate(&finding);
        
        if let Some(existing) = map.get_mut(&coord) {
            // Keep the one with higher severity
            if severity_weight(&finding.severity) > severity_weight(&existing.severity) {
                *existing = finding;
            }
        } else {
            map.insert(coord, finding);
        }
    }

    map.into_values().collect()
}
