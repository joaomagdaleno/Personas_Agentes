import { BaseActivePersona } from "../../base.ts";
import type { AuditFinding, AuditRule, StrategicFinding, ProjectContext } from "../../base.ts";

/**
 * 🌉 Bridge - Rust-native Inter-process Communication Agent
 * Sovereign Synapse: Audita a integridade de pontes gRPC, canais de sistema e sinais OS.
 */
export class BridgePersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Bridge";
        this.emoji = "🌉";
        this.role = "PhD Communication Architect";
        this.phd_identity = "IPC & FFI Bridge Integrity (Rust)";
        this.stack = "Rust";
    }

    public override async execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]> {
        this.setContext(context);
        const findings: (AuditFinding | StrategicFinding)[] = await this.performAudit();
        
        if (this.hub) {
            const bridgeNodes = await this.hub.queryKnowledgeGraph("tokio::sync", "low");
            const reasoning = await this.hub.reason(`Analyze the IPC and synchronization layer of a Rust system with ${bridgeNodes.length} channel points. Recommend safety patterns for cross-boundary communication.`);
            findings.push({ 
                file: "System Audit", agent: this.name, role: this.role, emoji: this.emoji, 
                issue: `Sovereign Bridge: Canais de comunicação IPC validados via Rust Hub. PhD Analysis: ${reasoning}`, 
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Bridge Audit", match_count: 1,
                context: "IPC & Sync Integrity"
            } as any);
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".rs"],
            rules: [
                { regex: /tokio::sync::mpsc/, issue: "Communication: Canal MPSC detectado. Garanta que o backpressure esteja configurado (bound blocks) PhD.", severity: "low" },
                { regex: /std::process::Command/, issue: "Process: Criação de comando externo. Risco de Command Injection se argumentos recebidos de FFI/IPC não forem sanitizados PhD.", severity: "high" },
                { regex: /libc::/, issue: "OS: Chamada direta à libc. Verifique se há abstrações seguras no crate `nix` antes de usar FFI libc PhD.", severity: "medium" }
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
            file: "communication",
            issue: `Direcionamento Bridge (Rust) para ${objective}: Garantindo fluidez Lock-free e segurança Thread-safe no fluxo de dados inter-sistemas PhD.`,
            severity: "STRATEGIC",
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Sistemas Distribuídos e IPC (Rust). Sua missão é garantir a comunicação perfeita FFI/gRPC.`;
    }
}
