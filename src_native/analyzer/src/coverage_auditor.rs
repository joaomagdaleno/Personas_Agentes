use serde::{Deserialize, Serialize};
use std::path::Path;

#[derive(Debug, Serialize, Deserialize)]
pub struct CoverageRequest {
    pub file_path: String,
    pub component_type: String,
    pub all_files: Vec<String>,
    pub complexity: Option<f64>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CoverageResponse {
    pub has_test: bool,
}

pub fn detect_test(request: CoverageRequest) -> CoverageResponse {
    if is_exempt_from_testing(&request.component_type, request.complexity.unwrap_or(1.0)) {
        return CoverageResponse { has_test: true };
    }

    let file_name = Path::new(&request.file_path)
        .file_name()
        .and_then(|s| s.to_str())
        .unwrap_or("");
    
    let clean_stem = get_clean_stem(file_name);
    let normalized_stem = clean_stem.replace('_', "");

    for other_file in &request.all_files {
        if is_test_match(other_file, &normalized_stem, &request.component_type, file_name) {
            return CoverageResponse { has_test: true };
        }
    }

    CoverageResponse { has_test: false }
}

fn is_exempt_from_testing(comp_type: &str, complexity: f64) -> bool {
    let is_boilerplate = complexity <= 1.0;
    if comp_type == "DOC" || comp_type == "TEST" { return true; }
    vec!["CONFIG", "PACKAGE_MARKER", "UTIL"].contains(&comp_type) && is_boilerplate
}

fn get_clean_stem(file_name: &str) -> String {
    let raw_stem = file_name.split('.').next().unwrap_or("").to_lowercase();
    raw_stem
        .replace("_persona", "")
        .replace("_agent", "")
        .replace("_engine", "")
}

fn is_test_match(file_name: &str, normalized_stem: &str, comp_type: &str, original_name: &str) -> bool {
    let low_name = file_name.to_lowercase();
    let is_test_file = low_name.starts_with("test_") || low_name.ends_with(".test.ts") || low_name.ends_with(".spec.ts");

    if !is_test_file { return false; }

    let normalized_file = low_name.replace('_', "");
    if normalized_file.contains(normalized_stem) {
        return true;
    }

    // Agent specialized matching
    comp_type == "AGENT" && low_name.contains(normalized_stem)
}
