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

#[derive(serde::Deserialize)]
#[serde(rename_all = "camelCase")]
struct HealingPlan {
    issue_description: String,
    file_path: String,
    file_content: String,
    context: String,
}

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
        let source = fs::read_to_string(path).expect("Unable to read file");
        run_fingerprint_core(target_path, source);
    }
}

#[tokio::main]
async fn main() {
    let args: Vec<String> = env::args().collect();
    
    if args.len() < 2 {
        eprintln!("Usage:");
        eprintln!("  analyzer analyze <file_path>");
        eprintln!("  analyzer fingerprint <agents_root>");
        eprintln!("  analyzer audit <json_path>");
        eprintln!("  analyzer deduplicate <json_path>");
        eprintln!("  analyzer connectivity <json_path>");
        eprintln!("  analyzer deps <file_path>");
        eprintln!("  analyzer graph-get <json_or_focus>");
        eprintln!("  analyzer graph-query <query>");
        eprintln!("  analyzer heal <plan_json_path>");
        eprintln!("  analyzer search <query> [path]");
        eprintln!("  analyzer rag <query>");
        eprintln!("  analyzer reason <prompt>");
        eprintln!("  analyzer scan <dir> [--root <root>]");
        std::process::exit(1);
    }

    match args[1].as_str() {
        "serve" => {
            let port = args.get(2).and_then(|s| s.parse::<u16>().ok()).unwrap_or(50052);
            let addr = format!("127.0.0.1:{}", port).parse().unwrap();
            
            eprintln!("[Analyzer] Initializing Sovereign Brain...");
            let brain = brain::Brain::new().expect("Failed to initialize Brain for serving");
            let server_impl = server::HubServerImpl::new(brain);
            
            let svc = server::hub_proto::hub_service_server::HubServiceServer::new(server_impl);
            eprintln!("[Analyzer] gRPC Server listening on {}", addr);
            tonic::transport::Server::builder().add_service(svc).serve(addr).await.expect("Failed to start gRPC server");
        }
        "analyze" => {
            if args.len() < 3 { eprintln!("Usage: analyzer analyze <file_path>"); std::process::exit(1); }
            run_analyze(&args[2]);
        }
        "fingerprint" => {
            if args.len() < 3 { eprintln!("Usage: analyzer fingerprint <agents_root>"); std::process::exit(1); }
            run_fingerprint(&args[2]);
        }
        "audit" => {
            let content = fs::read_to_string(&args[2]).expect("Unable to read file");
            let request: audit::BulkAuditRequest = serde_json::from_str(&content).unwrap();
            let findings = audit::bulk_audit(request);
            println!("{}", serde_json::to_string_pretty(&findings).unwrap());
        }
        "deduplicate" => {
            let content = fs::read_to_string(&args[2]).expect("Unable to read file");
            let findings = serde_json::from_str(&content).unwrap();
            let deduped = deduplicator::deduplicate(findings);
            println!("{}", serde_json::to_string_pretty(&deduped).unwrap());
        }
        "connectivity" => {
            let content = fs::read_to_string(&args[2]).expect("Unable to read file");
            let files = serde_json::from_str(&content).unwrap();
            let results = connectivity::calculate_all_connectivity(files);
            println!("{}", serde_json::to_string_pretty(&results).unwrap());
        }
        "index" => {
            let results = batch::index_project(&args[2]);
            println!("{}", serde_json::to_string_pretty(&results).unwrap());
        }
        "topology" => {
            let map = batch::scan_topology(&args[2]);
            println!("{}", serde_json::to_string_pretty(&map).unwrap());
        }
        "dna" => {
            let identity = dna::discover_identity(&args[2]);
            println!("{}", serde_json::to_string_pretty(&identity).unwrap());
        }
        "graph-get" => {
            if let Some(brain) = brain::Brain::new() {
                let focus = args.get(2).map(|s| s.as_str()).unwrap_or("");
                let depth = args.get(3).and_then(|s| s.parse().ok()).unwrap_or(1);
                println!("{}", brain.get_graph_json(focus, depth));
            }
        }
        "graph-query" => {
            if let Some(brain) = brain::Brain::new() {
                println!("{}", brain.query_graph(&args[2]));
            }
        }
        "heal" => {
            let content = if args[2] == "-" {
                let mut buffer = String::new(); std::io::stdin().read_to_string(&mut buffer).unwrap(); buffer
            } else {
                fs::read_to_string(&args[2]).unwrap()
            };
            let plan: HealingPlan = serde_json::from_str(&content).expect("Invalid HealingPlan JSON");
            let prompt = format!("Fix issue in {}: {}\nContext: {}\nCode: {}", plan.file_path, plan.issue_description, plan.context, plan.file_content);
            if let Some(mut brain) = brain::Brain::new() {
                if let Some(answer) = brain.reason(&prompt, None, 1024) { println!("{}", answer); }
            }
        }
        "reason" => {
            if let Some(mut brain) = brain::Brain::new() {
                if let Some(res) = brain.reason(&args[2], None, 200) { println!("{}", res); }
            }
        }
        "rag" => {
            if let Some(mut brain) = brain::Brain::new() {
                println!("🔍 Buscando contexto relevante para: '{}'...", &args[2]);
                let context = brain.retrieve_context(&args[2]);
                if let Some(res) = brain.reason(&args[2], Some(&context), 300) { println!("{}", res); }
            }
        }
        "scan" => {
            let dir = &args[2];
            let root = if args.len() >= 5 && args[3] == "--root" { &args[4] } else { "." };
            let path = Path::new(dir);
            if path.is_file() {
                let res = scanner::analyze_file(path, Path::new(root)).unwrap();
                println!("{}", serde_json::to_string(&vec![res]).unwrap());
            } else {
                let results = scanner::scan_directory(path, Path::new(root));
                println!("{}", serde_json::to_string(&results).unwrap());
            }
        }
        "search" => {
            let query = args[2].clone();
            let mut files = HashMap::new();
            for entry in walkdir::WalkDir::new(".").into_iter().filter_map(|e| e.ok()).filter(|e| e.file_type().is_file()) {
                if let Ok(c) = fs::read_to_string(entry.path()) {
                    files.insert(entry.path().to_string_lossy().to_string(), c);
                }
            }
            let results = search::semantic_search(search::SearchRequest { query, files });
            println!("{}", serde_json::to_string_pretty(&results).unwrap());
        }
        other => { run_analyze(other); }
    }
}
