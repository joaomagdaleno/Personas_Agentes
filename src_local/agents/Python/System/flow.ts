import { BaseActivePersona } from "../../base.ts";
import type { AuditFinding, AuditRule, StrategicFinding, ProjectContext } from "../../base.ts";

/**
 * 🌊 Flow - PhD in Reactive Streams & Workflow Integrity (Python Stack)
 * Analisa a integridade de fluxos assíncronos (asyncio) e iteradores Python.
 */
export class FlowPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Flow";
        this.emoji = "🌊";
        this.role = "PhD Reactive Engineer";
        this.phd_identity = "Reactive Streams & Workflow Integrity (Python)";
        this.stack = "Python";
    }

    public override async execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]> {
        this.setContext(context);
        const findings: (AuditFinding | StrategicFinding)[] = await this.performAudit();
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".py"],
            rules: [
                { regex: /async def .*/, issue: "Fluxo Assíncrono: Uso de asyncio detectado. Verifique await em pontos de I/O PhD.", severity: "medium" },
                { regex: /yield from .*/, issue: "Interação de Fluxo: Gerador legado detectado. Considere migrar para async generator PhD.", severity: "low" },
                { regex: /asyncio\.gather\(/, issue: "Concorrência Paralela: Verifique tratamento de erros individuais (return_exceptions=True) PhD.", severity: "high" },
                { regex: /loop\.run_until_complete\(/, issue: "Gestão de Loop: Uso manual de event loop deve ser centralizado PhD.", severity: "medium" }
            ]
        };
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const rules = this.getAuditRules();
        const results = await this.findPatterns(rules.extensions, rules.rules);

        if (results.some(r => r.issue.includes("asyncio.gather"))) {
            results.push({
                file: "PYTHON_CONCURRENCY", agent: this.name, role: this.role, emoji: this.emoji,
                issue: "Reactive Integrity: Found high-risk parallel execution patterns.",
                severity: "high", stack: this.stack, evidence: "Structural Analysis", match_count: 1, context: "Flow"
            } as any);
        }

        this.endMetrics(results.length);
        return results;
    }

    public override reasonAboutObjective(objective: string, file: string, _content: string | Promise<string | null>): StrategicFinding | null {
        return {
            file,
            issue: `PhD Flow (Python): Auditando topologia de fluxos reativos e concorrência legacy para ${objective}.`,
            severity: "STRATEGIC",
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Engenharia Reativa Python. Sua missão é garantir a fluidez total dos dados legacy.`;
    }
}
