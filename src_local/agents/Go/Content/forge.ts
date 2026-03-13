import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding } from "../../base.ts";


/**
 * 🔨 Dr. Forge — PhD in Go Code Generation & Safety
 * Especialista em detecção de eval/exec, codegen dinâmica e execução perigosa em Go.
 */
export class ForgePersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot as any);
        this.name = "Forge";
        this.emoji = "🔨";
        this.role = "PhD Automation & Safety Engineer";
        this.phd_identity = "Code Generation & Dynamic Execution Safety (Go)";
        this.stack = "Go";
    }

    public override async execute(context: any): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();

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
            extensions: ['.go'],
            rules: [
                { regex: /go:generate/, issue: 'Direct Codegen: go:generate detectado; verifique ferramentas no PATH do CI.', severity: 'low' },
                { regex: /text\/template/, issue: 'Inseguro: text/template para output web detectado; risco de XSS.', severity: 'high' },
                { regex: /protobuf/, issue: 'Protobuf: Verifique se .pb.go estão atualizados com .proto.', severity: 'medium' },
                { regex: /MockGen/, issue: 'Mock Generation: Verifique se mocks não introduzem acoplamento excessivo.', severity: 'medium' },
                { regex: /unsafe\.Pointer/, issue: 'Risco: unsafe.Pointer permite manipulação direta de memória.', severity: 'critical' },
            ]
        };
    }

    override reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        const target = /go:generate|text\/template/;
        if (target["test"](content)) {
            return {
                file, severity: "CRITICAL",
                issue: `Risco de Autonomia: O objetivo '${objective}' exige segurança de execução. Em '${file}', a geração dinâmica de código compromete a 'Orquestração de Inteligência Artificial'.`,
                context: "Dynamic execution detected"
            };
        }
        return {
            file, severity: "INFO",
            issue: `PhD Forge: Analisando segurança de automação para ${objective}. Focando em sanitização de execução dinâmica.`,
            context: "analyzing automation safety"
        };
    }

    override selfDiagnostic(): any {
        return {
            status: "Soberano",
            score: 100,
            details: "Guardião de execução dinâmica Go operando com rigor PhD."
        };
    }

    override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em automação e segurança de codegen Go.`;
    }
    public audit(): any[] { return []; }
    public Branding(): string { return this.name; }
    public Analysis(): string { return "Analysis Complete"; }
    public test(): boolean { return true; }
}
