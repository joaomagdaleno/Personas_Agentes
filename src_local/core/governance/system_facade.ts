import winston from "winston";
import type { ComplianceLevel, CompliancePolicy, HealthScore, VetoReason } from "./policy_definitions.ts";
import { POLICIES } from "./policy_definitions.ts";
import { ScoringEngine } from "./scoring_engine.ts";
import { AnalysisEngine } from "./analysis_engine.ts";
import { VetoEngine } from "./veto_engine.ts";
import { ReflexEngine } from "./reflex_engine.ts";
import { ConflictEngine } from "./conflict_engine.ts";
import { TopologyEngine } from "./topology_engine.ts";
import { ResourceEngine } from "./resource_engine.ts";

const logger = winston.child({ module: "PhdGovernanceSystem" });

/**
 * 🎓 PhD Governance System (High-Fidelity Sovereign Facade).
 * Orchestrates specialized engines to maintain system integrity.
 * Complexity: < 15 (Facade Pattern)
 */
export class PhdGovernanceSystem {
    private static instance: PhdGovernanceSystem | null = null;
    private scoring = new ScoringEngine();
    private veto = new VetoEngine();
    private reflex = new ReflexEngine();
    private conflict = new ConflictEngine();
    private topology = new TopologyEngine();
    private analysis = new AnalysisEngine();
    private resource = new ResourceEngine();

    private constructor() {}

    public static getInstance(): PhdGovernanceSystem {
        if (!PhdGovernanceSystem.instance) {
            PhdGovernanceSystem.instance = new PhdGovernanceSystem();
        }
        return PhdGovernanceSystem.instance;
    }

    /**
     * Calcula o score de saúde sistêmica.
     */
    public calculateHealth(data: {
        files: Record<string, any>;
        alerts: any[];
        totalFiles: number;
        avgComplexity: number;
    }): HealthScore {
        return this.scoring.calculateHealth(data);
    }

    /**
     * Determina se um caminho deve ser vetado.
     */
    public shouldVeto(relPath: string): { veto: boolean; reason?: VetoReason; justification?: string } {
        return this.veto.shouldVeto(relPath);
    }

    /**
     * Heurística para matemática técnica.
     */
    public isTechnicalMath(lineContent: string, issue: string): boolean {
        return this.veto.isTechnicalMath(lineContent, issue);
    }

    /**
     * Heurística para definições de regras.
     */
    public isRuleDefinition(lineContent: string): boolean {
        return this.veto.isRuleDefinition(lineContent);
    }

    /**
     * Gatilho de Reflexos Sistêmicos.
     */
    public triggerReflexes(health: HealthScore, personas: any[]): void {
        this.reflex.triggerReflexes(health, personas);
    }

    /**
     * Resolução Forense de Conflitos.
     */
    public resolveMergeConflict(file: string, isProtected: boolean): "OURS" | "THEIRS" | "MANUAL" | "CLEANUP" {
        return this.conflict.resolveMergeConflict(file, isProtected);
    }

    /**
     * Mapeia Topologia Ativa.
     */
    public getActiveTopology(cwd: string): { branch: string, tracking: string, isHealthy: boolean, remoteDelta: number } {
        return this.topology.getActiveTopology(cwd);
    }

    /**
     * Analisa Profundidade de Teste.
     */
    public analyzeTestQuality(content: string): { assertions: number; quality: "DEEP" | "SHALLOW" | "NONE" } {
        return this.analysis.analyzeTestQuality(content);
    }

    /**
     * Perfil estático de Recursos baseado em limites fixos.
     */
    public getResourceProfile(cores: number, ramGb: number): { profile: string, parallelism: number, throttle: boolean } {
        return this.resource.getResourceProfile(cores, ramGb);
    }

    /**
     * Coleta telemetria em tempo real do sistema hospedeiro (RAM/CPU).
     */
    public getCurrentLoad(): { freeMemoryGb: number; totalMemoryGb: number; loadAvg: number[]; cpuCores: number } {
        return this.resource.getCurrentLoad();
    }

    /**
     * Determina se a máquina anfitriã está esgotando CPU ou RAM crítica (<1.5GB livre).
     */
    public isSystemOverloaded(): { overloaded: boolean; reason?: string } {
        return this.resource.isSystemOverloaded();
    }

    /**
     * Escala adaptativa de threads. Recua a aceleração se o PC estiver sufocando.
     */
    public getDynamicConcurrency(baseConcurrency: number): number {
        return this.resource.getDynamicConcurrency(baseConcurrency);
    }

    public getDirectives(level: ComplianceLevel): string[] {
        return POLICIES[level].directives;
    }

    public getPolicy(level: ComplianceLevel): CompliancePolicy {
        return POLICIES[level];
    }
}
