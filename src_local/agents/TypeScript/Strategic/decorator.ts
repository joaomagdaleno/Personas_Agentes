import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding, ProjectContext, AuditFinding } from "../../base.ts";

/**
 * 🎀 Dr. Decorator — PhD in TypeScript Decorators & Metadata Reflection
 * Especialista em padrões de decoradores, reflect-metadata e dependency injection.
 */
export class DecoratorPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Decorator";
        this.emoji = "🎀";
        this.role = "PhD TypeScript Metaprogramming Engineer";
        this.phd_identity = "TypeScript Metaprogramming & Reflection (TypeScript)";
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
                { regex: /@\w+\s*\(\)\s*\n\s*@\w+\s*\(\)\s*\n\s*@\w+/, issue: 'Sobrecarga: 3+ decoradores empilhados — complexidade de metaprogramação PhD.', severity: 'medium' },
                { regex: /experimentalDecorators/, issue: 'Experimental: Usando decoradores experimentais — migre para TC39 Stage 3 PhD.', severity: 'low' },
                { regex: /reflect-metadata/, issue: 'Dependência Pesada: reflect-metadata adiciona overhead de runtime PhD.', severity: 'medium' },
                { regex: /@Injectable|@Component|@Module/, issue: 'Framework DI: Decoradores de injeção de dependência — verifique acoplamento PhD.', severity: 'low' },
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
        if (typeof content !== 'string') return null;
        if (/reflect-metadata/.test(content)) {
            return {
                file, severity: "STRATEGIC",
                issue: `Overhead de Metaprogramação: O objetivo '${objective}' exige leveza. Em '${file}', reflect-metadata adiciona custo runtime PhD.`,
                context: "reflect-metadata detected"
            };
        }
        return {
            file, severity: "INFO",
            issue: `PhD Decorator: Analisando metaprogramação para ${objective}. Focando em uso responsável de reflect-metadata PhD.`,
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em metaprogramação e decoradores TypeScript.`;
    }
}
