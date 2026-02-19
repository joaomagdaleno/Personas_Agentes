/**
 * BaseActivePersona - Base PhD Soberana
 */
import winston from "winston";
import * as path from "node:path";
import { readFile } from "node:fs/promises";
import { InfrastructureAssembler } from "./Support/Automation/infrastructure_assembler.ts";
import { PatternFinder } from "./strategies/PatternFinder.ts";
import { Diagnostician } from "./strategies/Diagnostician.ts";

const logger = winston.child({ module: "BaseActivePersona" });

export interface AuditRule { regex: RegExp; issue: string; severity: "critical" | "high" | "medium" | "low"; }
export interface AuditFinding { file: string; agent: string; role: string; emoji: string; issue: string; severity: string; stack: string; }
export interface StrategicFinding { file: string; issue: string; severity: string; context: string; objective?: string; analysis?: string; recommendation?: string; }

export abstract class BaseActivePersona {
    name: string = "Base"; emoji: string = "👤"; role: string = "Generalist"; stack: string = "Universal";
    projectRoot: string | null = null; contextData: Record<string, any> = {}; projectDna: Record<string, any> = {};
    ignoredFiles: string[] = ["auto_healing_mission.md", "strategic_mission.txt"];
    protected auditEngine: any; protected structuralAnalyst: any; protected integrityGuardian: any;
    protected cognitive: any; protected maturityEvaluator: any;
    private auditStartTime: number = 0;

    constructor(projectRoot?: string) { this.projectRoot = projectRoot || null; }

    setContext(contextData: Record<string, any>): void {
        this.projectDna = contextData.identity || {};
        this.contextData = contextData.map || {};
    }

    performStrategicAudit(objective?: string, fileTarget?: string, contentTarget?: string): (StrategicFinding | string | null)[] {
        if (fileTarget && contentTarget) return [this.reasonAboutObjective(objective || "Verificação", fileTarget, contentTarget)].filter(Boolean);
        const obj = objective || "Orquestração de Inteligência Artificial";
        return Object.entries(this.contextData)
            .filter(([file, data]) => !this.ignoredFiles.includes(path.basename(file)) && data.component_type !== "TEST")
            .map(([file, data]) => this.reasonAboutObjective(obj, file, data.content || this.readProjectFile(file)))
            .filter(Boolean);
    }

    findPatterns(extensions: string[], rules: AuditRule[]): AuditFinding[] {
        return PatternFinder.find(this.contextData, extensions, rules, this.ignoredFiles, this);
    }

    async readProjectFile(relPath: string): Promise<string | null> {
        if (!this.projectRoot) return null;
        try { return await readFile(path.join(this.projectRoot, relPath), "utf-8"); }
        catch (e: any) { logger.warn(`⚠️ Falha na leitura: ${relPath}: ${e.message}`); return null; }
    }

    protected startMetrics(): void { this.auditStartTime = Date.now(); }
    protected endMetrics(count: number): void { logger.info(`${this.emoji} [${this.name}] Auditoria: ${count} pontos (${Date.now() - this.auditStartTime}ms)`); }
    protected logPerformance(startTime: number, count: number): void { logger.info(`${this.emoji} [${this.name}] Auditoria: ${count} pontos (${Date.now() - startTime}ms)`); }

    public selfDiagnostic(): { status: string; score: number; issues: string[] } {
        return Diagnostician.diagnose(this.name, this.emoji, this.getSystemPrompt());
    }

    abstract performAudit(): AuditFinding[];
    abstract reasonAboutObjective(objective: string, file: string, content: string): StrategicFinding | string | null;
    abstract getSystemPrompt(): string;

    protected _initializeSupportTools() {
        if (!this.projectRoot) return;
        try {
            const support = InfrastructureAssembler.assembleCoreSupport(this.projectRoot);
            const tools = InfrastructureAssembler.assembleOrchestratorTools(this.projectRoot);
            this.auditEngine = support.auditEngine; this.structuralAnalyst = support.analyst;
            this.integrityGuardian = support.guardian; this.maturityEvaluator = tools.maturity;
            logger.info(`✅ [${this.name}] Neural Bridge Ativa.`);
        } catch (e: any) { logger.error(`❌ [${this.name}] Falha na ponte neural: ${e.message}`); }
    }

    public analyzeLogic(filePath: string) {
        return (this.structuralAnalyst && this.projectRoot) ? this.structuralAnalyst.analyzeFileLogic(filePath, this.projectRoot, this.ignoredFiles, this.name) : this.performAudit();
    }

    public getMaturityMetrics() { return (this.maturityEvaluator && this.projectRoot) ? this.maturityEvaluator.evaluatePersona(this.projectRoot, this.stack, this.name) : { score: 0, status: "DISCONNECTED" }; }
    public reason(objective: string, file: string, content: string) { return this.reasonAboutObjective(objective, file, content); }
    public performActiveHealing(blindSpots: string[]): void { }
}
