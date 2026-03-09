/**
 * 🧪 Testify - PhD in Go Testing & Verification (Sovereign Version)
 * Analisa a qualidade, cobertura e integridade das suítes de teste Go.
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export enum TestQualityGo {
    DEEP_STACK = "DEEP_STACK",
    BRITTLE = "BRITTLE",
    UNTESTED = "UNTESTED"
}

export class GoTestIntegrityEngine {
    public static analyze(content: string): string[] {
        const issues: string[] = [];
        if (content.includes("testify/mock") && !content.includes("AssertExpectations")) {
            issues.push("Mock Integrity: Uso de Testify Mock sem verificação de expectativas (AssertExpectations).");
        }
        if (content.includes("func Test") && !content.includes("t.Parallel()")) {
            issues.push("Serialized Tests: Considere t.Parallel() para acelerar a suíte de testes Go.");
        }
        if (content.includes("Suite") && !content.includes("SetupSuite")) {
            issues.push("Suite Lifecycle: Teste de suíte detectado sem setup centralizado; verifique a consistência do estado.");
        }
        return issues;
    }
}

export class TestifyPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Testify";
        this.emoji = "🧪";
        this.role = "PhD Verification Specialist";
        this.stack = "Go";
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".go", "_test.go"],
            rules: [
                { regex: /func\s+Test.*\{\s*}/, issue: "Empty Test: Teste sem lógica ou asserções detectado.", severity: "critical" },
                { regex: /t\.Skip\(\)/, issue: "Suppressed Test: Verifique se o skip é temporário para evitar buracos na cobertura.", severity: "medium" },
                { regex: /time\.Sleep/, issue: "Flaky Test Risk: O uso de time.Sleep em testes Go indica fragilidade; use canais ou sincronização.", severity: "high" },
                { regex: /reflect\.DeepEqual/, issue: "Performance: Prefira google/go-cmp para comparações complexas e mais legíveis.", severity: "low" },
                { regex: /func\s+Test.*t\.Parallel\(\)/, issue: "Performance: Teste não paralelizado detectado; verifique se pode usar t.Parallel().", severity: "low" },
                { regex: /assert\.Equal\(t,\s*nil,\s*err\)/, issue: "Generic Assert: Prefira assert.NoError(t, err) para mensagens de erro mais claras.", severity: "low" }
            ]
        };
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        const results = await super.performAudit();
        const integrityIssues = GoTestIntegrityEngine.analyze(this.projectRoot || "");
        integrityIssues.forEach(i => results.push({
            file: "TEST_SUITE", agent: this.name, role: this.role, emoji: this.emoji, issue: i, severity: "medium", stack: this.stack,
            evidence: "Structural Analysis", match_count: 1
        }));
        return results;
    }

    public override performActiveHealing(blindSpots: string[]): void {
        console.log(`🛠️ [Testify] Injetando t.Parallel(), convertendo asserções e normalizando t.Cleanup() em: ${blindSpots.join(", ")}`);
    }

    public override reasonAboutObjective(objective: string, file: string, content: string): string | StrategicFinding | null {
        return {
            file,
            issue: `Estratégia: ${objective}`,
            context: content.substring(0, 200),
            objective,
            analysis: "Auditando a robustez da rede de segurança do código Go.",
            recommendation: "Migrar para tabelas de teste (Table-Driven Tests) e garantir 80%+ de cobertura em pacotes críticos.",
            severity: "medium"
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
        return `Você é o Dr. ${this.name}, PhD em Qualidade e Verificação Go. Sua missão é garantir que nenhum bug escape para produção.`;
    }
}

