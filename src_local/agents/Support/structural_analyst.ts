import winston from "winston";
import { Path } from "../../core/path_utils.ts";
import { MaturityEvaluator } from "./maturity_evaluator.ts";
import { SourceCodeParser } from "./source_code_parser.ts";
import { ComponentClassifier } from "./component_classifier.ts";
import { IntegrityGuardian } from "./integrity_guardian.ts";

const logger = winston.child({ module: "StructuralAnalyst" });

/**
 * 🏗️ Analista Estrutural PhD (Bun Version).
 */
export class StructuralAnalyst {
    maturityEvaluator: MaturityEvaluator;
    parser: SourceCodeParser;
    classifier: ComponentClassifier;
    integrityGuardian: IntegrityGuardian;
    logicAuditor: any;
    inspector: any;

    constructor() {
        this.maturityEvaluator = new MaturityEvaluator();
        this.parser = new SourceCodeParser();
        this.classifier = new ComponentClassifier();
        this.integrityGuardian = new IntegrityGuardian();
        // Placeholders for complex agents
        this.logicAuditor = { scanFlaws: () => [] };
        this.inspector = { scanFileLogic: () => [] };
    }

    analyzePython(content: string, filename: string): any {
        const startT = Date.now();
        const res = this.analyzeRaw(content, filename);

        const duration = (Date.now() - startT) / 1000;
        logger.debug(`⏱️ [StructuralAnalyst] Decomposição ${filename} in ${duration.toFixed(4)}s`);
        return res;
    }

    private analyzeRaw(content: string, filename: string): any {
        if (!filename.endsWith('.py')) return { complexity: 1, dependencies: [] };

        const d = this.parser.analyzePy(content);
        if (!d.tree) return { complexity: 1, dependencies: [] };

        return {
            complexity: this.parser.calculatePyComplexity(content),
            dependencies: this.parser.extractPyImports(content),
            functions: d.functions,
            classes: d.classes,
            telemetry: ["telemetry", "log_performance", "winston", "logger"].some(kw => content.includes(kw))
        };
    }

    mapComponentType(relPath: string): string {
        return this.classifier.mapType(relPath);
    }

    shouldIgnore(path: Path): boolean {
        const ignored = new Set(['.git', '__pycache__', 'build', 'node_modules', '.venv', '.agent', '.gemini']);
        const pathStr = path.toString().replace(/\\/g, "/");
        return Array.from(ignored).some(p => pathStr.includes(`/${p}/`) || pathStr.endsWith(`/${p}`));
    }

    isAnalyable(path: Path): boolean {
        const name = path.name();
        return (name.endsWith('.py') || name.endsWith('.dart') || name.endsWith('.kt') || name.endsWith('.yaml'));
    }

    async readProjectFile(path: string): Promise<string | null> {
        try {
            return await Bun.file(path).text();
        } catch {
            return null;
        }
    }

    calculateMaturity(content: string, stack: string): any {
        return this.maturityEvaluator.calculateMaturity(content, stack);
    }
}
