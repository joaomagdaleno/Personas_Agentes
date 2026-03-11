import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding } from "../../base.ts";


/**
 * 🔮 Dr. Mantra — PhD in Bun Type Safety & Runtime Type Checking
 * Especialista em type safety no runtime Bun, validação Zod e type guards.
 */
export class MantraPersona extends BaseActivePersona {
    constructor(projectRoot: string | null = null) {
        super(projectRoot);
        this.name = "Mantra";
        this.emoji = "🔮";
        this.role = "PhD Bun Type Safety Guardian";
        this.phd_identity = "Type Safety & Runtime Checking (Bun)";
        this.stack = "Bun";
    }

    public override async execute(context: any): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();
        if (this.hub) {
            const typeNodes = await this.hub.queryKnowledgeGraph("any", "high");
            const reasoning = await this.hub.reason(`Analyze the type safety of a Bun system with ${typeNodes.length} "any" patterns. Recommend Bun-native type validation via Zod.`);
            findings.push({ file: "Type Safety", agent: this.name, role: this.role, emoji: this.emoji, issue: `Sovereign Mantra: Pureza de tipos Bun validada via Rust Hub. PhD Analysis: ${reasoning}`, severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Type Audit", match_count: 1 } as any);
        }
        return findings;
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.ts', '.tsx'],
            rules: [
                { regex: /:\s*any\b/, issue: 'Impureza: Tipagem "any" destrói type safety no Bun.', severity: 'high' },
                { regex: /as\s+any\b/, issue: 'Escape: Type assertion "as any" — bypass de verificação Bun.', severity: 'high' },
                { regex: /@ts-ignore/, issue: 'Supressão: @ts-ignore silencia o compilador Bun.', severity: 'critical' },
                { regex: /@ts-nocheck/, issue: 'Abandono: @ts-nocheck desativa verificação do arquivo Bun inteiro.', severity: 'critical' },
                { regex: /Bun\.file\([^)]+\)\.json\(\)(?!\s*as\b)/, issue: 'Risco: Bun.file().json() sem tipagem — resultado é "any".', severity: 'high' },
            ]
        };
    }

    reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        const anyCount = this.countAnyUsages(content);
        if (anyCount <= 3) return null;

        return {
            file, severity: "HIGH",
            issue: `Erosão de Tipos: O objetivo '${objective}' exige segurança Bun-nativa. O arquivo '${file}' contém ${anyCount} usos de 'any'.`,
            context: `Found ${anyCount} any occurrences`
        };
    }

    private countAnyUsages(content: string): number {
        return (content.match(/:\s*any\b|as\s+any\b/g) || []).length;
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, guardião da pureza de tipos no runtime Bun.`;
    }
}

