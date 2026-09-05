# 🏛️ Personas & Agentes (PSA) — Arquitetura Soberana 2.0

> **Ecossistema Desktop & Server Local, Soberano e Poliglota para Agentes de IA Autônomos de Alta Performance.**
>
> *Construído com C# / WinUI 3 (Fluent Design Nativo sem WebView2), Bun / TypeScript Micro-Kernel, Go Hub (gRPC/mTLS), Rust SIMD, Zig FFI e WebAssembly (WASI).*

---

## 🌟 Destaques Arquiteturais da Versão 2.0

- **🖥️ Interface Desktop 100% Nativa (WinUI 3)**:
  - Interface gráfica desenvolvida inteiramente em XAML/C# nativo (.NET 8) com Fluent Design sem dependência de Chromium / WebView2.
  - **Self-Contained**: Empacotamento com todas as dependências nativas do Windows App SDK integradas na instalação.
  - **Fluent Assistant Markdown**: Renderizador com cartões de código escuros, monospaçado, botão de 1-clique para copiar, **destaque de sintaxe Diff (+ verde / - vermelho)** e rolagem interna (`MaxHeight="400"`).
  - **Controles Interativos**: Botão de **Cancelar Turno 🛑** em tempo real, botão **Baixar Modelo 📥** com `ProgressBar` nativa e indicador do motor local (`🟢 SLM: Warmed` vs `❄️ SLM: Purged`).
- **🧠 Orquestração Reativa & Roteamento Cascade (DualAPIEngine & Warm-Purge)**:
  - **Cascade Cloud-First**: Primário via Gemini 1.5 Flash (API Free) / Hugging Face Serverless (Failover) com consumo local de RAM **0MB**.
  - **SLM Local Offline (Warm-Purge)**: Modelo local GGUF (`qwen2.5-coder-1.5b`) ativado apenas em inatividade de rede. Possui janela de inatividade (*Linger Window* de 60s) e **purga total forçada da memória RAM (0MB)** ao ficar inativo.
- **🌐 Micro-Agentes WASM Efêmeros (WASI)**:
  - 6 Micro-Agentes em bytecode `.wasm` compilados nativamente em Zig (`agent_audit.zig`, `agent_security.zig`, `agent_git.zig`, `agent_telemetry.zig`, `agent_database.zig`, `agent_linter.zig`).
  - Alocação direta de memória linear (`WebAssembly.Memory`) com destruição instantânea do sandbox e limite dinâmico de concorrência gerido pelo `SovereignResourceBudget`.
- **🔬 Provas Formais Matemáticas (Idris 2 Safety Gate)**:
  - Verificação de patches de auto-cura contra 4 contratos matemáticos: **Terminação Finita de Loops**, **Limites de Memória/Array**, **Invariantes do SQLite (`WHERE` em DELETE/UPDATE)** e **Segurança de Tipos/Null**.
  - Geração dinâmica de especificações `.idr` sob demanda e verificação física com o compilador `idris2`.
- **🔐 Validação Criptográfica SHA-256 de Modelos**:
  - Verificação de hashes SHA-256 pré e pós-download de todos os modelos `.gguf` no `scripts/download_model.ts` para evitar corrupção de pesos.
- **🗄️ Persistência Relacional & Compactação SQLite (`system_vault.db`)**:
  - Gravação e carregamento de trajetórias completas (Prompts, Raciocínio, Tool Calls, Resultados de Ferramentas e Provas Formais) com ferramenta de desfragmentação `compaction.vacuum_db`.
- **🚀 CI/CD & Releases Automáticas no GitHub**:
  - Workflow no GitHub Actions com cache de dependências .NET, cancelamento de builds obsoletos (`cancel-in-progress`) e **publicação automática do instalador `PersonasAgentes-Setup-v2.0.exe` em Releases Oficiais do GitHub** ao criar tags `v*`.

---

## 🛠️ Requisitos e Instalação

### 📦 Instalação no Windows (x64)
1. Baixe o instalador oficial `PersonasAgentes-Setup-v2.0.exe` na aba de [Releases do Repositório](https://github.com/joaomagdaleno/Personas_Agentes/releases/latest).
2. Execute o instalador e siga as instruções do assistente Inno Setup.
3. Abra o atalho **PSA Agent Workbench** no Menu Iniciar ou Área de Trabalho.

---

## 🚀 Execução via Linha de Comando e Desenvolvimento (CLI)

```powershell
# 1. Instalar dependências do ecossistema Bun
bun install

# 2. Verificar e auto-compilar binários nativos (Go, Rust, Zig FFI e WASM)
bun run ensure-binaries

# 3. Baixar os pesos locais do modelo de IA recomendado (~1.0 GB)
bun run download-model --model 1.5b

# 4. Iniciar o Servidor Micro-Kernel PSA na porta 3080 e abrir a interface WinUI 3
bun run ui

# 5. Executar a bateria completa de 124 testes unitários e E2E
bun test
```

---

## 📁 Estrutura do Projeto

```
.
├── .github/workflows/         # Pipeline CI/CD com Inno Setup e GitHub Releases
├── agents_registry/            # Catálogo e manifestos das 8 Super Personas
├── bin/                        # Executáveis e aceleradores nativos compilados
├── docs/                       # Documentação arquitetural PhD e portais HTML
├── installer/                  # Scripts de compilação do instalador Inno Setup (.iss)
├── models/                     # Diretório reservado para pesos locais .gguf
├── scripts/                    # Scripts de build, empacotamento, WASM e downloaders
├── src_local/                  # Código-fonte TypeScript / Bun (Micro-Kernel PSA)
│   ├── cli/                    # CLI Soberana e comandos PSA
│   ├── core/                   # Orquestrador, EventBus e Hub gRPC
│   ├── engines/                # Motores de Diagnóstico, AST e Verificação Formal
│   ├── psa/                    # Micro-Kernel, Agent Loop, Plugins e Personas
│   ├── server/                 # PSA Server HTTP/SSE streaming (Porta 3080)
│   └── utils/                  # Runtime WASM, Warm-Purge SLM e ZvecGrep RAG
└── src_native/                 # Componentes nativos compilados
    ├── analyzer/               # Motor de auditoria SIMD em Rust
    ├── formal/                 # Especificações de provas formais em Idris 2
    ├── hub/                    # Go Hub (gRPC, mTLS, Tree-Sitter AST Scanner)
    ├── wasm_agents/            # Fontes de micro-agentes nativos em Zig (.zig)
    ├── winui/                  # Aplicação Desktop Nativa WinUI 3 C# / .NET 8
    └── zig_analyzer/           # File Watcher Daemon e FFI nativa em Zig
```

---

## 👥 As 8 Super Personas do PSA

| Persona | Categoria | Função na Bancada |
| :--- | :--- | :--- |
| 🧠 **Strategic Cognitive Architect** | AI/SLM & Reasoning | Raciocínio cognitivo de alto nível, planejamento e reflexão `<think>`. |
| 📊 **Audit Code Guardian** | Diagnostics & AST | Diagnóstico 360° do sistema, complexidade ciclomática/cognitiva e métricas. |
| 🛡️ **Security Cloud Guardian** | Safety & Guard | Varredura de vulnerabilidades, busca de ofuscamento e segredos hardcoded. |
| 📐 **Architecture Types** | AST & Topology DNA | Mapeamento de genoma de código, dependências e grafo de conectividade. |
| 🧪 **Resilience Healing Architect** | Idris 2 Safety Gate | Geração de auto-cura (*auto-healing*) validada por provas formais matemáticas. |
| ⚡ **Sys Perf Architect** | WASM Governance | Governança de memória RAM, concorrência e auditoria de micro-agentes WASM. |
| 🔄 **Sync DevOps Architect** | Git Orchestrator | Automação de commits semânticos, resolução de conflitos, webhooks e PRs. |
| 🎨 **UI/UX Architect** | PSA Native Desktop | Gerenciamento da interface gráfica desktop WinUI 3 e streaming SSE. |

---

## 📜 Licença

Distribuído sob a licença MIT. Veja `LICENSE` para mais informações.

*Construído com Bun, C# / WinUI 3, Go, Rust SIMD, Zig e Idris 2.* 🏛️
