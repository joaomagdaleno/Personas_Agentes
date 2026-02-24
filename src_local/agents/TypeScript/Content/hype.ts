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
        this.auditPackageJson(results);
        this.auditProjectPresence(results);

        const duration = (Date.now() - start) / 1000;
        logger.info(`[${this.name}] Auditoria concluída em ${duration.toFixed(4)}s. Achados: ${results.length}`);
        return results;
    }

    private auditPackageJson(results: any[]) {
        for (const [filePath, content] of Object.entries(this.contextData)) {
            if (filePath.endsWith('package.json')) {
                this.analyzePackageContent(filePath, content as string, results);
            }
        }
    }

    private analyzePackageContent(filePath: string, content: string, results: any[]) {
        try {
            const pkg = JSON.parse(content);
            this.checkRequiredFields(pkg, filePath, results);
            this.checkKeywords(pkg, filePath, results);
            this.checkIdentity(pkg, filePath, results);
        } catch { /* ignore invalid json */ }
    }

    private checkRequiredFields(pkg: any, filePath: string, results: any[]) {
        const checks = [
            { field: 'description', issue: 'Invisível: package.json sem campo "description".', severity: 'medium' },
            { field: 'repository', issue: 'Desconectado: package.json sem campo "repository".', severity: 'medium' },
            { field: 'license', issue: 'Risco Legal: package.json sem campo "license".', severity: 'high' },
            { field: 'author', issue: 'Anônimo: package.json sem campo "author".', severity: 'low' },
        ];

        checks.forEach(check => {
            if (!pkg[check.field]) {
                results.push({ file: filePath, issue: check.issue, severity: check.severity, persona: this.name });
            }
        });
    }

    private checkKeywords(pkg: any, filePath: string, results: any[]) {
        if (!pkg.keywords || pkg.keywords.length === 0) {
            results.push({ file: filePath, issue: 'Baixa Descobribilidade: package.json sem "keywords".', severity: 'low', persona: this.name });
        }
    }

    private checkIdentity(pkg: any, filePath: string, results: any[]) {
        const genericNames = /^(my-app|project|untitled|test|app)$/;
        if (pkg.name && genericNames.test(pkg.name)) {
            results.push({ file: filePath, issue: 'Genérico: Nome de pacote genérico impede a identidade do projeto.', severity: 'medium', persona: this.name });
        }
    }

    private auditProjectPresence(results: any[]) {
        const hasReadme = Object.keys(this.contextData).some(f => /readme\.md$/i.test(f));
        if (!hasReadme) {
            results.push({ file: 'ROOT', issue: 'Invisibilidade Total: Projeto sem README.md.', severity: 'high', persona: this.name });
        }
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
