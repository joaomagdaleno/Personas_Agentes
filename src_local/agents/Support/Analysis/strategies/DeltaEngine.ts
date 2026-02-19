import type { AtomicFingerprint, AgentDelta } from "../parity_types";

/**
 * 📐 DeltaEngine — specialized in implementation divergence analysis.
 */
export class DeltaEngine {
    static compute(legacy: AtomicFingerprint, current: AtomicFingerprint, agent: string): AgentDelta[] {
        const deltas: AgentDelta[] = [];
        if (legacy.name.toLowerCase() !== current.name.toLowerCase())
            deltas.push({ dimension: "name", legacy: legacy.name, current: current.name, severity: "CRITICAL", context: `Agent identity mismatch for ${agent}` });

        if (legacy.rulesCount !== current.rulesCount)
            deltas.push({ dimension: "rulesCount", legacy: String(legacy.rulesCount), current: String(current.rulesCount), severity: "MEDIUM", context: `Rule count divergence` });

        if (legacy.hasReasoning !== current.hasReasoning)
            deltas.push({ dimension: "reasoning", legacy: String(legacy.hasReasoning), current: String(current.hasReasoning), severity: "CRITICAL", context: "Strategy logic MISSING" });

        const legacyMethods = legacy.methods.filter(m => !m.startsWith("_"));
        const currentMethods = current.methods || [];

        for (const lm of legacyMethods) {
            const camelName = lm.replace(/_([a-z])/g, (_, p1: string) => p1.toUpperCase());
            const match = currentMethods.find(cm => cm === lm || cm === camelName || cm.toLowerCase() === lm.replace(/_/g, "").toLowerCase());

            if (!match) {
                deltas.push({
                    dimension: "Method",
                    legacy: lm,
                    current: "MISSING",
                    severity: "HIGH",
                    context: `Method '${lm}' from legacy not found in current implementation.`
                });
            }
        }
        return deltas;
    }

    static computeScore(deltas: AgentDelta[]): number {
        let score = 100;
        const penalties = { CRITICAL: 50, HIGH: 30, MEDIUM: 15, INFO: 2 };
        for (const d of deltas) {
            score -= penalties[d.severity as keyof typeof penalties] || 0;
        }
        return Math.max(0, score);
    }
}
