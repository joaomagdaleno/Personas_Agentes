import { BaseActivePersona } from "../../base_persona.ts";
import winston from "winston";

const logger = winston.child({ module: "TS_Scribe" });

/**
 * 📝 Dr. Scribe — PhD in TypeScript Documentation & Knowledge
 */
export class ScribePersona extends BaseActivePersona {
    constructor(projectRoot: string | null = null) {
        super(projectRoot);
        this.name = "Scribe";
        this.emoji = "📝";
        this.role = "PhD Documentation Engineer";
        this.stack = "TypeScript";
    }

    async performAudit(): Promise<any[]> {
        const start = Date.now();
        logger.info(`[${this.name}] Analisando Documentation TypeScript...`);

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

        if (this.isMissingDocumentation(exportMatches, jsdocCount)) {
            results.push(this.createFinding(filePath, exportMatches!.length, jsdocCount));
        }
    }

    private isAuditable(filePath: string): boolean {
        const isTS = filePath.endsWith('.ts') || filePath.endsWith('.tsx');
        const isTest = filePath.endsWith('.test.ts') || filePath.endsWith('.spec.ts');
        return isTS && !isTest;
    }

    private isMissingDocumentation(exportMatches: RegExpMatchArray | null, jsdocCount: number): boolean {
        return !!exportMatches && exportMatches.length > 0 && (jsdocCount === 0 || exportMatches.length > jsdocCount * 2);
    }

    private createFinding(file: string, exports: number, jsdocs: number) {
        if (jsdocs === 0) {
            return { file, issue: `Amnésia Técnica: ${exports} exportações sem nenhum JSDoc — caixa preta total.`, severity: 'high', persona: this.name };
        }
        return { file, issue: `Documentação Parcial: ${exports} exportações mas apenas ${jsdocs} blocos JSDoc.`, severity: 'medium', persona: this.name };
    }

    async reasonAboutObjective(objective: string, file: string, content: string): Promise<any | null> {
        const exports = (content.match(/export\s+(?:async\s+)?(?:function|class)\s+\w+/g) || []).length;
        const docs = (content.match(/\/\*\*[\s\S]*?\*\//g) || []).length;

        if (exports > 0 && docs === 0) {
            return {
                file, severity: "HIGH", persona: this.name,
                issue: `Amnésia Técnica: O objetivo '${objective}' exige clareza. Em '${file}', a falta de documentação torna a 'Orquestração de Inteligência Artificial' um sistema de caixa preta.`
            };
        }
        return {
            file, severity: "INFO", persona: this.name,
            issue: `PhD Scribe: Analisando explicabilidade para ${objective}.`
        };
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em documentação e transferência de conhecimento TypeScript.`;
    }
}
