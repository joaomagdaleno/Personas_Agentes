import { BaseActivePersona } from "../../base.ts";
import type { AuditFinding, AuditRule, StrategicFinding, ProjectContext } from "../../base.ts";

/**
 * 📡 Stream - PhD in Reactive Systems & Asynchronous Flow (Kotlin)
 * Especialista em Kotlin Flows, concorrência estruturada e prevenção de vazamentos reativos.
 */
export class StreamPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Stream";
        this.emoji = "📡";
        this.role = "PhD Reactive Architect";
        this.phd_identity = "Reactive Systems & Kotlin Flow Memory Isolation";
        this.stack = "Kotlin";
    }

    public override async execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]> {
        this.setContext(context);
        const findings: (AuditFinding | StrategicFinding)[] = await this.performAudit();
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".kt"],
            rules: [
                { regex: /callbackFlow\s*\{(?!.*awaitClose)/, issue: "Vazamento Crítico: Flow detectado sem chamada de awaitClose {}. Risco absoluto de memory leak na JVM PhD.", severity: "critical" },
                { regex: /MutableStateFlow/, issue: "Gestão de Estado: Verifique se a coleta está vinculada ao ciclo de vida (repeatOnLifecycle) no Android PhD.", severity: "high" }
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
        if (typeof content === 'string' && content.includes("callbackFlow") && !content.includes("awaitClose")) {
            return {
                file,
                issue: `Instabilidade Sistêmica: O objetivo '${objective}' exige resiliência. Vazamento de listeners de fluxo em '${file}' drena recursos da JVM silenciosamente PhD.`,
                severity: "STRATEGIC",
                context: this.name
            };
        }
        return {
            file, severity: "INFO",
            issue: `PhD Stream (Kotlin): Analisando reatividade para ${objective}. Focando em fluxos assíncronos seguros na JVM.`,
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Sistemas Reativos e Mestre em Concorrência Estruturada Kotlin Flow.`;
    }
}
