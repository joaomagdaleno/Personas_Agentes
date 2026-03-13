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
    pub size: u64,
    pub modified_at: u64,
    pub intent: String,
}

pub fn analyze_file(path: &Path, root: &Path) -> Result<FileAnalysis, std::io::Error> {
    let rel_path = path.strip_prefix(root).unwrap_or(path);
    let rel_path_str = rel_path.to_string_lossy().replace("\\", "/");

    let metadata = fs::metadata(path)?;
    let modified_at = metadata.modified().ok()
        .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
        .map(|d| d.as_secs())
        .unwrap_or(0);
    let content = fs::read_to_string(path)?;
    let lines: Vec<&str> = content.lines().collect();
    
    let mut analysis = FileAnalysis {
        path: rel_path_str,
        exists: true,
        loc: lines.len(),
        sloc: 0,
        comments: 0,
        size: metadata.len(),
        modified_at,
        intent: "LOGIC".to_string(),
    };

    let mut in_multiline_comment = false;

    for line in lines {
        let trimmed = line.trim();
        if trimmed.is_empty() {
            continue;
        }

        if in_multiline_comment {
            analysis.comments += 1;
            if trimmed.contains("*/") {
                in_multiline_comment = false;
            }
            continue;
        }

        if trimmed.starts_with("/*") {
            analysis.comments += 1;
            if !trimmed.contains("*/") {
                in_multiline_comment = true;
            }
            continue;
        }

        if trimmed.starts_with("//") || trimmed.starts_with("*") {
            analysis.comments += 1;
            continue;
        }
        
        analysis.sloc += 1;
    }

    // Expanded Intent detection
    let intents = [
        ("METADATA", r"(?i)rules|patterns|regex|manifest|metadata|diretriz|heuristics"),
        ("OBSERVABILITY", r"(?i)logger|log|console|telemetry|winston"),
        ("TECH/MATH", r"(?i)\b(alpha|progress|offset|lerp|sin|cos|tan)\b"),
        ("INFRASTRUCTURE", r"(?i)fs\.|path\.|join\(|existsSync|readdir|readFile"),
        ("TEST", r"(?i)test|spec|mock|suite"),
        ("STYLE", r"(?i)css|scss|less|style|theme"),
        ("CONFIGURATION", r"(?i)config|env|setup|\.json|\.toml|\.yaml"),
        ("DOCUMENTATION", r"(?i)readme|docs|license"),
    ];

    let patterns: Vec<&str> = intents.iter().map(|(_, p)| *p).collect();
    let set = RegexSet::new(&patterns).unwrap();

    let matches: Vec<_> = set.matches(&content).into_iter().collect();
    if !matches.is_empty() {
        // Find the first match priority
        analysis.intent = intents[matches[0]].0.to_string();
    }

    Ok(analysis)
}

pub fn scan_directory(dir: &Path, root: &Path) -> Vec<FileAnalysis> {
    let mut paths = Vec::new();
    
    let walker = WalkDir::new(dir).into_iter()
        .filter_entry(|e| {
            let name = e.file_name().to_string_lossy();
            if name == "." { return true; }
            name != "node_modules" && !name.starts_with(".") && name != "target"
        });

    for entry in walker.filter_map(|e| e.ok()) {
        if entry.file_type().is_file() {
            let ext = entry.path().extension().and_then(|s| s.to_str()).unwrap_or("");
            if matches!(ext, "ts" | "tsx" | "js" | "py" | "go" | "rs") {
                paths.push(entry.path().to_path_buf());
            }
        }
    }

    let total = paths.len();
    let counter = std::sync::atomic::AtomicUsize::new(0);

    let results = paths.into_par_iter()
        .map(|path| {
            let res = analyze_file(&path, root);
            let done = counter.fetch_add(1, std::sync::atomic::Ordering::SeqCst) + 1;
            if done % 100 == 0 || done == total {
                eprint!("\r📂 Escaneando arquivos: {}/{}", done, total);
            }
            res
        })
        .filter_map(|res| res.ok())
        .collect::<Vec<_>>();
    
    eprintln!("\n✅ Escaneamento concluído.");
    results
}


