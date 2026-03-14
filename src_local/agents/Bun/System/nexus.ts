import { BaseActivePersona } from "../../base.ts";
import type { AuditFinding, AuditRule, StrategicFinding, ProjectContext } from "../../base.ts";

/**
 * 🌐 Dr. Nexus — PhD in Bun Networking & Bun.serve Resilience
 * Especialista em Bun.serve, WebSockets nativos e resiliência HTTP Bun.
 */
export class NexusPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Nexus";
        this.emoji = "🌐";
        this.role = "PhD Bun Network Resilience Engineer";
        this.phd_identity = "Networking & Bun.serve Resilience Architecture";
        this.stack = "Bun";
    }

    public override async execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]> {
        this.setContext(context);
        const findings: (AuditFinding | StrategicFinding)[] = await this.performAudit();
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.ts', '.tsx', '.js'],
            rules: [
                { regex: /fetch\s*\([^)]*\)(?![\s\S]{0,100}signal|AbortController)/, issue: 'Fragilidade: fetch() sem timeout/AbortController no Bun PhD.', severity: 'high' },
                { regex: /Bun\.serve\([^)]*websocket[^)]*\)(?![\s\S]{0,200}close|error)/, issue: 'WebSocket Frágil: Bun.serve WebSocket sem handler close/error PhD.', severity: 'high' },
                { regex: /new\s+WebSocket\([^)]*\)(?![\s\S]{0,200}onerror)/, issue: 'Conexão Frágil: WebSocket sem handler de erro no Bun PhD.', severity: 'high' },
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
        if (typeof content === 'string' && /fetch\s*\(/.test(content) && !/AbortController|signal/.test(content)) {
            return {
                file, severity: "HIGH",
                issue: `Fragilidade: O objetivo '${objective}' exige resiliência. Em '${file}', fetch sem timeout ameaça o Bun.serve PhD.`,
                context: "fetch without timeout detected"
            };
        }
        return {
            file, severity: "INFO",
            issue: `PhD Nexus (Bun): Analisando conectividade e resiliência de rede para ${objective}.`,
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em redes e resiliência HTTP Bun.`;
    }
}
