import winston from "winston";

const logger = winston.child({ module: "ScoringMetricsEngine" });

/**
 * ⚙️ ScoringMetricsEngine — PhD in Health Metrics & Stability Calculus
 * Motor auxiliar para cálculo de métricas (Redução de Entropia).
 */
export class ScoringMetricsEngine {
    calcStability(mapData: Record<string, any>): [number, number, number] {
        const coreTypes = ["AGENT", "CORE", "LOGIC", "UTIL"];
        const relevant = Object.entries(mapData).filter(([f, i]) =>
            coreTypes.includes(i.component_type) ||
            (i.complexity > 1 && !["DOC", "INTERFACE", "TEST"].includes(i.component_type))
        ).map(([f, i]) => i);

        const packageMarkers = Object.entries(mapData).filter(([f, i]) =>
            ["PACKAGE_MARKER", "CONFIG"].includes(i.component_type) && i.complexity <= 1
        ).map(([f, i]) => i);

        const covered = relevant.filter(i => i.has_test);

        // Stability = (Testados + Marcadores) / (Exigidos + Marcadores)
        const score = ((covered.length + packageMarkers.length) / Math.max(1, relevant.length + packageMarkers.length)) * 40;
        return [score, covered.length + packageMarkers.length, relevant.length + packageMarkers.length];
    }

    calcPurity(mapData: Record<string, any>, total: number): [number, number] {
        const avg = Object.values(mapData).reduce((sum, i) => sum + (i.complexity || 1), 0) / total;
        const score = Math.max(0, 20 - (Math.max(0, avg - 5) * 1.5));
        return [score, avg];
    }

    calcObservability(mapData: Record<string, any>): [number, number, number] {
        const excluded = ["TEST", "PACKAGE_MARKER", "CONFIG"];
        const relevant = Object.entries(mapData).filter(([f, i]) =>
            !excluded.includes(i.component_type) || i.complexity > 1
        ).map(([f, i]) => i);

        const tel = relevant.filter(i => i.telemetry || JSON.stringify(i).includes("telemetry"));
        const score = (tel.length / Math.max(1, relevant.length)) * 15;
        return [score, tel.length, relevant.length];
    }

    calcSecurity(alerts: any[]): [number, number] {
        const high = alerts.filter(r => typeof r === 'object' && ["critical", "high"].includes(r.severity));
        return [Math.max(0, 15 - (high.length * 5)), high.length];
    }

    calcExcellence(mapData: Record<string, any>, total: number): [number, number] {
        const kdoc = Object.entries(mapData).filter(([f, i]) =>
            i.purpose !== "UNKNOWN" || ["PACKAGE_MARKER", "CONFIG"].includes(i.component_type)
        ).length;
        const score = (kdoc / Math.max(1, total)) * 10;
        return [score, kdoc];
    }

    /**
     * Identifica Pontos Cegos (Dark Matter) e Fragilidades.
     */
    getVitals(mapData: Record<string, any>): { dark_matter: string[], brittle_points: string[] } {
        const coreTypes = ["AGENT", "CORE", "LOGIC", "UTIL"];
        const dark_matter: string[] = [];
        const brittle_points: string[] = [];

        for (const [file, info] of Object.entries(mapData)) {
            const isRelevant = coreTypes.includes(info.component_type) || 
                               (info.complexity > 1 && !["DOC", "INTERFACE", "TEST"].includes(info.component_type));
            
            if (isRelevant && !info.has_test) {
                dark_matter.push(file);
                if (info.complexity > 10) {
                    brittle_points.push(file);
                }
            }
        }

        return { dark_matter, brittle_points };
    }
}
