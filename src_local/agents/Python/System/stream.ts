import { BaseActivePersona } from "../../base.ts";
import type { AuditFinding, AuditRule, StrategicFinding, ProjectContext } from "../../base.ts";

/**
 * 🌊 Stream - PhD in Stream Processing & Data Pipes (Python Stack)
 * Analisa a integridade de pipes de dados, geradores e processamento em lote Python.
 */
export class StreamPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Stream";
        this.emoji = "🌊";
        this.role = "PhD Data Engineer";
        this.phd_identity = "Stream Processing & Data Pipes (Python)";
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
                { regex: /yield .*/, issue: "Gerador Python: Verifique mecanismos preventivos contra estouro de memória PhD.", severity: "low" },
                { regex: /itertools\..*/, issue: "Iteração Avançada: Uso de itertools encorajado para performance PhD.", severity: "low" },
                { regex: /stream\.read\(.*\)/, issue: "Leitura de Stream: Verifique chunk size fixo PhD.", severity: "medium" },
                { regex: /pipe\.flush\(\)/, issue: "Sincronia de Pipe: Uso excessivo degrada I/O PhD.", severity: "low" }
            ]
        };
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const rules = this.getAuditRules();
        const results = await this.findPatterns(rules.extensions, rules.rules);

        if (results.some(r => r.issue.includes("stream.read"))) {
            results.push({
                file: "PYTHON_STREAM", agent: this.name, role: this.role, emoji: this.emoji,
                issue: "Data Integrity: Found unbuffered stream reads in Python layer.",
                severity: "medium", stack: this.stack, evidence: "Structural Analysis", match_count: 1, context: "Stream Ops"
            } as any);
        }

        this.endMetrics(results.length);
        return results;
    }

    public override reasonAboutObjective(objective: string, file: string, _content: string | Promise<string | null>): StrategicFinding | null {
        return {
            file,
            issue: `PhD Stream (Python): Auditando largura de banda e estabilidade de pipes para ${objective}.`,
            severity: "STRATEGIC",
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Processamento de Dados Python.`;
    }
}
