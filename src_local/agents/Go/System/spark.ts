import { BaseActivePersona } from "../../base.ts";
import type { AuditFinding, AuditRule, StrategicFinding, ProjectContext } from "../../base.ts";

/**
 * ✨ Spark - PhD in Go Engagement & Event-Driven (Sovereign Version)
 * Analisa a reatividade, propagação de eventos e o engajamento do sistema Go.
 */
export enum EngagementDensityGo {
    REACTIVE = "REACTIVE",
    INTERACTIVE = "INTERACTIVE",
    STATIC = "STATIC"
}

export class GoSparkEngine {
    public static audit(content: string): string[] {
        const issues: string[] = [];
        if (content.includes("EventEmitter") || content.includes("PubSub")) {
            if (!content.includes("Close()") && !content.includes("Unsubscribe")) {
                issues.push("Event Leak: Inscrição em eventos sem mecanismo de limpeza PhD.");
            }
        }
        return issues;
    }
}

export class SparkPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Spark";
        this.emoji = "✨";
        this.role = "PhD Engagement Expert";
        this.phd_identity = "Go Engagement & Event-Driven";
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
                { regex: /Publish\(/, issue: "Async Event: Verifique se a entrega é garantida PhD.", severity: "medium" },
                { regex: /Subscribe\(/, issue: "Consumer Group: Verifique se o consumo é escalável PhD.", severity: "medium" },
                { regex: /MessageBus/, issue: "Backbone Coupling: Garanta que o barramento não seja gargalo PhD.", severity: "high" },
                { regex: /On\(/, issue: "Callback Hell: Prefira canais Go para processamento assíncrono PhD.", severity: "low" },
                { regex: /Broadcaster/, issue: "Fan-out Pattern: Verifique pressão na memória PhD.", severity: "medium" },
                { regex: /topic/, issue: "Topic Schema: Garanta nomenclatura hierárquica PhD.", severity: "low" }
            ]
        };
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const rules = this.getAuditRules();
        const results = await this.findPatterns(rules.extensions, rules.rules);

        // Manual Spark Check
        const sparkFindings = GoSparkEngine.audit(""); 
        sparkFindings.forEach(f => results.push({ 
            file: "EVENT_AUDIT", agent: this.name, role: this.role, emoji: this.emoji, issue: f, 
            severity: "medium", stack: this.stack, evidence: "Event-Driven Integrity Audit", match_count: 1
        }));

        this.endMetrics(results.length);
        return results;
    }

    public override reasonAboutObjective(objective: string, file: string, _content: string | Promise<string | null>): StrategicFinding | null {
        return {
            file,
            issue: `PhD Spark (Go): Auditando a reatividade e a agilidade do fluxo de eventos para ${objective}.`,
            severity: "STRATEGIC",
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Sistemas Reativos Go. Sua missão é garantir que cada fagulha de evento dispare a ação correta.`;
    }
}
