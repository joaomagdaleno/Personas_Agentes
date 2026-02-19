/**
 * 💎 PurityScorer — specialized in code elegance and complexity mapping.
 */
export class PurityScorer {
    static calculate(mapData: Record<string, any>, total: number): [number, number] {
        let totalCC = 0;
        let countWithAdvanced = 0;

        for (const [file, info] of Object.entries(mapData)) {
            const advanced = info.advanced_metrics;
            if (advanced?.cyclomaticComplexity) {
                totalCC += advanced.cyclomaticComplexity;
                countWithAdvanced++;
            }
        }

        let avg: number;
        if (countWithAdvanced > 0) {
            const avgCC = totalCC / countWithAdvanced;
            const simpleAvg = Object.values(mapData).reduce((sum, i) => sum + (i.complexity || 1), 0) / total;
            avg = (avgCC + simpleAvg) / 2;
        } else {
            avg = Object.values(mapData).reduce((sum, i) => sum + (i.complexity || 1), 0) / total;
        }

        // 🔬 PhD Calibration: Média <= 7.0 representa Excelência Técnica em escala.
        const score = Math.max(0, 20 - (Math.max(0, avg - 7.0) * 2));
        return [score, avg];
    }
}
