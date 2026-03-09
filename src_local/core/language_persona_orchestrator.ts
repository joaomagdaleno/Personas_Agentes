/**
 * LanguagePersonaOrchestrator
 * 
 * Ponto central de integração entre as Language Personas e o sistema.
 * Detecta automaticamente o stack do projeto e instancia os agentes corretos.
 * 
 * 🚀 Auto-Discovery: Escaneia `agents/{Language}/{Category}/*.ts` em vez de
 *    manter 78+ imports manuais. Novas personas são detectadas automaticamente
 *    ao serem colocadas na pasta correta.
 */
import winston from "winston";
import { BaseActivePersona } from "../agents/base.ts";
import type { AuditFinding } from "../agents/base.ts";
import * as path from "path";
import * as fs from "fs";

const logger = winston.child({ module: "LanguagePersonaOrchestrator" });

/** Supported language stacks detected by file extension. */
type StackType = "flutter" | "kotlin" | "python" | "typescript" | "go" | "bun";

/** Maps file extensions to detected stack types. */
const EXTENSION_MAP: Record<string, StackType> = {
    ".dart": "flutter",
    ".kt": "kotlin",
    ".kts": "kotlin",
    ".py": "python",
    ".ts": "typescript",
    ".tsx": "typescript",
    ".go": "go",
};

/** Maps stack type to the corresponding agents directory name. */
const STACK_DIR_MAP: Record<StackType, string> = {
    flutter: "Flutter",
    kotlin: "Kotlin",
    python: "Python",
    typescript: "TypeScript",
    go: "Go",
    bun: "Bun",
};

/** Persona categories within each language directory. */
const CATEGORIES = ["Audit", "Content", "Strategic", "System"] as const;

interface StackDetectionResult {
    stacks: StackType[];
    fileCount: Record<StackType, number>;
}

// Cache to avoid re-scanning the filesystem on every call.
const _agentCache = new Map<string, (new (projectRoot?: string) => BaseActivePersona)[]>();

/**
 * Scans a language directory for persona classes.
 * Convention: `agents/{Language}/{Category}/{name}.ts` → exports `{Name}Persona`
 */
async function discoverAgentsForLanguage(languageDir: string): Promise<(new (root?: string) => BaseActivePersona)[]> {
    if (_agentCache.has(languageDir)) return _agentCache.get(languageDir)!;

    const agents: (new (root?: string) => BaseActivePersona)[] = [];
    const agentsRoot = path.resolve(import.meta.dir, "..", "agents", languageDir);

    if (!fs.existsSync(agentsRoot)) {
        _agentCache.set(languageDir, agents);
        return agents;
    }

    for (const category of CATEGORIES) {
        const categoryDir = path.join(agentsRoot, category);
        if (!fs.existsSync(categoryDir)) continue;

        const files = fs.readdirSync(categoryDir).filter(
            (f) => f.endsWith(".ts") && !f.endsWith(".test.ts") && !f.startsWith("_")
        );

        for (const file of files) {
            try {
                const filePath = path.join(categoryDir, file);
                const mod = await import(filePath);

                // Find the export that ends with 'Persona' and is a constructor
                const personaKey = Object.keys(mod).find(
                    (k) => k.endsWith("Persona") && typeof mod[k] === "function"
                );

                if (personaKey) {
                    agents.push(mod[personaKey]);
                } else {
                    logger.warn(`No *Persona export found in ${languageDir}/${category}/${file}`);
                }
            } catch (err) {
                logger.error(`Failed to load persona ${languageDir}/${category}/${file}: ${err}`);
            }
        }
    }

    _agentCache.set(languageDir, agents);
    logger.debug(`Discovered ${agents.length} agents for ${languageDir}`);
    return agents;
}

export class LanguagePersonaOrchestrator {

    /** Detecta quais stacks estão presentes no contextMap. */
    detectStacks(contextMap: Record<string, any>): StackDetectionResult {
        const fileCount = Object.fromEntries(
            Object.keys(STACK_DIR_MAP).map(s => [s, 0])
        ) as Record<StackType, number>;

        Object.keys(contextMap).forEach(f => {
            const ext = "." + f.split('.').pop();
            if (EXTENSION_MAP[ext]) fileCount[EXTENSION_MAP[ext]]++;
        });

        return {
            stacks: (Object.keys(fileCount) as StackType[]).filter(s => fileCount[s] > 0),
            fileCount
        };
    }

    /** Returns instantiated agents for a given stack. */
    async getAgentsForStack(stack: StackType, projectRoot?: string): Promise<BaseActivePersona[]> {
        const dirName = STACK_DIR_MAP[stack];
        if (!dirName) return [];
        const classes = await discoverAgentsForLanguage(dirName);
        return classes.map(C => new C(projectRoot));
    }

    /** Runs all discovered agents against the given context. */
    async runAll(contextMap: Record<string, any>, projectRoot?: string, forceStacks?: StackType[]): Promise<AuditFinding[]> {
        const detection = this.detectStacks(contextMap);
        const activeStacks = forceStacks || detection.stacks;
        return this._executeAllAgents(activeStacks, contextMap, projectRoot);
    }

    private async _executeAllAgents(stacks: StackType[], contextMap: Record<string, any>, root?: string): Promise<AuditFinding[]> {
        const all: AuditFinding[] = [];
        for (const stack of stacks) {
            const agents = await this.getAgentsForStack(stack, root);
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

    /** Runs strategic reasoning against all detected stacks. */
    async runStrategic(contextMap: Record<string, any>, objective: string, projectRoot?: string): Promise<any[]> {
        const results: any[] = [];
        const stacks = this.detectStacks(contextMap).stacks;
        for (const stack of stacks) {
            const agents = await this.getAgentsForStack(stack, projectRoot);
            for (const agent of agents) {
                agent.setContext({ map: contextMap });
                results.push(...agent.performStrategicAudit(objective));
            }
        }
        return results;
    }

    /** Summarizes findings by severity, stack, and agent. */
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
