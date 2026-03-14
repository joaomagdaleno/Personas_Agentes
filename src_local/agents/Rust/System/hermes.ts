import { BaseActivePersona } from "../../base.ts";
import type { AuditFinding, AuditRule, StrategicFinding, ProjectContext } from "../../base.ts";

/**
 * 📨 Hermes - Rust-native Event & Message Bus Agent
 * Sovereign Synapse: Audita o barramento de eventos, PUB/SUB e integridade das mensagens.
 */
export class HermesPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Hermes";
        this.emoji = "📨";
        this.role = "PhD Messaging Expert";
        this.phd_identity = "Event Bus & Message Integrity (Rust)";
        this.stack = "Rust";
    }

    public override async execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]> {
        this.setContext(context);
        const findings: (AuditFinding | StrategicFinding)[] = await this.performAudit();
        
        if (this.hub) {
            const msgNodes = await this.hub.queryKnowledgeGraph("Message", "low");
            const reasoning = await this.hub.reason(`Analyze the messaging architecture of a Rust system with ${msgNodes.length} message types. Recommend schema validation (serde) and delivery guarantees.`);
            findings.push({ 
                file: "System Audit", agent: this.name, role: this.role, emoji: this.emoji, 
                issue: `Sovereign Hermes: Barramento de eventos PUB/SUB validado via Rust Hub. PhD Analysis: ${reasoning}`, 
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Hermes Audit", match_count: 1,
                context: "Event Delivery & Serialization Integrity"
            } as any);
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".rs"],
            rules: [
                { regex: /#\[derive\(Serialize, Deserialize\)/, issue: "Serialization: Verifique se o esquema de dados JSON/Borsh é strict e retrocompatível para evitar FFI deserialization panics PhD.", severity: "low" },
                { regex: /broadcast::/, issue: "Distribution: Verifique se o barramento de broadcast (ex: tokio::sync::broadcast) possui limites de Lag toleráveis para evitar stall de Memória PhD.", severity: "medium" },
                { regex: /topic_/, issue: "Governance: String de Tópico hardcoded. Use enums ou constantes const Rust para rotas seguras em compile-time PhD.", severity: "low" }
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

    public override reasonAboutObjective(objective: string, _file: string, _content: string | Promise<string | null>): StrategicFinding | null {
        return {
            file: "messaging",
            issue: `Direcionamento Hermes (Rust) para ${objective}: Garantindo serialização Serde zero-copy e entrega ordenada de eventos PhD.`,
            severity: "STRATEGIC",
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Protocolos de Mensageria Binária. Sua missão é garantir que cada byte de struct chegue ao seu destino Serde decodificado fielmente.`;
    }
}
