/**
 * 🏗️ Scale - PhD in System Architecture & Scalability (Flutter)
 * Especialista em modularidade, gestão de pacotes e padrões arquiteturais Dart.
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class ScalePersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Scale";
        this.emoji = "🏗️";
        this.role = "PhD Software Architect";
        this.stack = "Flutter";
    }

    public override performAudit(): AuditFinding[] {
        this.startMetrics();
        const rules: AuditRule[] = [
            { regex: /import\s+['"]package:.*?\/src\/.*?['"]/, issue: "Acoplamento: Importação de pastas internas (/src/) de outros pacotes detectada.", severity: "high" },
            { regex: /global\s+/, issue: "Risco de Escalabilidade: Uso de estado global detectado.", severity: "critical" }
        ];
        const results = this.findPatterns([".dart"], rules);
        this.endMetrics(results.length);
        return results;
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): string | StrategicFinding | null {
        return `PhD Architecture: Analisando padrões de escalabilidade para ${objective}. Focando em desacoplamento e isolamento de estado.`;
    }

    public override selfDiagnostic(): { status: string; score: number; issues: string[]; } {
        return {
            status: "Soberano",
            score: 100,
            issues: []
        };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Arquitetura de Sistemas e Escalabilidade Flutter.`;
    }
}
