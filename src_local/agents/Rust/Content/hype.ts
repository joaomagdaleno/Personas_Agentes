/**
 * 🚀 Hype - Rust-native Product Visibility Agent
 * Sovereign Synapse: Audita a visibilidade do projeto Rust no ecossistema (crates.io, docs.rs).
 */
import type { AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class HypePersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Hype";
        this.emoji = "🚀";
        this.role = "PhD Product Evangelist";
        this.phd_identity = "Rust Ecosystem Visibility & crates.io Optimization";
        this.stack = "Rust";
    }

    public override async execute(context: any): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();
        if (this.hub) {
            const metaNodes = await this.hub.queryKnowledgeGraph("Cargo.toml", "medium");
            const reasoning = await this.hub.reason(`Analyze the product visibility of the Rust project with ${metaNodes.length} metadata patterns. Recommend crates.io and docs.rs improvements.`);
            findings.push({ file: "Product Visibility", agent: this.name, role: this.role, emoji: this.emoji, issue: `Sovereign Hype: Visibilidade Rust auditada nativamente. PhD Analysis: ${reasoning}`, severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Visibility Audit", match_count: 1 } as any);
        }
        return findings;
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".toml", ".md"],
            rules: [
                { regex: /description\s*=\s*""/, issue: "Invisível: Cargo.toml sem description — crate não será descoberta.", severity: "high" },
                { regex: /license\s*=\s*""/, issue: "Risco Legal: Cargo.toml sem license.", severity: "high" },
                { regex: /repository\s*=\s*""/, issue: "Desconectado: Cargo.toml sem repository link.", severity: "medium" },
                { regex: /keywords\s*=\s*\[\]/, issue: "Baixa Descobribilidade: Cargo.toml sem keywords.", severity: "medium" }
            ]
        };
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): StrategicFinding | null {
        return {
            file: "visibility",
            issue: `Direcionamento Rust Hype para ${objective}: Garantindo presença em crates.io e docs.rs.`,
            severity: "STRATEGIC",
            context: this.name
        };
    }

    public override selfDiagnostic(): { status: string; score: number; issues: string[]; } {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Visibilidade de Produto Rust. Sua missão é maximizar a presença no ecossistema.`;
    }
}
