import { spawn, execSync, type ChildProcess } from "node:child_process";
import { parseArgs } from "node:util";
import { Orchestrator } from "../src_local/core/orchestrator.ts";
import { configureLogging } from "../src_local/utils/logging_config.ts";
import { DirectorPersona } from "../src_local/agents/TypeScript/Strategic/director.ts";
import { DiagnosticHelpers } from "../src_local/utils/diagnostic_helpers.ts";
import winston from "winston";
import * as path from "node:path";
import * as fs from "node:fs";

async function main() {
    console.log("🚀 Lançando Sistema de Diagnóstico Bun PhD...");
    const args = parseArgs({ 
        args: Bun.argv.slice(2), 
        options: { 
            root: { type: "string", short: "r" }, 
            "auto-heal": { type: "boolean", short: "a" }, 
            "dry-run": { type: "boolean", short: "d" }, 
            staged: { type: "boolean", short: "s" },
            "skip-setup": { type: "boolean" }
        }, 
        allowPositionals: true 
    });
    
    const root = args.positionals[0] || args.values.root || ".";
    const absRoot = path.resolve(root);
    configureLogging("info");
    const logger = winston.child({ module: "SystemMonitor" });

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

    let hubProcess: ChildProcess | null = null;

    // 2. Lifecycle do Hub
    try {
        // Tenta conectar para ver se o hub já existe
        const tempHub = new Orchestrator(root).hubManager;
        try {
            await tempHub.getStatus();
            logger.info("✅ Hub já está em execução.");
        } catch (e) {
            logger.info("📡 Iniciando Go Hub em background...");
            const hubExe = path.resolve(absRoot, "src_native/hub/hub.exe");
            const hubDir = path.dirname(hubExe);
            
            // Verifica se o exe existe antes de tentar rodar
            if (!fs.existsSync(hubExe)) {
                logger.error(`❌ Binário do Hub não encontrado em: ${hubExe}`);
                process.exit(1);
            }

            hubProcess = spawn(hubExe, [], { 
                cwd: hubDir, 
                detached: false, 
                stdio: "pipe" // Capture output for debugging
            });

            hubProcess.stdout?.on("data", (d) => console.log(`[Hub Output]: ${d}`));
            hubProcess.stderr?.on("data", (d) => console.error(`[Hub Error]: ${d}`));

            const cleanup = () => {
                if (hubProcess) {
                    logger.info("🔌 Encerrando Go Hub...");
                    hubProcess.kill();
                    hubProcess = null;
                }
            };

            process.on("exit", cleanup);
            process.on("SIGINT", () => { cleanup(); process.exit(); });
            process.on("SIGTERM", () => { cleanup(); process.exit(); });
            
            // Pequeno delay para o hub subir o socket
            await new Promise(r => setTimeout(r, 1000));
        }

        const orchestrator = new Orchestrator(root);
        DiagnosticHelpers.logSession(args, logger, root);
        await DiagnosticHelpers.loadProjectMap("project_map.json", logger);

        await orchestrator.ready; // Aguarda conexão gRPC
        orchestrator.addPersona(new DirectorPersona(root));
        
        const res = await (args.values.staged 
            ? orchestrator.runStagedAudit({ dryRun: !!args.values["dry-run"] }) 
            : orchestrator.generateFullDiagnostic({ autoHeal: !!args.values["auto-heal"], dryRun: !!args.values["dry-run"] }));

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
