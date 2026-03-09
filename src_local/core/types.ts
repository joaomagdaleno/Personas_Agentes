/**
 * 🏰 Shared Kernel: Sovereign Architectural Types
 * This file defines the rigid contracts for the Modular Monolith.
 */

export type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";

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

export interface SystemHealth360 {
    health_score: number;
    health_breakdown: Record<string, number>;
    status: "HEALTHY" | "WARNING" | "CRITICAL";
    entropy_map: Record<string, any>;
    parity_stats: Record<string, any>;
    timestamp: string;
    alerts: DiagnosticFinding[];
}

/**
 * 🤖 Base Agent Lifecycle
 */
export interface IAgent {
    readonly id: string;
    readonly category: string;
    readonly stack: string;

    initialize?(): Promise<void>;
    execute(context: any): Promise<any>;
    teardown?(): Promise<void>;
    getMetadata?(): Record<string, any>;
}

/**
 * 🎛️ Agent Registry Interface
 */
export interface IAgentRegistry {
    register(agent: IAgent): void;
    getAgent(id: string): IAgent | undefined;
    listAgents(): IAgent[];
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

/**
 * 🗃️ Shared File Context Content
 */
export interface FileContextData {
    content?: string;
    component_type?: string;
    [key: string]: any; // Allow extensibility for dynamic properties returned by scanners
}

/**
 * 🌐 Core Project Operations Context
 */
export interface ProjectContext {
    identity?: Record<string, any>;
    map?: Record<string, FileContextData>;
    [key: string]: any;
}
