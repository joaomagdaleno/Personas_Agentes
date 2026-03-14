import winston from "winston";
import * as path from "node:path";
import { readFile } from "node:fs/promises";
import { PatternFinder } from "./strategies/PatternFinder.ts";
import { Diagnostician } from "./strategies/Diagnostician.ts";
import { BaseHelpers } from "./BaseHelpers.ts";
import { StructuralAnalyst } from "./Support/Analysis/structural_analyst.ts";
import { IntegrityGuardian } from "./Support/Core/integrity_guardian.ts";
import { MaturityEvaluator } from "./Support/Diagnostics/maturity_evaluator.ts";
import { AuditEngine } from "../core/audit_engine.ts";
import { HubManagerGRPC } from "../core/hub_manager_grpc.ts";
import type { 
    IAgent, 
    ISupportableAgent,
    ProjectContext, 
    FileContextData, 
    AuditRule, 
    AuditFinding, 
    StrategicFinding 
} from "../core/types.ts";

export type { 
    IAgent, 
    ProjectContext, 
    FileContextData, 
    AuditRule, 
    AuditFinding, 
    StrategicFinding 
};

const logger = winston.child({ module: "BaseActivePersona" });

/**
 * 👤 BaseActivePersona — Foundational class for all analytical agents.
 */
export abstract class BaseActivePersona implements ISupportableAgent {
    id: string = "base_agent"; 
    category: string = "General";
    name: string = "Base"; 
    emoji: string = "👤"; 
    role: string = "Generalist"; 
    stack: string = "Universal";
    public phd_identity: string = "";
    public healingPrompt: string = "";
    protected projectRoot: string | undefined = undefined; 
    contextData: Record<string, FileContextData> = {}; 
    projectDna: Record<string, any> = {};
    
    ignoredFiles: string[] = ["auto_healing_mission.md", "strategic_mission.txt"];
    
    auditEngine?: AuditEngine; 
    structuralAnalyst?: StructuralAnalyst; 
    integrityGuardian?: IntegrityGuardian;
    maturityEvaluator?: MaturityEvaluator; 
    cognitive?: any; // To be typed if needed
    patternFinder!: PatternFinder;
    
    protected hub: HubManagerGRPC | null = null;
    private auditStartTime: number = 0;

    constructor(projectRoot?: string) { 
        this.projectRoot = projectRoot; 
    }

    /**
     * Standard implementation of IAgent.execute.
     */
    async execute(context: ProjectContext): Promise<AuditFinding[] | StrategicFinding[] | any> {
        this.setContext(context);
        return await this.performAudit();
    }

    /**
     * Sets the operational project context for the persona.
     */
    setContext(data: ProjectContext): void {
        this.projectDna = (data.identity?.dna as Record<string, any>) || {};
        this.contextData = data.map || {};
        this.hub = data.hub || null;
    }

    /**
     * Strategic reasoning engine loop.
     */
    public async performStrategicAudit(obj?: string, fl?: string, ct?: string): Promise<(StrategicFinding | string | null)[]> {
        if (fl && ct) {
            const res = await this.reasonAboutObjective(obj || "Verificação", fl, ct);
            return [res].filter(Boolean);
        }

        const mission = obj || "Orquestração de Inteligência Artificial";
        const results = await Promise.all(
            Object.entries(this.contextData)
                .filter(([f, d]) => this.isAuditable(f, d))
                .map(([f, d]) => this.reasonAboutObjective(mission, f, d.content || (this.readProjectFile(f) as any)))
        );
        return results.filter(Boolean);
    }

    private isAuditable(f: string, d: FileContextData): boolean {
        const isTest = d.component_type === "TEST";
        const isIgnored = this.ignoredFiles.includes(path.basename(f));
        return !isTest && !isIgnored;
    }

    async findPatterns(ext: string[], rules: AuditRule[]): Promise<AuditFinding[]> {
        if (!this.patternFinder) return [];
        return await this.patternFinder.find(this.contextData, ext, rules, this.ignoredFiles, this);
    }

    async readProjectFile(rel: string): Promise<string | null> {
        if (!this.projectRoot) return null;
        try {
            const fullPath = path.join(this.projectRoot, rel);
            return await readFile(fullPath, "utf-8");
        } catch (e: any) {
            logger.warn(`⚠️ Erro ao ler: ${rel}: ${e.message}`);
            return null;
        }
    }

    /**
     * Delegates auditing to the Hub PhD reasoning engine.
     */
    async delegateAuditToHub(fileRelPath: string): Promise<AuditFinding[]> {
        if (!this.hub) return [];
        
        let content: string | null = null;
        if (this.contextData[fileRelPath]) {
            content = this.contextData[fileRelPath].content || null;
        }

        if (!content) {
            content = await this.readProjectFile(fileRelPath);
        }

        if (!content) return [];
        
        return await this.hub.analyzeCode(content, this.id, this.stack);
    }

    protected startMetrics(): void { this.auditStartTime = Date.now(); }

    protected endMetrics(cnt: number): void {
        const duration = Date.now() - this.auditStartTime;
        logger.info(`${this.emoji} [${this.name}] Finalizado: ${cnt} pts (${duration}ms)`);
    }

    public selfDiagnostic(): Record<string, any> {
        return Diagnostician.diagnose(this.name, this.emoji, this.getSystemPrompt());
    }

    public async reasonAboutObjective(objective: string, file: string, context: string): Promise<StrategicFinding | null> {
        if (this.hub) {
            const prompt = `Persona: ${this.name}\nPhD Identity: ${this.phd_identity}\nObjective: ${objective}\nContext: ${context}`;
            const answer = await this.hub.reason(prompt);
            if (answer) {
                return {
                    file,
                    severity: "INFO",
                    issue: answer,
                    context: objective
                };
            }
        }
        
        return {
            file, 
            severity: "INFO",
            issue: `PhD ${this.name} (${this.stack}): Analisando '${objective}' em '${file}' com rigor acadêmico.`,
            context: "analyzing objective"
        };
    }

    abstract getSystemPrompt(): string;

    protected _initializeSupportTools() {
        BaseHelpers.initializeTools(this, this.projectRoot);
    }

    public performActiveHealing(blindSpots: string[]): void {
        logger.info(`🛠️ [${this.name}] Iniciando protocolo de cura ativa para ${blindSpots.length} pontos.`);
    }

    /**
     * Delegates a code correction task to the Hub's PhD reasoning engine.
     */
    public async delegateHealingToHub(file: string, issue: string): Promise<string | null> {
        if (this.hub && this.projectRoot) {
            const content = await this.readProjectFile(file);
            if (!content) return null;

            return await this.hub.executeHealing({
                filePath: file,
                issueDescription: issue,
                fileContent: content,
                context: `PhD Persona: ${this.id}\nGuidelines: ${this.healingPrompt}`
            });
        }
        return null;
    }

    public async analyzeLogic(f: string) {
        if (this.structuralAnalyst && this.projectRoot) {
            const content = await this.readProjectFile(f);
            if (!content) return null;
            return await this.structuralAnalyst.analyze_file_logic(content, f);
        }
        return await this.performAudit();
    }

    public async getMaturityMetrics() {
        if (this.maturityEvaluator && this.projectRoot) {
            return await this.maturityEvaluator.evaluatePersona(this.projectRoot, this.stack, this.name);
        }
        return { score: 0, status: "OFFLINE" };
    }

    /**
     * Define as extensões e regras para auditoria de padrões via RegexSet (Rust).
     */
    abstract getAuditRules(): { extensions: string[]; rules: AuditRule[] };

    /**
     * Auditoria padronizada utilizando o motor de alta performance.
     */
    async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const { extensions, rules } = this.getAuditRules();
        const results = await this.findPatterns(extensions, rules);
        this.endMetrics(results.length);
        return results;
    }
}
