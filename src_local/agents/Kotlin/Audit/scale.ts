/**
 * 🏗️ Scale - PhD in Architecture (Kotlin)
 * Especialista em modularidade Android, injeção de dependência e padrões arquiteturais Kotlin.
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class ScalePersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Scale";
        this.emoji = "🏗️";
        this.role = "PhD Software Architect";
        this.stack = "Kotlin";
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".kt"],
            rules: [
                { regex: /\n{400,}/, issue: "God File: Arquivo excessivamente grande; risco de entropia Kotlin.", severity: "high" },
                { regex: /import\s+.*?\.\.\/\.\.\//, issue: "Deep Relative: Importação excessivamente profunda; risco de acoplamento.", severity: "medium" },
                { regex: /object\s+\w+\s*\{(?!.*companion)/, issue: "Singleton Abuse: Uso de 'object' pode dificultar injeção de dependência.", severity: "medium" },
                { regex: /import\s+.*?\.\*/, issue: "Wildcard Import: Poluição de namespace Kotlin detectada.", severity: "low" },
                { regex: /import\s+.*?\.internal\..*?/, issue: "Internal Leak: Importando de pacotes internos de outros módulos.", severity: "high" },
                { regex: /lateinit\s+var/, issue: "State Risk: 'lateinit var' pode causar UninitializedPropertyAccessException em escala.", severity: "medium" }
            ]
        };
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): string | StrategicFinding | null {
        return {
            objective,
            analysis: "Auditando padrões de escalabilidade para soberania arquitetural Kotlin.",
            file: _file,
            issue: "PhD Architecture: Analisando padrões de desacoplamento e injeção de dependência.",
            severity: "INFO",
            context: this.name
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
        return `Você é o Dr. ${this.name}, PhD em Arquitetura de Sistemas e Especialista Android/Kotlin.`;
    }
}
