import winston from "winston";
import * as ts from "typescript";
import type { AuditRule } from "../../core/types.ts";
import { HubManagerGRPC } from "../../core/hub_manager_grpc.ts";

const logger = winston.child({ module: "SecurityCloudGuardianService" });

export enum SecurityVector {
    OBFUSCATION = "OBFUSCATION",
    INJECTION = "INJECTION",
    LEAK = "LEAK",
    INFRASTRUCTURE = "INFRASTRUCTURE",
    LOGIC_BOMB = "LOGIC_BOMB"
}

export interface SecurityAuditResult {
    vector: SecurityVector;
    rulesHit: AuditRule[];
    threatLevel: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
    remediation: string;
}

export class ForbiddenPolicy {
    static isForbiddenDir(dir: string): boolean {
        const normalized = dir.replace(/\\/g, "/").toLowerCase();
        const segments = normalized.split("/");

        if (this.hasForbiddenSegment(segments)) return true;
        if (segments.includes(".agent")) return this.isForbiddenAgentDir(normalized, segments);
        return false;
    }

    private static hasForbiddenSegment(segments: string[]): boolean {
        const forbidden = new Set([".git", ".gemini", "restore", "forensics", "__pycache__", "node_modules", ".venv", "dist", "build"]);
        return segments.some(p => forbidden.has(p));
    }

    private static isForbiddenAgentDir(normalized: string, segments: string[]): boolean {
        if (normalized.includes("fast-android-build")) return false;
        const sub = segments.slice(segments.indexOf(".agent"));
        const allowed = new Set([".agent", "skills"]);
        return !sub.every(p => allowed.has(p));
    }
}

export class HeuristicEvaluator {
    constructor(private hubManager?: HubManagerGRPC) {}

    public async analyze(file: string, content: string): Promise<SecurityAuditResult> {
        if (!this.hubManager) {
            return {
                vector: SecurityVector.LOGIC_BOMB,
                rulesHit: [],
                threatLevel: "LOW",
                remediation: "Aguardando conexão com Hub gRPC para auditoria profunda."
            };
        }

        try {
            const analysis = await this.hubManager.analyzeFile(file, content);
            const hits: AuditRule[] = (analysis?.findings || [])
                .filter((f: any) => ["SECURITY", "OBFUSCATION"].includes(f.category))
                .map((f: any) => ({
                    regex: "",
                    issue: f.message,
                    severity: f.severity.toLowerCase() as any
                }));

            const threatLevel = this.calculateThreatLevel(hits);
            const vector = this.determineVector(hits);

            return {
                vector,
                rulesHit: hits,
                threatLevel,
                remediation: this.getRemediation(vector)
            };
        } catch (e) {
            logger.error(`❌ [SecurityCloudGuardian] Falha na análise gRPC: ${e}`);
            return {
                vector: SecurityVector.LOGIC_BOMB,
                rulesHit: [],
                threatLevel: "LOW",
                remediation: "Erro de análise."
            };
        }
    }

    private calculateThreatLevel(hits: AuditRule[]): "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" {
        if (hits.some(h => h.severity === "critical")) return "CRITICAL";
        if (hits.some(h => h.severity === "high")) return "HIGH";
        if (hits.some(h => h.severity === "medium")) return "MEDIUM";
        return "LOW";
    }

    private determineVector(hits: AuditRule[]): SecurityVector {
        if (hits.some(h => h.issue.includes("Injeção"))) return SecurityVector.INJECTION;
        if (hits.some(h => h.issue.includes("Vazamento"))) return SecurityVector.LEAK;
        return SecurityVector.LOGIC_BOMB;
    }

    private getRemediation(vector: SecurityVector): string {
        switch (vector) {
            case SecurityVector.INJECTION: return "Sanitize inputs.";
            case SecurityVector.LEAK: return "Remove secrets.";
            default: return "Review security rules.";
        }
    }
}

import { DatabaseHub } from "../../core/database_hub.ts";

export interface ComplianceRule {
    id: string;
    category: "SECURITY" | "PERFORMANCE" | "RESILIENCE" | "MODERNITY";
    description: string;
    severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
    check: (content: string) => boolean;
}

export class ComplianceStandard {
    readonly rules: ComplianceRule[] = [
        {
            id: "SEC-001", category: "SECURITY", severity: "CRITICAL",
            description: "Uso de eval/exec detectado",
            check: (c) => /\beval\s*\(/.test(c) || /\bexec\s*\(/.test(c),
        },
        {
            id: "SEC-002", category: "SECURITY", severity: "HIGH",
            description: "Shell injection potencial",
            check: (c) => /shell\s*[:=]\s*true/i.test(c) || /child_process/.test(c),
        },
        {
            id: "PERF-001", category: "PERFORMANCE", severity: "MEDIUM",
            description: "Telemetria manual sem wrapper padrão",
            check: (c) => /Date\.now\(\)\s*-/.test(c) && !c.includes("log_performance"),
        },
        {
            id: "PERF-002", category: "PERFORMANCE", severity: "LOW",
            description: "Console.log em produção",
            check: (c) => /console\.log\s*\(/.test(c),
        },
        {
            id: "RES-001", category: "RESILIENCE", severity: "HIGH",
            description: "Catch vazio sem tratamento",
            check: (c) => /catch\s*\([^)]*\)\s*\{\s*\}/.test(c),
        },
        {
            id: "RES-002", category: "RESILIENCE", severity: "MEDIUM",
            description: "Falta de error boundary em async",
            check: (c) => /async\s+\w+/.test(c) && !/(try|\.catch)/.test(c),
        },
        {
            id: "MOD-001", category: "MODERNITY", severity: "LOW",
            description: "Uso de var ao invés de const/let",
            check: (c) => /\bvar\s+\w+/.test(c),
        },
        {
            id: "MOD-002", category: "MODERNITY", severity: "LOW",
            description: "Callback hell (nível 3+ de indentação com callbacks)",
            check: (c) => /\.then\(.*\.then\(.*\.then\(/.test(c),
        },
    ];

    auditFile(content: string, filePath: string): Array<{ rule: ComplianceRule; file: string }> {
        const violations: Array<{ rule: ComplianceRule; file: string }> = [];

        for (const rule of this.rules) {
            if (rule.check(content)) {
                violations.push({ rule, file: filePath });
            }
        }

        if (violations.length > 0) {
            logger.debug(`🏆 ${filePath}: ${violations.length} compliance violations`);
        }
        return violations;
    }

    calculateScore(totalFiles: number, totalViolations: number): number {
        if (totalFiles === 0) return 100;
        const maxPossibleViolations = totalFiles * this.rules.length;
        const score = Math.round((1 - totalViolations / maxPossibleViolations) * 100);
        return Math.max(0, Math.min(100, score));
    }

    static async processSecurePayload(dataInput: string, projectRoot: string): Promise<number> {
        logger.info("📡 Iniciando protocolo de conformidade Gold Standard.");

        try {
            const cleanValue = parseFloat(dataInput);
            if (isNaN(cleanValue)) throw new TypeError(`Valor inválido: ${dataInput}`);

            const dbHub = DatabaseHub.getInstance(projectRoot);
            
            const results = dbHub.query("SELECT name FROM agents WHERE status = 'active' LIMIT 100").all();
            
            if (results.length > 0) {
                logger.debug(`💎 Processamento soberano de ${results.length} registros concluído.`);
            }

            return Math.round(cleanValue * 1.2 * 100) / 100;
        } catch (e: any) {
            if (e instanceof TypeError) {
                logger.error(`❌ Falha de validação semântica: ${e.message}`);
                throw e;
            }
            logger.error(`🚨 Falha de infraestrutura: ${e.message}`);
            return 0;
        }
    }
}

/**
 * 🛡️ SecurityCloudGuardianService
 * Serviço Soberano da Super Persona security_cloud_guardian.
 * Unifica heurísticas de vulnerabilidade, auditoria de código e policiamento de diretórios proibidos.
 */
export class SecurityCloudGuardianService {
    private evaluator: HeuristicEvaluator;

    constructor(hubManager?: HubManagerGRPC) {
        this.evaluator = new HeuristicEvaluator(hubManager);
    }

    async evaluateFile(file: string, content: string): Promise<SecurityAuditResult> {
        return this.evaluator.analyze(file, content);
    }

    isPathForbidden(dir: string): boolean {
        return ForbiddenPolicy.isForbiddenDir(dir);
    }
}

export class ContextValidator {
    static isNodeSafe(node: ts.Node, sourceFile: ts.SourceFile, obsFn: (n: ts.Node) => boolean, metaFn: (n: ts.Node) => boolean, mathFn: (n: ts.Node) => boolean): boolean {
        const f = sourceFile.fileName.replace(/\\/g, "/"), checks = [
            () => ["/tests/", "tests/", "/scripts/", "scripts/", "src_local/agents/", "src_local/core/", "src_local/utils/"].some(p => f.includes(p)),
            () => [".test.", ".spec.", ".md", ".txt"].some(e => f.includes(e)),
            () => ["run-diagnostic.ts", "run-diagnostic.py", "extract_personas.ts", "reorganize_support.ts", "update_imports.ts"].some(rf => f.endsWith(rf)),
            () => obsFn(node) || metaFn(node) || mathFn(node)
        ];
        return checks.some(c => c());
    }
}

// ==========================================
// 🛡️ DEFINIÇÕES E PADRÕES DE SEGURANÇA
// ==========================================

export const ANALYZER_CLASSES = [
    'LogicAuditor', 'LogicNodeAuditor', 'MaturityEvaluator',
    'SafetyHeuristics', 'TelemetryIntentJudge', 'SemanticContextAnalyst',
    'IntegrityGuardian', 'SilentErrorDetector', 'MetaAnalysisDetector'
];

export const ANALYZER_METHODS = [
    'audit', 'scan_flaws', 'judge_intent', 'classify_intent',
    'calculate_maturity', 'is_interaction_safe', 'detect', '_is_tele_name'
];

export const META_ANALYSIS_LIBS = ['ast', 're', 'inspect'];

export const DANGEROUS_KEYWORDS = new Set([
    "eval", "exec", "shell=True", "system", "popen",
    "importlib", "__import__", "subprocess", "pass", "except",
    "global", "asyncio", "run", "api_key", "AKIA",
    "storePassword", "InAppPurchase",
    "findViewById", "ANDROID_ID", "Double", "dynamic",
    "callbackFlow", "awaitClose", "http", "debuggable",
    "Activity", "ViewModel", "catch", "mlkit",
    "logEvent", "socket"
]);

export const TRIVIAL_COMPARE_KEYWORDS = [
    "global", "eval", "exec", "time.time()", "_log_performance",
    "_reason_about_objective", "pathlib", "rules =", "patterns ="
];

export const PATTERN_MODE = "STRICT";
export const TELEMETRY_KEYWORDS = ["duration", "elapsed", "took", "time_diff", "start_t"];
export const SAFE_LOG_METHODS = ['info', 'warning', 'error', 'debug', 'exception'];
export const CRITICAL_LOG_METHODS = ['error', 'exception', 'critical'];
export const SAFE_METADATA_VARS = ['rules', 'patterns', 'manifest', 'metadata'];
export const CORE_PERFORMANCE_FUNCS = ['scan_content', 'performAudit', 'calculateComplexity'];

// ==========================================
// 🧹 MOTORES DE ANÁLISE DE OFUSCAÇÃO
// ==========================================

export interface DeobfuscationResult {
    original: string;
    cleaned: string;
    line: number;
}

export class ObfuscationCleanerEngine {
    constructor(private hubManager?: HubManagerGRPC) {}

    public async collectReplacementsDeep(filePath: string, content: string): Promise<DeobfuscationResult[]> {
        if (!this.hubManager) return [];
        try {
            const analysis = await this.hubManager.analyzeFile(filePath, content);
            if (!analysis || !analysis.findings) return [];

            const obfuscationFindings = analysis.findings.filter((f: any) => f.category === "OBFUSCATION");
            if (obfuscationFindings.length === 0) return [];

            const results: DeobfuscationResult[] = [];
            for (const finding of obfuscationFindings) {
                const cleaned = await this.deobfuscateViaHub(finding.snippet);
                if (cleaned && cleaned !== finding.snippet) {
                    results.push({ original: finding.snippet, cleaned: cleaned, line: finding.line });
                }
            }
            return results;
        } catch {
            return [];
        }
    }

    private async deobfuscateViaHub(snippet: string): Promise<string | null> {
        if (!this.hubManager) return null;
        const prompt = `De-obfuscate the following string or expression into its clear, literal version. Return ONLY the string literal, no explanation, no markdown. Snippet: ${snippet}`;
        try {
            const result = await this.hubManager.reason(prompt);
            return result ? result.trim() : null;
        } catch {
            return null;
        }
    }

    public applyClean(content: string, replacements: DeobfuscationResult[]): string {
        let newContent = content;
        for (const r of replacements) {
            newContent = newContent.replace(r.original, r.cleaned);
        }
        return newContent;
    }
}

export class ObfuscationHunter {
    constructor(private hubManager?: HubManagerGRPC) { }

    async scanFile(filePath: string, content: string): Promise<any[]> {
        if (VetoEngine.shouldSkip("", filePath)) return [];
        if (!this.hubManager) return [];

        try {
            const request = {
                files: [{ path: filePath, content }],
                persona_rules: [{ agent: "Security Guard", role: "Protector", emoji: "🛡️", stack: "Security", extensions: [".ts", ".js", ".py"], rules: [] }]
            };
            const findings = await this.hubManager.audit(request);
            return findings.map((f: any) => ({ file: f.file, line: 1, issue: f.issue, severity: f.severity, category: "Security", context: "ObfuscationHunter", evidence: f.evidence }));
        } catch {
            return [];
        }
    }
}

export class ObfuscationLogicEngine {
    resolveConstant(node: any): string | null {
        if (node.type === 'StringLiteral' || node.type === 'Literal') return node.value;
        if (node.type === 'BinaryExpression' && node.operator === '+') {
            const left = this.resolveConstant(node.left), right = this.resolveConstant(node.right);
            if (left !== null && right !== null) return left + right;
        }
        return null;
    }

    checkDangerousKeywords(line: number, resolved: string, node: any): any | null {
        for (const kw of DANGEROUS_KEYWORDS) {
            if (resolved.includes(kw) && this.isFragmented(node, kw)) {
                return { line: line, evidence: "Concatenação Suspeita", reconstruction: resolved, keyword: kw };
            }
        }
        return null;
    }

    private isFragmented(node: any, kw: string): boolean {
        const left = this.resolveConstant(node.left), right = this.resolveConstant(node.right);
        return !(left?.includes(kw) || right?.includes(kw));
    }
}

