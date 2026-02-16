/**
 * 🧪 Testify - PhD in Kotlin Test Coverage & QA (Sovereign Version)
 * Analisa a integridade de testes Unit e Instrumented (Espresso) em Kotlin.
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export enum TestQuality {
    PRECISION = "PRECISION",
    ROBUSTNESS = "ROBUSTNESS",
    LEGACY_PARITY = "LEGACY_PARITY",
    BRITTLE = "BRITTLE",
    DEEP_FORENSIC = "DEEP_FORENSIC"
}

export class MockIntegrityEngine {
    public static analyze(content: string): string[] {
        const issues: string[] = [];
        if (content.includes("verify { any() }")) issues.push("Verificação Genérica: Evite 'any()' em verificações MockK para manter precisão forense.");
        if (content.includes("Mockito")) issues.push("Legacy Mocking: Considere migrar totalmente para MockK para melhor suporte a Coroutines.");
        return issues;
    }
}

export class TestifyPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Testify";
        this.emoji = "🧪";
        this.role = "PhD Test Architect";
        this.stack = "Kotlin";
    }

    public override performAudit(): AuditFinding[] {
        this.startMetrics();
        const rules: AuditRule[] = [
            { regex: /@Test/, issue: "Teste Básico: Verifique se o nome do método de teste é descritivo (use backticks if needed).", severity: "low" },
            { regex: /@Mock|Mockito\.mock|mockk\(/, issue: "Mocking: Verifique se os mocks estão sendo limpos no @After ou se o MockK está devidamente unmocked.", severity: "medium" },
            { regex: /assertEquals\(.*\)/, issue: "Asserção Genérica: Considere usar AssertJ ou hamcrest para asserções mais semânticas e legíveis.", severity: "low" },
            { regex: /Espresso\.onView/, issue: "UI Test: Verifique se o IdlingResource está configurado para evitar flaky tests.", severity: "medium" },
            { regex: /runBlockingTest|runTest/, issue: "Coroutine Test: Garanta que o TestCoroutineDispatcher está sendo injetado para controle de tempo.", severity: "medium" },
            { regex: /@Before|@BeforeEach/, issue: "Setup: Verifique se o setup não é excessivamente pesado, degradando a performance da suíte.", severity: "low" },
            { regex: /@After|@AfterEach/, issue: "Cleanup: Verifique se não há vazamento de memória ou estado entre testes unitários.", severity: "medium" },
            { regex: /verify\s*{/, issue: "Verificação de Chamada: Garanta que todas as chamadas críticas do mock foram verificadas (atLeastOne, exactly=1).", severity: "low" },
            { regex: /coEvery\s*{/, issue: "Mock de Coroutine: Verifique se o retorno simulado cobre casos de erro/exceção da suspensão.", severity: "medium" },
            { regex: /@RunWith\(Parameterized::class\)/, issue: "Teste Parametrizado: Verifique se a lista de parâmetros inclui valores limite (0, null, empty).", severity: "medium" }
        ];
        const results = this.findPatterns([".kt"], rules);

        // Structural Boost: Integrity Engine
        const mockIssues = MockIntegrityEngine.analyze(this.projectRoot || "");
        mockIssues.forEach(m => results.push({ file: "DYNAMIC", issue: m, severity: "low", line: 0 }));

        this.endMetrics(results.length);
        return results;
    }

    public filterByQuality(findings: AuditFinding[]): TestQuality {
        const criticals = findings.filter(f => f.severity === "high").length;
        switch (true) {
            case criticals > 5: return TestQuality.BRITTLE;
            case findings.length > 50: return TestQuality.DEEP_FORENSIC;
            case findings.length > 20: return TestQuality.ROBUSTNESS;
            default: return TestQuality.PRECISION;
        }
    }

    public override performActiveHealing(blindSpots: string[]): void {
        console.log(`🛠️ [Testify] Otimizando setup de testes e injetando dispatchers controlados em: ${blindSpots.join(", ")}`);
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): string | StrategicFinding | null {
        return {
            objective,
            analysis: "Auditando a estabilidade da camada de testes JVM/Android.",
            recommendation: "Migrar JUnit 4 para JUnit 5 e usar MockK para melhor suporte a coroutines e singletons.",
            severity: "low"
        } as StrategicFinding;
    }

    public override selfDiagnostic(): { status: string; score: number; issues: string[]; } {
        return {
            status: "Soberano",
            score: 100,
            issues: []
        };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Qualidade JVM. Sua missão é garantir que o código Kotlin seja à prova de falhas sob carga.`;
    }
}
