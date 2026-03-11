import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding, AuditFinding } from "../../base.ts";


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
        this.phd_identity = "Project Visibility & Registry Presence (Bun)";
        this.stack = "Bun";
    }

    public override async execute(context: any): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();
        if (this.hub) {
            const metaNodes = await this.hub.queryKnowledgeGraph("package.json", "medium");
            const reasoning = await this.hub.reason(`Analyze the Bun project visibility with ${metaNodes.length} metadata gaps. Recommend ESM exports and Bun registry improvements.`);
            findings.push({ file: "Product Visibility", agent: this.name, role: this.role, emoji: this.emoji, issue: `Sovereign Hype: Visibilidade Bun validada via Rust Hub. PhD Analysis: ${reasoning}`, severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Metadata Audit", match_count: 1 } as any);
        }
        return findings;
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['package.json'],
            rules: [
                { regex: /"description":\s*""/, issue: 'Invisível: package.json sem "description".', severity: 'medium' },
                { regex: /"license":\s*""/, issue: 'Risco Legal: package.json sem "license".', severity: 'high' },
            ]
        };
    }

    async performAudit(): Promise<AuditFinding[]> {
        const results = await super.performAudit();
        this.auditPackageFiles(results);
        this.auditProjectPresence(results);
        return results;
    }

    private auditPackageFiles(results: any[]) {
        for (const [filePath, fileData] of Object.entries(this.contextData)) {
            if (filePath.endsWith('package.json') && fileData.content) {
                this.analyzePackageJson(filePath, fileData.content, results);
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

    reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        if (file.endsWith('package.json') && !content.includes('"module"') && !content.includes('"exports"')) {
            return {
                file, severity: "HIGH",
                issue: `Incompatibilidade Bun: O objetivo '${objective}' exige ESM nativo. Em '${file}', a falta de "module"/"exports" impede a integração Bun.`,
                context: "module/exports missing in package.json"
            };
        }
        return null;
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em visibilidade e publicação de pacotes Bun.`;
    }
}
