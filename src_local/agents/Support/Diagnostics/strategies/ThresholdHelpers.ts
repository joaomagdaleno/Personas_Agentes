/**
 * 📊 ThresholdHelpers - PhD in Scalar Boundaries
 */
export class ThresholdHelpers {
    static checkStructural(m: any, stats: any) {
        if (m.cyclomaticComplexity > 20) stats.cc++;
        if (m.cognitiveComplexity > 15) stats.cog++;
        if (m.nestingDepth > 3) stats.nest++;
        if (m.cbo > 10) stats.cbo++;
        if (m.dit > 5) stats.dit++;
    }
}
