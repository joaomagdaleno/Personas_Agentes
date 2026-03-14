import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding, ProjectContext, AuditFinding } from "../../base.ts";

/**
 * 🏷️ Dr. Enum — PhD in TypeScript Enum Safety & Discriminated Unions
 * Especialista em uso seguro de enums, const enums e union types.
 */
export class EnumPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Enum";
        this.emoji = "🏷️";
        this.role = "PhD TypeScript Union & Enum Engineer";
        this.phd_identity = "Enum Safety & Discriminated Unions (TypeScript)";
        this.stack = "TypeScript";
    }

    public override async execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]> {
        this.setContext(context);
        const findings: (AuditFinding | StrategicFinding)[] = await this.performAudit();
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.ts', '.tsx'],
            rules: [
                { regex: /enum\s+\w+\s*\{[^}]*\d+/, issue: 'Risco: Enum numérico — use string enum ou union type para segurança PhD.', severity: 'medium' },
                { regex: /enum\s+\w+\s*\{/, issue: 'Revisar: Enum TypeScript — considere "as const" object or union type PhD.', severity: 'low' },
                { regex: /as\s+\w+Enum|as\s+\w+\.\w+/, issue: 'Cast de Enum: Type assertion em enum pode aceitar valor inválido PhD.', severity: 'medium' },
                { regex: /const\s+enum\s+/, issue: 'Limitação: const enum não funciona com --isolatedModules (Bun/Vite) PhD.', severity: 'high' },
            ]
        };
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const rules = this.getAuditRules();
        const results = await this.findPatterns(rules.extensions, rules.rules);
        this.endMetrics(results.length);
        return results;
    }

    public override reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | null {
        if (typeof content === 'string' && (/const\s+enum\s+/.test(content))) {
            return {
                file, severity: "HIGH",
                issue: `Incompatibilidade: O objetivo '${objective}' exige compatibilidade. Em '${file}', const enums quebram com --isolatedModules PhD.`,
                context: "const enum detected"
            };
        }
        return {
            file, severity: "INFO",
            issue: `PhD Enum (TypeScript): Analisando segurança de tipos e discricionários para ${objective}.`,
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em enums, unions e discriminated types TypeScript.`;
    }
}
