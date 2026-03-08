import { BaseActivePersona, AuditRule, StrategicFinding } from "../../base.ts";
import winston from "winston";

const logger = winston.child({ module: "TS_Flow" });

/**
 * 🔄 Dr. Flow — PhD in TypeScript Control Flow & Async Patterns
 * Especialista em callback hell, async/await, e fluxos de controle complexos.
 */
export class FlowPersona extends BaseActivePersona {
    constructor(projectRoot: string | null = null) {
        super(projectRoot);
        this.name = "Flow";
        this.emoji = "🔄";
        this.role = "PhD Control Flow Architect";
        this.stack = "TypeScript";
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.ts', '.tsx'],
            rules: [
                { regex: /\.then\([^)]*\)\.then\([^)]*\)\.then/, issue: 'Callback Hell: Cadeia .then().then().then() — use async/await.', severity: 'high' },
                { regex: /if\s*\([^)]+\)\s*\{[^}]*if\s*\([^)]+\)\s*\{[^}]*if/, issue: 'Pirâmide: Aninhamento profundo de ifs — refatore com early returns.', severity: 'medium' },
                { regex: /switch\s*\([^)]*\)\s*\{(?:[^}]*case[^}]*){10,}/, issue: 'Switch Monolítico: Muitos cases — use padrão Strategy ou Map.', severity: 'medium' },
                { regex: /Promise\.all\([^)]*\.map\(async/, issue: 'Risco de Paralismo: Promise.all com map assíncrono sem limite de concorrência.', severity: 'medium' },
            ]
        };
    }

    reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        if (/\.then\([^)]*\)\.then\([^)]*\)\.then/.test(content)) {
            return {
                file, severity: "HIGH",
                issue: `Entropia Lógica: O objetivo '${objective}' exige clareza. Em '${file}', callback hell obscurece o fluxo da 'Orquestração de Inteligência Artificial'.`,
                context: "Callback hell detected"
            };
        }
        return {
            file, severity: "INFO",
            issue: `PhD Flow: Analisando arquitetura assíncrona para ${objective}. Focando em async/await e simplicidade ciclomatica.`,
            context: "analyzing async architecture"
        };
    }

    selfDiagnostic(): any {
        return {
            status: "Soberano",
            score: 100,
            details: "Arquiteto de fluxo TS operando com fluidez PhD."
        };
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em fluxos de controle e arquitetura assíncrona TypeScript.`;
    }
}
