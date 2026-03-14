
import winston from "winston";
import * as path from "node:path";
import { StructuralAnalyst } from "./../Analysis/structural_analyst";
import { PatternFinder } from "./../../strategies/PatternFinder";
import { IntegrityGuardian } from "./../Core/integrity_guardian";
import { ConnectivityMapper } from "./../Analysis/connectivity_mapper";
import { ParityAnalyst } from "./../Analysis/parity_analyst";
import { AuditEngine } from "../../../core/audit_engine";
import { VetoEngine } from "../../../utils/veto_engine";
import { HealthSynthesizer } from "./../Diagnostics/health_synthesizer";
import { DiagnosticStrategist } from "./../Diagnostics/diagnostic_strategist";
import { TaskExecutor } from "../../../utils/task_executor";
import { CoreValidator } from "../../../core/validator";
import { TestRefiner } from "./test_refiner";
import { TestRunner } from "./test_runner";
import { HealerPersona } from "./../Core/healer_persona";
import { TestArchitectAgent } from "./test_architect_agent";
import { DocGenAgent } from "./doc_gen_agent";
import { SecuritySentinelAgent } from "./../Security/security_sentinel_agent";
import { QualityAnalyst } from "./../Diagnostics/quality_analyst";
import { MaturityEvaluator } from "./../Diagnostics/maturity_evaluator";
import { TopologyGraphAgent } from "./topology_graph_agent";

import { HubManagerGRPC } from "../../../core/hub_manager_grpc.ts";
import type { CoreSupportTools, OrchestratorTools } from "../../../core/types.ts";

const logger = winston.child({ module: "InfrastructureAssembler" });

/**
 * 🏗️ Montador de Infraestrutura PhD.
 * O Arquiteto de Dependências que garante a injeção correta de inteligência em cada Agente.
 */
export class InfrastructureAssembler {
    private static coreCache: CoreSupportTools | null = null;
    private static toolsCache: Record<string, OrchestratorTools> = {};
    private static hubManager: HubManagerGRPC = new HubManagerGRPC();

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
