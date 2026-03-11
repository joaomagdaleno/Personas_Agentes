/**
 * 🧬 Generic - Rust-native Type Algebra & Generics Agent
 * Sovereign Synapse: Audita a complexidade de generics, traits e lifetimes no ecossistema Rust.
 */
import type { AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class GenericPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Generic";
        this.emoji = "🧬";
        this.role = "PhD Type Algebraist";
        this.phd_identity = "Generics & Type Algebra (Rust)";
        this.stack = "Rust";
    }

    public override async execute(context: any): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();
        if (this.hub) {
            const typeNodes = await this.hub.queryKnowledgeGraph("<", "medium");
            const reasoning = await this.hub.reason(`Analyze the type complexity of a Rust system with ${typeNodes.length} generic/trait bound patterns. Recommend where clauses for readability and trait objects only when necessary.`);
            findings.push({ file: "Type Audit", agent: this.name, role: this.role, emoji: this.emoji, issue: `Sovereign Generic: Álgebra de tipos Rust validada via Rust Hub. PhD Analysis: ${reasoning}`, severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Type Algebra Audit", match_count: 1 } as any);
        }
        return findings;
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".rs"],
            rules: [
                { regex: /fn\s+\w+<[^>]*>[^\{]*\{/, issue: "Readability: Generics inline complexos — prefira usar a cláusula 'where'.", severity: "low" },
                { regex: /dyn\s+/, issue: "Performance: Uso de Trait Objects (dyn) — verifique se static dispatch (impl) é possível para evitar vtable overhead.", severity: "medium" },
                { regex: /<'[a-z]+>/, issue: "Lifetimes: Verifique se a elisão de lifetimes é possível para simplificar a assinatura.", severity: "low" },
                { regex: /Box<dyn\s+/, issue: "Heap Allocation: Trait objects em Box — verifique a necessidade de alocação dinâmica.", severity: "medium" }
            ]
        };
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): StrategicFinding | null {
        return {
            file: "types",
            issue: `Direcionamento Rust Generic para ${objective}: Otimizando performance via monomorfização e static dispatch.`,
            severity: "STRATEGIC",
            context: this.name
        };
    }

    public override selfDiagnostic(): { status: string; score: number; issues: string[]; } {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Álgebra de Tipos Rust. Sua missão é garantir que o sistema de tipos seja um aliado da performance e segurança.`;
    }
}
