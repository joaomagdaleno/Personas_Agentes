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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_extract_stem() {
        assert_eq!(extract_stem("src/utils/helper.ts").unwrap(), "helper");
        assert_eq!(extract_stem("C:\\project\\main.rs").unwrap(), "main");
        assert_eq!(extract_stem("file_no_ext").unwrap(), "file_no_ext");
    }

    #[test]
    fn test_calculate_all_connectivity() {
        let mut files = HashMap::new();
        files.insert("file_a.ts".to_string(), FileInfo { dependencies: vec!["file_b.ts".to_string()] });
        files.insert("file_b.ts".to_string(), FileInfo { dependencies: vec![] });
        
        let results = calculate_all_connectivity(files);
        assert_eq!(results.len(), 2);
        
        let res_a = results.iter().find(|r| r.file == "file_a.ts").unwrap();
        assert_eq!(res_a.eferent, 1);
        assert_eq!(res_a.afferent, 0);
        
        let res_b = results.iter().find(|r| r.file == "file_b.ts").unwrap();
        assert_eq!(res_b.eferent, 0);
        assert_eq!(res_b.afferent, 1);
    }
}
