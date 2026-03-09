import { BaseActivePersona, AuditRule, StrategicFinding } from "../../base.ts";
import winston from "winston";

const logger = winston.child({ module: "TS_Forge" });

/**
 * 🔨 Dr. Forge — PhD in TypeScript Code Generation & Safety
 * Especialista em detecção de eval(), new Function() e execução dinâmica perigosa.
 */
export class ForgePersona extends BaseActivePersona {
    constructor(projectRoot: string | null = null) {
        super(projectRoot);
        this.name = "Forge";
        this.emoji = "🔨";
        this.role = "PhD Automation & Safety Engineer";
        this.stack = "TypeScript";
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.ts', '.tsx'],
            rules: [
                { regex: /\beval\s*\(/, issue: 'Vulnerabilidade Crítica: eval() permite execução arbitrária de código.', severity: 'critical' },
                { regex: /new\s+Function\s*\(/, issue: 'Risco de Injeção: new Function() cria código em runtime.', severity: 'critical' },
                { regex: /document\.write\s*\(/, issue: 'Inseguro: document.write pode injetar scripts maliciosos.', severity: 'high' },
                { regex: /innerHTML\s*=/, issue: 'XSS Potencial: innerHTML sem sanitização permite injeção.', severity: 'high' },
                { regex: /setTimeout\s*\(\s*["']/, issue: 'eval Disfarçado: setTimeout com string executa código implícito.', severity: 'high' },
            ]
        };
    }

    reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        if (/\beval\s*\(|new\s+Function\s*\(/.test(content)) {
            return {
                file, severity: "CRITICAL",
                issue: `Risco de Autonomia: O objetivo '${objective}' exige segurança de execução. Em '${file}', a execução dinâmica de código compromete a 'Orquestração de Inteligência Artificial'.`,
                context: "Dynamic execution detected"
            };
        }
        return {
            file, severity: "INFO",
            issue: `PhD Forge: Analisando segurança de automação para ${objective}. Focando em sanitização de execução dinâmica.`,
            context: "analyzing automation safety"
        };
    }

    selfDiagnostic(): any {
        return {
            status: "Soberano",
            score: 100,
            details: "Guardião de execução dinâmica TS operando com rigor PhD."
        };
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em automação e segurança de codegen TypeScript.`;
    }
}
