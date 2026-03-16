import { GrpcTransport } from "@protobuf-ts/grpc-transport";
import { HubServiceClient, RuleProviderClient } from "../proto/hub.client";
import { ChannelCredentials } from "@grpc/grpc-js";
import winston from "winston";
import * as fs from "fs";
import * as path from "path";
import type { 
    HealthUpdate, 
    Event, 
    AnalyzeResponse,
    HealingPlan,
    AuditRequest,
    BatchRequest,
    ConnectivityRequest,
    PatternRequest,
    PenaltyRequest,
    ScoreRequest, 
    CoverageRequest,
    MemoryEntry,
    MemoryQuery,
    EmbedRequest,
    EmbedResponse
} from "../proto/hub";
import type { AuditFinding } from "./types";
import { ENV_GATE } from "./env_gate";

const logger = winston.child({ module: "HubManagerGRPC" });

/**
 * HubManagerGRPC handles all native communication via gRPC.
 * This is the primary interface for binary, low-latency interaction with the Go Hub.
 * Supports mTLS when certificates are present in src_native/hub/tls_certs/.
 */
export class HubManagerGRPC {
    private static instance: HubManagerGRPC | null = null;
    private client: HubServiceClient;
    private transport: any;
    private ruleProvider: RuleProviderClient;

    // Circuit Breaker State
    private failureCount: number = 0;
    private lastFailureTime: number = 0;
    private circuitStatus: "CLOSED" | "OPEN" | "HALF_OPEN" = "CLOSED";
    private readonly FAILURE_THRESHOLD = 5;
    private readonly COOLDOWN_MS = 30000; // 30s

    private constructor(host: string = ENV_GATE.HUB_GRPC_HOST) {
        let channelCredentials: ChannelCredentials;

        // Auto-detect mTLS certificates
        const certDir = path.resolve(__dirname, "../../src_native/hub/tls_certs");
        const caPath = path.join(certDir, "ca.crt");
        const clientCertPath = path.join(certDir, "client.crt");
        const clientKeyPath = path.join(certDir, "client.key");

        const hasCerts = fs.existsSync(caPath) && fs.existsSync(clientCertPath) && fs.existsSync(clientKeyPath);

        if (hasCerts) {
            channelCredentials = ChannelCredentials.createSsl(
                fs.readFileSync(caPath),
                fs.readFileSync(clientKeyPath),
                fs.readFileSync(clientCertPath)
            );
            logger.info("🔒 mTLS credentials loaded for gRPC client");
        } else {
            channelCredentials = ChannelCredentials.createInsecure();
            logger.info("⚠️ No mTLS certs found, using insecure channel (dev mode)");
        }

        this.transport = new GrpcTransport({
            host,
            channelCredentials,
        });
        this.client = new HubServiceClient(this.transport);
        this.ruleProvider = new RuleProviderClient(this.transport);
        logger.info(`📡 HubManagerGRPC initialized on ${host}`);
    }

    public static getInstance(host?: string): HubManagerGRPC {
        if (!HubManagerGRPC.instance) {
            HubManagerGRPC.instance = new HubManagerGRPC(host);
        }
        return HubManagerGRPC.instance;
    }

    /**
     * Internal wrapper for circuit breaker and trace correlation.
     */
    private async _call<T>(operation: (meta: Record<string, string>) => Promise<T>, name: string): Promise<T | null> {
        if (this.circuitStatus === "OPEN") {
            const now = Date.now();
            if (now - this.lastFailureTime > this.COOLDOWN_MS) {
                this.circuitStatus = "HALF_OPEN";
                logger.warn(`🔧 [CircuitBreaker] Tentando recuperação para ${name} (HALF_OPEN)...`);
            } else {
                return null;
            }
        }

        const traceId = crypto.randomUUID();
        const meta = { "x-trace-id": traceId };

        try {
            const result = await operation(meta);
            
            // Sucesso: Reseta contador se estava em falha
            if (this.circuitStatus !== "CLOSED") {
                logger.info(`✅ [CircuitBreaker] Operação ${name} restaurada. Resetando status.`);
                this.circuitStatus = "CLOSED";
                this.failureCount = 0;
            }
            
            return result;
        } catch (e: any) {
            this.failureCount++;
            this.lastFailureTime = Date.now();
            
            logger.error(`❌ [${name}] [Trace:${traceId}] Falha: ${e.message}`);

            if (this.failureCount >= this.FAILURE_THRESHOLD) {
                this.circuitStatus = "OPEN";
                logger.error(`🚨 [CircuitBreaker] Operação ${name} atingiu limite de falhas. CIRCUITO ABERTO.`);
            }
            
            return null;
        }
    }

    /**
     * Checks if the Hub is reachable and healthy.
     */
    async isHealthy(): Promise<boolean> {
        try {
            const status = await this.getStatus();
            return status?.status === "HEALTHY";
        } catch {
            return false;
        }
    }

    /**
     * Gets the current healthy status of the Hub.
     */
    async getStatus() {
        return this._call(async (meta) => {
            const { response } = await this.client.getStatus({}, { meta });
            return response;
        }, "getStatus");
    }

    /**
     * Watches the health stream for real-time updates.
     */
    watchHealth(onUpdate: (update: HealthUpdate) => void) {
        const call = this.client.watchHealth({});
        call.responses.onMessage((message) => {
            onUpdate(message);
        });
        call.responses.onError((error) => {
            logger.error(`❌ Health stream error: ${error}`);
        });
        return call;
    }

    /**
     * Watches the event stream (file changes, alerts).
     */
    watchEvents(onEvent: (event: Event) => void) {
        const call = this.client.watchEvents({});
        call.responses.onMessage((message) => {
            onEvent(message);
        });
        call.responses.onError((error) => {
            logger.error(`❌ Event stream error: ${error}`);
        });
        return call;
    }

    /**
     * Scans the project directory.
     */
    async scanProject(directory: string, root: string) {
        const res = await this._call(async (meta) => {
            const { response } = await this.client.scanProject({ directory, root }, { meta });
            return response.files;
        }, "scanProject");
        return res || [];
    }

    /**
     * Analyzes a specific file using the Rust backend.
     */
    async analyzeFile(file: string, content?: string) {
        const res = await this._call(async (meta) => {
            const { response } = await this.client.analyzeFile({ file, content: content || "" }, { meta });
            return JSON.parse(response.jsonData);
        }, "analyzeFile");
        if (!res) throw new Error(`analyzeFile failed for ${file}`);
        return res;
    }

    /**
     * Bi-directional streaming analysis for batch file processing.
     * Sends files concurrently and collects results as they arrive.
     */
    async analyzeStream(files: { file: string; content?: string }[]): Promise<AuditFinding[]> {
        return new Promise((resolve) => {
            try {
                const call = this.client.analyzeStream();
                const results: AuditFinding[] = [];

                call.responses.onMessage((response: AnalyzeResponse) => {
                    try {
                        const batchResults: AuditFinding[] = JSON.parse(response.jsonData);
                        results.push(...batchResults);
                    } catch { /* skip malformed */ }
                });

                call.responses.onComplete(() => {
                    resolve(results);
                });

                call.responses.onError((err: any) => {
                    logger.error(`❌ gRPC analyzeStream error: ${err}`);
                    resolve(results); // Return partial results
                });

                // Send all files
                for (const f of files) {
                    call.requests.send({ file: f.file, content: f.content || "" });
                }
                call.requests.complete();
            } catch (e) {
                logger.error(`❌ gRPC analyzeStream failed: ${e}`);
                resolve([]);
            }
        });
    }

    /**
     * Gets AST-based dependencies for a file.
     */
    async getDependencies(file: string) {
        return this._call(async (meta) => {
            const { response } = await this.client.getDependencies({ file, content: "" }, { meta });
            return JSON.parse(response.jsonData);
        }, "getDependencies");
    }

    /**
     * Deduplicates a list of findings using the Rust analyzer.
     */
    async deduplicate(findings: AuditFinding[]) {
        const res = await this._call(async (meta) => {
            const { response } = await this.client.deduplicate({ findingsJson: JSON.stringify(findings) }, { meta });
            return JSON.parse(response.jsonData) as AuditFinding[];
        }, "deduplicate");
        return res || [];
    }

    /**
     * Generates an AST fingerprint for an agent or directory.
     */
    async fingerprint(path: string, content?: string) {
        return this._call(async (meta) => {
            const { response } = await this.client.fingerprint({ file: path, content: content || "" }, { meta });
            return JSON.parse(response.jsonData);
        }, "fingerprint");
    }

    /**
     * Discovers the project's identity (DNA).
     */
    async discoverIdentity(path: string) {
        return this._call(async (meta) => {
            const { response } = await this.client.discoverIdentity({ file: path, content: "" }, { meta });
            return JSON.parse(response.jsonData);
        }, "discoverIdentity");
    }

    /**
     * Indexes the project for search and patterns.
     */
    async indexProject(path: string) {
        return this._call(async (meta) => {
            const { response } = await this.client.indexProject({ file: path, content: "" }, { meta });
            return JSON.parse(response.jsonData);
        }, "indexProject");
    }

    /**
     * Scans the project topology.
     */
    async scanTopology(path: string) {
        return this._call(async (meta) => {
            const { response } = await this.client.scanTopology({ file: path, content: "" }, { meta });
            return JSON.parse(response.jsonData);
        }, "scanTopology");
    }

    /**
     * Gets architectural context (TF-IDF) for a file.
     */
    async getContext(path: string): Promise<string[]> {
        const res = await this._call(async (meta) => {
            const { response } = await this.client.getContext({ file: path, content: "" }, { meta });
            return JSON.parse(response.jsonData);
        }, "getContext");
        return res || [];
    }

    /**
     * Gets systemic metrics (coupling, instability) for a set of files.
     */
    async getConnectivity(dependencyMap: Record<string, string[]>) {
        const res = await this._call(async (meta) => {
            const { response } = await this.client.getConnectivity({ dependencyMapJson: JSON.stringify(dependencyMap) }, { meta });
            return JSON.parse(response.jsonData);
        }, "getConnectivity");
        return res || [];
    }

    /**
     * Performs a security audit or obfuscation scan.
     */
    async audit(auditRequest: Record<string, unknown>): Promise<AuditFinding[]> {
        const res = await this._call(async (meta) => {
            const { response } = await this.client.audit({ auditJson: JSON.stringify(auditRequest) }, { meta });
            return JSON.parse(response.jsonData);
        }, "audit");
        return res || [];
    }

    /**
     * Performs a batch analysis of multiple files.
     */
    async batch(batchRequest: Record<string, unknown>): Promise<AuditFinding[]> {
        const res = await this._call(async (meta) => {
            const { response } = await this.client.batch({ batchJson: JSON.stringify(batchRequest) }, { meta });
            return JSON.parse(response.jsonData);
        }, "batch");
        return res || [];
    }

    /**
     * Gets the Sovereign Knowledge Graph.
     */
    async getKnowledgeGraph(focus: string = "", depth: number = 1) {
        return this._call(async (meta) => {
            const { response } = await this.client.getKnowledgeGraph({
                graphJson: JSON.stringify({ focus, depth })
            }, { meta });
            return JSON.parse(response.jsonData);
        }, "getKnowledgeGraph");
    }

    async queryKnowledgeGraph(query: string, priority: string = "medium") {
        return this._call(async (meta) => {
            const requestPayload = priority !== "medium" 
                ? JSON.stringify({ query, priority })
                : query;
            const { response } = await this.client.queryKnowledgeGraph({ queryJson: requestPayload }, { meta });
            return JSON.parse(response.jsonData);
        }, "queryKnowledgeGraph");
    }

    /**
     * Performs a native AI reasoning task.
     */
    async reason(prompt: string) {
        return this._call(async (meta) => {
            const { response } = await this.client.reason({ prompt, useRag: false }, { meta });
            return response.jsonData;
        }, "reason");
    }

    /**
     * Executes native AI auto-healing generation.
     */
    async executeHealing(plan: HealingPlan): Promise<string | null> {
        return this._call(async (meta) => {
            const { response } = await this.client.executeHealing(plan, { meta });
            return response.jsonData;
        }, "executeHealing");
    }

    /**
     * Performs a project-wide pattern matching task.
     */
    async patterns(patternRequest: Record<string, unknown>): Promise<AuditFinding[]> {
        const res = await this._call(async (meta) => {
            const { response } = await this.client.patterns({ patternJson: JSON.stringify(patternRequest) }, { meta });
            return JSON.parse(response.jsonData);
        }, "patterns");
        return res || [];
    }

    /**
     * Performs a native systemic health penalty calculation.
     */
    async penalty(penaltyRequest: Record<string, unknown>): Promise<Record<string, number> | null> {
        return this._call(async (meta) => {
            const { response } = await this.client.penalty({ penaltyJson: JSON.stringify(penaltyRequest) }, { meta });
            return JSON.parse(response.jsonData);
        }, "penalty");
    }

    /**
     * Performs a native high-fidelity health score calculation.
     */
    async calculateScore(scoreRequest: Record<string, unknown>): Promise<Record<string, number> | null> {
        return this._call(async (meta) => {
            const { response } = await this.client.calculateScore({ scoreJson: JSON.stringify(scoreRequest) }, { meta });
            return JSON.parse(response.jsonData);
        }, "calculateScore");
    }

    /**
     * Performs a native PhD-grade test coverage audit.
     */
    async auditCoverage(coverageRequest: Record<string, unknown>): Promise<{ has_test: boolean }> {
        const res = await this._call(async (meta) => {
            const { response } = await this.client.auditCoverage({ coverageJson: JSON.stringify(coverageRequest) }, { meta });
            return JSON.parse(response.jsonData);
        }, "auditCoverage");
        return res || { has_test: false };
    }

    /**
     * Enqueues a task in the native scheduler.
     */
    async enqueueTask(taskType: string, targetFile: string) {
        const res = await this._call(async (meta) => {
            const { response } = await this.client.enqueueTask({ taskType, targetFile }, { meta });
            return response.success;
        }, "enqueueTask");
        return res || false;
    }

    /**
     * Gets pending tasks from the native scheduler.
     */
    async getPendingTasks(limit: number = 5) {
        const res = await this._call(async (meta) => {
            return await this.client.getPendingTasks({ limit }, { meta });
        }, "getPendingTasks");
        return res || { tasks: [] };
    }

    /**
     * Updates a task status in the native scheduler.
     */
    async updateTask(taskId: number, status: string, result: string) {
        return this._call(async (meta) => {
            return await this.client.updateTask({ taskId, status, result }, { meta });
        }, "updateTask");
    }

    /**
     * Gets persona-specific audit rules from the Hub.
     */
    async getRules(personaId: string, stack: string) {
        return this._call(async (meta) => {
            const { response } = await this.ruleProvider.getRules({ personaId, stack }, { meta });
            return response;
        }, "getRules");
    }

    /**
     * Delegates code analysis to the Hub's PhD reasoning engine.
     */
    async analyzeCode(content: string, personaId: string, stack: string) {
        const res = await this._call(async (meta) => {
            const { response } = await this.ruleProvider.analyzeCode({ content, personaId, stack }, { meta });
            const data = JSON.parse(response.jsonData);
            return Array.isArray(data) ? data : [];
        }, "analyzeCode");
        return res || [];
    }

    /**
     * Broadcasts a signal to the fleet via the Hub.
     */
    async broadcastSignal(senderId: string, signalType: string, payload: Record<string, unknown> = {}) {
        const res = await this._call(async (meta) => {
            await this.client.broadcastSignal({
                senderId,
                signalType,
                payloadJson: JSON.stringify(payload)
            }, { meta });
            return true;
        }, "broadcastSignal");
        return res || false;
    }

    /**
     * Records a decision in the agent's semantic memory.
     */
    async remember(entry: MemoryEntry) {
        const res = await this._call(async (meta) => {
            await this.client.remember(entry, { meta });
            return true;
        }, "remember");
        return res || false;
    }

    /**
     * Retrieves previous decisions from the agent's semantic memory.
     */
    async retrieve(agentId: string, query: string, limit: number = 5): Promise<MemoryEntry[]> {
        const results: MemoryEntry[] = [];
        const traceId = crypto.randomUUID();
        const meta = { "x-trace-id": traceId };
        
        try {
            const call = this.client.retrieve({ agentId, query, limit }, { meta });
            for await (const entry of call.responses) {
                results.push(entry);
            }
        } catch (e: any) {
            logger.error(`❌ [retrieve] [Trace:${traceId}] Falha: ${e.message}`);
        }
        return results;
    }

    /**
     * Generates a vector representation (embedding) for a text.
     */
    async embed(text: string): Promise<number[]> {
        const res = await this._call(async (meta) => {
            const { response } = await this.client.embed({ text }, { meta });
            return response.embedding;
        }, "embed");
        return res || [];
    }

    /**
     * Requests a peer review from another persona.
     */
    async requestPeerReview(requesterId: string, targetPersonaId: string, filePath: string, context: string, priority: string = "MEDIUM") {
        return this._call(async (meta) => {
            const { response } = await this.client.requestPeerReview({
                requesterId,
                targetPersonaId,
                filePath,
                context,
                priority
            }, { meta });
            return response;
        }, "requestPeerReview");
    }

    /**
     * Terminates the underlying gRPC transport.
     */
    close() {
        // @ts-ignore - plugin-specific transport cleanup if available
        if (this.transport && typeof this.transport.dispose === "function") {
            (this.transport as any).dispose();
        }
        logger.info("🔌 HubManagerGRPC transport closed.");
    }
}
