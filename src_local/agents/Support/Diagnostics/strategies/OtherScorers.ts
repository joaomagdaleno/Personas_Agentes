/**
 * 📡 ObservabilityScorer — specialized in telemetry monitoring.
 */
export class ObservabilityScorer {
    static calculate(mapData: Record<string, any>): [number, number, number] {
        const excluded = ["TEST", "PACKAGE_MARKER", "CONFIG"];
        const relevant = Object.entries(mapData).filter(([f, i]) =>
            !excluded.includes(i.component_type) || i.complexity > 1
        ).map(([f, i]) => i);

        const tel = relevant.filter(i => {
            return i.telemetry ||
                i.has_telemetry ||
                i.advanced_metrics?.telemetry ||
                JSON.stringify(i).includes("logger") ||
                JSON.stringify(i).includes("telemetry");
        });
        const score = (tel.length / Math.max(1, relevant.length)) * 15;
        return [score, tel.length, relevant.length];
    }
}

/**
 * 🔒 SecurityScorer — specialized in vulnerability assessment.
 */
export class SecurityScorer {
    static calculate(alerts: any[]): [number, number] {
        const high = alerts.filter(r => typeof r === 'object' && ["critical", "high"].includes(r.severity));
        return [Math.max(0, 15 - (high.length * 5)), high.length];
    }
}

/**
 * 🏅 ExcellenceScorer — specialized in documentation and standards.
 */
export class ExcellenceScorer {
    static calculate(mapData: Record<string, any>, total: number): [number, number] {
        const kdoc = Object.entries(mapData).filter(([f, i]) =>
            i.purpose !== "UNKNOWN" || ["PACKAGE_MARKER", "CONFIG"].includes(i.component_type)
        ).length;
        const score = (kdoc / Math.max(1, total)) * 10;
        return [score, kdoc];
    }
}
