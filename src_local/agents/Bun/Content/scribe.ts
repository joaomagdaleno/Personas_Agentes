import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding } from "../../base.ts";


/**
 * 📝 Dr. Scribe — PhD in Bun Documentation & API Clarity
 */
export class ScribePersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Scribe";
        this.emoji = "📝";
        this.role = "PhD Bun Documentation Engineer";
        this.phd_identity = "Documentation & API Clarity (Bun)";
        this.stack = "Bun";
    }

    public override async execute(context: any): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();
        if (this.hub) {
            const apiNodes = await this.hub.queryKnowledgeGraph("export", "medium");
            const reasoning = await this.hub.reason(`Analyze the API transparency of a Bun system with ${apiNodes.length} exports. Recommend JSDoc compliance for modern Bun runtimes.`);
            findings.push({ file: "API Audit", agent: this.name, role: this.role, emoji: this.emoji, issue: `Sovereign Scribe: Transparência Bun validada via Rust Hub. PhD Analysis: ${reasoning}`, severity: "INFO", stack: this.stack, evidence: "Knowledge Graph API Transparency Audit", match_count: 1 } as any);
        }
        return findings;
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.ts', '.tsx'],
            rules: [
                {
                    regex: /^(?:export\s+(?:async\s+)?(?:function|class|const|interface|type|enum)\s+\w+)/m,
                    issue: 'Amnésia: Exportação Bun detectada (verifique se há JSDoc correspondente).',
                    severity: 'high'
                },
            ]
        };
    }

    // Scribe is a bit special as it compares exports with JSDocs,
    // which simple regex auditing doesn't fully capture in a single pass
    // (unless we use complex lookaheads which are fragile).
    // For now, we standardize the audit rules for the exports.

    reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        const exports = (content.match(/export\s+(?:async\s+)?(?:function|class)\s+\w+/g) || []).length;
        const docs = (content.match(/\/\*\*[\s\S]*?\*\//g) || []).length;
        if (exports > 0 && docs === 0) {
            return {
                file, severity: "HIGH",
                issue: `Caixa Preta: O objetivo '${objective}' exige transparência. Em '${file}', a falta de JSDoc torna o módulo Bun opaco.`,
                context: "Exports without JSDoc"
            };
        }
        return null;
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em documentação e clareza de APIs Bun.`;
    }
}
