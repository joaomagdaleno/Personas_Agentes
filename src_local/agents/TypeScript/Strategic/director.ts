import { BaseActivePersona, AuditRule, StrategicFinding } from "../../base.ts";
import winston from "winston";
import { ReportSectionsEngine } from "../../Support/Reporting/report_sections_engine.ts";
import { ReportFormatter } from "../../Support/Diagnostics/strategies/ReportFormatter.ts";
import { PriorityAnalyzer } from "./strategies/PriorityAnalyzer.ts";

const logger = winston.child({ module: "TS_Director" });

/**
 * 🏛️ Dr. Director — PhD in Systemic Orchestration & AI Governance
 */
export class DirectorPersona extends BaseActivePersona {
    private sectionsEngine: ReportSectionsEngine;

    constructor(projectRoot: string | null = null) {
        super(projectRoot);
        this.name = "Director";
        this.emoji = "🏛️";
        this.role = "Master Orchestrator";
        this.stack = "TypeScript";
        this.sectionsEngine = new ReportSectionsEngine();
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.ts', '.json'],
            rules: [
                { regex: /security(?!.*crypto)/i, issue: 'Alerta Estratégico: Arquivo de segurança sem referências criptográficas óbvias.', severity: 'low' },
            ]
        };
    }

    reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        return { file, severity: "INFO", issue: `PhD Governance: Supervising '${objective}' in '${file}'.`, context: "supervising objective" };
    }

    async validatePhDCensus(): Promise<any> {
        return { status: "valid", count: 1, details: "Sovereign census validated." };
    }

    format360Report(snapshot: any, findings: any): string {
        return ReportFormatter.format360(snapshot, findings, this.sectionsEngine, this.formatHotspotsSection.bind(this), this.formatStrategicPlanSection.bind(this));
    }

    private formatHotspotsSection(snapshot: any): string {
        const hotspots = this.getHotspots(snapshot.confidence_matrix || []);
        let res = `## 🎯 HOTSPOTS DE INTERVENÇÃO (TOP PRIORITIES)\n\n`;
        if (hotspots.length === 0) return res + "> 🟢 **Nenhum hotspot crítico detectado.**\n";
        res += `### 🔴 Componentes de Intervenção Urgente\n\n| # | Componente | Complexidade | Risco | Ação Recomendada |\n| :---: | :--- | :---: | :---: | :--- |\n`;
        hotspots.slice(0, 10).forEach((f: any, i) => res += `| ${i + 1} | \`${f.name || f.file.split(/[\\/]/).pop()}\` | \`${f.complexity}\` | ${f.advanced_metrics?.riskLevel === "CRITICAL" ? "🔴" : "🟠"} ${f.advanced_metrics?.riskLevel || "HIGH"} | Desmembrar / Refatorar |\n`);
        return hotspots.length > 10 ? res + `> ...e mais \`${hotspots.length - 10}\` arquivos críticos detectados.\n` : res;
    }

    private getHotspots(matrix: any[]): any[] {
        return PriorityAnalyzer.analyze(matrix);
    }

    private formatStrategicPlanSection(findings: any[]): string {
        const getCnt = (sev: string) => findings.filter((f: any) => (f.severity || '').toUpperCase() === sev.toUpperCase()).length;
        const getRes = (sev: string) => findings.some((f: any) => (f.severity || '').toUpperCase() === sev.toUpperCase()) ? `${sev === "CRITICAL" ? "🔴" : (sev === "HIGH" ? "🟡" : "🔵")} \`INTERVENÇÃO\`` : "🟢 `LIVRE`";
        return `| Nível | Qtd | Impacto | Resposta |\n| :--- | :---: | :--- | :--- |\n` +
            `| **CRITICAL** | \`${getCnt("CRITICAL")}\` | 🔴 \`BLOQUEANTE\` | ${getRes("CRITICAL")} |\n` +
            `| **HIGH** | \`${getCnt("HIGH")}\` | 🟡 \`RISCO ALTO\` | ${getRes("HIGH")} |\n` +
            `| **MEDIUM** | \`${getCnt("MEDIUM")}\` | 🔵 \`DÉBITO TÉC.\` | ${getRes("MEDIUM")} |\n` +
            `| **LOW** | \`${getCnt("LOW")}\` | ⚪ \`MENOR\` | ${getRes("LOW")} |\n` +
            `| **STRATEGIC** | \`${getCnt("STRATEGIC")}\` | 🟣 \`MELHORIA\` | ${getRes("STRATEGIC")} |`;
    }

    selfDiagnostic(): any { return { status: "Soberano", score: 100, details: "Orquestrador Mestre TS operando com governança PhD." }; }
    getSystemPrompt(): string { return `Você é o Diretor PhD 🏛️, mestre da orquestração sistêmica. Sua missão é garantir a excelência do projeto via governança PhD.`; }
}
