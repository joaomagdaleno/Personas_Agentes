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
     * 🩺 Formata a tabela de sinais vitais.
     */
    formatVitalsTable(healthData: any, infraLabel: string, infraStatus: string): string {
        const blindCount = (healthData.dark_matter || []).length;
        const brittleCount = (healthData.brittle_points || []).length;

        let blindImpact = "Seguro";
        if (blindCount > 0 && blindCount < 10) blindImpact = "Alerta";
        else if (blindCount >= 10) blindImpact = "CRÍTICO";

        const brittleImpact = brittleCount === 0 ? "Seguro" : "Risco de Colapso";

        return [
            "| Métrica | Status | Impacto |",
            "| :--- | :--- | :--- |",
            `| **Pontos Cegos** | ${blindCount} Arquivos | ${blindImpact} |`,
            `| **Fragilidades** | ${brittleCount} Pontos | ${brittleImpact} |`,
            `| ${infraLabel} | ${infraStatus} | Nível de Maturidade |`,
            "",
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
    formatEntropyMap(mapData: Record<string, any>, limit: number = 10): string {
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
            e => `| \`${e.file}\` | ${e.complexity} | ${e.instability.toFixed(2)} |`
        );

        return [
            "| Alvo | Complexidade | Instabilidade |",
            "| :--- | :---: | :---: |",
            ...rows,
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
