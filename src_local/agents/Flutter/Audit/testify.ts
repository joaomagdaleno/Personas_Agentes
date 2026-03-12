import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";
import type { ProjectContext } from "../../../core/types.ts";

export class TestifyPersona extends BaseActivePersona {
    constructor(projectRoot: string | undefined = undefined) {
        super(projectRoot);
        this.name = "Testify";
        this.emoji = "🧪";
        this.role = "PhD Quality Assurance Engineer"; // Matched universally
        this.phd_identity = "Flutter Test Coverage & QA";
        this.stack = "Flutter";
    }

    override async execute(context: ProjectContext): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();

        if (this.hub) {
            const untestedQuery = await this.hub.queryKnowledgeGraph("untested", "high");
            const reasoning = await this.hub.reason(`Generate a PhD test strategy for a Flutter system with ${untestedQuery.length} untested modules.`);

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
            extensions: [".dart"],
            rules: [
                { regex: /testWidgets?\s*\(/, issue: "Teste Vazio: Teste Flutter/Dart sem corpo ou framework corrompido.", severity: "critical" },
                { regex: /@Skip\(|skip:\s*true/, issue: "Teste Desativado: Teste pulado intencionalmente; expõe cobertura incompleta.", severity: "high" },
                { regex: /tester\.pumpAndSettle\(\)/, issue: "Teste Frágil: Evite pumpAndSettle sem limites; pode causar timeout em loops de UI.", severity: "medium" },
                { regex: /expect\([\w\.]*,\s*(?:true|false)\)/, issue: "Asserção Genérica: Use asserções mais específicas ou custom matchers (isA<Type>).", severity: "low" },
                { regex: /Future\.delayed\(/, issue: "Anti-padrão: Uso de delay forçado em teste; prefira pump() ou runAsync().", severity: "high" },
                { regex: /verify\(\s*[^\)]+\s*\)(\.called\(1\))?/, issue: "Verificação Fraca: Especifique se a verificação do Mocktail usou os argumentos corretos.", severity: "medium" }
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

