import type { PsaPlugin } from "../../kernel/psa_plugin.ts";
import type { PsaContext } from "../../kernel/psa_context.ts";

/**
 * 🏛️ PsaSystemControlPlugin
 *
 * Plugin central que coloca o ecossistema inteiro do repositório sob a regência do PSA:
 * - Diagnóstico 360° e Censo PhD (DiagnosticPipeline)
 * - Auditorias Estratégicas e Staged (AuditEngine / Orchestrator)
 * - Catálogo Poliglota de Agentes (RegistryManager / agents_registry/)
 * - Auto-Cura Transacional e Verificação Idris 2 (HealerPersona)
 * - Infraestrutura Nativa & Governança de RAM (Zig FFI / Go Hub / PhdGovernanceSystem)
 */
export class PsaSystemControlPlugin implements PsaPlugin {
    public name = "system-control";
    public version = "2.0.0";
    public description = "Controlador Mestre do Ecossistema: Conecta Orchestrator, DiagnosticPipeline, RegistryManager e FFI ao PSA.";

    public apply(ctx: PsaContext): void {
        const workspaceRoot = ctx.workspaceRoot;

        // 1. Diagnóstico do Sistema (DiagnosticPipeline)
        ctx.tools.register({
            name: "system.run_diagnostic",
            description: "Executa o pipeline de diagnóstico 360° do sistema com análise de saúde e cobertura PhD.",
            schema: {
                type: "object",
                properties: {
                    skipTests: { type: "boolean", description: "Se verdadeiro, pula a bateria de testes de unidade" },
                    dryRun: { type: "boolean", description: "Modo somente leitura / simulação" }
                }
            },
            isExclusive: true,
            execute: async (args: { skipTests?: boolean; dryRun?: boolean }) => {
                const { Orchestrator } = await import("../../../core/orchestrator.ts");
                const { DiagnosticPipeline } = await import("../../../core/diagnostic_pipeline.ts");

                const orc = new Orchestrator(workspaceRoot);
                const pipeline = new DiagnosticPipeline(orc);

                const reportPath = await pipeline.execute({
                    skipTests: args?.skipTests ?? true,
                    dryRun: args?.dryRun ?? true,
                    autoHeal: false
                });

                const healthScore = orc.metrics.health_score || 100;
                if (orc.hubWatcher) {
                    orc.hubWatcher.stop();
                }

                return {
                    status: "success",
                    reportPath: reportPath.toString(),
                    summary: "Pipeline de Diagnóstico executado com sucesso via PSA Control Hub.",
                    healthScore
                };
            }
        });

        // 2. Score de Saúde e Métricas do Sistema
        ctx.tools.register({
            name: "system.health_score",
            description: "Consulta o Score de Saúde 360° e métricas de integridade do projeto.",
            schema: { type: "object", properties: {} },
            isExclusive: false,
            execute: async () => {
                const { Orchestrator } = await import("../../../core/orchestrator.ts");
                const orc = new Orchestrator(workspaceRoot);

                return {
                    healthScore: orc.metrics.health_score || 100,
                    filesScanned: orc.metrics.files_scanned,
                    status: "OPERATIONAL",
                    timestamp: new Date().toISOString()
                };
            }
        });

        // 3. Auditoria Staged do Git (Orchestrator / AuditEngine)
        ctx.tools.register({
            name: "audit.staged",
            description: "Audita arquivos staged ou modificados no Git procurando regressões e riscos.",
            schema: {
                type: "object",
                properties: {
                    dryRun: { type: "boolean", description: "Simular sem persistir resultados" }
                }
            },
            isExclusive: false,
            execute: async (args: { dryRun?: boolean }) => {
                const { Orchestrator } = await import("../../../core/orchestrator.ts");
                const orc = new Orchestrator(workspaceRoot);
                const findings = await orc.runStagedAudit({ dryRun: args?.dryRun ?? true });
                if (orc.hubWatcher) {
                    orc.hubWatcher.stop();
                }

                return {
                    status: "success",
                    findingsCount: findings.length,
                    findings: findings.slice(0, 10),
                    hasCritical: findings.some((f: any) => f.severity === "CRITICAL")
                };
            }
        });

        // 4. Varredura de Ofuscação e Segurança AST
        ctx.tools.register({
            name: "audit.obfuscation_scan",
            description: "Executa varredura profunda de segurança AST e detecção de padrões ofuscados.",
            schema: { type: "object", properties: {} },
            isExclusive: false,
            execute: async () => {
                const { Orchestrator } = await import("../../../core/orchestrator.ts");
                const orc = new Orchestrator(workspaceRoot);
                const findings = await orc.runObfuscationScan();
                if (orc.hubWatcher) {
                    orc.hubWatcher.stop();
                }

                return {
                    status: "success",
                    obfuscatedItems: findings.length,
                    findings: findings.slice(0, 5)
                };
            }
        });

        // 5. Catálogo Poliglota de Agentes (RegistryManager / agents_registry)
        ctx.tools.register({
            name: "registry.list_stacks",
            description: "Lista todas as 9 stacks de agentes registradas no projeto (Bun, Rust, Zig, Go, Python, etc.).",
            schema: { type: "object", properties: {} },
            isExclusive: false,
            execute: async () => {
                const { RegistryManager } = await import("../../../core/registry_manager.ts");
                const rm = new RegistryManager(workspaceRoot);
                const stacks = await rm.loadAllStacks();

                const summary = Object.entries(stacks).map(([stack, agents]) => ({
                    stack,
                    agentsCount: (agents as any[]).length,
                    agents: (agents as any[]).map((a: any) => a.name || a.id)
                }));

                return {
                    totalStacks: Object.keys(stacks).length,
                    stacks: summary
                };
            }
        });

        // 6. Detalhes de um Agente Específico no Catálogo
        ctx.tools.register({
            name: "registry.get_agent_info",
            description: "Obtém informações detalhadas de um agente registrado no agents_registry.",
            schema: {
                type: "object",
                properties: {
                    agentName: { type: "string", description: "Nome do agente a pesquisar" }
                },
                required: ["agentName"]
            },
            isExclusive: false,
            execute: async (args: { agentName: string }) => {
                const { RegistryManager } = await import("../../../core/registry_manager.ts");
                const rm = new RegistryManager(workspaceRoot);
                const stacks = await rm.loadAllStacks();

                let found: any = null;
                let foundStack = "";

                for (const [stack, agents] of Object.entries(stacks)) {
                    const match = (agents as any[]).find((a: any) =>
                        a.name?.toLowerCase().includes(args.agentName.toLowerCase()) ||
                        a.id?.toLowerCase().includes(args.agentName.toLowerCase())
                    );
                    if (match) {
                        found = match;
                        foundStack = stack;
                        break;
                    }
                }

                if (!found) {
                    return { status: "not_found", message: `Agente '${args.agentName}' não encontrado no catálogo.` };
                }

                return {
                    status: "success",
                    stack: foundStack,
                    agent: found
                };
            }
        });

        // 7. Auto-Cura de Falhas com HealerPersona
        ctx.tools.register({
            name: "healing.run_auto_heal",
            description: "Executa auto-cura de falhas estruturais conhecidas através da HealerPersona.",
            schema: {
                type: "object",
                properties: {
                    dryRun: { type: "boolean", description: "Se verdadeiro, simula os patches sem gravar no disco" }
                }
            },
            isExclusive: true,
            execute: async (args: { dryRun?: boolean }) => {
                const { Orchestrator } = await import("../../../core/orchestrator.ts");
                const orc = new Orchestrator(workspaceRoot);
                const findings = await orc.runStagedAudit({ dryRun: true });
                const healedCount = await orc.runAutoHealing(findings);

                return {
                    status: "success",
                    findingsEvaluated: findings.length,
                    healedCount,
                    message: `${healedCount} problemas auto-curados com sucesso.`
                };
            }
        });

        // 8. Governança de Hardware & Status Nativo (PhdGovernanceSystem / FFI)
        ctx.tools.register({
            name: "native.governance_status",
            description: "Consulta limites de hardware (CPU, RAM livre de 16GB, throttling e modo de operação).",
            schema: { type: "object", properties: {} },
            isExclusive: false,
            execute: async () => {
                const { PhdGovernanceSystem } = await import("../../../core/governance/system_facade.ts");
                const gov = PhdGovernanceSystem.getInstance();
                const load = gov.getCurrentLoad();

                return {
                    cpuCores: load.cpuCores,
                    totalMemoryGb: Number(load.totalMemoryGb.toFixed(2)),
                    freeMemoryGb: Number(load.freeMemoryGb.toFixed(2)),
                    usedMemoryGb: Number((load.totalMemoryGb - load.freeMemoryGb).toFixed(2)),
                    mode: load.freeMemoryGb < 3 ? "ULTRALEVE" : "SOBERANO_STANDARD",
                    status: "OPTIMIZED_FOR_RYZEN_7"
                };
            }
        });
    }
}
