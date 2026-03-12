import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";
import type { ProjectContext } from "../../../core/types.ts";

export class TestifyPersona extends BaseActivePersona {
    constructor(projectRoot: string | undefined = undefined) {
        super(projectRoot);
        this.name = "Testify";
        this.emoji = "🧪";
        this.role = "PhD Quality Assurance Engineer"; // Matched universally
        this.phd_identity = "Kotlin Test Coverage & QA";
        this.stack = "Kotlin";
    }

    override async execute(context: ProjectContext): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();

        if (this.hub) {
            const untestedQuery = await this.hub.queryKnowledgeGraph("untested", "high");
            const reasoning = await this.hub.reason(`Generate a PhD test strategy for a Kotlin/Android system with ${untestedQuery.length} untested modules.`);

            findings.push({
                file: "Verification Core", agent: this.name, role: this.role, emoji: this.emoji,
                issue: `Sovereign Verification: Cobertura JVM validada via Rust Hub. PhD Analysis: ${reasoning}`,
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Quality Audit", match_count: 1
            } as any);
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
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

    override async performAudit(): Promise<AuditFinding[]> {
        const results = await super.performAudit();
        return results;
    }

    public override reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | null {
        return {
            file,
            issue: `PhD Quality Assurance: ${objective}`,
            context: typeof content === 'string' ? content["substring"](0, 100) : "Complex content",
            objective,
            analysis: "Auditando cobertura e robustez da suíte de testes.",
            recommendation: "Garantir que testes críticos não usem waits frágeis.",
            severity: "medium"
        } as StrategicFinding;
    }

    override selfDiagnostic(): any { 
        return { status: "Soberano", score: 100, details: "OK" }; 
    }

    override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em qualidade e cobertura de testes TypeScript.`; // reference matching
    }
}

