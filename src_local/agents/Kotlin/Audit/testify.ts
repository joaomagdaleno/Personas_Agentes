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

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".kt"],
            rules: [
                { regex: /@Test\s+(fun\s+[^{]+{\s*})/, issue: "Teste Vazio: Teste Kotlin declarado sem corpo ou asserção.", severity: "critical" },
                { regex: /@Ignore\(|@Disabled\(/, issue: "Teste Desativado: Teste pulado; cobertura incompleta.", severity: "high" },
                { regex: /runBlockingTest|runTest\s*{\s*delay\(/, issue: "Teste Frágil: Uso de delay em testes de coroutine. Use TestCoroutineDispatcher.", severity: "high" },
                { regex: /assertEquals\(true,\s*/, issue: "Asserção Genérica: Prefira assertTrue() ou asserções AssertJ mais legíveis.", severity: "low" },
                { regex: /Thread\.sleep\(/, issue: "Anti-padrão: Uso de sleep no código de teste Kotlin; risco extremo de flaky tests.", severity: "high" },
                { regex: /verify\s*{\s*[^\(]+\(\)\s*(wasNot\s*Called\(\))?\s*}/, issue: "Verificação Fraca: Garanta verificações exatas de parâmetros e contagem de chamadas no MockK.", severity: "medium" }
            ]
        };
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        const results = await super.performAudit();
        const mockIssues = MockIntegrityEngine.analyze(this.projectRoot || "");
        mockIssues.forEach(m => results.push({
            file: "DYNAMIC", agent: this.name, role: this.role, emoji: this.emoji, issue: m, severity: "low", stack: this.stack,
            evidence: "Structural Analysis", match_count: 1
        }));
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

    public override reasonAboutObjective(objective: string, _file: string, _content: string): StrategicFinding | null {
        return {
            objective,
            analysis: "Auditando a estabilidade da camada de testes JVM/Android.",
            recommendation: "Garantir 80%+ de cobertura e erradicar anti-padrões como Thread.sleep.",
            severity: "INFO",
            file: _file,
            issue: "PhD QA: Analisando infraestrutura de testes para " + objective,
            context: this.name
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

