import { parseArgs } from "node:util";
import { Path } from "./src_local/core/path_utils.ts";
import { Orchestrator } from "./src_local/core/orchestrator.ts";
import { configureLogging } from "./src_local/utils/logging_config.ts";
import winston from "winston";
import { DirectorPersona } from "./src_local/agents/Python/Strategic/director.ts";

/**
 * 🌌 Portal de Consciência Sistêmica (Bun Version).
 */
async function main() {
    console.log("🚀 Lançando Sistema de Diagnóstico Bun PhD...");

    const args = parseArgs({
        args: Bun.argv.slice(2),
        options: {
            root: { type: "string", short: "r" },
            "auto-heal": { type: "boolean", short: "a" },
            "dry-run": { type: "boolean", short: "d" }
        },
        allowPositionals: true
    });

    const projectRootStr = args.positionals[0] || args.values.root || ".";
    configureLogging("info");
    const logger = winston.child({ module: "SystemMonitor" });
    const startTime = Date.now();

    logger.info(`📡 Acionando Autoconsciência sobre o alvo: ${projectRootStr}`);
    if (args.values["dry-run"]) {
        logger.info("🛡️ MODO DRY-RUN: Nenhuma alteração persistente será salva.");
    }

    try {
        const orchestrator = new Orchestrator(projectRootStr);

        // Mobilizando PhDs
        orchestrator.addPersona(new DirectorPersona(projectRootStr));

        const reportPath = await orchestrator.generateFullDiagnostic({
            autoHeal: !!args.values["auto-heal"],
            dryRun: !!args.values["dry-run"]
        });

        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        logger.info(`✅ Diagnóstico 360º concluído em ${duration}s.`);
        logger.info(`📄 Relatório consolidado em: ${reportPath.basename()}`);

    } catch (err: any) {
        logger.error(`🚨 Falha crítica no diagnóstico: ${err.message || err}`);
        if (err.stack) logger.debug(err.stack);
        process.exit(1);
    }
}

main();
