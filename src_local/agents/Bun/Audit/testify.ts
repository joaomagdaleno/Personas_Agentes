import { BaseActivePersona, AuditRule, StrategicFinding, AuditFinding } from "../../base.ts";
import winston from "winston";

const logger = winston.child({ module: "Bun_Testify" });

/**
 * 🧪 Dr. Testify — PhD in Bun Testing & bun:test Quality
 */
export class TestifyPersona extends BaseActivePersona {
    constructor(projectRoot: string | null = null) {
        super(projectRoot);
        this.name = "Testify";
        this.emoji = "🧪";
        this.role = "PhD Bun Testing Engineer";
        this.stack = "Bun";
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.test.ts', '.spec.ts', 'tests/'],
            rules: [
                { regex: /(?:it|test)\s*\([^)]*,\s*(?:async\s*)?\(\)\s*=>\s*\{\s*\}\)/, issue: 'Teste Vazio: Teste bun:test declarado sem corpo.', severity: 'critical' },
                { regex: /test\.skip\(/, issue: 'Teste Desativado: test.skip em bun:test.', severity: 'high' },
                { regex: /test\.todo\(/, issue: 'Teste Pendente: test.todo em bun:test.', severity: 'medium' },
                { regex: /jest\./, issue: 'Incompatível: Usando API Jest diretamente — use bun:test nativo.', severity: 'high' },
                { regex: /require\(["']jest["']\)/, issue: 'Conflito: Importando Jest em projeto Bun — use bun:test.', severity: 'high' },
                { regex: /setTimeout\(/, issue: 'Teste Frágil: setTimeout detectado; use temporizadores nativos de bun:test.', severity: 'medium' }
            ]
        };
    }

    async performAudit(): Promise<AuditFinding[]> {
        const results = await super.performAudit();
        this.findModulesWithoutTests(results);
        return results;
    }

    private isTestFile(filePath: string): boolean {
        return filePath.endsWith('.test.ts') || filePath.endsWith('.spec.ts') || filePath.includes('tests/');
    }

    private findModulesWithoutTests(results: any[]) {
        const testedModules = this.getTestedModules();
        Object.keys(this.contextData).forEach(filePath => {
            if (this.isUntestedModule(filePath, testedModules)) {
                results.push(this.createMissingTestFinding(filePath));
            }
        });
    }

    private createMissingTestFinding(filePath: string) {
        return {
            file: filePath,
            issue: 'Matéria Escura: Módulo Bun sem testes bun:test detectados.',
            severity: 'high',
            persona: this.name
        };
    }

    private getTestedModules(): Set<string> {
        const tested = new Set<string>();
        Object.keys(this.contextData).forEach(filePath => {
            this.recordIfModuleIsTested(filePath, tested);
        });
        return tested;
    }

    private recordIfModuleIsTested(filePath: string, tested: Set<string>) {
        if (filePath.endsWith('.test.ts') || filePath.endsWith('.spec.ts')) {
            const modulePath = filePath.replace(/\.(test|spec)\.ts$/, '.ts');
            tested.add(modulePath);
        }
    }

    private isUntestedModule(filePath: string, testedModules: Set<string>): boolean {
        if (this.shouldSkipUntestedCheck(filePath)) return false;
        return !testedModules.has(filePath);
    }

    private shouldSkipUntestedCheck(filePath: string): boolean {
        const forbidden = [
            () => !filePath.endsWith('.ts'),
            () => this.isTestFile(filePath),
            () => filePath.endsWith('.d.ts'),
            () => filePath.includes('index.ts')
        ];
        return forbidden.some(check => check());
    }

    reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        if (/test\.skip|jest\./.test(content)) {
            return {
                file, severity: "HIGH",
                issue: `Risco de Qualidade: O objetivo '${objective}' exige confiança. Em '${file}', testes desativados ou Jest legado comprometem a verificação Bun.`,
                context: "skipped tests or Jest legacy detected"
            };
        }
        return null;
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em qualidade e cobertura de testes bun:test.`;
    }

    async run_test_suite(): Promise<any[]> { return this.performAudit(); }

    private _interpret_failures(results: any[]): any[] {
        return results.filter(r => r.severity === "critical" || r.severity === "high");
    }

    async analyze_test_quality_matrix(): Promise<Record<string, number>> {
        const results = await this.performAudit();
        const matrix: Record<string, number> = { critical: 0, high: 0, medium: 0, low: 0 };
        for (const r of results) matrix[r.severity] = (matrix[r.severity] || 0) + 1;
        return matrix;
    }

    async analyze_test_pyramid(): Promise<{ unit: number; integration: number; e2e: number }> {
        const files = Object.keys(this.contextData);
        return {
            unit: files.filter(f => f.includes(".test.") || f.includes(".spec.")).length,
            integration: files.filter(f => f.includes("integration")).length,
            e2e: files.filter(f => f.includes("e2e")).length
        };
    }
}
