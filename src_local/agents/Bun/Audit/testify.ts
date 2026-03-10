import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding, AuditFinding } from "../../base.ts";
import type { ProjectContext } from "../../../core/types.ts";

/**
 * 🧪 Dr. Testify — PhD in Bun Testing & bun:test Quality
 */
export class TestifyPersona extends BaseActivePersona {
    constructor(projectRoot: string | undefined = undefined) {
        super(projectRoot);
        this.name = "Testify";
        this.emoji = "🧪";
        this.role = "PhD Bun Testing Engineer";
        this.phd_identity = "Bun Testing & bun:test Quality";
        this.stack = "Bun";
    }

    override async execute(context: ProjectContext): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();

        if (this.hub) {
            // QA Intelligence: Find untested Bun modules
            const untestedQuery = await this.hub.queryKnowledgeGraph("untested", "high");
            
            // PhD QA Reasoning
            const reasoning = await this.hub.reason(`Generate a PhD test strategy for a Bun system with ${untestedQuery.length} untested modules and current audit findings.`);

            findings.push({
                file: "Verification Core", agent: this.name, role: this.role, emoji: this.emoji,
                issue: `Sovereign Bun Verification: Cobertura auditada via Rust Hub. PhD Analysis: ${reasoning}`,
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Quality Audit", match_count: 1
            } as any);
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
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

    override async performAudit(): Promise<AuditFinding[]> {
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

    // HubManagerGRPC handles run_test_suite logic
}
