import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding, ProjectContext, AuditFinding } from "../../base.ts";

/**
 * 🌐 Dr. Nexus — PhD in TypeScript Networking & HTTP Resilience
 * Especialista em timeout, retries, abort controllers e fetch resiliente.
 */
export class NexusPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Nexus";
        this.emoji = "🌐";
        this.role = "PhD Network Resilience Engineer";
        this.phd_identity = "Robust Networking & HTTP Resiliency (TypeScript)";
        this.stack = "TypeScript";
    }

    public override async execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]> {
        this.setContext(context);
        const findings: (AuditFinding | StrategicFinding)[] = await this.performAudit();
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.ts', '.tsx'],
            rules: [
                { regex: /fetch\s*\([^)]*\)(?![\s\S]{0,100}signal|timeout|AbortController)/, issue: 'Fragilidade: fetch() sem timeout ou AbortController — pendurado para sempre PhD.', severity: 'high' },
                { regex: /axios\.(?:get|post)\([^)]*\)(?![\s\S]{0,50}timeout)/, issue: 'Fragilidade: Chamada axios sem timeout configurado PhD.', severity: 'high' },
                { regex: /setTimeout\s*\([^)]*,\s*0\s*\)/, issue: 'Hack: setTimeout(fn, 0) — geralmente indica problema de design estrutural PhD.', severity: 'low' },
                { regex: /WebSocket\s*\([^)]*\)(?![\s\S]{0,100}onclose|onerror)/, issue: 'Conexão Frágil: WebSocket sem handler de erro ou desconexão PhD.', severity: 'high' },
            ]
        };
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const rules = this.getAuditRules();
        const results = await this.findPatterns(rules.extensions, rules.rules);
        this.endMetrics(results.length);
        return results;
    }

    public override reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | null {
        if (typeof content === 'string' && (/fetch\s*\(/.test(content)) && !/AbortController|signal|timeout/.test(content)) {
            return {
                file, severity: "HIGH",
                issue: `Fragilidade Nervosa: O objetivo '${objective}' exige resiliência. Em '${file}', chamadas HTTP sem timeout ameaçam o sistema PhD.`,
                context: "fetch without timeout detected"
            };
        }
        return {
            file, severity: "INFO",
            issue: `PhD Nexus (TypeScript): Analisando resiliência de rede para ${objective}. Focando em timeouts e circuit breakers.`,
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em redes e resiliência HTTP TypeScript.`;
    }
}
