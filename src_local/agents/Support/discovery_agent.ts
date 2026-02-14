import winston from "winston";

const logger = winston.child({ module: "DiscoveryAgent" });

export class DiscoveryAgent {
    orc: any;

    constructor(orchestrator: any) {
        this.orc = orchestrator;
    }

    async runDiscoveryPhase(): Promise<[any, any[]]> {
        logger.info("🔭 Iniciando fase de descoberta...");

        const ctx = await this.orc.contextEngine.analyzeProject();
        let findings = await this.orc.runStrategicAudit(ctx, null, false);

        const obfuscationFindings = await this.orc.runObfuscationScan();
        findings = [...findings, ...obfuscationFindings];

        return [ctx, findings];
    }
}
