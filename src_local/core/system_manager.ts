import winston from "winston";
import { Path } from "./path_utils.ts";
import { HubManagerGRPC } from "./hub_manager_grpc.ts";
import { spawn, type ChildProcess } from "node:child_process";
import * as path from "node:path";
import * as fs from "node:fs";

const logger = winston.child({ module: "SystemManager" });

/**
 * 🛠️ Lifecycle & Process Manager (Singleton).
 * Garante que os sidecars nativos estão rodando e os encerra de forma limpa.
 */
export class SystemManager {
    private static instance: SystemManager;
    private hubManager: HubManagerGRPC;
    private nativeProcesses: ChildProcess[] = [];
    private shutdownInProgress = false;

    private constructor() {
        this.hubManager = HubManagerGRPC.getInstance();
        this.setupShutdownHandlers();
    }

    public static getInstance(): SystemManager {
        if (!SystemManager.instance) {
            SystemManager.instance = new SystemManager();
        }
        return SystemManager.instance;
    }

    /**
     * Tenta garantir que a infraestrutura nativa está pronta, iniciando-a se necessário.
     */
    public async ensureInfrastructure(projectRoot: string): Promise<boolean> {
        if (await this.hubManager.isHealthy()) {
            logger.info("✅ Native Hub já está saudável e operando.");
            return true;
        }

        logger.info("🚀 Iniciando infraestrutura nativa (Hub + Sidecar) pelo SystemManager...");
        
        const absRoot = path.resolve(projectRoot);
        const hubExe = path.join(absRoot, "src_native/hub/hub.exe");
        const analyzerExe = path.join(absRoot, "src_native/analyzer/target/release/analyzer.exe");

        if (!fs.existsSync(hubExe)) {
            logger.error(`❌ Não encontrado: ${hubExe}`);
            return false;
        }
        if (!fs.existsSync(analyzerExe)) {
            logger.error(`❌ Não encontrado: ${analyzerExe}`);
            return false;
        }

        const logStream = fs.createWriteStream(path.join(absRoot, "diagnostic.log"), { flags: 'a' });

        const sidecarProcess = spawn(analyzerExe, ["serve"], { cwd: absRoot, stdio: 'pipe' });
        const hubProcess = spawn(hubExe, [], { cwd: path.dirname(hubExe), stdio: 'pipe' });

        sidecarProcess.stdout?.pipe(logStream);
        sidecarProcess.stderr?.pipe(logStream);
        hubProcess.stdout?.pipe(logStream);
        hubProcess.stderr?.pipe(logStream);

        this.nativeProcesses.push(sidecarProcess, hubProcess);

        // Aguarda estabilização (Pooling de health check)
        logger.info("⏳ Aguardando serviços nativos estabilizarem...");
        for (let i = 0; i < 15; i++) {
            await new Promise(r => setTimeout(r, 1000));
            if (await this.hubManager.isHealthy()) {
                logger.info("✅ Infraestrutura nativa operacional.");
                return true;
            }
        }

        logger.error("❌ Falha ao estabilizar infraestrutura nativa após 15s.");
        return false;
    }

    private setupShutdownHandlers() {
        const handleSignal = async () => {
            await this.shutdown();
        };

        process.on("SIGINT", handleSignal);
        process.on("SIGTERM", handleSignal);
    }

    public async shutdown() {
        if (this.shutdownInProgress) return;
        this.shutdownInProgress = true;
        logger.info("🛑 Encerrando infrastructure_assembler. Limpando processos nativos...");
        
        for (const proc of this.nativeProcesses) {
            try {
                proc.kill();
            } catch (e) {
                // Ignore
            }
        }
        
        logger.info("✨ Cleanup concluído.");
        console.log("✨ Native processes terminated.");
    }

    public registerNativeProcess(proc: ChildProcess) {
        if (!this.nativeProcesses.includes(proc)) {
            this.nativeProcesses.push(proc);
        }
    }
}
