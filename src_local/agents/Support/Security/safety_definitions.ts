/**
 * SISTEMA DE PERSONAS AGENTES - DEFINIÇÕES DE SEGURANÇA
 * Contém constantes e metadados técnicos para análise de integridade.
 */

export { ANALYZER_CLASSES, ANALYZER_METHODS, META_ANALYSIS_LIBS } from "./safety_identifiers";
export { DANGEROUS_KEYWORDS, TRIVIAL_COMPARE_KEYWORDS } from "./safety_patterns";

export const TELEMETRY_KEYWORDS = ["duration", "elapsed", "took", "time_diff", "start_t"];
export const SAFE_LOG_METHODS = ['info', 'warning', 'error', 'debug', 'exception'];
export const CRITICAL_LOG_METHODS = ['error', 'exception', 'critical'];
