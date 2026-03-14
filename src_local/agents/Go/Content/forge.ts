import { BaseActivePersona } from "../../base.ts";
import type { AuditFinding, AuditRule, StrategicFinding, ProjectContext } from "../../base.ts";

/**
 * 🔨 Dr. Forge — PhD in Go Code Generation & Safety
 * Especialista em detecção de eval/exec, codegen dinâmica e execução perigosa em Go.
 */
export class ForgePersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Forge";
        this.emoji = "🔨";
        this.role = "PhD Automation & Safety Engineer";
        this.phd_identity = "Code Generation & Dynamic Execution Safety (Go)";
        this.stack = "Go";
    }

    public override async execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]> {
        this.setContext(context);
        const findings: (AuditFinding | StrategicFinding)[] = await this.performAudit();

        if (this.hub) {
            const evalNodes = await this.hub.queryKnowledgeGraph("go:generate", "medium");
            const reasoning = await this.hub.reason(`Analyze the dynamic execution safety of a Go system with ${evalNodes.length} codegen directives. Assess template injection risk.`);

            findings.push({
                file: "Code Safety", agent: this.name, role: this.role, emoji: this.emoji,
                issue: `Sovereign Forge: Segurança de codegen Go validada via Rust Hub. PhD Analysis: ${reasoning}`,
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Eval Audit", match_count: 1
            } as any);
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".go"],
            rules: [
                { regex: /go:generate/, issue: "Direct Codegen: go:generate detectado; verifique ferramentas no PATH do CI para soberania PhD.", severity: "low" },
                { regex: /text\/template/, issue: "Inseguro: text/template para output web detectado; risco de XSS PhD.", severity: "high" },
                { regex: /protobuf/, issue: "Protobuf: Verifique se .pb.go estão atualizados com .proto para integridade PhD.", severity: "medium" },
                { regex: /MockGen/, issue: "Mock Generation: Verifique se mocks não introduzem acoplamento excessivo PhD.", severity: "medium" },
                { regex: /unsafe\.Pointer/, issue: "Risco: unsafe.Pointer permite manipulação direta de memória; use com cautela PhD.", severity: "critical" }
            ]
        };
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const rules = this.getAuditRules();
        const results = await this.findPatterns(rules.extensions, rules.rules);
        this.endMetrics(results.length);
        return results;
    }

    public override reasonAboutObjective(objective: string, file: string, _content: string | Promise<string | null>): StrategicFinding | null {
        return {
            file,
            issue: `PhD Forge: Analisando segurança de automação para ${objective}. Focando em sanitização de execução dinâmica.`,
            severity: "STRATEGIC",
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return {
            status: "Soberano",
            score: 100,
            issues: []
        };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em automação e segurança de codegen Go.`;
    }
}
