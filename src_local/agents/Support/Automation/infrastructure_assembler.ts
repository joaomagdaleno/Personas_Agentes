
import winston from "winston";
import * as path from "node:path";
import * as fs from "node:fs";
import { StructuralAnalyst } from "./../Analysis/structural_analyst";
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
import { HealerPersona } from "./../Core/healer_persona";
import { TestArchitectAgent } from "./test_architect_agent";
import { DocGenAgent } from "./doc_gen_agent";
import { SecuritySentinelAgent } from "./../Security/security_sentinel_agent";
import { QualityAnalyst } from "./../Diagnostics/quality_analyst";
import { MaturityEvaluator } from "./../Diagnostics/maturity_evaluator";
import { TopologyGraphAgent } from "./topology_graph_agent";
import { DirectorPersona } from "../../TypeScript/Strategic/director";

const logger = winston.child({ module: "InfrastructureAssembler" });

/**
 * 🏗️ Montador de Infraestrutura PhD.
 * O Arquiteto de Dependências que garante a injeção correta de inteligência em cada Agente.
 */
export class InfrastructureAssembler {
    private static coreCache: any = null;
    private static toolsCache: Record<string, any> = {};

    /**
     * 🛡️ Instancia a junta de suporte padrão.
     * Utiliza cache soberano para otimização de performance.
     */
    static assembleCoreSupport(projectRoot: string): any {
        if (InfrastructureAssembler.coreCache) {
            return InfrastructureAssembler.coreCache;
        }

        logger.info("🛡️ [Assembler] Mobilizando junta de suporte core...");

        // Mock orchestrator for AuditEngine if needed, or pass simple object with projectRoot
        const mockOrchestrator = { projectRoot };

        InfrastructureAssembler.coreCache = {
            analyst: new StructuralAnalyst(),
            guardian: new IntegrityGuardian(),
            mapper: new ConnectivityMapper(),
            parity: new ParityAnalyst(),
            auditEngine: new AuditEngine(mockOrchestrator),
            vetoEngine: new VetoEngine() // Replaces LineVeto
        };

        return InfrastructureAssembler.coreCache;
    }

    /**
     * 🎼 Mobiliza as ferramentas do Maestro incluindo os novos Agentes de IA.
     */
    static assembleOrchestratorTools(projectRoot: string): any {
        if (InfrastructureAssembler.toolsCache[projectRoot]) {
            return InfrastructureAssembler.toolsCache[projectRoot];
        }

        logger.info(`🎼 [Assembler] Mobilizando ferramentas do Maestro para ${projectRoot}...`);

        const tools = {
            synthesizer: new HealthSynthesizer(),
            strategist: new DiagnosticStrategist(),
            executor: new TaskExecutor(),
            validator: new CoreValidator(),
            refiner: new TestRefiner(),
            healer: new HealerPersona(projectRoot),
            architect: new TestArchitectAgent(),
            docGen: new DocGenAgent(),
            security: new SecuritySentinelAgent(),
            quality: new QualityAnalyst(),
            maturity: new MaturityEvaluator(),
            topology: new TopologyGraphAgent()
        };

        InfrastructureAssembler.toolsCache[projectRoot] = tools;
        return tools;
    }

    /**
     * 🔌 Inicia a API Soberana via Bun.serve e o Native Sovereign Hub.
     */
    static async launchSovereignAPI(projectRoot: string): Promise<void> {
        logger.info(`🎬 [Assembler] Acionando Native Sovereign Hub (Go)...`);
        logger.info(`🔍 [Assembler] Project Root: ${projectRoot}`);
        logger.info(`🔍 [Assembler] CWD: ${process.cwd()}`);

        const { spawn } = require("node:child_process");
        const hubPath = path.resolve(projectRoot, "src_native", "hub", "hub.exe");
        const analyzerPath = path.resolve(projectRoot, "src_native", "analyzer", "target", "release", "analyzer.exe");
        const scannerPath = path.resolve(projectRoot, "src_native", "go-scanner.exe");

        logger.info("🛡️ [Assembler] Validando presença dos binários nativos obrigatórios...");
        const missing = [];
        if (!fs.existsSync(hubPath)) missing.push("hub.exe (src_native/hub/)");
        if (!fs.existsSync(analyzerPath)) missing.push("analyzer.exe (src_native/analyzer/target/release/)");
        if (!fs.existsSync(scannerPath)) missing.push("go-scanner.exe (src_native/)");

        if (missing.length > 0) {
            logger.error(`🚨 [Assembler] Falha crítica: Binários obrigatórios ausentes: ${missing.join(", ")}`);
            logger.error("🛑 [Assembler] O sistema exige que todos os binários nativos de Rust e Go estejam compilados antes de iniciar.");
            process.exit(1);
        }

        logger.info(`🔍 [Assembler] Hub Path: ${hubPath}`);

        const hubProcess = spawn(`"${hubPath}"`, ["-port=8080"], {
            cwd: path.resolve(projectRoot, "src_native", "hub"),
            detached: true,
            stdio: "inherit",
            shell: true
        });
        hubProcess.on('error', (err: any) => {
            logger.error(`🚨 [Assembler] Falha ao iniciar hub.exe: ${err.message}`);
        });
        hubProcess.unref();

        logger.info("🔌 Iniciando API TypeScript Soberana em http://localhost:8000...");

        const orchestrator = { projectRoot }; // Simplified or use real one

        Bun.serve({
            port: 8000,
            async fetch(req) {
                const url = new URL(req.url);

                if (url.pathname === "/status") {
                    return Response.json({
                        project: "Personas Agentes",
                        status: "HEALTHY",
                        timestamp: new Date().toISOString()
                    });
                }

                if (url.pathname === "/chat") {
                    const q = url.searchParams.get("q") || "";
                    const { CognitiveEngine } = await import("../../../utils/cognitive_engine");
                    const brain = new CognitiveEngine();
                    const response = await brain.reason(q);
                    return Response.json({ query: q, response });
                }

                return new Response("Sovereign API - Use /status or /chat?q=...", { status: 404 });
            },
        });
    }

    /**
     * 🚀 Inicia o Dashboard Nativo via Bridge.
     */
    static launchSovereignDashboard(projectRoot: string): void {
        logger.info("🎬 [Assembler] Acionando Dashboard Nativo...");
        const { spawn } = require("node:child_process");

        // Mantemos a chamada ao script Python por enquanto devido à complexidade da UI Tkinter,
        // mas o controle é agora do Assembler.
        const pyPath = path.join(projectRoot, "scripts", "launch_dashboard.py");
        spawn("python", [pyPath], {
            cwd: projectRoot,
            detached: true,
            stdio: "ignore"
        }).unref();
    }
}
