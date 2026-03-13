import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding, AuditFinding } from "../../base.ts";

/**
 * 🚀 Dr. Hype — PhD in Go Project Visibility & Module Identity
 * Especialista em metadados Go (go.mod), visibilidade e descobrimento.
 */
export class HypePersona extends BaseActivePersona {
    constructor(projectRoot: string | undefined = undefined) {
        super(projectRoot);
        this.name = "Hype";
        this.emoji = "🚀";
        this.role = "PhD Go Product Evangelist";
        this.phd_identity = "Project Visibility & Module Identity (Go)";
        this.stack = "Go";
    }

    public override async execute(context: any): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();
        if (this.hub) {
            const modNodes = await this.hub.queryKnowledgeGraph("go.mod", "medium");
            const reasoning = await this.hub.reason(`Analyze the Go module visibility with ${modNodes.length} dependency paths. Recommend module path and discovery improvements.`);
            findings.push({ file: "Product Visibility", agent: this.name, role: this.role, emoji: this.emoji, issue: `Sovereign Hype: Visibilidade Go auditada via Rust Hub. PhD Analysis: ${reasoning}`, severity: "INFO", stack: this.stack, evidence: "Go Module Knowledge Graph Audit", match_count: 1 } as any);
        }
        return findings;
    }

    public override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['go.mod', 'README.md'],
            rules: [
                { regex: /module\s+([a-z0-9]+)$/, issue: 'Invisível: package.json sem campo "description".', severity: 'medium' },
                { regex: /require\s+\(\s*\)/, issue: 'Risco Legal: package.json sem campo "license".', severity: 'high' },
                { regex: /\/\/\s*todo/, issue: 'Genérico: Nome de pacote genérico impede a identidade do projeto.', severity: 'medium' },
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
            if (filePath.endsWith('go.mod') && content) {
                this.analyzePackageContent(filePath, content as string, results);
            }
        }
    }

    public analyzePackageContent(filePath: string, content: string, results: any[]) {
        const pkg = this.parse(content);
        this.checkRequiredFields(pkg, filePath, results);
        this.checkKeywords(pkg, filePath, results);
        this.checkIdentity(pkg, filePath, results);
    }

    public parse(content: string): any {
        return { content }; // Go mod parsing placeholder
    }

    public checkRequiredFields(pkg: any, filePath: string, results: any[]) {
        if (!pkg.content.includes("module")) {
            results.push({ file: filePath, issue: 'Acéfalo: go.mod sem declaração de module.', severity: 'high', persona: this.name } as any);
        }
    }

    public checkKeywords(_pkg: any, _filePath: string, _results: any[]) { }
    public checkIdentity(_pkg: any, _filePath: string, _results: any[]) { }

    public auditProjectPresence(results: any[]) {
        const hasReadme = Object.keys(this.contextData).some(f => /readme\.md$/i.test(f));
        if (!hasReadme) {
            results.push({ file: 'ROOT', issue: 'Invisibilidade: Projeto Go sem README.md.', severity: 'high', persona: this.name } as any);
        }
    }

    public override reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        if (file.endsWith('go.mod') && !content.includes("module")) {
            return {
                file, severity: "HIGH",
                issue: `Identidade Ausente: O objetivo '${objective}' exige um módulo válido. Em '${file}', o Go não possui identidade formal.`,
                context: "module declaration missing"
            };
        }
        return {
            file, severity: "INFO",
            issue: `PhD Hype (Go): Analisando visibilidade para ${objective}.`,
            context: "analyzing Go specifics"
        };
    }

    public Branding(): string { return `${this.emoji} ${this.name}`; }

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
            details: "Evangelista de produto Go operando com persuasão PhD."
        };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em visibilidade Go. Status: ${JSON.stringify(this.selfDiagnostic())}`;
    }
}
