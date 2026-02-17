/**
 * SISTEMA DE PERSONAS AGENTES - SUPORTE TÉCNICO
 * Módulo: Juiz de Intenção de Telemetria (TelemetryIntentJudge)
 * Função: Analisar intencionalidade de uso de tempo/performance.
 * Soberania: SECURITY-JUDGE.
 */
import winston from "winston";
import { TELEMETRY_KEYWORDS, CRITICAL_LOG_METHODS, CORE_PERFORMANCE_FUNCS } from "./../Security/safety_definitions.ts";

const logger = winston.child({ module: "TelemetryIntentJudge" });

export type TelemetrySeverity = "STRATEGIC" | "HIGH" | "MEDIUM" | "LOW";

export interface TelemetryJudgment {
    isSafe: boolean;
    severity: TelemetrySeverity;
    reason: string;
}

/**
 * ⚖️ TelemetryIntentJudge — Avalia a intencionalidade do uso de telemetria.
 *
 * Analisa se o uso de timing/performance em código é:
 * - Legítimo (definição técnica, log informacional)
 * - Suspeito (telemetria manual em fluxo de erro)
 * - Arriscado (cálculo de duração sem wrapper padrão)
 */
export class TelemetryIntentJudge {
    private readonly maturity: TelemetryMaturityLogic;

    constructor() {
        this.maturity = new TelemetryMaturityLogic();
    }

    /**
     * ⚖️ Julga a intenção de uma linha de código com uso de telemetria.
     */
    judgeIntent(codeLine: string, surroundingContext: string): TelemetryJudgment {
        // 1. Definição técnica em constantes
        if (this._isRuleDefinition(codeLine)) {
            return { isSafe: true, severity: "STRATEGIC", reason: "Definição técnica de padrão de telemetria." };
        }

        // 2. Dentro de log crítico (error/exception)
        if (this._isInsideCriticalReport(surroundingContext)) {
            return { isSafe: false, severity: "HIGH", reason: "Telemetria manual em fluxo de erro crítico. Use _log_performance para integridade." };
        }

        // 3. Log informacional
        if (this._isInsideLogCall(surroundingContext)) {
            return { isSafe: false, severity: "STRATEGIC", reason: "Telemetria manual em Log (Info/Debug). Sugestão: Migrar para _log_performance." };
        }

        // 4. Subtração simples de tempo
        if (this.maturity.isSimpleTimeSubtraction(codeLine)) {
            return { isSafe: false, severity: "STRATEGIC", reason: "Telemetria manual detectada. Sugestão: Migrar para _log_performance." };
        }

        // 5. Variável com nome de telemetria
        if (this.maturity.isTelemetryName(codeLine)) {
            return { isSafe: false, severity: "STRATEGIC", reason: "Cálculo de duração manual para Log futuro. Sugestão: Usar utilitários da Base." };
        }

        // 6. Uso genérico em lógica
        return { isSafe: false, severity: "MEDIUM", reason: "Telemetria manual detectada em Lógica de Controle (Risco de Runtime)." };
    }

    /**
     * 📊 Escaneia um arquivo completo e retorna findings de telemetria.
     */
    scanFile(content: string, filePath: string): Array<{ line: number; judgment: TelemetryJudgment }> {
        const lines = content.split("\n");
        const findings: Array<{ line: number; judgment: TelemetryJudgment }> = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i]!;
            if (!this._hasTelemetrySignal(line)) continue;

            // Já está usando o wrapper padrão — seguro
            if (CORE_PERFORMANCE_FUNCS.some(fn => line.includes(fn))) continue;

            const context = lines.slice(Math.max(0, i - 3), Math.min(lines.length, i + 3)).join("\n");
            const judgment = this.judgeIntent(line, context);

            if (!judgment.isSafe) {
                findings.push({ line: i + 1, judgment });
            }
        }

        logger.debug(`⚖️ ${filePath}: ${findings.length} telemetry findings`);
        return findings;
    }

    private _isRuleDefinition(line: string): boolean {
        return /^\s*(export\s+)?(const|let|var)\s+[A-Z_]/.test(line);
    }

    private _isInsideCriticalReport(ctx: string): boolean {
        return CRITICAL_LOG_METHODS.some(m => ctx.includes(`.${m}(`));
    }

    private _isInsideLogCall(ctx: string): boolean {
        return /logger\.(info|warn|debug|verbose)/.test(ctx) || /console\.(log|info|debug)/.test(ctx);
    }

    private _hasTelemetrySignal(line: string): boolean {
        return /time\.time|Date\.now|performance\.now|process\.hrtime|Bun\.nanoseconds/.test(line)
            || TELEMETRY_KEYWORDS.some(k => line.toLowerCase().includes(k));
    }

    /** Parity: _check_definition_and_obs — Checks if line is a definition or observability pattern. */
    private _check_definition_and_obs(codeLine: string, ctx: string): TelemetryJudgment | null {
        if (this._isRuleDefinition(codeLine)) {
            return { isSafe: true, severity: "STRATEGIC", reason: "Definição técnica de padrão de telemetria." };
        }
        if (this._isInsideCriticalReport(ctx)) {
            return { isSafe: false, severity: "HIGH", reason: "Telemetria manual em fluxo de erro crítico." };
        }
        return null;
    }

    /** Parity: _check_observability_context — Checks if inside an observability/log context. */
    private _check_observability_context(ctx: string): TelemetryJudgment | null {
        if (this._isInsideLogCall(ctx)) {
            return { isSafe: false, severity: "STRATEGIC", reason: "Telemetria manual em Log. Sugestão: migrar para _log_performance." };
        }
        return null;
    }

    /** Parity: _check_logic_and_standard — Checks for logic-level telemetry patterns. */
    private _check_logic_and_standard(codeLine: string): TelemetryJudgment | null {
        if (this.maturity.isSimpleTimeSubtraction(codeLine)) {
            return { isSafe: false, severity: "STRATEGIC", reason: "Telemetria manual detectada. Sugestão: Migrar para _log_performance." };
        }
        if (this.maturity.isTelemetryName(codeLine)) {
            return { isSafe: false, severity: "STRATEGIC", reason: "Cálculo de duração manual para Log futuro." };
        }
        return null;
    }
}

/**
 * ⏱️ TelemetryMaturityLogic — Avalia padrões de tempo/performance.
 */
export class TelemetryMaturityLogic {
    /**
     * Verifica se é uma subtração simples de tempo (ex: Date.now() - startTime).
     */
    isSimpleTimeSubtraction(line: string): boolean {
        return /Date\.now\s*\(\)\s*-\s*\w+/.test(line) || /\w+\s*-\s*Date\.now\s*\(\)/.test(line)
            || /performance\.now\s*\(\)\s*-\s*\w+/.test(line);
    }

    /**
     * Verifica se o nome indica telemetria.
     */
    isTelemetryName(line: string): boolean {
        return TELEMETRY_KEYWORDS.some(k => line.toLowerCase().includes(k));
    }
}
