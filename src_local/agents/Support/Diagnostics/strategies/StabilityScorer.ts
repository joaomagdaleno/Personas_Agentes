/**
 * 🛡️ StabilityScorer — specialized in reliability and coverage calculus.
 */
export class StabilityScorer {
    static calculate(mapData: Record<string, any>): [number, number, number] {
        const coreTypes = ["AGENT", "CORE", "LOGIC", "UTIL", "UNKNOWN"];
        const entries = Object.entries(mapData);

        const relevant = entries.filter(([f, i]) =>
            (coreTypes.includes(i.component_type) || i.complexity >= 1) &&
            !["DOC", "TEST"].includes(i.component_type) &&
            !f.includes("/test/") && !f.includes("__init__.py")
        );

        const markers = entries.filter(([f, i]) =>
            ["PACKAGE_MARKER", "CONFIG"].includes(i.component_type)
        );

        const totalRelevant = relevant.length + markers.length;

        let coveredCount = 0;
        for (const [f, i] of relevant) {
            const adv = i.advanced_metrics;
            const isMarker = ["PACKAGE_MARKER", "CONFIG"].includes(i.component_type);
            const greenGate = adv?.qualityGate === "GREEN";
            const yellowGate = adv?.qualityGate === "YELLOW";

            if (i.has_test || greenGate || isMarker) {
                coveredCount += 1;
            } else if (yellowGate) {
                coveredCount += 0.5; // Partial stability
            }
        }

        const finalCovered = Math.min(totalRelevant, coveredCount + markers.length);
        const score = (finalCovered / Math.max(1, totalRelevant)) * 40;

        return [score, Math.floor(finalCovered), totalRelevant];
    }

    static getVitals(mapData: Record<string, any>): { dark_matter: string[], brittle_points: string[] } {
        const dark_matter: string[] = [];
        const brittle_points: string[] = [];

        for (const [file, info] of Object.entries(mapData)) {
            const adv = info.advanced_metrics;
            const isCode = !["DOC", "TEST"].includes(info.component_type) && !file.includes("/test/");
            const isCovered = info.has_test || adv?.qualityGate === "GREEN";

            if (isCode && !isCovered) {
                dark_matter.push(file);
                if (info.complexity > 20) {
                    brittle_points.push(file);
                }
            }
        }
        return { dark_matter, brittle_points };
    }
}
