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
pub mod scanner;

#[cfg(feature = "wasm")]
pub mod wasm_bridge;

// Re-export common types
pub use analysis::{AnalysisResult, FunctionMetric, run_analyze_core, run_fingerprint_core};

use std::ffi::CStr;
use std::os::raw::c_char;

/// ⚡ Exporte FFI C-ABI para Bun (bun:ffi).
/// High Security / FFI Memory Safety: Safe raw pointer dereferencing contract (CWE-119/CWE-242).
/// Calculates fast cyclomatic complexity of code directly from memory.
///
/// # Safety
/// The `code_ptr` must be a valid null-terminated C string or null.
#[unsafe(no_mangle)]
pub unsafe extern "C" fn calculate_complexity(code_ptr: *const c_char) -> i32 {
    if code_ptr.is_null() {
        return 1;
    }
    // SAFETY: caller must ensure code_ptr points to a valid null-terminated C string
    let c_str = unsafe { CStr::from_ptr(code_ptr) };
    let code = match c_str.to_str() {
        Ok(s) => s,
        Err(_) => return 1,
    };

    // Contagem simples de bifurcações (if/for/while/catch/case)
    let keywords = ["if ", "if(", "for ", "for(", "while ", "while(", "catch ", "catch(", "case "];
    let mut count = 1;
    for kw in keywords {
        count += code.matches(kw).count() as i32;
    }
    count
}

/// ⚡ Exporte FFI C-ABI para Bun (bun:ffi).
/// High Security / FFI Memory Safety: Safe raw pointer dereferencing contract (CWE-119/CWE-242).
/// Calculates fast 64-bit FNV1a hash of code buffer.
///
/// # Safety
/// The `code_ptr` must be a valid null-terminated C string or null.
#[unsafe(no_mangle)]
pub unsafe extern "C" fn fast_hash(code_ptr: *const c_char) -> u64 {
    if code_ptr.is_null() {
        return 0;
    }
    // SAFETY: caller must ensure code_ptr points to a valid null-terminated C string
    let c_str = unsafe { CStr::from_ptr(code_ptr) };
    let bytes = c_str.to_bytes();

    let mut hasher = 0xcbf29ce484222325u64;
    for &b in bytes {
        hasher ^= b as u64;
        hasher = hasher.wrapping_mul(0x100000001b3);
    }
    hasher
}
