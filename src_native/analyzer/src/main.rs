mod analysis;
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
mod dependencies;
mod score_calculator;
mod coverage_auditor;
mod cache;
mod server;
mod wasm_bridge;
mod scanner;

use std::env;
use std::fs;
use std::io::Read;
use std::path::Path;
use std::collections::HashMap;
use tree_sitter::{Parser, Node};
use serde::{Serialize, Deserialize};

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct HealingPlan {
    issue_description: String,
    file_path: String,
    file_content: String,
    context: String,
}

use analysis::{AnalysisResult, FunctionMetric};

// Metrics collection moved to analysis.rs

fn run_analyze(path: &str) {
    let source_code = fs::read_to_string(path).expect("Unable to read file");
    let result = analysis::run_analyze_core(path, source_code);
    println!("{}", serde_json::to_string_pretty(&result).unwrap());
}

fn run_fingerprint_core(path_str: &str, source: String) {
    let report = analysis::run_fingerprint_core(path_str, source);
    println!("{}", serde_json::to_string_pretty(&report).unwrap());
}

fn run_fingerprint(target_path: &str) {
    let path = Path::new(target_path);
    if !path.exists() {
        eprintln!("Error: path '{}' does not exist", target_path);
        std::process::exit(1);
    }

    if path.is_dir() {
        let report = fingerprint::extract_all(path);
        println!("{}", serde_json::to_string_pretty(&report).unwrap());
    } else {
        // Single file mode
        let source = fs::read_to_string(path).expect("Unable to read file");
        run_fingerprint_core(target_path, source);
    }
}

#[tokio::main]
async fn main() {
    let args: Vec<String> = env::args().collect();
    
    if args.len() < 2 {
        eprintln!("Usage:");
        eprintln!("  analyzer analyze <file_path>             — Complexity analysis");
        eprintln!("  analyzer fingerprint <agents_root>       — AST fingerprint extraction");
        eprintln!("  analyzer audit <json_path>               — Bulk audit via RegexSet");
        eprintln!("  analyzer deduplicate <json_path>         — O(n) finding deduplication");
        eprintln!("  analyzer connectivity <json_path>        — O(n) file coupling analysis");
        eprintln!("  analyzer deps <file_path>                — AST dependency extraction");
        eprintln!("  analyzer graph-get <json_or_focus> [depth] — Knowledge Graph retrieval");
        eprintln!("  analyzer graph-query <query>             — Knowledge Graph semantic query");
        eprintln!("  analyzer heal <plan_json_path_or_—>     — Native AI Auto-Healing");
        eprintln!("  analyzer serve [port]                    — Start gRPC sidecar server (default: 50052)");
        eprintln!("  analyzer scan <dir> [--root <root>]      — Ultra-fast project scanner");
        std::process::exit(1);
    }

    match args[1].as_str() {
        "serve" => {
            let port = if args.len() >= 3 {
                args[2].parse::<u16>().unwrap_or(50052)
            } else {
                50052
            };
            println!("🚀 analyzer gRPC sidecar starting on 127.0.0.1:{}", port);
            let addr = format!("127.0.0.1:{}", port).parse().unwrap();
            let svc = server::hub_proto::hub_service_server::HubServiceServer::new(server::HubServerImpl);
            
            tonic::transport::Server::builder()
                .add_service(svc)
                .serve(addr)
                .await
                .expect("Failed to start gRPC server");
        }
        "analyze" => {
            if args.len() < 3 {
                eprintln!("Usage: analyzer analyze <file_path>");
                std::process::exit(1);
            }
            if args[2] == "-" && args.len() >= 4 {
                let mut buffer = String::new();
                std::io::stdin().read_to_string(&mut buffer).expect("Unable to read stdin");
                let result = analysis::run_analyze_core(&args[3], buffer);
                println!("{}", serde_json::to_string_pretty(&result).unwrap());
            } else {
                run_analyze(&args[2]);
            }
        }
        "fingerprint" => {
            if args.len() < 3 {
                eprintln!("Usage: analyzer fingerprint <agents_root>");
                std::process::exit(1);
            }
            if args[2] == "-" && args.len() >= 4 {
                let mut buffer = String::new();
                std::io::stdin().read_to_string(&mut buffer).expect("Unable to read stdin");
                run_fingerprint_core(&args[3], buffer);
            } else {
                run_fingerprint(&args[2]);
            }
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
        "index" => {
            if args.len() < 3 {
                eprintln!("Usage: analyzer index <project_root>");
                std::process::exit(1);
            }
            let results = batch::index_project(&args[2]);
            println!("{}", serde_json::to_string_pretty(&results).unwrap());
        }
        "topology" => {
            if args.len() < 3 {
                eprintln!("Usage: analyzer topology <project_root>");
                std::process::exit(1);
            }
            let map = batch::scan_topology(&args[2]);
            println!("{}", serde_json::to_string_pretty(&map).unwrap());
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
        "patterns" => {
            if args.len() < 3 {
                eprintln!("Usage: analyzer patterns <json_path>");
                std::process::exit(1);
            }
            let content = fs::read_to_string(&args[2]).expect("Unable to read JSON file");
            let request: batch::PatternRequest = serde_json::from_str(&content).expect("Invalid pattern request JSON");
            let findings = batch::find_patterns(request);
            println!("{}", serde_json::to_string_pretty(&findings).unwrap());
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
        "heal" => {
            if args.len() < 3 {
                eprintln!("Usage: analyzer heal <plan_json_path_or_->");
                std::process::exit(1);
            }
            
            let content = if args[2] == "-" {
                let mut buffer = String::new();
                std::io::stdin().read_to_string(&mut buffer).expect("Unable to read stdin");
                buffer
            } else {
                fs::read_to_string(&args[2]).expect("Unable to read plan file")
            };
            
            let plan: HealingPlan = match serde_json::from_str(&content) {
                Ok(p) => p,
                // Fallback to snake_case if unmarshalled that way
                Err(_) => {
                    // Quick fallback definition
                    #[derive(Deserialize)]
                    struct HP2 {
                        issue_description: String,
                        file_path: String,
                        file_content: String,
                        context: String,
                    }
                    let p: HP2 = serde_json::from_str(&content).expect("Invalid HealingPlan JSON");
                    HealingPlan {
                        issue_description: p.issue_description,
                        file_path: p.file_path,
                        file_content: p.file_content,
                        context: p.context,
                    }
                }
            };
            
            let prompt = format!(
                "You are an expert software engineer. Fix the following issue in the specified file using the provided context. Provide ONLY the full fixed code inside a markdown block. No explanations.\n\nFile: {}\nIssue: {}\nContext: {}\n\nCurrent Code:\n```\n{}\n```",
                plan.file_path, plan.issue_description, plan.context, plan.file_content
            );
            
            if let Some(mut brain) = brain::Brain::new() {
                if let Some(answer) = brain.reason(&prompt, 1024) {
                    println!("{}", answer);
                } else {
                    eprintln!("Error: Brain was unable to generate healing patch.");
                }
            } else {
                eprintln!("Error: Brain was unable to initialize.");
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
        "deps" => {
            if args.len() < 3 {
                eprintln!("Usage: analyzer deps <file_path>");
                std::process::exit(1);
            }
            let source = fs::read_to_string(&args[2]).expect("Unable to read file");
            let extension = Path::new(&args[2]).extension().and_then(|s| s.to_str()).unwrap_or("");
            let deps = dependencies::extract_dependencies(&source, extension);
            println!("{}", serde_json::to_string_pretty(&deps).unwrap());
        }
        "score" => {
            if args.len() < 3 {
                eprintln!("Usage: analyzer score <json_path>");
                std::process::exit(1);
            }
            let content = fs::read_to_string(&args[2]).expect("Unable to read JSON file");
            let request: score_calculator::ScoreRequest = serde_json::from_str(&content).expect("Invalid score request JSON");
            let response = score_calculator::calculate_score(request);
            println!("{}", serde_json::to_string_pretty(&response).unwrap());
        }
        "coverage" => {
            if args.len() < 3 {
                eprintln!("Usage: analyzer coverage <json_path>");
                std::process::exit(1);
            }
            let content = fs::read_to_string(&args[2]).expect("Unable to read JSON file");
            let request: coverage_auditor::CoverageRequest = serde_json::from_str(&content).expect("Invalid coverage request JSON");
            let response = coverage_auditor::detect_test(request);
            println!("{}", serde_json::to_string_pretty(&response).unwrap());
        }
        "graph-get" => {
            if let Some(brain) = brain::Brain::new() {
                let focus = if args.len() > 2 { &args[2] } else { "" };
                let depth = if args.len() > 3 { args[3].parse().unwrap_or(1) } else { 1 };
                let result = brain.get_graph_json(focus, depth);
                println!("{}", result);
            } else {
                eprintln!("Error: Brain was unable to initialize.");
                std::process::exit(1);
            }
        }
        "graph-query" => {
            if args.len() < 3 {
                eprintln!("Usage: analyzer graph-query <query>");
                std::process::exit(1);
            }
            if let Some(brain) = brain::Brain::new() {
                let result = brain.query_graph(&args[2]);
                println!("{}", result);
            } else {
                eprintln!("Error: Brain was unable to initialize.");
                std::process::exit(1);
            }
        }
        "scan" => {
            if args.len() < 3 {
                eprintln!("Usage: analyzer scan <directory> [--root <root>]");
                std::process::exit(1);
            }
            let dir = &args[2];
            let mut root = ".";
            if args.len() >= 5 && args[3] == "--root" {
                root = &args[4];
            }
            let results = scanner::scan_directory(Path::new(dir), Path::new(root));
            println!("{}", serde_json::to_string(&results).unwrap());
        }
        // Legacy
        other => {
            run_analyze(other);
        }
    }
}
