/**
 * 🧠 Neural - PhD in Applied AI & Android Machine Learning (Kotlin)
 * Especialista em pipelines de inferência on-device, integração ML Kit e otimização de modelos TFLite.
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class NeuralPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Neural";
        this.emoji = "🧠";
        this.role = "PhD AI Architect";
        this.stack = "Kotlin";
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const results = await this.findPatterns([".kt", ".kts"], [
            { regex: /mlkit/, issue: "Risco de Dependência: Uso de ML Kit detectado. Verifique dependência de serviços proprietários.", severity: "low" },
            { regex: /Interpreter\.fromBuffer/, issue: "Carga Crítica: Inferência TFLite em execução direta. Verifique throttling e impacto térmico.", severity: "high" }
        ]);
        this.endMetrics(results.length);
        return results;
    }

    public override reasonAboutObjective(objective: string, file: string, content: string): StrategicFinding | null {
        if (content.includes("mlkit")) {
            return {
                file,
                issue: `Fragilidade Cognitiva: O objetivo '${objective}' exige autonomia. Em '${file}', a dependência do ML Kit vincula o sistema a serviços externos.`,
                severity: "STRATEGIC",
                context: this.name
            };
        }
        return `PhD AI: Analisando modelos de inteligência JVM para ${objective}. Focando em autonomia de inferência e performance neural.`;
    }

    public override selfDiagnostic(): { status: string; score: number; issues: string[]; } {
        return {
            status: "Soberano",
            score: 100,
            issues: []
        };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Inteligência Aplicada e Mestre em Machine Learning Kotlin.`;
    }
}

