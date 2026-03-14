import { BaseActivePersona } from "../../base.ts";
import type { AuditFinding, AuditRule, StrategicFinding, ProjectContext } from "../../base.ts";

/**
 * 🌊 Flow - PhD in Reactive Navigation & Information Topology (Kotlin)
 * Especialista em Jetpack Navigation, roteamento type-safe e arquiteturas de fluxo baseadas em Compose.
 */
export class FlowPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Flow";
        this.emoji = "🌊";
        this.role = "PhD Navigation Architect";
        this.phd_identity = "Information Topology & Reactive Navigation (Kotlin)";
        this.stack = "Kotlin";
    }

    public override async execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]> {
        this.setContext(context);
        const findings: (AuditFinding | StrategicFinding)[] = await this.performAudit();
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".kt", ".kts"],
            rules: [
                { regex: /composable\((["\']).*?\1\)/, issue: "Fragilidade: Roteamento via String detectado. Use Type-Safe DSL do Navigation Compose PhD.", severity: "medium" },
                { regex: /popUpTo\((?!.*inclusive\s*=\s*true)/, issue: "Retenção de Pilha: Risco de navegação circular e vazamento de memória na backstack JVM PhD.", severity: "high" }
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

    public override reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | null {
        if (typeof content === 'string' && content.includes("composable") && content.includes("\"")) {
            return {
                file,
                issue: `Entropia de Destino: O objetivo '${objective}' exige determinismo. Rotas não-tipadas em '${file}' ameaçam a integridade de navegação PhD.`,
                severity: "STRATEGIC",
                context: this.name
            };
        }
        return {
            file, severity: "INFO",
            issue: `PhD Flow (Kotlin): Analisando topologia reativa para ${objective}. Focando em navegação segura e integridade de transição de estado.`,
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Topologia de Informação e Arquiteto de Fluxos Kotlin.`;
    }
}
