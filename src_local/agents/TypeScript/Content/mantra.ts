import { BaseActivePersona, AuditRule, StrategicFinding } from "../../base.ts";
import winston from "winston";

const logger = winston.child({ module: "TS_Mantra" });

/**
 * 🔮 Dr. Mantra — PhD in TypeScript Type Purity & Strictness
 * Especialista em segurança de tipos, uso de `any`, type assertions e @ts-ignore.
 */
export class MantraPersona extends BaseActivePersona {
    constructor(projectRoot: string | null = null) {
        super(projectRoot);
        this.name = "Mantra";
        this.emoji = "🔮";
        this.role = "PhD Type System Guardian";
        this.stack = "TypeScript";
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.ts', '.tsx'],
            rules: [
                { regex: /:\s*any\b/, issue: 'Impureza: Tipagem "any" destrói a segurança do type system.', severity: 'high' },
                { regex: /as\s+any\b/, issue: 'Escape: Type assertion "as any" — força passagem sem verificação.', severity: 'high' },
                { regex: /@ts-ignore/, issue: 'Supressão: @ts-ignore silencia erro do compilador.', severity: 'critical' },
                { regex: /@ts-nocheck/, issue: 'Abandono: @ts-nocheck desativa verificação do arquivo inteiro.', severity: 'critical' },
                { regex: /@ts-expect-error/, issue: 'Débito: @ts-expect-error — supressão consciente de erro de tipo.', severity: 'medium' },
                { regex: /!\s*;/, issue: 'Risco: Non-null assertion (!) pode causar crash em runtime.', severity: 'medium' },
                { regex: /Record<string,\s*any>/, issue: 'Opacidade: Record<string, any> — dicionário sem tipagem de valor.', severity: 'medium' },
                { regex: /Object\.assign\(/, issue: 'Perda de Tipo: Object.assign pode gerar tipos imprecisos.', severity: 'low' },
            ]
        };
    }

    reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        const anyCount = (content.match(/:\s*any\b|as\s+any\b/g) || []).length;
        if (anyCount > 3) {
            return {
                file, severity: "HIGH",
                issue: `Erosão de Tipos: O objetivo '${objective}' exige segurança. O arquivo '${file}' contém ${anyCount} usos de 'any', destruindo a rastreabilidade da 'Orquestração de Inteligência Artificial'.`,
                context: `Found ${anyCount} any usages`
            };
        }
        if (/@ts-ignore|@ts-nocheck/.test(content)) {
            return {
                file, severity: "CRITICAL",
                issue: `Supressão do Compilador: O objetivo '${objective}' exige integridade. Em '${file}', supressões de tipo permitem erros silenciosos na 'Orquestração de Inteligência Artificial'.`,
                context: "Compiler suppression detected"
            };
        }
        return {
            file, severity: "INFO",
            issue: `PhD Mantra: Analisando pureza de tipos para ${objective}. Focando em eliminação de 'any' e supressões.`,
            context: "analyzing type purity"
        };
    }

    selfDiagnostic(): any {
        return {
            status: "Soberano",
            score: 100,
            details: "Guardião da pureza de tipos TS operando com rigor PhD."
        };
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, guardião da pureza e integridade do type system TypeScript.`;
    }
}
