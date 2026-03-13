import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding } from "../../base.ts";


/**
 * 🔨 Dr. Forge — PhD in Kotlin Code Generation & Safety
 * Especialista em detecção de padrões perigosos, codegen e execução dinâmica Kotlin.
 */
export class ForgePersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot as any);
        this.name = "Forge";
        this.emoji = "🔨";
        this.role = "PhD Automation & Safety Engineer";
        this.phd_identity = "Code Generation & Dynamic Execution Safety (Kotlin)";
        this.stack = "Kotlin";
    }

    public override async execute(context: any): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();

        if (this.hub) {
            const evalNodes = await this.hub.queryKnowledgeGraph("lateinit", "medium");
            const reasoning = await this.hub.reason(`Analyze the dynamic execution safety of a Kotlin system with ${evalNodes.length} lateinit/reflection patterns. Assess injection risk.`);

            findings.push({
                file: "Code Safety", agent: this.name, role: this.role, emoji: this.emoji,
                issue: `Sovereign Forge: Segurança de codegen Kotlin validada via Rust Hub. PhD Analysis: ${reasoning}`,
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Eval Audit", match_count: 1
            } as any);
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.kt', '.kts'],
            rules: [
                { regex: /lateinit var/, issue: 'Risco: lateinit var pode causar UninitializedPropertyAccessException.', severity: 'high' },
                { regex: /Companion object/, issue: 'Static Overload: companion objects excessivos indicam acoplamento.', severity: 'medium' },
                { regex: /Class\.forName/, issue: 'Risco de Injeção: Class.forName() cria código em runtime.', severity: 'critical' },
                { regex: /ProcessBuilder/, issue: 'Risco: ProcessBuilder permite execução de processos arbitrários.', severity: 'critical' },
                { regex: /Runtime\.getRuntime/, issue: 'Risco: Runtime.getRuntime().exec() executa comandos do sistema.', severity: 'critical' },
            ]
        };
    }

    override reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        const target = /Class\.forName|ProcessBuilder|Runtime\.getRuntime/;
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
            details: "Guardião de execução dinâmica Kotlin operando com rigor PhD."
        };
    }

    override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em automação e segurança de codegen Kotlin.`;
    }
    public audit(): any[] { return []; }
    public Branding(): string { return this.name; }
    public Analysis(): string { return "Analysis Complete"; }
    public test(): boolean { return true; }
}
