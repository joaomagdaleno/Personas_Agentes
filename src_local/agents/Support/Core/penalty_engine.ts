import winston from "winston";

const logger = winston.child({ module: "PenaltyEngine" });

/**
 * ⚖️ PenaltyEngine — PhD in Health Penalties & Ceiling Calculus
 * Motor de Penalidades e Tetos de Saúde PhD.
 */
export class PenaltyEngine {
    apply(raw: number, allAlerts: any[], mapData: Record<string, any>, total: number, qaData: any = null): number {
        const adjustments = this.getPilarAdjustments(allAlerts, mapData, qaData);
        const totalDrain = Object.values(adjustments).reduce((sum, v) => sum + v, 0);

        let ceiling = 100;
        const alerts = allAlerts.filter(r => typeof r === 'object' && r !== null);
        const sevs = new Set(alerts.map(r => r.severity));

        if (sevs.has('critical') || sevs.has('high')) {
            ceiling = 60;
        } else if (sevs.has('medium')) {
            ceiling = 85;
        } else if (totalDrain > 0) {
            ceiling = 99;
        }

        const final = Math.max(0, Math.round(Math.min(raw, ceiling) - totalDrain));
        logger.info(`🏆 [HealthCalculus] Raw: ${raw.toFixed(3)} | Ceiling: ${ceiling} | Drain: ${totalDrain} | Final: ${final}`);
        return final;
    }

    getPilarAdjustments(allAlerts: any[], mapData: Record<string, any>, qaData: any = null): Record<string, number> {
        const coreTypes = ["AGENT", "CORE", "LOGIC", "UTIL"];

        // 1. Purity Penalty (Complexity Peaks > 15)
        const peakCount = Object.entries(mapData).filter(([f, i]) =>
            i.complexity > 15 && !["DOC", "INTERFACE", "TEST"].includes(i.component_type)
        ).length;

        // 2. Stability Penalty (Missing Tests + Shallow Tests)
        let shallowCount = 0;
        if (qaData && Array.isArray(qaData.matrix)) {
            shallowCount = qaData.matrix.filter((m: any) => {
                const item = mapData[m.file] || {};
                return m.test_status === "SHALLOW" && (
                    coreTypes.includes(item.component_type) ||
                    (item.complexity > 1 && !["DOC", "INTERFACE", "TEST"].includes(item.component_type))
                );
            }).length;
        }

        // 3. Security Drain
        const alerts = allAlerts.filter(r => typeof r === 'object' && r !== null);
        const sevMap: Record<string, number> = { 'critical': 15, 'high': 15, 'medium': 5, 'low': 1 };
        const secDrain = alerts.reduce((sum, r) => sum + (sevMap[r.severity] || 0), 0);

        // 4. Strategic (Roadmap) points
        const stratCount = allAlerts.filter(r => typeof r === 'string').length;

        return {
            "Purity (Complexity)": peakCount * 2.0,
            "Stability (Coverage)": shallowCount * 5.0,
            "Security (Vulnerabilities)": secDrain,
            "Excellence (Documentation)": stratCount * 0.5
        };
    }
}
