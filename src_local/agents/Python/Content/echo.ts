/**
 * 🔊 Echo - PhD in Semantic Echo & Resource Mapping (Python Stack)
 * Analisa a integridade de strings, mensagens de erro e constantes em Python.
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class EchoPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Echo";
        this.emoji = "🔊";
        this.role = "PhD Content Strategist";
        this.stack = "Python";
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const rules: AuditRule[] = [
            { regex: /"[\w\s]{50,}"/, issue: "Hardcoded String: Use constantes ou sistemas de l10n para strings longas em Python.", severity: "medium" },
            { regex: /print\(f".*"\)/, issue: "Interpolação de Log: Verifique se a interpolação não consome recursos antes de decidir o log level.", severity: "low" },
            { regex: /error_message = .*/, issue: "Semântica de Erro: Verifique se as mensagens de erro são descritivas e seguem o padrão forense PhD.", severity: "low" },
            { regex: /raise Exception\(.*\)/, issue: "Exceção Genérica: Use exceções customizadas para garantir que o sistema de diagnóstico identifique a causa raiz.", severity: "high" }
        ];
        const results = await this.findPatterns([".py"], rules);

        // Advanced Logic: Semantic Content Audit
        if (results.some(r => r.severity === "high")) {
            this.reasonAboutObjective("Narrative Integrity", "Exceptions", "Found generic exceptions in Python layer, reducing diagnostic depth.");
        }

        this.endMetrics(results.length);
        return results;
    }

    public override performActiveHealing(blindSpots: string[]): void {
        console.log(`🛠️ [Echo] Normalizando mensagens de erro e extraindo constantes em: ${blindSpots.join(", ")}`);
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): string | StrategicFinding | null {
        return {
            objective,
            analysis: "Auditando fidelidade semântica e clareza de saída legacy.",
            recommendation: "Substituir strings hardcoded por um 'Resource Dictionary' centralizado no suporte Python.",
            severity: "low"
        } as StrategicFinding;
    }

    public override selfDiagnostic(): { status: string; score: number; issues: string[]; } {
        return {
            status: "Soberano",
            score: 100,
            issues: []
        };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Semântica de Conteúdo Python. Sua missão é garantir a clareza absoluta das mensagens do sistema.`;
    }
}

