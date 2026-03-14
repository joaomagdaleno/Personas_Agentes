/**
 * 🏰 Shared Kernel: Sovereign Architectural Types
 * This file defines the rigid contracts for the Modular Monolith.
 */

export type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";

export interface AuditRule {
    regex: RegExp | string;
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
    evidence: string;
    match_count: number;
    line_number?: number;
    type?: string;
    meta?: Record<string, unknown>;
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

export interface DiagnosticFinding {
    id: string;
    path: string;
    severity: Severity;
    message: string;
    persona: string;
    timestamp: string;
    context?: string;
    suggestion?: string;
}

export interface EntropyData {
    coupling: number;
    instability: number;
    abstraction: number;
    risk_level: string;
}

export interface ParityStats {
    total: number;
    identical: number;
    divergent: number;
    percentage: number;
}

export interface QAData {
    matrix: Record<string, number>;
    depth_audit?: {
        metrics: Array<{ path: string; tsDepth: number }>;
    };
    [key: string]: unknown;
}

export interface CognitiveStatus {
    status: string;
    details?: string;
    score?: number;
    [key: string]: unknown;
}

export interface SystemHealth360 {
    health_score: number;
    health_breakdown: Record<string, number>;
    status: "HEALTHY" | "WARNING" | "CRITICAL";
    dark_matter: string[];
    brittle_points: string[];
    entropy_map: Record<string, any>;
    confidence_matrix: Record<string, any>;
    objective: string;
    timestamp: string;
    parity_stats?: any;
    predictor_metrics?: any;
}

/**
 * 🤖 Base Agent Lifecycle
 */
export interface IAgent {
    readonly id: string;
    readonly name?: string;
    readonly category: string;
    readonly stack: string;

    initialize?(): Promise<void>;
    execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]>;
    teardown?(): Promise<void>;
    getMetadata?(): Record<string, unknown>;
    selfDiagnostic?(): Record<string, unknown>;
}

/**
 * 🎛️ Agent Registry Interface
 */
export interface IAgentRegistry {
    register(agent: IAgent): void;
    getAgent(id: string): IAgent | undefined;
    listAgents(): IAgent[];
}

export interface SystemMetrics {
    files_scanned: number;
    health_score: number;
    start_time: number;
    last_detected_changes?: string[];
    efficiency: Record<string, number>;
    [key: string]: unknown;
}

/**
 * 🧠 Core Domain State
 */
export interface SovereignState {
    root: string;
    metrics: {
        files_scanned: number;
        start_time: number;
        last_diagnostic?: string;
    };
    identity: {
        core_mission: string;
        stacks: string[];
    };
}

export interface CoreSupportTools {
    analyst: any; 
    patternFinder: any; 
    guardian: any; 
    mapper: any;
    parity: any;
    auditEngine: any;
    vetoEngine: any;
    testRunner: any; 
    hub: any; // HubManagerGRPC
}

export interface OrchestratorTools {
    synthesizer: any;
    strategist: any;
    executor: any;
    validator: any;
    refiner: any;
    healer: any;
    architect: any;
    docGen: any;
    security: any;
    quality: any;
    maturity: any;
    topology: any;
}

/**
 * 🛠️ Supportable Agent: Contract for auto-injected intelligence tools.
 */
export interface ISupportableAgent extends IAgent {
    auditEngine?: any;
    structuralAnalyst?: any;
    integrityGuardian?: any;
    patternFinder?: any;
    maturityEvaluator?: any;
    testRunner?: any;
}

export interface AdvancedMetrics {
    cyclomaticComplexity?: number;
    cognitiveComplexity?: number;
    maintainabilityIndex?: number;
    qualityGate?: string;
    nestingDepth?: number;
    cbo?: number;
    dit?: number;
    defectDensity?: number;
    [key: string]: unknown;
}

/**
 * 🗃️ Shared File Context Content
 */
export interface FileContextData {
    content?: string;
    component_type?: string;
    tsDepth?: number;
    advanced_metrics?: AdvancedMetrics;
    [key: string]: unknown; 
}

/**
 * 🌐 Core Project Operations Context
 */
export interface ProjectContext {
    identity?: {
        stacks: Set<string>;
        core_mission?: string;
        dna?: Record<string, unknown>;
    };
    map?: Record<string, FileContextData>;
    hub?: any; 
    depthAudit?: {
        metrics: Array<{ path: string; tsDepth: number }>;
    };
    [key: string]: unknown;
}
