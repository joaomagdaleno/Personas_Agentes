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

const logger = winston.child({ module: "HubManagerGRPC" });

/**
 * HubManagerGRPC handles all native communication via gRPC.
 * This is the primary interface for binary, low-latency interaction with the Go Hub.
 * Supports mTLS when certificates are present in src_native/hub/tls_certs/.
 */
export class HubManagerGRPC {
    private client: HubServiceClient;
    private ruleProvider: RuleProviderClient;

    constructor(host: string = "localhost:50051") {
        let channelCredentials: ChannelCredentials;

        // Auto-detect mTLS certificates
        const certDir = path.resolve(__dirname, "../../src_native/hub/tls_certs");
        const caPath = path.join(certDir, "ca.crt");
        const clientCertPath = path.join(certDir, "client.crt");
        const clientKeyPath = path.join(certDir, "client.key");

        if (fs.existsSync(caPath) && fs.existsSync(clientCertPath) && fs.existsSync(clientKeyPath)) {
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

        const transport = new GrpcTransport({
            host,
            channelCredentials,
        });
        this.client = new HubServiceClient(transport);
        this.ruleProvider = new RuleProviderClient(transport);
        logger.info(`📡 HubManagerGRPC initialized on ${host}`);
    }

    /**
     * Gets the current healthy status of the Hub.
     */
    async getStatus() {
        try {
            const { response } = await this.client.getStatus({});
            return response;
        } catch (e) {
            logger.error(`❌ gRPC getStatus failed: ${e}`);
            return null;
        }
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
        try {
            const { response } = await this.client.scanProject({ directory, root });
            return response.files;
        } catch (e) {
            logger.error(`❌ gRPC scanProject failed: ${e}`);
            return [];
        }
    }

    /**
     * Analyzes a specific file using the Rust backend.
     */
    async analyzeFile(file: string, content?: string) {
        try {
            const { response } = await this.client.analyzeFile({ file, content: content || "" });
            return JSON.parse(response.jsonData);
        } catch (e) {
            logger.error(`❌ gRPC analyzeFile failed: ${e}`);
            return null;
        }
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
        try {
            const { response } = await this.client.getDependencies({ file, content: "" });
            return JSON.parse(response.jsonData);
        } catch (e) {
            logger.error(`❌ gRPC getDependencies failed: ${e}`);
            return null;
        }
    }

    /**
     * Deduplicates a list of findings using the Rust analyzer.
     */
    async deduplicate(findings: any[]) {
        try {
            const { response } = await this.client.deduplicate({ findingsJson: JSON.stringify(findings) });
            return JSON.parse(response.jsonData);
        } catch (e) {
            logger.error(`❌ gRPC deduplicate failed: ${e}`);
            return [];
        }
    }

    /**
     * Generates an AST fingerprint for an agent or directory.
     */
    async fingerprint(path: string, content?: string) {
        try {
            const { response } = await this.client.fingerprint({ file: path, content: content || "" });
            return JSON.parse(response.jsonData);
        } catch (e) {
            logger.error(`❌ gRPC fingerprint failed: ${e}`);
            return null;
        }
    }

    /**
     * Discovers the project's identity (DNA).
     */
    async discoverIdentity(path: string) {
        try {
            const { response } = await this.client.discoverIdentity({ file: path, content: "" });
            return JSON.parse(response.jsonData);
        } catch (e) {
            logger.error(`❌ gRPC discoverIdentity failed: ${e}`);
            return null;
        }
    }

    /**
     * Indexes the project for search and patterns.
     */
    async indexProject(path: string) {
        try {
            const { response } = await this.client.indexProject({ file: path, content: "" });
            return JSON.parse(response.jsonData);
        } catch (e) {
            logger.error(`❌ gRPC indexProject failed: ${e}`);
            return null;
        }
    }

    /**
     * Scans the project topology.
     */
    async scanTopology(path: string) {
        try {
            const { response } = await this.client.scanTopology({ file: path, content: "" });
            return JSON.parse(response.jsonData);
        } catch (e) {
            logger.error(`❌ gRPC scanTopology failed: ${e}`);
            return null;
        }
    }

    /**
     * Gets architectural context (TF-IDF) for a file.
     */
    async getContext(path: string): Promise<string[]> {
        try {
            const { response } = await this.client.getContext({ file: path, content: "" });
            return JSON.parse(response.jsonData);
        } catch (e) {
            logger.error(`❌ gRPC getContext failed: ${e}`);
            return [];
        }
    }

    /**
     * Gets systemic metrics (coupling, instability) for a set of files.
     */
    async getConnectivity(dependencyMap: Record<string, any>) {
        try {
            const { response } = await this.client.getConnectivity({ dependencyMapJson: JSON.stringify(dependencyMap) });
            return JSON.parse(response.jsonData);
        } catch (e) {
            logger.error(`❌ gRPC getConnectivity failed: ${e}`);
            return [];
        }
    }

    /**
     * Performs a security audit or obfuscation scan.
     */
    async audit(auditRequest: Record<string, unknown>): Promise<AuditFinding[]> {
        try {
            const { response } = await this.client.audit({ auditJson: JSON.stringify(auditRequest) });
            return JSON.parse(response.jsonData);
        } catch (e) {
            logger.error(`❌ gRPC audit failed: ${e}`);
            return [];
        }
    }

    /**
     * Performs a batch analysis of multiple files.
     */
    async batch(batchRequest: Record<string, unknown>): Promise<AuditFinding[]> {
        try {
            const { response } = await this.client.batch({ batchJson: JSON.stringify(batchRequest) });
            return JSON.parse(response.jsonData);
        } catch (e) {
            logger.error(`❌ gRPC batch failed: ${e}`);
            return [];
        }
    }

    /**
     * Gets the Sovereign Knowledge Graph.
     */
    async getKnowledgeGraph(focus: string = "", depth: number = 1) {
        try {
            const { response } = await this.client.getKnowledgeGraph({
                graphJson: JSON.stringify({ focus, depth })
            });
            return JSON.parse(response.jsonData);
        } catch (e) {
            logger.error(`❌ gRPC getKnowledgeGraph failed: ${e}`);
            return { nodes: [], edges: [] };
        }
    }

    async queryKnowledgeGraph(query: string, priority: string = "medium") {
        try {
            const requestPayload = priority !== "medium" 
                ? JSON.stringify({ query, priority })
                : query;
            const { response } = await this.client.queryKnowledgeGraph({ queryJson: requestPayload });
            return JSON.parse(response.jsonData);
        } catch (e) {
            logger.error(`❌ gRPC queryKnowledgeGraph failed: ${e}`);
            return [];
        }
    }

    /**
     * Performs a native AI reasoning task.
     */
    async reason(prompt: string) {
        try {
            const { response } = await this.client.reason({ prompt, useRag: false });
            return response.jsonData;
        } catch (e) {
            logger.error(`❌ gRPC reason failed: ${e}`);
            return null;
        }
    }

    /**
     * Executes native AI auto-healing generation.
     */
    async executeHealing(plan: HealingPlan): Promise<string | null> {
        try {
            const { response } = await this.client.executeHealing(plan);
            return response.jsonData;
        } catch (e) {
            logger.error(`❌ gRPC executeHealing failed: ${e}`);
            return null;
        }
    }

    /**
     * Performs a project-wide pattern matching task.
     */
    async patterns(patternRequest: Record<string, unknown>): Promise<AuditFinding[]> {
        try {
            const { response } = await this.client.patterns({ patternJson: JSON.stringify(patternRequest) });
            return JSON.parse(response.jsonData);
        } catch (e) {
            logger.error(`❌ gRPC patterns failed: ${e}`);
            return [];
        }
    }

    /**
     * Performs a native systemic health penalty calculation.
     */
    async penalty(penaltyRequest: Record<string, unknown>): Promise<any> {
        try {
            const { response } = await this.client.penalty({ penaltyJson: JSON.stringify(penaltyRequest) });
            return JSON.parse(response.jsonData);
        } catch (e) {
            logger.error(`❌ gRPC penalty failed: ${e}`);
            return null;
        }
    }

    /**
     * Performs a native high-fidelity health score calculation.
     */
    async calculateScore(scoreRequest: Record<string, unknown>): Promise<any> {
        try {
            const { response } = await this.client.calculateScore({ scoreJson: JSON.stringify(scoreRequest) });
            return JSON.parse(response.jsonData);
        } catch (e) {
            logger.error(`❌ gRPC calculateScore failed: ${e}`);
            return null;
        }
    }

    /**
     * Performs a native PhD-grade test coverage audit.
     */
    async auditCoverage(coverageRequest: Record<string, unknown>): Promise<{ has_test: boolean }> {
        try {
            const { response } = await this.client.auditCoverage({ coverageJson: JSON.stringify(coverageRequest) });
            return JSON.parse(response.jsonData);
        } catch (e) {
            logger.error(`❌ gRPC auditCoverage failed: ${e}`);
            return { has_test: false };
        }
    }

    /**
     * Enqueues a task in the native scheduler.
     */
    async enqueueTask(taskType: string, targetFile: string) {
        try {
            const { response } = await this.client.enqueueTask({ taskType, targetFile });
            return response.success;
        } catch (e) {
            logger.error(`❌ gRPC enqueueTask failed: ${e}`);
            return false;
        }
    }

    /**
     * Gets pending tasks from the native scheduler.
     */
    async getPendingTasks(limit: number = 5) {
        try {
            return await this.client.getPendingTasks({ limit });
        } catch (e) {
            logger.error(`❌ gRPC getPendingTasks failed: ${e}`);
            return { tasks: [] };
        }
    }

    /**
     * Updates a task status in the native scheduler.
     */
    async updateTask(taskId: number, status: string, result: string) {
        try {
            return await this.client.updateTask({ taskId, status, result });
        } catch (e) {
            logger.error(`❌ gRPC updateTask failed: ${e}`);
            return null;
        }
    }

    /**
     * Gets persona-specific audit rules from the Hub.
     */
    async getRules(personaId: string, stack: string) {
        try {
            const { response } = await this.ruleProvider.getRules({ personaId, stack });
            return response;
        } catch (e) {
            logger.error(`❌ gRPC getRules failed for ${personaId}/${stack}: ${e}`);
            return null;
        }
    }

    /**
     * Delegates code analysis to the Hub's PhD reasoning engine.
     */
    async analyzeCode(content: string, personaId: string, stack: string) {
        try {
            const { response } = await this.ruleProvider.analyzeCode({ content, personaId, stack });
            const data = JSON.parse(response.jsonData);
            return Array.isArray(data) ? data : [];
        } catch (e) {
            logger.error(`❌ gRPC analyzeCode failed for ${personaId}/${stack}: ${e}`);
            return [];
        }
    }

    /**
     * Broadcasts a signal to the fleet via the Hub.
     */
    async broadcastSignal(senderId: string, signalType: string, payload: Record<string, unknown> = {}) {
        try {
            await this.client.broadcastSignal({
                senderId,
                signalType,
                payloadJson: JSON.stringify(payload)
            });
            return true;
        } catch (e) {
            logger.error(`❌ gRPC broadcastSignal failed: ${e}`);
            return false;
        }
    }

    /**
     * Records a decision in the agent's semantic memory.
     */
    async remember(entry: MemoryEntry) {
        try {
            await this.client.remember(entry);
            return true;
        } catch (e) {
            logger.error(`❌ gRPC remember failed: ${e}`);
            return false;
        }
    }

    /**
     * Retrieves previous decisions from the agent's semantic memory.
     */
    async retrieve(agentId: string, query: string, limit: number = 5): Promise<MemoryEntry[]> {
        const results: MemoryEntry[] = [];
        try {
            const call = this.client.retrieve({ agentId, query, limit });
            for await (const entry of call.responses) {
                results.push(entry);
            }
        } catch (e) {
            logger.error(`❌ gRPC retrieve failed: ${e}`);
        }
        return results;
    }

    /**
     * Generates a vector representation (embedding) for a text.
     */
    async embed(text: string): Promise<number[]> {
        try {
            const { response } = await this.client.embed({ text });
            return response.embedding;
        } catch (e) {
            logger.error(`❌ gRPC embed failed: ${e}`);
            return [];
        }
    }

    /**
     * Requests a peer review from another persona.
     */
    async requestPeerReview(requesterId: string, targetPersonaId: string, filePath: string, context: string, priority: string = "MEDIUM") {
        try {
            const { response } = await this.client.requestPeerReview({
                requesterId,
                targetPersonaId,
                filePath,
                context,
                priority
            });
            return response;
        } catch (e) {
            logger.error(`❌ gRPC requestPeerReview failed: ${e}`);
            return null;
        }
    }
}
