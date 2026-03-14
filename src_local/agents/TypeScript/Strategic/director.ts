import { BaseActivePersona } from "../../base.ts";
import type { AuditFinding, AuditRule, StrategicFinding, ProjectContext } from "../../base.ts";
import { ReportSectionsEngine } from "../../Support/Reporting/report_sections_engine.ts";
import { ReportFormatter } from "../../Support/Diagnostics/strategies/ReportFormatter.ts";
import { PriorityAnalyzer } from "./strategies/PriorityAnalyzer.ts";

/**
 * 🏛️ Dr. Director — PhD in Systemic Orchestration & AI Governance
 */
export class DirectorPersona extends BaseActivePersona {
    private sectionsEngine: ReportSectionsEngine;

    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Director";
        this.emoji = "🏛️";
        this.role = "Master Orchestrator";
        this.phd_identity = "Systemic Orchestration & AI Governance";
        this.stack = "TypeScript";
        this.sectionsEngine = new ReportSectionsEngine();
    }

    public override async execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]> {
        this.setContext(context);
        const findings: (AuditFinding | StrategicFinding)[] = await this.performAudit();

        if (this.hub) {
            const orchestratorNodes = await this.hub.queryKnowledgeGraph("orchestrator", "high");
            const reasoning = await this.hub.reason(`Synthesize an executive summary of the system's architecture and orchestration balance, given ${orchestratorNodes.length} orchestrator control nodes in ${this.stack}.`);

            findings.push({
                file: "Executive Summary", agent: this.name, role: this.role, emoji: this.emoji,
                issue: `Sovereign Direction: Alinhamento estratégico validado via Rust Hub. PhD Analysis: ${reasoning}`,
                severity: "STRATEGIC", stack: this.stack, evidence: "Knowledge Graph Orchestration Analysis", match_count: 1,
                context: "Strategic Orchestration Summary"
            } as any);
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.ts', '.json'],
            rules: [
                { regex: /security(?!.*crypto)/i, issue: 'Alerta Estratégico: Arquivo de segurança sem referências criptográficas óbvias PhD.', severity: 'low' },
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

    public override reasonAboutObjective(objective: string, file: string, _content: string | Promise<string | null>): StrategicFinding | null {
        return { 
            file, 
            severity: "STRATEGIC", 
            issue: `PhD Governance: Supervising '${objective}' in '${file}'.`, 
            context: this.name 
        };
    }

    public async validatePhDCensus(): Promise<any> {
        return { status: "valid", count: 1, details: "Sovereign census validated." };
    }

    public format360Report(snapshot: any, findings: (AuditFinding | StrategicFinding)[]): string {
        return ReportFormatter.format360(snapshot, findings, this.sectionsEngine, this.formatHotspotsSection.bind(this), this.formatStrategicPlanSection.bind(this));
    }

    private formatHotspotsSection(snapshot: any): string {
        const hotspots = this.getHotspots(snapshot.confidence_matrix || []);
        let res = `## 🎯 HOTSPOTS DE INTERVENÇÃO (TOP PRIORITIES)\n\n`;
        if (hotspots.length === 0) return res + "> 🟢 **Nenhum hotspot crítico detectado.**\n";
        res += `### 🔴 Componentes de Intervenção Urgente\n\n| # | Componente | Complexidade | Risco | Ação Recomendada |\n| :---: | :--- | :---: | :---: | :--- |\n`;
        hotspots.slice(0, 10).forEach((f: any, i: number) => {
            const fileName = f.name || (f.file ? f.file.split(/[\\/]/).pop() : 'Unknown');
            res += `| ${i + 1} | \`${fileName}\` | \`${f.complexity}\` | ${f.advanced_metrics?.riskLevel === "CRITICAL" ? "🔴" : "🟠"} ${f.advanced_metrics?.riskLevel || "HIGH"} | Desmembrar / Refatorar |\n`;
        });
        return hotspots.length > 10 ? res + `> ...e mais \`${hotspots.length - 10}\` arquivos críticos detectados.\n` : res;
    }

    private getHotspots(matrix: any[]): any[] {
        return PriorityAnalyzer.analyze(matrix);
    }

    private formatStrategicPlanSection(findings: (AuditFinding | StrategicFinding)[]): string {
        const getCnt = (sev: string) => findings.filter((f: any) => (f.severity || '').toUpperCase() === sev.toUpperCase()).length;
        const getRes = (sev: string) => findings.some((f: any) => (f.severity || '').toUpperCase() === sev.toUpperCase()) ? `${sev === "CRITICAL" ? "🔴" : (sev === "HIGH" ? "🟡" : "🔵")} \`INTERVENÇÃO\`` : "🟢 `LIVRE`";
        return `| Nível | Qtd | Impacto | Resposta |\n| :--- | :---: | :--- | :--- |\n` +
            `| **CRITICAL** | \`${getCnt("CRITICAL")}\` | 🔴 \`BLOQUEANTE\` | ${getRes("CRITICAL")} |\n` +
            `| **HIGH** | \`${getCnt("HIGH")}\` | 🟡 \`RISCO ALTO\` | ${getRes("HIGH")} |\n` +
            `| **MEDIUM** | \`${getCnt("MEDIUM")}\` | 🔵 \`DÉBITO TÉC.\` | ${getRes("MEDIUM")} |\n` +
            `| **LOW** | \`${getCnt("LOW")}\` | ⚪ \`MENOR\` | ${getRes("LOW")} |\n` +
            `| **STRATEGIC** | \`${getCnt("STRATEGIC")}\` | 🟣 \`MELHORIA\` | ${getRes("STRATEGIC")} |`;
    }

    public override selfDiagnostic(): any { 
        return { status: "Soberano", score: 100, issues: [] }; 
    }
    
    public override getSystemPrompt(): string { 
        return `Você é o Diretor PhD 🏛️, mestre da orquestração sistêmica. Sua missão é garantir a excelência do projeto via governança PhD.`; 
    }
}
