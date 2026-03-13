# Personas & Agents System

Bem-vindo ao sistema de **Personas & Agents**! Este projeto utiliza uma arquitetura híbrida de alta performance:

- **Native Performance**: Heavy logic (Analysis, Metrics, AI) moved to Rust and Go.
- **Sovereign Brain**: Fully native AI reasoning and knowledge graph in Rust (Model: Qwen2.5-Coder-0.5B via Candle).
  - **Knowledge Graph**: Robust `petgraph`-based representation of the codebase.
  - **Semantic Reasoning**: Context-aware analysis.

| Persona | Foco Principal | Especialidade PhD | Emo | Stack Base |
| --- | --- | --- | --- | --- |
| **Bolt** | Performance, V8/JIT, Node Core | Otimização Micro-Arquitetural | ⚡ | TypeScript |
| **Sentinel** | Segurança, Criptografia, Tokens | Vulnerabilidades Ativas | 🛡️ | TypeScript |
| **Architect** | Design System, Escalabilidade | Padrões de Microserviços | 📐 | TypeScript |
| **Director** | Orquestração Mestre | Visão Sistêmica | 🏛️ | TypeScript |
| **Voyager** | Modernização, Migrações | Refatoração de Legados | 🧭 | Python |
| **Scale** | Escalabilidade Elástica | Microserviços e Filas | ⚖️ | Go |

- **High Performance**: sub-100ms reasoning for local tasks.
- **Go Hub Proxy**: Central persistent service for gRPC orchestration and file persistence.
- **TypeScript Intelligence**: Lean agents focused on high-level strategy and collaboration.

## 🛠️ Prerequisites

- **Go 1.22+**: For the Hub Proxy.
- **Rust (Stable)**: For the Analyzer and Sovereign Brain.
- **Node.js (Bun/NPM)**: For the Agent Orchestration.
- **Protoc & Buf**: For gRPC development.

## 🚀 Como Configurar (Setup Inicial)

1. **Instale as dependências Node/Bun:**
   Na raiz do projeto, rode:

   ```bash
   bun install
   ```

2. **Compile os binários nativos:**
   Os adaptadores de análise utilizam binários em Rust e Go:

   ```bash
   bun run ensure-binaries
   ```

   *Certifique-se de ter `cargo` (Rust) e `go` instalados.*

## 🔐 Variáveis de Ambiente

Copie `.env.example` para `.env` e ajuste conforme necessário:

```bash
cp .env.example .env
```

| Variável | Default | Descrição |
| --- | --- | --- |
| `NODE_ENV` | `development` | Modo de execução (`development` / `production`) |
| `DIAGNOSTIC_TEST_MODE` | `0` | Modo de teste do diagnóstico (`1` = sem side-effects) |
| `HUB_GRPC_HOST` | `localhost:50051` | Endereço do Go Hub Proxy (gRPC) |
| `ANALYZER_GRPC_HOST` | `localhost:50052` | Endereço do Rust Analyzer Sidecar (gRPC) |
| `LOG_LEVEL` | `info` | Nível de logging Winston (`error` / `warn` / `info` / `debug`) |

## ⚡ Como Usar (Comandos Principais)

Todos os fluxos vitais do sistema estão encapsulados em scripts do `bun`.

- **Executar Diagnóstico do Sistema:** (O Orquestrador escaneia todo o projeto, levanta hotspots e gera os relatórios Markdown de saúde).

  ```bash
  bun run diagnostic
  ```

- **Rodar os Testes:**

  ```bash
  bun test
  ```

- **Verificação Completa (Testes + Diagnóstico):**

  ```bash
  bun run verify-all
  ```

- **Limpeza e Manutenção (Opcionais):**
  Existem comandos para arquitetar novos testes ou limpar códigos usando as Personas:

  ```bash
  bun run generate-tests
  bun run git-doctor
  ```

---
