import { VetoReason } from "./policy_definitions.ts";

/**
 * Static lookup structures pre-allocated outside hot loops for O(1) checks
 * and zero per-call allocation overhead.
 */
const IGNORED_SET = new Set([
    '.git', '__pycache__', 'build', 'node_modules', '.venv',
    '.agent', '.gemini', 'submodules', 'dist', 'target', 'bin'
]);

const LEGACY_EXTENSIONS = ['.pyc', '.o', '.exe', '.dll', '.class'];

const MONEY_TERMS = [
    'price', 'amount', 'balance', 'cost', 'total', 'euro',
    'usd', 'brl', 'payment', 'transaction', 'wallet', 'currency'
];

/** Pre-compiled word-boundary regex for technical math terms (case-insensitive) */
const TECH_TERMS_REGEX = new RegExp("\\b(" + [
    'alpha', 'progress', 'offset', 'dp', 'sp', 'radius', 'velocity',
    'phase', 'amplitude', 'frequency', 'duration', 'x', 'y', 'width', 'height',
    'sigma', 'delta', 'theta', 'gamma', 'epsilon', 'lambda', 'mu', 'nu',
    'integral', 'derivative', 'matrix', 'tensor', 'scalar', 'vector'
].join("|") + ")\\b", "i");

const RULE_KEYWORDS = [
    "rules =", "patterns =", "audit_rules =", "regex =",
    "silent_pattern =", "brittle_pattern =", "heuristic =",
    "veto_criteria =", "security_policy =", "compliance_check =",
    "validation_logic =", "rule_registry ="
];

/**
 * 🚫 Veto Engine (Sovereign).
 * Decides what gets blocked based on infrastructure, legacy, or security rules.
 */
export class VetoEngine {
    /**
     * Optimized shouldVeto method using O(1) Set lookup for infrastructure directory matching
     * and static array iteration for extension checks.
     */
    public shouldVeto(relPath: string): { veto: boolean; reason?: VetoReason; justification?: string } {
        const parts = relPath.split(/[/\\]/);

        // O(1) Set lookup per path segment avoids inner array allocation and linear scans
        for (let i = 0; i < parts.length; i++) {
            if (IGNORED_SET.has(parts[i])) {
                return { veto: true, reason: VetoReason.INFRASTRUCTURE, justification: "Caminho de infraestrutura ignorado." };
            }
        }

        // Fast static extension checks without creating temporary array closures
        for (let i = 0; i < LEGACY_EXTENSIONS.length; i++) {
            if (relPath.endsWith(LEGACY_EXTENSIONS[i])) {
                return { veto: true, reason: VetoReason.LEGACY_ARTIFACT, justification: "Binário ou cache legado detectado." };
            }
        }

        if (relPath.includes("/secrets/") || relPath.includes("/internal/keys/")) {
            return { veto: true, reason: VetoReason.SECURITY_RISK, justification: "Acesso a subdiretório de segredos protegido." };
        }

        return { veto: false };
    }

    /**
     * Optimized isTechnicalMath using early exit loop for financial terms and a single pre-compiled
     * word-boundary regular expression instead of dynamically allocating RegExps on every call.
     */
    public isTechnicalMath(lineContent: string, issue: string): boolean {
        if (!issue.includes("Imprecisão Monetária")) return false;

        const lower = lineContent.toLowerCase();

        // Fast short-circuit if any money term is present
        for (let i = 0; i < MONEY_TERMS.length; i++) {
            if (lower.includes(MONEY_TERMS[i])) {
                return false;
            }
        }

        // Single pre-compiled regex evaluation replacing 28 dynamic RegExp instantiations
        return TECH_TERMS_REGEX.test(lower);
    }

    /**
     * Optimized isRuleDefinition using simple index loop for early return on first keyword hit.
     */
    public isRuleDefinition(lineContent: string): boolean {
        const lower = lineContent.toLowerCase();
        for (let i = 0; i < RULE_KEYWORDS.length; i++) {
            if (lower.includes(RULE_KEYWORDS[i])) {
                return true;
            }
        }
        return false;
    }
}
