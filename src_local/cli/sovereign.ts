import { PsaContext } from "../psa/kernel/psa_context.ts";
import { PsaSystemControlPlugin } from "../psa/plugins/core/system_control_plugin.ts";
import { ZigAnalyzerPlugin } from "../psa/plugins/native/zig_analyzer_plugin.ts";
import { GoHubPlugin } from "../psa/plugins/native/go_hub_plugin.ts";
import { RustSimdPlugin } from "../psa/plugins/native/rust_simd_plugin.ts";
import { mountAllSuperPersonaPlugins } from "../psa/plugins/personas/index.ts";
import { DatabaseHub } from "../core/database_hub.ts";
import * as os from "node:os";

async function getPsaContext(): Promise<PsaContext> {
    const ctx = PsaContext.getInstance(process.cwd());
    if (ctx.plugins.list().length === 0) {
        ctx.use(new PsaSystemControlPlugin());
        ctx.use(new ZigAnalyzerPlugin());
        ctx.use(new GoHubPlugin());
        ctx.use(new RustSimdPlugin());
        mountAllSuperPersonaPlugins(ctx);
    }
    return ctx;
}

async function main() {
    const args = process.argv.slice(2);
    const command = args[0] || "status";

    switch (command.toLowerCase()) {
        case "status":
            await printStatus();
            break;
        case "audit":
            await runAudit(args.includes("--staged"), args.includes("--strict"));
            break;
        case "clean":
            await runClean();
            break;
        case "benchmark":
            await runBenchmark();
            break;
        case "watch":
            await runWatch();
            break;
        case "download-model":
            await runDownloadModel(args.slice(1));
            break;
        case "help":
        default:
            printHelp();
            break;
    }
}

async function printStatus() {
    console.log("\n==================================================================");
    console.log("             🏛️  PERSONAS AGENTES — STATUS SOBERANO (PSA)        ");
    console.log("==================================================================\n");

    const ctx = await getPsaContext();
    const govRes = await ctx.tools.executeTool("native.governance_status", {});
    const gov = govRes.result as any;

    console.log("📊 GOVERNANÇA DE HARDWARE (PSA):");
    console.log(`   • Plataforma / Arquitetura: ${os.platform()} (${os.arch()})`);
    console.log(`   • Cores de CPU:             ${gov?.cpuCores || os.cpus().length}`);
    console.log(`   • Limite de RAM:            ${gov?.totalMemoryGb?.toFixed(2) || "16.00"} GB (Livre: ${gov?.freeMemoryGb?.toFixed(2) || "?"} GB)`);
    console.log(`   • Modo de Execução:         ${gov?.status || "SOVEREIGN_OPTIMIZED"}`);
    
    console.log("\n🔌 MICRO-KERNEL PSA & PLUGINS:");
    const plugins = ctx.plugins.listDetailed();
    console.log(`   • Plugins Carregados:       ${plugins.length} plugins ativos`);
    console.log(`   • Ferramentas Registradas:  ${ctx.tools.list().length} ferramentas disponíveis`);
    for (const p of plugins.slice(0, 8)) {
        console.log(`     - [${p.name}] v${p.version}: ${p.toolsCount} ferramentas`);
    }
    if (plugins.length > 8) {
        console.log(`     ... e mais ${plugins.length - 8} plugins.`);
    }

    console.log("\n⚙️ BINÁRIOS NATIVOS & ACELERADORES:");
    const isWin = os.platform() === "win32";
    const goHubName = isWin ? "hub.exe" : "hub";
    const rustSidecarName = isWin ? "analyzer_lib.dll" : os.platform() === "darwin" ? "libanalyzer_lib.dylib" : "libanalyzer_lib.so";

    const goHubExists = await Bun.file(`bin/${goHubName}`).exists() ||
                        await Bun.file(goHubName).exists() ||
                        await Bun.file(`src_native/hub/${goHubName}`).exists();

    const rustSidecarExists = await Bun.file(`bin/${rustSidecarName}`).exists() ||
                              await Bun.file(rustSidecarName).exists() ||
                              await Bun.file(`src_native/analyzer/target/release/${isWin ? 'analyzer.exe' : 'analyzer'}`).exists() ||
                              await Bun.file(`src_native/analyzer/target/release/${rustSidecarName}`).exists();

    console.log(`   • Go Hub gRPC (${goHubName}):         ${goHubExists ? "✅ Presente" : "❌ Ausente"}`);
    console.log(`   • Rust SIMD (${rustSidecarName}):    ${rustSidecarExists ? "✅ Presente" : "❌ Ausente"}`);
    
    console.log("\n🏛️ BANCO DE DADOS VAULT (SQLite):");
    const dbPath = "system_vault.db";
    const dbExists = await Bun.file(dbPath).exists();
    if (dbExists) {
        const stat = await Bun.file(dbPath).stat();
        console.log(`   • Status:                   ✅ Operacional (${(stat.size / 1024).toFixed(1)} KB)`);
        const dbHub = DatabaseHub.getInstance(process.cwd());
        const historyCount = dbHub.query<{ total: number }>("SELECT COUNT(*) as total FROM health_history")[0]?.total || 0;
        console.log(`   • Histórico de Saúde:       ${historyCount} registros gravados`);
    } else {
        console.log(`   • Status:                   ⚠️ Não Inicializado`);
    }
    console.log("\n==================================================================\n");
}

async function runAudit(staged: boolean, strict: boolean) {
    const ctx = await getPsaContext();
    if (staged) {
        console.log(`\n🚀 [PSA] Executando auditoria staged via ferramenta audit.staged...`);
        const res = await ctx.tools.executeTool("audit.staged", { dryRun: false });
        const findings = (res.result as any)?.findings || [];
        console.log(`📊 [PSA] Problemas detectados: ${findings.length}`);
    } else {
        console.log(`\n🚀 [PSA] Executando auditoria completa via ferramenta system.run_diagnostic...`);
        const res = await ctx.tools.executeTool("system.run_diagnostic", {
            skipTests: !strict,
            dryRun: false
        });
        console.log(`✨ [PSA] Resultado: ${(res.result as any)?.summary || "Concluído"}`);
        console.log(`🩺 [PSA] Health Score: ${(res.result as any)?.healthScore || 100}%`);
    }
}

async function runClean() {
    console.log("\n🧹 [CLI] Executando Limpeza Soberana de Disco...");
    const dbHub = DatabaseHub.getInstance(process.cwd());
    dbHub.run("VACUUM;");
    dbHub.run("PRAGMA optimize;");
    console.log("✅ Vacuum & Otimização do SQLite concluídos.");
    
    const logs = ["diagnostic.log", "test_output.log"];
    for (const log of logs) {
        if (await Bun.file(log).exists()) {
            await Bun.file(log).delete();
            console.log(`   • Removido: ${log}`);
        }
    }
    console.log("✨ Limpeza de arquivos temporários concluída!\n");
}

async function runBenchmark() {
    console.log("\n⏱️ [CLI] Iniciando Benchmark de Latência Nativa...");
    const proc = Bun.spawn(["bun", "run", "scripts/benchmark.ts"], {
        stdout: "inherit",
        stderr: "inherit"
    });
    await proc.exited;
}

async function runWatch() {
    console.log("\n🛡️ [CLI] Modo Daemon Sentinela Ativo...");
    const { SentinelDaemon } = await import("../core/sentinel_daemon.ts");
    const sentinel = new SentinelDaemon(process.cwd(), 4);
    sentinel.start();
    console.log("Press Ctrl+C to stop.");
    await new Promise(() => {});
}

async function runDownloadModel(args: string[]) {
    console.log("\n📥 [CLI] Iniciando Downloader de Modelo SLM...");
    const scriptPath = import.meta.dir ? `${import.meta.dir}/../../scripts/download_model.ts` : "scripts/download_model.ts";
    const proc = Bun.spawn(["bun", "run", scriptPath, ...args], {
        stdout: "inherit",
        stderr: "inherit"
    });
    await proc.exited;
}

function printHelp() {
    console.log(`
Uso: sovereign <comando> [opções]

Comandos:
  status          Exibe o status do hardware, binários nativos e banco de dados SQLite (Padrão).
  audit           Executa o pipeline de diagnóstico e auditoria de código.
                  Opções: --staged (apenas arquivos alterados), --strict (modo de análise estrita).
  download-model  Baixa os pesos do modelo SLM offline (Qwen 2.5 Coder GGUF ~986 MB).
  watch           Inicia o Daemon Sentinela em tempo real (escuta alterações e audita automaticamente).
  clean           Executa o VACUUM do banco de dados e remove arquivos temporários/logs.
  benchmark       Executa o teste de carga e latência entre os binários Go/Rust/TypeScript.
  help            Exibe esta mensagem de ajuda.
`);
}

main().then(() => {
    process.exit(0);
}).catch(err => {
    console.error("🚨 Erro na CLI Soberana:", err);
    process.exit(1);
});
