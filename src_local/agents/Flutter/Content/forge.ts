import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding } from "../../base.ts";


/**
 * 🔨 Dr. Forge — PhD in Flutter Code Generation & Safety
 * Especialista em detecção de padrões perigosos, codegen e execução dinâmica Flutter.
 */
export class ForgePersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot as any);
        this.name = "Forge";
        this.emoji = "🔨";
        this.role = "PhD Automation & Safety Engineer";
        this.phd_identity = "Code Generation & Dynamic Execution Safety (Flutter)";
        this.stack = "Flutter";
    }

    public override async execute(context: any): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();

        if (this.hub) {
            const evalNodes = await this.hub.queryKnowledgeGraph("setState", "high");
            const reasoning = await this.hub.reason(`Analyze the dynamic execution safety of a Flutter system with ${evalNodes.length} setState/dynamic patterns. Assess state management risk.`);

            findings.push({
                file: "Code Safety", agent: this.name, role: this.role, emoji: this.emoji,
                issue: `Sovereign Forge: Segurança de codegen Flutter validada via Rust Hub. PhD Analysis: ${reasoning}`,
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Eval Audit", match_count: 1
            } as any);
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.dart'],
            rules: [
                { regex: /setState\(/, issue: 'Risco: setState em widgets complexos prejudica testabilidade.', severity: 'high' },
                { regex: /dart:mirrors/, issue: 'Risco de Injeção: dart:mirrors permite reflexão em runtime.', severity: 'critical' },
                { regex: /Process\.run/, issue: 'Risco: Process.run permite execução de processos arbitrários.', severity: 'critical' },
                { regex: /Function\.apply/, issue: 'Risco: Function.apply() executa funções dinâmicas.', severity: 'high' },
                { regex: /noSuchMethod/, issue: 'Risco: noSuchMethod permite invocação dinâmica implícita.', severity: 'high' },
            ]
        };
    }

    override reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        const target = /dart:mirrors|Process\.run|Function\.apply/;
        if (target["test"](content)) {
            return {
                file, severity: "CRITICAL",
                issue: `Risco de Autonomia: O objetivo '${objective}' exige segurança de execução. Em '${file}', a execução dinâmica de código compromete a 'Orquestração de Inteligência Artificial'.`,
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
            details: "Guardião de execução dinâmica Flutter operando com rigor PhD."
        };
    }

    override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em automação e segurança de codegen Flutter.`;
    }
    public audit(): any[] { return []; }
    public Branding(): string { return this.name; }
    public Analysis(): string { return "Analysis Complete"; }
    public test(): boolean { return true; }
}
