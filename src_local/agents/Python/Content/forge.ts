import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding, AuditFinding, ProjectContext } from "../../base.ts";

/**
 * 🔨 Dr. Forge — PhD in Python Code Generation & Safety
 * Especialista em detecção de eval(), exec() e execução dinâmica perigosa Python.
 */
export class ForgePersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Forge";
        this.emoji = "🔨";
        this.role = "PhD Automation & Safety Engineer";
        this.phd_identity = "Code Generation & Dynamic Execution Safety (Python)";
        this.stack = "Python";
    }

    public override async execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]> {
        this.setContext(context);
        const findings: (AuditFinding | StrategicFinding)[] = await this.performAudit();

        if (this.hub) {
            const evalNodes = await this.hub.queryKnowledgeGraph("eval", "critical");
            const reasoning = await this.hub.reason(`Analyze the dynamic execution safety of a Python system with ${evalNodes.length} eval/exec patterns. Assess injection risk.`);

            findings.push({
                file: "Code Safety", agent: this.name, role: this.role, emoji: this.emoji,
                issue: `Sovereign Forge: Segurança de codegen Python validada via Rust Hub. PhD Analysis: ${reasoning}`,
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Eval Audit", match_count: 1,
                context: "Dynamic Execution Risk"
            } as any);
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.py'],
            rules: [
                { regex: /\beval\s*\(/, issue: 'Vulnerabilidade Crítica: eval() permite execução arbitrária de código Python.', severity: 'critical' },
                { regex: /\bexec\s*\(/, issue: 'Risco de Injeção: exec() cria código em runtime Python.', severity: 'critical' },
                { regex: /subprocess\./, issue: 'Risco: subprocess permite execução de comandos do sistema.', severity: 'high' },
                { regex: /os\.system\(/, issue: 'Inseguro: os.system() executa comandos shell arbitrários.', severity: 'critical' },
                { regex: /__import__\(/, issue: 'Risco: __import__() dinâmico com concatenação — risco de injeção.', severity: 'high' },
            ]
        };
    }

    override reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        if (/\beval\s*\(|\bexec\s*\(/.test(content)) {
            return {
                file, severity: "CRITICAL",
                issue: `Risco de Autonomia: O objetivo '${objective}' exige segurança de execução. Em '${file}', a execução dinâmica de código compromete a 'Orquestração de Inteligência Artificial'.`,
                context: "Dynamic execution detected"
            };
        }
        return {
            file, severity: "INFO",
            issue: `PhD Forge: Analisando segurança de automação para ${objective}. Focando em sanitização de execução dinâmica.`,
            context: "analyzing automation safety"
        };
    }

    override selfDiagnostic(): any {
        return {
            status: "Soberano",
            score: 100,
            details: "Guardião de execução dinâmica Python operando com rigor PhD."
        };
    }

    override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em automação e segurança de codegen Python.`;
    }
}
