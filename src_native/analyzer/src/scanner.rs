use std::fs;
use std::path::Path;
use serde::{Serialize, Deserialize};
use walkdir::WalkDir;
use rayon::prelude::*;

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
    let loc = content.lines().count();
    
    let ext = path.extension().and_then(|s| s.to_str()).unwrap_or("");
    
    let mut parser = tree_sitter::Parser::new();
    let language = match ext {
        "ts" | "tsx" | "js" | "jsx" => Some(tree_sitter_typescript::language_typescript()),
        "py" => Some(tree_sitter_python::language()),
        "go" => Some(tree_sitter_go::language()),
        "rs" => Some(tree_sitter_rust::language()),
        _ => None,
    };
    
    let (comments, sloc, intent) = if let Some(lang) = language {
        if parser.set_language(lang).is_ok() {
            if let Some(tree) = parser.parse(&content, None) {
                let mut comment_count = 0;
                let mut has_import = false;
                let mut has_function = false;
                let mut has_test = false;
                let mut has_config = false;
                let mut has_observability = false;
                
                walk_for_analysis(&mut tree.root_node().walk(), content.as_bytes(), 
                    &mut comment_count, &mut has_import, &mut has_function, 
                    &mut has_test, &mut has_config, &mut has_observability);
                
                let non_empty = content.lines().filter(|l| !l.trim().is_empty()).count();
                let sloc_val = non_empty.saturating_sub(comment_count);
                
                let intent_val = if has_test { "TEST" }
                    else if has_observability { "OBSERVABILITY" }
                    else if has_config { "CONFIGURATION" }
                    else if has_import && !has_function { "METADATA" }
                    else { "LOGIC" };
                
                (comment_count, sloc_val, intent_val.to_string())
            } else {
                fallback_analysis(&content)
            }
        } else {
            fallback_analysis(&content)
        }
    } else {
        fallback_analysis(&content)
    };
    
    Ok(FileAnalysis {
        path: rel_path_str,
        exists: true,
        loc,
        sloc,
        comments,
        size: metadata.len(),
        modified_at,
        intent,
    })
}

fn fallback_analysis(content: &str) -> (usize, usize, String) {
    let mut comments = 0;
    let mut sloc = 0;
    let mut in_multiline = false;
    for line in content.lines() {
        let trimmed = line.trim();
        if trimmed.is_empty() { continue; }
        if in_multiline {
            comments += 1;
            if trimmed.contains("*/") { in_multiline = false; }
            continue;
        }
        if trimmed.starts_with("/*") {
            comments += 1;
            if !trimmed.contains("*/") { in_multiline = true; }
            continue;
        }
        if trimmed.starts_with("//") || trimmed.starts_with("*") {
            comments += 1;
            continue;
        }
        sloc += 1;
    }
    (comments, sloc, "LOGIC".to_string())
}

fn walk_for_analysis(cursor: &mut tree_sitter::TreeCursor, source: &[u8],
    comments: &mut usize, has_import: &mut bool, has_function: &mut bool,
    has_test: &mut bool, has_config: &mut bool, has_observability: &mut bool)
{
    let node = cursor.node();
    let kind = node.kind();
    
    match kind {
        "comment" | "line_comment" | "block_comment" => {
            // Count unique lines spanned by the comment
            let start_row = node.start_position().row;
            let end_row = node.end_position().row;
            *comments += (end_row - start_row) + 1;
            
            if let Ok(text) = node.utf8_text(source) {
                let low = text.to_lowercase();
                if low.contains("test") || low.contains("spec") { *has_test = true; }
                if low.contains("config") || low.contains("setup") { *has_config = true; }
            }
        }
        "import_statement" | "import_declaration" | "use_declaration" | "export_statement" => {
            *has_import = true;
        }
        "function_declaration" | "function_item" | "method_definition" | "class_declaration" => {
            *has_function = true;
            if let Some(name_node) = node.child_by_field_name("name") {
                if let Ok(name) = name_node.utf8_text(source) {
                    let low = name.to_lowercase();
                    if low.contains("test") || low.starts_with("test_") || low.starts_with("it_") {
                        *has_test = true;
                    }
                }
            }
        }
        "call_expression" => {
            if let Some(func_node) = node.child_by_field_name("function") {
                if let Ok(func_text) = func_node.utf8_text(source) {
                    if func_text.contains("logger") || func_text.contains("console") || func_text.contains("telemetry") || func_text.contains("winston") {
                        *has_observability = true;
                    }
                    if func_text == "describe" || func_text == "it" || func_text == "test" || func_text == "expect" {
                        *has_test = true;
                    }
                }
            }
        }
        "decorator" => {
            if let Ok(text) = node.utf8_text(source) {
                if text.contains("Test") || text.contains("test") { *has_test = true; }
            }
        }
        _ => {}
    }
    
    if cursor.goto_first_child() {
        loop {
            walk_for_analysis(cursor, source, comments, has_import, has_function, has_test, has_config, has_observability);
            if !cursor.goto_next_sibling() { break; }
        }
        cursor.goto_parent();
    }
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


