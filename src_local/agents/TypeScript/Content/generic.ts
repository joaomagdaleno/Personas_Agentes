import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding } from "../../base.ts";


/**
 * 🧬 Dr. Generic — PhD in TypeScript Generics & Type Algebra
 * Especialista em uso de generics, complexidade de tipos e type inference.
 */
export class GenericPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Generic";
        this.emoji = "🧬";
        this.role = "PhD TypeScript Type Algebraist";
        this.phd_identity = "Generics & Type Algebra (TypeScript)";
        this.stack = "TypeScript";
    }

    public override async execute(context: any): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();
        if (this.hub) {
            const logicNodes = await this.hub.queryKnowledgeGraph("<", "medium");
            const reasoning = await this.hub.reason(`Analyze the type complexity of a TypeScript system with ${logicNodes.length} generic/conditional patterns. Recommend simplification of nested generics and elimination of double casts.`);
            findings.push({ file: "Type Audit", agent: this.name, role: this.role, emoji: this.emoji, issue: `Sovereign Generic: Álgebra de tipos TS validada via Rust Hub. PhD Analysis: ${reasoning}`, severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Type Algebra Audit", match_count: 1 } as any);
        }
        return findings;
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.ts', '.tsx'],
            rules: [
                { regex: /<[^>]*<[^>]*<[^>]*>>/, issue: 'Complexidade: Generics com 3+ níveis de aninhamento — simplificar com type aliases.', severity: 'medium' },
                { regex: /extends\s+infer\s+\w+.*extends\s+infer/, issue: 'Magia Negra: Múltiplos "infer" condicionais — difícil de manter.', severity: 'high' },
                { regex: /type\s+\w+<[^>]*>\s*=\s*\w+<[^>]*>\s*extends\s/, issue: 'Tipo Condicional: Conditional type — verifique se não há alternativa simples.', severity: 'low' },
                { regex: /as\s+unknown\s+as\s+/, issue: 'Double Cast: "as unknown as X" — forte indicador de design errado.', severity: 'high' },
            ]
        };
    }

    reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        if (/as\s+unknown\s+as\s+/.test(content)) {
            return {
                file, severity: "HIGH",
                issue: `Magia Negra de Tipos: O objetivo '${objective}' exige clareza. Em '${file}', double casts indicam design inadequado na 'Orquestração de Inteligência Artificial'.`,
                context: "Double cast detected"
            };
        }
        return {
            file, severity: "INFO",
            issue: `PhD Generics: Analisando álgebra de tipos para ${objective}. Focando em simplificação e inferência.`,
            context: "analyzing generics"
        };
    }

    public override selfDiagnostic(): any {
        return {
            status: "Soberano",
            score: 100,
            details: "Analista de álgebra de tipos TS operando com precisão PhD."
        };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em álgebra de tipos e generics TypeScript.`;
    }
}
