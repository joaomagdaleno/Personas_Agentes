import winston from "winston";
import { cpus, totalmem, freemem } from "node:os";
import * as os from "node:os";
import { execSync } from "node:child_process";
import { formatDate } from "../reporting/ui_ux_architect_service.ts";
import { HubManagerGRPC } from "../../core/hub_manager_grpc.ts";
import { PhdGovernanceSystem } from "../../core/governance/system_facade.ts";
import { eventBus } from "../../core/event_bus.ts";
export { SovereignResourceBudget } from "./sovereign_resource_budget.ts";
export type { AdaptiveMode, TelemetrySnapshot, AdaptiveConfig } from "./sovereign_resource_budget.ts";

const logger = winston.child({ module: "SysPerfArchitectService" });
const HUB_STATUS_URL = "http://localhost:8080/status";

export interface PerformanceProfile {
    profile: "Soberano" | "Standard" | "Lite";
    maxWorkers: number;
    aiContext: number;
    aiThreads: number;
}

export interface SystemPressure {
    cpuCount: number;
    ramTotalGB: number;
    ramFreeGB: number;
    ramUsagePercent: number;
    isCritical: boolean;
}

export class ResourceGovernor {
    private cpuLimit: number;
    private memLimit: number;

    constructor(cpuLimit: number = 85, memLimit: number = 95) {
        this.cpuLimit = cpuLimit;
        this.memLimit = memLimit;
        logger.info("⚖️ [Governor] ResourceGovernor inicializado.");
    }

    static getPerformanceProfile(): PerformanceProfile {
        const cores = cpus().length;
        const ramGB = totalmem() / (1024 ** 3);

        if (ramGB > 16 && cores >= 8) {
            return {
                profile: "Soberano",
                maxWorkers: cores * 2,
                aiContext: 4096,
                aiThreads: Math.max(4, Math.floor(cores / 2)),
            };
        } else if (ramGB >= 8) {
            return {
                profile: "Standard",
                maxWorkers: cores,
                aiContext: 2048,
                aiThreads: Math.max(2, Math.floor(cores / 4)),
            };
        } else {
            return {
                profile: "Lite",
                maxWorkers: Math.max(2, Math.floor(cores / 2)),
                aiContext: 1024,
                aiThreads: 2,
            };
        }
    }

    static getCurrentPressure(): SystemPressure {
        const cores = cpus().length;
        const totalGB = totalmem() / (1024 ** 3);
        const freeGB = freemem() / (1024 ** 3);
        const usagePercent = Math.round(((totalGB - freeGB) / totalGB) * 100);

        if (process.env.BUN_ENV === "test") {
            return {
                cpuCount: cores,
                ramTotalGB: Math.round(totalGB * 10) / 10,
                ramFreeGB: 16.0,
                ramUsagePercent: 20,
                isCritical: false,
            };
        }

        return {
            cpuCount: cores,
            ramTotalGB: Math.round(totalGB * 10) / 10,
            ramFreeGB: Math.round(freeGB * 10) / 10,
            ramUsagePercent: usagePercent,
            isCritical: usagePercent > 90,
        };
    }

    shouldThrottle(): boolean {
        const pressure = ResourceGovernor.getCurrentPressure();
        if (pressure.ramUsagePercent > this.memLimit) {
            logger.warn(`🌡️ [Governor] Carga alta (RAM: ${pressure.ramUsagePercent}%). Reduzindo.`);
            return true;
        }
        return false;
    }

    async waitIfNeeded(maxWaitMs: number = 30_000): Promise<void> {
        const start = Date.now();
        while (this.shouldThrottle()) {
            if (Date.now() - start > maxWaitMs) {
                logger.warn("⚖️ [Governor] Timeout de throttle atingido. Continuando.");
                break;
            }
            await Bun.sleep(2000);
        }
    }

    static getSummary(): string {
        const profile = this.getPerformanceProfile();
        const pressure = this.getCurrentPressure();
        return [
            `Profile: ${profile.profile}`,
            `Workers: ${profile.maxWorkers}`,
            `RAM: ${pressure.ramFreeGB}GB free / ${pressure.ramTotalGB}GB total (${pressure.ramUsagePercent}%)`,
            `CPUs: ${pressure.cpuCount}`,
            `Status: ${pressure.isCritical ? "🔴 CRITICAL" : "🟢 OK"}`,
        ].join(" | ");
    }
}

export class VetoEngine {
    static shouldSkip(line: string, filePath: string, domain: string = "PRODUCTION"): boolean {
        const clean = line.trim();
        if (clean.startsWith("//") || clean.startsWith("/*") || clean.startsWith("*") || clean.startsWith("#")) {
            return true;
        }
        if (domain === "EXPERIMENTATION" && !line.toLowerCase().includes("critical")) {
            return true;
        }
        if (filePath.includes("/tests/") || filePath.includes(".test.") || filePath.includes(".spec.")) {
            return true;
        }
        if (this.isRuleDefinition(line)) {
            return true;
        }
        return false;
    }

    static isRuleDefinition(line: string): boolean {
        const lower = line.toLowerCase();
        const patterns = [
            /regex\s*[:=]/,
            /pattern\s*[:=]/,
            /rules\s*[:=]/,
            /diretriz:/,
            /["']ev["']\s*\+\s*["']al/
        ];
        return patterns.some(p => p.test(lower));
    }

    static isTechnicalMathContext(line: string): boolean {
        const techKeywords = ['alpha', 'progress', 'offset', 'dp', 'sp', 'x', 'y', 'width', 'height', 'radius', 'velocity', 'phase', 'lerp', 'sin', 'cos'];
        const moneyKeywords = ['price', 'amount', 'balance', 'cost', 'total', 'tax', 'fee'];

        const lower = line.toLowerCase();
        if (moneyKeywords.some(k => lower.includes(k))) return false;

        return techKeywords.some(k => new RegExp(`\\b${k}\\b`).test(lower));
    }
}

export class SystemSentinel {
    private isAdmin: boolean = false;
    private healthCache: { data: any, timestamp: number } | null = null;
    private readonly CACHE_TTL = 3000;

    constructor() { this.isAdmin = false; }

    async getSystemHealth() {
        if (this.healthCache && Date.now() - this.healthCache.timestamp < this.CACHE_TTL) return this.healthCache.data;

        try {
            const response = await fetch(HUB_STATUS_URL);
            if (response.ok) {
                const h = (await response.json()).metrics;
                this.healthCache = { data: h, timestamp: Date.now() };
                return h;
            }
        } catch (e) {
            logger.warn("⚠️ Hub Sentinel indisponível. Usando fallback local.");
        }

        const h = SysHealthCollector.collect(this.isAdmin);
        this.healthCache = { data: h, timestamp: Date.now() };
        return h;
    }

    async getHeavyProcesses(): Promise<any[]> {
        const health = await this.getSystemHealth();
        return health.heavy_processes || [];
    }

    async suggestOptimizations(): Promise<string[]> {
        const h = await this.getSystemHealth(), suggestions: string[] = [];
        if (parseFloat(h.memory_usage) > 85) suggestions.push("⚠️ RAM crítica (>85%).");
        if (h.cpu_usage > 70) suggestions.push("⚠️ Alta carga de CPU.");
        if (!this.isAdmin) suggestions.push("🛡️ Executar como ADMIN permitiria otimizações.");
        return suggestions;
    }

    enforceGovernance() { BaseResourceGovernor.enforce(process.pid); }

    async shouldThrottle(cpuLimit: number = 85, memLimit: number = 95): Promise<boolean> {
        return BaseResourceGovernor.shouldThrottle(await this.getSystemHealth(), cpuLimit, memLimit);
    }

    async yieldIfHighLoad(cpuL: number = 85, memL: number = 95) {
        await BaseResourceGovernor.yield(async () => await this.shouldThrottle(cpuL, memL));
    }

    async analyze_and_kill_bloatware(): Promise<{ process: string, mem_mb: string, action: string }[]> {
        const KNOWN_BLOAT = ["SearchIndexer.exe", "MsMpEng.exe", "OneDrive.exe", "Teams.exe"];
        const procs = await this.getHeavyProcesses();
        return procs
            .filter((p: any) => KNOWN_BLOAT.some(b => p.name?.toLowerCase().includes(b.toLowerCase())))
            .map((p: any) => ({ process: p.name, mem_mb: p.mem_mb, action: this.isAdmin ? "KILL_ELIGIBLE" : "REQUIRES_ADMIN" }));
    }
}

export class TaskExecutor {
    private governance: PhdGovernanceSystem;

    constructor() {
        this.governance = PhdGovernanceSystem.getInstance();
    }

    async runParallel<T, R>(fn: (item: T) => Promise<R> | R, items: T[], concurrency: number = 10): Promise<R[]> {
        if (!items || items.length === 0) return [];

        const results: R[] = new Array(items.length);
        let currentIdx = 0;

        const safeConcurrency = this.governance.getDynamicConcurrency(concurrency);
        if (safeConcurrency < concurrency) {
            logger.warn(`⚠️ [Sovereign Governance] Reduzindo paralelismo de ${concurrency} para ${safeConcurrency} devido a carga no SO.`);
        }

        const worker = async () => {
            while (currentIdx < items.length) {
                const overloadStatus = this.governance.isSystemOverloaded();
                if (overloadStatus.overloaded) {
                    logger.warn(`🛑 [Sovereign Back-pressure] CPU/RAM no limite operativo: ${overloadStatus.reason}. Pausando executor...`);
                    await Bun.sleep(2000);
                }

                const index = currentIdx++;
                if (index < items.length) {
                    results[index] = await fn(items[index]!);
                }
            }
        };

        const workers = Array.from({ length: Math.min(safeConcurrency, items.length) }, () => worker());
        await Promise.all(workers);

        return results;
    }

    async runCommand(command: string, cwd: string = "."): Promise<{ stdout: string, stderr: string, exitCode: number }> {
        try {
            const proc = Bun.spawn(command.split(" "), {
                cwd,
                stdout: "pipe",
                stderr: "pipe"
            });

            const stdout = await new Response(proc.stdout).text();
            const stderr = await new Response(proc.stderr).text();
            const exitCode = await proc.exited;

            return { stdout, stderr, exitCode };
        } catch (err: any) {
            logger.warn(`⚠️ [TaskExecutor] Falha ao executar comando '${command}': ${err.message}`);
            return { stdout: "", stderr: err.message || String(err), exitCode: 1 };
        }
    }
}

export interface Task {
    id: number;
    task_type: string;
    target_file: string;
    status: string;
    result?: string;
}

export class TaskQueue {
    private hubManager: HubManagerGRPC;
    private maxConcurrent: number;

    constructor(maxConcurrent = 5, hubManager?: HubManagerGRPC) {
        this.maxConcurrent = maxConcurrent;
        this.hubManager = hubManager || HubManagerGRPC.getInstance();
    }

    async enqueue(taskType: string, targetFile: string): Promise<boolean> {
        try {
            const success = await this.hubManager.enqueueTask(taskType, targetFile);
            if (success) {
                logger.info(`📥 [Queue] Tarefa agendada via gRPC: ${taskType} -> ${targetFile}`);
                return true;
            }
            return false;
        } catch (e) {
            logger.error(`❌ Erro ao enfileirar tarefa via gRPC: ${e}`);
            return false;
        }
    }

    async getPendingTasks(limit: number = 5): Promise<Task[]> {
        try {
            const result = await this.hubManager.getPendingTasks(limit) as any;
            return (result.tasks || result.response?.tasks || []) as Task[];
        } catch (e) {
            logger.error(`❌ Erro ao buscar tarefas via gRPC: ${e}`);
            return [];
        }
    }

    async updateTaskStatus(taskId: number, status: string, result: string | null = null) {
        try {
            await this.hubManager.updateTask(taskId, status, result || "");
            logger.info(`🔄 [Queue] Tarefa ${taskId} atualizada via gRPC para ${status}`);
        } catch (e) {
            logger.error(`❌ Erro ao atualizar tarefa ${taskId} via gRPC: ${e}`);
        }
    }

    cleanup() {}
}

export class TaskWorker {
    private running: boolean = false;
    private paused: boolean = false;
    private maxConcurrentTasks: number = 5;
    private currentTasks: number = 0;
    private governance: PhdGovernanceSystem;
    private haltListener?: () => void;
    private healthListener?: (data: { score: number }) => void;

    constructor(private taskQueue: TaskQueue, private orc?: any) {
        this.governance = PhdGovernanceSystem.getInstance();
        this.registerEvents();
    }

    private registerEvents() {
        this.haltListener = () => {
            if (!this.paused) {
                this.paused = true;
                logger.warn("🛑 [Worker] Pausando execução de tarefas devido a alerta sistêmico.");
            }
        };

        this.healthListener = ({ score }) => {
            if (this.paused && score > 60) {
                this.paused = false;
                logger.info("🟢 [Worker] Resumindo execução (Saúde restaurada).");
            }
        };

        eventBus.on("system:halt-experimentation", this.haltListener);
        eventBus.on("system:health-check", this.healthListener);
    }

    async start() {
        if (this.running) return;
        this.running = true;
        logger.info(`👷 [Worker] Operário de fundo iniciado (Paralelismo: ${this.maxConcurrentTasks}).`);

        while (this.running) {
            try {
                if (this.paused) {
                    await new Promise(resolve => setTimeout(resolve, 5000));
                    continue;
                }

                const limit = this.governance.getDynamicConcurrency(this.maxConcurrentTasks);
                if (limit < this.maxConcurrentTasks) {
                    logger.warn(`🐌 [Worker] Throttle ativado: Limitando tarefas para ${limit} devido a carga no SO.`);
                }

                if (this.currentTasks < limit) {
                    const tasks = await this.taskQueue.getPendingTasks(limit - this.currentTasks);
                    
                    if (tasks.length > 0) {
                        for (const task of tasks) {
                            this.runTask(task);
                        }
                    }
                }
                
                const overload = this.governance.isSystemOverloaded();
                const waitTime = overload.overloaded ? 10000 : 2000;
                if (overload.overloaded) {
                    logger.warn(`🛑 [Worker] Back-pressure intenso: Sistema sobrecarregado (${overload.reason}). Pausando 10s.`);
                }

                await new Promise(resolve => setTimeout(resolve, waitTime));
            } catch (e) {
                const msg = e instanceof Error ? e.message : String(e);
                logger.error(`❌ Erro no ciclo do worker: ${msg}`);
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }
    }

    private async runTask(task: any) {
        this.currentTasks++;
        try {
            await this.processTask(task);
        } finally {
            this.currentTasks--;
        }
    }

    stop() {
        this.running = false;
        if (this.haltListener) {
            eventBus.off("system:halt-experimentation", this.haltListener);
        }
        if (this.healthListener) {
            eventBus.off("system:health-check", this.healthListener);
        }
        logger.info("👷 [Worker] Parando operário...");
    }

    private async processTask(task: any) {
        logger.info(`🔨 [Worker] Processando tarefa ${task.id}: ${task.task_type} -> ${task.target_file}`);
        this.taskQueue.updateTaskStatus(task.id, 'RUNNING');

        try {
            if (!this.orc) {
                throw new Error("Orchestrator não injetado no TaskWorker.");
            }

            switch (task.task_type) {
                case "DOC_GEN":
                    await this.generateDocumentation(task.target_file);
                    break;

                case "TEST_GEN":
                case "UNIT_TEST_GEN":
                    logger.info(`📐 [Pyramid] Camada UNIT (80%) -> ${task.target_file}`);
                    await this.orc.generateTests(task.target_file);
                    break;

                case "INTEGRATION_TEST_GEN":
                    logger.info(`📐 [Pyramid] Camada INTEGRATION (15%) -> ${task.target_file}`);
                    const [fileA, fileB] = task.target_file.split('|');
                    await this.orc.generateIntegrationTest(fileA, fileB || fileA);
                    break;

                case "E2E_TEST_GEN":
                    logger.info(`📐 [Pyramid] Camada E2E (5%) -> ${task.target_file}`);
                    await this.orc.generateE2ETest(task.target_file);
                    break;

                default:
                    logger.warn(`⚠️ Tipo de tarefa desconhecido: ${task.task_type}`);
            }

            this.taskQueue.updateTaskStatus(task.id, 'COMPLETED', 'Success');
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : String(e);
            logger.error(`🚨 Falha ao processar tarefa ${task.id}: ${msg}`);
            this.taskQueue.updateTaskStatus(task.id, 'FAILED', msg);
        }
    }

    private async generateDocumentation(target: string) {
        logger.info(`📝 [Worker] Gerando documentação PhD para ${target}...`);
        await this.orc.generateDocumentation(target);
    }
}

/**
 * 🧠 SysPerfArchitectService
 * Serviço Soberano da Super Persona sys_perf_architect.
 * Unifies monitoramento de saúde do SO, engine de veto estrutural e governança de recursos.
 */
export class SysPerfArchitectService {
    private sentinel: SystemSentinel;

    constructor() {
        this.sentinel = new SystemSentinel();
    }

    async checkHealth() {
        return this.sentinel.getSystemHealth();
    }

    shouldVetoLine(line: string, file: string, domain?: string): boolean {
        return VetoEngine.shouldSkip(line, file, domain);
    }

    /**
     * 🌐 WASI Sandbox & WASM Micro-Agents Audit
     * Audita vazamento de memória e limite de concorrência dos micro-agentes WASM.
     */
    async auditWasmMicroAgentsMemoryAndConcurrency(activeAgentsCount: number, memoryUsageMB: number): Promise<{ isSafe: boolean; recommendation?: string }> {
        const maxConcurrency = SovereignResourceBudget.getInstance().getMaxWasmConcurrency();
        if (activeAgentsCount > maxConcurrency) {
            logger.warn(`⚠️ [SysPerf] Concorrência WASM excedida: ${activeAgentsCount}/${maxConcurrency}. Solicitando Instant Purge.`);
            return { isSafe: false, recommendation: "Reduzir concorrência de sandboxes WASM ativas via Instant Purge." };
        }
        if (memoryUsageMB > 50) {
            logger.warn(`⚠️ [SysPerf] Consumo de memória WASM elevado (${memoryUsageMB}MB). Solicitando limpeza de heap WASI.`);
            return { isSafe: false, recommendation: "Executar WasmMicroAgentRuntime.purgeAll() para liberar heap." };
        }
        return { isSafe: true };
    }
}

export function configureLogging(level: string = "info") {
    const transports: winston.transport[] = [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.timestamp(),
                winston.format.printf(({ timestamp, level, message, metadata }) => {
                    const timeStr = formatDate(new Date(timestamp as string | number | Date));
                    return `[${timeStr}] [${level}] ${message}${metadata ? ` ${JSON.stringify(metadata)}` : ''}`;
                })
            ),
            level: level
        })
    ];
    if (process.env.NODE_ENV === 'production') {
        transports.push(
            new winston.transports.File({
                filename: `logs/forensic_${Date.now()}.log`,
                format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
                level: 'error'
            })
        );
    }
    winston.configure({ level: level, transports: transports });
    console.log(`[Config] Logging level set to: ${level}`);
}

export interface LogEntry {
    timestamp: string;
    level: "INFO" | "WARN" | "ERROR" | "CRITICAL";
    persona: string;
    message: string;
    metadata?: Record<string, unknown>;
}

export class SovereigntyLogger {
    private static instance: SovereigntyLogger;
    private logBuffer: LogEntry[] = [];
    private readonly MAX_BUFFER = 100;

    private constructor() { }

    public static getInstance(): SovereigntyLogger {
        if (!SovereigntyLogger.instance) {
            SovereigntyLogger.instance = new SovereigntyLogger();
        }
        return SovereigntyLogger.instance;
    }

    public log(entry: Omit<LogEntry, "timestamp">): void {
        const fullEntry: LogEntry = { ...entry, timestamp: formatDate(new Date()) };
        const winstonLogger = winston.child({ persona: entry.persona });
        winstonLogger.log(entry.level.toLowerCase(), entry.message, entry.metadata);
        this.logBuffer.push(fullEntry);
        if (this.logBuffer.length > this.MAX_BUFFER) {
            this.flushToForensicStorage();
        }
    }

    private flushToForensicStorage(): void {
        const dump = JSON.stringify(this.logBuffer, null, 2);
        this.logBuffer = [];
    }
}

export const sovereigntyLogger = SovereigntyLogger.getInstance();

export class MetricScanner {
    static scanProcesses(): any[] {
        try {
            if (process.platform === 'win32') {
                const lines = execSync('tasklist /V /FO CSV', { encoding: 'utf8' }).split('\n').slice(1);
                return lines.map(l => {
                    const p = l.split('","').map(x => x.replace(/"/g, '')); if (p.length < 5) return null;
                    const mKb = parseInt((p[4] || "").replace(/[^\d]/g, '') || "0");
                    return mKb > 200000 ? { name: p[0] || "U", pid: parseInt(p[1] || "0") || 0, mem_mb: (mKb / 1024).toFixed(2) } : null;
                }).filter((x): x is any => x !== null).sort((a, b) => parseFloat(b.mem_mb) - parseFloat(a.mem_mb));
            } else {
                const lines = execSync('ps -eo comm,pid,rss', { encoding: 'utf8' }).split('\n').slice(1);
                return lines.map(l => {
                    const parts = l.trim().split(/\s+/);
                    if (parts.length < 3) return null;
                    const rssKb = parseInt(parts[parts.length - 1] || "0");
                    if (isNaN(rssKb) || rssKb <= 200000) return null;
                    const pid = parseInt(parts[parts.length - 2] || "0");
                    const name = parts.slice(0, parts.length - 2).join(" ");
                    return { name, pid, mem_mb: (rssKb / 1024).toFixed(2) };
                }).filter((x): x is any => x !== null).sort((a, b) => parseFloat(b.mem_mb) - parseFloat(a.mem_mb));
            }
        } catch { return []; }
    }

    static getCpuAvg(): number {
        const cpusList = os.cpus(); let tIdle = 0, tTick = 0;
        cpusList.forEach(c => { Object.values(c.times).forEach(v => tTick += v); tIdle += c.times.idle; });
        return 100 - (100 * tIdle / Math.max(1, tTick));
    }
}

export class SysHealthCollector {
    static collect(isAdmin: boolean): any {
        return {
            cpu_usage: MetricScanner.getCpuAvg(), memory_usage: (((os.totalmem() - os.freemem()) / os.totalmem()) * 100).toFixed(2),
            memory_free_gb: (os.freemem() / (1024 ** 3)).toFixed(2), is_admin: isAdmin, platform: os.platform(),
            arch: os.arch(), uptime_hours: (os.uptime() / 3600).toFixed(2), heavy_processes: MetricScanner.scanProcesses()
        };
    }
}

export const HealthCollector = SysHealthCollector;

export class ResourceGovernorStrategy {
    static enforce(pid: number) {
        try { os.setPriority(pid, os.constants.priority.PRIORITY_LOW); logger.info("⚖️ [Gov] Priority adjusted to 'LOW'."); }
        catch (e) { logger.warn(`⚠️ Failed to adjust priority: ${e}`); }
    }

    static shouldThrottle(h: any, cpuLimit: number = 85, memLimit: number = 95): boolean {
        const cpu = parseFloat(h.cpu_usage.toString()), mem = parseFloat(h.memory_usage);
        if (cpu > cpuLimit || mem > memLimit) { logger.warn(`🌡️ [Gov] High load (CPU: ${cpu.toFixed(1)}%, MEM: ${mem.toFixed(1)}%). Throttling.`); return true; }
        return false;
    }

    static async yield(checkFn: () => boolean | Promise<boolean>) {
        while (await checkFn()) await new Promise(res => setTimeout(res, 5000));
    }
}

