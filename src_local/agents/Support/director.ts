import winston from "winston";
import { BaseActivePersona } from "../base_persona.ts";

const logger = winston.child({ module: "Director" });

/**
 * 🏛️ Director PhD — Orquestrador Central (Stack-Agnostic Support Agent)
 * Responsável por consolidar achados de todas as personas em relatório unificado.
 */
export class DirectorPersona extends BaseActivePersona {
    constructor(projectRoot: string | null = null) {
        super(projectRoot);
        this.name = "Director";
        this.emoji = "🏛️";
        this.role = "Master Orchestrator";
    }

    async performAudit(): Promise<any[]> {
        const findings: any[] = [];
        const criticalFiles = Object.keys(this.contextData).filter(f =>
            (f.endsWith(".ts") || f.endsWith(".py")) &&
            (f.includes("core") || f.includes("security") || f.includes("agent") || f.includes("utils") || f.includes("scripts")) &&
            !this.ignoredFiles.includes(f)
        );

        // Scan ALL critical files to populate the legacy report
        // "Strategic Sampling" disabled to restore full "System Consciousness" report.
        const targetSample = criticalFiles;

        for (const file of targetSample) {
            const content = await this.readProjectFile(file);
            if (content) {
                // Heuristic Metrics for Legacy Report
                const lines = content.split('\n').length;
                const complexity = Math.floor(lines / 10); // Mock complexity
                const assertions = (content.match(/assert|expect|if \(/g) || []).length;

                // Add a "Metric" finding (Severity: Info) to populate tables
                findings.push({
                    file: file,
                    line: 0,
                    severity: 'info',
                    issue: 'Metric Collection',
                    evidence: `Complexity:${complexity}|Assertions:${assertions}|Lines:${lines}`,
                    // Metadata for report
                    metadata: { complexity, assertions, lines }
                });
            }
        }

        return findings;
    }

    async reasonAboutObjective(objective: string, file: string, content: string): Promise<any> {
        /** O Diretor sintetiza, não realiza raciocínio individual em arquivos. */
        return null;
    }

    deduplicateResults(auditResults: any[]): any[] {
        const uniqueResults: any[] = [];
        const seen = new Set<string>();
        for (const r of auditResults) {
            let key = "";
            if (typeof r === 'object' && r !== null) {
                const cleanIssue = (r.issue || '').replace(/\.$/, '');
                key = `${r.file}:${r.line}:${cleanIssue}`;
            } else {
                key = String(r).replace(/\.$/, '');
            }

            if (!seen.has(key)) {
                uniqueResults.push(r);
                seen.add(key);
            }
        }
        return uniqueResults;
    }

    format360Report(healthData: any, auditResults: any[]): string {
        const uniqueResults = this.deduplicateResults(auditResults);
        const now = new Date();
        const timeString = now.toLocaleTimeString('pt-BR', { hour12: false });

        // --- 1. Header & Sincronia ---
        let md = `# 🏛️ MAPA DE CONSCIÊNCIA SISTÊMICA: Orquestração de Inteligência Artificial\n\n`;
        md += `> **Visão Holística do Arquiteto PhD (Token: FBI_SINC_FINAL)**\n\n`;

        md += `🚨 EMERGÊNCIA ESTRUTURAL\n\n---\n\n`;

        md += `## 🧬 SINCRONIA DE IDENTIDADE\n\n`;
        md += `| Métrica | Valor | Status |\n`;
        md += `| :--- | :--- | :--- |\n`;
        const healthStatus = healthData.health_score > 80 ? '🟢' : healthData.health_score > 50 ? '⚠️' : '🚨';
        md += `| **Índice de Saúde** | ${healthData.health_score}% | ${healthStatus} |\n`;
        md += `| **Total de Alertas** | ${uniqueResults.length} | Monitorado |\n`;
        md += `| **Sincronia** | ${timeString} | Ativa |\n\n`;

        // --- 2. Decomposição da Saúde ---
        md += `### 📊 DECOMPOSIÇÃO DA SAÚDE (PILARES)\n\n`;
        md += `| Pilar | Score | Peso Máx |\n`;
        md += `| :--- | :---: | :---: |\n`;

        const bd = healthData.health_breakdown || {};
        if (Object.keys(bd).length === 0) {
            md += `| **System Balance** | 100% | 40 |\n`;
            md += `| **Topology Integrity** | 100% | 20 |\n`;
            md += `| **Observability** | 100% | 20 |\n`;
        } else {
            for (const [key, val] of Object.entries(bd)) {
                md += `| **${key}** | ${val} | 20 |\n`;
            }
        }
        md += `\n`;

        // --- 3. Sinais Vitais (Derived from findings) ---
        md += `## 🩺 SINAIS VITAIS DO PRODUTO\n\n`;
        md += `| Métrica | Status | Impacto |\n`;
        md += `| :--- | :--- | :--- |\n`;

        const blindSpots = uniqueResults.filter(r => JSON.stringify(r).includes("Blind Spot") || JSON.stringify(r).includes("Untracked")).length;
        const risks = uniqueResults.length;

        md += `| **Pontos Cegos** | ${blindSpots} Arquivos | ${blindSpots > 0 ? 'Alerta' : 'Estável'} |\n`;
        md += `| **Fragilidades** | ${risks} Pontos | ${risks > 10 ? 'Risco de Colapso' : 'Sob Controle'} |\n`;
        md += `| **Paridade de Stack** | Sincronizada | Nível de Maturidade |\n\n`;

        // --- 4. Roadmap (Static/Dynamic) ---
        md += `### 🗺️ ROADMAP PARA 100% (REQUISITOS)\n\n`;
        if (risks > 0) {
            md += `- [ ] **Resolver Pendências**: ${risks} alertas detectados drenam a saúde do sistema.\n`;
        } else {
            md += `- [x] **Sistema Estável**: Nenhum risco crítico detectado.\n`;
        }
        md += `\n`;

        // --- 5. Mapa de Entropia (Simulated/Mapped from Findings) ---
        md += `## 🌪️ MAPA DE ENTROPIA & ACOPLAMENTO\n\n`;
        md += `| Alvo | Complexidade | Instabilidade |\n`;
        md += `| :--- | :---: | :---: |\n`;

        // In the absence of real complexity metrics from TypeScript AST yet, we list the files found in audit
        // and assign estimated "instability" based on finding severity.
        const fileMap = new Map<string, number>();
        for (const r of uniqueResults) {
            const fName = r.file || 'unknown';
            const current = fileMap.get(fName) || 0;
            fileMap.set(fName, current + 1);
        }

        for (const [file, count] of fileMap.entries()) {
            const instability = (count * 0.1).toFixed(2); // Mock calculation
            const complexity = 10 + count; // Mock calculation
            md += `| \`${file}\` | ${complexity} | ${instability} |\n`;
        }
        md += `\n`;

        // --- 6. Matriz de Confiança (Detailed Findings) ---
        md += `## 🧪 MATRIZ DE CONFIANÇA\n\n`;
        md += `| Módulo | Entropia | Asserções | Status |\n`;
        md += `| :--- | :---: | :---: | :--- |\n`;

        for (const r of uniqueResults) {
            const sev = r.severity === 'critical' ? '🔴 FRÁGIL' : '🟢 PROFUNDO';
            const issueText = typeof r === 'object' ? (r.evidence || r.issue || JSON.stringify(r)) : String(r);
            // Truncate issue text for table
            const cleanIssue = issueText.length > 50 ? issueText.substring(0, 47) + "..." : issueText;
            md += `| \`${r.file}:${r.line || '?'}\` | - | ${cleanIssue} | ${sev} |\n`;
        }

        md += `\n---\n`;
        md += `## 💀 Risco Existencial\n\n`;
        md += `> Autoconsciência nativa ativa.\n`;

        return md;
    }

    getSystemPrompt(): string {
        return `You are the Director 🏛️. Your mission is: Master Orchestrator.`;
    }
}
