import { AtomicFingerprint, AgentDelta } from "./parity_types";

// ─── Fingerprint Extractors ───────────────────────────────────────────────

export function extractPythonFingerprint(content: string, name: string): AtomicFingerprint {
    const emojiMatch = content.match(/emoji\s*=\s*["'](.*?)["']/) || content.match(/self\.emoji\s*=\s*["'](.*?)["']/);
    const roleMatch = content.match(/role\s*=\s*["'](.*?)["']/) || content.match(/self\.role\s*=\s*["'](.*?)["']/);
    const stackMatch = content.match(/stack\s*=\s*["'](.*?)["']/) || content.match(/self\.stack\s*=\s*["'](.*?)["']/);

    const rulePatterns = content.match(/'regex':\s*r?"([^"]+)"/g)?.map(r => r.match(/"([^"]+)"/)?.[1] || "") || [];
    const ruleIssues = content.match(/'issue':\s*'([^']+)'/g)?.map(i => i.match(/'([^']+)'/)?.[1] || "") || [];

    const promptMatch = content.match(/def\s+get_system_prompt\(self\):\s*\n\s+return\s+f?"([^"]+)"/) ||
        content.match(/system_prompt\s*=\s*f?["']([\s\S]*?)["']\s*(?=def|class|$)/);

    const hasReasoning = content.includes("def _reason_about_objective") || content.includes("def reasoning") || content.includes("brain.reason");

    return {
        name,
        emoji: emojiMatch?.[1] || "?",
        role: roleMatch?.[1] || "?",
        stack: stackMatch?.[1] || "?",
        rulesCount: rulePatterns.length,
        rulePatterns,
        ruleIssues,
        ruleSeverities: [],
        fileExtensions: [],
        hasReasoning,
        reasoningTrigger: "",
        systemPrompt: promptMatch ? promptMatch[1]! : "",
        hasExtraMethods: content.includes("def validate_code_safety") ? ["validate_code_safety"] : [],
        methods: content.match(/^\s*def\s+(\w+)/gm)?.map(m => m.trim().replace("def ", "")) || []
    };
}

export function extractTSFingerprint(content: string, name: string): AtomicFingerprint | null {
    const emojiMatch = content.match(/emoji:\s*["'](.*?)["']/) || content.match(/this\.emoji\s*=\s*["'](.*?)["']/);
    const roleMatch = content.match(/role:\s*["']([\s\S]*?)["']/) || content.match(/this\.role\s*=\s*["'](.*?)["']/);
    const stackMatch = content.match(/stack:\s*["'](.*?)["']/) || content.match(/this\.stack\s*=\s*["'](.*?)["']/);

    const rules: string[] = [];
    const ruleRegex = /regex:\s*(?:\/([^\/]+)\/|["']([^"']+)["'])/g;
    let m: RegExpExecArray | null;
    while ((m = ruleRegex.exec(content)) !== null) {
        rules.push(m[1] || m[2] || "");
    }

    const promptMatch = content.match(/this\.systemPrompt\s*=\s*`([\s\S]*?)`/) ||
        content.match(/getSystemPrompt\(\)\s*:?\s*string\s*\{\s*return\s*`([\s\S]*?)`\s*\}/);

    const hasReasoning = (content.includes("reasonAboutObjective") || content.includes("protected reasoning(")) && !content.includes("return null");

    return {
        name,
        emoji: emojiMatch?.[1] || "?",
        role: roleMatch?.[1] || "?",
        stack: stackMatch?.[1] || "?",
        rulesCount: rules.length,
        rulePatterns: rules,
        ruleIssues: [],
        ruleSeverities: [],
        fileExtensions: [],
        hasReasoning,
        reasoningTrigger: "",
        systemPrompt: promptMatch ? promptMatch[1]! : "",
        hasExtraMethods: (content.includes("validateCodeSafety") || content.includes("validate_code_safety")) ? ["validate_code_safety"] : [],
        methods: content.match(/(?:public|private|protected|async)?\s+(\w+)\s*\(.*?\)\s*(?::|{)/g)
            ?.map(m => m.match(/(\w+)\s*\(/)?.[1] || "")
            .filter(n => n && !["if", "for", "while", "switch", "catch"].includes(n)) || []
    };
}

// ─── Delta Computation ───────────────────────────────────────────────────

export function computeDeltas(legacy: AtomicFingerprint, current: AtomicFingerprint, agent: string): AgentDelta[] {
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
        const match = currentMethods.find(cm =>
            cm === lm ||
            cm === camelName ||
            cm.toLowerCase() === lm.replace(/_/g, "").toLowerCase()
        );

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

export function computeScore(deltas: AgentDelta[]): number {
    let score = 100;
    for (const d of deltas) {
        if (d.severity === "CRITICAL") score -= 50;
        if (d.severity === "HIGH") score -= 30;
        if (d.severity === "MEDIUM") score -= 15;
        if (d.severity === "INFO") score -= 2;
    }
    return Math.max(0, score);
}

export function capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
}
