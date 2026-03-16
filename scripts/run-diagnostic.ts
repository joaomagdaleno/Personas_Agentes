
import { spawn, execSync, type ChildProcess } from "node:child_process";
import { parseArgs } from "node:util";
import * as path from "node:path";
import * as fs from "node:fs";
import winston from "winston";
import { Orchestrator } from "../src_local/core/orchestrator.ts";
import { configureLogging } from "../src_local/utils/logging_config.ts";
import { DirectorPersona } from "../src_local/agents/Support/Strategic/director.ts";
import { DiagnosticHelpers } from "../src_local/utils/diagnostic_helpers.ts";

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
            execSync("bun run scripts/ensure_binaries.ts", { stdio: "inherit", cwd: absRoot });
        } catch (err) {
            logger.error("❌ Falha crítica ao preparar binários nativos.");
            process.exit(1);
        }
    }

    // Lifecycle is now managed centrally by SystemManager during Orchestrator instantiation.
    // We don't need to manually spawn or keep track of hubProcess/sidecarProcess here anymore.

    try {
        const orchestrator = new Orchestrator(root);
        await orchestrator.ready;
        orchestrator.addPersona(new DirectorPersona(root));
        
        DiagnosticHelpers.logSession(args, logger, root);
        await DiagnosticHelpers.loadProjectMap("project_map.json", logger);

        if (args.values.staged) {
            logger.info("🔍 Rodando auditoria de arquivos staged...");
            const res = await orchestrator.runStagedAudit({ dryRun: !!args.values["dry-run"] });
            logger.info(`📊 Problemas detectados: ${(res as any[]).length}`);
            if ((res as any[]).length > 0) process.exit(1);
        } else {
            logger.info("🔍 Iniciando Diagnóstico de Alta Fidelidade (Pipeline)...");
            const { DiagnosticPipeline } = await import("../src_local/core/diagnostic_pipeline.ts");
            const pipeline = new DiagnosticPipeline(orchestrator);
            await pipeline.execute({ 
                skipTests: !!args.values["skip-tests"],
                autoHeal: !!args.values["auto-heal"],
                dryRun: !!args.values["dry-run"]
            });
        }

        await orchestrator.runMaintenance();
        logger.info("🏁 Operação concluída.");
        await orchestrator.shutdown();
        process.exit(0);
    } catch (err: any) {
        logger.error(`🚨 Falha crítica: ${err.message || err}`);
        process.exit(1);
    }
}
main();
