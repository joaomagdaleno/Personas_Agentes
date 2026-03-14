import { BaseActivePersona } from "../../base.ts";
import type { AuditFinding, AuditRule, StrategicFinding, ProjectContext } from "../../base.ts";

/**
 * 🌉 Dr. Bridge — PhD in Bun FFI & Native Integration
 * Especialista em Bun FFI, integração nativa e contratos de API.
 */
export class BridgePersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Bridge";
        this.emoji = "🌉";
        this.role = "PhD Bun Integration Architect";
        this.phd_identity = "Native Integration & Bun FFI Strategy";
        this.stack = "Bun";
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
                { regex: /bun:ffi/, issue: 'FFI: Uso de bun:ffi para integração nativa — verifique memory safety PhD.', severity: 'medium' },
                { regex: /dlopen\(/, issue: 'FFI: dlopen carregando biblioteca nativa — verifique origem e permissões PhD.', severity: 'high' },
                { regex: /fetch\s*\([^)]*\)\.then\([^)]*as\s+any/, issue: 'Contrato Quebrado: Resposta fetch tipada como "any" no Bun PhD.', severity: 'high' },
                { regex: /Bun\.file\([^)]+\)\.json\(\)(?!\s*as\b)/, issue: 'Contrato Vago: Bun.file().json() sem tipagem PhD.', severity: 'medium' },
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
        if (typeof content === 'string' && /bun:ffi|dlopen/.test(content)) {
            return {
                file, severity: "HIGH",
                issue: `Risco de Integração: O objetivo '${objective}' exige safety. Em '${file}', FFI nativo requer verificação de memory safety no Bun PhD.`,
                context: "FFI usage detected"
            };
        }
        return {
            file, severity: "INFO",
            issue: `PhD Bridge (Bun): Analisando blindagem de contratos FFI para ${objective}.`,
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em integração nativa e FFI Bun.`;
    }
}
