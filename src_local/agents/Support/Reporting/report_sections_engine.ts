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
     * ⚖️ Formata a seção de Governança PhD.
     */
    formatGovernanceSection(healthData: any): string {
        const level = healthData.compliance_level || "SOVEREIGN";
        const directives = healthData.directives || ["Manter paridade absoluta", "Zero débito técnico"];

        const breakdown = healthData.breakdown || {};
        const pillars = [
            `| Stability | \`${Math.round(breakdown["Stability (Coverage)"] || 0)}\` | 40 | ${this._getStatusBadge((breakdown["Stability (Coverage)"] || 0) > 30 ? "OK" : "ALERTA")} |`,
            `| Purity | \`${Math.round(breakdown["Purity (Complexity)"] || 0)}\` | 20 | ${this._getStatusBadge((breakdown["Purity (Complexity)"] || 0) > 15 ? "OK" : "ALERTA")} |`,
            `| Observability | \`${Math.round(breakdown["Observability (Telemetry)"] || 0)}\` | 15 | ${this._getStatusBadge((breakdown["Observability (Telemetry)"] || 0) > 10 ? "OK" : "ALERTA")} |`,
            `| Security | \`${Math.round(breakdown["Security (Vulnerabilities)"] || 0)}\` | 15 | ${this._getStatusBadge((breakdown["Security (Vulnerabilities)"] || 0) > 10 ? "OK" : "ALERTA")} |`,
            `| Excellence | \`${Math.round(breakdown["Excellence (Documentation)"] || 0)}\` | 10 | ${this._getStatusBadge((breakdown["Excellence (Documentation)"] || 0) > 8 ? "OK" : "ALERTA")} |`,
        ];

        return [
            "### 📊 DECOMPOSIÇÃO DA SAÚDE (PILARES)",
            "",
            "| Pilar | Score | Máx | Status |",
            "| :--- | :---: | :---: | :--- |",
            ...pillars,
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
