import { type MetricsResult } from "../metrics_engine";

export class ThresholdEvaluator {
    static evaluate(metrics: MetricsResult): string[] {
        const issues: string[] = [], isS = metrics.isShadow, lim = { cc: isS ? 15 : 50, cog: isS ? 10 : 30, mi: isS ? 20 : 10, nest: isS ? 3 : 5, cbo: isS ? 2 : 10 };
        if (metrics.cyclomaticComplexity > lim.cc) issues.push(`CC ${metrics.cyclomaticComplexity} > ${lim.cc}`);
        if (metrics.cognitiveComplexity > lim.cog) issues.push(`Cognitive ${metrics.cognitiveComplexity} > ${lim.cog}`);
        if (metrics.maintainabilityIndex < lim.mi) issues.push(`MI ${metrics.maintainabilityIndex.toFixed(1)} < ${lim.mi}`);
        if (metrics.nestingDepth > lim.nest) issues.push(`Nesting ${metrics.nestingDepth} > ${lim.nest}`);
        if (metrics.cbo > lim.cbo) issues.push(`CBO ${metrics.cbo} > ${lim.cbo}`);
        if (metrics.qualityGate !== "GREEN") issues.push(`Quality Gate: ${metrics.qualityGate}`);
        return issues;
    }
}
