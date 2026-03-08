import winston from "winston";
import * as path from "node:path";
import { readFile } from "node:fs/promises";
import { PatternFinder } from "./strategies/PatternFinder.ts";
import { Diagnostician } from "./strategies/Diagnostician.ts";
import { BaseHelpers } from "./BaseHelpers.ts";

export interface AuditRule { regex: RegExp; issue: string; severity: "critical" | "high" | "medium" | "low"; }
export interface AuditFinding { file: string; agent: string; role: string; emoji: string; issue: string; severity: string; stack: string; }
export interface StrategicFinding { file: string; issue: string; severity: string; context: string; objective?: string; analysis?: string; recommendation?: string; }

const logger = winston.child({ module: "BaseActivePersona" });

export abstract class BaseActivePersona {
    name: string = "Base"; emoji: string = "👤"; role: string = "Generalist"; stack: string = "Universal";
    projectRoot: string | null = null; contextData: Record<string, any> = {}; projectDna: Record<string, any> = {};
    ignoredFiles: string[] = ["auto_healing_mission.md", "strategic_mission.txt"];
    auditEngine: any; structuralAnalyst: any; integrityGuardian: any;
    maturityEvaluator: any; cognitive: any; patternFinder!: PatternFinder;
    private auditStartTime: number = 0;

    constructor(projectRoot?: string) { this.projectRoot = projectRoot || null; }

    setContext(data: any): void {
        this.projectDna = data.identity || {};
        this.contextData = data.map || {};
    }

    performStrategicAudit(obj?: string, fl?: string, ct?: string): (StrategicFinding | string | null)[] {
        if (fl && ct) {
            return [this.reasonAboutObjective(obj || "Verificação", fl, ct)].filter(Boolean);
        }

        const mission = obj || "Orquestração de Inteligência Artificial";
        return Object.entries(this.contextData)
            .filter(([f, d]) => this.isAuditable(f, d))
            .map(([f, d]) => this.reasonAboutObjective(mission, f, d.content || this.readProjectFile(f)))
            .filter(Boolean);
    }

    private isAuditable(f: string, d: any): boolean {
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

    protected startMetrics(): void { this.auditStartTime = Date.now(); }

    protected endMetrics(cnt: number): void {
        const duration = Date.now() - this.auditStartTime;
        logger.info(`${this.emoji} [${this.name}] Finalizado: ${cnt} pts (${duration}ms)`);
    }

    public selfDiagnostic(): any {
        return Diagnostician.diagnose(this.name, this.emoji, this.getSystemPrompt());
    }

    abstract performAudit(): Promise<AuditFinding[]>;
    abstract reasonAboutObjective(obj: string, f: string, c: string | Promise<string | null>): StrategicFinding | string | null;
    abstract getSystemPrompt(): string;

    protected _initializeSupportTools() {
        BaseHelpers.initializeTools(this, this.projectRoot);
    }

    public performActiveHealing(blindSpots: string[]): void {
        logger.info(`🛠️ [${this.name}] Iniciando protocolo de cura ativa para ${blindSpots.length} pontos.`);
    }

    public analyzeLogic(f: string) {
        if (this.structuralAnalyst && this.projectRoot) {
            return this.structuralAnalyst.analyzeFileLogic(f, this.projectRoot, this.ignoredFiles, this.name);
        }
        return this.performAudit();
    }

    public getMaturityMetrics() {
        if (this.maturityEvaluator && this.projectRoot) {
            return this.maturityEvaluator.evaluatePersona(this.projectRoot, this.stack, this.name);
        }
        return { score: 0, status: "OFFLINE" };
    }
}
