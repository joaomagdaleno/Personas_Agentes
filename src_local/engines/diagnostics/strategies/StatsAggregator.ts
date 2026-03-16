/**
 * 📊 StatsAggregator — Helper for QualityAnalyst metric aggregation.
 */
export class StatsAggregator {
    static aggregate(acc: any, m: any) {
        const adv = m.advanced_metrics || {};
        acc.complexity += (m.complexity || 0);
        acc.cc += (adv.cyclomaticComplexity || 0);
        acc.cog += (adv.cognitiveComplexity || 0);
        acc.mi += (adv.maintainabilityIndex || 0);
        acc.risk[adv.riskLevel]++;
        acc.gate[adv.qualityGate]++;
        acc.status[m.test_status]++;
        if (adv.isShadow) (adv.shadowCompliance?.compliant ? acc.shadow.compliant++ : acc.shadow.non_compliant++);
        return acc;
    }

    static getEmptyStats() {
        return {
            complexity: 0, cc: 0, cog: 0, mi: 0,
            risk: { LOW: 0, MODERATE: 0, HIGH: 0, CRITICAL: 0 },
            gate: { GREEN: 0, YELLOW: 0, RED: 0 },
            status: { DEEP: 0, SHALLOW: 0, STRUCTURAL: 0, UNTESTED: 0 },
            shadow: { compliant: 0, non_compliant: 0 }
        };
    }
}
