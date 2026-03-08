/**
 * 📡 Stream - PhD in Reactive Systems & Asynchronous Flow (Kotlin)
 * Especialista em Kotlin Flows, concorrência estruturada e prevenção de vazamentos reativos.
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class StreamPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Stream";
        this.emoji = "📡";
        this.role = "PhD Reactive Architect";
        this.stack = "Kotlin";
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const results = await this.findPatterns([".kt"], [
            { regex: /callbackFlow\s*\{(?!.*awaitClose)/, issue: "Vazamento Crítico: Flow detectado sem chamada de awaitClose {}. Risco de memory leak.", severity: "critical" },
            { regex: /MutableStateFlow/, issue: "Gestão de Estado: Verifique se a coleta está vinculada ao ciclo de vida (repeatOnLifecycle).", severity: "high" }
        ]);
        this.endMetrics(results.length);
        return results;
    }

    public override reasonAboutObjective(objective: string, file: string, content: string): StrategicFinding | null {
        if (content.includes("callbackFlow") && !content.includes("awaitClose")) {
            return {
                file,
                issue: `Instabilidade Sistêmica: O objetivo '${objective}' exige resiliência. Vazamento de listeners em '${file}' drena recursos do sistema.`,
                severity: "STRATEGIC",
                context: this.name
            };
        }
        return `PhD Flow: Analisando reatividade e concorrência para ${objective}. Focando em fluxos assíncronos seguros e prevenção de fugas.`;
    }

    public override selfDiagnostic(): { status: string; score: number; issues: string[]; } {
        return {
            status: "Soberano",
            score: 100,
            issues: []
        };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Sistemas Reativos e Mestre em Concorrência Estruturada Kotlin.`;
    }
}

