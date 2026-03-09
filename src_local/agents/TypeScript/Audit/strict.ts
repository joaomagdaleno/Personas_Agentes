import { BaseActivePersona, AuditRule, StrategicFinding, AuditFinding } from "../../base.ts";
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

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.ts', '.tsx', 'tsconfig.json'],
            rules: [
                { regex: /"strict":\s*false/, issue: 'Compilador Desarmado: Modo strict desativado no tsconfig.', severity: 'critical' },
                { regex: /@ts-ignore|@ts-nocheck/, issue: 'Supressão detectada.', severity: 'high' },
            ]
        };
    }

    async performAudit(): Promise<AuditFinding[]> {
        const results = await super.performAudit();
        Object.entries(this.contextData).forEach(([f, c]) => {
            if (f.endsWith('tsconfig.json')) StrictAuditHelpers.auditTSConfig(c as string, results, f, this.name);
        });
        return results;
    }

    reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        if (file.endsWith('tsconfig.json') && !content.includes('"strict": true') && !content.includes('"strict":true')) {
            return { file, severity: "CRITICAL", issue: `Compilador Desarmado para ${objective}.`, context: "tsconfig strict false" };
        }
        return { file, severity: "INFO", issue: `PhD Strictness: Analisando ${objective}.`, context: "analyzing strictness" };
    }

    selfDiagnostic(): any { return { status: "Soberano", score: 100, details: "OK" }; }
    getSystemPrompt(): string { return `Você é o Dr. ${this.name}, guardião TS.`; }
}
