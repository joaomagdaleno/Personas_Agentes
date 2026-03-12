import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";
import type { ProjectContext } from "../../../core/types.ts";

export class TestifyPersona extends BaseActivePersona {
    constructor(projectRoot: string | undefined = undefined) {
        super(projectRoot);
        this.name = "Testify";
        this.emoji = "🧪";
        this.role = "PhD Quality Assurance Engineer"; // Matched universally
        this.phd_identity = "Python Test Coverage & QA";
        this.stack = "Python";
    }

    override async execute(context: ProjectContext): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();

        if (this.hub) {
            const untestedQuery = await this.hub.queryKnowledgeGraph("untested", "high");
            const reasoning = await this.hub.reason(`Analyze the "Zero Gap" security of a system with ${untestedQuery.length} untested Python modules.`);

            findings.push({
                file: "Verification Core", agent: this.name, role: this.role, emoji: this.emoji,
                issue: `Sovereign Verification: Cobertura auditada via Rust Hub. PhD Analysis: ${reasoning}`,
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Quality Audit", match_count: 1
            } as any);
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".py"],
            rules: [
                { regex: /def test_[^\(]*\(\s*\):/, issue: "Teste Vazio: Teste Python declarado sem corpo ou asserção.", severity: "critical" },
                { regex: /pytest\.skip\(|unittest\.skip\(/, issue: "Teste Desativado: Teste pulado intencionalmente; cobertura incompleta.", severity: "high" },
                { regex: /assert\s+True|self\.assertTrue\(True\)/, issue: "Asserção Fraca: Teste sem asserção real ou 'assert True'.", severity: "high" },
                { regex: /time\.sleep\(/, issue: "Teste Frágil: Uso de time.sleep() detectado; risco de flaky tests.", severity: "high" },
                { regex: /pytest\.mark\.skipif\(/, issue: "Skipped Logic: Teste condicionalmente desativado; verifique se a condição ainda é válida.", severity: "medium" },
                { regex: /print\(/, issue: "Verbose Testing: Verifique se o log no teste é necessário ou se falhou silenciosamente.", severity: "low" }
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

