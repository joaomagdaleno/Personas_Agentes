import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding, ProjectContext, AuditFinding } from "../../base.ts";

/**
 * 🌊 Dr. Stream — PhD in TypeScript Reactive Programming & Event Management
 * Especialista em event listeners, memory leaks de eventos e gestão reativa.
 */
export class StreamPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Stream";
        this.emoji = "🌊";
        this.role = "PhD Reactive Systems Engineer";
        this.phd_identity = "Reactive Architecture & Event Streaming (TypeScript)";
        this.stack = "TypeScript";
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
                { regex: /addEventListener\([^)]*\)(?![\s\S]{0,200}removeEventListener)/, issue: 'Memory Leak: addEventListener sem correlato removeEventListener PhD.', severity: 'high' },
                { regex: /\.on\([^)]*\)(?![\s\S]{0,200}\.off\(|\.removeListener)/, issue: 'Vazamento: .on() sem descadastro .off() — acúmulo garantido PhD.', severity: 'high' },
                { regex: /setInterval\([^)]*\)(?![\s\S]{0,200}clearInterval)/, issue: 'Timer Leak: setInterval sem clearInterval — execuções fantasmas PhD.', severity: 'high' },
                { regex: /new\s+EventEmitter\(\)(?![\s\S]{0,200}setMaxListeners)/, issue: 'Overflow: EventEmitter sem limite restrito (setMaxListeners) PhD.', severity: 'medium' },
                { regex: /process\.on\(["']uncaughtException/, issue: 'Controle Global: uncaughtException interceptado abruptamente PhD.', severity: 'medium' },
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
                issue: `Instabilidade Reativa: O objetivo '${objective}' exige resiliência. Em '${file}', subscrições contínuas causam memory leaks críticos PhD.`,
                context: "addEventListener without cleanup detected"
            };
        }
        return {
            file, severity: "INFO",
            issue: `PhD Stream (TypeScript): Analisando fluxos reativos para ${objective}. Focando em ciclo de vida e expurgo de memória.`,
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em sistemas reativos e gestão contínua TypeScript.`;
    }
}
