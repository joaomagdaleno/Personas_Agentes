import { GrpcTransport } from "@protobuf-ts/grpc-transport";
import { HubServiceClient } from "../proto/hub.client";
import { ChannelCredentials } from "@grpc/grpc-js";
import winston from "winston";

const logger = winston.child({ module: "HubManagerGRPC" });

/**
 * HubManagerGRPC handles all native communication via gRPC.
 * This is the primary interface for binary, low-latency interaction with the Go Hub.
 */
export class HubManagerGRPC {
    private client: HubServiceClient;

    constructor(host: string = "localhost:50051") {
        const transport = new GrpcTransport({
            host,
            channelCredentials: ChannelCredentials.createInsecure(),
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
    async analyzeFile(file: string) {
        try {
            const { response } = await this.client.analyzeFile({ file });
            return JSON.parse(response.jsonData);
        } catch (e) {
            logger.error(`❌ gRPC analyzeFile failed: ${e}`);
            return null;
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
        return await this.client.getPendingTasks({ limit });
    }

    /**
     * Updates a task status in the native scheduler.
     */
    async updateTask(taskId: number, status: string, result: string) {
        return await this.client.updateTask({ taskId, status, result });
    }
}
