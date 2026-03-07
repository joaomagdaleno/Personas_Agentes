mod fingerprint;
mod audit;
mod deduplicator;
mod connectivity;
mod penalty;
mod batch;
mod dna;
mod graph;
mod pruner;
mod search;
mod brain;
mod chat;

use std::env;
use std::fs;
use std::path::Path;
use std::collections::HashMap;
use tree_sitter::{Parser, Node};
use serde::Serialize;

#[derive(Serialize)]
struct FunctionMetric {
    name: String,
    score: i32,
    nesting: i32,
    line: usize,
}

#[derive(Serialize)]
struct AnalysisResult {
    path: String,
    total_complexity: i32,
    functions: Vec<FunctionMetric>,
    loc: usize,
    sloc: usize,
    comments: usize,
}

// Improved walk_ast to handle nested scores
fn collect_metrics(node: Node, depth: i32, score: &mut i32, max_nesting: &mut i32) {
    let kind = node.kind();
    let nestable = ["if_statement", "for_statement", "while_statement", "do_statement", "case_clause", "catch_clause", "switch_statement", "conditional_expression"];
    
    let mut current_depth = depth;
    if nestable.contains(&kind) {
        *score += 1 + depth;
        current_depth += 1;
        if current_depth > *max_nesting {
            *max_nesting = current_depth;
        }
    }

    let mut cursor = node.walk();
    if cursor.goto_first_child() {
        loop {
            collect_metrics(cursor.node(), current_depth, score, max_nesting);
            if !cursor.goto_next_sibling() { break; }
        }
    }
}

fn run_analyze(path: &str) {
    let source_code = fs::read_to_string(path).expect("Unable to read file");
    let source_bytes = source_code.as_bytes();
    
    let loc = source_code.lines().count();
    let mut sloc = 0;
    let mut comments = 0;

    for line in source_code.lines() {
        let trimmed = line.trim();
        if trimmed.is_empty() { continue; }
        if trimmed.starts_with("//") || trimmed.starts_with("/*") || trimmed.starts_with("*") {
            comments += 1;
        } else {
            sloc += 1;
        }
    }

    let mut parser = Parser::new();
    let extension = Path::new(path).extension().and_then(|s| s.to_str()).unwrap_or("");
    
    match extension {
        "py" => {
            let language = tree_sitter_python::language();
            parser.set_language(language).expect("Error loading Python grammar");
        }
        "go" => {
            let language = tree_sitter_go::language();
            parser.set_language(language).expect("Error loading Go grammar");
        }
        _ => {
            let language = tree_sitter_typescript::language_typescript();
            parser.set_language(language).expect("Error loading TypeScript grammar");
        }
    }

    let tree = parser.parse(&source_code, None).expect("Error parsing file");
    let root_node = tree.root_node();

    let mut functions = Vec::new();
    
    // Find all functions
    let mut cursor = root_node.walk();
    let mut stack = vec![root_node];
    while let Some(node) = stack.pop() {
        let kind = node.kind();
        if ["function_declaration", "method_definition", "arrow_function", "function"].contains(&kind) {
            let mut name = "anonymous".to_string();
            if let Some(n) = node.child_by_field_name("name") {
                name = n.utf8_text(source_bytes).unwrap_or("anonymous").to_string();
            } else if kind == "arrow_function" {
                // Look for variable name in parent
                if let Some(parent) = node.parent() {
                    if parent.kind() == "variable_declarator" {
                        if let Some(n) = parent.child_by_field_name("name") {
                            name = n.utf8_text(source_bytes).unwrap_or("anonymous").to_string();
                        }
                    }
                }
            }

            let mut score = 0;
            let mut nesting = 0;
            collect_metrics(node, 0, &mut score, &mut nesting);

            functions.push(FunctionMetric {
                name,
                score,
                nesting,
                line: node.start_position().row + 1,
            });
        }
        
        // Push children to stack
        let mut child_cursor = node.walk();
        if child_cursor.goto_first_child() {
            loop {
                stack.push(child_cursor.node());
                if !child_cursor.goto_next_sibling() { break; }
            }
        }
    }

    let total_complexity: i32 = functions.iter().map(|f| f.score).sum();

    let result = AnalysisResult {
        path: path.to_string(),
        total_complexity,
        functions,
        loc,
        sloc,
        comments,
    };

    println!("{}", serde_json::to_string_pretty(&result).unwrap());
}

fn run_fingerprint(agents_root: &str) {
    let root = Path::new(agents_root);
    if !root.exists() {
        eprintln!("Error: directory '{}' does not exist", agents_root);
        std::process::exit(1);
    }

    let report = fingerprint::extract_all(root);
    println!("{}", serde_json::to_string_pretty(&report).unwrap());
}

fn main() {
    let args: Vec<String> = env::args().collect();
    
    if args.len() < 2 {
        eprintln!("Usage:");
        eprintln!("  analyzer analyze <file_path>             — Complexity analysis");
        eprintln!("  analyzer fingerprint <agents_root>       — AST fingerprint extraction");
        eprintln!("  analyzer audit <json_path>               — Bulk audit via RegexSet");
        eprintln!("  analyzer deduplicate <json_path>         — O(n) finding deduplication");
        eprintln!("  analyzer connectivity <json_path>        — O(n) file coupling analysis");
        std::process::exit(1);
    }

    match args[1].as_str() {
        "analyze" => {
            if args.len() < 3 {
                eprintln!("Usage: analyzer analyze <file_path>");
                std::process::exit(1);
            }
            run_analyze(&args[2]);
        }
        "fingerprint" => {
            if args.len() < 3 {
                eprintln!("Usage: analyzer fingerprint <agents_root>");
                std::process::exit(1);
            }
            run_fingerprint(&args[2]);
        }
        "audit" => {
            if args.len() < 3 {
                eprintln!("Usage: analyzer audit <json_path>");
                std::process::exit(1);
            }
            let content = fs::read_to_string(&args[2]).expect("Unable to read JSON file");
            let request: audit::BulkAuditRequest = serde_json::from_str(&content).expect("Invalid audit request JSON");
            let findings = audit::bulk_audit(request);
            println!("{}", serde_json::to_string_pretty(&findings).unwrap());
        }
        "deduplicate" => {
            if args.len() < 3 {
                eprintln!("Usage: analyzer deduplicate <json_path>");
                std::process::exit(1);
            }
            let content = fs::read_to_string(&args[2]).expect("Unable to read JSON file");
            let findings: Vec<deduplicator::RawFinding> = serde_json::from_str(&content).expect("Invalid findings JSON");
            let deduped = deduplicator::deduplicate(findings);
            println!("{}", serde_json::to_string_pretty(&deduped).unwrap());
        }
        "connectivity" => {
            if args.len() < 3 {
                eprintln!("Usage: analyzer connectivity <json_path>");
                std::process::exit(1);
            }
            let content = fs::read_to_string(&args[2]).expect("Unable to read JSON file");
            let files: HashMap<String, connectivity::FileInfo> = serde_json::from_str(&content).expect("Invalid connectivity JSON");
            let results = connectivity::calculate_all_connectivity(files);
            println!("{}", serde_json::to_string_pretty(&results).unwrap());
        }
        "penalty" => {
            if args.len() < 3 {
                eprintln!("Usage: analyzer penalty <json_path>");
                std::process::exit(1);
            }
            let content = fs::read_to_string(&args[2]).expect("Unable to read JSON file");
            let request: penalty::PenaltyRequest = serde_json::from_str(&content).expect("Invalid penalty request JSON");
            let response = penalty::calculate_penalty(request);
            println!("{}", serde_json::to_string_pretty(&response).unwrap());
        }
        "batch" => {
            if args.len() < 3 {
                eprintln!("Usage: analyzer batch <json_path>");
                std::process::exit(1);
            }
            #[derive(serde::Deserialize)]
            struct BatchRequest {
                file_paths: Vec<String>,
                project_root: String,
            }
            let content = fs::read_to_string(&args[2]).expect("Unable to read JSON file");
            let request: BatchRequest = serde_json::from_str(&content).expect("Invalid batch request JSON");
            let results = batch::process_batch(request.file_paths, &request.project_root);
            println!("{}", serde_json::to_string_pretty(&results).unwrap());
        }
        "dna" => {
            if args.len() < 3 {
                eprintln!("Usage: analyzer dna <project_root>");
                std::process::exit(1);
            }
            let identity = dna::discover_identity(&args[2]);
            println!("{}", serde_json::to_string_pretty(&identity).unwrap());
        }
        "graph" => {
            if args.len() < 3 {
                eprintln!("Usage: analyzer graph <json_path>");
                std::process::exit(1);
            }
            let content = fs::read_to_string(&args[2]).expect("Unable to read JSON file");
            let request: graph::GraphRequest = serde_json::from_str(&content).expect("Invalid graph request JSON");
            let result = graph::analyze_graph(request);
            println!("{}", serde_json::to_string_pretty(&result).unwrap());
        }
        "prune" => {
            if args.len() < 3 {
                eprintln!("Usage: analyzer prune <json_path>");
                std::process::exit(1);
            }
            let content = fs::read_to_string(&args[2]).expect("Unable to read JSON file");
            let request: pruner::PruneRequest = serde_json::from_str(&content).expect("Invalid prune request JSON");
            let result = pruner::prune_context(request);
            println!("{}", serde_json::to_string_pretty(&result).unwrap());
        }
        "search" => {
            if args.len() < 3 {
                eprintln!("Usage: analyzer search <query> [path]");
                std::process::exit(1);
            }
            let query = args[2].clone();
            let path = if args.len() > 3 { &args[3] } else { "." };
            
            // Auto-load files from directory if it's a directory
            let mut files = HashMap::new();
            if std::path::Path::new(path).is_dir() {
                let mut count = 0;
                for entry in walkdir::WalkDir::new(path)
                    .into_iter()
                    .filter_map(|e| e.ok())
                    .filter(|e| e.file_type().is_file()) {
                    if let Ok(c) = fs::read_to_string(entry.path()) {
                        files.insert(entry.path().to_string_lossy().to_string(), c);
                        count += 1;
                        if count % 100 == 0 { eprintln!("📂 Lendo arquivos: {}...", count); }
                    }
                }
                eprintln!("✅ {} arquivos carregados para busca.", count);
            }
            
            let request = search::SearchRequest { query, files };
            let results = search::semantic_search(request);
            println!("{}", serde_json::to_string_pretty(&results).unwrap());
        }
        "reason" => {
            if args.len() < 3 {
                eprintln!("Usage: analyzer reason <prompt_or_path> [max_tokens]");
                std::process::exit(1);
            }
            let prompt = if std::path::Path::new(&args[2]).is_file() {
                fs::read_to_string(&args[2]).expect("Unable to read prompt file")
            } else {
                args[2].clone()
            };
            
            let max_tokens = if args.len() > 3 {
                args[3].parse::<usize>().unwrap_or(512)
            } else { 512 };

            if let Some(mut brain) = brain::Brain::new() {
                if let Some(answer) = brain.reason(&prompt, max_tokens) {
                    println!("{}", answer);
                } else {
                    eprintln!("Error: Brain was unable to reason.");
                }
            } else {
                eprintln!("Error: Brain was unable to initialize (check model files).");
            }
        }
        "context" => {
            if args.len() < 3 {
                eprintln!("Usage: analyzer context <file_path>");
                std::process::exit(1);
            }
            if let Some(brain) = brain::Brain::new() {
                let ctx = brain.get_context_for(&args[2]);
                println!("{}", serde_json::to_string_pretty(&ctx).unwrap());
            } else {
                eprintln!("Error: Brain was unable to initialize.");
                std::process::exit(1);
            }
        }
        "inspect-tensors" => {
            let mut path = std::path::PathBuf::from(".gemini/models/qwen2.5-coder-0.5b/model.safetensors");
            if !path.exists() {
                path = std::path::PathBuf::from("../../.gemini/models/qwen2.5-coder-0.5b/model.safetensors");
            }
            let file = fs::File::open(path).expect("Unable to open safetensors");
            let mmap = unsafe { memmap2::Mmap::map(&file).expect("Mmap failed") };
            let tensors = safetensors::SafeTensors::deserialize(&mmap).expect("Deserialize failed");
            for name in tensors.names() {
                println!("{}", name);
            }
        }
        "chat" => {
            chat::start_chat();
        }
        // Legacy
        other => {
            run_analyze(other);
        }
    }
}
