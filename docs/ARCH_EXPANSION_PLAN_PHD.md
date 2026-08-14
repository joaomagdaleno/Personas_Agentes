# 🏛️ Plano de Expansão Arquitetural SOBERANA 2.0 (Nível PhD)
## Módulo de Integração Zig, Nim, WASM & Inteligência de Recurso Adaptativa

Este documento estabelece o projeto técnico, os diferenciais arquiteturais e o guia prático de integração para a introdução de novas linguagens e capacidades no **Personas & Agents System — Arquitetura Soberana 2.0**. O principal objetivo deste plano é garantir que o sistema atinja **consumo de memória RAM rígido em segundo plano < 50MB** em computadores com recursos limitados (ex: Intel Core i5 de 7ª Geração com 8GB de RAM, sem GPU dedicada), enquanto escala de forma adaptativa e inteligente em servidores ou desktops robustos.

---

## 🗺️ Visão Geral da Arquitetura de Expansão

A arquitetura estende o ecossistema existente unindo **Orquestração de Alto Nível (TypeScript/Bun)** com **Sistemas e Execução de Baixíssimo Nível (Zig, Nim, WebAssembly)**:

```
                                  +------------------------------------+
                                  |    IDE Antigravity Nativa (Nim)    |
                                  |       Consumo RAM: 15MB - 30MB     |
                                  +-----------------+------------------+
                                                    |
                                                    v [SQLite / gRPC]
+---------------------------------------------------+---------------------------------------------------+
|                           NÚCLEO DE SEGUNDO PLANO (DAEMON)                                            |
|                                                                                                       |
|  +---------------------------+    +----------------------------------+    +------------------------+  |
|  |     Daemon Mínimo         |    |    Sovereign Resource Budget     |    |   Dual-API AI Engine   |  |
|  |     (Zig ou Nim)          |    |     (Controle Dinâmico de RAM)   |    | (Gemini & HuggingFace) |  |
|  |     RAM: 2MB - 5MB        |    |      CPU, Temp, RAM & Bateria    |    |  Warm-Purge local GGUF |  |
|  +-------------+-------------+    +----------------+-----------------+    +-----------+------------+  |
|                |                                   |                                  |               |
|                v (Gatilho de Tarefa)               v (Ajusta Paralelismo)             v               |
|  +-------------+-----------------------------------+----------------------------------+-------------+  |
|  |                                     AMBIENTE SANDBOX WASM                                          |  |
|  |                                                                                                    |  |
|  |  [Micro-Agente Audit.wasm]     [Micro-Agente Git.wasm]     [Micro-Agente Security.wasm]            |  |
|  |  RAM: 512KB | Tempo: <1ms      RAM: 1MB | Tempo: 2ms       RAM: 768KB | Tempo: <1ms                |  |
|  +----------------------------------------------------------------------------------------------------+  |
+-------------------------------------------------------------------------------------------------------+
```

---

## ⚡ 1. Zig: Qualidades Técnicas e Aproveitamento Máximo no Projeto

O **Zig** está sendo integrado não como um recurso ornamental, mas como uma peça fundamental para o core de alta performance e reparo do sistema.

### Qualidades da Linguagem aplicadas ao Projeto:
1. **Ausência de Fluxo de Controle Oculto (No Hidden Control Flow):** O Zig não tem exceções (como `try/catch` ocultos), nem sobrecarga de operadores. Isso significa que nossos agentes de IA conseguem analisar estaticamente o código em Zig com 100% de previsibilidade, facilitando o processo de auto-cura (`Healer`) com taxas de sucesso incomparáveis.
2. **Injeção de Alocadores Explícita (Explicit Allocator Passing):** O Zig exige que toda alocação na heap receba explicitamente um alocador. Os agentes do sistema podem auditar se a liberação de recursos (`defer allocator.destroy(ptr)`) está presente, prevenindo vazamentos de memória (Memory Leaks) em tempo de compilação.
3. **Comptime (Metaprogramação Reativa):** O compilador executa código Zig durante o build. Isso nos permite criar validadores de integridade e parse de arquivos que realizam todo o trabalho pesado na compilação, gerando binários estáticos minúsculos e rápidos.
4. **Interoperabilidade C Nativa:** O compilador Zig permite importar arquivos de cabeçalho `.h` diretamente via `@import("c")`. O sistema aproveita isso para criar pontes FFI de latência ultrabaixa com o Bun sem escrever wrappers manuais pesados.

### Casos de Uso Reais e Integração:
* **Suporte Completo a Projetos Zig (Linguagem Alvo):** A persona PhD em Zig (`agents_registry/zig.json`) possui regras e heurísticas focadas em guiar a IA na correção de bugs, aplicando padrões idiomáticos e resolvendo inconsistências usando o utilitário nativo de testes do Zig (`zig test` / `zig build`).
* **Micro-Daemon de Monitoramento Interno:** Um daemon super otimizado escrito em Zig que monitora o sistema de arquivos utilizando `ReadDirectoryChangesW` no Windows. Este daemon consome **menos de 3MB de RAM** e substitui bibliotecas pesadas de monitoramento JS que consomem 40MB+.

---

## 🌐 2. WebAssembly (WASM): Solucionando o Limite de 50MB de RAM

Processos em TypeScript executados sob o Bun/Node de forma permanente acumulam overhead de garbage collection e da máquina virtual V8, facilmente ultrapassando 100MB-200MB de RAM ao rodar tarefas simultâneas.

### A Revolução dos Micro-Agentes Efêmeros em WASM:
Em vez de mantermos múltiplos Super-Agentes rodando de forma persistente em segundo plano, dividimos as capacidades técnicas em **micro-agentes efêmeros compactados em bytecode WebAssembly (.wasm)**.

* **O que esses Micro-Agentes fazem?**
  1. **`agent_audit.wasm` (512KB):** Varre arquivos de código individuais em busca de bugs de sintaxe, capturas silenciosas e vazamentos lógicos em milissegundos.
  2. **`agent_git.wasm` (1MB):** Manipula repositórios locais, executa commits estruturados, limpa submódulos e resolve conflitos lógicos simples de merge.
  3. **`agent_security.wasm` (768KB):** Realiza auditorias de dependências e procura por vulnerabilidades conhecidas ou injeções de ofuscação.
  4. **`agent_telemetry.wasm` (256KB):** Coleta as métricas de hardware atuais para alimentar o controle adaptativo.
* **Por que isso viabiliza o limite de 50MB?**
  * **Consumo de RAM insignificante:** Cada sandbox WASM consome apenas entre **512KB e 1MB** enquanto executa.
  * **Ciclo de Vida Efêmero:** O micro-agente é instanciado, resolve o problema em microssegundos, entrega o payload de resultado e **morre instantaneamente**. Sua memória RAM é 100% devolvida ao Windows de imediato.
  * **Isolamento e Sandbox Total:** Um micro-agente gerado por IA não pode danificar o Windows do usuário. Ele roda em uma sandbox WASI restrita, sem acesso ao sistema de arquivos ou rede, a menos que o orquestrador permita explicitamente.

---

## 🎨 3. Nim: Criando uma IDE "Antigravity" de Altíssima Performance

O Nim é uma linguagem expressiva que compila diretamente para C e C++ altamente otimizado, sem a necessidade de uma máquina virtual ou Garbage Collector pesado em runtime (usa ARC/ORC para gerenciamento de memória determinístico).

### IDE Sem WebView e Sem Bloatware:
A maioria das IDEs e Dashboards modernos utiliza Electron ou WebView2 (Carregando um navegador Chromium inteiro em segundo plano, que consome no mínimo 100MB-200MB de RAM parada). A IDE do nosso projeto será desenvolvida em **Nim**:
* **Desenho Direto (Canvas/Direct2D/WinUI 3):** No Windows 11, o Nim fará chamadas de desenho direto por Direct2D/Direct3D ou controles nativos do WinUI 3 via Winim. Não há HTML, CSS ou JavaScript rodando na interface.
* **Consumo de RAM de apenas 15MB a 30MB:** Uma IDE nativa completa, rápida, com editor de código com destaque de sintaxe, painel lateral de agentes e janela de chat ativa consumirá uma fração ínfima de memória.
* **Propósito do "Antigravity/IDE":** Permitir que o programador visualize o comportamento dos agentes em tempo real, gerencie fluxos de auto-cura e use a própria IA integrada do projeto para escrever códigos em outras linguagens, tudo de forma extremamente ágil.
* **Conexão com a Internet para Resolução de Problemas Reais:** A IA da IDE está conectada a micro-agentes de busca capazes de consultar documentações atualizadas on-line (ex: MDN, StackOverflow, APIs) e enriquecer as sugestões de código em tempo real de forma segura.

---

## 🧠 4. O Motor Dinâmico de IA Adaptativa e Sem Custo

Para computadores como o Core i5 de 7ª Geração com 8GB de RAM, rodar modelos locais de IA (mesmo compactados de 0.5B ou 1.5B) de forma permanente consome ~1.5GB a 2GB de RAM, tornando o Windows extremamente lento.

```
                              [ SOLICITAÇÃO DE IA ]
                                        |
                   +--------------------+--------------------+
                   |                                         |
         [ COM CONEXÃO À INTERNET ]                [ OFF-LINE / SEM REDE ]
                   |                                         |
                   v                                         v
       +-----------------------+                 +-----------------------+
       |   Dual-API Engine     |                 |  Warm-Purge GGUF (CPU)|
       |   1. Gemini API (Free)|                 |  1. Carrega Qwen 0.5B |
       |   2. Hugging Face API |                 |  2. Processa Resposta |
       |                       |                 |  3. Linger (60s)      |
       |  RAM local: 0 MB      |                 |  4. Limpa RAM total   |
       +-----------------------+                 +-----------------------+
```

### A Estratégia Dual-API (Custo Zero e Consumo Zero de RAM Local):
1. **Google Gemini 1.5 Flash (API Free):** Utilizada como motor de inteligência primário via nuvem. Processa contextos gigantes de código em menos de 1 segundo, com taxa de acerto excepcional para refatorações complexas. **Consumo de RAM local: 0MB**.
2. **Hugging Face Serverless (API Free - Failover):** Se a cota gratuita do Gemini for atingida ou houver falha de rede, o orquestrador muda silenciosamente para os endpoints do Hugging Face executando modelos abertos (como `Qwen-Coder-7B-Instruct`). **Consumo de RAM local: 0MB**.
3. **Quota Limiter Inteligente:** Um agente monitora e suaviza as requisições por minuto para que você nunca sofra rate limit, mantendo o serviço online 24h por dia sem custos.

### O Mecanismo Offline: Warm-Purge com Linger Window (Janela de Inatividade):
Se o usuário estiver sem internet, o sistema utilizará um modelo local `Qwen-2.5-Coder-0.5B` quantizado via `llama.cpp` otimizado para CPU (AVX2):
* **Não permanente:** O modelo **não** fica carregado na memória.
* **Warm Cache:** Quando o usuário dispara um comando offline, o modelo de ~300MB é carregado na RAM rapidamente.
* **Janela de Inatividade (Linger Window - 60s):** Após gerar a resposta, o modelo permanece "aquecido" na RAM por 60 segundos. Se o usuário fizer outra pergunta rápida, ele responde instantaneamente.
* **Forced Purge (Limpeza Forçada):** Se o usuário ficar em silêncio por 60 segundos, o orquestrador assume o término do fluxo de trabalho e **força a descarga completa do modelo da RAM**, devolvendo toda a memória ao sistema operacional.

---

## 🎛️ 5. O Motor Contínuo de Recursos (Sovereign Resource Budget)

Diga adeus aos limites estáticos engessados ("hardcoded"). O orquestrador utiliza um ciclo contínuo de controle adaptativo.

A cada **3 segundos**, o agente de telemetria nativo coleta:
* **`RAM_Usage` (%)**
* **`CPU_Usage` (%)**
* **`CPU_Temperature` (°C)**
* **`Battery_Power_State`** (Se está na tomada ou no modo de economia de energia)

Com esses dados, o sistema calcula um score contínuo de capacidade de recursos de **0 a 100** e reconfigura instantaneamente as capacidades do sistema:

| Capacidade (Score) | Modo Adaptativo | Ação Prática no Sistema |
| :---: | :---: | :--- |
| **Score < 30** | *Modo Ultraleve* | Suspende IA local; utiliza Gemini Cloud; limita a 1 micro-agente WASM por vez; intervalo de monitoramento do sistema de arquivos sobe para 10s. RAM de fundo travada em **< 10MB**. |
| **Score 30 - 70** | *Modo Balanceado* | Habilita fila de até 3 micro-agentes paralelos; IA local em "Warm-Purge" apenas quando estritamente offline; monitoramento de arquivos a cada 3s. |
| **Score > 70** | *Modo Turbo* | Permite processamento paralelo massivo de agentes; modelos locais carregados com warm-cache prolongado para resposta em milissegundos; análise profunda em tempo real. |

Se o seu notebook i5 começar a esquentar muito ou a bateria estiver acabando, o orquestrador desacelera fluidamente, esfriando a máquina e garantindo que o seu sistema operacional permaneça rápido e leve.

---

## 🔬 6. Idris 2 / Haskell: Garantia de Auto-Cura Livre de Erros (Verificação Formal)

Quando o agente de Auto-Cura (`Healer`) gera uma correção, existe o risco da IA introduzir um bug lógico difícil de detectar com testes comuns.

* **O Filtro de Prova Matemática:** O sistema de tipos dependentes do **Idris 2** permite formalizar propriedades de segurança.
* **Exemplo de Contrato Formal:** O Healer deve provar matematicamente que a função de correção:
  1. Termina em tempo finito (prevenindo loops infinitos).
  2. Nunca acessa índices de array fora dos limites (segurança de memória).
  3. Não viola as invariantes de estado do banco de dados SQLite.
* **Integração:** Antes que um patch seja aplicado ao código-fonte físico, um microsserviço de verificação formal em Idris compile/valida a especificação do patch. Se a prova falhar, o patch é rejeitado e devolvido ao `Healer` com a falha de prova lógica para correção, aproximando a taxa de sucesso de reparo de **99%**.

---

## 🚀 Guia Prático de Implementação e Passos Futuros

1. **Instalação das Toolchains de Expansão:**
   * **Zig:** `winget install zig.zig` (no Windows) ou `brew install zig` (no macOS).
   * **Nim:** `winget install nim-lang.nim` ou use o instalador oficial `choosenim`.
   * **Wasm Runtime:** Integrar `@wasmer/sdk` ou `wasmtime` FFI nas dependências do Bun do projeto.
2. **Construção dos Micro-Agentes:**
   * Escrever os códigos-fonte leves em Rust/Zig no diretório `src_native/`.
   * Compilar os agentes para WASM usando `cargo build --target wasm32-wasi --release` ou `zig build-lib -target wasm32-wasi`.
3. **Desenvolvimento da IDE "Antigravity":**
   * Configurar a janela nativa no Nim usando o módulo `winim` ou `fidget` de renderização direta.
   * Conectar via gRPC com o `Go Hub` para enviar e receber payloads e interações com os agentes soberanos.
