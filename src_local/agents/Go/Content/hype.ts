import { BaseActivePersona } from "../../base.ts";
import type { AuditFinding, AuditRule, StrategicFinding, ProjectContext } from "../../base.ts";

/**
 * 🚀 Dr. Hype — PhD in Go Project Visibility & Module Identity
 * Especialista em metadados Go (go.mod), visibilidade e descobrimento.
 */
export class HypePersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Hype";
        this.emoji = "🚀";
        this.role = "PhD Go Product Evangelist";
        this.phd_identity = "Project Visibility & Module Identity (Go)";
        this.stack = "Go";
    }

    public override async execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]> {
        this.setContext(context);
        const findings: (AuditFinding | StrategicFinding)[] = await this.performAudit();
        if (this.hub) {
            const modNodes = await this.hub.queryKnowledgeGraph("go.mod", "medium");
            const reasoning = await this.hub.reason(`Analyze the Go module visibility with ${modNodes.length} dependency paths. Recommend module path and discovery improvements.`);
            findings.push({ 
                file: "Product Visibility", agent: this.name, role: this.role, emoji: this.emoji, 
                issue: `Sovereign Hype: Visibilidade Go auditada via Rust Hub. PhD Analysis: ${reasoning}`, 
                severity: "INFO", stack: this.stack, evidence: "Go Module Knowledge Graph Audit", match_count: 1
            } as any);
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ["go.mod", "README.md"],
            rules: [
                { regex: /module\s+([a-z0-9]+)$/, issue: "Invisível: go.mod com declaração de module genérica ou ausente.", severity: "medium" },
                { regex: /require\s+\(\s*\)/, issue: "Dependency Bloat: Bloco require vazio ou mal estruturado em go.mod.", severity: "medium" },
                { regex: /\/\/\s*todo/i, issue: "Identidade Incompleta: Pendências de documentação no README ou go.mod.", severity: "medium" }
            ]
        };
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const rules = this.getAuditRules();
        const results = await this.findPatterns(rules.extensions, rules.rules);
        
        this.auditProjectPresence(results);
        
        this.endMetrics(results.length);
        return results;
    }

    private auditProjectPresence(results: AuditFinding[]): void {
        const hasReadme = Object.keys(this.contextData).some(f => /readme\.md$/i.test(f));
        if (!hasReadme) {
            results.push({ 
                file: "ROOT", agent: this.name, role: this.role, emoji: this.emoji,
                issue: "Invisibilidade: Projeto Go sem README.md formal PhD.", 
                severity: "high", stack: this.stack, evidence: "File Presence Scan", match_count: 1
            });
        }
    }

    public override reasonAboutObjective(objective: string, file: string, _content: string | Promise<string | null>): StrategicFinding | null {
        return {
            file,
            issue: `PhD Hype (Go): Analisando visibilidade e identidade de módulo para ${objective}.`,
            severity: "STRATEGIC",
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return {
            status: "Soberano",
            score: 100,
            issues: []
        };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em visibilidade Go.`;
    }
}
