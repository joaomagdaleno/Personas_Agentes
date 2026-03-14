import type { IAgent, ISupportableAgent } from "../core/types.ts";
import { InfrastructureAssembler } from "./Support/Automation/infrastructure_assembler.ts";
import winston from "winston";

/**
 * 🧱 BaseHelpers - PhD in Persona Scaffolding
 */
export class BaseHelpers {
    static initializeTools(persona: IAgent, root: string | undefined): void {
        if (!root) return;
        const name = persona.name || "UnknownPersona";
        try {
            const support = InfrastructureAssembler.assembleCoreSupport(root);
            const tools = InfrastructureAssembler.assembleOrchestratorTools(root);
            
            // Type-safe injection via interface to avoid circular dependencies
            const p = persona as ISupportableAgent;
            p.auditEngine = support.auditEngine;
            p.structuralAnalyst = support.analyst;
            p.integrityGuardian = support.guardian;
            p.patternFinder = support.patternFinder;
            p.maturityEvaluator = tools.maturity;
            p.testRunner = support.testRunner;
            
            winston.child({ module: name }).info(`✅ Ponte Neural Ativa.`);
        } catch (e: unknown) { 
            const msg = e instanceof Error ? e.message : String(e);
            winston.child({ module: name }).error(`❌ Falha na ponte: ${msg}`); 
        }
    }
}
