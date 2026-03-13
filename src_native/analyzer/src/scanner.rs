use std::fs;
use std::path::Path;
use serde::{Serialize, Deserialize};
use walkdir::WalkDir;
use rayon::prelude::*;
use regex::RegexSet;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct FileAnalysis {
    pub path: String,
    pub exists: bool,
    pub loc: usize,
    pub sloc: usize,
    pub comments: usize,
    pub intent: String,
}

pub fn analyze_file(path: &Path, root: &Path) -> Result<FileAnalysis, std::io::Error> {
    let rel_path = path.strip_prefix(root).unwrap_or(path);
    let rel_path_str = rel_path.to_string_lossy().replace("\\", "/");

    let content = fs::read_to_string(path)?;
    let lines: Vec<&str> = content.lines().collect();
    
    let mut analysis = FileAnalysis {
        path: rel_path_str,
        exists: true,
        loc: lines.len(),
        sloc: 0,
        comments: 0,
        intent: "LOGIC".to_string(),
    };

    for line in lines {
        let trimmed = line.trim();
        if trimmed.is_empty() {
            continue;
        }
        if trimmed.starts_with("//") || trimmed.starts_with("/*") || trimmed.starts_with("*") {
            analysis.comments += 1;
            continue;
        }
        analysis.sloc += 1;
    }

    // Intent detection
    let set = RegexSet::new(&[
        r"(?i)rules|patterns|regex|manifest|metadata|diretriz|heuristics",
        r"(?i)logger|log|console|telemetry|winston",
        r"(?i)\b(alpha|progress|offset|lerp|sin|cos|tan)\b",
        r"(?i)fs\.|path\.|join\(|existsSync|readdir|readFile",
    ]).unwrap();

    let matches: Vec<_> = set.matches(&content).into_iter().collect();
    if !matches.is_empty() {
        analysis.intent = match matches[0] {
            0 => "METADATA".to_string(),
            1 => "OBSERVABILITY".to_string(),
            2 => "TECH/MATH".to_string(),
            3 => "INFRASTRUCTURE".to_string(),
            _ => "LOGIC".to_string(),
        };
    }

    Ok(analysis)
}

pub fn scan_directory(dir: &Path, root: &Path) -> Vec<FileAnalysis> {
    let mut entries = Vec::new();
    
    let walker = WalkDir::new(dir).into_iter()
        .filter_entry(|e| {
            let name = e.file_name().to_string_lossy();
            name != "node_modules" && !name.starts_with(".") && name != "target"
        });

    for entry in walker.filter_map(|e| e.ok()) {
        if entry.file_type().is_file() {
            let ext = entry.path().extension().and_then(|s| s.to_str()).unwrap_or("");
            if matches!(ext, "ts" | "tsx" | "js" | "py" | "go" | "rs") {
                entries.push(entry.path().to_path_buf());
            }
        }
    }

    entries.into_par_iter()
        .map(|path| analyze_file(&path, root))
        .filter_map(|res| res.ok())
        .collect()
}


