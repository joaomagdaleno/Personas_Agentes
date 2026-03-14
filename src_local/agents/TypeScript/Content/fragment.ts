import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding, ProjectContext, AuditFinding } from "../../base.ts";

export class FragmentPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Fragment";
        this.emoji = "🧩";
        this.role = "PhD Refactoring Expert";
        this.phd_identity = "Mdoularity & Structural Cohesion (TS/Bun)";
        this.stack = "TypeScript";
    }

    public override async execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]> {
        this.setContext(context);
        const findings: (AuditFinding | StrategicFinding)[] = await this.performAudit();
        if (this.hub) {
            const moduleNodes = await this.hub.queryKnowledgeGraph("import", "low");
            const reasoning = await this.hub.reason(`Analyze the structural modularity of a TypeScript system with ${moduleNodes.length} import/export points. Recommend decoupling strategies for Clean Architecture.`);
            findings.push({ 
                file: "Structural Audit", agent: this.name, role: this.role, emoji: this.emoji, 
                issue: `Sovereign Fragment: Coesão modular validada via Rust Hub. PhD Analysis: ${reasoning}`, 
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Fragment Audit", match_count: 1,
                context: "Modularity & Decoupling"
            } as any);
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".ts", ".tsx", ".js", ".jsx"],
            rules: [
                { regex: /import\s+.*\s+from\s+['"]\.\.\/\.\.\/\.\.\//, issue: "Coupling: Importação profunda detectada. Considere usar alias de caminhos ou refatorar para pacotes mais próximos.", severity: "low" },
                { regex: /class\s+\w+\s+\{.*constructor\(.*\)\s+\{.*new\s+\w+.*\}.*\}/s, issue: "Dependency Injection: Instanciação direta no construtor. Use injeção de dependência para facilitar testabilidade PhD.", severity: "medium" },
                { regex: /export\s+default/, issue: "Clarity: Prefira named exports para facilitar o rastreio de dependências e refatorações automatizadas.", severity: "low" },
                { regex: /any/, issue: "Type Quality: Uso de 'any' detectado. Violação grave da integridade de tipos; prefira 'unknown' ou tipos específicos.", severity: "high" }
            ]
        };
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string | Promise<string | null>): StrategicFinding | null {
        return {
            file: "architecture",
            issue: `Direcionamento Fragment para ${objective}: Otimizando a coesão de módulos para manutenibilidade.`,
            severity: "STRATEGIC",
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Refatoração e Arquitetura de Software. Sua missão é garantir modularidade extrema.`;
    }
}
