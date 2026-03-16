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
