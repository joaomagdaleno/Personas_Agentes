//! WASM Bridge — Exposes core analysis functions for browser/Bun execution.
//!
//! Build: cargo build --target wasm32-unknown-unknown --features wasm
//! (requires wasm-bindgen-cli for JS binding generation)

#[cfg(feature = "wasm")]
use wasm_bindgen::prelude::*;

#[cfg(feature = "wasm")]
use crate::analysis;

/// Analyze source code complexity (WASM entry point).
/// Calls the real `run_analyze_core` and serializes the result to JSON.
#[cfg(feature = "wasm")]
#[wasm_bindgen]
pub fn analyze_wasm(path: &str, source: &str) -> String {
    let result = analysis::run_analyze_core(path, source.to_string());
    serde_json::to_string(&result).unwrap_or_default()
}

/// Extract fingerprint (WASM entry point).
#[cfg(feature = "wasm")]
#[wasm_bindgen]
pub fn fingerprint_wasm(path: &str, source: &str) -> String {
    let fp = analysis::run_fingerprint_core(path, source.to_string());
    serde_json::to_string(&fp).unwrap_or_default()
}
