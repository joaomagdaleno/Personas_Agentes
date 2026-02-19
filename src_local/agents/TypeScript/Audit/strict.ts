import { BaseActivePersona } from "../../base_active_persona.ts";
import winston from "winston";
import { StrictAuditHelpers } from "./StrictAuditHelpers.ts";

const logger = winston.child({ module: "TS_Strict" });

/**
 * 🔒 Dr. Strict — PhD in TypeScript Compiler Strictness
 */
export class StrictPersona extends BaseActivePersona {
    constructor(projectRoot: string | null = null) {
        super(projectRoot);
        this.name = "Strict";
        this.emoji = "🔒";
        this.role = "PhD TypeScript Compiler Guardian";
        this.stack = "TypeScript";
    }

    async performAudit(): Promise<any[]> {
        const start = Date.now(), results: any[] = [];
        logger.info(`[${this.name}] Analisando Strictness...`);

        Object.entries(this.contextData).forEach(([f, c]) => {
            if (f.endsWith('tsconfig.json')) StrictAuditHelpers.auditTSConfig(c as string, results, f, this.name);
            if (f.endsWith('.ts') || f.endsWith('.tsx')) StrictAuditHelpers.detectSuppressions(c as string, results, f, this.name);
        });

        const duration = (Date.now() - start) / 1000;
        logger.info(`[${this.name}] Auditoria concluída em ${duration.toFixed(4)}s. Achados: ${results.length}`);
        return results;
    }

    async reasonAboutObjective(objective: string, file: string, content: string): Promise<any | null> {
        if (file.endsWith('tsconfig.json') && !content.includes('"strict": true') && !content.includes('"strict":true')) {
            return { file, severity: "CRITICAL", persona: this.name, issue: `Compilador Desarmado para ${objective}.` };
        }
        return { file, severity: "INFO", persona: this.name, issue: `PhD Strictness: Analisando ${objective}.` };
    }

    selfDiagnostic(): any { return { status: "Soberano", score: 100, details: "OK" }; }
    getSystemPrompt(): string { return `Você é o Dr. ${this.name}, guardião TS.`; }
}
