import winston from "winston";
import * as fs from "node:fs";
import * as path from "node:path";

const logger = winston.child({ module: "ParityAnalyst" });

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
}

export interface AgentDelta {
    dimension: string;
    legacy: string;
    current: string;
    severity: "INFO" | "MEDIUM" | "HIGH" | "CRITICAL";
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

// ─── Mappings ─────────────────────────────────────────────────────────────

const LEGACY_ALIASES: Record<string, string> = {
    "reflex_engine_phd": "reflex_engine",
    "ast_navigator": "ast_intelligence",
    "ast_node_inspector": "ast_intelligence",
    "ast_traversal_logic": "ast_intelligence",
    "audit_risk_engine": "audit_expert_engine",
    "audit_scanner_engine": "audit_expert_engine",
    "safe_context_judge": "safety_supreme_judge",
    "safety_heuristics": "safety_supreme_judge",
    "safety_assignment_engine": "safety_supreme_judge",
    "safety_navigator": "safety_supreme_judge",
    "rule_definition_judge": "safety_supreme_judge",
    "obfuscation_cleaner_engine": "vulnerability_heuristic",
    "telemetry_intent_judge": "telemetry_excellence_engine",
    "telemetry_maturity_logic": "telemetry_excellence_engine",
    "intent_heuristics_engine": "telemetry_excellence_engine",
    "test_discovery_logic": "telemetry_excellence_engine",
    "analysis_engine_phd": "phd_governance_system",
    "conflict_policy_phd": "phd_governance_system",
    "scoring_engine_phd": "phd_governance_system",
    "topology_engine_phd": "phd_governance_system",
    "compliance_standard": "phd_governance_system",
    "git_operations_phd": "phd_governance_system",
    "veto_rules_phd": "phd_governance_system",
    "test_bolt": "specialized_personas_hub",
    "test_director": "specialized_personas_hub",
    "test_sentinel": "specialized_personas_hub",
    "test_vault": "specialized_personas_hub",
    "logic_node_auditor": "structural_auditor_supreme",
    "silent_error_detector": "structural_auditor_supreme",
    "semantic_context_analyst": "structural_auditor_supreme",
    "meta_analysis_detector": "structural_auditor_supreme",
    "call_safety_judge": "safety_supreme_judge",
    "code_inspector": "structural_auditor_supreme",
    "line_veto": "structural_auditor_supreme",
    "metrics_assembler": "structural_auditor_supreme",
    "registry_compiler": "audit_expert_engine",
    "report_sections_engine": "report_formatter",
    "test_navigator": "ast_intelligence",
    "veto_criteria_engine": "structural_auditor_supreme",
    "veto_rules": "structural_auditor_supreme",
    "veto_structural_engine": "structural_auditor_supreme",
    "web_insight": "discovery",
    "compiler": "phd_governance_system",
    "test_core_depth": "telemetry_excellence_engine",
    "test_score_calculator": "phd_governance_system",
    "indexer": "phd_governance_system",
    "parallel_test_executor": "telemetry_excellence_engine",
    "persona_loader": "phd_governance_system",
    "resource_governor": "phd_governance_system",
    "semantic_search": "discovery",
    "test_mapper": "telemetry_excellence_engine",
    "voice_engine": "briefing",
    "agents_registry": "audit_expert_engine"
};

const FILE_MAPPINGS: Record<string, string> = {
    "git_automaton.py": "utils/git_client.ts",
    "markdown_sanitizer.py": "agents/Support/markdown_auditor.ts",
    "telemetry_intent_judge.py": "agents/Support/logic_auditor.ts",
    "telemetry_maturity_logic.py": "agents/Support/logic_auditor.ts",
    "silent_error_detector.py": "agents/Support/logic_auditor.ts",
    "meta_analysis_detector.py": "agents/Support/logic_auditor.ts",
    "call_safety_judge.py": "agents/Support/logic_auditor.ts",
    "safe_context_judge.py": "agents/Support/logic_auditor.ts",
    "resource_governor.py": "utils/system_sentinel.ts",
    "conflict_policy.py": "utils/conflict_policy.ts",
    "memory_pruning_agent.py": "utils/memory_pruning_agent.ts",
    "audit_risk_engine.py": "agents/Support/logic_auditor.ts",
    "audit_scanner_engine.py": "core/audit_engine.ts",
    "veto_criteria_engine.py": "utils/veto_engine.ts",
    "veto_rules.py": "utils/veto_engine.ts",
    "veto_structural_engine.py": "utils/veto_engine.ts",
    "safety_heuristics.py": "agents/Support/logic_auditor.ts",
    "safety_assignment_engine.py": "agents/Support/logic_auditor.ts",
    "report_formatter.py": "core/diagnostic_finalizer.ts",
    "report_sections_engine.py": "core/diagnostic_finalizer.ts"
};

const IGNORE_LIST = [
    "ast_navigator.py",
    "ast_node_inspector.py",
    "ast_traversal_logic.py",
    "source_code_parser.py",
    "registry_compiler.py",
    "obfuscation_cleaner_engine.py",
    "logic_node_auditor.py"
];

// ─── Parity Analyst ────────────────────────────────────────────────────────

/**
 * ⚖️ ParityAnalyst — PhD in Atomic Symmetry & Forensic Audit
 * Especialista em paridade cross-stack e migração legacy.
 */
export class ParityAnalyst {
    private legacyRoot: string;
    private tsRoot: string;
    private depthMetrics: DepthMetric[];

    constructor(
        legacyRoot = "C:/Users/joaom/Documents/GitHub/legacy_restore/src_local/agents",
        tsRoot = "src_local/agents",
        depthMetrics: DepthMetric[] = []
    ) {
        this.legacyRoot = legacyRoot;
        this.tsRoot = tsRoot;
        this.depthMetrics = depthMetrics;
    }

    /**
     * Compares two files and returns a parity score.
     */
    public compareFiles(legacyPath: string, sovereignPath: string): number {
        if (!fs.existsSync(legacyPath) || !fs.existsSync(sovereignPath)) return 0;

        const legacyContent = fs.readFileSync(legacyPath, "utf-8");
        const sovereignContent = fs.readFileSync(sovereignPath, "utf-8");
        const name = path.basename(legacyPath, path.extname(legacyPath));

        const legacyFP = extractPythonFingerprint(legacyContent, name);
        const sovereignFP = extractTSFingerprint(sovereignContent, capitalize(name));

        if (legacyFP && sovereignFP) {
            const deltas = computeDeltas(legacyFP, sovereignFP, name);
            return computeScore(deltas);
        }

        return this.computeGenericParity(legacyContent, sovereignContent);
    }

    private computeGenericParity(legacy: string, sovereign: string): number {
        let score = 100;
        const legacyLines = legacy.split("\n").filter(l => l.trim().length > 0).length;
        const sovLines = sovereign.split("\n").filter(l => l.trim().length > 0).length;

        if (legacyLines > 0) {
            const ratio = sovLines / legacyLines;
            if (ratio < 0.5) score -= 20;
            else if (ratio > 5.0) score -= 10;
        }

        const legacyDefs = (legacy.match(/def\s+(\w+)/g) || []).map(d => d.replace("def ", ""));
        const sovDefs = (sovereign.match(/(function\s+(\w+)|(\w+)\s*\(|(\w+)\s*=\s*\()/g) || []).length;

        if (legacyDefs.length > sovDefs * 2) score -= 30;

        return Math.max(0, score);
    }

    /**
     * Compatibility method for ContextEngine.
     * @param _personas Ignored in favor of direct FS scan.
     */
    analyzeStackGaps(_personas: any[]): ParityReport {
        return this.analyzeAtomicParity();
    }

    /**
     * Internal Cross-Stack Symmetry Analysis.
     */
    analyzeAtomicParity(): ParityReport {
        const startTime = Date.now();
        const results: AgentParityResult[] = [];
        const stacks = ["Bun", "Flutter", "Go", "Kotlin", "Python", "TypeScript"];
        const categories = ["Audit", "Content", "Strategic", "System"];

        const agentGroups = new Map<string, Array<{ stack: string; cat: string; fp: AtomicFingerprint; path: string }>>();

        for (const stack of stacks) {
            for (const cat of categories) {
                const tsDir = path.join(this.tsRoot, stack, cat);
                if (!fs.existsSync(tsDir)) continue;

                const tsFiles = fs.readdirSync(tsDir).filter(f => f.endsWith(".ts"));
                for (const tf of tsFiles) {
                    const agentName = tf.replace(".ts", "").toLowerCase();
                    const content = fs.readFileSync(path.join(tsDir, tf), "utf-8");
                    const fp = extractTSFingerprint(content, capitalize(agentName));
                    if (!fp) continue;

                    if (!agentGroups.has(agentName)) agentGroups.set(agentName, []);
                    agentGroups.get(agentName)!.push({ stack, cat, fp, path: path.join(tsDir, tf) });
                }
            }
        }

        for (const [agentName, instances] of agentGroups.entries()) {
            if (instances.length === 0) continue;
            const reference = instances.find(i => i.stack === "Python") ||
                instances.find(i => i.stack === "TypeScript") ||
                instances[0]!;

            for (const inst of instances) {
                if (inst === reference) {
                    results.push({
                        agent: agentName, stack: inst.stack, category: inst.cat,
                        status: "IDENTICAL", score: 100, deltas: [],
                        legacy: reference.fp, current: inst.fp
                    });
                    continue;
                }
                const deltas = computeDeltas(reference.fp, inst.fp, agentName);
                const realDeltas = deltas.filter(d => d.severity !== "INFO");
                const score = computeScore(deltas);

                results.push({
                    agent: agentName, stack: inst.stack, category: inst.cat,
                    status: realDeltas.length === 0 ? "IDENTICAL" : "DIVERGENT",
                    score, deltas, legacy: reference.fp, current: inst.fp
                });
            }
        }

        const symmetricCount = results.filter(r => r.status === "IDENTICAL").length;
        const divergentCount = results.filter(r => r.status === "DIVERGENT").length;
        const overallParity = results.length > 0
            ? Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length)
            : 0;

        const byStack: Record<string, { total: number; symmetric: number; parity: number }> = {};
        const byCategory: Record<string, { total: number; symmetric: number; parity: number }> = {};

        for (const r of results) {
            if (!byStack[r.stack]) byStack[r.stack] = { total: 0, symmetric: 0, parity: 0 };
            byStack[r.stack]!.total++;
            if (r.status === "IDENTICAL") byStack[r.stack]!.symmetric++;

            if (!byCategory[r.category]) byCategory[r.category] = { total: 0, symmetric: 0, parity: 0 };
            byCategory[r.category]!.total++;
            if (r.status === "IDENTICAL") byCategory[r.category]!.symmetric++;
        }

        for (const k of Object.keys(byStack)) {
            const stackResults = results.filter(r => r.stack === k);
            byStack[k]!.parity = stackResults.length > 0 ? Math.round(stackResults.reduce((sum, r) => sum + r.score, 0) / stackResults.length) : 0;
        }
        for (const k of Object.keys(byCategory)) {
            const catResults = results.filter(r => r.category === k);
            byCategory[k]!.parity = catResults.length > 0 ? Math.round(catResults.reduce((sum, r) => sum + r.score, 0) / catResults.length) : 0;
        }

        const criticalDeltas = results.flatMap(r => r.deltas.filter(d => d.severity === "CRITICAL"));
        const elapsed = Date.now() - startTime;
        const coverage = Array.from(agentGroups.entries()).map(([agent, insts]) => ({
            agent, stacks: insts.map(i => i.stack)
        }));

        return {
            timestamp: new Date().toISOString(),
            totalAgents: agentGroups.size,
            totalInstances: results.length,
            symmetricCount, divergentCount,
            overallParity,
            byStack, byCategory,
            coverage,
            results,
            criticalDeltas
        };
    }

    /**
     * Forensic Legacy Audit: Compares current codebase against legacy_restore.
     */
    analyzeLegacyForensics(): any {
        const results: any[] = [];
        const gaps: any[] = [];

        const legPath = "C:/Users/joaom/Documents/GitHub/legacy_restore/src_local";
        if (!fs.existsSync(legPath)) {
            logger.warn(`🕵️ Forensic: Legacy path NOT found at ${legPath}`);
            return { results, gaps };
        }

        // Crawl legacy_restore
        const legacyFiles = this.crawlDirectory(legPath, [".py"]);

        // Crawl current src_local
        const currentFiles = this.crawlDirectory(path.join(process.cwd(), "src_local"), [".ts", ".py", ".go", ".kt", ".dart"]);

        for (const lPath of legacyFiles) {
            const fileName = path.basename(lPath);
            if (IGNORE_LIST.includes(fileName) || fileName.startsWith("__")) continue;

            const normName = fileName.replace(/\.py$/, "").replace(/_?persona$/, "").replace(/_?agent$/, "");
            const targetName = LEGACY_ALIASES[normName] || normName;

            let match = currentFiles.find(c => path.basename(c).toLowerCase().startsWith(targetName.toLowerCase()));

            // Try explicit mappings
            if (!match && FILE_MAPPINGS[fileName]) {
                const targetPath = FILE_MAPPINGS[fileName]!;
                match = currentFiles.find(c => c.replace(/\\/g, "/").endsWith(targetPath));
            }

            if (!match) {
                gaps.push({ file: fileName, status: "MISSING", path: lPath });
            } else {
                const score = this.compareFiles(lPath, match);
                results.push({ legacy: fileName, current: path.basename(match), score, path: match });
            }
        }

        return { results, gaps };
    }

    private crawlDirectory(dir: string, extensions: string[]): string[] {
        let results: string[] = [];
        if (!fs.existsSync(dir)) return results;
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                if (["node_modules", ".git", "__pycache__"].includes(entry.name)) continue;
                results = results.concat(this.crawlDirectory(fullPath, extensions));
            } else if (extensions.includes(path.extname(entry.name))) {
                results.push(fullPath);
            }
        }
        return results;
    }

    /**
     * Relatório formatado.
     */
    formatMarkdownReport(report: ParityReport): string {
        let md = `## ⚖️ SIMETRIA ALFA: Paridade Cross-Stack (6 Linguagens)\n\n`;
        md += `> Inteligência de Sincronia entre Bun, Flutter, Go, Kotlin, Python e TypeScript | Timestamp: ${report.timestamp}\n\n`;

        md += `| Métrica | Valor |\n| :--- | :---: |\n`;
        md += `| **Sincronia Geral** | ${report.overallParity}% |\n`;
        md += `| **Unique Agents** | ${report.totalAgents} |\n`;
        md += `| **Total Instances** | ${report.totalInstances} |\n`;
        md += `| **Symmetric/Mirror** | ${report.symmetricCount} |\n`;
        md += `| **Divergent** | ${report.divergentCount} |\n\n`;

        md += `### 🌍 Cobertura por Stack\n\n`;
        md += `| Agent | Coverage | Stacks |\n| :--- | :---: | :--- |\n`;
        const coverageSorted = report.coverage.sort((a, b) => b.stacks.length - a.stacks.length);
        for (const c of coverageSorted) {
            md += `| ${c.agent} | ${c.stacks.length}/6 | ${c.stacks.join(", ")} |\n`;
        }
        md += `\n`;

        // Forensic Section
        const forensics = this.analyzeLegacyForensics();
        md += `--- \n\n## 🕵️ AUDITORIA FORENSE (LEGACY RECOVERY)\n\n`;
        md += `| Legacy File | Target Sovereign | Paridade |\n| :--- | :--- | :---: |\n`;
        for (const f of forensics.results.slice(0, 15)) {
            const icon = f.score === 100 ? "✅" : (f.score > 80 ? "⚠️" : "🚨");
            md += `| \`${f.legacy}\` | \`${f.current}\` | ${icon} ${f.score}% |\n`;
        }
        md += `\n> Exibindo top 15 matches forenses. Total de Gaps: ${forensics.gaps.length}\n\n`;

        return md;
    }

    getVitalStatus(report: ParityReport): string {
        if (report.overallParity >= 95) return `${report.overallParity}% Atômica`;
        if (report.overallParity >= 80) return `${report.overallParity}% Parcial`;
        return `${report.overallParity}% Crítica`;
    }
}

// ─── Fingerprint Extractors ───────────────────────────────────────────────

function extractPythonFingerprint(content: string, name: string): AtomicFingerprint {
    const emojiMatch = content.match(/emoji\s*=\s*["'](.*?)["']/) || content.match(/self\.emoji\s*=\s*["'](.*?)["']/);
    const roleMatch = content.match(/role\s*=\s*["'](.*?)["']/) || content.match(/self\.role\s*=\s*["'](.*?)["']/);
    const stackMatch = content.match(/stack\s*=\s*["'](.*?)["']/) || content.match(/self\.stack\s*=\s*["'](.*?)["']/);

    // Deeper regex from parity_scanner.ts
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

function extractTSFingerprint(content: string, name: string): AtomicFingerprint | null {
    const emojiMatch = content.match(/emoji:\s*["'](.*?)["']/) || content.match(/this\.emoji\s*=\s*["'](.*?)["']/);
    const roleMatch = content.match(/role:\s*["']([\s\S]*?)["']/) || content.match(/this\.role\s*=\s*["'](.*?)["']/);
    const stackMatch = content.match(/stack:\s*["'](.*?)["']/) || content.match(/this\.stack\s*=\s*["'](.*?)["']/);

    // Deeper regex from parity_scanner.ts
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

function computeDeltas(legacy: AtomicFingerprint, current: AtomicFingerprint, agent: string): AgentDelta[] {
    const deltas: AgentDelta[] = [];
    if (legacy.name.toLowerCase() !== current.name.toLowerCase())
        deltas.push({ dimension: "name", legacy: legacy.name, current: current.name, severity: "CRITICAL", context: `Agent identity mismatch for ${agent}` });

    if (legacy.rulesCount !== current.rulesCount)
        deltas.push({ dimension: "rulesCount", legacy: String(legacy.rulesCount), current: String(current.rulesCount), severity: "MEDIUM", context: `Rule count divergence` });

    if (legacy.hasReasoning !== current.hasReasoning)
        deltas.push({ dimension: "reasoning", legacy: String(legacy.hasReasoning), current: String(current.hasReasoning), severity: "CRITICAL", context: "Strategy logic MISSING" });

    // Dimension: Methods (Deep Disparity)
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

function computeScore(deltas: AgentDelta[]): number {
    let score = 100;
    for (const d of deltas) {
        if (d.severity === "CRITICAL") score -= 50;
        if (d.severity === "HIGH") score -= 30;
        if (d.severity === "MEDIUM") score -= 15;
        if (d.severity === "INFO") score -= 2;
    }
    return Math.max(0, score);
}

function capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
}
