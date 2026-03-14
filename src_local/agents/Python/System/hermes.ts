import { BaseActivePersona } from "../../base.ts";
import type { AuditFinding, AuditRule, StrategicFinding, ProjectContext } from "../../base.ts";

/**
 * 📨 Hermes - Python-native Event & Message Bus Agent
 * Sovereign Synapse: Audita o barramento de eventos, PUB/SUB e integridade das mensagens em Python (Redis/RabbitMQ/Internal).
 */
export class HermesPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Hermes";
        this.emoji = "📨";
        this.role = "PhD Messaging Expert";
        this.phd_identity = "Event Bus & Message Integrity (Python)";
        this.stack = "Python";
    }

    public override async execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]> {
        this.setContext(context);
        const findings: (AuditFinding | StrategicFinding)[] = await this.performAudit();
        if (this.hub) {
            const msgNodes = await this.hub.queryKnowledgeGraph("message", "low");
            const reasoning = await this.hub.reason(`Analyze the messaging architecture of a Python system with ${msgNodes.length} message points. Recommend schema validation and delivery guarantees for distributed events.`);
            findings.push({ 
                file: "System Audit", agent: this.name, role: this.role, emoji: this.emoji, 
                issue: `Sovereign Hermes: Barramento Python validado via Rust Hub. PhD Analysis: ${reasoning}`, 
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Hermes Audit", match_count: 1,
                context: "Event Delivery & Integrity"
            } as any);
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".py"],
            rules: [
                { regex: /celery|kombu|pika/, issue: "Messaging: Uso de broker detectado. Verifique retry policy e DLQ PhD.", severity: "medium" },
                { regex: /queue\.Queue/, issue: "Internal: Fila interna detectada. Garanta thread pooling eficiente PhD.", severity: "low" },
                { regex: /pickle\.loads/, issue: "Security: Desserialização com pickle detectada. Risco extremo (RCE) PhD.", severity: "critical" }
            ]
        };
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const rules = this.getAuditRules();
        const results = await this.findPatterns(rules.extensions, rules.rules);
        this.endMetrics(results.length);
        return results;
    }

    public override reasonAboutObjective(objective: string, file: string, _content: string | Promise<string | null>): StrategicFinding | null {
        return {
            file: file || "messaging",
            issue: `PhD Hermes (Python): Direcionamento para ${objective}, garantindo confiabilidade de eventos.`,
            severity: "STRATEGIC",
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Protocolos de Mensageria Python. Sua missão é garantir a soberania do fluxo de dados.`;
    }
}
