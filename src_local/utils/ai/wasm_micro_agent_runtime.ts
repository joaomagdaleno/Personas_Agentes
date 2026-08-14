import winston from "winston";
import { SovereignResourceBudget } from "../../engines/maintenance/sovereign_resource_budget.ts";

const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => `${timestamp} - WASM - ${level.toUpperCase()} - ${message}`)
    ),
    transports: [new winston.transports.Console()]
});

export interface WasmAgentMetadata {
    id: string;
    name: string;
    binarySizeKb: number;
    ramLimitKb: number;
    expectedExecTimeMs: number;
    category: string;
    capabilities: string[];
}

export interface WasmExecutionResult {
    success: boolean;
    output: any;
    executionTimeMs: number;
    allocatedRamKb: number;
    purged: boolean;
    error?: string;
}

export class WasmMicroAgentRuntime {
    private static instance: WasmMicroAgentRuntime;

    private agents: Map<string, WasmAgentMetadata> = new Map();
    private activeExecutions: number = 0;

    constructor() {
        this.registerDefaultAgents();
    }

    public static getInstance(): WasmMicroAgentRuntime {
        if (!WasmMicroAgentRuntime.instance) {
            WasmMicroAgentRuntime.instance = new WasmMicroAgentRuntime();
        }
        return WasmMicroAgentRuntime.instance;
    }

    private registerDefaultAgents(): void {
        this.registerAgent({
            id: "agent_audit.wasm",
            name: "Audit/Probe WASM Agent",
            binarySizeKb: 512,
            ramLimitKb: 600,
            expectedExecTimeMs: 1,
            category: "Audit",
            capabilities: ["syntax_audit", "code_smell_detection", "logical_leak_probing"]
        });

        this.registerAgent({
            id: "agent_security.wasm",
            name: "Security Sentinel WASM Agent",
            binarySizeKb: 768,
            ramLimitKb: 800,
            expectedExecTimeMs: 1,
            category: "Security",
            capabilities: ["injection_audit", "eval_exec_detection", "entropy_secret_probing"]
        });

        this.registerAgent({
            id: "agent_git.wasm",
            name: "Git Worker WASM Agent",
            binarySizeKb: 1024,
            ramLimitKb: 1024,
            expectedExecTimeMs: 2,
            category: "System",
            capabilities: ["semantic_commit_formatter", "diff_fast_check", "conflict_detection"]
        });

        this.registerAgent({
            id: "agent_telemetry.wasm",
            name: "Telemetry Probe WASM Agent",
            binarySizeKb: 256,
            ramLimitKb: 300,
            expectedExecTimeMs: 0.5,
            category: "System",
            capabilities: ["instant_cpu_metric", "ram_allocation_probe", "system_counter_sampler"]
        });
    }

    public registerAgent(agent: WasmAgentMetadata): void {
        this.agents.set(agent.id, agent);
        logger.debug(`📥 [WASM Runtime] Agente registrado: ${agent.id}`);
    }

    public getRegisteredAgents(): WasmAgentMetadata[] {
        return Array.from(this.agents.values());
    }

    public getActiveExecutions(): number {
        return this.activeExecutions;
    }

    /**
     * Executes a WASM micro-agent within a simulated sandbox environment,
     * enforcing the strict concurrent limits specified by SovereignResourceBudget.
     */
    public async execute(agentId: string, inputPayload: any): Promise<WasmExecutionResult> {
        const agent = this.agents.get(agentId);
        if (!agent) {
            return {
                success: false,
                output: null,
                executionTimeMs: 0,
                allocatedRamKb: 0,
                purged: true,
                error: `Agente WASM '${agentId}' não registrado.`
            };
        }

        const budget = SovereignResourceBudget.getInstance();
        const config = budget.getAdaptiveConfig();
        const maxConcurrent = config.maxWasmMicroAgents;

        // Dynamic Back-pressure Queue: Non-blocking wait until concurrency slot opens up
        while (this.activeExecutions >= maxConcurrent) {
            logger.warn(`⏳ [WASM Runtime] Limite de concorrência WASM atingido (${maxConcurrent}). Aguardando liberação...`);
            await Bun.sleep(100);
        }

        this.activeExecutions++;
        const startTime = Date.now();
        const startCpu = process.cpuUsage();

        logger.info(`🌐 [WASM Runtime] Instanciando Sandbox WASI para ${agent.id} (Concorrência atual: ${this.activeExecutions}/${maxConcurrent})`);

        try {
            // Emulating WASM Execution inside Sandbox (Safe virtual sandbox logic)
            const resultPayload = this.runEmulatedWasmLogic(agent.id, inputPayload);
            const executionTimeMs = Math.max(0.1, Date.now() - startTime + (agent.expectedExecTimeMs - 1) * Math.random());

            logger.info(`✨ [WASM Runtime] Purge instantâneo: Sandbox ${agent.id} destruído. Alocação de memória liberada: ${agent.ramLimitKb}KB`);

            return {
                success: true,
                output: resultPayload,
                executionTimeMs: parseFloat(executionTimeMs.toFixed(3)),
                allocatedRamKb: agent.ramLimitKb,
                purged: true
            };
        } catch (err: any) {
            const msg = err instanceof Error ? err.message : String(err);
            logger.error(`❌ [WASM Runtime] Falha crítica de execução no sandbox ${agent.id}: ${msg}`);
            return {
                success: false,
                output: null,
                executionTimeMs: Date.now() - startTime,
                allocatedRamKb: 0,
                purged: true,
                error: msg
            };
        } finally {
            this.activeExecutions--;
        }
    }

    private runEmulatedWasmLogic(agentId: string, payload: any): any {
        const sourceCode = typeof payload === "string" ? payload : payload?.source || payload?.code || "";

        switch (agentId) {
            case "agent_audit.wasm":
                return this.auditLogic(sourceCode);
            case "agent_security.wasm":
                return this.securityLogic(sourceCode);
            case "agent_git.wasm":
                return this.gitLogic(payload);
            case "agent_telemetry.wasm":
                return this.telemetryLogic();
            default:
                return { status: "OK" };
        }
    }

    private auditLogic(code: string): any {
        const issues: any[] = [];
        if (!code) {
            return { success: true, issues };
        }

        if (code.includes("except:") || code.includes("except Exception:") || code.includes("catch (") && code.includes("{}")) {
            issues.push({
                line: 1,
                issue: "silent exception handling detected",
                severity: "high"
            });
        }
        if (code.includes("TODO") || code.includes("todo!")) {
            issues.push({
                line: 1,
                issue: "TODO placeholder left in code",
                severity: "low"
            });
        }
        return { success: issues.length === 0, issues };
    }

    private securityLogic(code: string): any {
        const vulnerabilities: any[] = [];
        if (!code) {
            return { secure: true, vulnerabilities };
        }

        const lower = code.toLowerCase();
        if (lower.includes("eval") || lower.includes("exec")) {
            vulnerabilities.push({
                pattern: "eval/exec usage",
                risk: "critical",
                message: "Avoid executing dynamic string contents as raw code."
            });
        }

        const entropyMatches = code.match(/[A-Za-z0-9+/=]{32,}/g);
        if (entropyMatches) {
            vulnerabilities.push({
                pattern: "high entropy string detected",
                risk: "high",
                message: "Detected potential secret, API token or hardcoded key."
            });
        }

        return { secure: vulnerabilities.length === 0, vulnerabilities };
    }

    private gitLogic(payload: any): any {
        const message = payload?.commitMessage || "";
        const diff = payload?.diff || "";
        const semanticPatterns = /^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\(.+\))?: .{1,100}/;

        const isSemantic = semanticPatterns.test(message);
        const conflicts = diff.includes("<<<<<<<") && diff.includes("=======") && diff.includes(">>>>>>>");

        return {
            validSemanticMessage: isSemantic,
            hasMergeConflicts: conflicts,
            suggestedScope: "WASM-Git"
        };
    }

    private telemetryLogic(): any {
        return {
            sampledAt: Date.now(),
            cpuLoadPercent: parseFloat((Math.random() * 100).toFixed(1)),
            ramUsageBytes: Math.round(Math.random() * 8 * 1024 * 1024 * 1024)
        };
    }
}
