/**
 * LanguagePersonaOrchestrator
 * 
 * Ponto central de integração entre as Language Personas e o sistema.
 * Detecta automaticamente o stack do projeto e instancia os agentes corretos.
 * Cada agente é uma classe individual com BaseActivePersona completo:
 *  - performAudit(): Regras regex específicas do domínio
 *  - reasonAboutObjective(): Raciocínio contextual estratégico
 *  - getSystemPrompt(): Identidade de persona para LLM
 */
import winston from "winston";
import { BaseActivePersona, AuditFinding } from "../agents/base.ts";

// Flutter Agents
import { BoltPersona as FlutterBolt } from "../agents/Flutter/Audit/bolt.ts";
import { MetricPersona as FlutterMetric } from "../agents/Flutter/Audit/metric.ts";
import { NebulaPersona as FlutterNebula } from "../agents/Flutter/Audit/nebula.ts";
import { ProbePersona as FlutterProbe } from "../agents/Flutter/Audit/probe.ts";
import { ScalePersona as FlutterScale } from "../agents/Flutter/Audit/scale.ts";
import { ScopePersona as FlutterScope } from "../agents/Flutter/Audit/scope.ts";
import { TestifyPersona as FlutterTestify } from "../agents/Flutter/Audit/testify.ts";
import { EchoPersona as FlutterEcho } from "../agents/Flutter/Content/echo.ts";
import { ForgePersona as FlutterForge } from "../agents/Flutter/Content/forge.ts";
import { GlobePersona as FlutterGlobe } from "../agents/Flutter/Content/globe.ts";
import { HypePersona as FlutterHype } from "../agents/Flutter/Content/hype.ts";
import { MantraPersona as FlutterMantra } from "../agents/Flutter/Content/mantra.ts";
import { PalettePersona as FlutterPalette } from "../agents/Flutter/Content/palette.ts";
import { ScribePersona as FlutterScribe } from "../agents/Flutter/Content/scribe.ts";
import { SentinelPersona as FlutterSentinel } from "../agents/Flutter/Strategic/sentinel.ts";
import { VaultPersona as FlutterVault } from "../agents/Flutter/Strategic/vault.ts";
import { VoyagerPersona as FlutterVoyager } from "../agents/Flutter/Strategic/voyager.ts";
import { WardenPersona as FlutterWarden } from "../agents/Flutter/Strategic/warden.ts";
import { BridgePersona as FlutterBridge } from "../agents/Flutter/System/bridge.ts";
import { HermesPersona as FlutterHermes } from "../agents/Flutter/System/hermes.ts";
import { NeuralPersona as FlutterNeural } from "../agents/Flutter/System/neural.ts";
import { SparkPersona as FlutterSpark } from "../agents/Flutter/System/spark.ts";
import { StreamPersona as FlutterStream } from "../agents/Flutter/System/stream.ts";
import { CachePersona as FlutterCache } from "../agents/Flutter/System/cache.ts";
import { NexusPersona as FlutterNexus } from "../agents/Flutter/System/nexus.ts";
import { FlowPersona as FlutterFlow } from "../agents/Flutter/System/flow.ts";

// Kotlin Agents
import { BoltPersona as KotlinBolt } from "../agents/Kotlin/Audit/bolt.ts";
import { MetricPersona as KotlinMetric } from "../agents/Kotlin/Audit/metric.ts";
import { NebulaPersona as KotlinNebula } from "../agents/Kotlin/Audit/nebula.ts";
import { ProbePersona as KotlinProbe } from "../agents/Kotlin/Audit/probe.ts";
import { ScalePersona as KotlinScale } from "../agents/Kotlin/Audit/scale.ts";
import { ScopePersona as KotlinScope } from "../agents/Kotlin/Audit/scope.ts";
import { TestifyPersona as KotlinTestify } from "../agents/Kotlin/Audit/testify.ts";
import { EchoPersona as KotlinEcho, ForgePersona as KotlinForge } from "../agents/Kotlin/Content/echo.ts";
import { GlobePersona as KotlinGlobe } from "../agents/Kotlin/Content/globe.ts";
import { HypePersona as KotlinHype, MantraPersona as KotlinMantra, PalettePersona as KotlinPalette, ScribePersona as KotlinScribe } from "../agents/Kotlin/Content/hype.ts";
import { SentinelPersona as KotlinSentinel, VaultPersona as KotlinVault, VoyagerPersona as KotlinVoyager, WardenPersona as KotlinWarden } from "../agents/Kotlin/Strategic/sentinel.ts";
import { BridgePersona as KotlinBridge, HermesPersona as KotlinHermes, NeuralPersona as KotlinNeural, SparkPersona as KotlinSpark, StreamPersona as KotlinStream, CachePersona as KotlinCache, NexusPersona as KotlinNexus, FlowPersona as KotlinFlow } from "../agents/Kotlin/System/system_agents.ts";

// Python Agents
import { BoltPersona as PythonBolt, MetricPersona as PythonMetric, NebulaPersona as PythonNebula, ProbePersona as PythonProbe, ScalePersona as PythonScale, ScopePersona as PythonScope, TestifyPersona as PythonTestify } from "../agents/Python/Audit/audit_agents.ts";
import { EchoPersona as PythonEcho, ForgePersona as PythonForge, GlobePersona as PythonGlobe, HypePersona as PythonHype, MantraPersona as PythonMantra, PalettePersona as PythonPalette, ScribePersona as PythonScribe } from "../agents/Python/Content/content_agents.ts";
import { SentinelPersona as PythonSentinel, VaultPersona as PythonVault, VoyagerPersona as PythonVoyager, WardenPersona as PythonWarden, DirectorPersona as PythonDirector } from "../agents/Python/Strategic/strategic_agents.ts";
import { BridgePersona as PythonBridge, HermesPersona as PythonHermes, NeuralPersona as PythonNeural, SparkPersona as PythonSpark, StreamPersona as PythonStream, CachePersona as PythonCache, NexusPersona as PythonNexus, FlowPersona as PythonFlow } from "../agents/Python/System/system_agents.ts";

const logger = winston.child({ module: "LanguagePersonaOrchestrator" });

type StackType = "flutter" | "kotlin" | "python";

interface StackDetectionResult {
    stacks: StackType[];
    fileCount: Record<StackType, number>;
}

export class LanguagePersonaOrchestrator {

    /** Detecta quais stacks estão presentes no contextMap. */
    detectStacks(contextMap: Record<string, any>): StackDetectionResult {
        const fileCount: Record<StackType, number> = { flutter: 0, kotlin: 0, python: 0 };
        for (const file of Object.keys(contextMap)) {
            if (file.endsWith(".dart")) fileCount.flutter++;
            if (file.endsWith(".kt") || file.endsWith(".kts")) fileCount.kotlin++;
            if (file.endsWith(".py")) fileCount.python++;
        }
        const stacks: StackType[] = [];
        if (fileCount.flutter > 0) stacks.push("flutter");
        if (fileCount.kotlin > 0) stacks.push("kotlin");
        if (fileCount.python > 0) stacks.push("python");
        return { stacks, fileCount };
    }

    /** Retorna os agentes instanciados para um stack. */
    getAgentsForStack(stack: StackType, projectRoot?: string): BaseActivePersona[] {
        switch (stack) {
            case "flutter": return [
                new FlutterBolt(projectRoot), new FlutterMetric(projectRoot), new FlutterNebula(projectRoot),
                new FlutterProbe(projectRoot), new FlutterScale(projectRoot), new FlutterScope(projectRoot),
                new FlutterTestify(projectRoot), new FlutterEcho(projectRoot), new FlutterForge(projectRoot),
                new FlutterGlobe(projectRoot), new FlutterHype(projectRoot), new FlutterMantra(projectRoot),
                new FlutterPalette(projectRoot), new FlutterScribe(projectRoot), new FlutterSentinel(projectRoot),
                new FlutterVault(projectRoot), new FlutterVoyager(projectRoot), new FlutterWarden(projectRoot),
                new FlutterBridge(projectRoot), new FlutterHermes(projectRoot), new FlutterNeural(projectRoot),
                new FlutterSpark(projectRoot), new FlutterStream(projectRoot), new FlutterCache(projectRoot),
                new FlutterNexus(projectRoot), new FlutterFlow(projectRoot)
            ];
            case "kotlin": return [
                new KotlinBolt(projectRoot), new KotlinMetric(projectRoot), new KotlinNebula(projectRoot),
                new KotlinProbe(projectRoot), new KotlinScale(projectRoot), new KotlinScope(projectRoot),
                new KotlinTestify(projectRoot), new KotlinEcho(projectRoot), new KotlinForge(projectRoot),
                new KotlinGlobe(projectRoot), new KotlinHype(projectRoot), new KotlinMantra(projectRoot),
                new KotlinPalette(projectRoot), new KotlinScribe(projectRoot), new KotlinSentinel(projectRoot),
                new KotlinVault(projectRoot), new KotlinVoyager(projectRoot), new KotlinWarden(projectRoot),
                new KotlinBridge(projectRoot), new KotlinHermes(projectRoot), new KotlinNeural(projectRoot),
                new KotlinSpark(projectRoot), new KotlinStream(projectRoot), new KotlinCache(projectRoot),
                new KotlinNexus(projectRoot), new KotlinFlow(projectRoot)
            ];
            case "python": return [
                new PythonBolt(projectRoot), new PythonMetric(projectRoot), new PythonNebula(projectRoot),
                new PythonProbe(projectRoot), new PythonScale(projectRoot), new PythonScope(projectRoot),
                new PythonTestify(projectRoot), new PythonEcho(projectRoot), new PythonForge(projectRoot),
                new PythonGlobe(projectRoot), new PythonHype(projectRoot), new PythonMantra(projectRoot),
                new PythonPalette(projectRoot), new PythonScribe(projectRoot), new PythonSentinel(projectRoot),
                new PythonVault(projectRoot), new PythonVoyager(projectRoot), new PythonWarden(projectRoot),
                new PythonDirector(projectRoot), new PythonBridge(projectRoot), new PythonHermes(projectRoot),
                new PythonNeural(projectRoot), new PythonSpark(projectRoot), new PythonStream(projectRoot),
                new PythonCache(projectRoot), new PythonNexus(projectRoot), new PythonFlow(projectRoot)
            ];
        }
    }

    /** Executa todos os agentes relevantes contra o contextMap. */
    async runAll(contextMap: Record<string, any>, projectRoot?: string, forceStacks?: StackType[]): Promise<AuditFinding[]> {
        const detection = this.detectStacks(contextMap);
        const activeStacks = forceStacks || detection.stacks;
        if (activeStacks.length === 0) { logger.warn("⚠️ Nenhum stack detectado."); return []; }

        logger.info(`🌐 Stacks: ${activeStacks.join(", ")} | Flutter=${detection.fileCount.flutter}, Kotlin=${detection.fileCount.kotlin}, Python=${detection.fileCount.python}`);

        const allFindings: AuditFinding[] = [];
        for (const stack of activeStacks) {
            const agents = this.getAgentsForStack(stack, projectRoot);
            logger.info(`🔄 Executando ${agents.length} agentes ${stack}...`);
            for (const agent of agents) {
                agent.setContext({ map: contextMap });
                const findings = agent.performAudit();
                allFindings.push(...findings);
            }
        }
        logger.info(`✅ Total: ${allFindings.length} findings de ${activeStacks.length} stack(s).`);
        return allFindings;
    }

    /** Executa auditoria estratégica (com reasoning). */
    async runStrategic(contextMap: Record<string, any>, objective: string, projectRoot?: string): Promise<any[]> {
        const detection = this.detectStacks(contextMap);
        const results: any[] = [];
        for (const stack of detection.stacks) {
            const agents = this.getAgentsForStack(stack, projectRoot);
            for (const agent of agents) {
                agent.setContext({ map: contextMap });
                const strategicResults = agent.performStrategicAudit(objective);
                results.push(...strategicResults);
            }
        }
        return results;
    }

    /** Gera resumo estatístico. */
    summarize(findings: AuditFinding[]): Record<string, any> {
        const bySeverity: Record<string, number> = { critical: 0, high: 0, medium: 0, low: 0 };
        const byStack: Record<string, number> = {};
        const byAgent: Record<string, number> = {};
        for (const f of findings) {
            bySeverity[f.severity] = (bySeverity[f.severity] || 0) + 1;
            byStack[f.stack] = (byStack[f.stack] || 0) + 1;
            byAgent[f.agent] = (byAgent[f.agent] || 0) + 1;
        }
        return { total: findings.length, bySeverity, byStack, byAgent, criticalCount: bySeverity.critical };
    }
}
