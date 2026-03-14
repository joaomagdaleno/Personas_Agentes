import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding, ProjectContext, AuditFinding } from "../../base.ts";

/**
 * 🔄 Dr. Flow — PhD in TypeScript Control Flow & Async Patterns
 * Especialista em callback hell, async/await, e fluxos de controle complexos.
 */
export class FlowPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Flow";
        this.emoji = "🔄";
        this.role = "PhD Control Flow Architect";
        this.phd_identity = "Control Flow & Async Promises (TypeScript)";
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
                { regex: /\.then\([^)]*\)\.then\([^)]*\)\.then/, issue: 'Callback Hell: Cadeia .then().then().then() — use async/await PhD.', severity: 'high' },
                { regex: /if\s*\([^)]+\)\s*\{[^}]*if\s*\([^)]+\)\s*\{[^}]*if/, issue: 'Pirâmide: Aninhamento profundo de ifs — refatore com early returns PhD.', severity: 'medium' },
                { regex: /switch\s*\([^)]*\)\s*\{(?:[^}]*case[^}]*){10,}/, issue: 'Switch Monolítico: Muitos cases — use padrão Strategy ou Map PhD.', severity: 'medium' },
                { regex: /Promise\.all\([^)]*\.map\(async/, issue: 'Risco de Paralelismo: Promise.all com map assíncrono sem limite de concorrência PhD.', severity: 'medium' },
            ]
        };
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const rules = this.getAuditRules();
        const results = await this.findPatterns(rules.extensions, rules.rules);

        if (results.some(r => r.severity === "high")) {
            results.push({
                file: "TS_FLOW", agent: this.name, role: this.role, emoji: this.emoji,
                issue: "Async Integrity: High entropy promise chain or callback hell detected.",
                severity: "high", stack: this.stack, evidence: "Structural Analysis", match_count: 1, context: "Control Flow"
            } as any);
        }

        this.endMetrics(results.length);
        return results;
    }

    public override reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | null {
        if (typeof content === 'string' && (/\.then\([^)]*\)\.then\([^)]*\)\.then/.test(content))) {
            return {
                file, severity: "HIGH",
                issue: `Entropia Lógica: O objetivo '${objective}' exige clareza. Em '${file}', callback hell obscurece o fluxo PhD.`,
                context: "Callback hell detected"
            };
        }
        return {
            file, severity: "INFO",
            issue: `PhD Flow (TypeScript): Analisando arquitetura assíncrona para ${objective}. Focando em async/await e linearidade ciclomática.`,
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em fluxos de controle e arquitetura assíncrona TypeScript.`;
    }
}
