import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding, AuditFinding, ProjectContext } from "../../base.ts";

/**
 * 🚀 Dr. Hype — PhD in Python Package Visibility & PyPI Identity
 * Especialista em metadados Python (setup.py/pyproject.toml), identidade e presença no PyPI.
 */
export class HypePersona extends BaseActivePersona {
    constructor(projectRoot: string | undefined = undefined) {
        super(projectRoot);
        this.name = "Hype";
        this.emoji = "🚀";
        this.role = "PhD Python Product Evangelist";
        this.phd_identity = "Project Visibility & PyPI Identity (Python)";
        this.stack = "Python";
    }

    public override async execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]> {
        this.setContext(context);
        const findings: (AuditFinding | StrategicFinding)[] = await this.performAudit();
        if (this.hub) {
            const pyNodes = await this.hub.queryKnowledgeGraph("pyproject.toml", "medium");
            const reasoning = await this.hub.reason(`Analyze the Python package visibility with ${pyNodes.length} metadata nodes. Recommend PEP 621 compliance and PyPI discoverability.`);
            findings.push({ 
                file: "Product Visibility", agent: this.name, role: this.role, emoji: this.emoji, 
                issue: `Sovereign Hype: Visibilidade Python auditada via Rust Hub. PhD Analysis: ${reasoning}`, 
                severity: "INFO", stack: this.stack, evidence: "PyProject Knowledge Graph Audit", match_count: 1,
                context: "Package Visibility Analysis"
            } as any);
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['setup.py', 'pyproject.toml', 'README.md'],
            rules: [
                { regex: /version\s*=\s*['"][0-9.a-zA-Z-]+['"]/, issue: 'Invisível: package.json sem campo "description".', severity: 'medium' },
                { regex: /classifiers\s*=\s*\[\s*\]/, issue: 'Risco Legal: package.json sem campo "license".', severity: 'high' },
                { regex: /name\s*=\s*['"][a-z_-]+['"]/, issue: 'Genérico: Nome de pacote genérico impede a identidade do projeto.', severity: 'medium' },
            ]
        };
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        const results = await super.performAudit();
        this.auditPackageFiles(results);
        this.auditProjectPresence(results);
        return results;
    }

    private auditPackageFiles(results: AuditFinding[]) {
        for (const [filePath, fileData] of Object.entries(this.contextData)) {
            const content = (fileData as any).content || fileData;
            if ((filePath.endsWith('setup.py') || filePath.endsWith('pyproject.toml')) && content) {
                if (!content.includes("version")) {
                    results.push({ 
                        file: filePath, 
                        issue: 'Anônimo: Arquivo de setup sem definição de version.', 
                        severity: 'high', 
                        agent: this.name,
                        role: this.role,
                        emoji: this.emoji,
                        stack: this.stack,
                        evidence: "Missing version field",
                        match_count: 1,
                        context: "Package Metadata Audit"
                    } as any);
                }
            }
        }
    }

    private auditProjectPresence(results: AuditFinding[]) {
        const hasReadme = Object.keys(this.contextData).some(f => /readme\.md$/i.test(f));
        if (!hasReadme) {
            results.push({ 
                file: 'ROOT', 
                issue: 'Invisibilidade: Projeto Python sem README.md.', 
                severity: 'high', 
                agent: this.name,
                role: this.role,
                emoji: this.emoji,
                stack: this.stack,
                evidence: "Documentation Missing",
                match_count: 1,
                context: "Project Visibility Audit"
            } as any);
        }
    }

    public override reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        if ((file.endsWith('setup.py') || file.endsWith('pyproject.toml')) && !content.includes("classifiers")) {
            return {
                file, severity: "MEDIUM",
                issue: `Baixa Descoberta: O objetivo '${objective}' exige categorização. Em '${file}', faltam 'classifiers'.`,
                context: "classifiers missing"
            };
        }
        return {
            file, severity: "INFO",
            issue: `PhD Hype (Python): Analisando visibilidade para ${objective}.`,
            context: "analyzing Python specifics"
        };
    }

    public Branding(): string { return `${this.emoji} ${this.name}`; }

    public override selfDiagnostic(): any {
        return {
            status: "Soberano",
            score: 100,
            details: "Evangelista de produto Python operando com persuasão PhD."
        };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em visibilidade Python.`;
    }
}
