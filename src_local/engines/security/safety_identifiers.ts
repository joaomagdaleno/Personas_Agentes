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
