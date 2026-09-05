
import { spawn, execSync, type ChildProcess } from "node:child_process";
import { parseArgs } from "node:util";
import * as path from "node:path";
import * as fs from "node:fs";
import winston from "winston";
import { Orchestrator } from "../src_local/core/orchestrator.ts";
import { configureLogging } from "../src_local/engines/maintenance/sys_perf_architect_service.ts";
import { MasterOrchestratorService as DirectorPersona } from "../src_local/engines/strategic/master_orchestrator_service.ts";
import { DiagnosticHelpers } from "../src_local/engines/analysis/architecture_types_service.ts";

async function main() {
    const args = parseArgs({ 
        args: Bun.argv.slice(2), 
        options: { 
            root: { type: "string", short: "r" }, 
            "auto-heal": { type: "boolean", short: "a" }, 
            "dry-run": { type: "boolean", short: "d" }, 
            staged: { type: "boolean", short: "s" },
            "skip-setup": { type: "boolean" },
            "skip-tests": { type: "boolean" },
        }, 
        allowPositionals: true 
    });
    
    const root = args.positionals[0] || args.values.root || ".";
    const absRoot = path.resolve(root);
    configureLogging("info");
    const logger = winston.child({ module: "SystemMonitor" });

    console.log("🚀 Lançando Sistema de Diagnóstico Bun PhD...");

    // 1. Automatização de Setup
    if (!args.values["skip-setup"]) {
        logger.info("🛠️ Verificando infraestrutura nativa...");
        try {
            const setupPath = path.resolve(__dirname, "ensure_binaries.ts");
            execSync(`bun run "${setupPath}"`, { stdio: "inherit" });
        } catch (err) {
            logger.error("❌ Falha crítica ao preparar binários nativos.");
            process.exit(1);
        }
    }

    // Lifecycle is now managed centrally by SystemManager during Orchestrator instantiation.
    // We don't need to manually spawn or keep track of hubProcess/sidecarProcess here anymore.

    try {
        const { PsaContext } = await import("../src_local/psa/kernel/psa_context.ts");
        const { PsaSystemControlPlugin } = await import("../src_local/psa/plugins/core/system_control_plugin.ts");
        const { ZigAnalyzerPlugin } = await import("../src_local/psa/plugins/native/zig_analyzer_plugin.ts");
        const { GoHubPlugin } = await import("../src_local/psa/plugins/native/go_hub_plugin.ts");

        logger.info("🏛️ Inicializando Micro-Kernel PSA para Diagnóstico Soberano...");
        const ctx = PsaContext.getInstance(absRoot);
        ctx.use(new PsaSystemControlPlugin());
        ctx.use(new ZigAnalyzerPlugin());
        ctx.use(new GoHubPlugin());

        DiagnosticHelpers.logSession(args, logger, root);
        await DiagnosticHelpers.loadProjectMap("project_map.json", logger);

        if (args.values.staged) {
            logger.info("🔍 Rodando auditoria de arquivos staged via PSA Plugin...");
            const res = await ctx.tools.executeTool("audit.staged", { dryRun: !!args.values["dry-run"] });
            const findings = (res.result as any)?.findings || [];
            logger.info(`📊 Problemas detectados: ${findings.length}`);
            if (findings.length > 0) process.exit(1);
        } else {
            logger.info("🔍 Iniciando Diagnóstico de Alta Fidelidade via PSA System Control Tool...");
            const res = await ctx.tools.executeTool("system.run_diagnostic", {
                skipTests: !!args.values["skip-tests"],
                dryRun: !!args.values["dry-run"]
            });
            logger.info(`✨ Resultado: ${(res.result as any)?.summary || "Concluído"}`);
            logger.info(`🩺 Health Score do Sistema: ${(res.result as any)?.healthScore || 100}%`);
        }

        logger.info("🏁 Operação concluída.");
        process.exit(0);
    } catch (err: any) {
        logger.error(`🚨 Falha crítica: ${err.message || err}`);
        process.exit(1);
    }
}
main();
