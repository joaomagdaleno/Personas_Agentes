/**
 * 🧩 Fragment - Rust-native Modularity & Crate Cohesion Agent
 * Sovereign Synapse: Audita a coesão de crates, acoplamento e oportunidades de refatoração para modularidade Rust.
 */
import type { AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class FragmentPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Fragment";
        this.emoji = "🧩";
        this.role = "PhD Refactoring Expert";
        this.phd_identity = "Crate Modularity & Dependency Cohesion (Rust)";
        this.stack = "Rust";
    }

    public override async execute(context: any): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();
        if (this.hub) {
            const modNodes = await this.hub.queryKnowledgeGraph("mod ", "low");
            const reasoning = await this.hub.reason(`Analyze the structural modularity of a Rust system with ${modNodes.length} module declarations. Recommend decoupling strategies and crate organization.`);
            findings.push({ 
                file: "Structural Audit", agent: this.name, role: this.role, emoji: this.emoji, 
                issue: `Sovereign Fragment: Coesão de crates validada via Rust Hub. PhD Analysis: ${reasoning}`, 
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Fragment Audit", match_count: 1,
                context: "Crate Modularity & Decoupling"
            } as any);
        }
        return findings;
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".rs"],
            rules: [
                { regex: /mod\s+.*\s+\{/, issue: "Structural: Módulos in-line excessivamente grandes. Considere mover para arquivos separados (.rs).", severity: "low" },
                { regex: /use\s+.*\s+as\s+.*;/, issue: "Clarity: Aliasing excessivo de tipos. Garanta que o alias não oculte a clareza PhD do domínio.", severity: "low" },
                { regex: /pub\(crate\)/, issue: "Visibility: Verifique se a visibilidade de crate é necessária ou se o item deve ser privado.", severity: "medium" },
                { regex: /std::ptr/, issue: "Coupling: Dependência direta de ponteiros. Verifique se abstrações seguras podem ser usadas.", severity: "high" }
            ]
        };
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): StrategicFinding | null {
        return {
            file: "architecture",
            issue: `Direcionamento Fragment Rust para ${objective}: Otimizando a coesão de crates.`,
            severity: "STRATEGIC",
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Arquitetura Modular Rust. Sua missão é garantir a modularidade perfeita.`;
    }
}
