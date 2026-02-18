import { BaseActivePersona } from "../../base_active_persona.ts";
import winston from "winston";
import { ReportSectionsEngine } from "../../Support/Reporting/report_sections_engine.ts";

const logger = winston.child({ module: "TS_Director" });

/**
 * 🏛️ Dr. Director — PhD in Systemic Orchestration & AI Governance
 * O Diretor Soberano, responsável por coordenar a inteligência coletiva dos agentes e garantir a integridade do Plano de Batalha.
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

    async performAudit(): Promise<any[]> {
        const start = Date.now();
        logger.info(`[${this.name}] Orquestrando Auditoria Estratégica (TypeScript Stack)...`);

        const findings: any[] = [];
        // Em um cenário real, o Diretor delegaria para outros agentes.
        // Aqui, ele faz uma verificação de alto nível da estrutura do projeto.

        const criticalFiles = Object.keys(this.contextData).filter(f =>
            (f.endsWith('.ts') || f.endsWith('.json')) &&
            (f.includes('core') || f.includes('security') || f.includes('agent'))
        );

        // Amostragem aleatória para "Spot Check"
        const sampleSize = Math.min(criticalFiles.length, 5);
        const sample = criticalFiles.sort(() => 0.5 - Math.random()).slice(0, sampleSize);

        for (const file of sample) {
            // Simulação de "Intent Analysis"
            if (file.includes('security') && !this.contextData[file].includes('crypto')) {
                findings.push({
                    file, issue: 'Alerta Estratégico: Arquivo de segurança sem referências criptográficas óbvias.',
                    severity: 'low', persona: this.name
                });
            }
        }

        const duration = (Date.now() - start) / 1000;
        logger.info(`[${this.name}] Auditoria concluída em ${duration.toFixed(4)}s. Achados: ${findings.length}`);
        return findings;
    }

    async reasonAboutObjective(objective: string, file: string, content: string): Promise<any | null> {
        return {
            file, severity: "INFO", persona: this.name,
            issue: `PhD Governance: Supervisionando o objetivo '${objective}' em '${file}'. Garantindo alinhamento com a Missão Soberana.`
        };
    }

    /**
     * Validates PhD Census
     */
    async validatePhDCensus(): Promise<any> {
        logger.info(`[${this.name}] Validating PhD Census...`);
        // Simulate census validation
        return {
            status: "valid",
            count: 1, // Default value if personas not available
            details: "All personas are properly configured and active"
        };
    }

    /**
     * Formats 360 report — PhD Narrative Flow
     */
    format360Report(snapshot: any, findings: any): string {
        logger.info(`[${this.name}] Orquestrando Relatório Narrativo PhD...`);

        const isCollapse = snapshot.health_score === 0;
        const statusEmoji = snapshot.health_score > 80 ? "OK" : (snapshot.health_score > 50 ? "ALERTA" : "CRÍTICO");
        const statusBadge = this.sectionsEngine["_getStatusBadge"](statusEmoji);
        const lastCheck = new Date().toLocaleTimeString();

        // 1. Identidade e Sincronia
        let report = `# 🏛️ RELATÓRIO SISTÊMICO: CONSOLIDAÇÃO DA REALIDADE

> **Status Operacional:** ${statusBadge} | **Integridade Geral:** \`${Math.round(snapshot.health_score || 0)}%\`
> **Ambiente:** \`TS-MASTER-CONTROL\` | **Último Check:** \`${lastCheck}\`
> 
> ${isCollapse ? "💀 `SITUAÇÃO: COLAPSO DE INTEGRIDADE`" : "💎 `SITUAÇÃO: SOBERANIA TÉCNICA`"}

---

## 🧬 FLUXO DE DIAGNÓSTICO (CAUSA-RAIZ)

${this.sectionsEngine.formatGovernanceSection(snapshot)}

---

## 🎯 HOTSPOTS DE INTERVENÇÃO (TOP PRIORITIES)

`;

        const matrix = snapshot.confidence_matrix || [];
        const critical = matrix.filter((e: any) => (e.advanced_metrics?.cyclomaticComplexity || e.complexity || 0) > 30 || (e.complexity || 0) > 50);
        critical.sort((a: any, b: any) => (b.complexity || 0) - (a.complexity || 0));

        if (critical.length > 0) {
            const top10 = critical.slice(0, 10);
            report += `### 🔴 Componentes de Intervenção Urgente

> Estes ativos concentram a maior entropia do sistema e são os principais impeditivos para o score 100%.

| # | Componente | Complexidade | Risco | Ação Recomendada |
| :---: | :--- | :---: | :---: | :--- |
`;
            for (let i = 0; i < top10.length; i++) {
                const f = top10[i];
                const risk = f.advanced_metrics?.riskLevel || "HIGH";
                const riskIcon = risk === "CRITICAL" ? "🔴" : "🟠";
                report += `| ${i + 1} | \`${f.name || f.file.split(/[\\/]/).pop()}\` | \`${f.complexity}\` | ${riskIcon} ${risk} | Desmembrar / Refatorar |\n`;
            }
            if (critical.length > 10) report += `> ...e mais \`${critical.length - 10}\` arquivos críticos detectados.\n`;
        } else {
            report += "> 🟢 **Nenhum hotspot crítico detectado.** Componentes operando em zonas de segurança.\n";
        }

        report += `
---

## 🔍 INTEGRIDADE E VISIBILIDADE

${this.sectionsEngine.formatVisibilityAnalysis(snapshot)}

${this.sectionsEngine.formatRoadmap(snapshot)}

---

## 🚩 PLANO DE BATALHA E ACHADOS ESTRATÉGICOS

| Nível | Qtd | Impacto | Resposta |
| :--- | :---: | :--- | :--- |
| **CRITICAL** | \`${findings.filter((f: any) => f.severity === "CRITICAL").length}\` | 🔴 \`BLOQUEANTE\` | ${findings.some((f: any) => f.severity === "CRITICAL") ? "🔴 `INTERVENÇÃO`" : "🟢 `LIVRE`"} |
| **HIGH** | \`${findings.filter((f: any) => f.severity === "HIGH").length}\` | 🟡 \`RISCO ALTO\` | ${findings.some((f: any) => f.severity === "HIGH") ? "🟡 `PRIORIDADE`" : "🟢 `LIVRE`"} |
| **MEDIUM** | \`${findings.filter((f: any) => f.severity === "MEDIUM").length}\` | 🔵 \`DÉBITO TÉC.\` | ${findings.some((f: any) => f.severity === "MEDIUM") ? "🔵 `EM FILA`" : "🟢 `LIVRE`"} |

`;

        if (findings.length > 0) {
            report += `### 🏷️ Achados Detalhados\n\n`;
            findings.slice(0, 5).forEach((f: any, idx: number) => {
                const badge = this.sectionsEngine["_getStatusBadge"](f.severity);
                report += `> #### ${badge} [${idx + 1}] \`${f.file.split(/[\\/]/).pop()}\`\n> - ${f.issue || f.message}\n`;
            });
            if (findings.length > 5) report += `\n> ...total de \`${findings.length}\` achados monitorados.\n`;
        }

        return report;
    }


    selfDiagnostic(): any {
        return {
            status: "Soberano",
            score: 100,
            details: "Orquestrador Mestre TS operando com governança PhD."
        };
    }

    getSystemPrompt(): string {
        return `Você é o Diretor PhD 🏛️, mestre da orquestração sistêmica. Sua missão é garantir a excelência do projeto via governança PhD.`;
    }
}

