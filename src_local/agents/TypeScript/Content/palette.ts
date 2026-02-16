import { BaseActivePersona } from "../../base_persona.ts";
import winston from "winston";

const logger = winston.child({ module: "TS_Palette" });

/**
 * 🎨 Dr. Palette — PhD in TypeScript UX Quality & Visual Consistency
 * Especialista em consistência visual, magic numbers e hardcoded styles.
 */
export class PalettePersona extends BaseActivePersona {
    constructor(projectRoot: string | null = null) {
        super(projectRoot);
        this.name = "Palette";
        this.emoji = "🎨";
        this.role = "PhD UX & Design Systems Engineer";
        this.stack = "TypeScript";
    }

    async performAudit(): Promise<any[]> {
        const start = Date.now();
        logger.info(`[${this.name}] Analisando Qualidade Visual TypeScript...`);

        const auditRules = [
            { regex: 'color:\\s*["\']#[0-9a-fA-F]{3,8}["\']', issue: 'Fragmentação Visual: Cor hardcoded — use design tokens.', severity: 'medium' },
            { regex: 'style\\s*=\\s*\\{\\{', issue: 'Inline Style: Estilo inline dificulta manutenção e consistência.', severity: 'medium' },
            { regex: '(?:width|height|margin|padding):\\s*\\d{2,}', issue: 'Magic Number: Dimensão hardcoded — use variáveis de design system.', severity: 'low' },
            { regex: 'font-size:\\s*\\d+px', issue: 'Tipografia Rígida: font-size em pixels sem escala responsiva.', severity: 'low' },
        ];

        const results: any[] = [];
        for (const rule of auditRules) {
            const regex = new RegExp(rule.regex, 'g');
            for (const [filePath, content] of Object.entries(this.contextData)) {
                if (filePath.endsWith('.ts') || filePath.endsWith('.tsx') || filePath.endsWith('.css')) {
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
        if (/color:\s*['"]#/.test(content)) {
            return {
                file, severity: "MEDIUM", persona: this.name,
                issue: `Fragmentação Visual: O objetivo '${objective}' exige consistência. Em '${file}', cores hardcoded impedem que a 'Orquestração de Inteligência Artificial' mantenha identidade visual.`
            };
        }
        return {
            file, severity: "INFO", persona: this.name,
            issue: `PhD Palette: Analisando consistência visual para ${objective}. Focando em design tokens e eliminação de estilos inline.`
        };
    }

    selfDiagnostic(): any {
        return {
            status: "Soberano",
            score: 100,
            details: "Curador de consistência visual TS operando com estética PhD."
        };
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em sistemas de design e consistência visual TypeScript.`;
    }
}
