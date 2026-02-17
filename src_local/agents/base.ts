/**
 * BaseActivePersona - Base PhD Soberana
 * 
 * Classe abstrata que coordena todos os agentes de linguagem.
 * Cada agente especializado herda desta base e implementa:
 * - perform_audit(): Auditoria com regras específicas do domínio
 * - reasonAboutObjective(): Raciocínio contextual sobre findings
 * - getSystemPrompt(): Identidade de persona para interação LLM
 */
import winston from "winston";
import * as path from "node:path";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { InfrastructureAssembler } from "./Support/Automation/infrastructure_assembler.ts";

const logger = winston.child({ module: "BaseActivePersona" });

export interface AuditRule {
    regex: RegExp;
    issue: string;
    severity: "critical" | "high" | "medium" | "low";
}

export interface AuditFinding {
    file: string;
    agent: string;
    role: string;
    emoji: string;
    issue: string;
    severity: string;
    stack: string;
}

export interface StrategicFinding {
    file: string;
    issue: string;
    severity: string;
    context: string;
    objective?: string;
    analysis?: string;
    recommendation?: string;
}

export abstract class BaseActivePersona {
    name: string = "Base";
    emoji: string = "👤";
    role: string = "Generalist";
    stack: string = "Universal";

    projectRoot: string | null = null;
    contextData: Record<string, any> = {};
    projectDna: Record<string, any> = {};
    ignoredFiles: string[] = ["auto_healing_mission.md", "strategic_mission.txt"];

    // Support Tools (Neural Bridge)
    protected auditEngine: any;
    protected structuralAnalyst: any;
    protected integrityGuardian: any;
    protected cognitive: any;
    protected maturityEvaluator: any;

    private auditStartTime: number = 0;

    constructor(projectRoot?: string) {
        this.projectRoot = projectRoot || null;
    }

    /** Define o contexto do projeto (identity + map). */
    setContext(contextData: Record<string, any>): void {
        this.projectDna = contextData.identity || {};
        this.contextData = contextData.map || {};
    }

    /**
     * Auditoria Estratégica: Itera sobre arquivos do contexto e aplica
     * o raciocínio contextual de cada agente.
     */
    performStrategicAudit(objective?: string, fileTarget?: string, contentTarget?: string): (StrategicFinding | string | null)[] {
        if (fileTarget && contentTarget) {
            const res = this.reasonAboutObjective(objective || "Verificação", fileTarget, contentTarget);
            return res ? [res] : [];
        }

        const obj = objective || "Orquestração de Inteligência Artificial";
        const strategicIssues: any[] = [];

        for (const [file, data] of Object.entries(this.contextData)) {
            if (this.ignoredFiles.includes(path.basename(file))) continue;
            if (data.component_type === "TEST") continue;

            const content = data.content || this.readProjectFile(file);
            if (!content) continue;

            const res = this.reasonAboutObjective(obj, file, content);
            if (res) strategicIssues.push(res);
        }
        return strategicIssues;
    }

    /**
     * Busca padrões nos arquivos do contexto usando as regras de auditoria.
     */
    findPatterns(extensions: string[], rules: AuditRule[]): AuditFinding[] {
        const findings: AuditFinding[] = [];

        for (const [file, data] of Object.entries(this.contextData)) {
            if (!extensions.some(ext => file.endsWith(ext))) continue;
            if (this.ignoredFiles.includes(path.basename(file))) continue;
            if (data.component_type === "TEST") continue;

            const content = data.content || this.readProjectFile(file);
            if (!content) continue;

            for (const rule of rules) {
                if (rule.regex.test(content)) {
                    findings.push({
                        file,
                        agent: this.name,
                        role: this.role,
                        emoji: this.emoji,
                        issue: rule.issue,
                        severity: rule.severity,
                        stack: this.stack
                    });
                }
            }
        }
        return findings;
    }

    /** Lê arquivo do projeto com encoding UTF-8. */
    async readProjectFile(relPath: string): Promise<string | null> {
        if (!this.projectRoot) return null;
        const absPath = path.join(this.projectRoot, relPath);
        try {
            return await readFile(absPath, "utf-8");
        } catch (e: any) {
            logger.warn(`⚠️ Falha na leitura: ${relPath}: ${e.message}`);
            return null;
        }
    }

    /**
     * Inicia a captura de métricas de performance.
     */
    protected startMetrics(): void {
        this.auditStartTime = Date.now();
    }

    /**
     * Finaliza a captura de métricas e registra o log.
     */
    protected endMetrics(count: number): void {
        const elapsed = Date.now() - this.auditStartTime;
        logger.info(`${this.emoji} [${this.name}] Auditoria: ${count} pontos (${elapsed}ms)`);
    }

    /** Log de performance (Legacy manual). */
    protected logPerformance(startTime: number, count: number): void {
        const elapsed = Date.now() - startTime;
        logger.info(`${this.emoji} [${this.name}] Auditoria: ${count} pontos (${elapsed}ms)`);
    }

    /**
     * 🧠 Auto-Awareness: O próprio agente valida sua integridade técnica.
     * Pode ser expandido para validar paridade com o legado.
     */
    public selfDiagnostic(): { status: string; score: number; issues: string[] } {
        const issues: string[] = [];
        if (this.name === "Base") issues.push("Agent name not customized.");
        if (this.emoji === "👤") issues.push("Agent emoji not customized.");

        // Verificação básica de métodos obrigatórios
        if (!this.getSystemPrompt() || this.getSystemPrompt().length < 10) issues.push("System prompt too short or empty.");

        return {
            status: issues.length === 0 ? "HEALTHY" : "DEGRADED",
            score: 100 - (issues.length * 10),
            issues
        };
    }

    // ─── Métodos Abstratos ───────────────────────────────────────

    /** Auditoria técnica com regras regex específicas do domínio. */
    abstract performAudit(): AuditFinding[];

    /** Raciocínio contextual: analisa um finding à luz do objective estratégico. */
    abstract reasonAboutObjective(objective: string, file: string, content: string): StrategicFinding | string | null;

    /** Identidade de persona para interação com LLM. */
    abstract getSystemPrompt(): string;

    /** v7.3: Parity Restoration */
    protected _initializeSupportTools() {
        if (!this.projectRoot) return;

        logger.info(`🛠️ [${this.name}] Inicializando ferramentas de suporte (Via Assembler)...`);

        try {
            const support = InfrastructureAssembler.assembleCoreSupport(this.projectRoot);
            const tools = InfrastructureAssembler.assembleOrchestratorTools(this.projectRoot);

            this.auditEngine = support.auditEngine;
            this.structuralAnalyst = support.analyst;
            this.integrityGuardian = support.guardian;

            // Cognitive Engine might be lazy loaded or part of tools
            // For now, we link what we have
            this.maturityEvaluator = tools.maturity;

            logger.info(`✅ [${this.name}] Neural Bridge Ativa: Audit, Analyst, Guardian, Maturity.`);
        } catch (e: any) {
            logger.error(`❌ [${this.name}] Falha na ponte neural: ${e.message}`);
        }
    }

    public analyzeLogic(filePath: string) {
        if (this.structuralAnalyst && this.projectRoot) {
            return this.structuralAnalyst.analyzeFileLogic(filePath, this.projectRoot, this.ignoredFiles, this.name);
        }
        logger.warn(`⚠️ [${this.name}] StructuralAnalyst inativo. Retornando auditoria padrão.`);
        return this.performAudit();
    }

    public getMaturityMetrics() {
        if (this.maturityEvaluator && this.projectRoot) {
            return this.maturityEvaluator.evaluatePersona(this.projectRoot, this.stack, this.name);
        }
        return { score: 0, status: "DISCONNECTED" };
    }

    public reason(objective: string, file: string, content: string) {
        return this.reasonAboutObjective(objective, file, content);
    }

    /**
     * Protótipo de cura ativa: o agente pode sugerir correções automáticas.
     * @param blindSpots Lista de arquivos ou áreas que precisam de atenção.
     */
    public performActiveHealing(blindSpots: string[]): void {
        // Implementação padrão vazia; herdeiros específicos podem implementar lógica de cura.
    }
}
