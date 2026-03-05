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
        const results = await this.scanPersonaDirectory(personaPath, stack);

        const normalizedScore = results.count > 0 ? (results.score / results.count).toFixed(2) : 0;

        return {
            name,
            stack,
            files_analyzed: results.count,
            maturity_index: Number(normalizedScore),
            status: Number(normalizedScore) >= 3 ? "GOLD" : (Number(normalizedScore) >= 2 ? "STABLE" : "FRAGILE"),
            details: results.details
        };
    }

    private async scanPersonaDirectory(path: Path, stack: string): Promise<{ score: number, count: number, details: any }> {
        const results = { score: 0, count: 0, details: {} as any };
        const pathStr = path.toString();

        if (!(await this.dirExists(pathStr))) return results;

        try {
            const entries = await import("fs/promises").then(fs => fs.readdir(pathStr, { withFileTypes: true }));
            for (const entry of entries) {
                await this.processPersonaEntry(path, entry, stack, results);
            }
        } catch (e) {
            logger.warn(`🎓 [Maturity] Erro ao ler diretório da persona: ${e}`);
        }

        return results;
    }

    private async dirExists(pathStr: string): Promise<boolean> {
        return (await Bun.file(pathStr).exists()) || (await import("fs").then(fs => fs.existsSync(pathStr)));
    }

    private async processPersonaEntry(parentPath: Path, entry: any, stack: string, results: any) {
        if (!entry.isFile() || !(entry.name.endsWith(".ts") || entry.name.endsWith(".py"))) return;

        results.count++;
        const content = await Bun.file(parentPath.join(entry.name).toString()).text();
        const fileMaturity = this.calculateMaturity(content, stack);
        results.score += fileMaturity.score;
        results.details[entry.name] = fileMaturity;
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
