import winston from "winston";
import { Path } from "../../../core/path_utils.ts";

const logger = winston.child({ module: "MaturityEvaluator" });

/**
 * 🎓 Avaliador de Maturidade Técnica (Bun Version).
 */
export class MaturityEvaluator {
    structuralAnalyst: any;

    constructor(structuralAnalyst?: any) {
        this.structuralAnalyst = structuralAnalyst;
        logger.debug("🎓 [Maturity] Inicializando avaliador de competência técnica.");
    }

    async evaluatePersona(projectRoot: string, stack: string, name: string): Promise<any> {
        logger.info(`🎓 [Maturity] Analisando DNA da persona: ${name} (${stack})`);

        const personaPath = new Path(projectRoot).join("src_local", "agents", stack);
        let score = 0;
        let fileCount = 0;
        const details: any = {};

        if (await Bun.file(personaPath.toString()).exists() || (await import("fs").then(fs => fs.existsSync(personaPath.toString())))) {
            // Bun.file checks for file, we need dir check. simple existsSync is easier or readdir
            try {
                const entries = await import("fs/promises").then(fs => fs.readdir(personaPath.toString(), { withFileTypes: true }));

                for (const entry of entries) {
                    if (entry.isFile() && (entry.name.endsWith(".ts") || entry.name.endsWith(".py"))) {
                        fileCount++;
                        const content = await Bun.file(new Path(personaPath.toString()).join(entry.name).toString()).text();
                        const fileMaturity = this.calculateMaturity(content, stack);
                        score += fileMaturity.score;
                        details[entry.name] = fileMaturity;
                    }
                }
            } catch (e) {
                logger.warn(`🎓 [Maturity] Erro ao ler diretório da persona: ${e}`);
            }
        }

        const normalizedScore = fileCount > 0 ? (score / fileCount).toFixed(2) : 0;

        return {
            name,
            stack,
            files_analyzed: fileCount,
            maturity_index: Number(normalizedScore),
            details
        };
    }

    calculateMaturity(content: string, stack: string): any {
        const evidences = {
            has_telemetry: ["startMetrics", "endMetrics", "logPerformance", "winston", "logger"].some(kw => content.includes(kw)),
            has_reasoning: content.includes("reasonAboutObjective") || content.includes("brain.reason"),
            has_pathlib: content.includes("Path(") || content.includes("path_utils") || content.includes("node:path"),
            is_linear_syntax: /rules\s*[=:]|patterns\s*[=:]|mapping\s*[=:]/i.test(content),
            has_self_diagnostic: content.includes("selfDiagnostic")
        };

        const score = Object.values(evidences).filter(Boolean).length;
        logger.debug(`🎓 [Maturity] Score calculado: ${score}/4 para ${stack}`);

        return {
            score,
            level: score >= 3 ? "PROFUNDO" : (score >= 2 ? "ESTÁVEL" : "FRÁGIL"),
            ...evidences
        };
    }
}
