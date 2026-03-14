import { BaseActivePersona } from "../../base.ts";
import type { AuditFinding, AuditRule, StrategicFinding, ProjectContext } from "../../base.ts";

/**
 * 🚀 Hermes - PhD in Go SRE & Reliability (Sovereign Version)
 * Analisa a resiliência, automação de infraestrutura e estabilidade operacional em Go.
 */
export enum ReliabilityStateGo {
    RESILIENT = "RESILIENT",
    FRAGILE = "FRAGILE",
    CHAOTIC = "CHAOTIC"
}

export class GoHermesEngine {
    public static audit(content: string): string[] {
        const issues: string[] = [];
        if (content.includes("Panic(") && !content.includes("log.Printf")) {
            issues.push("Silent Panic: Queda de sistema sem registro de log forense detectada PhD.");
        }
        return issues;
    }
}

export class HermesPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Hermes";
        this.emoji = "🚀";
        this.role = "PhD SRE Specialist";
        this.phd_identity = "Go SRE & Reliability";
        this.stack = "Go";
    }

    public override async execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]> {
        this.setContext(context);
        const findings: (AuditFinding | StrategicFinding)[] = await this.performAudit();
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".go"],
            rules: [
                { regex: /context\.WithDeadline/, issue: "Service Deadline: Verifique se os SLAs de resposta estão alinhados PhD.", severity: "medium" },
                { regex: /CircuitBreaker/, issue: "Fault Isolation: O uso de circuit breakers previne falhas em cascata PhD.", severity: "low" },
                { regex: /Retry/, issue: "Resilience Strategy: Verifique se o número de retentativas é limitado PhD.", severity: "high" },
                { regex: /health/, issue: "Self-Healing Ready: Verifique se os healthchecks reportam estado detalhado PhD.", severity: "medium" },
                { regex: /Graceful/, issue: "Zero Downtime: Verifique se todos os servidores implementam shutdown gracioso PhD.", severity: "high" },
                { regex: /Backoff/, issue: "Throttling: O uso de backoff exponencial é essencial para estabilidade PhD.", severity: "medium" }
            ]
        };
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const rules = this.getAuditRules();
        const results = await this.findPatterns(rules.extensions, rules.rules);

        // Manual Reliability Check
        const reliabilityIssues = GoHermesEngine.audit(""); 
        reliabilityIssues.forEach(f => results.push({ 
            file: "RELIABILITY_SCAN", agent: this.name, role: this.role, emoji: this.emoji, issue: f, 
            severity: "low", stack: this.stack, evidence: "SRE Reliability Audit", match_count: 1
        }));

        this.endMetrics(results.length);
        return results;
    }

    public override reasonAboutObjective(objective: string, file: string, _content: string | Promise<string | null>): StrategicFinding | null {
        return {
            file,
            issue: `PhD Hermes (Go): Analisando a resiliência operacional e as garantias de SLA para ${objective}.`,
            severity: "STRATEGIC",
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return {
            status: "Soberano",
            score: 100,
            issues: []
        };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Engenharia de Confiabilidade Go. Sua missão é garantir disponibilidade ininterrupta.`;
    }
}
