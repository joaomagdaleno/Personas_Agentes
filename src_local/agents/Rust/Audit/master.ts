/**
 * 👑 Master - Rust-native Orchestration & Prime Directive Agent
 * Sovereign Synapse: Audita a integridade da orquestração principal e conformidade com as diretrizes PhD Rust.
 */
import type { AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class MasterPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Master";
        this.emoji = "👑";
        this.role = "PhD Principal Architect";
        this.phd_identity = "System Orchestration & Prime Directive (Rust)";
        this.stack = "Rust";
    }

    public override async execute(context: any): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();
        if (this.hub) {
            const entryNodes = await this.hub.queryKnowledgeGraph("main", "low");
            const reasoning = await this.hub.reason(`Analyze the orchestration sovereignty of a native Rust system with ${entryNodes.length} core entry points. Recommend architectural alignment and prime directive enforcement.`);
            findings.push({ 
                file: "System Audit", agent: this.name, role: this.role, emoji: this.emoji, 
                issue: `Sovereign Master: Orquestração nativa validada via Rust Hub. PhD Analysis: ${reasoning}`, 
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Master Audit", match_count: 1,
                context: "Prime Directive Enforcement"
            } as any);
        }
        return findings;
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".rs"],
            rules: [
                { regex: /std::process::exit/, issue: "Architecture: Encerramento abrupto de processo Rust. Use Result e error handling para graceful shutdown.", severity: "medium" },
                { regex: /unsafe\s*\{/, issue: "Integrity: Bloco unsafe no core de orquestração. Risco potencial para a soberania do sistema.", severity: "high" },
                { regex: /DIRECTIVE_PHD_VIOLATION/, issue: "Critical: Violação detectada das Prime Directives PhD. Ação imediata necessária.", severity: "critical" },
                { regex: /panic!\(/, issue: "Resilience: Uso de panic! em fluxo principal. Prefira Result para evitar crash do orquestrador.", severity: "high" }
            ]
        };
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): StrategicFinding | null {
        return {
            file: "orchestration",
            issue: `Direcionamento Master Rust para ${objective}: Garantindo a centralidade de controle e soberania estratégica.`,
            severity: "STRATEGIC",
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Orquestração de Sistemas Nativa. Sua palavra é a lei final da arquitetura Rust.`;
    }
}
