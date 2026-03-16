import winston from "winston";
import { VulnerabilityHeuristic } from "../../utils/vulnerability_heuristic.ts";
import { HubManagerGRPC } from "../../core/hub_manager_grpc.ts";
import type { ProjectContext, AuditFinding } from "../../core/types.ts";

const logger = winston.child({ module: "SecuritySentinel" });

/**
 * 🛡️ SecuritySentinelAgent PhD (gRPC Powered).
 * Especialista em segurança que utiliza o VulnerabilityHeuristic gRPC para análise profunda.
 */
export class SecuritySentinelAgent {
    private heuristic: VulnerabilityHeuristic;

    constructor(private hubManager?: HubManagerGRPC) {
        this.heuristic = new VulnerabilityHeuristic(this.hubManager);
        if (this.hubManager) logger.info("🛡️ [Security] Hub gRPC integrado ao Sentinel.");
    }

    /**
     * Realiza um scan preventivo de segurança em arquivos específicos.
     */
    async runSecurityScan(files: string[], context: ProjectContext): Promise<AuditFinding[]> {
        if (!context.map) return [];
        logger.info(`🛡️ [Security] Iniciando scan profundo em ${files.length} arquivos...`);
        let findings: AuditFinding[] = [];

        for (const file of files) {
            const entry = context.map[file];
            const content = entry?.content || "";
            if (!content) continue;

            try {
                const result = await this.heuristic.analyze(file, content);
                findings = findings.concat(result.rulesHit.map(rule => ({
                    file,
                    issue: rule.issue,
                    severity: rule.severity.toUpperCase() as any,
                    type: "SECURITY",
                    evidence: rule.regex as string,
                    agent: "SecuritySentinel"
                })));
            } catch (e) {
                logger.error(`❌ [Security] Erro ao analisar ${file}: ${e}`);
            }
        }

        return findings;
    }

    /**
     * Scans the entire project for security vulnerabilities using the deep engine.
     */
    async scanProject(context: ProjectContext): Promise<AuditFinding[]> {
        const files = Object.keys(context.map || {});
        return this.runSecurityScan(files, context);
    }
}
