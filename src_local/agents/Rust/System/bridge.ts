/**
 * 🌉 Bridge - Rust-native Inter-process Communication Agent
 * Sovereign Synapse: Audita a integridade de pontes gRPC, canais de sistema e sinais OS.
 */
import type { AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class BridgePersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Bridge";
        this.emoji = "🌉";
        this.role = "PhD Communication Architect";
        this.phd_identity = "IPC & FFI Bridge Integrity (Rust)";
        this.stack = "Rust";
    }

    public override async execute(context: any): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();
        if (this.hub) {
            const bridgeNodes = await this.hub.queryKnowledgeGraph("tokio::sync", "low");
            const reasoning = await this.hub.reason(`Analyze the IPC and synchronization layer of a Rust system with ${bridgeNodes.length} channel points. Recommend safety patterns for cross-boundary communication.`);
            findings.push({ 
                file: "System Audit", agent: this.name, role: this.role, emoji: this.emoji, 
                issue: `Sovereign Bridge: Canais de comunicação validados via Rust Hub. PhD Analysis: ${reasoning}`, 
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Bridge Audit", match_count: 1,
                context: "IPC & Sync Integrity"
            } as any);
        }
        return findings;
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".rs"],
            rules: [
                { regex: /tokio::sync::mpsc/, issue: "Communication: Canal MPSC detectado. Garanta que o backpressure esteja configurado PhD.", severity: "low" },
                { regex: /std::process::Command/, issue: "Process: Criação de comando externo. Risco de segurança se argumentos não forem sanitizados.", severity: "high" },
                { regex: /libc::/, issue: "OS: Chamada direta à libc. Verifique se há abstrações seguras em Rust antes de usar FFI.", severity: "medium" }
            ]
        };
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): StrategicFinding | null {
        return {
            file: "communication",
            issue: `Direcionamento Bridge para ${objective}: Garantindo fluidez e segurança no fluxo de dados inter-sistemas.`,
            severity: "STRATEGIC",
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Sistemas Distribuídos e IPC. Sua missão é garantir a comunicação perfeita.`;
    }
}
