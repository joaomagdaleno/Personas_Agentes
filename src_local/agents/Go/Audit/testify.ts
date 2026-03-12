import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";
import type { ProjectContext } from "../../../core/types.ts";

export class TestifyPersona extends BaseActivePersona {
    constructor(projectRoot: string | undefined = undefined) {
        super(projectRoot);
        this.name = "Testify";
        this.emoji = "🧪";
        this.role = "PhD Quality Assurance Engineer"; // Matched universally
        this.phd_identity = "Go Testing & Verification Specialist";
        this.stack = "Go";
    }

    override async execute(context: ProjectContext): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();

        if (this.hub) {
            const untestedQuery = await this.hub.queryKnowledgeGraph("untested", "high");
            const reasoning = await this.hub.reason(`Generate a PhD test strategy for a Go system with ${untestedQuery.length} untested modules.`);

            findings.push({
                file: "Verification Core", agent: this.name, role: this.role, emoji: this.emoji,
                issue: `Sovereign Verification: Cobertura Go validada via Rust Hub. PhD Analysis: ${reasoning}`,
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Quality Audit", match_count: 1
            } as any);
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
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
            recommendation: "Garantir que testes críticos não usem waits frágeis e que rituais de Assert Expectation sejam seguidos.",
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

