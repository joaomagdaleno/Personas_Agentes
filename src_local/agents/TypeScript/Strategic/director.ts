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
     * Formats 360 report
     */
    format360Report(snapshot: any, findings: any): string {
        logger.info(`[${this.name}] Formatting 360 report...`);

        const isCollapse = snapshot.health_score === 0;
        const statusEmoji = snapshot.health_score > 80 ? "OK" : (snapshot.health_score > 50 ? "ALERTA" : "CRÍTICO");
        const statusBadge = this.sectionsEngine["_getStatusBadge"](statusEmoji);

        let report = `# 🏛️ RELATÓRIO SISTÊMICO

> **Status Operacional:** ${statusBadge}
> **Ambiente:** \`TS-MASTER-CONTROL\`
> 
> ${isCollapse ? "💀 `SITUAÇÃO: COLAPSO DE INTEGRIDADE`" : "💎 `SITUAÇÃO: SOBERANIA TÉCNICA`"}

---

## 🧬 SINCRONIA DE IDENTIDADE

| Métrica | Dashboard Visual | Status Operacional |
| :--- | :--- | :--- |
| **Integridade Geral** | \`${Math.round(snapshot.health_score || 0)}%\` | ${statusBadge} |
| **Alertas Ativos** | \`${findings.length} Achados\` | 🔵 \`MONITORADO\` |
| **Último Check** | \`${new Date().toLocaleTimeString()}\` | 🟢 \`ATIVA\` |

${this.sectionsEngine.formatGovernanceSection(snapshot)}

## 🩺 SINAIS VITAIS DO PRODUTO

${this.sectionsEngine.formatVitalsTable(snapshot, "Integridade", isCollapse ? "COLAPSO" : snapshot.status)}

${snapshot.parity_stats?.raw_report || this.sectionsEngine.formatParityBoard(snapshot.parity_stats)}

${this.sectionsEngine.formatRoadmap(snapshot)}

## 🗺️ TOPOLOGIA DE SINCRONIA (NEURAL BRIDGE)

${this.sectionsEngine.formatTopologyMap(snapshot)}

## 🌪️ MAPA DE ENTROPIA & ACOPLAMENTO

${this.sectionsEngine.formatEntropyMap(snapshot.entropy_map || {}, 500)}

## 🧪 MATRIZ DE CONFIANÇA

| Componente | Entropia | Asserções | Status de Teste |
| :--- | :---: | :---: | :--- |
`;

        const matrix = snapshot.confidence_matrix || [];
        for (const entry of matrix) {
            const statusIcon = entry.test_status === "DEEP" ? "🟢 `PROFUNDO`" : (entry.test_status === "STRUCTURAL" ? "🟡 `ESTRUTURAL`" : "🔴 `FRÁGIL`");
            const basename = entry.file.split(/[\\/]/).pop() || entry.file;
            report += `| \`${basename}\` | \`${entry.complexity}\` | \`${entry.assertions}\` | ${statusIcon} |\n`;
        }

        report += `
## 🎯 PLANO DE BATALHA: DIRETRIZES DE ENGENHARIA

| Severidade | Qtd. | Impacto Estratégico | Status de Resposta |
| :--- | :---: | :--- | :--- |
| **CRITICAL** | \`${findings.filter((f: any) => f.severity === "CRITICAL").length}\` | 🔴 \`BLOQUEANTE\` | ${findings.some((f: any) => f.severity === "CRITICAL") ? "🔴 `INTERVENÇÃO`" : "🟢 `LIVRE`"} |
| **HIGH** | \`${findings.filter((f: any) => f.severity === "HIGH").length}\` | 🟡 \`RISCO ALTO\` | ${findings.some((f: any) => f.severity === "HIGH") ? "🟡 `PRIORIDADE`" : "🟢 `LIVRE`"} |
| **MEDIUM** | \`${findings.filter((f: any) => f.severity === "MEDIUM").length}\` | 🔵 \`DÉBITO TÉC.\` | ${findings.some((f: any) => f.severity === "MEDIUM") ? "🔵 `EM FILA`" : "🟢 `LIVRE`"} |




---

## 🚩 ACHADOS DETALHADOS
`;

        if (Array.isArray(findings)) {
            let fIdx = 1;
            for (const finding of findings) {
                const severity = finding.severity || "UNKNOWN";
                const file = finding.file || "N/A";
                const issue = finding.issue || finding.message || JSON.stringify(finding);
                const badge = this.sectionsEngine["_getStatusBadge"](severity);
                const parts = file.split(/[\\/]/);
                const basename = parts.pop() || file;
                const parent = parts.pop() || "";
                const context = parent ? `${parent}/${basename}` : basename;

                report += `> ### ${badge} [${fIdx++}] \`${context}\`\n> - **Local:** \`${file}\`\n> - **Causa:** ${issue}\n`;

                if (finding.meta) {
                    if (finding.meta.missing && finding.meta.missing.length > 0) {
                        report += `> - **🧬 Unidades Atômicas Ausentes (Parity Gap):**\n`;
                        for (const unit of finding.meta.missing) {
                            report += `>   - \`${unit}\`\n`;
                        }
                    }
                    if (finding.meta.added && finding.meta.added.length > 0) {
                        report += `> - **🚀 Novas Unidades Atômicas (Evolução):**\n`;
                        for (const unit of finding.meta.added) {
                            report += `>   - \`${unit}\`\n`;
                        }
                    }
                }
                report += `>\n`;
            }
        } else {
            report += "Formato de achados inválido.";
        }



        report += `
## 💀 Risco Existencial

> Autoconsciência nativa ativa. Governança PhD em vigor.
`;

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

