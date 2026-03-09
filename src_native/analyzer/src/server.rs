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

use crate::{analysis, fingerprint};
use std::fs;

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

    async fn deduplicate(&self, _request: Request<DeduplicateRequest>) -> Result<Response<AnalyzeResponse>, Status> {
        Err(Status::unimplemented("Logic not moved yet"))
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

    async fn discover_identity(&self, _request: Request<AnalyzeRequest>) -> Result<Response<AnalyzeResponse>, Status> {
        Err(Status::unimplemented("Not implemented"))
    }

    async fn index_project(&self, _request: Request<AnalyzeRequest>) -> Result<Response<AnalyzeResponse>, Status> {
        Err(Status::unimplemented("Not implemented"))
    }

    async fn scan_topology(&self, _request: Request<AnalyzeRequest>) -> Result<Response<AnalyzeResponse>, Status> {
        Err(Status::unimplemented("Not implemented"))
    }

    async fn get_context(&self, _request: Request<AnalyzeRequest>) -> Result<Response<AnalyzeResponse>, Status> {
        Err(Status::unimplemented("Not implemented"))
    }

    async fn get_connectivity(&self, _request: Request<ConnectivityRequest>) -> Result<Response<AnalyzeResponse>, Status> {
        Err(Status::unimplemented("Not implemented"))
    }

    async fn audit(&self, _request: Request<AuditRequest>) -> Result<Response<AnalyzeResponse>, Status> {
        Err(Status::unimplemented("Not implemented"))
    }

    async fn batch(&self, _request: Request<BatchRequest>) -> Result<Response<AnalyzeResponse>, Status> {
        Err(Status::unimplemented("Not implemented"))
    }

    async fn reason(&self, _request: Request<ReasonRequest>) -> Result<Response<AnalyzeResponse>, Status> {
        Err(Status::unimplemented("Not implemented"))
    }

    async fn patterns(&self, _request: Request<PatternRequest>) -> Result<Response<AnalyzeResponse>, Status> {
        Err(Status::unimplemented("Not implemented"))
    }

    async fn penalty(&self, _request: Request<PenaltyRequest>) -> Result<Response<AnalyzeResponse>, Status> {
        Err(Status::unimplemented("Not implemented"))
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

    async fn get_knowledge_graph(&self, _request: Request<GraphRequest>) -> Result<Response<AnalyzeResponse>, Status> {
        Err(Status::unimplemented("Not implemented"))
    }

    async fn query_knowledge_graph(&self, _request: Request<QueryRequest>) -> Result<Response<AnalyzeResponse>, Status> {
        Err(Status::unimplemented("Not implemented"))
    }

    async fn execute_healing(&self, _request: Request<HealingPlan>) -> Result<Response<AnalyzeResponse>, Status> {
        Err(Status::unimplemented("Not implemented"))
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
