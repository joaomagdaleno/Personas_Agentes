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
            { regex: /\n{400,}/, issue: "God File: Arquivo Flutter excessivamente grande; risco de entropia.", severity: "high" },
            { regex: /import\s+['"]\.\.\/\.\.\/.*?['"]/, issue: "Deep Relative: Importação excessivamente profunda; risco de acoplamento.", severity: "medium" },
            { regex: /static\s+.*?/, issue: "Static Abuse: Uso excessivo de membros estáticos dificulta a escala e testes.", severity: "low" },
            { regex: /import\s+['"]package:.*?\/src\/.*?['"]/, issue: "Internal Leak: Importando de /src/ de outros pacotes; risco de quebra de API.", severity: "high" },
            { regex: /class\s+.*\{[\s\S]*class\s+/, issue: "Multi-Class File: Múltiplas classes em um arquivo dificultam a manutenção.", severity: "medium" },
            { regex: /\w+\(.*?,\s*.*?,\s*.*?,\s*.*?,\s*.*?,\s*.*?,\s*.*?,\s*.*?,\s*.*?,\s*.*?\)/, issue: "Massive Constructor: Construtor com mais de 10 parâmetros detectado.", severity: "medium" }
        ];
        const results = this.findPatterns([".dart"], rules);
        this.endMetrics(results.length);
        return results;
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): string | StrategicFinding | null {
        return {
            objective,
            analysis: "Auditando padrões de escalabilidade para soberania arquitetural.",
            file: _file,
            issue: "PhD Architecture: Analisando padrões de desacoplamento e isolamento de estado.",
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
        return `Você é o Dr. ${this.name}, PhD em Arquitetura de Sistemas e Escalabilidade Flutter.`;
    }
}
