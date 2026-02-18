import { VetoReason } from "./policy_definitions.ts";

/**
 * 🚫 Veto Engine (Sovereign).
 * Decides what gets blocked based on infrastructure, legacy, or security rules.
 */
export class VetoEngine {
    public shouldVeto(relPath: string): { veto: boolean; reason?: VetoReason; justification?: string } {
        const ignored = ['.git', '__pycache__', 'build', 'node_modules', '.venv', '.agent', '.gemini', 'submodules', 'dist', 'target', 'bin'];
        const parts = relPath.split(/[/\\]/);

        if (parts.some(part => ignored.includes(part))) {
            return { veto: true, reason: VetoReason.INFRASTRUCTURE, justification: "Caminho de infraestrutura ignorado." };
        }

        if (relPath.endsWith(".pyc") || relPath.endsWith(".o") || relPath.endsWith(".exe") || relPath.endsWith(".dll") || relPath.endsWith(".class")) {
            return { veto: true, reason: VetoReason.LEGACY_ARTIFACT, justification: "Binário ou cache legado detectado." };
        }

        if (relPath.includes("/secrets/") || relPath.includes("/internal/keys/")) {
            return { veto: true, reason: VetoReason.SECURITY_RISK, justification: "Acesso a subdiretório de segredos protegido." };
        }

        return { veto: false };
    }

    public isTechnicalMath(lineContent: string, issue: string): boolean {
        if (!issue.includes("Imprecisão Monetária")) return false;

        const techTerms = [
            'alpha', 'progress', 'offset', 'dp', 'sp', 'radius', 'velocity',
            'phase', 'amplitude', 'frequency', 'duration', 'x', 'y', 'width', 'height',
            'sigma', 'delta', 'theta', 'gamma', 'epsilon', 'lambda', 'mu', 'nu',
            'integral', 'derivative', 'matrix', 'tensor', 'scalar', 'vector'
        ];
        const lower = lineContent.toLowerCase();

        const moneyTerms = ['price', 'amount', 'balance', 'cost', 'total', 'euro', 'usd', 'brl', 'payment', 'transaction', 'wallet', 'currency'];
        if (moneyTerms.some(f => lower.includes(f))) {
            return false;
        }

        return techTerms.some(t => new RegExp(`\\b${t}\\b`).test(lower));
    }

    public isRuleDefinition(lineContent: string): boolean {
        const lower = lineContent.toLowerCase();
        const keywords = [
            "rules =", "patterns =", "audit_rules =", "regex =",
            "silent_pattern =", "brittle_pattern =", "heuristic =",
            "veto_criteria =", "security_policy =", "compliance_check =",
            "validation_logic =", "rule_registry ="
        ];
        return keywords.some(kw => lower.includes(kw));
    }
}
