import { BaseActivePersona, AuditRule, StrategicFinding } from "../../base.ts";
import winston from "winston";

const logger = winston.child({ module: "Bun_Flow" });

/**
 * 🔄 Dr. Flow — PhD in Bun Control Flow & Shell Scripting
 * Especialista em Bun.$ shell, Bun.spawn e fluxos de controle assíncronos.
 */
export class FlowPersona extends BaseActivePersona {
    constructor(projectRoot: string | null = null) {
        super(projectRoot);
        this.name = "Flow";
        this.emoji = "🔄";
        this.role = "PhD Bun Control Flow Architect";
        this.stack = "Bun";
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.ts', '.tsx'],
            rules: [
                { regex: /\.then\([^)]*\)\.then\([^)]*\)\.then/, issue: 'Callback Hell: Cadeia .then() em Bun — use async/await.', severity: 'high' },
                { regex: /Bun\.spawn\(\[[^\]]*\]\)(?![\s\S]{0,100}await)/, issue: 'Fire-and-Forget: Bun.spawn sem await — processo pode não completar.', severity: 'high' },
                { regex: /Bun\.\$`[^`]*`(?![\s\S]{0,50}await|try)/, issue: 'Bun Shell: Bun.$ sem await ou try-catch — erro silenciado.', severity: 'medium' },
            ]
        };
    }

    reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        if (/\.then\([^)]*\)\.then\([^)]*\)\.then/.test(content)) {
            return {
                file, severity: "HIGH",
                issue: `Entropia: O objetivo '${objective}' exige clareza. Em '${file}', callback chains obscurecem o fluxo Bun.`,
                context: "Callback hell detected"
            };
        }
        return null;
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em fluxos de controle e shell scripting Bun.`;
    }
}
