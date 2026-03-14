import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding, AuditFinding, ProjectContext } from "../../base.ts";

/**
 * 🧪 Dr. Testify — PhD in TypeScript Testing & Quality Assurance
 */
export class TestifyPersona extends BaseActivePersona {
    constructor(projectRoot: string | undefined = undefined) {
        super(projectRoot);
        this.name = "Testify";
        this.emoji = "🧪";
        this.role = "PhD Quality Assurance Engineer";
        this.phd_identity = "TypeScript Testing & Quality Assurance";
        this.stack = "TypeScript";
    }

    override async execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]> {
        this.setContext(context);
        const findings: (AuditFinding | StrategicFinding)[] = await this.performAudit();

        if (this.hub) {
            const untestedQuery = await this.hub.queryKnowledgeGraph("untested", "high");
            const reasoning = await this.hub.reason(`Generate a PhD test strategy for a system with ${untestedQuery.length} untested critical modules and "Dark Matter" modules detected in findings.`);

            findings.push({
                file: "Quality Core", agent: this.name, role: this.role, emoji: this.emoji,
                issue: `Sovereign Quality: Estratégia de cobertura validada. PhD Analysis: ${reasoning}`,
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Quality Audit", match_count: 1
            } as any);
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.test.ts', '.spec.ts', 'tests/'],
            rules: [
                { regex: /(?:it|test)\s*\([^)]*,\s*(?:async\s*)?\(\)\s*=>\s*\{\s*\}\)/, issue: 'Teste Vazio: Teste declarado sem corpo — falsa cobertura.', severity: 'critical' },
                { regex: /test\.skip\(|describe\.skip\(/, issue: 'Teste Desativado: Cobertura incompleta PhD.', severity: 'high' },
                { regex: /(?:it|test)\s*\([^)]*,\s*(?:async\s*)?\([^)]*\)\s*=>\s*\{[^}]*\}\)(?![\s\S]*expect)/, issue: 'Teste Fraco: Teste sem asserção expect().', severity: 'high' },
                { regex: /\.todo\(/, issue: 'Teste Pendente: .todo() — funcionalidade sem verificação.', severity: 'medium' },
                { regex: /setTimeout\(/, issue: 'Teste Frágil: setTimeout detectado; use waits assíncronos PhD.', severity: 'medium' },
                { regex: /as\s+any\b/, issue: 'Mock Frágil: Uso de "as any" em teste. Prefira mocks tipados ou interfaces.', severity: 'medium' },
                { regex: /!\./, issue: 'Safety: Non-null assertion (!) em teste. Pode causar falsos positivos em falhas.', severity: 'low' }
            ]
        };
    }

    override async performAudit(): Promise<AuditFinding[]> {
        const results = await super.performAudit();
        TestifyHelpers.findModulesWithoutTests(this.contextData, results, this.name);
        return results;
    }

    public override reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | null {
        return {
            file,
            issue: `PhD Quality Assurance: ${objective}`,
            context: typeof content === 'string' ? content.substring(0, 100) : "Complex content",
            objective,
            analysis: "Auditando cobertura e robustez da suíte de testes.",
            recommendation: "Garantir que testes críticos não usem waits frágeis e que rituais de Assert Expectation sejam seguidos.",
            severity: "medium"
        } as StrategicFinding;
    }

    override selfDiagnostic(): any {
        return {
            status: "Soberano",
            score: 100,
            details: "Motor de qualidade TS operando com rigor PhD."
        };
    }

    override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em qualidade e cobertura de testes TypeScript.`;
    }
}

class TestifyHelpers {
    public static isTestFile(filePath: string): boolean {
        return filePath.endsWith('.test.ts') || filePath.endsWith('.spec.ts') || filePath.includes('tests/');
    }

    public static findModulesWithoutTests(contextData: Record<string, any>, results: AuditFinding[], agentName: string) {
        const testedModules = this.getTestedModules(contextData);
        Object.keys(contextData).forEach(filePath => {
            if (this.isUntestedModule(filePath, testedModules)) {
                results.push(this.createMissingTestFinding(filePath, agentName));
            }
        });
    }

    public static createMissingTestFinding(filePath: string, agentName: string): AuditFinding {
        return {
            file: filePath,
            issue: 'Matéria Escura: Módulo TypeScript sem testes detectados.',
            severity: 'high',
            persona: agentName
        } as any;
    }

    public static getTestedModules(contextData: Record<string, any>): Set<string> {
        const tested = new Set<string>();
        for (const filePath of Object.keys(contextData)) {
            if (filePath.endsWith('.test.ts') || filePath.endsWith('.spec.ts')) {
                tested.add(filePath.replace(/\.(test|spec)\.ts$/, '.ts'));
            }
        }
        return tested;
    }

    public static isUntestedModule(filePath: string, testedModules: Set<string>): boolean {
        if (!filePath.endsWith('.ts') || this.isTestFile(filePath) || filePath.endsWith('.d.ts')) return false;
        if (filePath.includes('__init__') || filePath.includes('index.ts')) return false;
        return !testedModules.has(filePath);
    }
}
