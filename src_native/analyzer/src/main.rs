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

use std::env;
use std::fs;
use std::path::Path;
use std::collections::HashMap;
use tree_sitter::{Parser, Node};
use serde::Serialize;

#[derive(Serialize)]
struct AnalysisResult {
    path: String,
    complexity: i32,
    cognitive_complexity: i32,
    loc: usize,
    sloc: usize,
    comments: usize,
}

fn walk_ast(node: Node, depth: i32, results: &mut AnalysisResult) {
    let kind = node.kind();
    
    // Simple Cyclomatic Complexity increment
    if ["if_statement", "for_statement", "while_statement", "case_clause"].contains(&kind) {
        results.complexity += 1;
        results.cognitive_complexity += 1 + depth;
    }

    let mut cursor = node.walk();
    if cursor.goto_first_child() {
        loop {
            let child = cursor.node();
            let mut next_depth = depth;
            if ["if_statement", "for_statement", "while_statement"].contains(&kind) {
                next_depth += 1;
            }
            walk_ast(child, next_depth, results);
            if !cursor.goto_next_sibling() {
                break;
            }
        }
    }
}

fn run_analyze(path: &str) {
    let source_code = fs::read_to_string(path).expect("Unable to read file");
    
    let loc = source_code.lines().count();
    let mut sloc = 0;
    let mut comments = 0;

    for line in source_code.lines() {
        let trimmed = line.trim();
        if trimmed.is_empty() {
            continue;
        }
        if trimmed.starts_with("//") || trimmed.starts_with("/*") || trimmed.starts_with("*") {
            comments += 1;
        } else {
            sloc += 1;
        }
    }

    let mut parser = Parser::new();
    let language = tree_sitter_typescript::language_typescript();
    parser.set_language(language).expect("Error loading TypeScript grammar");

    let tree = parser.parse(&source_code, None).expect("Error parsing file");
    let root_node = tree.root_node();

    let mut result = AnalysisResult {
        path: path.to_string(),
        complexity: 1,
        cognitive_complexity: 1,
        loc,
        sloc,
        comments,
    };

    walk_ast(root_node, 0, &mut result);

    println!("{}", serde_json::to_string(&result).unwrap());
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
                eprintln!("Usage: analyzer search <json_path>");
                std::process::exit(1);
            }
            let content = fs::read_to_string(&args[2]).expect("Unable to read JSON file");
            let request: search::SearchRequest = serde_json::from_str(&content).expect("Invalid search request JSON");
            let results = search::semantic_search(request);
            println!("{}", serde_json::to_string_pretty(&results).unwrap());
        }
        // Legacy
        other => {
            run_analyze(other);
        }
    }
}
