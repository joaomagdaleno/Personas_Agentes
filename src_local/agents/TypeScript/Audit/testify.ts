import { BaseActivePersona } from "../../base_persona.ts";
import winston from "winston";

const logger = winston.child({ module: "TS_Testify" });

/**
 * 🧪 Dr. Testify — PhD in TypeScript Testing & Quality Assurance
 */
export class TestifyPersona extends BaseActivePersona {
    private readonly auditRules = [
        { regex: '(?:it|test)\\s*\\([^)]*,\\s*(?:async\\s*)?\\(\\)\\s*=>\\s*\\{\\s*\\}\\)', issue: 'Teste Vazio: Teste declarado sem corpo — falsa cobertura.', severity: 'critical' },
        { regex: 'test\\.skip\\(', issue: 'Teste Desativado: test.skip — cobertura incompleta.', severity: 'high' },
        { regex: 'describe\\.skip\\(', issue: 'Suite Desativada: describe.skip — bloco inteiro ignorado.', severity: 'high' },
        { regex: '(?:it|test)\\s*\\([^)]*,\\s*(?:async\\s*)?\\([^)]*\\)\\s*=>\\s*\\{[^}]*\\}\\)(?![\\s\\S]*expect)', issue: 'Teste Fraco: Teste sem asserção expect().', severity: 'high' },
        { regex: '\\.todo\\(', issue: 'Teste Pendente: .todo() — funcionalidade sem verificação.', severity: 'medium' },
        { regex: 'setTimeout\\(', issue: 'Teste Frágil: setTimeout detectado; use waits assíncronos PhD.', severity: 'medium' },
    ];

    constructor(projectRoot: string | null = null) {
        super(projectRoot);
        this.name = "Testify";
        this.emoji = "🧪";
        this.role = "PhD Quality Assurance Engineer";
        this.stack = "TypeScript";
    }

    async performAudit(): Promise<any[]> {
        const start = Date.now();
        logger.info(`[${this.name}] Analisando Qualidade de Testes TypeScript...`);

        const results: any[] = [];
        this.auditRules.forEach(rule => this.applyRule(rule, results));
        this.findModulesWithoutTests(results);

        const duration = (Date.now() - start) / 1000;
        logger.info(`[${this.name}] Auditoria concluída em ${duration.toFixed(4)}s. Achados: ${results.length}`);
        return results;
    }

    private applyRule(rule: any, results: any[]) {
        const pattern = new RegExp(rule.regex, 'g');
        Object.entries(this.contextData).forEach(([filePath, content]) => {
            if (this.isTestFile(filePath)) {
                this.scanContentForRule(filePath, content as string, pattern, rule, results);
            }
        });
    }

    private scanContentForRule(filePath: string, content: string, pattern: RegExp, rule: any, results: any[]) {
        const matches = content.matchAll(pattern);
        for (const match of matches) {
            results.push(this.createFinding(filePath, rule, match[0]));
        }
    }

    private isTestFile(filePath: string): boolean {
        return filePath.endsWith('.test.ts') || filePath.endsWith('.spec.ts') || filePath.includes('tests/');
    }

    private createFinding(file: string, rule: any, evidence: string) {
        return { file, issue: rule.issue, severity: rule.severity, evidence: evidence.substring(0, 80), persona: this.name };
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
            issue: 'Matéria Escura: Módulo TypeScript sem testes detectados.',
            severity: 'high',
            persona: this.name
        };
    }

    private getTestedModules(): Set<string> {
        const tested = new Set<string>();
        for (const filePath of Object.keys(this.contextData)) {
            if (filePath.endsWith('.test.ts') || filePath.endsWith('.spec.ts')) {
                tested.add(filePath.replace(/\.(test|spec)\.ts$/, '.ts'));
            }
        }
        return tested;
    }

    private isUntestedModule(filePath: string, testedModules: Set<string>): boolean {
        if (!filePath.endsWith('.ts') || this.isTestFile(filePath) || filePath.endsWith('.d.ts')) return false;
        if (filePath.includes('__init__') || filePath.includes('index.ts')) return false;
        return !testedModules.has(filePath);
    }

    public override reasonAboutObjective(objective: string, file: string, content: string): StrategicFinding | null {
        return {
            file,
            issue: `PhD Quality Assurance: ${objective}`,
            context: content.substring(0, 100),
            objective,
            analysis: "Auditando cobertura e robustez da suíte de testes Go.",
            recommendation: "Garantir que testes críticos não usem time.Sleep e que rituais de Assert Expectation sejam seguidos.",
            severity: "medium"
        } as StrategicFinding;
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em qualidade e cobertura de testes TypeScript.`;
    }
}
