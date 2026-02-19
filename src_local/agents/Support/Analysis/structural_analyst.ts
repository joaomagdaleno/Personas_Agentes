import winston from "winston";
import { Path } from "../../../core/path_utils.ts";
import { MaturityEvaluator } from "./../Diagnostics/maturity_evaluator.ts";
import { SourceCodeParser } from "./source_code_parser.ts";
import { ComponentClassifier } from "./component_classifier.ts";
import { IntegrityGuardian } from "./../Core/integrity_guardian.ts";
import { AnalysisPolicy } from "./strategies/AnalysisPolicy.ts";
import { IntentClassifier } from "./strategies/IntentClassifier.ts";

const logger = winston.child({ module: "StructuralAnalyst" });

/**
 * Analysis results interface
 */
export interface FileAnalysis {
    complexity: number;
    dependencies: string[];
    functions?: string[];
    classes?: string[];
    telemetry?: boolean;
}

/**
 * 🏗️ Analista Estrutural PhD (Bun Version).
 */
export class StructuralAnalyst {
    maturityEvaluator: MaturityEvaluator;
    parser: SourceCodeParser;
    classifier: ComponentClassifier;
    integrityGuardian: IntegrityGuardian;
    logicAuditor: any; // Will be fixed when LogicAuditor type is available
    inspector: any; // Will be fixed when Inspector type is available

    constructor() {
        this.maturityEvaluator = new MaturityEvaluator();
        this.parser = new SourceCodeParser();
        this.classifier = new ComponentClassifier();
        this.integrityGuardian = new IntegrityGuardian();

        try {
            const { LogicAuditor } = require("./logic_auditor.ts");
            this.logicAuditor = new LogicAuditor();
        } catch (error) {
            logger.error(`❌ [StructuralAnalyst] Failed to load LogicAuditor: ${error}`);
            this.logicAuditor = null;
        }

        // Placeholder for inspector
        this.inspector = { scanFileLogic: () => [] };
    }

    analyzePython(content: string, filename: string): FileAnalysis {
        const startT = Date.now();
        const res = this.parser.analyzePyMetadata(content);

        const duration = (Date.now() - startT) / 1000;
        logger.debug(`⏱️ [StructuralAnalyst] Decomposição ${filename} in ${duration.toFixed(4)}s`);
        return {
            ...res,
            telemetry: ["telemetry", "log_performance", "winston", "logger"].some(kw => content.includes(kw))
        };
    }

    mapComponentType(relPath: string): string {
        try {
            return this.classifier.mapType(relPath);
        } catch (error) {
            logger.error(`❌ [StructuralAnalyst] Failed to map component type for ${relPath}: ${error}`);
            return 'unknown';
        }
    }

    shouldIgnore(path: Path): boolean {
        return AnalysisPolicy.shouldIgnore(path);
    }

    isAnalyable(path: Path): boolean {
        return AnalysisPolicy.isAnalyable(path);
    }

    async readProjectFile(path: string): Promise<string | null> {
        try {
            return await Bun.file(path).text();
        } catch (error) {
            logger.error(`❌ [StructuralAnalyst] Failed to read file ${path}: ${error}`);
            return null;
        }
    }

    calculateMaturity(content: string, stack: string): any {
        try {
            return this.maturityEvaluator.calculateMaturity(content, stack);
        } catch (error) {
            logger.error(`❌ [StructuralAnalyst] Failed to calculate maturity: ${error}`);
            return null;
        }
    }

    /**
     * 🧠 Analisa falhas lógicas profundas (Wrapper LogicAuditor).
     */
    analyze_logic_flaws(content: string, filename: string): any[] {
        if (!this.logicAuditor) return [];

        try {
            const ts = require("typescript");
            const sourceFile = ts.createSourceFile(filename, content, ts.ScriptTarget.Latest, true);
            return this.logicAuditor.constructor.scanFile(sourceFile);
        } catch (error) {
            logger.error(`❌ [StructuralAnalyst] Failed to analyze logic flaws in ${filename}: ${error}`);
            return [{
                file: filename,
                line: 1,
                issue: `Falha na análise lógica (AST): ${error}`,
                severity: "HIGH",
                category: "Analysis",
                context: "StructuralAnalyst"
            }];
        }
    }

    /**
     * 🏗️ Mapeia a lógica do arquivo (AST Simplificado).
     */
    analyze_file_logic(content: string, filename: string): any {
        try {
            return this.parser.analyze_file_logic(content, filename);
        } catch (error) {
            logger.error(`❌ [StructuralAnalyst] Failed to analyze file logic in ${filename}: ${error}`);
            return { complexity: 1, dependencies: [] };
        }
    }

    /** Parity: analyze_intent — Classifies the primary intent of a file (logic, metadata, observability). */
    analyze_intent(content: string, filename: string): string {
        return IntentClassifier.classify(content, filename);
    }
}

