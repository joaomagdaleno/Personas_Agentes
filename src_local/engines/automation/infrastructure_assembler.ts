
import winston from "winston";
import * as path from "node:path";
import { StructuralAnalyst } from "./../analysis/architecture_types_service";
import { PatternFinder } from "./PatternFinder";
import { IntegrityGuardian } from "./../healing/integrity_guardian";
import { ConnectivityMapper } from "./../analysis/connectivity_mapper";
import { ParityAnalyst } from "./../analysis/parity_analyst";
import { AuditEngine } from "../../core/audit_engine";
import { VetoEngine, TaskExecutor } from "../maintenance/sys_perf_architect_service";
import { CoreValidator } from "../../core/validator";
import { TestRefiner } from "./test_refiner";
import { TestRunner } from "./test_runner";
import { HealerPersona } from "./../healing/healer_persona";
import { SecuritySentinelAgent } from "./../security/security_sentinel_agent";
import { QualityAnalyst } from "./../diagnostics/quality_analyst";
import { HealthSynthesizer } from "./../diagnostics/health_synthesizer";

// Consolidated service locations (2026-10-01).
// The old 1-line barrel modules (doc_gen_agent.ts, test_architect_agent.ts,
// topology_graph_agent.ts) were deleted in commit 24ed7a5 along with
// maturity_evaluator.ts; the classes below absorbed those roles.
import {
    DiagnosticStrategist,
    MaturityEvaluator,
} from "./../diagnostics/audit_code_guardian_service";
import { QADiagnosticsService } from "./qa_diagnostics_service";
import { MasterOrchestratorService } from "./../strategic/master_orchestrator_service";

// Legacy aliases preserved so the tool-cache shape used by consumers does not change.
// These barrels were deleted in commit 24ed7a5; the roles were absorbed by the
// consolidated services, so the names below are thin local aliases.
const TestArchitectAgent = QADiagnosticsService;
const DocGenAgent = MasterOrchestratorService;
const TopologyGraphAgent = MasterOrchestratorService;
export { QADiagnosticsService, MasterOrchestratorService };

import { HubManagerGRPC } from "../../core/hub_manager_grpc.ts";
import type { CoreSupportTools, OrchestratorTools } from "../../core/types.ts";

const logger = winston.child({ module: "InfrastructureAssembler" });

/**
 * 🏗️ Montador de Infraestrutura PhD.
 * O Arquiteto de Dependências que garante a injeção correta de inteligência em cada Agente.
 */
export class InfrastructureAssembler {
    private static coreCache: CoreSupportTools | null = null;
    private static toolsCache: Record<string, OrchestratorTools> = {};
    private static hubManager: HubManagerGRPC = HubManagerGRPC.getInstance();

    /**
     * 🛡️ Instancia a junta de suporte padrão.
     * Utiliza cache soberano para otimização de performance.
     */
    static assembleCoreSupport(projectRoot: string): CoreSupportTools {
        if (InfrastructureAssembler.coreCache) {
            return InfrastructureAssembler.coreCache;
        }

        logger.info("🛡️ [Assembler] Mobilizando junta de suporte core...");

        const mockOrchestrator = { projectRoot, hubManager: InfrastructureAssembler.hubManager };

        InfrastructureAssembler.coreCache = {
            analyst: new StructuralAnalyst(InfrastructureAssembler.hubManager),
            patternFinder: new PatternFinder(InfrastructureAssembler.hubManager),
            guardian: new IntegrityGuardian(),
            mapper: new ConnectivityMapper(InfrastructureAssembler.hubManager),
            parity: new ParityAnalyst(),
            auditEngine: new AuditEngine(mockOrchestrator),
            vetoEngine: new VetoEngine(),
            testRunner: new TestRunner()
        };

        return InfrastructureAssembler.coreCache;
    }

    /**
     * 🎼 Mobiliza as ferramentas do Maestro incluindo os novos Agentes de IA.
     */
    static assembleOrchestratorTools(projectRoot: string): OrchestratorTools {
        if (InfrastructureAssembler.toolsCache[projectRoot]) {
            return InfrastructureAssembler.toolsCache[projectRoot];
        }

        logger.info(`🎼 [Assembler] Mobilizando ferramentas do Maestro para ${projectRoot}...`);

        const tools = {
            synthesizer: new HealthSynthesizer(InfrastructureAssembler.hubManager),
            strategist: new DiagnosticStrategist(),
            executor: new TaskExecutor(),
            validator: new CoreValidator(),
            refiner: new TestRefiner(),
            healer: new HealerPersona(projectRoot),
            architect: new TestArchitectAgent(InfrastructureAssembler.hubManager),
            docGen: new DocGenAgent(),
            security: new SecuritySentinelAgent(InfrastructureAssembler.hubManager),
            quality: new QualityAnalyst(),
            maturity: new MaturityEvaluator(),
            topology: new TopologyGraphAgent()
        };

        InfrastructureAssembler.toolsCache[projectRoot] = tools;
        return tools;
    }

    /**
     * 🔌 Inicia a integração com a API Soberana (Go Hub).
     */
    static async launchSovereignAPI(_projectRoot: string): Promise<void> {
        // Redirecionado para o Sovereign Hub em Go (main.go) na porta 8080.
        logger.info(`🔌 [Assembler] Integrou-se com o Sovereign Hub (Go) na porta 8080.`);
    }

    /**
     * 🚀 Inicia a integração com o Dashboard React Native.
     */
    static launchSovereignDashboard(_projectRoot: string): void {
        // Redirecionado para o Sovereign Dashboard em React (dashboard/src/App.tsx).
        logger.info("🎬 [Assembler] O Dashboard nativo React está disponível na interface WEB.");
    }
}
