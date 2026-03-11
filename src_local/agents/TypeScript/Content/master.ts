/**
 * 👑 Master - TypeScript-native Orchestration & Prime Directive Agent
 * Sovereign Synapse: Audita a integridade da orquestração principal e conformidade com as diretrizes PhD TS.
 */
import type { AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class MasterPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Master";
        this.emoji = "👑";
        this.role = "PhD Principal Architect";
        this.phd_identity = "System Orchestration & Prime Directive (TS/Bun)";
        this.stack = "TypeScript";
    }

    public override async execute(context: any): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();
        if (this.hub) {
            const entryNodes = await this.hub.queryKnowledgeGraph("process", "low");
            const reasoning = await this.hub.reason(`Analyze the orchestration sovereignty of a TypeScript/Bun system with ${entryNodes.length} process-level entry points. Recommend isolation of control logic and prime directive enforcement.`);
            findings.push({ 
                file: "System Audit", agent: this.name, role: this.role, emoji: this.emoji, 
                issue: `Sovereign Master: Orquestração TS validada via Rust Hub. PhD Analysis: ${reasoning}`, 
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
                { regex: /process\.exit\(/, issue: "Architecture: Encerramento abrupto de processo. Use graceful shutdown com limpeza de recursos.", severity: "medium" },
                { regex: /process\.env/, issue: "Governance: Acesso direto a variáveis de ambiente fora de um manager centralizado. Risco de inconsistência de configuração.", severity: "low" },
                { regex: /DIRECTIVE_PHD_VIOLATION/, issue: "Critical: Violação detectada das Prime Directives PhD. Ação imediata necessária.", severity: "critical" },
                { regex: /eval\(/, issue: "Security: Uso de eval(). Risco crítico de segurança e perda de soberania de código.", severity: "critical" }
            ]
        };
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): StrategicFinding | null {
        return {
            file: "orchestration",
            issue: `Direcionamento Master para ${objective}: Garantindo a centralidade de controle e soberania estratégica.`,
            severity: "STRATEGIC",
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Orquestração de Sistemas. Sua palavra é a lei final da arquitetura TS.`;
    }
}
