use tonic::{Request, Response, Status};
use std::pin::Pin;
use tokio_stream::Stream;

pub mod hub_proto {
    tonic::include_proto!("hub");
}

use hub_proto::hub_service_server::HubService;

use crate::{analysis, fingerprint, dna, batch, connectivity, audit, penalty, brain};
use std::fs;
use std::collections::HashMap;

use std::sync::Arc;
use tokio::sync::RwLock;

pub struct HubServerImpl {
    pub brain: Arc<RwLock<brain::Brain>>,
}

impl HubServerImpl {
    pub fn new(brain: brain::Brain) -> Self {
        Self { brain: Arc::new(RwLock::new(brain)) }
    }

    fn get_trace_id<T>(request: &Request<T>) -> String {
        request.metadata().get("x-trace-id")
            .and_then(|v| v.to_str().ok())
            .unwrap_or("no-trace")
            .to_string()
    }
}

type ResponseStream<T> = Pin<Box<dyn Stream<Item = Result<T, Status>> + Send + 'static>>;

#[tonic::async_trait]
impl HubService for HubServerImpl {
    type WatchHealthStream = ResponseStream<hub_proto::HealthUpdate>;
    type WatchEventsStream = ResponseStream<hub_proto::Event>;
    type AnalyzeStreamStream = ResponseStream<hub_proto::AnalyzeResponse>;
    type RetrieveStream = ResponseStream<hub_proto::MemoryEntry>;

    async fn get_status(&self, _request: Request<hub_proto::Empty>) -> Result<Response<hub_proto::StatusResponse>, Status> {
        Ok(Response::new(hub_proto::StatusResponse {
            status: "serving".to_string(),
            version: "0.1.0".to_string(),
            health: None,
        }))
    }

    async fn watch_health(&self, _request: Request<hub_proto::Empty>) -> Result<Response<Self::WatchHealthStream>, Status> {
        Err(Status::unimplemented("Not needed in sidecar"))
    }

    async fn watch_events(&self, _request: Request<hub_proto::Empty>) -> Result<Response<Self::WatchEventsStream>, Status> {
        Err(Status::unimplemented("Not needed in sidecar"))
    }

    async fn scan_project(&self, request: Request<hub_proto::ScanRequest>) -> Result<Response<hub_proto::ScanResponse>, Status> {
        let req = request.into_inner();
        let dir_path = std::path::Path::new(&req.directory);
        let root_path = std::path::Path::new(&req.root);

        if !dir_path.exists() {
            return Err(Status::not_found(format!("Directory not found: {}", req.directory)));
        }

        let results = crate::scanner::scan_directory(dir_path, root_path);
        let files = results.into_iter().map(|f| hub_proto::FileMetadata {
            path: f.path,
            loc: f.loc as i32,
            sloc: f.sloc as i32,
            comments: f.comments as i32,
            intent: f.intent,
        }).collect();

        Ok(Response::new(hub_proto::ScanResponse { files }))
    }

    async fn analyze_file(&self, request: Request<hub_proto::AnalyzeRequest>) -> Result<Response<hub_proto::AnalyzeResponse>, Status> {
        let req = request.into_inner();
        let content = if !req.content.is_empty() {
            req.content
        } else {
            fs::read_to_string(&req.file).map_err(|e| Status::internal(format!("Failed to read file: {}", e)))?
        };

        let result = analysis::run_analyze_core(&req.file, content);
        let json_data = serde_json::to_string(&result).map_err(|e| Status::internal(format!("Serialization error: {}", e)))?;
        
        Ok(Response::new(hub_proto::AnalyzeResponse { json_data }))
    }

    async fn analyze_stream(&self, _request: Request<tonic::Streaming<hub_proto::AnalyzeRequest>>) -> Result<Response<Self::AnalyzeStreamStream>, Status> {
        Err(Status::unimplemented("Not implemented in Rust sidecar yet"))
    }

    async fn get_dependencies(&self, request: Request<hub_proto::AnalyzeRequest>) -> Result<Response<hub_proto::AnalyzeResponse>, Status> {
        let req = request.into_inner();
        let extension = std::path::Path::new(&req.file).extension().and_then(|s| s.to_str()).unwrap_or("");
        let content = if !req.content.is_empty() {
            req.content
        } else {
            fs::read_to_string(&req.file).map_err(|e| Status::internal(format!("Failed to read file: {}", e)))?
        };

        let deps = crate::dependencies::extract_dependencies(&content, extension);
        let json_data = serde_json::to_string(&deps).map_err(|e| Status::internal(format!("Serialization error: {}", e)))?;

        Ok(Response::new(hub_proto::AnalyzeResponse { json_data }))
    }

    async fn deduplicate(&self, request: Request<hub_proto::DeduplicateRequest>) -> Result<Response<hub_proto::AnalyzeResponse>, Status> {
        let req = request.into_inner();
        let findings: Vec<crate::deduplicator::RawFinding> = serde_json::from_str(&req.findings_json)
            .map_err(|e| Status::invalid_argument(format!("Invalid findings JSON: {}", e)))?;
        let deduped = crate::deduplicator::deduplicate(findings);
        let json_data = serde_json::to_string(&deduped).map_err(|e| Status::internal(format!("Serialization error: {}", e)))?;
        Ok(Response::new(hub_proto::AnalyzeResponse { json_data }))
    }

    async fn fingerprint(&self, request: Request<hub_proto::AnalyzeRequest>) -> Result<Response<hub_proto::AnalyzeResponse>, Status> {
        let req = request.into_inner();
        let content = if !req.content.is_empty() {
            req.content
        } else {
            fs::read_to_string(&req.file).map_err(|e| Status::internal(format!("Failed to read file: {}", e)))?
        };

        let path_obj = std::path::Path::new(&req.file);
        let stem = path_obj.file_stem().and_then(|s| s.to_str()).unwrap_or("unknown");
        let ext = path_obj.extension().and_then(|e| e.to_str()).unwrap_or("");
        let fp = fingerprint::extract_fingerprint(&content, stem, ext);
        let json_data = serde_json::to_string(&fp).map_err(|e| Status::internal(format!("Serialization error: {}", e)))?;

        Ok(Response::new(hub_proto::AnalyzeResponse { json_data }))
    }

    async fn discover_identity(&self, request: Request<hub_proto::AnalyzeRequest>) -> Result<Response<hub_proto::AnalyzeResponse>, Status> {
        let req = request.into_inner();
        let identity = dna::discover_identity(&req.file);
        let json_data = serde_json::to_string(&identity).map_err(|e| Status::internal(format!("Serialization error: {}", e)))?;
        Ok(Response::new(hub_proto::AnalyzeResponse { json_data }))
    }

    async fn index_project(&self, request: Request<hub_proto::AnalyzeRequest>) -> Result<Response<hub_proto::AnalyzeResponse>, Status> {
        let req = request.into_inner();
        let results = batch::index_project(&req.file);
        let json_data = serde_json::to_string(&results).map_err(|e| Status::internal(format!("Serialization error: {}", e)))?;
        Ok(Response::new(hub_proto::AnalyzeResponse { json_data }))
    }

    async fn scan_topology(&self, request: Request<hub_proto::AnalyzeRequest>) -> Result<Response<hub_proto::AnalyzeResponse>, Status> {
        let req = request.into_inner();
        let map = batch::scan_topology(&req.file);
        let json_data = serde_json::to_string(&map).map_err(|e| Status::internal(format!("Serialization error: {}", e)))?;
        Ok(Response::new(hub_proto::AnalyzeResponse { json_data }))
    }

    async fn get_context(&self, request: Request<hub_proto::AnalyzeRequest>) -> Result<Response<hub_proto::AnalyzeResponse>, Status> {
        let trace_id = Self::get_trace_id(&request);
        let req = request.into_inner();
        
        let brain = self.brain.read().await;
        let ctx = brain.get_context_for(&req.file);
        
        eprintln!("[Analyzer] [Trace:{}] Context retrieved for: {}", trace_id, req.file);
        let json_data = serde_json::to_string(&ctx).map_err(|e| Status::internal(format!("Serialization error: {}", e)))?;
        Ok(Response::new(hub_proto::AnalyzeResponse { json_data }))
    }

    async fn get_connectivity(&self, request: Request<hub_proto::ConnectivityRequest>) -> Result<Response<hub_proto::AnalyzeResponse>, Status> {
        let req = request.into_inner();
        let files: HashMap<String, connectivity::FileInfo> = serde_json::from_str(&req.dependency_map_json)
            .map_err(|e| Status::invalid_argument(format!("Invalid connectivity JSON: {}", e)))?;
        let results = connectivity::calculate_all_connectivity(files);
        let json_data = serde_json::to_string(&results).map_err(|e| Status::internal(format!("Serialization error: {}", e)))?;
        Ok(Response::new(hub_proto::AnalyzeResponse { json_data }))
    }

    async fn audit(&self, request: Request<hub_proto::AuditRequest>) -> Result<Response<hub_proto::AnalyzeResponse>, Status> {
        let req = request.into_inner();
        let audit_req: audit::BulkAuditRequest = serde_json::from_str(&req.audit_json)
            .map_err(|e| Status::invalid_argument(format!("Invalid audit JSON: {}", e)))?;
        let findings = audit::bulk_audit(audit_req);
        let json_data = serde_json::to_string(&findings).map_err(|e| Status::internal(format!("Serialization error: {}", e)))?;
        Ok(Response::new(hub_proto::AnalyzeResponse { json_data }))
    }

    async fn batch(&self, request: Request<hub_proto::BatchRequest>) -> Result<Response<hub_proto::AnalyzeResponse>, Status> {
        let req = request.into_inner();
        #[derive(serde::Deserialize)]
        struct BatchInternal { file_paths: Vec<String>, project_root: String }
        let batch_req: BatchInternal = serde_json::from_str(&req.batch_json)
            .map_err(|e| Status::invalid_argument(format!("Invalid batch JSON: {}", e)))?;
        let results = batch::process_batch(batch_req.file_paths, &batch_req.project_root);
        let json_data = serde_json::to_string(&results).map_err(|e| Status::internal(format!("Serialization error: {}", e)))?;
        Ok(Response::new(hub_proto::AnalyzeResponse { json_data }))
    }

    async fn reason(&self, request: Request<hub_proto::ReasonRequest>) -> Result<Response<hub_proto::AnalyzeResponse>, Status> {
        let trace_id = Self::get_trace_id(&request);
        let req = request.into_inner();
        
        let mut brain = self.brain.write().await;
        
        let context = if req.use_rag {
            Some(brain.retrieve_context(&req.prompt))
        } else {
            None
        };

        eprintln!("[Analyzer] [Trace:{}] Reasoning prompt: {}", trace_id, req.prompt);
        let result = brain.reason(&req.prompt, context.as_deref(), 512);
        let json_data = result.unwrap_or_else(|| "Error: Brain unable to reason".to_string());
        Ok(Response::new(hub_proto::AnalyzeResponse { json_data }))
    }

    async fn patterns(&self, request: Request<hub_proto::PatternRequest>) -> Result<Response<hub_proto::AnalyzeResponse>, Status> {
        let req = request.into_inner();
        let pattern_req: batch::PatternRequest = serde_json::from_str(&req.pattern_json)
            .map_err(|e| Status::invalid_argument(format!("Invalid pattern JSON: {}", e)))?;
        let findings = batch::find_patterns(pattern_req);
        let json_data = serde_json::to_string(&findings).map_err(|e| Status::internal(format!("Serialization error: {}", e)))?;
        Ok(Response::new(hub_proto::AnalyzeResponse { json_data }))
    }

    async fn penalty(&self, request: Request<hub_proto::PenaltyRequest>) -> Result<Response<hub_proto::AnalyzeResponse>, Status> {
        let req = request.into_inner();
        let penalty_req: penalty::PenaltyRequest = serde_json::from_str(&req.penalty_json)
            .map_err(|e| Status::invalid_argument(format!("Invalid penalty JSON: {}", e)))?;
        let resp = penalty::calculate_penalty(penalty_req);
        let json_data = serde_json::to_string(&resp).map_err(|e| Status::internal(format!("Serialization error: {}", e)))?;
        Ok(Response::new(hub_proto::AnalyzeResponse { json_data }))
    }

    async fn calculate_score(&self, request: Request<hub_proto::ScoreRequest>) -> Result<Response<hub_proto::AnalyzeResponse>, Status> {
        let req = request.into_inner();
        let score_req: crate::score_calculator::ScoreRequest = serde_json::from_str(&req.score_json)
            .map_err(|e| Status::invalid_argument(format!("Invalid ScoreRequest JSON: {}", e)))?;

        let resp = crate::score_calculator::calculate_score(score_req);
        let json_data = serde_json::to_string(&resp).map_err(|e| Status::internal(format!("Serialization error: {}", e)))?;
        
        Ok(Response::new(hub_proto::AnalyzeResponse { json_data }))
    }

    async fn audit_coverage(&self, request: Request<hub_proto::CoverageRequest>) -> Result<Response<hub_proto::AnalyzeResponse>, Status> {
        let req = request.into_inner();
        let coverage_req: crate::coverage_auditor::CoverageRequest = serde_json::from_str(&req.coverage_json)
            .map_err(|e| Status::invalid_argument(format!("Invalid CoverageRequest JSON: {}", e)))?;

        let resp = crate::coverage_auditor::detect_test(coverage_req);
        let json_data = serde_json::to_string(&resp).map_err(|e| Status::internal(format!("Serialization error: {}", e)))?;

        Ok(Response::new(hub_proto::AnalyzeResponse { json_data }))
    }

    async fn get_knowledge_graph(&self, request: Request<hub_proto::GraphRequest>) -> Result<Response<hub_proto::AnalyzeResponse>, Status> {
        let trace_id = Self::get_trace_id(&request);
        let req = request.into_inner();
        #[derive(serde::Deserialize)]
        struct GraphParam { focus: String, depth: i32 }
        let param: GraphParam = serde_json::from_str(&req.graph_json).unwrap_or(GraphParam { focus: "".to_string(), depth: 1 });
        
        let brain = self.brain.read().await;
        let result = brain.get_graph_json(&param.focus, param.depth);
        eprintln!("[Analyzer] [Trace:{}] Graph retrieved (focus: {})", trace_id, param.focus);
        Ok(Response::new(hub_proto::AnalyzeResponse { json_data: result }))
    }

    async fn query_knowledge_graph(&self, request: Request<hub_proto::QueryRequest>) -> Result<Response<hub_proto::AnalyzeResponse>, Status> {
        let trace_id = Self::get_trace_id(&request);
        let req = request.into_inner();
        let brain = self.brain.read().await;
        let result = brain.query_graph(&req.query_json);
        eprintln!("[Analyzer] [Trace:{}] Graph query: {}", trace_id, req.query_json);
        Ok(Response::new(hub_proto::AnalyzeResponse { json_data: result }))
    }

    async fn execute_healing(&self, request: Request<hub_proto::HealingPlan>) -> Result<Response<hub_proto::AnalyzeResponse>, Status> {
        let trace_id = Self::get_trace_id(&request);
        let plan = request.into_inner();
        let prompt = format!(
            "You are an expert engineer. Fix the following code based on the context.\nFile: {}\nIssue: {}\nContext: {}\n\nCode:\n{}",
            plan.file_path, plan.issue_description, plan.context, plan.file_content
        );
        let mut brain = self.brain.write().await;
        let result = brain.reason(&prompt, None, 1024);
        eprintln!("[Analyzer] [Trace:{}] Healing request for: {}", trace_id, plan.file_path);
        let json_data = result.unwrap_or_else(|| "Error: Healing failed".to_string());
        Ok(Response::new(hub_proto::AnalyzeResponse { json_data }))
    }

    async fn request_peer_review(&self, _request: Request<hub_proto::PeerReviewRequest>) -> Result<Response<hub_proto::PeerReviewResponse>, Status> {
        Err(Status::unimplemented("Handled by Go Hub"))
    }

    async fn broadcast_signal(&self, _request: Request<hub_proto::SignalRequest>) -> Result<Response<hub_proto::Empty>, Status> {
        Err(Status::unimplemented("Handled by Go Hub"))
    }

    async fn remember(&self, _request: Request<hub_proto::MemoryEntry>) -> Result<Response<hub_proto::Empty>, Status> {
        Err(Status::unimplemented("Handled by Go Hub"))
    }

    async fn retrieve(&self, _request: Request<hub_proto::MemoryQuery>) -> Result<Response<Self::RetrieveStream>, Status> {
        Err(Status::unimplemented("Handled by Go Hub"))
    }

    async fn embed(&self, request: Request<hub_proto::EmbedRequest>) -> Result<Response<hub_proto::EmbedResponse>, Status> {
        let trace_id = Self::get_trace_id(&request);
        let req = request.into_inner();
        let brain = self.brain.read().await;
        let embedding = brain.embed(&req.text).ok_or_else(|| Status::internal("Failed to generate embedding"))?;
        eprintln!("[Analyzer] [Trace:{}] Embedding generated ({} chars)", trace_id, req.text.len());
        Ok(Response::new(hub_proto::EmbedResponse { embedding }))
    }

    async fn enqueue_task(&self, _request: Request<hub_proto::TaskRequest>) -> Result<Response<hub_proto::TaskResponse>, Status> {
        Err(Status::unimplemented("Handled by Go Hub"))
    }

    async fn get_pending_tasks(&self, _request: Request<hub_proto::PendingRequest>) -> Result<Response<hub_proto::PendingResponse>, Status> {
        Err(Status::unimplemented("Handled by Go Hub"))
    }

    async fn update_task(&self, _request: Request<hub_proto::UpdateTaskRequest>) -> Result<Response<hub_proto::Empty>, Status> {
        Err(Status::unimplemented("Handled by Go Hub"))
    }
}
