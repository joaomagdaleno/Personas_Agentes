/**
 * 🌉 Bridge - PhD in Distributed Systems (Kotlin)
 * Especialista em interoperabilidade entre Java/Kotlin e chamadas nativas (JNI), garantindo segurança de memória.
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class BridgePersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Bridge";
        this.emoji = "🌉";
        this.role = "PhD Systems Architect";
        this.stack = "Kotlin";
    }

    public override performAudit(): AuditFinding[] {
        this.startMetrics();
        const results = this.findPatterns([".kt", ".kts"], [
            { regex: /external\s+fun/, issue: "Aviso: Uso de JNI (Java Native Interface) detectado. Garanta a segurança da memória nativa.", severity: "high" },
            { regex: /@JvmOverloads/, issue: "Otimização: Verifique se as sobrecargas JVM estão gerando código redundante ou inconsistente.", severity: "low" }
        ]);
        this.endMetrics(results.length);
        return results;
    }

    public override reasonAboutObjective(objective: string, file: string, content: string): StrategicFinding | null {
        if (content.includes("external")) {
            return {
                file,
                issue: `Risco de Corrupção Nativa: O objetivo '${objective}' exige estabilidade. Uso de JNI em '${file}' pode causar crashes fatais de runtime.`,
                severity: "STRATEGIC",
                context: this.name
            };
        }
        return `PhD Systems: Analisando interoperabilidade nativa para ${objective}. Focando em segurança JNI e pontes JVM eficientes.`;
    }

    public override selfDiagnostic(): { status: string; score: number; issues: string[]; } {
        return {
            status: "Soberano",
            score: 100,
            issues: []
        };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Sistemas Distribuídos e Arquiteto de Pontes JVM/Nativas Kotlin.`;
    }
}
