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
        { regex: 'it\\.skip\\(', issue: 'Teste Desativado: it.skip — cobertura incompleta.', severity: 'high' },
        { regex: 'describe\\.skip\\(', issue: 'Suite Desativada: describe.skip — bloco inteiro ignorado.', severity: 'high' },
        { regex: '(?:it|test)\\s*\\([^)]*,\\s*(?:async\\s*)?\\([^)]*\\)\\s*=>\\s*\\{[^}]*\\}\\)(?![\\s\\S]*expect)', issue: 'Teste Fraco: Teste sem asserção expect().', severity: 'high' },
        { regex: '\\.todo\\(', issue: 'Teste Pendente: .todo() — funcionalidade sem verificação.', severity: 'medium' },
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
        const regex = new RegExp(rule.regex, 'g');
        Object.entries(this.contextData).forEach(([filePath, content]) => {
            if (this.isTestFile(filePath)) {
                this.scanContentForRule(filePath, content as string, regex, rule, results);
            }
        });
    }

    private scanContentForRule(filePath: string, content: string, regex: RegExp, rule: any, results: any[]) {
        const matches = content.matchAll(regex);
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

    async reasonAboutObjective(objective: string, file: string, content: string): Promise<any | null> {
        if (/test\.skip|it\.skip|describe\.skip/.test(content)) {
            return {
                file, severity: "HIGH", persona: this.name,
                issue: `Exposição de Risco: O objetivo '${objective}' exige confiança. O módulo '${file}' tem testes desativados.`
            };
        }
        return {
            file, severity: "INFO", persona: this.name,
            issue: `PhD QA: Analisando cobertura de testes para ${objective}.`
        };
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em qualidade e cobertura de testes TypeScript.`;
    }
}
