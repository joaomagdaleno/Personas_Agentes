import { BaseActivePersona } from "../../base_persona.ts";
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

    async performAudit(): Promise<any[]> {
        const start = Date.now();
        logger.info(`[${this.name}] Analisando Pureza de Tipos TypeScript...`);

        const auditRules = [
            { regex: ':\\s*any\\b', issue: 'Impureza: Tipagem "any" destrói a segurança do type system.', severity: 'high' },
            { regex: 'as\\s+any\\b', issue: 'Escape: Type assertion "as any" — força passagem sem verificação.', severity: 'high' },
            { regex: '@ts-ignore', issue: 'Supressão: @ts-ignore silencia erro do compilador.', severity: 'critical' },
            { regex: '@ts-nocheck', issue: 'Abandono: @ts-nocheck desativa verificação do arquivo inteiro.', severity: 'critical' },
            { regex: '@ts-expect-error', issue: 'Débito: @ts-expect-error — supressão consciente de erro de tipo.', severity: 'medium' },
            { regex: '!\\s*;', issue: 'Risco: Non-null assertion (!) pode causar crash em runtime.', severity: 'medium' },
            { regex: 'Record<string,\\s*any>', issue: 'Opacidade: Record<string, any> — dicionário sem tipagem de valor.', severity: 'medium' },
            { regex: 'Object\\.assign\\(', issue: 'Perda de Tipo: Object.assign pode gerar tipos imprecisos.', severity: 'low' },
        ];

        const results: any[] = [];
        for (const rule of auditRules) {
            const regex = new RegExp(rule.regex, 'g');
            for (const [filePath, content] of Object.entries(this.contextData)) {
                if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
                    for (const match of (content as string).matchAll(regex)) {
                        results.push({ file: filePath, issue: rule.issue, severity: rule.severity, evidence: match[0], persona: this.name });
                    }
                }
            }
        }

        const duration = (Date.now() - start) / 1000;
        logger.info(`[${this.name}] Auditoria concluída em ${duration.toFixed(4)}s. Achados: ${results.length}`);
        return results;
    }

    async reasonAboutObjective(objective: string, file: string, content: string): Promise<any | null> {
        const anyCount = (content.match(/:\s*any\b|as\s+any\b/g) || []).length;
        if (anyCount > 3) {
            return {
                file, severity: "HIGH", persona: this.name,
                issue: `Erosão de Tipos: O objetivo '${objective}' exige segurança. O arquivo '${file}' contém ${anyCount} usos de 'any', destruindo a rastreabilidade da 'Orquestração de Inteligência Artificial'.`
            };
        }
        if (/@ts-ignore|@ts-nocheck/.test(content)) {
            return {
                file, severity: "CRITICAL", persona: this.name,
                issue: `Supressão do Compilador: O objetivo '${objective}' exige integridade. Em '${file}', supressões de tipo permitem erros silenciosos na 'Orquestração de Inteligência Artificial'.`
            };
        }
        return {
            file, severity: "INFO", persona: this.name,
            issue: `PhD Mantra: Analisando pureza de tipos para ${objective}. Focando em eliminação de 'any' e supressões.`
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
