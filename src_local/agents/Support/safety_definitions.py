"""
SISTEMA DE PERSONAS AGENTES - DEFINIÇÕES DE SEGURANÇA
Contém constantes e metadados técnicos para análise de integridade.
"""

SAFE_METADATA_VARS = [
    'rule', 'pattern', 'issue', 'regex', 'p_str', 'keyword', 'audit_rules', 
    'patterns', 'dangerous', 'veto_patterns', 'p_kw', 'e_kw', 
    'brittle_pattern', 'silent_pattern', 'target_pattern', 'fragilities',
    'part1', 'part2', 'part3', 'danger_kw', 'rules_def', 'reg_def',
    'keywords', 'tech_terms', 'financial_terms', 'forbidden', 'suggestions',
    'identities', 'log_performance', '_log_performance', '_log_perf'
]

TELEMETRY_KEYWORDS = ["duration", "elapsed", "took", "time_diff", "start_t"]

SAFE_LOG_METHODS = ['info', 'warning', 'error', 'debug', 'exception']

CRITICAL_LOG_METHODS = ['error', 'exception', 'critical']

CORE_PERFORMANCE_FUNCS = ['log_performance', '_log_performance', '_log_perf']

ANALYZER_CLASSES = [
    'LogicAuditor', 'LogicNodeAuditor', 'MaturityEvaluator', 
    'SafetyHeuristics', 'TelemetryIntentJudge', 'SemanticContextAnalyst',
    'IntegrityGuardian', 'SilentErrorDetector'
]

ANALYZER_METHODS = [
    'audit', 'scan_flaws', 'judge_intent', 'classify_intent', 
    'calculate_maturity', 'is_interaction_safe', 'detect', '_is_tele_name'
]

META_ANALYSIS_LIBS = ['ast', 're', 'inspect']

TRIVIAL_COMPARE_KEYWORDS = [
    "global", "eval", "exec", "time.time()", "_log_performance", 
    "_reason_about_objective", "pathlib", "rules =", "patterns ="
]


