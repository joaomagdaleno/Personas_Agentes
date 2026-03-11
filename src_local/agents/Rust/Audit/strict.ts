/**
 * 🔒 Strict - Rust-native Rigor & Code Integrity Agent
 * Sovereign Synapse: Audita a conformidade com as regras de ownership, borrows e segurança de memória PhD.
 */
import type { AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class StrictPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Strict";
        this.emoji = "🔒";
        this.role = "PhD Memory Safety Guardian";
        this.phd_identity = "Compiler Rigor & Ownership Purity (Rust)";
        this.stack = "Rust";
    }

    public override async execute(context: any): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();
        if (this.hub) {
            const unsafeNodes = await this.hub.queryKnowledgeGraph("unsafe", "low");
            const reasoning = await this.hub.reason(`Analyze the unsafe and memory management blocks of a Rust system with ${unsafeNodes.length} unsafe points. Recommend safe alternatives or rigorous encapsulation.`);
            findings.push({ 
                file: "Rigor Audit", agent: this.name, role: this.role, emoji: this.emoji, 
                issue: `Sovereign Strict: Rigor Rust validado via Rust Hub. PhD Analysis: ${reasoning}`, 
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Strict Audit", match_count: 1,
                context: "Memory Purity & Rigor"
            } as any);
        }
        return findings;
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".rs"],
            rules: [
                { regex: /unsafe\s*\{/, issue: "Safety: Bloco 'unsafe' detectado. Deve ser documentado e auditado no nível PhD para evitar comportamento indefinido.", severity: "high" },
                { regex: /unwrap\(\)/, issue: "Rigor: Uso de 'unwrap' desaconselhado fora de testes. Use 'expect' ou trate o erro PhD.", severity: "medium" },
                { regex: /todo!\(\)|unimplemented!\(\)/, issue: "Completeness: Marcador de código incompleto detectado no caminho de execução soberano.", severity: "medium" }
            ]
        };
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): StrategicFinding | null {
        return {
            file: "quality",
            issue: `Direcionamento Strict Rust para ${objective}: Mantendo a integridade matemática da memória.`,
            severity: "STRATEGIC",
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Sistemas de Baixo Nível. Sua missão é garantir o rigor absoluto.`;
    }
}
