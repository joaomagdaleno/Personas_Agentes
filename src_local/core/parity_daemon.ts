import winston from "winston";
import { HubWatcher } from "../utils/hub_watcher.ts";
import { RegistryManager } from "./registry_manager.ts";
import { StabilityLedger } from "../utils/stability_ledger.ts";
import { HubManagerGRPC } from "./hub_manager_grpc.ts";
import * as path from "node:path";
import * as fs from "node:fs";

const logger = winston.child({ module: "ParityDaemon" });

/**
 * ⚖️ ParityDaemon PhD.
 * Monitora e garante a paridade semântica entre implementações de agentes em diferentes stacks.
 */
export class ParityDaemon {
    private registryManager: RegistryManager;
    private backlog: string[] = [];
    private isProcessing = false;

    constructor(
        private projectRoot: string, 
        private watcher: HubWatcher, 
        private ledger: StabilityLedger,
        private hubManager: HubManagerGRPC
    ) {
        this.registryManager = new RegistryManager(projectRoot);
    }

    public start() {
        logger.info("🚀 [ParityDaemon] Iniciando monitoramento profundo de paridade...");
        this.watcher.onChange(async (filePath) => {
            if (this.isAgentFile(filePath)) {
                this.backlog.push(filePath);
                this.processBacklog();
            }
        });
    }

    private isAgentFile(filePath: string): boolean {
        const norm = filePath.replace(/\\/g, '/');
        return norm.includes("src_local/agents") && (norm.endsWith(".ts") || norm.endsWith(".py") || norm.endsWith(".go"));
    }

    private async processBacklog() {
        if (this.isProcessing || this.backlog.length === 0) return;
        this.isProcessing = true;

        const filePath = this.backlog.shift()!;
        try {
            logger.info(`⚖️ [Parity] Validando paridade semântica: ${path.basename(filePath)}`);
            const content = fs.readFileSync(filePath, 'utf-8');
            
            // 1. Obter "irmãos" de implementação do registro
            const siblings = this.registryManager.getAgentSiblings(filePath);
            
            if (siblings.length > 0) {
                for (const sibling of siblings) {
                    await this.checkParity(filePath, content, sibling);
                }
            }
        } catch (err) {
            logger.error(`❌ [Parity] Erro ao processar ${filePath}: ${err}`);
        } finally {
            this.isProcessing = false;
            if (this.backlog.length > 0) {
                setTimeout(() => this.processBacklog(), 2000);
            }
        }
    }

    private async checkParity(sourcePath: string, sourceContent: string, targetPath: string) {
        if (!fs.existsSync(targetPath)) return;
        const targetContent = fs.readFileSync(targetPath, 'utf-8');

        const prompt = `Perform a high-fidelity semantic parity comparison between these two agent implementations:
        Source (${path.extname(sourcePath)}): ${sourceContent.substring(0, 2000)}...
        Target (${path.extname(targetPath)}): ${targetContent.substring(0, 2000)}...
        
        Are they functionally equivalent? Identify discrepancies in logic, thresholds, or data handling.
        Return a JSON with { "equivalent": boolean, "discrepancies": string[], "severity": "LOW"|"MEDIUM"|"HIGH" }`;

        try {
            const response = await this.hubManager.reason(prompt);
            const result = JSON.parse(response || '{"equivalent":true, "discrepancies":[]}');

            if (!result.equivalent) {
                logger.warn(`⚖️ [Parity] Disparidade detectada entre ${path.basename(sourcePath)} e ${path.basename(targetPath)}`);
                this.ledger.registerDisparity({
                    source: sourcePath,
                    target: targetPath,
                    discrepancies: result.discrepancies,
                    severity: result.severity || "MEDIUM"
                });
            }
        } catch (e) {
            logger.debug(`[Parity] Falha na comparação semântica: ${e}`);
        }
    }
}
