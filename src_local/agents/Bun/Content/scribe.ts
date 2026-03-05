import { BaseActivePersona } from "../../base_persona.ts";
import winston from "winston";

const logger = winston.child({ module: "Bun_Scribe" });

/**
 * 📝 Dr. Scribe — PhD in Bun Documentation & API Clarity
 */
export class ScribePersona extends BaseActivePersona {
    constructor(projectRoot: string | null = null) {
        super(projectRoot);
        this.name = "Scribe";
        this.emoji = "📝";
        this.role = "PhD Bun Documentation Engineer";
        this.stack = "Bun";
    }

    async performAudit(): Promise<any[]> {
        const start = Date.now();
        logger.info(`[${this.name}] Analisando Documentação Bun...`);

        const results: any[] = [];
        for (const [filePath, content] of Object.entries(this.contextData)) {
            this.auditFile(filePath, content as string, results);
        }

        const duration = (Date.now() - start) / 1000;
        logger.info(`[${this.name}] Auditoria concluída em ${duration.toFixed(4)}s. Achados: ${results.length}`);
        return results;
    }

    private auditFile(filePath: string, content: string, results: any[]) {
        if (!this.isAuditable(filePath)) return;

        const exportMatches = content.match(/export\s+(?:async\s+)?(?:function|class|const|interface|type|enum)\s+\w+/g);
        const jsdocCount = (content.match(/\/\*\*[\s\S]*?\*\//g) || []).length;

        if (exportMatches && exportMatches.length > 0 && jsdocCount === 0) {
            results.push({
                file: filePath,
                issue: `Amnésia: ${exportMatches.length} exportações Bun sem nenhum JSDoc.`,
                severity: 'high', persona: this.name
            });
        }
    }

    private isAuditable(filePath: string): boolean {
        const isTS = filePath.endsWith('.ts') || filePath.endsWith('.tsx');
        const isTest = filePath.endsWith('.test.ts') || filePath.endsWith('.spec.ts');
        return isTS && !isTest;
    }

    async reasonAboutObjective(objective: string, file: string, content: string): Promise<any | null> {
        const exports = (content.match(/export\s+(?:async\s+)?(?:function|class)\s+\w+/g) || []).length;
        const docs = (content.match(/\/\*\*[\s\S]*?\*\//g) || []).length;
        if (exports > 0 && docs === 0) {
            return {
                file, severity: "HIGH", persona: this.name,
                issue: `Caixa Preta: O objetivo '${objective}' exige transparência. Em '${file}', a falta de JSDoc torna o módulo Bun opaco.`
            };
        }
        return null;
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em documentação e clareza de APIs Bun.`;
    }
}
