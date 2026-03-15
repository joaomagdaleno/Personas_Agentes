import winston from 'winston';
import { HubManagerGRPC } from "../../../core/hub_manager_grpc.ts";

/**
 * 🕵️ Caçador de Ofuscação (ObfuscationHunter)
 * Especialista em detectar reconstrução de strings perigosas.
 * Delegado para o motor gRPC (Go Hub Proxy).
 */
export class ObfuscationHunter {
    private logger = winston.loggers.get('default_logger') || winston;

    constructor(private hubManager?: HubManagerGRPC) { }

    /**
     * Varredura de ofuscação em arquivos TypeScript/JavaScript/Python.
     */
    async scanFile(filePath: string, content: string): Promise<any[]> {
        const { VetoEngine } = await import("../../../utils/veto_engine.ts");
        if (VetoEngine.shouldSkip("", filePath)) return [];

        if (!this.hubManager) return [];

        try {
            const request = {
                files: [{ path: filePath, content }],
                persona_rules: [{
                    agent: "Security Guard",
                    role: "Protector",
                    emoji: "🛡️",
                    stack: "Security",
                    extensions: [".ts", ".js", ".py"],
                    rules: []
                }]
            };

            const findings = await this.hubManager.audit(request);

            return findings.map((f: any) => ({
                file: f.file,
                line: 1,
                issue: f.issue,
                severity: f.severity,
                category: "Security",
                context: "ObfuscationHunter",
                evidence: f.evidence
            }));

        } catch (error) {
            this.logger.error(`❌ [ObfuscationHunter] gRPC audit failed on ${filePath}: ${error}`);
            return [];
        }
    }
}
