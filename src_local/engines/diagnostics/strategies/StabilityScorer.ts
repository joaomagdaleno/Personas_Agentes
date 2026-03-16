/**
 * 🛡️ StabilityScorer — specialized in reliability and coverage calculus.
 */
export class StabilityScorer {
    static calculate(mapData: Record<string, any>): [number, number, number] {
        const entries = Object.entries(mapData);
        const relevant = this.filterRelevant(entries);
        const markers = this.filterMarkers(entries);

        const total = relevant.length + markers.length;
        const covered = relevant.reduce((sum, [_, i]) => sum + this.getItemStability(i), 0);

        const finalCovered = Math.min(total, covered + markers.length);
        const score = (finalCovered / Math.max(1, total)) * 40;

        return [score, Math.floor(finalCovered), total];
    }

    private static filterRelevant(entries: [string, any][]) {
        const coreTypes = ["AGENT", "CORE", "LOGIC", "UTIL", "UNKNOWN"];
        return entries.filter(([f, i]) =>
            (coreTypes.includes(i.component_type) || i.complexity >= 1) &&
            !["DOC", "TEST"].includes(i.component_type) &&
            !f.includes("/test/") && !f.includes("__init__.py")
        );
    }

    private static filterMarkers(entries: [string, any][]) {
        return entries.filter(([_, i]) => ["PACKAGE_MARKER", "CONFIG"].includes(i.component_type));
    }

    private static getItemStability(i: any): number {
        const adv = i.advanced_metrics;
        if (i.has_test || adv?.qualityGate === "GREEN") return 1;
        return adv?.qualityGate === "YELLOW" ? 0.5 : 0;
    }

    static getVitals(mapData: Record<string, any>): { dark_matter: string[], brittle_points: string[] } {
        const dark_matter: string[] = [];
        const brittle_points: string[] = [];

        for (const [file, info] of Object.entries(mapData)) {
            this.processVitalsEntry(file, info, dark_matter, brittle_points);
        }
        return { dark_matter, brittle_points };
    }

    private static processVitalsEntry(file: string, info: any, dark: string[], brittle: string[]) {
        if (!this.isUncoveredCode(file, info)) return;

        dark.push(file);
        if (info.complexity > 20) {
            brittle.push(file);
        }
    }

    private static isUncoveredCode(file: string, info: any): boolean {
        const adv = info.advanced_metrics;
        const isCode = !["DOC", "TEST"].includes(info.component_type) && !file.includes("/test/");
        return isCode && !(info.has_test || adv?.qualityGate === "GREEN");
    }
}
