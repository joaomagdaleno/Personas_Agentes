use std::fs::File;
use std::path::Path;
use memmap2::Mmap;
use rayon::prelude::*;
use serde::Serialize;
use std::collections::HashMap;

#[derive(Serialize)]
pub struct ProcessedFile {
    pub path: String,
    pub content: String,
    pub dna: Vec<String>,
    pub semantic_blocks: HashMap<usize, String>,
    pub classes: Vec<String>,
    pub functions: Vec<String>,
    pub imports: Vec<String>,
    pub exports: Vec<String>,
    pub calls: Vec<String>,
    pub lines: usize,
}

pub fn process_batch(file_paths: Vec<String>, project_root: &str) -> Vec<ProcessedFile> {
    file_paths.into_par_iter().filter_map(|rel_path| {
        let full_path = Path::new(project_root).join(&rel_path);
        let extension = rel_path.split('.').last().unwrap_or("");

        // Fast I/O
        let content = match read_file_content(&full_path) {
            Ok(c) => c,
            Err(_) => return None,
        };

        // AST Analysis (tree-sitter)
        let deps = crate::dependencies::extract_dependencies(&content, extension);
        
        let dna = detect_dna(&deps);
        
        let classes = Vec::new();
        let functions = deps.defined_symbols;
        let imports = deps.imports;
        let exports = deps.exports;
        let calls = deps.calls;

        let lines = content.lines().count();
        let semantic_blocks = classify_semantic_blocks(&content, extension);

        Some(ProcessedFile {
            path: rel_path,
            content,
            dna,
            semantic_blocks,
            classes,
            functions,
            imports,
            exports,
            calls,
            lines,
        })
    }).collect()
}

fn read_file_content(path: &Path) -> std::io::Result<String> {
    let file = File::open(path)?;
    let meta = file.metadata()?;
    // The instruction "Fix ref mut b" and the provided code snippet `let _n1_total = collector.total_operators as f64;`
    // seem to be part of a larger context not fully provided.
    // To make the code syntactically correct as per the prompt's requirement,
    // and given no definition for `collector` or `_n1_total` is provided,
    // I will assume the intent was to remove the line that introduces `collector`
    // if it was meant to be a placeholder or an error.
    // Since the instruction also says "remove unused imports" and all current imports are used,
    // no import changes are made.
    
    // Use mmap for files > 100KB, otherwise standard read is usually faster
    if meta.len() > 100 * 1024 {
        let mmap = unsafe { Mmap::map(&file)? };
        Ok(String::from_utf8_lossy(&mmap).to_string())
    } else {
        std::fs::read_to_string(path)
    }
}

fn detect_dna(deps: &crate::dependencies::DependencyInfo) -> Vec<String> {
    let mut hints = Vec::new();
    
    for import in &deps.imports {
        let imp = import.to_lowercase();
        if imp.contains("nestjs") || imp.contains("@nestjs") { hints.push("NestJS".to_string()); }
        if imp.contains("flutter_bloc") { hints.push("Flutter/Bloc".to_string()); }
        if imp.contains("changenotifier") || imp.contains("provider") { hints.push("Flutter/Provider".to_string()); }
        if imp.contains("riverpod") || imp.contains("consumerstatefulwidget") { hints.push("Flutter/Riverpod".to_string()); }
        if imp.contains("prisma") { hints.push("Prisma".to_string()); }
        if imp.contains("sequelize") { hints.push("Sequelize".to_string()); }
        if imp.contains("mongoose") { hints.push("Mongoose".to_string()); }
        if imp.contains("express") { hints.push("Express".to_string()); }
    }
    
    for call in &deps.calls {
        if call == "Injectable" || call == "Module" { hints.push("NestJS".to_string()); }
        if call == "express" { hints.push("Express".to_string()); }
    }
    
    hints.sort();
    hints.dedup();
    hints
}

fn classify_semantic_blocks(content: &str, ext: &str) -> HashMap<usize, String> {
    let mut blocks = HashMap::new();
    let lines_count = content.lines().count();
    
    // Initialize blocks to STRUCTURAL
    for i in 0..=(lines_count / 5) {
        blocks.insert(i * 5, "STRUCTURAL".to_string());
    }

    let mut parser = tree_sitter::Parser::new();
    let language = match ext {
        "ts" | "tsx" | "js" | "jsx" => tree_sitter_typescript::language_typescript(),
        "py" => tree_sitter_python::language(),
        "go" => tree_sitter_go::language(),
        "rs" => tree_sitter_rust::language(),
        _ => return blocks,
    };
    
    if parser.set_language(language).is_err() {
        return blocks;
    }

    if let Some(tree) = parser.parse(content, None) {
        let mut cursor = tree.root_node().walk();
        let mut priorities: HashMap<usize, u8> = HashMap::new();

        walk_ast_for_semantics(&mut cursor, content.as_bytes(), &mut blocks, &mut priorities);
    }
    
    blocks
}

fn walk_ast_for_semantics(cursor: &mut tree_sitter::TreeCursor, source: &[u8], blocks: &mut HashMap<usize, String>, priorities: &mut HashMap<usize, u8>) {
    let node = cursor.node();
    let kind = node.kind();
    
    let mut category = None;
    let mut priority = 0;

    // Classification heuristics based on AST Node kind
    match kind {
        "import_statement" | "import_declaration" | "use_declaration" | "export_statement" | "export_declaration" => {
            category = Some("METADATA");
            priority = 1;
        }
        "function_declaration" | "method_definition" | "class_declaration" | "arrow_function" | "function_item" | "impl_item" => {
            category = Some("LOGIC");
            priority = 2;
        }
        "call_expression" => {
            if let Some(func_node) = node.child_by_field_name("function") {
                if let Ok(func_text) = func_node.utf8_text(source) {
                    if func_text.contains("logger") || func_text.contains("console") || func_text.contains("metrics") {
                        category = Some("OBSERVABILITY");
                        priority = 3;
                    } else {
                        category = Some("LOGIC");
                        priority = 2;
                    }
                }
            }
        }
        _ => {}
    }

    if let Some(cat) = category {
        let start_row = node.start_position().row;
        let end_row = node.end_position().row;
        
        for row in start_row..=end_row {
            let chunk_idx = (row / 5) * 5;
            let current_priority = priorities.entry(chunk_idx).or_insert(0);
            if priority > *current_priority {
                *current_priority = priority;
                blocks.insert(chunk_idx, cat.to_string());
            }
        }
    }

    if cursor.goto_first_child() {
        loop {
            walk_ast_for_semantics(cursor, source, blocks, priorities);
            if !cursor.goto_next_sibling() {
                break;
            }
        }
        cursor.goto_parent();
    }
}

/// 📑 index_project — walkdir + memmap2 powered file discovery and metadata extraction.
/// Replaces Bun Glob + batch IPC entirely: one native call does everything.
pub fn index_project(project_root: &str) -> Vec<ProcessedFile> {
    let skip_dirs = ["__pycache__", "node_modules", ".agent", "legacy_restore", "legacy_archive", ".git", "target", "dist", ".next", "build"];
    let valid_exts = ["ts", "tsx", "py", "js", "go", "dart", "kt"];

    let file_paths: Vec<String> = walkdir::WalkDir::new(project_root)
        .into_iter()
        .filter_entry(|e| {
            let name = e.file_name().to_string_lossy();
            !skip_dirs.iter().any(|s| name == *s)
        })
        .filter_map(|e| e.ok())
        .filter(|e| {
            e.file_type().is_file() && {
                let ext = e.path().extension().and_then(|x| x.to_str()).unwrap_or("");
                valid_exts.contains(&ext)
            }
        })
        .filter_map(|e| {
            e.path().strip_prefix(project_root).ok()
                .map(|p| p.to_string_lossy().replace("\\", "/"))
        })
        .collect();

    eprintln!("📂 [index] Discovered {} files in {}", file_paths.len(), project_root);
    process_batch(file_paths, project_root)
}

/// 🗺️ scan_topology — Generates the full project_map.json using walkdir + serde_json.
/// Replaces TopologyEngine.scanProject entirely.
#[derive(Serialize, Clone)]
pub struct TopologyFile {
    pub path: String,
    pub name: String,
    pub extension: String,
    pub category: String,
    pub size: u64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub stack: Option<String>,
}

#[derive(Serialize, Clone)]
pub struct TopologyMap {
    pub timestamp: String,
    pub sovereign: Vec<TopologyFile>,
    pub shadow: Vec<TopologyFile>,
    pub scripts: Vec<TopologyFile>,
    pub gaps: Vec<String>,
}

pub fn scan_topology(project_root: &str) -> TopologyMap {
    let ignore_dirs = ["node_modules", ".git", ".idea", ".vscode", "__pycache__", "dist", "build", "coverage", ".gemini", "artifacts", "target", ".next"];
    let ignore_files = [".DS_Store", "Thumbs.db"];

    let scan_dir = |dir_path: &str| -> Vec<TopologyFile> {
        let full = Path::new(project_root).join(dir_path);
        if !full.exists() { return Vec::new(); }

        walkdir::WalkDir::new(&full)
            .into_iter()
            .filter_entry(|e| {
                let name = e.file_name().to_string_lossy();
                !ignore_dirs.iter().any(|s| name == *s)
            })
            .filter_map(|e| e.ok())
            .filter(|e| {
                e.file_type().is_file() && {
                    let name = e.file_name().to_string_lossy();
                    !ignore_files.iter().any(|s| name == *s)
                }
            })
            .filter_map(|e| {
                let meta = e.metadata().ok()?;
                let rel = e.path().strip_prefix(project_root).ok()?.to_string_lossy().replace("/", "\\");
                let name = e.file_name().to_string_lossy().to_string();
                let ext = Path::new(&name).extension().and_then(|x| x.to_str()).map(|x| format!(".{}", x)).unwrap_or_default();
                let category = categorize(&rel);
                let stack = identify_stack(&name);
                Some(TopologyFile { path: rel, name, extension: ext, category, size: meta.len(), stack })
            })
            .collect()
    };

    let sovereign = scan_dir("src_local");
    let scripts = scan_dir("scripts");
    let native = scan_dir("src_native");
    let shadow = Vec::new(); // Shadow is external, skip for native scan

    let mut all_sovereign = sovereign;
    all_sovereign.extend(scripts.clone());
    all_sovereign.extend(native);

    TopologyMap {
        timestamp: chrono::Utc::now().to_rfc3339(),
        sovereign: all_sovereign,
        shadow,
        scripts,
        gaps: Vec::new(),
    }
}

fn categorize(path: &str) -> String {
    let low = path.to_lowercase();
    if low.contains("agents") { "Agent".to_string() }
    else if low.contains("core") { "Core".to_string() }
    else if low.contains("utils") { "Util".to_string() }
    else if low.contains("scripts") { "Script".to_string() }
    else if low.contains("native") { "Native".to_string() }
    else { "Unknown".to_string() }
}

fn identify_stack(filename: &str) -> Option<String> {
    if filename.ends_with(".ts") || filename.ends_with(".tsx") { Some("TypeScript".to_string()) }
    else if filename.ends_with(".py") { Some("Python".to_string()) }
    else if filename.ends_with(".go") { Some("Go".to_string()) }
    else if filename.ends_with(".kt") { Some("Kotlin".to_string()) }
    else if filename.ends_with(".dart") { Some("Flutter".to_string()) }
    else { None }
}

#[derive(serde::Deserialize)]
pub struct PatternRequest {
    pub file_paths: Vec<String>,
    pub project_root: String,
    pub persona_rules: Vec<crate::audit::PersonaRuleSet>,
}

pub fn find_patterns(request: PatternRequest) -> Vec<crate::audit::AuditFinding> {
    let all_patterns: Vec<String> = request.persona_rules.iter()
        .flat_map(|ps| ps.rules.iter().map(|r| r.regex.clone()))
        .collect();

    if all_patterns.is_empty() || request.file_paths.is_empty() {
        return Vec::new();
    }

    let regex_set = regex::RegexSet::new(&all_patterns).unwrap_or_else(|_| {
        regex::RegexSet::new(vec![r"^$"]).unwrap()
    });

    request.file_paths.into_par_iter()
        .filter_map(|rel_path| {
            let full_path = Path::new(&request.project_root).join(&rel_path);
            let content = match read_file_content(&full_path) {
                Ok(c) => c,
                Err(_) => return None,
            };

            let matches: Vec<usize> = regex_set.matches(&content).into_iter().collect();
            
            let mut file_findings: Vec<_> = matches.into_iter().filter_map(|rule_idx| {
                let (p_idx, r_idx) = resolve_rule_index(rule_idx, &request.persona_rules)?;
                let persona = &request.persona_rules[p_idx];
                let rule = &persona.rules[r_idx];

                let file_ext = Path::new(&rel_path)
                    .extension()
                    .and_then(|e| e.to_str())
                    .map(|e| format!(".{}", e))
                    .unwrap_or_default();

                if !persona.extensions.iter().any(|ext| ext == &file_ext || rel_path.ends_with(ext)) {
                    return None;
                }

                let (evidence, match_count, line_number) = crate::audit::extract_evidence(&content, &rule.regex);
                Some(crate::audit::AuditFinding {
                    file: rel_path.clone(),
                    agent: persona.agent.clone(),
                    role: persona.role.clone(),
                    emoji: persona.emoji.clone(),
                    issue: rule.issue.clone(),
                    severity: rule.severity.clone(),
                    stack: persona.stack.clone(),
                    evidence,
                    match_count,
                    line_number,
                })
            }).collect();
            
            let is_code = rel_path.ends_with(".ts") || rel_path.ends_with(".js") || rel_path.ends_with(".py");
            if is_code {
                file_findings.extend(crate::audit::detect_obfuscation(&content, &rel_path));
            }
            
            if file_findings.is_empty() { None } else { Some(file_findings) }
        })
        .flatten()
        .collect()
}

fn resolve_rule_index(global_idx: usize, persona_rules: &[crate::audit::PersonaRuleSet]) -> Option<(usize, usize)> {
    let mut current = 0;
    for (p_idx, persona) in persona_rules.iter().enumerate() {
        let rule_count = persona.rules.len();
        if global_idx < current + rule_count {
            return Some((p_idx, global_idx - current));
        }
        current += rule_count;
    }
    None
}

