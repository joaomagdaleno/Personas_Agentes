use std::collections::HashMap;
use rayon::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
pub struct FileInfo {
    pub dependencies: Vec<String>,
}

#[derive(Serialize)]
pub struct ConnectivityResult {
    pub file: String,
    pub afferent: usize,   // Who depends on me
    pub eferent: usize,    // Who I depend on
    pub instability: f64,
}

fn extract_stem(path: &str) -> Option<String> {
    let clean = path.replace('\\', "/");
    let name = clean.split('/').last()?;
    let stem = name.split('.').next()?;
    Some(stem.to_string())
}

pub fn calculate_all_connectivity(
    files: HashMap<String, FileInfo>,
) -> Vec<ConnectivityResult> {
    // 1. Build Inverted Index (O(n))
    // Map: Stem -> Vec<Importing Files>
    let mut reverse_index: HashMap<String, Vec<String>> = HashMap::new();
    
    for (path, info) in &files {
        for dep in &info.dependencies {
            if let Some(stem) = extract_stem(dep) {
                reverse_index
                    .entry(stem)
                    .or_default()
                    .push(path.clone());
            }
        }
    }

    // 2. Parallel Metrics Calculation
    files.into_par_iter()
        .map(|(path, info)| {
            let stem = extract_stem(&path).unwrap_or_else(|| "".to_string());
            let eferent = info.dependencies.len();
            let afferent = reverse_index.get(&stem).map_or(0, |v| v.len());
            let total = afferent + eferent;
            
            ConnectivityResult {
                file: path,
                afferent,
                eferent,
                instability: if total > 0 { eferent as f64 / total as f64 } else { 0.0 },
            }
        })
        .collect()
}
