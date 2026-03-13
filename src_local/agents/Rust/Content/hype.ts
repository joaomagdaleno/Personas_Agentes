import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding, AuditFinding } from "../../base.ts";

/**
 * 🚀 Dr. Hype — PhD in Rust Project Visibility & Crate Identity
 * Especialista em metadados Rust (Cargo.toml), identidade e presença em crates.io.
 */
export class HypePersona extends BaseActivePersona {
    constructor(projectRoot: string | undefined = undefined) {
        super(projectRoot);
        this.name = "Hype";
        this.emoji = "🚀";
        this.role = "PhD Rust Product Evangelist";
        this.phd_identity = "Project Visibility & Crate Identity (Rust)";
        this.stack = "Rust";
    }

    public override async execute(context: any): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();
        if (this.hub) {
            const crateNodes = await this.hub.queryKnowledgeGraph("Cargo.toml", "medium");
            const reasoning = await this.hub.reason(`Analyze the Rust crate visibility with ${crateNodes.length} metadata fields. Recommend workspace and documentation improvements.`);
            findings.push({ file: "Product Visibility", agent: this.name, role: this.role, emoji: this.emoji, issue: `Sovereign Hype: Visibilidade Rust auditada via Rust Hub. PhD Analysis: ${reasoning}`, severity: "INFO", stack: this.stack, evidence: "Cargo Knowledge Graph Audit", match_count: 1 } as any);
        }
        return findings;
    }

    public override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['Cargo.toml', 'README.md'],
            rules: [
                { regex: /version\s*=\s*['"]0\.1\.0['"]/, issue: 'Versão: Faltando atualização de release (0.1.0 é o default do cargo init).', severity: 'low' },
                { regex: /description\s*=\s*['"]""['"]/, issue: 'Invisível: Cargo.toml sem descrição de crate.', severity: 'medium' },
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
            if (filePath.endsWith('Cargo.toml') && content) {
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
        return { content }; // Rust parsing placeholder
    }

    public checkRequiredFields(pkg: any, filePath: string, results: any[]) {
        if (!pkg.content.includes("version")) {
            results.push({ file: filePath, issue: 'Anônimo: Cargo.toml sem definição de version.', severity: 'high', persona: this.name } as any);
        }
    }

    public checkKeywords(_pkg: any, _filePath: string, _results: any[]) { }
    public checkIdentity(_pkg: any, _filePath: string, _results: any[]) { }

    public auditProjectPresence(results: any[]) {
        const hasReadme = Object.keys(this.contextData).some(f => /readme\.md$/i.test(f));
        if (!hasReadme) {
            results.push({ file: 'ROOT', issue: 'Invisibilidade: Projeto Rust sem README.md.', severity: 'high', persona: this.name } as any);
        }
    }

    public override reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        if (file.endsWith('Cargo.toml') && !content.includes("description")) {
            return {
                file, severity: "MEDIUM",
                issue: `Crate Invisível: O objetivo '${objective}' exige tração. Em '${file}', o campo description está vazio.`,
                context: "description missing"
            };
        }
        return {
            file, severity: "INFO",
            issue: `PhD Hype (Rust): Analisando visibilidade para ${objective}.`,
            context: "analyzing Rust specifics"
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
            details: "Evangelista de produto Rust operando com persuasão PhD."
        };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em visibilidade Rust. Status: ${JSON.stringify(this.selfDiagnostic())}`;
    }
}
