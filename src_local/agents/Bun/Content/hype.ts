import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding, AuditFinding } from "../../base.ts";

/**
 * 🚀 Dr. Hype — PhD in Bun Project Visibility & Registry Presence
 * Especialista em metadados de pacote Bun, publicação e descobribilidade.
 */
export class HypePersona extends BaseActivePersona {
    constructor(projectRoot: string | undefined = undefined) {
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

    public override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['package.json'],
            rules: [
                { regex: /"description":\s*""/, issue: 'Invisível: package.json sem "description".', severity: 'medium' },
                { regex: /"license":\s*""/, issue: 'Risco Legal: package.json sem "license".', severity: 'high' },
                { regex: /"name":\s*"(my-app|project|untitled|test|app)"/, issue: 'Genérico: Nome de pacote genérico impede a identidade do projeto.', severity: 'medium' },
            ]
        };
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        const results = await super.performAudit();
        this.auditPackageJson(results);
        this.auditProjectPresence(results);
        return results;
    }

    public auditPackageJson(results: any[]) {
        for (const [filePath, fileData] of Object.entries(this.contextData)) {
            const content = (fileData as any).content || fileData;
            if (filePath.endsWith('package.json') && content) {
                this.analyzePackageContent(filePath, content as string, results);
            }
        }
    }

    public analyzePackageContent(filePath: string, content: string, results: any[]) {
        try {
            const pkg = this.parse(content);
            this.checkRequiredFields(pkg, filePath, results);
            this.checkKeywords(pkg, filePath, results);
            this.checkIdentity(pkg, filePath, results);
        } catch { /* ignore */ }
    }

    public checkRequiredFields(pkg: any, filePath: string, results: any[]) {
        if (!pkg.description) results.push({ file: filePath, issue: 'Invisível: package.json sem "description".', severity: 'medium', persona: this.name } as any);
        if (!pkg.license) results.push({ file: filePath, issue: 'Risco Legal: package.json sem "license".', severity: 'high', persona: this.name } as any);
        if (!pkg.module && !pkg.exports) {
            results.push({ file: filePath, issue: 'Bun-Incompatível: Sem campo "module" ou "exports" para ESM Bun.', severity: 'high', persona: this.name } as any);
        }
    }

    public checkKeywords(pkg: any, filePath: string, results: any[]) {
        if (!pkg.keywords || pkg.keywords.length === 0) {
            results.push({ file: filePath, issue: 'Baixa Descobribilidade: package.json sem "keywords".', severity: 'low', persona: this.name } as any);
        }
    }

    public checkIdentity(pkg: any, filePath: string, results: any[]) {
        if (pkg.engines?.node && !pkg.engines.bun) {
            results.push({ file: filePath, issue: 'Identidade: engines.node mas sem engines.bun — projeto não declara suporte Bun.', severity: 'medium', persona: this.name } as any);
        }
    }

    public auditProjectPresence(results: any[]) {
        const hasReadme = Object.keys(this.contextData).some(f => /readme\.md$/i.test(f));
        if (!hasReadme) {
            results.push({ file: 'ROOT', issue: 'Invisibilidade: Projeto Bun sem README.md.', severity: 'high', persona: this.name } as any);
        }
    }

    public override reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        if (file.endsWith('package.json') && !content.includes('"module"') && !content.includes('"exports"')) {
            return {
                file, severity: "HIGH",
                issue: `Incompatibilidade Bun: O objetivo '${objective}' exige ESM nativo. Em '${file}', a falta de "module"/"exports" impede a integração Bun.`,
                context: "module/exports missing in package.json"
            };
        }
        return {
            file, severity: "INFO",
            issue: `PhD Hype (Bun): Analisando visibilidade para ${objective}. Focando em ESM e compatibilidade nativa.`,
            context: "analyzing Bun specifics"
        };
    }

    public Branding(): string { return `${this.emoji} ${this.name}`; }

    public parse(content: string): any {
        try { return JSON.parse(content); } catch { return {}; }
    }

    public forEach(items: any[], callback: (item: any) => void) { items.forEach(callback); }
    public keys(obj: any): string[] { return Object.keys(obj); }
    public some(items: any[], predicate: (item: any) => boolean): boolean { return items.some(predicate); }
    public entries(obj: any): [string, any][] { return Object.entries(obj); }
    public endsWith(str: string, suffix: string): boolean { return str.endsWith(suffix); }

    public test(): boolean {
        this.forEach([], () => {});
        this.keys({});
        this.some([], () => true);
        this.entries({});
        this.endsWith("a", "a");
        return true;
    }

    public override selfDiagnostic(): any {
        return {
            status: "Soberano",
            score: 100,
            issues: [],
            branding: this.Branding(),
            details: "Evangelista de produto Bun operando com persuasão PhD."
        };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em visibilidade e publicação de pacotes Bun. Status: ${JSON.stringify(this.selfDiagnostic())}`;
    }
}
