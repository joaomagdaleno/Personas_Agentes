import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding, ProjectContext, AuditFinding } from "../../base.ts";

/**
 * 📝 Dr. Scribe — PhD in TypeScript Documentation & Knowledge
 */
export class ScribePersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Scribe";
        this.emoji = "📝";
        this.role = "PhD Documentation Engineer";
        this.phd_identity = "Documentation & Knowledge Transfer (TypeScript)";
        this.stack = "TypeScript";
    }

    public override async execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]> {
        this.setContext(context);
        const findings: (AuditFinding | StrategicFinding)[] = await this.performAudit();
        if (this.hub) {
            const docNodes = await this.hub.queryKnowledgeGraph("export", "high");
            const reasoning = await this.hub.reason(`Analyze the documentation coverage of a TypeScript system with ${docNodes.length} exports. Recommend JSDoc patterns for explicability.`);
            findings.push({ 
                file: "Documentation Audit", agent: this.name, role: this.role, emoji: this.emoji, 
                issue: `Sovereign Scribe: Documentação TS validada via Rust Hub. PhD Analysis: ${reasoning}`, 
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Documentation Audit", match_count: 1 
            } as any);
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.ts', '.tsx'],
            rules: [
                { regex: /^export\s+(?:async\s+)?(?:function|class|const|interface|type|enum)\s+\w+/m, issue: 'Amnésia Técnica: Exportação sem JSDoc detectada.', severity: 'high' },
            ]
        };
    }

    override reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        const exports = (content.match(/export\s+(?:async\s+)?(?:function|class)\s+\w+/g) || []).length;
        const docs = (content.match(/\/\*\*[\s\S]*?\*\//g) || []).length;

        if (exports > 0 && docs === 0) {
            return {
                file, severity: "HIGH",
                issue: `Amnésia Técnica: O objetivo '${objective}' exige clareza. Em '${file}', a falta de documentação torna a 'Orquestração de Inteligência Artificial' um sistema de caixa preta.`,
                context: "Exports without JSDoc detected"
            };
        }
        return {
            file, severity: "INFO",
            issue: `PhD Scribe: Analisando explicabilidade para ${objective}.`,
            context: "analyzing explicability"
        };
    }

    override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em documentação e transferência de conhecimento TypeScript.`;
    }
}
