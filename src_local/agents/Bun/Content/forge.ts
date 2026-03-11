import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding } from "../../base.ts";


/**
 * 🔨 Dr. Forge — PhD in Bun Code Safety & Compile-time Security
 * Especialista em segurança de compilação Bun, macros e execução dinâmica.
 */
export class ForgePersona extends BaseActivePersona {
    constructor(projectRoot: string | null = null) {
        super(projectRoot);
        this.name = "Forge";
        this.emoji = "🔨";
        this.role = "PhD Bun Compile Safety Engineer";
        this.phd_identity = "Code Safety & Compile-time Security (Bun)";
        this.stack = "Bun";
    }

    public override async execute(context: any): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();

        if (this.hub) {
            const evalNodes = await this.hub.queryKnowledgeGraph("eval", "critical");
            const reasoning = await this.hub.reason(`Analyze the dynamic execution safety of a Bun system with ${evalNodes.length} eval/Function constructor patterns. Assess compile-time injection risk.`);

            findings.push({
                file: "Code Safety", agent: this.name, role: this.role, emoji: this.emoji,
                issue: `Sovereign Forge: Segurança de compilação Bun validada via Rust Hub. PhD Analysis: ${reasoning}`,
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Eval Audit", match_count: 1
            } as any);
        }
        return findings;
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.ts', '.tsx'],
            rules: [
                { regex: /\beval\s*\(/, issue: 'Crítico: eval() permite execução arbitrária no runtime Bun.', severity: 'critical' },
                { regex: /new\s+Function\s*\(/, issue: 'Risco: new Function() cria código em runtime Bun.', severity: 'critical' },
                { regex: /import\s*\([^)]*\+/, issue: 'Risco: import() dinâmico com concatenação — risco de injeção.', severity: 'high' },
                { regex: /Bun\.build\([^)]*\)(?![\s\S]{0,100}minify)/, issue: 'Otimização: Bun.build() sem minify — bundle pode ser grande.', severity: 'low' },
            ]
        };
    }

    reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        if (/\beval\s*\(|new\s+Function\s*\(/.test(content)) {
            return {
                file, severity: "CRITICAL",
                issue: `Risco de Autonomia: O objetivo '${objective}' exige segurança de compilação. Em '${file}', execução dinâmica compromete a soberania Bun.`,
                context: "Dynamic execution detected"
            };
        }
        return null;
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em segurança de compilação e build Bun.`;
    }

    /** Parity: validate_code_safety — Validates if code has dangerous execution patterns. */
    validate_code_safety(content: string, filePath: string): { safe: boolean; issues: string[] } {
        const issues: string[] = [];
        if (/\beval\s*\(/.test(content)) issues.push(`eval() detected in ${filePath}`);
        if (/new\s+Function\s*\(/.test(content)) issues.push(`new Function() detected in ${filePath}`);
        return { safe: issues.length === 0, issues };
    }
}
