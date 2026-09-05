import winston from "winston";
import { Path } from "./path_utils.ts";
import { HubManagerGRPC } from "./hub_manager_grpc.ts";
import { spawn, execSync, type ChildProcess } from "node:child_process";
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
     * Limpa processos órfãos que possam estar travando as portas gRPC/HTTP do Hub e Sidecar.
     */
    public cleanupPorts(ports: number[] = [50051, 8080]) {
        const isWin = process.platform === "win32";
        for (const port of ports) {
            try {
                if (isWin) {
                    const output = execSync(`netstat -ano | findstr :${port}`, { encoding: "utf8" });
                    const lines = output.split("\n");
                    for (const line of lines) {
                        const trimmed = line.trim();
                        if (trimmed) {
                            const parts = trimmed.split(/\s+/);
                            const pid = parts[parts.length - 1];
                            if (pid && !isNaN(Number(pid)) && Number(pid) > 0) {
                                logger.info(`🛡️ [PortGuard] Finalizando processo Windows órfão na porta ${port} (PID: ${pid})...`);
                                execSync(`taskkill /F /PID ${pid}`, { stdio: "ignore" });
                            }
                        }
                    }
                } else {
                    // Unix-like (Linux/macOS)
                    try {
                        const pidOutput = execSync(`lsof -t -i :${port}`, { encoding: "utf8" }).trim();
                        if (pidOutput) {
                            const pids = pidOutput.split("\n");
                            for (const pid of pids) {
                                if (pid && !isNaN(Number(pid)) && Number(pid) > 0) {
                                    logger.info(`🛡️ [PortGuard] Finalizando processo Unix órfão na porta ${port} (PID: ${pid})...`);
                                    execSync(`kill -9 ${pid}`, { stdio: "ignore" });
                                }
                            }
                        }
                    } catch {
                        // lsof fails if no process is listening, which is fine
                    }
                }
            } catch (e) {
                // Ignore errors if no process is using the port
            }
        }
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
        
        // Executa limpeza de processos órfãos que possam estar ocupando as portas de gRPC/HTTP
        this.cleanupPorts([50051, 8080]);

        const absRoot = path.resolve(projectRoot);
        const isWin = process.platform === "win32";
        const hubBinaryName = isWin ? "hub.exe" : "hub";
        const analyzerBinaryName = isWin ? "analyzer.exe" : "analyzer";

        // Determina o root do Personas_Agentes (onde os binários vivem)
        const personasRoot = path.resolve(import.meta.dirname, "../../");
        
        const hubExe = path.join(personasRoot, "src_native/hub", hubBinaryName);
        const analyzerExe = path.join(personasRoot, "src_native/analyzer/target/release", analyzerBinaryName);

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

        sidecarProcess.stdout?.pipe(logStream, { end: false });
        sidecarProcess.stderr?.pipe(logStream, { end: false });
        hubProcess.stdout?.pipe(logStream, { end: false });
        hubProcess.stderr?.pipe(logStream, { end: false });

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
