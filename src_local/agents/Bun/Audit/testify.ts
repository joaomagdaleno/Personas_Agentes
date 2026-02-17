import { BaseActivePersona } from "../../base_persona.ts";
import winston from "winston";

const logger = winston.child({ module: "Bun_Testify" });

/**
 * 🧪 Dr. Testify — PhD in Bun Testing & bun:test Quality
 * Especialista em qualidade de testes com bun:test, cobertura e flaky tests.
 */
export class TestifyPersona extends BaseActivePersona {
    constructor(projectRoot: string | null = null) {
        super(projectRoot);
        this.name = "Testify";
        this.emoji = "🧪";
        this.role = "PhD Bun Testing Engineer";
        this.stack = "Bun";
    }

    async performAudit(): Promise<any[]> {
        const start = Date.now();
        logger.info(`[${this.name}] Analisando Qualidade de Testes Bun...`);

        const auditRules = [
            { regex: '(?:it|test)\\s*\\([^)]*,\\s*(?:async\\s*)?\\(\\)\\s*=>\\s*\\{\\s*\\}\\)', issue: 'Teste Vazio: Teste bun:test declarado sem corpo.', severity: 'critical' },
            { regex: 'test\\.skip\\(', issue: 'Teste Desativado: test.skip em bun:test.', severity: 'high' },
            { regex: 'test\\.todo\\(', issue: 'Teste Pendente: test.todo em bun:test.', severity: 'medium' },
            { regex: 'jest\\.', issue: 'Incompatível: Usando API Jest diretamente — use bun:test nativo.', severity: 'high' },
            { regex: 'require\\(["\']jest["\']\\)', issue: 'Conflito: Importando Jest em projeto Bun — use bun:test.', severity: 'high' },
        ];

        const results: any[] = [];
        for (const rule of auditRules) {
            const regex = new RegExp(rule.regex, 'g');
            for (const [filePath, content] of Object.entries(this.contextData)) {
                if (filePath.endsWith('.test.ts') || filePath.endsWith('.spec.ts') || filePath.includes('tests/')) {
                    for (const match of (content as string).matchAll(regex)) {
                        results.push({ file: filePath, issue: rule.issue, severity: rule.severity, evidence: match[0].substring(0, 80), persona: this.name });
                    }
                }
            }
        }

        // Modules without tests
        const testedModules = new Set<string>();
        for (const filePath of Object.keys(this.contextData)) {
            if (filePath.endsWith('.test.ts') || filePath.endsWith('.spec.ts')) {
                testedModules.add(filePath.replace(/\.(test|spec)\.ts$/, '.ts'));
            }
        }
        for (const filePath of Object.keys(this.contextData)) {
            if (filePath.endsWith('.ts') && !filePath.endsWith('.test.ts') && !filePath.endsWith('.spec.ts') && !filePath.endsWith('.d.ts') && !filePath.includes('index.ts')) {
                if (!testedModules.has(filePath)) {
                    results.push({ file: filePath, issue: 'Matéria Escura: Módulo Bun sem testes bun:test detectados.', severity: 'high', persona: this.name });
                }
            }
        }

        const duration = (Date.now() - start) / 1000;
        logger.info(`[${this.name}] Auditoria concluída em ${duration.toFixed(4)}s. Achados: ${results.length}`);
        return results;
    }

    async reasonAboutObjective(objective: string, file: string, content: string): Promise<any | null> {
        if (/test\.skip|jest\./.test(content)) {
            return {
                file, severity: "HIGH", persona: this.name,
                issue: `Risco de Qualidade: O objetivo '${objective}' exige confiança. Em '${file}', testes desativados ou Jest legado comprometem a verificação Bun.`
            };
        }
        return null;
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em qualidade e cobertura de testes bun:test.`;
    }

    /** Parity: run_test_suite — Executes the full test suite via performAudit. */
    async run_test_suite(): Promise<any[]> {
        return this.performAudit();
    }

    /** Parity: _interpret_failures — Interprets test failures from audit results. */
    private _interpret_failures(results: any[]): any[] {
        return results.filter(r => r.severity === "critical" || r.severity === "high");
    }

    /** Parity: analyze_test_quality_matrix — Evaluates test quality distribution. */
    async analyze_test_quality_matrix(): Promise<Record<string, number>> {
        const results = await this.performAudit();
        const matrix: Record<string, number> = { critical: 0, high: 0, medium: 0, low: 0 };
        for (const r of results) matrix[r.severity] = (matrix[r.severity] || 0) + 1;
        return matrix;
    }

    /** Parity: analyze_test_pyramid — Analyzes test distribution across layers. */
    async analyze_test_pyramid(): Promise<{ unit: number; integration: number; e2e: number }> {
        const files = Object.keys(this.contextData);
        const unit = files.filter(f => f.includes(".test.") || f.includes(".spec.")).length;
        const integration = files.filter(f => f.includes("integration")).length;
        const e2e = files.filter(f => f.includes("e2e")).length;
        return { unit, integration, e2e };
    }
}
