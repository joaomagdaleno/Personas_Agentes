import { parseArgs } from "node:util";
import { Orchestrator } from "../src_local/core/orchestrator.ts";
import { configureLogging } from "../src_local/utils/logging_config.ts";
import { DirectorPersona } from "../src_local/agents/TypeScript/Strategic/director.ts";
import { DiagnosticHelpers } from "../src_local/utils/DiagnosticHelpers.ts";
import winston from "winston";

async function main() {
    console.log("🚀 Lançando Sistema de Diagnóstico Bun PhD...");
    const args = parseArgs({ args: Bun.argv.slice(2), options: { root: { type: "string", short: "r" }, "auto-heal": { type: "boolean", short: "a" }, "dry-run": { type: "boolean", short: "d" }, staged: { type: "boolean", short: "s" } }, allowPositionals: true });
    const root = args.positionals[0] || args.values.root || ".";
    configureLogging("info");
    const logger = winston.child({ module: "SystemMonitor" });
    DiagnosticHelpers.logSession(args, logger, root);
    await DiagnosticHelpers.loadProjectMap("project_map.json", logger);

    try {
        const orchestrator = new Orchestrator(root);
        orchestrator.addPersona(new DirectorPersona(root));
        const res = await (args.values.staged ? orchestrator.runStagedAudit({ dryRun: !!args.values["dry-run"] }) : orchestrator.generateFullDiagnostic({ autoHeal: !!args.values["auto-heal"], dryRun: !!args.values["dry-run"] }));
        if (args.values.staged) {
            logger.info(`📊 Problemas detectados: ${(res as any[]).length}`);
            if ((res as any[]).length > 0) process.exit(1);
        }
        await orchestrator.runMaintenance();
    } catch (err: any) {
        logger.error(`🚨 Falha crítica: ${err.message || err}`);
        process.exit(1);
    }
}
main();
