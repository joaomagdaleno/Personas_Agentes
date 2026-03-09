/**
 * 🌉 Bridge - PhD in Distributed Systems (Flutter)
 * Especialista em pontes nativas (MethodChannels), serialização de dados e integração de APIs.
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class BridgePersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Bridge";
        this.emoji = "🌉";
        this.role = "PhD Systems Architect";
        this.stack = "Flutter";
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const results = await this.findPatterns([".dart"], [
            { regex: /MethodChannel\(/, issue: "Aviso: Uso de canal nativo detectado. Garanta tipagem estrita no lado Dart e Nativo.", severity: "medium" },
            { regex: /dynamic\s+\w+\s*\(/, issue: "Fragilidade: Uso de dynamic em assinaturas de método. Use tipos fortes para evitar quebras de runtime.", severity: "high" }
        ]);
        this.endMetrics(results.length);
        return results;
    }

    public override reasonAboutObjective(objective: string, file: string, content: string): StrategicFinding | null {
        if (content.includes("dynamic")) {
            return {
                file,
                issue: `Quebra de Contrato: O objetivo '${objective}' exige previsibilidade. Em '${file}', o uso de 'dynamic' torna a arquitetura vulnerável.`,
                severity: "STRATEGIC",
                context: this.name
            };
        }
        return `PhD Systems: Analisando pontes comunicacionais para ${objective}. Focando em estabilidade de interface e segurança de tipos em canais nativos.`;
    }

    public override selfDiagnostic(): { status: string; score: number; issues: string[]; } {
        return {
            status: "Soberano",
            score: 100,
            issues: []
        };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Sistemas Distribuídos e Arquiteto de Integrações Flutter.`;
    }
}

