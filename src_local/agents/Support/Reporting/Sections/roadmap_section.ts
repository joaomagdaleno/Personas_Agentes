import winston from "winston";

const logger = winston.child({ module: "RoadmapSection" });

/**
 * 🗺️ RoadmapSection — Specialist in roadmap generation.
 */
export class RoadmapSection {
    render(healthData: any): string {
        const start = Date.now();
        const breakdown = healthData.health_breakdown || {};
        const points: string[] = [];

        this._addPurityPoints(breakdown, points);
        this._addStabilityPoints(breakdown, healthData, points);
        this._addObsPoints(breakdown, points);
        this._addExcellencePoints(breakdown, points);

        let result: string;
        if (points.length === 0) {
            result = "> 💎 **Sistema em estado de soberania técnica.** Requisitos de 100% atingidos.\n";
        } else {
            result = "### 🗺️ ROADMAP PARA 100% (REQUISITOS)\n\n" + points.join("\n") + "\n";
        }

        logger.debug(`Roadmap section rendered in ${Date.now() - start}ms`);
        return result;
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
