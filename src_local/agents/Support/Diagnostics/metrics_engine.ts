import winston from "winston";
import { CyclomaticAnalyst } from "./strategies/CyclomaticAnalyst.ts";
import { CognitiveAnalyst } from "./strategies/CognitiveAnalyst.ts";
import { HalsteadAnalyst } from "./strategies/HalsteadAnalyst.ts";
import { SizeAnalyst } from "./strategies/SizeAnalyst.ts";
import { RelationshipAnalyst } from "./strategies/RelationshipAnalyst.ts";
import { QualityEvaluator } from "./strategies/QualityEvaluator.ts";

const logger = winston.child({ module: "MetricsEngine" });

export interface MetricsResult {
    cyclomaticComplexity: number;
    cognitiveComplexity: number;
    halsteadVolume: number;
    halsteadDifficulty: number;
    halsteadEffort: number;
    nestingDepth: number;
    loc: number;
    locExecutable: number;
    locComments: number;
    sloc: number;
    cbo: number;
    ca: number;
    dit: number;
    maintainabilityIndex: number;
    defectDensity: number;
    testCoverage: number;
    riskLevel: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
    qualityGate: "GREEN" | "YELLOW" | "RED";
    isShadow: boolean;
    shadowComplexity: number;
    telemetry: boolean;
}

export class MetricsEngine {
    analyzeFile(content: string, filePath: string, dependencies: string[] = [], bugCount: number = 0): MetricsResult {
        const start = Date.now();
        const isShadow = filePath.includes("_shadow");
        const analysisContent = isShadow ? this.extractSelfCode(content) : content;

        const cc = CyclomaticAnalyst.calculate(analysisContent);
        const cog = CognitiveAnalyst.calculate(analysisContent);
        const halstead = HalsteadAnalyst.calculate(analysisContent);
        const loc = SizeAnalyst.countLOC(content);
        const sloc = SizeAnalyst.countExecutableLOC(analysisContent);
        const comments = SizeAnalyst.countCommentLOC(content);
        const nesting = SizeAnalyst.calculateNestingDepth(analysisContent);
        const cbo = RelationshipAnalyst.calculateCBO(dependencies);
        const ca = RelationshipAnalyst.calculateCa(dependencies, filePath);
        const dit = RelationshipAnalyst.calculateDIT(content);
        const mi = QualityEvaluator.calculateMaintainabilityIndex(halstead.volume, cc, sloc);
        const defectDensity = sloc > 0 ? (bugCount * 1000) / sloc : 0;
        const risk = QualityEvaluator.determineRiskLevel(cc, cog, mi);
        const gate = QualityEvaluator.determineQualityGate(mi, cc, defectDensity, sloc);

        const result: MetricsResult = {
            cyclomaticComplexity: cc, cognitiveComplexity: cog,
            halsteadVolume: halstead.volume, halsteadDifficulty: halstead.difficulty,
            halsteadEffort: halstead.effort, nestingDepth: nesting,
            loc, locExecutable: sloc, locComments: comments, sloc,
            cbo, ca, dit, maintainabilityIndex: Math.max(0, mi),
            defectDensity, testCoverage: 0, riskLevel: risk,
            qualityGate: gate, isShadow,
            shadowComplexity: isShadow ? this.calculateShadowSelfComplexity(content) : 0,
            telemetry: ["telemetry", "log_performance", "winston", "logger"].some(kw => content.includes(kw))
        };

        logger.debug(`Analysis of ${filePath} completed in ${Date.now() - start}ms`);
        return result;
    }

    private extractSelfCode(content: string): string {
        return content.split('\n').filter(line => !line.trim().startsWith('import ') && !line.trim().startsWith('export ') && !line.trim().startsWith('from ')).join('\n');
    }

    private calculateShadowSelfComplexity(content: string): number {
        return Math.min(CyclomaticAnalyst.calculate(this.extractSelfCode(content)), 15);
    }

    validateShadowCompliance(metrics: MetricsResult): { compliant: boolean; reason: string } {
        return QualityEvaluator.validateShadowCompliance(metrics);
    }
}

export default MetricsEngine;
