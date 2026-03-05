import { BaseActivePersona } from "../../base_persona.ts";
import winston from "winston";

const logger = winston.child({ module: "Bun_Palette" });

/**
 * 🎨 Dr. Palette — PhD in Bun Frontend & Design Consistency
 * Especialista em consistência visual no ecossistema Bun.
 */
export class PalettePersona extends BaseActivePersona {
    constructor(projectRoot: string | null = null) {
        super(projectRoot);
        this.name = "Palette";
        this.emoji = "🎨";
        this.role = "PhD Bun UX & Design Engineer";
        this.stack = "Bun";
    }

    async performAudit(): Promise<any[]> {
        const start = Date.now();
        logger.info(`[${this.name}] Analisando Consistência Visual Bun...`);

        const auditRules = this.getPaletteRules();
        const results: any[] = [];

        for (const rule of auditRules) {
            this.auditWithRule(rule, results);
        }

        const duration = (Date.now() - start) / 1000;
        logger.info(`[${this.name}] Auditoria concluída em ${duration.toFixed(4)}s. Achados: ${results.length}`);
        return results;
    }

    private getPaletteRules() {
        return [
            { regex: 'color:\\s*["\']#[0-9a-fA-F]{3,8}["\']', issue: 'Fragmentação: Cor hardcoded — use design tokens.', severity: 'medium' },
            { regex: 'style\\s*=\\s*\\{\\{', issue: 'Inline Style: Estilo inline em componente Bun.', severity: 'medium' },
            { regex: '(?:width|height|margin|padding):\\s*\\d{2,}', issue: 'Magic Number: Dimensão hardcoded em componente Bun.', severity: 'low' },
        ];
    }

    private auditWithRule(rule: any, results: any[]) {
        const regex = new RegExp(rule.regex, 'g');
        for (const [filePath, content] of Object.entries(this.contextData)) {
            if (this.shouldAuditFile(filePath)) {
                this.scanContent(filePath, content as string, regex, rule, results);
            }
        }
    }

    private shouldAuditFile(filePath: string): boolean {
        return filePath.endsWith('.ts') || filePath.endsWith('.tsx') || filePath.endsWith('.css');
    }

    private scanContent(filePath: string, content: string, regex: RegExp, rule: any, results: any[]) {
        for (const match of content.matchAll(regex)) {
            results.push({
                file: filePath,
                issue: rule.issue,
                severity: rule.severity,
                evidence: match[0],
                persona: this.name
            });
        }
    }

    async reasonAboutObjective(objective: string, file: string, content: string): Promise<any | null> {
        if (/style\s*=\s*\{\{/.test(content)) {
            return {
                file, severity: "MEDIUM", persona: this.name,
                issue: `Fragmentação Visual: O objetivo '${objective}' exige consistência. Em '${file}', inline styles impedem a evolução visual do projeto Bun.`
            };
        }
        return null;
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em design systems e consistência visual Bun.`;
    }
}
