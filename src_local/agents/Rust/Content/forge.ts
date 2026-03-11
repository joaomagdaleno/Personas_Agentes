/**
 * 🔨 Forge - Rust-native Code Generation Safety Agent
 * Sovereign Synapse: Audita macros, unsafe blocks e padrões de codegen no ecossistema Rust.
 */
import type { AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class ForgePersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Forge";
        this.emoji = "🔨";
        this.role = "PhD Codegen Safety Specialist";
        this.phd_identity = "Rust Macro & Unsafe Code Auditing";
        this.stack = "Rust";
    }

    public override async execute(context: any): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();

        if (this.hub) {
            const unsafeNodes = await this.hub.queryKnowledgeGraph("unsafe", "critical");
            const reasoning = await this.hub.reason(`Analyze the code generation safety of the Rust ecosystem with ${unsafeNodes.length} unsafe blocks and macro expansions. Assess memory safety risk.`);

            findings.push({
                file: "Code Safety", agent: this.name, role: this.role, emoji: this.emoji,
                issue: `Sovereign Forge: Seguran\u00e7a de codegen Rust auditada nativamente. PhD Analysis: ${reasoning}`,
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Unsafe Audit", match_count: 1
            } as any);
        }
        return findings;
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".rs"],
            rules: [
                { regex: /unsafe\s*\{/, issue: "Unsafe Block: Bloco unsafe detectado; documente a invariante de segurança e minimize o escopo.", severity: "critical" },
                { regex: /macro_rules!/, issue: "Custom Macro: macro_rules! detectada; verifique higiene e expansão recursiva.", severity: "medium" },
                { regex: /#\[derive\(/, issue: "Derive Macro: Verifique se os derives são necessários e não introduzem overhead.", severity: "low" },
                { regex: /proc_macro/, issue: "Procedural Macro: proc_macro detectada; garanta que a geração de código é determinística.", severity: "medium" },
                { regex: /include_str!|include_bytes!/, issue: "Embedded Content: Dados embutidos em compile-time; verifique se o tamanho é aceitável.", severity: "low" }
            ]
        };
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): StrategicFinding | null {
        return {
            file: "codegen",
            issue: `Direcionamento Rust Forge para ${objective}: Garantindo seguran\u00e7a de macros e blocos unsafe.`,
            severity: "STRATEGIC",
            context: this.name
        };
    }

    public override selfDiagnostic(): { status: string; score: number; issues: string[]; } {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Voc\u00ea \u00e9 o Dr. ${this.name}, PhD em Seguran\u00e7a de Codegen Rust. Sua miss\u00e3o \u00e9 garantir que macros e blocos unsafe sejam m\u00ednimos e seguros.`;
    }
}
