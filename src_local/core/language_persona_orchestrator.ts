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
import { BaseActivePersona } from "../agents/base.ts";
import type { AuditFinding } from "../agents/base.ts";

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
import { EchoPersona as KotlinEcho } from "../agents/Kotlin/Content/echo.ts";
import { ForgePersona as KotlinForge } from "../agents/Kotlin/Content/forge.ts";
import { GlobePersona as KotlinGlobe } from "../agents/Kotlin/Content/globe.ts";
import { HypePersona as KotlinHype } from "../agents/Kotlin/Content/hype.ts";
import { MantraPersona as KotlinMantra } from "../agents/Kotlin/Content/mantra.ts";
import { PalettePersona as KotlinPalette } from "../agents/Kotlin/Content/palette.ts";
import { ScribePersona as KotlinScribe } from "../agents/Kotlin/Content/scribe.ts";
import { SentinelPersona as KotlinSentinel } from "../agents/Kotlin/Strategic/sentinel.ts";
import { VaultPersona as KotlinVault } from "../agents/Kotlin/Strategic/vault.ts";
import { VoyagerPersona as KotlinVoyager } from "../agents/Kotlin/Strategic/voyager.ts";
import { WardenPersona as KotlinWarden } from "../agents/Kotlin/Strategic/warden.ts";
import { BridgePersona as KotlinBridge } from "../agents/Kotlin/System/bridge.ts";
import { HermesPersona as KotlinHermes } from "../agents/Kotlin/System/hermes.ts";
import { NeuralPersona as KotlinNeural } from "../agents/Kotlin/System/neural.ts";
import { SparkPersona as KotlinSpark } from "../agents/Kotlin/System/spark.ts";
import { StreamPersona as KotlinStream } from "../agents/Kotlin/System/stream.ts";
import { CachePersona as KotlinCache } from "../agents/Kotlin/System/cache.ts";
import { NexusPersona as KotlinNexus } from "../agents/Kotlin/System/nexus.ts";
import { FlowPersona as KotlinFlow } from "../agents/Kotlin/System/flow.ts";

// Python Agents
import { BoltPersona as PythonBolt } from "../agents/Python/Audit/bolt.ts";
import { MetricPersona as PythonMetric } from "../agents/Python/Audit/metric.ts";
import { NebulaPersona as PythonNebula } from "../agents/Python/Audit/nebula.ts";
import { ProbePersona as PythonProbe } from "../agents/Python/Audit/probe.ts";
import { ScalePersona as PythonScale } from "../agents/Python/Audit/scale.ts";
import { ScopePersona as PythonScope } from "../agents/Python/Audit/scope.ts";
import { TestifyPersona as PythonTestify } from "../agents/Python/Audit/testify.ts";
import { EchoPersona as PythonEcho } from "../agents/Python/Content/echo.ts";
import { ForgePersona as PythonForge } from "../agents/Python/Content/forge.ts";
import { GlobePersona as PythonGlobe } from "../agents/Python/Content/globe.ts";
import { HypePersona as PythonHype } from "../agents/Python/Content/hype.ts";
import { MantraPersona as PythonMantra } from "../agents/Python/Content/mantra.ts";
import { PalettePersona as PythonPalette } from "../agents/Python/Content/palette.ts";
import { ScribePersona as PythonScribe } from "../agents/Python/Content/scribe.ts";
import { SentinelPersona as PythonSentinel } from "../agents/Python/Strategic/sentinel.ts";
import { VaultPersona as PythonVault } from "../agents/Python/Strategic/vault.ts";
import { VoyagerPersona as PythonVoyager } from "../agents/Python/Strategic/voyager.ts";
import { WardenPersona as PythonWarden } from "../agents/Python/Strategic/warden.ts";
import { VortexPersona as PythonVortex } from "../agents/Python/Strategic/vortex.ts";
import { DirectorPersona as PythonDirector } from "../agents/Python/Strategic/director.ts";
import { CorePersona as PythonBridge } from "../agents/Python/System/core.ts";
import { ClockPersona as PythonHermes } from "../agents/Python/System/clock.ts";
import { NeuralPersona as PythonNeural } from "../agents/Python/System/neural.ts";
import { SparkPersona as PythonSpark } from "../agents/Python/System/spark.ts";
import { StreamPersona as PythonStream } from "../agents/Python/System/stream.ts";
import { CachePersona as PythonCache } from "../agents/Python/System/cache.ts";
import { NexusPersona as PythonNexus } from "../agents/Python/System/nexus.ts";
import { FlowPersona as PythonFlow } from "../agents/Python/System/flow.ts";

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
        const exts: Record<string, StackType> = { ".dart": "flutter", ".kt": "kotlin", ".kts": "kotlin", ".py": "python" };
        Object.keys(contextMap).forEach(f => {
            const ext = "." + f.split('.').pop();
            if (exts[ext]) fileCount[exts[ext]]++;
        });
        return {
            stacks: (Object.keys(fileCount) as StackType[]).filter(s => fileCount[s] > 0),
            fileCount
        };
    }

    getAgentsForStack(stack: StackType, projectRoot?: string): BaseActivePersona[] {
        const loaders: Record<StackType, () => any[]> = {
            flutter: () => this._getFlutterAgents(),
            kotlin: () => this._getKotlinAgents(),
            python: () => this._getPythonAgents()
        };
        return (loaders[stack]?.() || []).map(C => new C(projectRoot));
    }

    private _getFlutterAgents() {
        return [
            FlutterBolt, FlutterMetric, FlutterNebula, FlutterProbe, FlutterScale, FlutterScope,
            FlutterTestify, FlutterEcho, FlutterForge, FlutterGlobe, FlutterHype, FlutterMantra,
            FlutterPalette, FlutterScribe, FlutterSentinel, FlutterVault, FlutterVoyager, FlutterWarden,
            FlutterBridge, FlutterHermes, FlutterNeural, FlutterSpark, FlutterStream, FlutterCache,
            FlutterNexus, FlutterFlow
        ];
    }

    private _getKotlinAgents() {
        return [
            KotlinBolt, KotlinMetric, KotlinNebula, KotlinProbe, KotlinScale, KotlinScope,
            KotlinTestify, KotlinEcho, KotlinForge, KotlinGlobe, KotlinHype, KotlinMantra,
            KotlinPalette, KotlinScribe, KotlinSentinel, KotlinVault, KotlinVoyager, KotlinWarden,
            KotlinBridge, KotlinHermes, KotlinNeural, KotlinSpark, KotlinStream, KotlinCache,
            KotlinNexus, KotlinFlow
        ];
    }

    private _getPythonAgents() {
        return [
            PythonBolt, PythonMetric, PythonNebula, PythonProbe, PythonScale, PythonScope,
            PythonTestify, PythonEcho, PythonForge, PythonGlobe, PythonHype, PythonMantra,
            PythonPalette, PythonScribe, PythonSentinel, PythonVault, PythonVoyager, PythonWarden,
            PythonVortex, PythonDirector, PythonBridge, PythonHermes, PythonNeural, PythonSpark,
            PythonStream, PythonCache, PythonNexus, PythonFlow
        ];
    }

    async runAll(contextMap: Record<string, any>, projectRoot?: string, forceStacks?: StackType[]): Promise<AuditFinding[]> {
        const detection = this.detectStacks(contextMap);
        const activeStacks = forceStacks || detection.stacks;
        return this._executeAllAgents(activeStacks, contextMap, projectRoot);
    }

    private async _executeAllAgents(stacks: StackType[], contextMap: Record<string, any>, root?: string): Promise<AuditFinding[]> {
        const all: AuditFinding[] = [];
        for (const stack of stacks) {
            const agents = this.getAgentsForStack(stack, root);
            all.push(...await this._runAgentBatch(agents, contextMap));
        }
        return all;
    }

    private async _runAgentBatch(agents: BaseActivePersona[], contextMap: any): Promise<AuditFinding[]> {
        const findings: AuditFinding[] = [];
        for (const agent of agents) {
            agent.setContext({ map: contextMap });
            findings.push(...await agent.performAudit());
        }
        return findings;
    }

    async runStrategic(contextMap: Record<string, any>, objective: string, projectRoot?: string): Promise<any[]> {
        const results: any[] = [];
        this.detectStacks(contextMap).stacks.forEach(stack => {
            this.getAgentsForStack(stack, projectRoot).forEach(agent => {
                agent.setContext({ map: contextMap });
                results.push(...agent.performStrategicAudit(objective));
            });
        });
        return results;
    }

    summarize(findings: AuditFinding[]): Record<string, any> {
        const res: any = { total: findings.length, bySeverity: {}, byStack: {}, byAgent: {} };
        findings.forEach(f => {
            res.bySeverity[f.severity] = (res.bySeverity[f.severity] || 0) + 1;
            res.byStack[f.stack] = (res.byStack[f.stack] || 0) + 1;
            res.byAgent[f.agent] = (res.byAgent[f.agent] || 0) + 1;
        });
        res.criticalCount = res.bySeverity.critical || 0;
        return res;
    }
}
