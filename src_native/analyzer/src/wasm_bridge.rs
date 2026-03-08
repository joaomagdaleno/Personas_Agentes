//! WASM Bridge — Exposes core analysis functions for browser/Bun execution.
//!
//! Build: cargo build --target wasm32-unknown-unknown --features wasm
//! (requires wasm-bindgen-cli for JS binding generation)

#[cfg(feature = "wasm")]
use wasm_bindgen::prelude::*;

#[cfg(feature = "wasm")]
use crate::fingerprint;

#[cfg(feature = "wasm")]
use crate::dependencies;

/// Analyze source code complexity (WASM entry point).
#[cfg(feature = "wasm")]
#[wasm_bindgen]
pub fn analyze_wasm(path: &str, source: &str) -> String {
    use crate::run_analyze_core;
    // For WASM we capture stdout via a redirect — simplified version returns JSON directly.
    // In practice, you'd refactor run_analyze_core to return String instead of println.
    format!("{{\"status\":\"wasm_analysis_placeholder\",\"path\":\"{}\",\"loc\":{}}}", path, source.lines().count())
}

/// Extract fingerprint (WASM entry point).
#[cfg(feature = "wasm")]
#[wasm_bindgen]
pub fn fingerprint_wasm(path: &str, source: &str) -> String {
    let stem = std::path::Path::new(path)
        .file_stem()
        .and_then(|s| s.to_str())
        .unwrap_or("unknown");
    let fp = fingerprint::extract_fingerprint(source, stem);
    serde_json::to_string(&fp).unwrap_or_default()
}
