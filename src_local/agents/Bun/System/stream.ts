import { BaseActivePersona } from "../../base.ts";
import type { AuditFinding, AuditRule, StrategicFinding, ProjectContext } from "../../base.ts";

/**
 * 🌊 Dr. Stream — PhD in Bun Reactive Systems & Event Management
 * Especialista em event listeners Bun, memory leaks e gestão reativa.
 */
export class StreamPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Stream";
        this.emoji = "🌊";
        this.role = "PhD Bun Reactive Systems Engineer";
        this.phd_identity = "Reactive Architecture & Event Memory Management (Bun)";
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
                { regex: /addEventListener\([^)]*\)(?![\s\S]{0,200}removeEventListener)/, issue: 'Leak: addEventListener sem correlato removeEventListener no Bun PhD.', severity: 'high' },
                { regex: /\.on\([^)]*\)(?![\s\S]{0,200}\.off\()/, issue: 'Leak: .on() sem descadastro .off() no Bun PhD.', severity: 'high' },
                { regex: /setInterval\([^)]*\)(?![\s\S]{0,200}clearInterval)/, issue: 'Timer Leak: setInterval sem clearInterval no Bun PhD.', severity: 'high' },
                { regex: /Bun\.serve\([^)]*\)(?![\s\S]{0,200}\.stop\()/, issue: 'Servidor Immortal: Bun.serve sem .stop() — sem graceful shutdown PhD.', severity: 'medium' },
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
        if (typeof content === 'string' && /addEventListener/.test(content) && !/removeEventListener/.test(content)) {
            return {
                file, severity: "HIGH",
                issue: `Memory Leak: O objetivo '${objective}' exige estabilidade. Em '${file}', event listeners sem cleanup causam leaks críticos no Bun PhD.`,
                context: "addEventListener without cleanup detected"
            };
        }
        return {
            file, severity: "INFO",
            issue: `PhD Stream (Bun): Analisando fluxos reativos e prevenção de vazamentos para ${objective}.`,
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em sistemas reativos e gestão contínua Bun.`;
    }
}
