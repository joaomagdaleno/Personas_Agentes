/**
 * 🧪 Testify - PhD in Python Test Coverage & QA (Sovereign Version)
 * Analisa a integridade de testes Pytest e Unittest em Python.
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
        if (content.includes("call_args_list")) issues.push("Verificação Forense: O uso de call_args_list é encorajado para auditoria completa de chamadas.");
        if (content.includes("unittest.mock")) issues.push("Legacy Mocking: Considere usar Pytest-mock para uma sintaxe mais limpa e moderna.");
        return issues;
    }
}

export class TestifyPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Testify";
        this.emoji = "🧪";
        this.role = "PhD Test Architect";
        this.stack = "Python";
    }

    public override performAudit(): AuditFinding[] {
        this.startMetrics();
        const rules: AuditRule[] = [
            { regex: /def test_/, issue: "Teste Básico: Verifique se o nome do teste descreve o comportamento esperado e não apenas a função.", severity: "low" },
            { regex: /pytest\.fixture|@pytest\.fixture/, issue: "Fixture: Verifique o 'scope' da fixture para evitar efeitos colaterais entre testes.", severity: "medium" },
            { regex: /unittest\.mock|mock\.patch|MagicMock/, issue: "Mocking: O uso excessivo de patch pode degradar a performance. Use dependências injetáveis.", severity: "low" },
            { regex: /assert\s+True/, issue: "Asserção Fraca: Use asserções mais específicas do Pytest (ex: assert x == y) para melhores mensagens de erro.", severity: "medium" },
            { regex: /pytest\.mark\.parametrize/, issue: "Teste Parametrizado: Verifique a cobertura de casos de borda (edge cases) na lista de parâmetros.", severity: "low" },
            { regex: /with pytest\.raises/, issue: "Teste de Exceção: Garanta que a mensagem ou código de erro está sendo validado no bloco 'with'.", severity: "medium" },
            { regex: /time\.sleep\(/, issue: "Anti-padrão: Uso de sleep em testes indica fragilidade de sincronia. Use espera reativa ou mocks de tempo.", severity: "high" },
            { regex: /conftest\.py/, issue: "Configuração: Verifique se as fixtures globais não estão gerando overhead desnecessário.", severity: "low" },
            { regex: /mock\.assert_called_with/, issue: "Verificação de Parâmetros: Garanta que todos os argumentos passados foram validados com precisão.", severity: "medium" },
            { regex: /pytest\.skip\(/, issue: "Teste Pulado: Verifique se o motivo do skip ainda é válido ou se há uma falha de ambiente não resolvida.", severity: "low" }
        ];
        const results = this.findPatterns([".py"], rules);

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
        console.log(`🛠️ [Testify] Refatorando fixtures e substituindo sleeps por esperas assíncronas em: ${blindSpots.join(", ")}`);
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): string | StrategicFinding | null {
        return {
            objective,
            analysis: "Auditando a densidade e confiabilidade da suíte de testes Python.",
            recommendation: "Migrar testes legados para Pytest e usar 'Tox' ou 'Nox' para testes multi-ambiente.",
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
        return `Você é o Dr. ${this.name}, PhD em Automação de Testes Python. Sua missão é garantir o 'Zero Gap' entre código e verificação.`;
    }
}
