use tonic::{Request, Response, Status};
use std::pin::Pin;
use tokio_stream::Stream;

pub mod hub_proto {
    tonic::include_proto!("hub");
}

use hub_proto::hub_service_server::HubService;
use hub_proto::{
    AnalyzeRequest, AnalyzeResponse, Empty, StatusResponse, ScanRequest, ScanResponse, 
    DeduplicateRequest, ConnectivityRequest, AuditRequest, BatchRequest, ReasonRequest, 
    PatternRequest, PenaltyRequest, ScoreRequest, CoverageRequest, GraphRequest, 
    QueryRequest, HealingPlan, HealthUpdate, Event, TaskRequest, TaskResponse, 
    PendingRequest, PendingResponse, UpdateTaskRequest
};

use crate::{analysis, fingerprint, dna, batch, graph, connectivity, audit, penalty, brain, search};
use std::fs;
use std::collections::HashMap;

pub struct HubServerImpl;

type ResponseStream<T> = Pin<Box<dyn Stream<Item = Result<T, Status>> + Send + 'static>>;

#[tonic::async_trait]
impl HubService for HubServerImpl {
    type WatchHealthStream = ResponseStream<HealthUpdate>;
    type WatchEventsStream = ResponseStream<Event>;
    type AnalyzeStreamStream = ResponseStream<AnalyzeResponse>;

    async fn get_status(&self, _request: Request<Empty>) -> Result<Response<StatusResponse>, Status> {
        Ok(Response::new(StatusResponse {
            status: "serving".to_string(),
            version: "0.1.0".to_string(),
            health: None,
        }))
    }

    async fn watch_health(&self, _request: Request<Empty>) -> Result<Response<Self::WatchHealthStream>, Status> {
        Err(Status::unimplemented("Not needed in sidecar"))
    }

    async fn watch_events(&self, _request: Request<Empty>) -> Result<Response<Self::WatchEventsStream>, Status> {
        Err(Status::unimplemented("Not needed in sidecar"))
    }

    async fn scan_project(&self, _request: Request<ScanRequest>) -> Result<Response<ScanResponse>, Status> {
        Err(Status::unimplemented("Handled by Go Hub"))
    }

    async fn analyze_file(&self, request: Request<AnalyzeRequest>) -> Result<Response<AnalyzeResponse>, Status> {
        let req = request.into_inner();
        let content = if !req.content.is_empty() {
            req.content
        } else {
            fs::read_to_string(&req.file).map_err(|e| Status::internal(format!("Failed to read file: {}", e)))?
        };

        let result = analysis::run_analyze_core(&req.file, content);
        let json_data = serde_json::to_string(&result).map_err(|e| Status::internal(format!("Serialization error: {}", e)))?;
        
        Ok(Response::new(AnalyzeResponse { json_data }))
    }

    async fn analyze_stream(&self, _request: Request<tonic::Streaming<AnalyzeRequest>>) -> Result<Response<Self::AnalyzeStreamStream>, Status> {
        Err(Status::unimplemented("Not implemented in Rust sidecar yet"))
    }

    async fn get_dependencies(&self, request: Request<AnalyzeRequest>) -> Result<Response<AnalyzeResponse>, Status> {
        let req = request.into_inner();
        let extension = std::path::Path::new(&req.file).extension().and_then(|s| s.to_str()).unwrap_or("");
        let content = if !req.content.is_empty() {
            req.content
        } else {
            fs::read_to_string(&req.file).map_err(|e| Status::internal(format!("Failed to read file: {}", e)))?
        };

        let deps = crate::dependencies::extract_dependencies(&content, extension);
        let json_data = serde_json::to_string(&deps).map_err(|e| Status::internal(format!("Serialization error: {}", e)))?;

        Ok(Response::new(AnalyzeResponse { json_data }))
    }

    async fn deduplicate(&self, request: Request<DeduplicateRequest>) -> Result<Response<AnalyzeResponse>, Status> {
        let req = request.into_inner();
        let findings: Vec<crate::deduplicator::RawFinding> = serde_json::from_str(&req.findings_json)
            .map_err(|e| Status::invalid_argument(format!("Invalid findings JSON: {}", e)))?;
        let deduped = crate::deduplicator::deduplicate(findings);
        let json_data = serde_json::to_string(&deduped).map_err(|e| Status::internal(format!("Serialization error: {}", e)))?;
        Ok(Response::new(AnalyzeResponse { json_data }))
    }

    async fn fingerprint(&self, request: Request<AnalyzeRequest>) -> Result<Response<AnalyzeResponse>, Status> {
        let req = request.into_inner();
        let content = if !req.content.is_empty() {
            req.content
        } else {
            fs::read_to_string(&req.file).map_err(|e| Status::internal(format!("Failed to read file: {}", e)))?
        };

        let stem = std::path::Path::new(&req.file).file_stem().and_then(|s| s.to_str()).unwrap_or("unknown");
        let fp = fingerprint::extract_fingerprint(&content, stem);
        let json_data = serde_json::to_string(&fp).map_err(|e| Status::internal(format!("Serialization error: {}", e)))?;

        Ok(Response::new(AnalyzeResponse { json_data }))
    }

    async fn discover_identity(&self, request: Request<AnalyzeRequest>) -> Result<Response<AnalyzeResponse>, Status> {
        let req = request.into_inner();
        let identity = dna::discover_identity(&req.file);
        let json_data = serde_json::to_string(&identity).map_err(|e| Status::internal(format!("Serialization error: {}", e)))?;
        Ok(Response::new(AnalyzeResponse { json_data }))
    }

    async fn index_project(&self, request: Request<AnalyzeRequest>) -> Result<Response<AnalyzeResponse>, Status> {
        let req = request.into_inner();
        let results = batch::index_project(&req.file);
        let json_data = serde_json::to_string(&results).map_err(|e| Status::internal(format!("Serialization error: {}", e)))?;
        Ok(Response::new(AnalyzeResponse { json_data }))
    }

    async fn scan_topology(&self, request: Request<AnalyzeRequest>) -> Result<Response<AnalyzeResponse>, Status> {
        let req = request.into_inner();
        let map = batch::scan_topology(&req.file);
        let json_data = serde_json::to_string(&map).map_err(|e| Status::internal(format!("Serialization error: {}", e)))?;
        Ok(Response::new(AnalyzeResponse { json_data }))
    }

    async fn get_context(&self, request: Request<AnalyzeRequest>) -> Result<Response<AnalyzeResponse>, Status> {
        let req = request.into_inner();
        let brain = brain::Brain::new().ok_or_else(|| Status::internal("Failed to initialize Brain"))?;
        let ctx = brain.get_context_for(&req.file);
        let json_data = serde_json::to_string(&ctx).map_err(|e| Status::internal(format!("Serialization error: {}", e)))?;
        Ok(Response::new(AnalyzeResponse { json_data }))
    }

    async fn get_connectivity(&self, request: Request<ConnectivityRequest>) -> Result<Response<AnalyzeResponse>, Status> {
        let req = request.into_inner();
        let files: HashMap<String, connectivity::FileInfo> = serde_json::from_str(&req.dependency_map_json)
            .map_err(|e| Status::invalid_argument(format!("Invalid connectivity JSON: {}", e)))?;
        let results = connectivity::calculate_all_connectivity(files);
        let json_data = serde_json::to_string(&results).map_err(|e| Status::internal(format!("Serialization error: {}", e)))?;
        Ok(Response::new(AnalyzeResponse { json_data }))
    }

    async fn audit(&self, request: Request<AuditRequest>) -> Result<Response<AnalyzeResponse>, Status> {
        let req = request.into_inner();
        let audit_req: audit::BulkAuditRequest = serde_json::from_str(&req.audit_json)
            .map_err(|e| Status::invalid_argument(format!("Invalid audit JSON: {}", e)))?;
        let findings = audit::bulk_audit(audit_req);
        let json_data = serde_json::to_string(&findings).map_err(|e| Status::internal(format!("Serialization error: {}", e)))?;
        Ok(Response::new(AnalyzeResponse { json_data }))
    }

    async fn batch(&self, request: Request<BatchRequest>) -> Result<Response<AnalyzeResponse>, Status> {
        let req = request.into_inner();
        #[derive(serde::Deserialize)]
        struct BatchInternal { file_paths: Vec<String>, project_root: String }
        let batch_req: BatchInternal = serde_json::from_str(&req.batch_json)
            .map_err(|e| Status::invalid_argument(format!("Invalid batch JSON: {}", e)))?;
        let results = batch::process_batch(batch_req.file_paths, &batch_req.project_root);
        let json_data = serde_json::to_string(&results).map_err(|e| Status::internal(format!("Serialization error: {}", e)))?;
        Ok(Response::new(AnalyzeResponse { json_data }))
    }

    async fn reason(&self, request: Request<ReasonRequest>) -> Result<Response<AnalyzeResponse>, Status> {
        let req = request.into_inner();
        let mut brain = brain::Brain::new().ok_or_else(|| Status::internal("Failed to initialize Brain"))?;
        let result = brain.reason(&req.prompt, 512);
        let json_data = result.unwrap_or_else(|| "Error: Brain unable to reason".to_string());
        Ok(Response::new(AnalyzeResponse { json_data }))
    }

    async fn patterns(&self, request: Request<PatternRequest>) -> Result<Response<AnalyzeResponse>, Status> {
        let req = request.into_inner();
        let pattern_req: batch::PatternRequest = serde_json::from_str(&req.pattern_json)
            .map_err(|e| Status::invalid_argument(format!("Invalid pattern JSON: {}", e)))?;
        let findings = batch::find_patterns(pattern_req);
        let json_data = serde_json::to_string(&findings).map_err(|e| Status::internal(format!("Serialization error: {}", e)))?;
        Ok(Response::new(AnalyzeResponse { json_data }))
    }

    async fn penalty(&self, request: Request<PenaltyRequest>) -> Result<Response<AnalyzeResponse>, Status> {
        let req = request.into_inner();
        let penalty_req: penalty::PenaltyRequest = serde_json::from_str(&req.penalty_json)
            .map_err(|e| Status::invalid_argument(format!("Invalid penalty JSON: {}", e)))?;
        let resp = penalty::calculate_penalty(penalty_req);
        let json_data = serde_json::to_string(&resp).map_err(|e| Status::internal(format!("Serialization error: {}", e)))?;
        Ok(Response::new(AnalyzeResponse { json_data }))
    }

    async fn calculate_score(&self, request: Request<ScoreRequest>) -> Result<Response<AnalyzeResponse>, Status> {
        let req = request.into_inner();
        let score_req: crate::score_calculator::ScoreRequest = serde_json::from_str(&req.score_json)
            .map_err(|e| Status::invalid_argument(format!("Invalid ScoreRequest JSON: {}", e)))?;

        let resp = crate::score_calculator::calculate_score(score_req);
        let json_data = serde_json::to_string(&resp).map_err(|e| Status::internal(format!("Serialization error: {}", e)))?;
        
        Ok(Response::new(AnalyzeResponse { json_data }))
    }

    async fn audit_coverage(&self, request: Request<CoverageRequest>) -> Result<Response<AnalyzeResponse>, Status> {
        let req = request.into_inner();
        let coverage_req: crate::coverage_auditor::CoverageRequest = serde_json::from_str(&req.coverage_json)
            .map_err(|e| Status::invalid_argument(format!("Invalid CoverageRequest JSON: {}", e)))?;

        let resp = crate::coverage_auditor::detect_test(coverage_req);
        let json_data = serde_json::to_string(&resp).map_err(|e| Status::internal(format!("Serialization error: {}", e)))?;

        Ok(Response::new(AnalyzeResponse { json_data }))
    }

    async fn get_knowledge_graph(&self, request: Request<GraphRequest>) -> Result<Response<AnalyzeResponse>, Status> {
        let req = request.into_inner();
        #[derive(serde::Deserialize)]
        struct GraphParam { focus: String, depth: i32 }
        let param: GraphParam = serde_json::from_str(&req.graph_json).unwrap_or(GraphParam { focus: "".to_string(), depth: 1 });
        
        let brain = brain::Brain::new().ok_or_else(|| Status::internal("Failed to initialize Brain"))?;
        let result = brain.get_graph_json(&param.focus, param.depth);
        Ok(Response::new(AnalyzeResponse { json_data: result }))
    }

    async fn query_knowledge_graph(&self, request: Request<QueryRequest>) -> Result<Response<AnalyzeResponse>, Status> {
        let req = request.into_inner();
        let brain = brain::Brain::new().ok_or_else(|| Status::internal("Failed to initialize Brain"))?;
        let result = brain.query_graph(&req.query_json);
        Ok(Response::new(AnalyzeResponse { json_data: result }))
    }

    async fn execute_healing(&self, request: Request<HealingPlan>) -> Result<Response<AnalyzeResponse>, Status> {
        let plan = request.into_inner();
        let prompt = format!(
            "You are an expert engineer. Fix the following code based on the context.\nFile: {}\nIssue: {}\nContext: {}\n\nCode:\n{}",
            plan.file_path, plan.issue_description, plan.context, plan.file_content
        );
        let mut brain = brain::Brain::new().ok_or_else(|| Status::internal("Failed to initialize Brain"))?;
        let result = brain.reason(&prompt, 1024);
        let json_data = result.unwrap_or_else(|| "Error: Healing failed".to_string());
        Ok(Response::new(AnalyzeResponse { json_data }))
    }

    async fn enqueue_task(&self, _request: Request<TaskRequest>) -> Result<Response<TaskResponse>, Status> {
        Err(Status::unimplemented("Handled by Go Hub"))
    }

    async fn get_pending_tasks(&self, _request: Request<PendingRequest>) -> Result<Response<PendingResponse>, Status> {
        Err(Status::unimplemented("Handled by Go Hub"))
    }

    async fn update_task(&self, _request: Request<UpdateTaskRequest>) -> Result<Response<Empty>, Status> {
        Err(Status::unimplemented("Handled by Go Hub"))
    }
}
