import { parseArgs } from "node:util";
import { Path } from "./src_local/core/path_utils.ts";
import { Orchestrator } from "./src_local/core/orchestrator.ts";
import { configureLogging } from "./src_local/utils/logging_config.ts";
import winston from "winston";
import { DirectorPersona } from "./src_local/agents/Support/director.ts";

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
            "dry-run": { type: "boolean", short: "d" },
            staged: { type: "boolean", short: "s" }
        },
        allowPositionals: true
    });

    const projectRootStr = args.positionals[0] || args.values.root || ".";
    configureLogging("info");
    const logger = winston.child({ module: "SystemMonitor" });
    const startTime = Date.now();
    let exitCode = 0;

    logger.info(`📡 Acionando Autoconsciência sobre o alvo: ${projectRootStr}`);
    if (args.values["dry-run"]) {
        logger.info("🛡️ MODO DRY-RUN: Nenhuma alteração persistente será salva.");
    }
    if (args.values.staged) {
        logger.info("📦 MODO INCREMENTAL: Auditando apenas arquivos no Stage do Git.");
    }

    let orchestrator: Orchestrator | null = null;

    // 🧠 Load Project Map & Parity Context
    const mapPath = "project_map.json";
    if (await Bun.file(mapPath).exists()) {
        try {
            const mapData = await Bun.file(mapPath).json();
            const sovereign = mapData.sovereign || [];
            const scored = sovereign.filter((f: any) => f.parity !== undefined);

            if (scored.length > 0) {
                const avgParity = Math.round(scored.reduce((acc: number, f: any) => acc + (f.parity || 0), 0) / scored.length);
                logger.info(`🗺️ Mapa Cartográfico Carregado: ${sovereign.length} arquivos.`);
                logger.info(`⚖️ Saúde de Paridade Sistêmica: ${avgParity}% (baseado em ${scored.length} arquivos migrados).`);
            }
        } catch (e) {
            logger.warn("⚠️ Falha ao ler mapa de paridade.");
        }
    } else {
        logger.info("ℹ️ Mapa de paridade ausente. Execute 'bun run scripts/project_cartographer.ts' para gerar.");
    }

    try {
        orchestrator = new Orchestrator(projectRootStr);

        // Mobilizando PhDs
        orchestrator.addPersona(new DirectorPersona(projectRootStr));

        const reportResult = await (args.values.staged
            ? orchestrator.runStagedAudit({ dryRun: !!args.values["dry-run"] })
            : orchestrator.generateFullDiagnostic({
                autoHeal: !!args.values["auto-heal"],
                dryRun: !!args.values["dry-run"]
            }));

        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        logger.info(`✅ Diagnóstico 360º concluído em ${duration}s.`);

        if (!args.values.staged) {
            const pathResult = reportResult as Path;
            logger.info(`📄 Relatório consolidado em: ${pathResult?.basename() || 'relatório indisponível'}`);
        } else {
            const findings = reportResult as any[];
            logger.info(`📊 Auditoria incremental concluída. Problemas detectados: ${findings.length}`);
            if (findings.length > 0) {
                exitCode = 1;
            }
        }

        // Finalizar com manutenção
        if (orchestrator) {
            await orchestrator.runMaintenance();
        }

    } catch (err: any) {
        logger.error(`🚨 Falha crítica no diagnóstico: ${err.message || err}`);
        if (err.stack) logger.debug(err.stack);
        exitCode = 1;
    }

    process.exit(exitCode);
}

main();
