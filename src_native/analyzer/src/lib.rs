// Library entry point for WASM builds.
// Re-exports core modules needed by the WASM bridge and other integrations.

pub mod analysis;
pub mod fingerprint;
pub mod dependencies;
pub mod audit;
pub mod deduplicator;
pub mod connectivity;
pub mod penalty;
pub mod batch;
pub mod dna;
pub mod graph;
pub mod pruner;
pub mod search;
pub mod brain;
pub mod chat;
pub mod score_calculator;
pub mod coverage_auditor;
pub mod cache;

#[cfg(feature = "wasm")]
pub mod wasm_bridge;

// Re-export common types
pub use analysis::{AnalysisResult, FunctionMetric, run_analyze_core, run_fingerprint_core};
