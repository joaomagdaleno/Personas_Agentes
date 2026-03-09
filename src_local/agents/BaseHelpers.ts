import winston from "winston";
import { InfrastructureAssembler } from "./Support/Automation/infrastructure_assembler.ts";

/**
 * 🧱 BaseHelpers - PhD in Persona Scaffolding
 */
export class BaseHelpers {
    static initializeTools(persona: any, root: string | null) {
        if (!root) return;
        try {
            const support = InfrastructureAssembler.assembleCoreSupport(root);
            const tools = InfrastructureAssembler.assembleOrchestratorTools(root);
            persona.auditEngine = support.auditEngine;
            persona.structuralAnalyst = support.analyst;
            persona.integrityGuardian = support.guardian;
            persona.patternFinder = support.patternFinder;
            persona.maturityEvaluator = tools.maturity;
            winston.child({ module: persona.name }).info(`✅ Ponte Neural Ativa.`);
        } catch (e: any) { winston.child({ module: persona.name }).error(`❌ Falha na ponte: ${e.message}`); }
    }
}
