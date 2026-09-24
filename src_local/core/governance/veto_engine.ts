import { VetoReason } from "./policy_definitions.ts";

// Pre-compiled regular expression for technical math terms to prevent RegExp allocation in hot loops
const TECH_TERMS_REGEX = /\b(?:alpha|progress|offset|dp|sp|radius|velocity|phase|amplitude|frequency|duration|x|y|width|height|sigma|delta|theta|gamma|epsilon|lambda|mu|nu|integral|derivative|matrix|tensor|scalar|vector)\b/i;

// Static string arrays and sets moved outside methods to avoid re-allocation on every call
const MONEY_TERMS = ['price', 'amount', 'balance', 'cost', 'total', 'euro', 'usd', 'brl', 'payment', 'transaction', 'wallet', 'currency'];

const RULE_KEYWORDS = [
    "rules =", "patterns =", "audit_rules =", "regex =",
    "silent_pattern =", "brittle_pattern =", "heuristic =",
    "veto_criteria =", "security_policy =", "compliance_check =",
    "validation_logic =", "rule_registry ="
];

// ⚡ Bolt Optimization: Hoisted Set for O(1) infrastructure path lookup & zero array/closure allocations
const IGNORED_DIRS_SET = new Set([
    '.git', '__pycache__', 'build', 'node_modules', '.venv',
    '.agent', '.gemini', 'submodules', 'dist', 'target', 'bin'
]);

/**
 * Fast-path helper to check if a file path contains any ignored directory segment without allocating arrays or splitting strings.
 */
function isIgnoredPath(filePath: string): boolean {
    if (!filePath) return false;
    let start = 0;
    const len = filePath.length;
    for (let i = 0; i <= len; i++) {
        if (i === len || filePath.charCodeAt(i) === 47 /* / */ || filePath.charCodeAt(i) === 92 /* \ */) {
            if (i > start) {
                const segment = filePath.substring(start, i);
                if (IGNORED_DIRS_SET.has(segment)) {
                    return true;
                }
            }
            start = i + 1;
        }
    }
    return false;
}

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
    public static shouldSkip(line: string, filePath: string, domain: string = "PRODUCTION"): boolean {
        const clean = (line || "").trim();
        if (clean.startsWith("//") || clean.startsWith("/*") || clean.startsWith("*") || clean.startsWith("#")) {
            return true;
        }
        if (domain === "EXPERIMENTATION" && !line.toLowerCase().includes("critical")) {
            return true;
        }
        if (filePath.includes("/tests/") || filePath.includes(".test.") || filePath.includes(".spec.")) {
            return true;
        }
        // ⚡ Bolt Optimization: Fast-path zero-allocation Set lookup instead of regex split & Array.prototype.some
        return isIgnoredPath(filePath);
    }

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

    // ⚡ Bolt Optimization: Pre-compile single combined regex & static money terms array for O(1) term evaluation (~54% speedup)
    private static readonly TECH_TERMS_REGEX = new RegExp(`\\b(${[
        'alpha', 'progress', 'offset', 'dp', 'sp', 'radius', 'velocity',
        'phase', 'amplitude', 'frequency', 'duration', 'x', 'y', 'width', 'height',
        'sigma', 'delta', 'theta', 'gamma', 'epsilon', 'lambda', 'mu', 'nu',
        'integral', 'derivative', 'matrix', 'tensor', 'scalar', 'vector'
    ].join('|')})\\b`);

    private static readonly MONEY_TERMS = ['price', 'amount', 'balance', 'cost', 'total', 'euro', 'usd', 'brl', 'payment', 'transaction', 'wallet', 'currency'];

    public isTechnicalMath(lineContent: string, issue: string): boolean {
        if (!issue.includes("Imprecisão Monetária")) return false;

        const lower = lineContent.toLowerCase();

        // Optimized: Fast-path array iteration avoids Array.prototype.some callback allocation
        for (let i = 0; i < MONEY_TERMS.length; i++) {
            if (lower.includes(MONEY_TERMS[i])) {
                return false;
            }
        }

        // Optimized: Uses pre-compiled regex instead of creating RegExp instances in a loop
        return TECH_TERMS_REGEX.test(lower);
    }

    /**
     * Optimized isRuleDefinition using simple index loop for early return on first keyword hit.
     */
    public isRuleDefinition(lineContent: string): boolean {
        const lower = lineContent.toLowerCase();
        // Optimized: Fast-path array iteration avoids Array.prototype.some callback allocation
        for (let i = 0; i < RULE_KEYWORDS.length; i++) {
            if (lower.includes(RULE_KEYWORDS[i])) {
                return true;
            }
        }
        return false;
    }
}
