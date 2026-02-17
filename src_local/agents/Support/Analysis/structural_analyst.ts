import winston from "winston";
import { Path } from "../../../core/path_utils.ts";
import { MaturityEvaluator } from "./../Diagnostics/maturity_evaluator.ts";
import { SourceCodeParser } from "./source_code_parser.ts";
import { ComponentClassifier } from "./component_classifier.ts";
import { IntegrityGuardian } from "./../Core/integrity_guardian.ts";

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
        const res = this.analyzeRaw(content, filename);

        const duration = (Date.now() - startT) / 1000;
        logger.debug(`⏱️ [StructuralAnalyst] Decomposição ${filename} in ${duration.toFixed(4)}s`);
        return res;
    }

    private analyzeRaw(content: string, filename: string): FileAnalysis {
        if (!filename.endsWith('.py')) {
            return { complexity: 1, dependencies: [] };
        }

        try {
            const d = this.parser.analyzePy(content);
            if (!d.tree) {
                return { complexity: 1, dependencies: [] };
            }

            return {
                complexity: this.parser.calculatePyComplexity(content),
                dependencies: this.parser.extractPyImports(content),
                functions: d.functions,
                classes: d.classes,
                telemetry: ["telemetry", "log_performance", "winston", "logger"].some(kw => content.includes(kw))
            };
        } catch (error) {
            logger.error(`❌ [StructuralAnalyst] Failed to analyze ${filename}: ${error}`);
            return { complexity: 1, dependencies: [] };
        }
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
        const pathStr = path.toString().replace(/\\/g, "/").toLowerCase();

        // Bloqueio cirúrgico para infraestrutura .agent
        if (pathStr.includes("/.agent/") || pathStr.startsWith(".agent/")) {
            // Só permitimos se pertencer à skill autorizada
            if (pathStr.includes("fast-android-build")) return false;
            return true;
        }

        const ignored = new Set(['.git', '__pycache__', 'build', 'node_modules', '.venv', '.gemini', '.idea', '.vscode', 'dist', 'out']);
        return Array.from(ignored).some(p => pathStr.includes(`/${p}/`) || pathStr.endsWith(`/${p}`));
    }

    isAnalyable(path: Path): boolean {
        const name = path.name();
        return (name.endsWith('.py') || name.endsWith('.ts') || name.endsWith('.tsx') || name.endsWith('.js') || name.endsWith('.yaml'));
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
            return [];
        }
    }

    /**
     * 🏗️ Mapeia a lógica do arquivo (AST Simplificado).
     */
    analyze_file_logic(content: string, filename: string): any {
        try {
            if (filename.endsWith('.py')) {
                return this.analyzeRaw(content, filename);
            }
            // For TS/JS, use SourceCodeParser if available/extended or return parser result
            return this.parser.analyzeTs(content);
        } catch (error) {
            logger.error(`❌ [StructuralAnalyst] Failed to analyze file logic in ${filename}: ${error}`);
            return { complexity: 1, dependencies: [] };
        }
    }

    /** Parity: analyze_intent — Classifies the primary intent of a file (logic, metadata, observability). */
    analyze_intent(content: string, filename: string): string {
        if (/export\s+(type|interface|enum)\s+/.test(content)) return "METADATA";
        if (/logger\.(info|warn|error|debug)/.test(content)) return "OBSERVABILITY";
        return "LOGIC";
    }
}

