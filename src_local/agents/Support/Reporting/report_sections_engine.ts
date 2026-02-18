/**
 * SISTEMA DE PERSONAS AGENTES - SUPORTE TÉCNICO
 * Módulo: Motor de Seções de Relatório (ReportSectionsEngine)
 * Função: Renderizar seções MD densas (Roadmap, Vitais, Entropia).
 * Soberania: REPORT-ENGINE.
 */
import winston from "winston";

const logger = winston.child({ module: "ReportSectionsEngine" });

/**
 * 📄 ReportSectionsEngine — Gerador de seções dinâmicas do relatório.
 *
 * Renderiza seções Markdown específicas baseadas em dados de saúde,
 * garantindo formatação consistente e densidade informacional.
 */
export class ReportSectionsEngine {
    /**
     * 📊 Gera uma barra de progresso em Unicode.
     */
    protected _generateProgressBar(percent: number, length: number = 10): string {
        const rounded = Math.round(percent);
        const full = Math.round((rounded / 100) * length);
        const empty = Math.max(0, length - full);
        return `\`${"█".repeat(full)}${"░".repeat(empty)} ${rounded}%\``;
    }


    /**
     * 🏷️ Gera um badge de status.
     */
    protected _getStatusBadge(status: string): string {
        const s = status.toUpperCase();
        if (s.includes("CRÍTICO") || s.includes("COLLAPSE") || s.includes("ERRO")) return "🔴 `CRÍTICO`";
        if (s.includes("ALERTA") || s.includes("ATENÇÃO") || s.includes("RISCO")) return "🟡 `ATENÇÃO`";
        if (s.includes("SUCESSO") || s.includes("ESTÁVEL") || s.includes("OK")) return "🟢 `ESTÁVEL`";
        return "🔵 `NEUTRO`";
    }


    /**
     * 🩺 Formata a tabela de sinais vitais.
     */
    formatVitalsTable(healthData: any, infraLabel: string, infraStatus: string): string {
        const blindCount = (healthData.dark_matter || []).length;
        const brittleCount = (healthData.brittle_points || []).length;

        let blindImpact = "🟢 `SEGURO`";
        if (blindCount > 0 && blindCount < 10) blindImpact = "🟡 `ALERTA`";
        else if (blindCount >= 10) blindImpact = "🔴 `CRÍTICO`";

        const brittleImpact = brittleCount === 0 ? "🟢 `ESTÁVEL`" : "🔴 `RISCO`";

        return [
            "> | Métrica | Valor | Status |",
            "> | :--- | :--- | :--- |",
            `> | Pontos Cegos | ${blindCount} Arq. | ${blindImpact} |`,
            `> | Fragilidades | ${brittleCount} Pts. | ${brittleImpact} |`,
            `> | ${infraLabel} | ${infraStatus} | ⚙️ \`SISTEMA\` |`,
            "",
        ].join("\n");
    }

    /**
     * 🧩 Formata o Painel de Paridade Atômica.
     */
    formatParityBoard(stats: any): string {
        const s = stats || { total_atoms: 0, shallow: 0, deep: 0, gaps: 0, evolution: 0 };
        const purityRate = s.total_atoms > 0 ? Math.round((s.deep / s.total_atoms) * 100) : 0;

        return [
            "### 🧩 PARIDADE ATÔMICA (DENSIDADE REAL)",
            "",
            "| Dimensão | Qtd. | Densidade | Status |",
            "| :--- | :---: | :---: | :--- |",
            `| 💎 **Deep Parity** | \`${s.deep}\` | \`${purityRate}%\` | 🟢 \`ATÔMICO\` |`,
            `| 🚧 **Shallow** | \`${s.shallow}\` | \`${s.total_atoms > 0 ? Math.round((s.shallow / s.total_atoms) * 100) : 0}%\` | 🟡 \`ADAPTADO\` |`,
            `| 🧨 **Gaps** | \`${s.gaps}\` | \`${s.total_atoms > 0 ? Math.round((s.gaps / s.total_atoms) * 100) : 0}%\` | ${s.gaps > 0 ? "🔴 `CRÍTICO`" : "🟢 `ZERO`"} |`,
            `| 🚀 **Evolution** | \`${s.evolution}\` | N/A | 🔵 \`POSITIVO\` |`,
            "",
            `> **Sincronia Nativa:** \`${s.native_sync || 0}%\` | **Personas Ativas:** \`${s.total_atoms}\` | **Soberania:** \`100%\``,
            ""
        ].join("\n");
    }

    /**
     * 🗺️ Formata o roadmap para 100% de saúde.
     */
    formatRoadmap(healthData: any): string {
        const breakdown = healthData.health_breakdown || {};
        const points: string[] = [];

        this._addPurityPoints(breakdown, points);
        this._addStabilityPoints(breakdown, healthData, points);
        this._addObsPoints(breakdown, points);
        this._addExcellencePoints(breakdown, points);

        if (points.length === 0) {
            return "> 💎 **Sistema em estado de soberania técnica.** Requisitos de 100% atingidos.\n";
        }

        return "### 🗺️ ROADMAP PARA 100% (REQUISITOS)\n\n" + points.join("\n") + "\n";
    }

    /**
     * 🌪️ Formata o mapa de entropia (top N).
     */
    formatEntropyMap(mapData: Record<string, any>, limit: number = 200): string {
        const entries: Array<{ file: string; complexity: number; instability: number }> = [];

        for (const [f, info] of Object.entries(mapData)) {
            const file = f.toLowerCase().replace(/\\/g, "/");
            if (file.includes("/.agent/") || file.startsWith(".agent/")) continue;
            if (file.includes("legacy_restore") || file.endsWith("__init__.py")) continue;

            entries.push({
                file: f,
                complexity: (info as any).complexity || 1,
                instability: (info as any).coupling?.instability || 0,
            });
        }

        entries.sort((a, b) => b.complexity - a.complexity);

        const rows = entries.slice(0, limit).map(
            e => {
                const basename = e.file.split(/[\\/]/).pop() || e.file;
                return `> | \`${basename}\` | \`${e.complexity}\` | \`${Math.round(e.instability * 100)}%\` |`;
            }
        );

        return [
            "> | Componente | Complex. | Instabilidade (Prob.) |",
            "> | :--- | :---: | :--- |",
            ...rows,
            "",
        ].join("\n");
    }


    /**
     * 🧪 Diagnóstico Integrado (Pilares + Qualidade)
     * Une os 5 pilares com as penalidades técnicas para uma narrativa de causa-raiz.
     */
    formatIntegratedDiagnosis(breakdown: any): string {
        const pillars = [
            { name: "Stability", val: breakdown["Stability (Coverage)"] || 0, max: 40, desc: "Cobertura de Testes" },
            { name: "Purity", val: breakdown["Purity (Complexity)"] || 0, max: 20, desc: "Complexidade Média" },
            { name: "Observability", val: breakdown["Observability (Telemetry)"] || 0, max: 15, desc: "Telemetria" },
            { name: "Security", val: breakdown["Security (Vulnerabilities)"] || 0, max: 15, desc: "Vulnerabilidades" },
            { name: "Excellence", val: breakdown["Excellence (Documentation)"] || 0, max: 10, desc: "Documentação" },
        ];

        const lines = [
            "### 🩺 DIAGNÓSTICO DE SAÚDE (PILARES E QUALIDADE)",
            "",
            "| Pilar de Sustentação | Score | Máx | Status | Impacto Técnico |",
            "| :--- | :---: | :---: | :--- | :--- |",
        ];

        for (const p of pillars) {
            const status = this._getStatusBadge(p.val > (p.max * 0.7) ? "OK" : "ALERTA");
            lines.push(`| ${p.name} | \`${Math.round(p.val)}\` | ${p.max} | ${status} | ${p.desc} |`);
        }

        lines.push("");
        lines.push("#### 📐 Detalhamento de Métricas de Qualidade");
        lines.push("");
        lines.push(...this.formatQualityMetrics(breakdown));

        return lines.join("\n");
    }

    /**
     * 🔍 Análise de Visibilidade e Integridade Sistêmica
     * Une Sinais Vitais com Paridade Atômica.
     */
    formatVisibilityAnalysis(healthData: any): string {
        const blindCount = (healthData.dark_matter || []).length;
        const brittleCount = (healthData.brittle_points || []).length;
        const stats = healthData.parity_stats || { total_atoms: 0, shallow: 0, deep: 0, gaps: 0 };
        const purityRate = stats.total_atoms > 0 ? Math.round((stats.deep / stats.total_atoms) * 100) : 0;

        return [
            "### 🔍 VISIBILIDADE E INTEGRIDADE SISTÊMICA",
            "",
            "> Análise cruzada entre Cobertura de Testes (Realidade) e a Paridade Atômica (Consistência).",
            "",
            "| Dimensão de Integridade | Valor | Status | Contexto de Realidade |",
            "| :--- | :--- | :--- | :--- |",
            `| 🧨 **Gaps de Paridade** | \`${stats.gaps}\` | ${stats.gaps > 0 ? "🔴 `CRÍTICO`" : "🟢 `ZERO`"} | ${stats.total_atoms > 0 ? Math.round((stats.gaps / stats.total_atoms) * 100) : 0}% de desalinhamento |`,
            `| 🌫️ **Pontos Cegos** | \`${blindCount}\` | ${blindCount > 10 ? "🔴 `ALERTA`" : "🟢 `SEGURO`"} | Ativos sem qualquer monitoramento |`,
            `| 💎 **Deep Parity** | \`${stats.deep}\` | 🟢 \`ATÔMICO\` | \`${purityRate}%\` de fidelidade sistêmica |`,
            `| 🚧 **Shallow Parity** | \`${stats.shallow}\` | 🟡 \`ADAPTADO\` | Componentes com lógica parcial |`,
            `| 🧊 **Fragilidades** | \`${brittleCount}\` | ${brittleCount > 0 ? "🔴 `RISCO`" : "🟢 `ESTÁVEL`"} | Pontos de ruptura identificados |`,
            "",
            `**Sincronia Nativa:** \`${stats.native_sync || 0}%\` | **Personas Ativas:** \`${stats.total_atoms}\` | **Audit Score:** \`${Math.round(healthData.health_score)}%\``,
            "",
        ].join("\n");
    }

    /**
     * ⚖️ Formata a seção de Governança PhD.
     */
    formatGovernanceSection(healthData: any): string {
        const level = healthData.compliance_level || "SOVEREIGN";
        const directives = healthData.directives || ["Manter paridade absoluta", "Zero débito técnico"];

        const breakdown = healthData.breakdown || {};

        return [
            this.formatIntegratedDiagnosis(breakdown),
            "",
            "### ⚖️ DIRETRIZES DE GOVERNANÇA PHD",
            "",
            `| Ativo | Nível de Compliance | Status de Veto |`,
            `| :--- | :--- | :--- |`,
            `| \`SISTEMA-ALFA\` | 💎 \`${level}\` | ✅ \`LIBERADO\` |`,
            "",
            "**Diretrizes Ativas:**",
            ...directives.map((d: string) => `- ${d}`),
            "",
        ].join("\n");
    }

    /**
     * 📊 Formata as métricas de qualidade (9+) — Normalizadas v2.0
     */
    formatQualityMetrics(breakdown: any): string[] {
        const lines: string[] = [];

        // Penalidades normalizadas (proporcionais com caps)
        const ccPenalty = breakdown["Quality (CC > 20 - High Risk)"] || 0;
        const cognitivePenalty = breakdown["Quality (Cognitive > 15)"] || 0;
        const nestingPenalty = breakdown["Quality (Nesting > 3)"] || 0;
        const cboPenalty = breakdown["Quality (CBO > 10 - High Coupling)"] || 0;
        const ditPenalty = breakdown["Quality (DIT > 5 - Deep Inheritance)"] || 0;
        const miLowPenalty = breakdown["Quality (MI < 10 - Low Maint)"] || 0;
        const miCritPenalty = breakdown["Quality (MI < 5 - Critical)"] || 0;
        const defectPenalty = breakdown["Quality (Defect Density > 1/KLOC)"] || 0;
        const gateRedPenalty = breakdown["Quality (Gate RED)"] || 0;
        const shadowPenalty = breakdown["Quality (Shadow Non-Compliant)"] || 0;

        // Contagens brutas (passadas pelo PenaltyEngine)
        const ccCount = breakdown["_raw_ccCount"] || 0;
        const cogCount = breakdown["_raw_cognitiveCount"] || 0;
        const nestCount = breakdown["_raw_nestingCount"] || 0;
        const cboCount = breakdown["_raw_cboCount"] || 0;
        const ditCount = breakdown["_raw_ditCount"] || 0;
        const miLowCount = breakdown["_raw_miLowCount"] || 0;
        const miCritCount = breakdown["_raw_miCriticalCount"] || 0;
        const defectCount = breakdown["_raw_defectCount"] || 0;
        const gateRedCount = breakdown["_raw_gateRedCount"] || 0;
        const shadowCount = breakdown["_raw_shadowCount"] || 0;
        const totalAnalyzed = breakdown["_raw_totalAnalyzed"] || 0;

        const totalQualityPenalty = Math.round((ccPenalty + cognitivePenalty + nestingPenalty + cboPenalty +
            ditPenalty + miLowPenalty + miCritPenalty + defectPenalty +
            gateRedPenalty + shadowPenalty) * 10) / 10;

        if (totalQualityPenalty > 0 || totalAnalyzed > 0) {
            lines.push("### 📐 Métricas de Qualidade (NIST/SONARQUBE)");
            lines.push("");
            lines.push("| Métrica | Limite | Violações | Penalidade |");
            lines.push("| :--- | :--- | :---: | ---: |");
            lines.push(`| Complexidade Ciclomática (CC > 20) | > 20 | ${ccCount}/${totalAnalyzed} | ${ccPenalty} pts |`);
            lines.push(`| Complexidade Cognitiva (> 15) | > 15 | ${cogCount}/${totalAnalyzed} | ${cognitivePenalty} pts |`);
            lines.push(`| Aninhamento Profundo (> 3) | > 3 | ${nestCount}/${totalAnalyzed} | ${nestingPenalty} pts |`);
            lines.push(`| Alto Acoplamento (CBO > 10) | > 10 | ${cboCount}/${totalAnalyzed} | ${cboPenalty} pts |`);
            lines.push(`| Herança Profunda (DIT > 5) | > 5 | ${ditCount}/${totalAnalyzed} | ${ditPenalty} pts |`);
            lines.push(`| Baixa Manutenibilidade (MI < 10) | < 10 | ${miLowCount}/${totalAnalyzed} | ${miLowPenalty} pts |`);
            lines.push(`| Manutenibilidade Crítica (MI < 5) | < 5 | ${miCritCount}/${totalAnalyzed} | ${miCritPenalty} pts |`);
            lines.push(`| Quality Gate RED | - | ${gateRedCount}/${totalAnalyzed} | ${gateRedPenalty} pts |`);
            lines.push(`| Shadow Non-Compliant | - | ${shadowCount}/${totalAnalyzed} | ${shadowPenalty} pts |`);
            lines.push("");
            lines.push(`> **Penalidade Total de Qualidade:** \`${totalQualityPenalty} pts\` (cap: 30) | Base: NIST, SonarQube, Microsoft`);
            lines.push("");
        }

        return lines;
    }

    /**
     * 🗺️ Formata a topologia de sincronia (Neural Bridge).
     */
    formatTopologyMap(healthData: any): string {
        const topology = healthData.topology || { branch: "main", tracking: "origin/main", isHealthy: true };
        const status = topology.isHealthy ? "🟢 `SYNC-OK`" : "🔴 `SYNC-ERROR`";

        return [
            "| Segmento | Identificador | Bridge Status |",
            "| :--- | :--- | :--- |",
            `| **Active Branch** | \`${topology.branch}\` | ${status} |`,
            `| **Upstream** | \`${topology.tracking}\` | 🔗 \`CONECTADO\` |`,
            `| **Phased Sync** | \`LUCID-DREAMING\` | ⚡ \`ACTIVE\` |`,
            "",
        ].join("\n");
    }

    private _addPurityPoints(b: any, points: string[]): void {
        const drain = 20 - (b["Purity (Complexity)"] || 20);
        if (drain > 0.05) {
            points.push(`- [ ] **Reduzir Complexidade**: Média atual drena ${Math.round(drain * 10) / 10} pts. Simplificar módulos > 15.`);
        }
    }

    private _addStabilityPoints(b: any, data: any, points: string[]): void {
        const drain = 40 - (b["Stability (Coverage)"] || 40);
        if (drain > 0.05) {
            const pointsList = []; // Fixed scoping issue if any
            const blinds = (data.dark_matter || []).length;
            const brittle = (data.brittle_points || []).filter((f: string) => !(data.dark_matter || []).includes(f)).length;
            points.push(`- [ ] **Expandir Cobertura**: ${blinds} ativos sem teste e ${brittle} ativos frágeis drenam ${Math.round(drain * 10) / 10} pts.`);
        }
    }

    private _addObsPoints(b: any, points: string[]): void {
        if ((b["Observability (Telemetry)"] || 15) < 15) {
            points.push("- [ ] **Injetar Telemetria**: Universalizar `log_performance` em utilitários e scripts.");
        }
    }

    private _addExcellencePoints(b: any, points: string[]): void {
        if ((b["Excellence (Documentation)"] || 10) < 10) {
            points.push("- [ ] **Resolver Pendências de Excelência**: Diretrizes estratégicas ou módulos sem propósito detectados.");
        }
    }
}
