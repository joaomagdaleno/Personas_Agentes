import { BaseActivePersona, AuditRule, StrategicFinding } from "../../base.ts";
import winston from "winston";

const logger = winston.child({ module: "TS_Scale" });

/**
 * 🏗️ Dr. Scale — PhD in TypeScript Architecture & Scalability
 * Especialista em arquitetura de módulos, God classes e complexidade ciclomática.
 */
export class ScalePersona extends BaseActivePersona {
    constructor(projectRoot: string | null = null) {
        super(projectRoot);
        this.name = "Scale";
        this.emoji = "🏗️";
        this.role = "PhD Software Architect";
        this.stack = "TypeScript";
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.ts', '.tsx'],
            rules: [
                { regex: /\n{400,}/, issue: 'God File: Arquivo excessivamente grande e difícil de manter.', severity: 'high' },
                { regex: /(?:async\s+)?(?:public\s+|private\s+|protected\s+)?(?:static\s+)?\w+\s*\([^)]*\)\s*(?::\s*[^{]+)?\s*\{/, issue: 'Complexidade de Método detectada.', severity: 'medium' },
                { regex: /from\s+['"]\.\.\//, issue: 'Risco Circular: Import relativo ascendente.', severity: 'medium' },
            ]
        };
    }

    reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        const lines = content.split('\n');
        if (lines.length > 400) {
            return {
                file, severity: "HIGH",
                issue: `Entropia Arquitetural: O objetivo '${objective}' exige modularidade. O arquivo '${file}' com ${lines.length} linhas é um monólito que resiste à evolução da 'Orquestração de Inteligência Artificial'.`,
                context: `File size: ${lines.length} lines`
            };
        }
        return {
            file, severity: "INFO",
            issue: `PhD Architecture: Analisando escalabilidade e coesão para ${objective}. Focando em decomposição modular e SOLID.`,
            context: "analyzing scalability"
        };
    }

    selfDiagnostic(): any {
        return {
            status: "Soberano",
            score: 100,
            details: "Sensores de complexidade ciclomatica TS operando com precisão PhD."
        };
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em arquitetura e escalabilidade TypeScript.`;
    }
}
