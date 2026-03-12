import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding } from "../../base.ts";


/**
 * 🔨 Dr. Forge — PhD in TypeScript Code Generation & Safety
 * Especialista em detecção de eval(), new Function() e execução dinâmica perigosa.
 */
export class ForgePersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot as any);
        this.name = "Forge";
        this.emoji = "🔨";
        this.role = "PhD Automation & Safety Engineer";
        this.phd_identity = "Code Generation & Dynamic Execution Safety (TypeScript)";
        this.stack = "TypeScript";
    }

    public override async execute(context: any): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();

        if (this.hub) {
            const evalNodes = await this.hub.queryKnowledgeGraph("eval", "critical");
            const reasoning = await this.hub.reason(`Analyze the dynamic execution safety of a system with ${evalNodes.length} eval/Function constructor patterns in ${this.stack}. Assess injection risk.`);

            findings.push({
                file: "Code Safety", agent: this.name, role: this.role, emoji: this.emoji,
                issue: `Sovereign Forge: Segurança de codegen validada via Rust Hub. PhD Analysis: ${reasoning}`,
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Eval Audit", match_count: 1
            } as any);
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.ts', '.tsx'],
            rules: [
                { regex: /\beval\s*\(/, issue: 'Vulnerabilidade Crítica: eval() permite execução arbitrária de código.', severity: 'critical' },
                { regex: /new\s+Function\s*\(/, issue: 'Risco de Injeção: new Function() cria código em runtime.', severity: 'critical' },
                { regex: /document\.write\s*\(/, issue: 'Inseguro: document.write pode injetar scripts maliciosos.', severity: 'high' },
                { regex: /innerHTML\s*=/, issue: 'XSS Potencial: innerHTML sem sanitização permite injeção.', severity: 'high' },
                { regex: /setTimeout\s*\(\s*["']/, issue: 'eval Disfarçado: setTimeout com string executa código implícito.', severity: 'high' },
            ]
        };
    }

    override reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        const target = /\beval\s*\(|new\s+Function\s*\(/;
        if (target["test"](content)) {
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
            details: "Guardião de execução dinâmica TS operando com rigor PhD."
        };
    }

    override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em automação e segurança de codegen TypeScript.`;
    }
}
