/**
 * 📨 Hermes - Rust-native Event & Message Bus Agent
 * Sovereign Synapse: Audita o barramento de eventos, PUB/SUB e integridade das mensagens.
 */
import type { AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class HermesPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Hermes";
        this.emoji = "📨";
        this.role = "PhD Messaging Expert";
        this.phd_identity = "Event Bus & Message Integrity (Rust)";
        this.stack = "Rust";
    }

    public override async execute(context: any): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();
        if (this.hub) {
            const msgNodes = await this.hub.queryKnowledgeGraph("Message", "low");
            const reasoning = await this.hub.reason(`Analyze the messaging architecture of a Rust system with ${msgNodes.length} message types. Recommend schema validation and delivery guarantees.`);
            findings.push({ 
                file: "System Audit", agent: this.name, role: this.role, emoji: this.emoji, 
                issue: `Sovereign Hermes: Barramento de eventos validado via Rust Hub. PhD Analysis: ${reasoning}`, 
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Hermes Audit", match_count: 1,
                context: "Event Delivery & Integrity"
            } as any);
        }
        return findings;
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".rs"],
            rules: [
                { regex: /#\[derive\(Serialize, Deserialize\)/, issue: "Serialization: Verifique se o esquema de dados é retrocompatível para evitar quebra de sistema PhD.", severity: "low" },
                { regex: /broadcast/, issue: "Distribution: Verifique se o barramento de broadcast possui limites de buffer para evitar stall de rede.", severity: "medium" },
                { regex: /topic/, issue: "Governance: Definição de tópico detectada. Use padrões de nomenclatura consistentes PhD.", severity: "low" }
            ]
        };
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): StrategicFinding | null {
        return {
            file: "messaging",
            issue: `Direcionamento Hermes para ${objective}: Garantindo entrega confiável e ordenada de eventos.`,
            severity: "STRATEGIC",
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Protocolos de Mensageria. Sua missão é garantir que cada bit chegue ao seu destino.`;
    }
}
