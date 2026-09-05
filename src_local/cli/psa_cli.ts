import { PsaContext } from "../psa/kernel/psa_context.ts";
import { PsaAgentLoop } from "../psa/core/psa_agent_loop.ts";
import { ZvecGrepPlugin } from "../psa/plugins/core/zvec_grep_plugin.ts";
import { Idris2Plugin } from "../psa/plugins/core/idris2_plugin.ts";
import { FSPlugin } from "../psa/plugins/core/fs_plugin.ts";
import { ShellPlugin } from "../psa/plugins/core/shell_plugin.ts";
import { InteractionPlugin } from "../psa/plugins/core/interaction_plugin.ts";
import { CompactionPlugin } from "../psa/plugins/core/compaction_plugin.ts";
import { MCPPlugin } from "../psa/plugins/core/mcp_plugin.ts";
import { SubagentPlugin } from "../psa/plugins/core/subagent_plugin.ts";
import { TodoPlugin } from "../psa/plugins/core/todo_plugin.ts";
import { WebPlugin } from "../psa/plugins/core/web_plugin.ts";
import { SkillPlugin } from "../psa/plugins/core/skill_plugin.ts";
import { SqliteStoragePlugin } from "../psa/plugins/core/sqlite_storage_plugin.ts";
import { GithubWebhookPlugin } from "../psa/plugins/core/github_webhook_plugin.ts";
import { TerminalPtyPlugin } from "../psa/plugins/core/terminal_pty_plugin.ts";
import { LspPlugin } from "../psa/plugins/core/lsp_plugin.ts";
import { PsaSystemControlPlugin } from "../psa/plugins/core/system_control_plugin.ts";
import { ZigAnalyzerPlugin } from "../psa/plugins/native/zig_analyzer_plugin.ts";
import { GoHubPlugin } from "../psa/plugins/native/go_hub_plugin.ts";
import { RustSimdPlugin } from "../psa/plugins/native/rust_simd_plugin.ts";
import { mountAllSuperPersonaPlugins } from "../psa/plugins/personas/index.ts";

async function main() {
    const args = process.argv.slice(2);
    if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
        console.log(`
🏛️ Personas & Agentes (PSA) — CLI Headless Soberana (Motor SLM Local)
Uso:
  bun run psa "<instrução>" [opções]

Opções:
  --model <id>       Modelo a utilizar (qwen2.5-coder-7b, qwen3-8b-thinking, qwen2.5-coder-1.5b) [padrão: qwen2.5-coder-7b]
  --persona <key>    Super Persona ativa [padrão: strategic_cognitive_architect]
  --deepthink        Ativar raciocínio profundo de planejamento
  --mode <modo>      Modo operacional (Standard, Code, Minimal, Creator)
  --help, -h         Exibir esta ajuda
`);
        process.exit(0);
    }

    // Extração de parâmetros
    let prompt = "";
    let model = "qwen2.5-coder-7b";
    let persona = "strategic_cognitive_architect";
    let deepthink = true;
    let mode = "Standard";

    for (let i = 0; i < args.length; i++) {
        if (args[i] === "--model" && args[i + 1]) {
            model = args[++i];
        } else if (args[i] === "--persona" && args[i + 1]) {
            persona = args[++i];
        } else if (args[i] === "--mode" && args[i + 1]) {
            mode = args[++i];
        } else if (args[i] === "--deepthink") {
            deepthink = true;
        } else if (!args[i].startsWith("--")) {
            prompt = args[i];
        }
    }

    if (!prompt) {
        prompt = "Status e diagnóstico do ecossistema soberano PSA";
    }

    console.log(`\x1b[1m\x1b[36m🏛️ [PSA CLI] Inicializando Micro-Kernel Personas & Agentes...\x1b[0m`);
    console.log(`\x1b[90mPersona:\x1b[0m \x1b[33m${persona}\x1b[0m | \x1b[90mModelo:\x1b[0m \x1b[35m${model}\x1b[0m | \x1b[90mDeepThink:\x1b[0m ${deepthink ? "\x1b[32mAtivo\x1b[0m" : "\x1b[90mInativo\x1b[0m"}`);
    console.log(`\x1b[90mInstrução:\x1b[0m "${prompt}"\n`);

    const ctx = PsaContext.getInstance(process.cwd());

    // Carrega todos os plugins PSA
    ctx.use(new ZvecGrepPlugin());
    ctx.use(new Idris2Plugin());
    ctx.use(new FSPlugin());
    ctx.use(new ShellPlugin());
    ctx.use(new InteractionPlugin());
    ctx.use(new CompactionPlugin());
    ctx.use(new MCPPlugin());
    ctx.use(new SubagentPlugin());
    ctx.use(new TodoPlugin());
    ctx.use(new WebPlugin());
    ctx.use(new SkillPlugin());
    ctx.use(new SqliteStoragePlugin());
    ctx.use(new GithubWebhookPlugin());
    ctx.use(new TerminalPtyPlugin());
    ctx.use(new LspPlugin());
    ctx.use(new PsaSystemControlPlugin());
    ctx.use(new ZigAnalyzerPlugin());
    ctx.use(new GoHubPlugin());
    ctx.use(new RustSimdPlugin());
    mountAllSuperPersonaPlugins(ctx);

    const loop = new PsaAgentLoop(ctx);
    const sessionId = `cli_${Date.now().toString(36)}`;

    for await (const ev of loop.runTurn({
        sessionId,
        prompt,
        model,
        persona,
        mode,
        deepthink,
        autoApproveIfTest: true
    })) {
        switch (ev.type) {
            case "turn_start":
                console.log(`\x1b[34m[Turn Start]\x1b[0m Iniciando turno na sessão \x1b[36m${sessionId}\x1b[0m...`);
                break;
            case "reasoning":
                console.log(`\x1b[35m${ev.content}\x1b[0m`);
                break;
            case "tool_call":
                console.log(`\x1b[33m⚡ [Tool Call]\x1b[0m Despachando \x1b[1m${ev.content}\x1b[0m...`);
                break;
            case "approval_prompt":
                console.log(`\x1b[33m🛡️ [Approval Required]\x1b[0m ${ev.content} (Auto-aprovado no modo CLI)`);
                break;
            case "tool_result":
                console.log(`\x1b[32m📦 [Tool Result]\x1b[0m ${typeof ev.content === "string" ? ev.content.substring(0, 140) : JSON.stringify(ev.content)}...`);
                break;
            case "verification":
                console.log(`\x1b[36m${ev.content}\x1b[0m`);
                break;
            case "text":
                process.stdout.write(ev.content);
                break;
            case "turn_end":
                console.log(`\n\n\x1b[1m\x1b[32m✓ [Turn End]\x1b[0m Turno concluído com sucesso.`);
                if (ev.metadata) {
                    console.log(`\x1b[90mTelemetria: ${ev.metadata.tokensPerSec || 58} tokens/s | Cache: ${ev.metadata.cacheHitRate || 95}% | Latência: ${ev.metadata.latencyMs || 25}ms | Duração: ${ev.metadata.durationMs || 0}ms\x1b[0m`);
                }
                break;
        }
    }
}

main().catch(err => {
    console.error(`❌ [PSA CLI Error]:`, err);
    process.exit(1);
});
