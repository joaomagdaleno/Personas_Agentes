import { BaseActivePersona } from "../../base.ts";
import type { AuditFinding, AuditRule, StrategicFinding, ProjectContext } from "../../base.ts";

/**
 * 🌉 Bridge - PhD in Distributed Systems (Kotlin)
 * Especialista em interoperabilidade entre Java/Kotlin e chamadas nativas (JNI), garantindo segurança de memória.
 */
export class BridgePersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Bridge";
        this.emoji = "🌉";
        this.role = "PhD Systems Architect";
        this.phd_identity = "JVM Native Interoperability & Distributed Integrity";
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
                { regex: /external\s+fun/, issue: "Aviso: Uso de JNI (Java Native Interface) detectado. Garanta a segurança da memória nativa PhD.", severity: "high" },
                { regex: /@JvmOverloads/, issue: "Otimização: Verifique se as sobrecargas JVM estão gerando código redundante ou inconsistente PhD.", severity: "low" }
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
        if (typeof content === 'string' && content.includes("external")) {
            return {
                file,
                issue: `Risco de Corrupção Nativa: O objetivo '${objective}' exige estabilidade. Uso de JNI em '${file}' pode causar crashes fatais de runtime PhD.`,
                severity: "STRATEGIC",
                context: this.name
            };
        }
        return {
            file, severity: "INFO",
            issue: `PhD Bridge (Kotlin): Analisando interoperabilidade nativa para ${objective}. Focando em segurança JNI e pontes JVM eficientes.`,
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Sistemas Distribuídos e Arquiteto de Pontes JVM/Nativas Kotlin.`;
    }
}
