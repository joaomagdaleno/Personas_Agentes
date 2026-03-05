import { BaseActivePersona } from "../../base_persona.ts";
import winston from "winston";

const logger = winston.child({ module: "Bun_Spark" });

/**
 * ✨ Dr. Spark — PhD in Bun Developer Experience & CLI Quality
 * Especialista em DX Bun, feedback visual e experiência de CLI.
 */
export class SparkPersona extends BaseActivePersona {
    constructor(projectRoot: string | null = null) {
        super(projectRoot);
        this.name = "Spark";
        this.emoji = "✨";
        this.role = "PhD Bun Developer Experience Engineer";
        this.stack = "Bun";
    }

    async performAudit(): Promise<any[]> {
        const start = Date.now();
        logger.info(`[${this.name}] Analisando DX Bun...`);

        const auditRules = this.getDXRules();
        const results: any[] = [];

        for (const rule of auditRules) {
            this.auditWithRule(rule, results);
        }

        const duration = (Date.now() - start) / 1000;
        logger.info(`[${this.name}] Auditoria concluída em ${duration.toFixed(4)}s. Achados: ${results.length}`);
        return results;
    }

    private getDXRules() {
        return [
            { regex: 'process\\.exit\\(\\d+\\)(?![\\s\\S]{0,30}console|log)', issue: 'Saída Silenciosa: process.exit() sem mensagem no Bun.', severity: 'medium' },
            { regex: 'throw\\s+new\\s+Error\\(["\']["\']\\)', issue: 'Erro Mudo: Error lançado com mensagem vazia no Bun.', severity: 'medium' },
            { regex: 'Bun\\.spawn\\(\\[[^\\]]*\\]\\)(?![\\s\\S]{0,50}stdout|stderr)', issue: 'Spawn Cego: Bun.spawn sem captura de stdout/stderr.', severity: 'medium' },
        ];
    }

    private auditWithRule(rule: any, results: any[]) {
        const regex = new RegExp(rule.regex, 'gs');
        for (const [filePath, content] of Object.entries(this.contextData)) {
            if (this.shouldAuditFile(filePath)) {
                this.scanContent(filePath, content as string, regex, rule, results);
            }
        }
    }

    private shouldAuditFile(filePath: string): boolean {
        return filePath.endsWith('.ts') || filePath.endsWith('.tsx');
    }

    private scanContent(filePath: string, content: string, regex: RegExp, rule: any, results: any[]) {
        for (const match of content.matchAll(regex)) {
            results.push({
                file: filePath,
                issue: rule.issue,
                severity: rule.severity,
                evidence: match[0].substring(0, 60),
                persona: this.name
            });
        }
    }

    async reasonAboutObjective(objective: string, file: string, content: string): Promise<any | null> {
        if (/process\.exit\(\d+\)/.test(content)) {
            return {
                file, severity: "MEDIUM", persona: this.name,
                issue: `DX: O objetivo '${objective}' exige interface premium. Em '${file}', saídas silenciosas prejudicam a experiência Bun.`
            };
        }
        return null;
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em DX e experiência de CLI Bun.`;
    }
}
