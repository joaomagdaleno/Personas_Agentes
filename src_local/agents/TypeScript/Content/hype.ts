import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding, AuditFinding, ProjectContext } from "../../base.ts";

/**
 * 🚀 Dr. Hype — PhD in TypeScript Product Visibility & Branding
 * Especialista em metadados de projeto, identidade e descobribilidade.
 */
export class HypePersona extends BaseActivePersona {
    constructor(projectRoot: string | undefined = undefined) {
        super(projectRoot);
        this.name = "Hype";
        this.emoji = "🚀";
        this.role = "PhD Product Evangelist";
        this.phd_identity = "Product Visibility & Branding (TypeScript)";
        this.stack = "TypeScript";
    }

    override async execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]> {
        this.setContext(context);
        const findings: (AuditFinding | StrategicFinding)[] = await this.performAudit();
        if (this.hub) {
            const metaNodes = await this.hub.queryKnowledgeGraph("package.json", "medium");
            const reasoning = await this.hub.reason(`Analyze the product visibility of a TypeScript project with ${metaNodes.length} metadata gaps. Recommend SEO and discoverability improvements.`);
            findings.push({ 
                file: "Product Visibility", agent: this.name, role: this.role, emoji: this.emoji, 
                issue: `Sovereign Hype: Visibilidade do produto validada via Rust Hub. PhD Analysis: ${reasoning}`, 
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Metadata Audit", match_count: 1 
            } as any);
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['package.json'],
            rules: [
                { regex: /"description":\s*""/, issue: 'Invisível: package.json sem campo "description".', severity: 'medium' },
                { regex: /"license":\s*""/, issue: 'Risco Legal: package.json sem campo "license".', severity: 'high' },
                { regex: /"name":\s*"(my-app|project|untitled|test|app)"/, issue: 'Genérico: Nome de pacote genérico impede a identidade do projeto.', severity: 'medium' },
            ]
        };
    }

    override async performAudit(): Promise<AuditFinding[]> {
        const results = await super.performAudit();
        this.auditPackageJson(results);
        this.auditProjectPresence(results);
        return results;
    }

    private auditPackageJson(results: AuditFinding[]) {
        for (const [filePath, contentData] of Object.entries(this.contextData)) {
            const content = typeof contentData === 'string' ? contentData : (contentData as any).content;
            if (filePath.endsWith('package.json') && content) {
                this.analyzePackageContent(filePath, content as string, results);
            }
        }
    }

    private analyzePackageContent(filePath: string, content: string, results: AuditFinding[]) {
        try {
            const pkg = JSON.parse(content);
            this.checkRequiredFields(pkg, filePath, results);
            this.checkKeywords(pkg, filePath, results);
            this.checkIdentity(pkg, filePath, results);
        } catch { /* ignore invalid json */ }
    }

    private checkRequiredFields(pkg: any, filePath: string, results: AuditFinding[]) {
        const checks = [
            { field: 'description', issue: 'Invisível: package.json sem campo "description".', severity: 'medium' },
            { field: 'repository', issue: 'Desconectado: package.json sem campo "repository".', severity: 'medium' },
            { field: 'license', issue: 'Risco Legal: package.json sem campo "license".', severity: 'high' },
            { field: 'author', issue: 'Anônimo: package.json sem campo "author".', severity: 'low' },
        ];

        checks.forEach(check => {
            if (!pkg[check.field]) {
                results.push({ file: filePath, issue: check.issue, severity: check.severity, persona: this.name } as any);
            }
        });
    }

    private checkKeywords(pkg: any, filePath: string, results: AuditFinding[]) {
        if (!pkg.keywords || pkg.keywords.length === 0) {
            results.push({ file: filePath, issue: 'Baixa Descobribilidade: package.json sem "keywords".', severity: 'low', persona: this.name } as any);
        }
    }

    private checkIdentity(pkg: any, filePath: string, results: AuditFinding[]) {
        const genericNames = /^(my-app|project|untitled|test|app)$/;
        if (pkg.name && genericNames.test(pkg.name)) {
            results.push({ file: filePath, issue: 'Genérico: Nome de pacote genérico impede a identidade do projeto.', severity: 'medium', persona: this.name } as any);
        }
    }

    private auditProjectPresence(results: AuditFinding[]) {
        const hasReadme = Object.keys(this.contextData).some(f => /readme\.md$/i.test(f));
        if (!hasReadme) {
            results.push({ file: 'ROOT', issue: 'Invisibilidade Total: Projeto sem README.md.', severity: 'high', persona: this.name } as any);
        }
    }

    override reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        if (file.endsWith('package.json') && !content.includes('"description"')) {
            return {
                file, severity: "MEDIUM",
                issue: `Invisibilidade: O objetivo '${objective}' exige tração. Em '${file}', a falta de metadados prejudica a descoberta da 'Orquestração de Inteligência Artificial'.`,
                context: "description missing in package.json"
            };
        }
        return {
            file, severity: "INFO",
            issue: `PhD Hype: Analisando visibilidade para ${objective}. Focando em SEO de pacotes e identidade de produto.`,
            context: "analyzing visibility"
        };
    }

    public Branding(): string { return `${this.emoji} ${this.name}`; }

    override selfDiagnostic(): any {
        return {
            status: "Soberano",
            score: 100,
            issues: [],
            branding: this.Branding(),
            details: "Evangelista de produto TS operando com persuasão PhD."
        };
    }

    override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em visibilidade e evangelização de produto TypeScript.`;
    }
}
