/**
 * SISTEMA DE PERSONAS AGENTES - DEFINIÇÕES DE SEGURANÇA
 * Contém constantes e metadados técnicos para análise de integridade.
 */

export const SAFE_METADATA_VARS = [
    'rule', 'pattern', 'issue', 'regex', 'p_str', 'keyword', 'audit_rules',
    'patterns', 'dangerous', 'veto_patterns', 'p_kw', 'e_kw',
    'brittle_pattern', 'silent_pattern', 'target_pattern', 'fragilities',
    'part1', 'part2', 'part3', 'danger_kw', 'rules_def', 'reg_def',
    'keywords', 'tech_terms', 'financial_terms', 'forbidden', 'suggestions',
    'identities', 'log_performance', '_log_performance', '_log_perf',
    'TRIVIAL_COMPARE_KEYWORDS', 'TELEMETRY_KEYWORDS', 'META_ANALYSIS_LIBS',
    'SAFE_METADATA_VARS', 'ANALYZER_CLASSES', 'ANALYZER_METHODS', 'evidences'
];

export const TELEMETRY_KEYWORDS = ["duration", "elapsed", "took", "time_diff", "start_t"];

export const SAFE_LOG_METHODS = ['info', 'warning', 'error', 'debug', 'exception'];

export const CRITICAL_LOG_METHODS = ['error', 'exception', 'critical'];

export const CORE_PERFORMANCE_FUNCS = ['log_performance', '_log_performance', '_log_perf'];

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

export const TRIVIAL_COMPARE_KEYWORDS = [
    "global", "eval", "exec", "time.time()", "_log_performance",
    "_reason_about_objective", "pathlib", "rules =", "patterns ="
];

// Dangerous keywords for obfuscation detection
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
