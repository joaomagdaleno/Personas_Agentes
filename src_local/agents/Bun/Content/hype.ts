import { BaseActivePersona } from "../../base_persona.ts";
import winston from "winston";

const logger = winston.child({ module: "Bun_Hype" });

/**
 * 🚀 Dr. Hype — PhD in Bun Project Visibility & Registry Presence
 * Especialista em metadados de pacote Bun, publicação e descobribilidade.
 */
export class HypePersona extends BaseActivePersona {
    constructor(projectRoot: string | null = null) {
        super(projectRoot);
        this.name = "Hype";
        this.emoji = "🚀";
        this.role = "PhD Bun Product Evangelist";
        this.stack = "Bun";
    }

    async performAudit(): Promise<any[]> {
        const start = Date.now();
        logger.info(`[${this.name}] Analisando Visibilidade Bun...`);

        const results: any[] = [];
        this.auditPackageFiles(results);
        this.auditProjectPresence(results);

        const duration = (Date.now() - start) / 1000;
        logger.info(`[${this.name}] Auditoria concluída em ${duration.toFixed(4)}s. Achados: ${results.length}`);
        return results;
    }

    private auditPackageFiles(results: any[]) {
        for (const [filePath, content] of Object.entries(this.contextData)) {
            if (filePath.endsWith('package.json')) {
                this.analyzePackageJson(filePath, content as string, results);
            }
        }
    }

    private analyzePackageJson(filePath: string, content: string, results: any[]) {
        try {
            const pkg = JSON.parse(content);
            if (!pkg.description) results.push({ file: filePath, issue: 'Invisível: package.json sem "description".', severity: 'medium', persona: this.name });
            if (!pkg.license) results.push({ file: filePath, issue: 'Risco Legal: package.json sem "license".', severity: 'high', persona: this.name });

            this.checkBunCompatibility(pkg, filePath, results);
        } catch { /* ignore */ }
    }

    private checkBunCompatibility(pkg: any, filePath: string, results: any[]) {
        if (!pkg.module && !pkg.exports) {
            results.push({ file: filePath, issue: 'Bun-Incompatível: Sem campo "module" ou "exports" para ESM Bun.', severity: 'high', persona: this.name });
        }
        if (pkg.engines?.node && !pkg.engines.bun) {
            results.push({ file: filePath, issue: 'Identidade: engines.node mas sem engines.bun — projeto não declara suporte Bun.', severity: 'medium', persona: this.name });
        }
    }

    private auditProjectPresence(results: any[]) {
        const hasReadme = Object.keys(this.contextData).some(f => /readme\.md$/i.test(f));
        if (!hasReadme) {
            results.push({ file: 'ROOT', issue: 'Invisibilidade: Projeto Bun sem README.md.', severity: 'high', persona: this.name });
        }
    }

    async reasonAboutObjective(objective: string, file: string, content: string): Promise<any | null> {
        if (file.endsWith('package.json') && !content.includes('"module"') && !content.includes('"exports"')) {
            return {
                file, severity: "HIGH", persona: this.name,
                issue: `Incompatibilidade Bun: O objetivo '${objective}' exige ESM nativo. Em '${file}', a falta de "module"/"exports" impede a integração Bun.`
            };
        }
        return null;
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em visibilidade e publicação de pacotes Bun.`;
    }
}
