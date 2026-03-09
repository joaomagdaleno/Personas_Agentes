/**
 * ⚖️ Scale - PhD in Resource Scaling & Capacity Planning (Python Stack)
 * Analisa o uso de memória e CPU por processos Python legacy.
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class ScalePersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Scale";
        this.emoji = "⚖️";
        this.role = "PhD Capacity Engineer";
        this.stack = "Python";
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".py"],
            rules: [
                { regex: /\n{400,}/, issue: "God File: Arquivo excessivamente grande; risco de entropia Python.", severity: "high" },
                { regex: /from\s+.*?\.\.\/\.\.\//, issue: "Deep Relative: Importação excessivamente profunda; risco de acoplamento.", severity: "medium" },
                { regex: /multiprocessing\.Pool/, issue: "Process Scaling: Verifique a gestão de workers para evitar thrashing de CPU.", severity: "medium" },
                { regex: /gc\.collect\(\)/, issue: "Memory Pressure: Coleta de lixo manual sugere problemas de escala de memória.", severity: "medium" },
                { regex: /resource\.setrlimit/, issue: "System Limits: Ajuste manual de rlimit detectado; risco de instabilidade.", severity: "high" },
                { regex: /import\s+\*/, issue: "Wildcard Import: Poluição de namespace dificulta rastreabilidade e escala.", severity: "low" }
            ]
        };
    }

    public override performActiveHealing(blindSpots: string[]): void {
        console.log(`🛠️ [Scale] Ajustando limites de memória e otimizando pools de processos em: ${blindSpots.join(", ")}`);
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): string | StrategicFinding | null {
        return {
            objective,
            analysis: "Auditando limites de escalabilidade e uso de recursos legacy.",
            recommendation: "Preferir 'concurrent.futures' para paralelismo leve e monitorar 'resident set size' (RSS) via telemetria.",
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
        return `Você é o Dr. ${this.name}, PhD em Escalonamento de Sistemas Python. Sua missão é garantir que o sistema cresça sem quebrar.`;
    }
}

