import winston from "winston";
import { Path } from "../core/path_utils.ts";
import { StructuralAnalyst } from "./Support/structural_analyst.ts";
import { ContextIterator } from "../utils/context_iterator.ts";

const logger = winston.child({ module: "BaseActivePersona" });

/**
 * Base PhD Soberana (Bun Version).
 */
export abstract class BaseActivePersona {
    projectRoot: string | null;
    name: string = "Base";
    emoji: string = "👤";
    role: string = "Generalist";
    stack: string = "Universal";
    contextData: Record<string, any> = {};
    projectDna: any = {};
    ignoredFiles: string[] = ['auto_healing_mission.md', 'strategic_mission.txt'];

    structuralAnalyst: StructuralAnalyst;
    integrityGuardian: any;
    cognitive: any;
    maturityEvaluator: any;

    constructor(projectRoot: string | null = null) {
        this.projectRoot = projectRoot;
        this.structuralAnalyst = new StructuralAnalyst();
        this.integrityGuardian = this.structuralAnalyst.integrityGuardian;
        // Mocking cognitive engine and maturity evaluator
        this.cognitive = { reason: (p: string) => null };
        this.maturityEvaluator = this.structuralAnalyst.maturityEvaluator;
    }

    setContext(contextData: any) {
        this.projectDna = contextData.identity || {};
        this.contextData = contextData.map || {};
    }

    async performStrategicAudit(options: { objective?: string; fileTarget?: string; contentTarget?: string } = {}): Promise<any[]> {
        if (options.fileTarget && options.contentTarget) {
            const res = await this.reasonAboutObjective(options.objective || "Verificação", options.fileTarget, options.contentTarget);
            return res ? [res] : [];
        }

        const obj = this.integrityGuardian.getAuditMission(this.projectDna, options.objective);
        const strategicIssues: any[] = [];

        const iterator = new ContextIterator(this.projectRoot, this.contextData, {
            integrityGuardian: this.integrityGuardian,
            ignoredFiles: this.ignoredFiles,
            stack: this.stack
        });

        for await (const [file, content] of iterator.iterAuditableFiles()) {
            const res = await this.reasonAboutObjective(obj, file, content);
            if (res) strategicIssues.push(res);
        }
        return strategicIssues;
    }

    async readProjectFile(relPath: string): Promise<string | null> {
        if (!this.projectRoot) return null;
        const absPath = new Path(this.projectRoot).join(relPath);
        try {
            return await Bun.file(absPath.toString()).text();
        } catch (e) {
            logger.warn(`⚠️ Falha na leitura do arquivo ${relPath}: ${e}`);
            return null;
        }
    }

    abstract performAudit(): Promise<any[]>;
    abstract reasonAboutObjective(objective: string, file: string, content: string): Promise<any>;
    abstract getSystemPrompt(): string;
}
