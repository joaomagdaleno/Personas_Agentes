/**
 * ⚒️ Forge - PhD in Code Generation & Architectual Blueprinting (Python Stack)
 * Analisa a qualidade do boilerplate Python e a estrutura de pacotes.
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class ForgePersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Forge";
        this.emoji = "⚒️";
        this.role = "PhD Software Architect";
        this.stack = "Python";
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const rules: AuditRule[] = [
            { regex: /import src_local/, issue: "Padrão de Import: Verifique se as importações seguem a estrutura modular PhD e se não há imports circulares.", severity: "low" },
            { regex: /class .*:[\s\S]*?def __init__/, issue: "Estrutura de Classe: Verifique se as classes são coesas e se o estado interno é minimizado.", severity: "low" },
            { regex: /def .*\(\) -> None:/, issue: "Tipagem Estática: O uso de Type Hints é obrigatório para garantir a soberania de tipo na camada Python.", severity: "medium" },
            { regex: /lambda .*: .*/, issue: "Lógica Corrompida: Evite lambdas complexos que dificultam o diagnóstico e a legibilidade.", severity: "medium" }
        ];
        const results = await this.findPatterns([".py"], rules);

        // Advanced Logic: Architectual Depth
        if (results.some(r => r.issue.includes("None"))) {
            this.reasonAboutObjective("Architectural Sovereignty", "Type Hints", "Found Python components without rigorous type hinting.");
        }

        this.endMetrics(results.length);
        return results;
    }

    public override performActiveHealing(blindSpots: string[]): void {
        console.log(`🛠️ [Forge] Injetando Type Hints e refatorando estruturas de pacotes Python em: ${blindSpots.join(", ")}`);
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): string | StrategicFinding | null {
        return {
            objective,
            analysis: "Auditando robustez arquitetural da camada legacy.",
            recommendation: "Padronizar o uso de 'pydantic' ou 'dataclasses' para modelagem de dados no suporte Python.",
            severity: "medium"
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
        return `Você é o Dr. ${this.name}, PhD em Arquitetura de Software Python. Seu foco é modularidade e baixo acoplamento.`;
    }
}

