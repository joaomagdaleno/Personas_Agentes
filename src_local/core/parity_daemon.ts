import winston from "winston";
import { HubWatcher } from "../utils/hub_watcher.ts";
import { RegistryManager } from "./registry_manager.ts";
import { ParityAnalyst } from "../agents/Support/Analysis/parity_analyst.ts";
import { StabilityLedger } from "../utils/stability_ledger.ts";

const logger = winston.child({ module: "ParityDaemon" });

export class ParityDaemon {
    private watcher: HubWatcher;
    private registryManager: RegistryManager;
    private analyst: ParityAnalyst;
    private ledger: StabilityLedger;
    private backlog: string[] = [];
    private isProcessing = false;

    constructor(projectRoot: string, watcher: HubWatcher, ledger: StabilityLedger) {
        this.watcher = watcher;
        this.ledger = ledger;
        this.registryManager = new RegistryManager(projectRoot);
        this.analyst = new ParityAnalyst(path.join(projectRoot, "src_local/agents"));
    }

    public start() {
        logger.info("🚀 [ParityDaemon] Iniciando monitoramento contínuo...");
        this.watcher.onChange(async (path) => {
            if (this.isAgentFile(path)) {
                this.backlog.push(path);
                this.processBacklog();
            }
        });
    }

    private isAgentFile(filePath: string): boolean {
        return filePath.includes("src_local/agents") && (filePath.endsWith(".ts") || filePath.endsWith(".py") || filePath.endsWith(".kt") || filePath.endsWith(".dart"));
    }

    private async processBacklog() {
        if (this.isProcessing || this.backlog.length === 0) return;
        this.isProcessing = true;

        const filePath = this.backlog.shift()!;
        try {
            logger.info(`⚖️ [ParityDaemon] Analisando paridade em tempo real: ${filePath}`);
            // Logic to run atomic parity check and store in ledger
            // This is a placeholder for the actual healing logic
            // In a real implementation, we would call the Rust Brain here
        } catch (err) {
            logger.error(`❌ [ParityDaemon] Erro ao processar ${filePath}: ${err}`);
        } finally {
            this.isProcessing = false;
            if (this.backlog.length > 0) {
                // Throttle background processing
                setTimeout(() => this.processBacklog(), 5000);
            }
        }
    }
}

import * as path from "node:path";
