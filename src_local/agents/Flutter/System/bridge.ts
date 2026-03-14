import { BaseActivePersona } from "../../base.ts";
import type { AuditFinding, AuditRule, StrategicFinding, ProjectContext } from "../../base.ts";

/**
 * 🌉 Bridge - PhD in Distributed Systems (Flutter)
 * Especialista em pontes nativas (MethodChannels), serialização de dados e integração de APIs.
 */
export class BridgePersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Bridge";
        this.emoji = "🌉";
        this.role = "PhD Systems Architect";
        this.phd_identity = "Flutter Native Bridge & MethodChannel Integrity";
        this.stack = "Flutter";
    }

    public override async execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]> {
        this.setContext(context);
        const findings: (AuditFinding | StrategicFinding)[] = await this.performAudit();
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".dart"],
            rules: [
                { regex: /MethodChannel\(/, issue: "Aviso: Uso de canal nativo detectado. Garanta tipagem estrita no lado Dart e Nativo PhD.", severity: "medium" },
                { regex: /dynamic\s+\w+\s*\(/, issue: "Fragilidade: Uso de dynamic em assinaturas de método. Use tipos fortes para evitar quebras de runtime Dart PhD.", severity: "high" }
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
        if (typeof content === 'string' && content.includes("dynamic")) {
            return {
                file,
                issue: `Quebra de Contrato: O objetivo '${objective}' exige previsibilidade. Em '${file}', o uso de 'dynamic' torna a arquitetura Dart vulnerável PhD.`,
                severity: "STRATEGIC",
                context: this.name
            };
        }
        return {
            file, severity: "INFO",
            issue: `PhD Systems (Flutter): Analisando pontes comunicacionais nativas para ${objective}. Focando em estabilidade de interface FFI/MethodChannel.`,
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Sistemas Distribuídos e Arquiteto de Integrações Nativas Flutter.`;
    }
}
