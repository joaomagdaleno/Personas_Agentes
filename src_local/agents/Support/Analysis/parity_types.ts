// ─── Types ──────────────────────────────────────────────────────────────────

export interface AtomicFingerprint {
    name: string;
    emoji: string;
    role: string;
    stack: string;
    rulesCount: number;
    rulePatterns: string[];
    ruleIssues: string[];
    ruleSeverities: string[];
    fileExtensions: string[];
    hasReasoning: boolean;
    reasoningTrigger: string;
    systemPrompt: string;
    hasExtraMethods: string[];
    methods: string[];
    halsteadVolume: number;
    halsteadDifficulty: number;
    halsteadEffort: number;
}

export interface AgentDelta {
    dimension: string;
    legacy: string;
    current: string;
    severity: "INFO" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    context: string;
}

export type TelemetryJudgment = "STRONG" | "WEAK" | "ABSENT";

export interface AgentParityResult {
    agent: string;
    stack: string;
    category: string;
    status: "IDENTICAL" | "DIVERGENT" | "MISSING_TS" | "MISSING_PY" | "AMBIGUOUS" | "PORTED_ELSEWHERE";
    score: number;
    deltas: AgentDelta[];
    legacy: AtomicFingerprint | null;
    current: AtomicFingerprint | null;
}

export interface ParityReport {
    timestamp: string;
    totalAgents: number;       // Number of unique agent identities
    totalInstances: number;    // Total agent-stack combinations
    symmetricCount: number;    // Number of instances perfectly mirrored vs reference
    divergentCount: number;    // Number of instances with discrepancies
    overallParity: number;     // 0-100 average symmetry score
    byStack: Record<string, { total: number; symmetric: number; parity: number }>;
    byCategory: Record<string, { total: number; symmetric: number; parity: number }>;
    coverage: Array<{ agent: string, stacks: string[] }>;
    results: AgentParityResult[];
    criticalDeltas: AgentDelta[];
}

export interface DepthMetric {
    path: string;
    pyDepth: number;
    tsDepth: number;
    parity: number;
}
