import { TELEMETRY_KEYWORDS, CRITICAL_LOG_METHODS } from "./../Security/safety_definitions.ts";

/**
 * ⚖️ JudgeHelpers - PhD in Intent Logic
 */
export class JudgeHelpers {
    static isRuleDefinition(line: string): boolean {
        return /^\s*(export\s+)?(const|let|var)\s+[A-Z_]/.test(line);
    }

    static isInsideCriticalReport(ctx: string): boolean {
        return CRITICAL_LOG_METHODS.some(m => ctx.includes(`.${m}(`));
    }

    static isInsideLogCall(ctx: string): boolean {
        return /logger\.(info|warn|debug|verbose)/.test(ctx) || /console\.(log|info|debug)/.test(ctx);
    }

    static hasTelemetrySignal(line: string): boolean {
        return /time\.time|Date\.now|performance\.now|process\.hrtime|Bun\.nanoseconds/.test(line)
            || TELEMETRY_KEYWORDS.some(k => line.toLowerCase().includes(k));
    }

    static isSimpleTimeSubtraction(line: string): boolean {
        return /Date\.now\s*\(\)\s*-\s*\w+/.test(line) || /\w+\s*-\s*Date\.now\s*\(\)/.test(line)
            || /performance\.now\s*\(\)\s*-\s*\w+/.test(line);
    }

    static isTelemetryName(line: string): boolean {
        return TELEMETRY_KEYWORDS.some(k => line.toLowerCase().includes(k));
    }
}
