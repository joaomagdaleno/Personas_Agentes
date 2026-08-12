#!/usr/bin/env bun
import { DatabaseHub } from "../core/database_hub.ts";
import { SystemManager } from "../core/system_manager.ts";
import { MetricScanner, HealthCollector } from "../engines/maintenance/sys_perf_architect_service.ts";
import { formatDate } from "../engines/reporting/ui_ux_architect_service.ts";
import * as os from "node:os";

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
        case "help":
        default:
            printHelp();
            break;
    }
}

async function printStatus() {
    console.log("\n==================================================================");
    console.log("             🏛️  PERSONAS AGENTES — STATUS SOBERANO              ");
    console.log("==================================================================\n");

    const health = HealthCollector.collect(false);
    console.log("📊 GOVERNANÇA DE HARDWARE:");
    console.log(`   • Plataforma / Arquitetura: ${os.platform()} (${os.arch()})`);
    console.log(`   • Tempo de Atividade:       ${health.uptime_hours} hrs`);
    console.log(`   • Uso de CPU:               ${health.cpu_usage.toFixed(1)}%`);
    console.log(`   • Uso de Memória RAM:       ${health.memory_usage}% (Livre: ${health.memory_free_gb} GB)`);
    
    console.log("\n⚙️ BINÁRIOS NATIVOS:");
    const goHubExists = await Bun.file("bin/hub.exe").exists() || await Bun.file("hub.exe").exists();
    const rustSidecarExists = await Bun.file("bin/analyzer_lib.dll").exists() || await Bun.file("analyzer_lib.dll").exists();
    console.log(`   • Go Hub Proxy (hub.exe):          ${goHubExists ? "✅ Presente" : "❌ Ausente"}`);
    console.log(`   • Rust Sidecar (analyzer_lib.dll): ${rustSidecarExists ? "✅ Presente" : "❌ Ausente"}`);
    
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
    console.log(`\n🚀 [CLI] Executando Auditoria ${strict ? "ESTRITA" : "PADRÃO"} ${staged ? "(Staged Only)" : "(Projeto Completo)"}...`);
    const proc = Bun.spawn(["bun", "run", "scripts/run-diagnostic.ts"], {
        stdout: "inherit",
        stderr: "inherit",
        env: { ...process.env, STRICT_AUDIT: strict ? "true" : "false", STAGED_ONLY: staged ? "true" : "false" }
    });
    await proc.exited;
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

function printHelp() {
    console.log(`
Uso: sovereign <comando> [opções]

Comandos:
  status     Exibe o status do hardware, binários nativos e banco de dados SQLite (Padrão).
  audit      Executa o pipeline de diagnóstico e auditoria de código.
             Opções: --staged (apenas arquivos alterados), --strict (modo de análise estrita).
  watch      Inicia o Daemon Sentinela em tempo real (escuta alterações e audita automaticamente).
  clean      Executa o VACUUM do banco de dados e remove arquivos temporários/logs.
  benchmark  Executa o teste de carga e latência entre os binários Go/Rust/TypeScript.
  help       Exibe esta mensagem de ajuda.
`);
}

main().catch(err => {
    console.error("🚨 Erro na CLI Soberana:", err);
    process.exit(1);
});
