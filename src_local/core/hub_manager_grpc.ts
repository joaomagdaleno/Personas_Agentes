import { GrpcTransport } from "@protobuf-ts/grpc-transport";
import { HubServiceClient } from "../proto/hub.client";
import { ChannelCredentials } from "@grpc/grpc-js";
import winston from "winston";
import * as fs from "fs";
import * as path from "path";

const logger = winston.child({ module: "HubManagerGRPC" });

/**
 * HubManagerGRPC handles all native communication via gRPC.
 * This is the primary interface for binary, low-latency interaction with the Go Hub.
 * Supports mTLS when certificates are present in src_native/hub/tls_certs/.
 */
export class HubManagerGRPC {
    private client: HubServiceClient;

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
    watchHealth(onUpdate: (update: any) => void) {
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
    watchEvents(onEvent: (event: any) => void) {
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
    async analyzeStream(files: { file: string; content?: string }[]): Promise<any[]> {
        return new Promise((resolve) => {
            try {
                const call = this.client.analyzeStream();
                const results: any[] = [];

                call.responses.onMessage((response: any) => {
                    try {
                        results.push(JSON.parse(response.jsonData));
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
    async audit(auditRequest: any) {
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
    async batch(batchRequest: any) {
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
            const { response } = await this.client.reason({ prompt });
            return response.jsonData;
        } catch (e) {
            logger.error(`❌ gRPC reason failed: ${e}`);
            return null;
        }
    }

    /**
     * Executes native AI auto-healing generation.
     */
    async executeHealing(plan: any) {
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
    async patterns(patternRequest: any) {
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
    async penalty(penaltyRequest: any) {
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
    async calculateScore(scoreRequest: any) {
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
    async auditCoverage(coverageRequest: any) {
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
}
