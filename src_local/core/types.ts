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

/**
 * 🚩 Generic Finding Interface for all agents
 */
export interface GenericFinding {
    file?: string;
    path?: string;
    issue: string;
    severity: string | Severity;
    agent: string;
    role?: string;
    emoji?: string;
    evidence?: string;
    timestamp?: string;
    line_number?: number;
    context?: string;
    suggestion?: string;
    stack?: string;
    match_count?: number;
    [key: string]: unknown;
}

// AuditFinding preserved as alias for backward compatibility if needed, or removed
export type AuditFinding = GenericFinding;

export interface DiagnosticFinding extends GenericFinding {
    id: string;
    path: string;
    message: string;
    persona: string;
}

export interface StrategicFinding extends GenericFinding {
    objective?: string;
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
    readonly role: string;
    readonly stack: string;
    readonly name?: string;
    readonly category?: string;
    readonly logicDir?: string;

    initialize?(): Promise<void>;
    execute(context: ProjectContext): Promise<any>;
    teardown?(): Promise<void>;
    getMetadata?(): Record<string, unknown>;
    selfDiagnostic?(): Record<string, unknown>;
}

export interface IHealthSynthesizer {
    synthesize360(context: ProjectContext, metrics: SystemMetrics, personas: IAgent[], ledger: any, qa: QAData): Promise<SystemHealth360>;
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
 * 🌐 Core Project Operations Context
 */
export interface ProjectContext {
    identity?: any;
    map?: Record<string, any>;
    depthAudit?: { metrics: any[] };
    alerts?: GenericFinding[];
    cognitive?: CognitiveStatus;
    predictor_metrics?: any;
    projectRoot?: string;
    census?: any;
    [key: string]: unknown;
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
}

export interface OrchestratorTools {
    synthesizer: IHealthSynthesizer;
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

export interface OrchestratorTools {
    synthesizer: IHealthSynthesizer;
    strategist: any;
    executor: any;
    validator: any;
    refiner: any;
    healer: any;
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

export interface FileContextData {
    content?: string;
    component_type?: string;
    tsDepth?: number;
    advanced_metrics?: AdvancedMetrics;
    [key: string]: unknown; 
}
