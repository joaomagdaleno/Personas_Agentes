import winston from "winston";
import { CORE_PERFORMANCE_FUNCS } from "./../Security/safety_definitions.ts";
import { JudgeHelpers } from "./JudgeHelpers.ts";

const logger = winston.child({ module: "TelemetryIntentJudge" });

export type TelemetrySeverity = "STRATEGIC" | "HIGH" | "MEDIUM" | "LOW";

export interface TelemetryJudgment {
    isSafe: boolean;
    severity: TelemetrySeverity;
    reason: string;
}

/**
 * ⚖️ TelemetryIntentJudge — PhD in Telemetry Forensics
 */
export class TelemetryIntentJudge {
    judgeIntent(codeLine: string, surroundingContext: string): TelemetryJudgment {
        if (JudgeHelpers.isRuleDefinition(codeLine)) return { isSafe: true, severity: "STRATEGIC", reason: "Definição técnica." };
        if (JudgeHelpers.isInsideCriticalReport(surroundingContext)) return { isSafe: false, severity: "HIGH", reason: "Telemetria manual em fluxo de erro." };
        if (JudgeHelpers.isInsideLogCall(surroundingContext)) return { isSafe: false, severity: "STRATEGIC", reason: "Telemetria manual em Log." };
        if (JudgeHelpers.isSimpleTimeSubtraction(codeLine)) return { isSafe: false, severity: "STRATEGIC", reason: "Subtração simples detectada." };
        if (JudgeHelpers.isTelemetryName(codeLine)) return { isSafe: false, severity: "STRATEGIC", reason: "Cálculo de duração manual." };
        return { isSafe: false, severity: "MEDIUM", reason: "Telemetria manual em Lógica." };
    }

    scanFile(content: string, filePath: string): Array<{ line: number; judgment: TelemetryJudgment }> {
        const lines = content.split("\n"), findings: any[] = [];
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i]!;
            if (!JudgeHelpers.hasTelemetrySignal(line) || CORE_PERFORMANCE_FUNCS.some(fn => line.includes(fn))) continue;
            const judgment = this.judgeIntent(line, lines.slice(Math.max(0, i - 1), Math.min(lines.length, i + 1)).join("\n"));
            if (!judgment.isSafe) findings.push({ line: i + 1, judgment });
        }
        logger.debug(`⚖️ ${filePath}: ${findings.length} telemetry findings`);
        return findings;
    }
}
