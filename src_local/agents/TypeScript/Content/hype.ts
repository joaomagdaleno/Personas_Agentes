import { BaseActivePersona } from "../../base_persona.ts";
import winston from "winston";

const logger = winston.child({ module: "TS_Hype" });

/**
 * 🚀 Dr. Hype — PhD in TypeScript Product Visibility & Branding
 * Especialista em metadados de projeto, identidade e descobribilidade.
 */
export class HypePersona extends BaseActivePersona {
    constructor(projectRoot: string | null = null) {
        super(projectRoot);
        this.name = "Hype";
        this.emoji = "🚀";
        this.role = "PhD Product Evangelist";
        this.stack = "TypeScript";
    }

    async performAudit(): Promise<any[]> {
        const start = Date.now();
        logger.info(`[${this.name}] Analisando Visibilidade de Produto TypeScript...`);

        const results: any[] = [];
        // Check package.json for missing metadata
        for (const [filePath, content] of Object.entries(this.contextData)) {
            if (filePath.endsWith('package.json')) {
                try {
                    const pkg = JSON.parse(content as string);
                    if (!pkg.description) results.push({ file: filePath, issue: 'Invisível: package.json sem campo "description".', severity: 'medium', persona: this.name });
                    if (!pkg.repository) results.push({ file: filePath, issue: 'Desconectado: package.json sem campo "repository".', severity: 'medium', persona: this.name });
                    if (!pkg.license) results.push({ file: filePath, issue: 'Risco Legal: package.json sem campo "license".', severity: 'high', persona: this.name });
                    if (!pkg.keywords || pkg.keywords.length === 0) results.push({ file: filePath, issue: 'Baixa Descobribilidade: package.json sem "keywords".', severity: 'low', persona: this.name });
                    if (!pkg.author) results.push({ file: filePath, issue: 'Anônimo: package.json sem campo "author".', severity: 'low', persona: this.name });
                    if (pkg.name && /^(my-app|project|untitled|test|app)$/.test(pkg.name)) {
                        results.push({ file: filePath, issue: 'Genérico: Nome de pacote genérico impede a identidade do projeto.', severity: 'medium', persona: this.name });
                    }
                } catch { /* not valid JSON */ }
            }
        }

        // Check for README
        const hasReadme = Object.keys(this.contextData).some(f => /readme\.md$/i.test(f));
        if (!hasReadme) {
            results.push({ file: 'ROOT', issue: 'Invisibilidade Total: Projeto sem README.md.', severity: 'high', persona: this.name });
        }

        const duration = (Date.now() - start) / 1000;
        logger.info(`[${this.name}] Auditoria concluída em ${duration.toFixed(4)}s. Achados: ${results.length}`);
        return results;
    }

    async reasonAboutObjective(objective: string, file: string, content: string): Promise<any | null> {
        if (file.endsWith('package.json') && !content.includes('"description"')) {
            return {
                file, severity: "MEDIUM", persona: this.name,
                issue: `Invisibilidade: O objetivo '${objective}' exige tração. Em '${file}', a falta de metadados prejudica a descoberta da 'Orquestração de Inteligência Artificial'.`
            };
        }
        return {
            file, severity: "INFO", persona: this.name,
            issue: `PhD Hype: Analisando visibilidade para ${objective}. Focando em SEO de pacotes e identidade de produto.`
        };
    }

    selfDiagnostic(): any {
        return {
            status: "Soberano",
            score: 100,
            details: "Evangelista de produto TS operando com persuasão PhD."
        };
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em visibilidade e evangelização de produto TypeScript.`;
    }
}
