# 🏛️ Personas & Agents System — Arquitetura Soberana 2.0

Sistema avançado de **Orquestração Multi-Agente de Alta Performance** com arquitetura soberana híbrida (TypeScript, Bun, Go e Rust SIMD/FFI).

---

## 🌌 Visão Geral da Arquitetura (8 Super Personas)

Toda a inteligência e capacidades do sistema foram consolidadas sob **8 Super Personas Soberanas** organizadas por domínio técnico em `src_local/engines/`:

| Super Persona | Serviço Principal | Domínio & Responsabilidades | Stack Base |
| :--- | :--- | :--- | :---: |
| 🎨 **UI/UX Architect** | [`ui_ux_architect_service.ts`](file:///c:/Users/joaomagdaleno/Documents/GitHub/Personas_Agentes/src_local/engines/reporting/ui_ux_architect_service.ts) | Relatórios, Portais HTML/React, Formatadores e Renderizadores Markdown. | TypeScript |
| 🛡️ **Security Cloud Guardian** | [`security_cloud_guardian_service.ts`](file:///c:/Users/joaomagdaleno/Documents/GitHub/Personas_Agentes/src_local/engines/security/security_cloud_guardian_service.ts) | Validação de Contexto, Detecção de Vulnerabilidades, Caça e Limpeza de Ofuscação. | TypeScript |
| 📐 **Architecture Types** | [`architecture_types_service.ts`](file:///c:/Users/joaomagdaleno/Documents/GitHub/Personas_Agentes/src_local/engines/analysis/architecture_types_service.ts) | AST Intelligence, Indexador gRPC, Perfilador de DNA, Classificador de Componentes e Análise de Cobertura. | TypeScript / Rust |
| ⚡ **Sys Perf Architect** | [`sys_perf_architect_service.ts`](file:///c:/Users/joaomagdaleno/Documents/GitHub/Personas_Agentes/src_local/engines/maintenance/sys_perf_architect_service.ts) | Telemetria, Coleta de Saúde de Processos, Governança de Recursos e Fila de Tarefas. | TypeScript |
| 🧠 **Strategic Cognitive Architect** | [`strategic_cognitive_architect_service.ts`](file:///c:/Users/joaomagdaleno/Documents/GitHub/Personas_Agentes/src_local/engines/strategic/strategic_cognitive_architect_service.ts) | Raciocínio Cognitivo SLM, Classificação de Atividades e Subsistema Neural MicroGPT. | TypeScript |
| 📊 **Audit Code Guardian** | [`audit_code_guardian_service.ts`](file:///c:/Users/joaomagdaleno/Documents/GitHub/Personas_Agentes/src_local/engines/diagnostics/audit_code_guardian_service.ts) | Auditoria de Código, Grafo de Dependências, Avaliadores de Maturidade e Scorecard de Risco. | TypeScript |
| 🔄 **Sync DevOps Architect** | [`sync_devops_architect_service.ts`](file:///c:/Users/joaomagdaleno/Documents/GitHub/Personas_Agentes/src_local/engines/automation/sync_devops_architect_service.ts) | Resolução de Conflitos Git, Limpeza de Submódulos, Manutenção PhD e Descobrimento Remoto. | TypeScript / Go |
| 🧪 **Resilience Healing Architect** | [`resilience_healing_architect_service.ts`](file:///c:/Users/joaomagdaleno/Documents/GitHub/Personas_Agentes/src_local/engines/healing/resilience_healing_architect_service.ts) | Auto-Cura (Healer), Registro SQLite de Histórico, Transações Atômicas e FFI Nativo. | TypeScript / Bun |

---

## ⚙️ Tecnologias & Motores Nativos

- **Native Rust SIMD/FFI (`src_native/`)**: Análise AST ultra-rápida, hash de alta velocidade e scoring estrutural.
- **Go Hub Proxy (`hub.exe`)**: Orquestração gRPC persistente, comunicação de serviços e bridge.
- **TypeScript Intelligence (`src_local/`)**: Executado nativamente via **Bun** para máxima velocidade de I/O.

---

## 🛠️ Pré-requisitos

- **Node.js / Bun 1.1+**
- **Go 1.22+** (Para compilação do Hub Proxy)
- **Rust (Cargo Stable)** (Para compilação dos módulos FFI)

---

## ⚡ Comandos Principais

```bash
# Instalar dependências
bun install

# Compilar binários nativos (Rust & Go)
bun run ensure-binaries

# Executar a Suíte Completa de Testes (82+ testes unitários)
bun test

# Executar o Diagnóstico Completo do Sistema
bun run diagnostic

# Executar Verificação Geral de Saúde
bun run verify-all
```

---

## 🔐 Configuração de Ambiente

Copie `.env.example` para `.env`:

```bash
cp .env.example .env
```

| Variável | Default | Descrição |
| :--- | :--- | :--- |
| `NODE_ENV` | `development` | Ambiente de execução (`development` / `production`) |
| `HUB_GRPC_HOST` | `localhost:50051` | Endereço gRPC do Go Hub Proxy |
| `LOG_LEVEL` | `info` | Nível de log (`info`, `debug`, `warn`, `error`) |
