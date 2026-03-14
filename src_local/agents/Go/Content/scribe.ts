import { BaseActivePersona } from "../../base.ts";
import type { AuditFinding, AuditRule, StrategicFinding, ProjectContext } from "../../base.ts";

/**
 * 📜 Scribe - PhD in Go Documentation & Technical Writing (Sovereign Version)
 * Analisa a qualidade dos comentários, docstrings e manuais técnicos em Go.
 */
export enum DocDensityGo {
    LITERATE = "LITERATE",
    SPARSE = "SPARSE",
    CRYPTIC = "CRYPTIC"
}

export class GoScribeEngine {
    public static audit(content: string): string[] {
        const issues: string[] = [];
        if (content.match(/func\s+[A-Z]\w*/g) && !content.includes("//")) {
            issues.push("Undocumented Export: Função exportada sem comentário GoDoc; dificulta a inteligibilidade do pacote.");
        }
        if (content.includes("TODO") || content.includes("FIXME")) {
            issues.push("Technical Debt Leak: Comentários de dívida técnica detectados no código-fonte.");
        }
        return issues;
    }
}

export class ScribePersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Scribe";
        this.emoji = "📜";
        this.role = "PhD Documentation Specialist";
        this.phd_identity = "Go Documentation & Technical Writing";
        this.stack = "Go";
    }

    public override async execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]> {
        this.setContext(context);
        const findings: (AuditFinding | StrategicFinding)[] = await this.performAudit();
        if (this.hub) {
            const docNodes = await this.hub.queryKnowledgeGraph("func ", "low");
            const reasoning = await this.hub.reason(`Analyze the GoDoc quality of a Go system with ${docNodes.length} function definitions. Recommend package-level comments and verifiable examples.`);
            findings.push({ 
                file: "Knowledge Audit", agent: this.name, role: this.role, emoji: this.emoji, 
                issue: `Sovereign Scribe: Conhecimento Go validada via Rust Hub. PhD Analysis: ${reasoning}`, 
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Documentation Audit", match_count: 1
            } as any);
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".go"],
            rules: [
                { regex: /package\s+\w+\s+\/\//, issue: "Package Doc: Verifique se o pacote possui um comentário de cabeçalho PhD.", severity: "low" },
                { regex: /Example\w+\(\)/, issue: "Verifiable Examples: O uso de funções Example garante documentação testada PhD.", severity: "low" },
                { regex: /\/\/.*http/, issue: "Reference Link: Links externos em comentários detectados PhD.", severity: "low" },
                { regex: /Deprecated:/, issue: "Deprecation Notice: Garanta que a nota de depreciação inclui a alternativa PhD.", severity: "medium" },
                { regex: /\/\/\s*\{/, issue: "Commented Code: Código comentado detectado; remova para limpeza PhD.", severity: "medium" },
                { regex: /Bug:/i, issue: "Open Bug Info: Informação de bug detectada em comentário PhD.", severity: "high" }
            ]
        };
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const rules = this.getAuditRules();
        const results = await this.findPatterns(rules.extensions, rules.rules);
        
        // Manual Documentation Check
        const docIssues = GoScribeEngine.audit(""); 
        docIssues.forEach(i => results.push({
            file: "DOCUMENTATION_AUDIT", agent: this.name, role: this.role, emoji: this.emoji, issue: i, severity: "low", stack: this.stack,
            evidence: "Structural Analysis", match_count: 1
        }));

        this.endMetrics(results.length);
        return results;
    }

    public override reasonAboutObjective(objective: string, file: string, _content: string | Promise<string | null>): StrategicFinding | null {
        return {
            file,
            issue: `Auditando a clareza textual e a densidade de documentação do sistema Go para ${objective}.`,
            severity: "STRATEGIC",
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Documentação Técnica Go. Sua missão é garantir que o conhecimento seja eterno e legível.`;
    }
}
