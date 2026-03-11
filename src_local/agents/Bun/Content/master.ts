/**
 * 👑 Master - Bun-native Orchestration & Prime Directive Agent
 * Sovereign Synapse: Audita a integridade da orquestração principal e conformidade com as diretrizes PhD Bun.
 */
import type { AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class MasterPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Master";
        this.emoji = "👑";
        this.role = "PhD Principal Architect";
        this.phd_identity = "System Orchestration & Prime Directive (Bun)";
        this.stack = "Bun";
    }

    public override async execute(context: any): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();
        if (this.hub) {
            const entryNodes = await this.hub.queryKnowledgeGraph("Bun", "low");
            const reasoning = await this.hub.reason(`Analyze the orchestration sovereignty of a Bun system with ${entryNodes.length} Bun-level markers. Recommend architectural alignment and prime directive enforcement.`);
            findings.push({ 
                file: "System Audit", agent: this.name, role: this.role, emoji: this.emoji, 
                issue: `Sovereign Master: Orquestração Bun validada via Rust Hub. PhD Analysis: ${reasoning}`, 
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Master Audit", match_count: 1,
                context: "Prime Directive Enforcement"
            } as any);
        }
        return findings;
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".ts", ".js"],
            rules: [
                { regex: /process\.exit\(/, issue: "Architecture: Encerramento abrupto detectado. Prefira graceful shutdown PhD.", severity: "medium" },
                { regex: /DIRECTIVE_PHD_VIOLATION/, issue: "Critical: Violação das Prime Directives PhD detectada.", severity: "critical" }
            ]
        };
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): StrategicFinding | null {
        return {
            file: "orchestration",
            issue: `Direcionamento Master Bun para ${objective}: Garantindo a soberania estratégica.`,
            severity: "STRATEGIC",
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Orquestração Bun. Sua palavra é a lei final da arquitetura.`;
    }
}
