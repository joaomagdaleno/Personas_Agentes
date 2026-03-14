import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding, ProjectContext, AuditFinding } from "../../base.ts";

/**
 * 🌉 Dr. Bridge — PhD in TypeScript Integration & API Contracts
 * Especialista em contratos de integração, tipagem de APIs externas e FFI.
 */
export class BridgePersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Bridge";
        this.emoji = "🌉";
        this.role = "PhD Integration Architect";
        this.phd_identity = "Integration Contracts & FFI (TypeScript)";
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
                { regex: /fetch\s*\([^)]*\)\s*\.then\([^)]*\)\s*\.then\([^)]*as\s+any/, issue: 'Contrato Quebrado: Resposta de API tipada como "any" — sem verificação PhD.', severity: 'high' },
                { regex: /axios\.(?:get|post|put|delete)\s*<\s*any\s*>/, issue: 'Contrato Vago: Chamada HTTP sem tipo de resposta definido PhD.', severity: 'high' },
                { regex: /JSON\.parse\([^)]+\)(?!\s*as\b)/, issue: 'Risco de Runtime: JSON.parse sem type assertion — resultado é "any" PhD.', severity: 'medium' },
                { regex: /\.json\(\)(?!\s*as\b)/, issue: 'Contrato Implícito: .json() sem tipagem de resposta PhD.', severity: 'medium' },
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
        if (typeof content === 'string' && (/JSON\.parse\([^)]+\)(?!\s*as\b)/.test(content))) {
            return {
                file, severity: "STRATEGIC",
                issue: `Quebra de Contrato: O objetivo '${objective}' exige previsibilidade. Em '${file}', o uso de JSON.parse sem tipagem torna a integração vulnerável PhD.`,
                context: "JSON.parse without type assertion"
            };
        }
        return {
            file, severity: "INFO",
            issue: `PhD Bridge (TypeScript): Analisando contratos de integração para ${objective}. Focando em tipagem de fronteiras e APIs.`,
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em integração e contratos de API TypeScript.`;
    }
}
