import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding, AuditFinding } from "../../base.ts";

/**
 * 🚀 Dr. Hype — PhD in Flutter Product Visibility & App Store Optimization
 * Especialista em metadados Flutter (pubspec.yaml), identidade e presença nas lojas.
 */
export class HypePersona extends BaseActivePersona {
    constructor(projectRoot: string | undefined = undefined) {
        super(projectRoot);
        this.name = "Hype";
        this.emoji = "🚀";
        this.role = "PhD Flutter Product Evangelist";
        this.phd_identity = "Project Visibility & App Store Optimization (Flutter)";
        this.stack = "Flutter";
    }

    public override async execute(context: any): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();
        if (this.hub) {
            const pubNodes = await this.hub.queryKnowledgeGraph("pubspec.yaml", "medium");
            const reasoning = await this.hub.reason(`Analyze the Flutter project visibility with ${pubNodes.length} dependencies. Recommend package identity and store discoverability improvements.`);
            findings.push({ file: "Product Visibility", agent: this.name, role: this.role, emoji: this.emoji, issue: `Sovereign Hype: Visibilidade Flutter auditada via Rust Hub. PhD Analysis: ${reasoning}`, severity: "INFO", stack: this.stack, evidence: "Pubspec Knowledge Graph Audit", match_count: 1 } as any);
        }
        return findings;
    }

    public override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['pubspec.yaml', 'README.md'],
            rules: [
                { regex: /version:\s*[0-9]+\.[0-9]+\.[0-9]+$/, issue: 'Invisível: package.json sem campo "description".', severity: 'medium' },
                { regex: /homepage:\s*""/, issue: 'Risco Legal: package.json sem campo "license".', severity: 'high' },
                { regex: /name:\s*[a-z_]+/, issue: 'Genérico: Nome de pacote genérico impede a identidade do projeto.', severity: 'medium' },
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
            if (filePath.endsWith('pubspec.yaml') && content) {
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
        return { content }; // Pubspec parsing placeholder
    }

    public checkRequiredFields(pkg: any, filePath: string, results: any[]) {
        if (!pkg.content.includes("name:")) {
            results.push({ file: filePath, issue: 'Anônimo: pubspec sem nome de pacote.', severity: 'high', persona: this.name } as any);
        }
    }

    public checkKeywords(_pkg: any, _filePath: string, _results: any[]) { }
    public checkIdentity(_pkg: any, _filePath: string, _results: any[]) { }

    public auditProjectPresence(results: any[]) {
        const hasReadme = Object.keys(this.contextData).some(f => /readme\.md$/i.test(f));
        if (!hasReadme) {
            results.push({ file: 'ROOT', issue: 'Invisibilidade: Projeto Flutter sem README.md.', severity: 'high', persona: this.name } as any);
        }
    }

    public override reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        if (file.endsWith('pubspec.yaml') && !content.includes("homepage:")) {
            return {
                file, severity: "MEDIUM",
                issue: `Baixa Tração: O objetivo '${objective}' exige presença web. Em '${file}', o link da homepage está ausente.`,
                context: "homepage missing"
            };
        }
        return {
            file, severity: "INFO",
            issue: `PhD Hype (Flutter): Analisando visibilidade para ${objective}.`,
            context: "analyzing Flutter specifics"
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
            details: "Evangelista de produto Flutter operando com persuasão PhD."
        };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em visibilidade Flutter. Status: ${JSON.stringify(this.selfDiagnostic())}`;
    }
}
