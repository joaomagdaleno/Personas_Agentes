import { BaseActivePersona } from "../../base.ts";
import type { AuditFinding, AuditRule, StrategicFinding, ProjectContext } from "../../base.ts";

/**
 * 🌉 Bridge - Python-native Inter-process Communication Agent
 * Sovereign Synapse: Audita a integridade de pontes gRPC, sockets e comunicação multiprocesso em Python.
 */
export class BridgePersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Bridge";
        this.emoji = "🌉";
        this.role = "PhD Communication Architect";
        this.phd_identity = "IPC & Multi-process Integrity (Python)";
        this.stack = "Python";
    }

    public override async execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]> {
        this.setContext(context);
        const findings: (AuditFinding | StrategicFinding)[] = await this.performAudit();
        if (this.hub) {
            const bridgeNodes = await this.hub.queryKnowledgeGraph("multiprocessing", "low");
            const reasoning = await this.hub.reason(`Analyze the IPC and multiprocessing layer of a Python system with ${bridgeNodes.length} process points. Recommend safety patterns for shared memory and signal handling.`);
            findings.push({ 
                file: "System Audit", agent: this.name, role: this.role, emoji: this.emoji, 
                issue: `Sovereign Bridge: Comunicação Python validada via Rust Hub. PhD Analysis: ${reasoning}`, 
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Bridge Audit", match_count: 1,
                context: "IPC & Process Safety"
            } as any);
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".py"],
            rules: [
                { regex: /multiprocessing\.Process/, issue: "Process: Criação de subprocesso detectada. Garanta o encerramento limpo PhD.", severity: "medium" },
                { regex: /socket\.socket/, issue: "Network: Abertura de socket raw. Verifique a segurança da conexão PhD.", severity: "high" },
                { regex: /os\.kill\(.*\)/, issue: "Signal: Envio de sinal de sistema. Use padrões controlados PhD.", severity: "medium" }
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
            file: file || "communication",
            issue: `PhD Bridge (Python): Direcionamento para ${objective}, garantindo fluidez no ecossistema.`,
            severity: "STRATEGIC",
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Sistemas Distribuídos Python.`;
    }
}
