// Library entry point for WASM builds.
// Re-exports core modules needed by the WASM bridge.

pub mod fingerprint;
pub mod dependencies;

#[cfg(feature = "wasm")]
pub mod wasm_bridge;
