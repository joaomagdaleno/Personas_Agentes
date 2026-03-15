/**
 * 🌐 EnvGate — Central de Configurações de Ambiente
 * Centraliza endereços de rede e portas para evitar hardcoding.
 */
export const ENV_GATE = {
    // gRPC Hub (Go)
    HUB_GRPC_HOST: "localhost:50051",
    
    // Dashboard SSE / HTTP (Go Hub)
    HUB_HTTP_URL: "http://localhost:8080",
    
    // Rust Sidecar gRPC
    RUST_SIDECAR_ADDR: "127.0.0.1:50052",
    
    // Dashboard Dev Server (Bun)
    DASHBOARD_DEV_PORT: 5173
};
