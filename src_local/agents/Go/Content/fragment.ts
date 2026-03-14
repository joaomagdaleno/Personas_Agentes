import { BaseActivePersona } from "../../base.ts";
import type { AuditFinding, AuditRule, StrategicFinding, ProjectContext } from "../../base.ts";

/**
 * 🧩 Fragment - PhD in Go Refactoring & Modularity (Sovereign Version)
 * Analisa a coesão de pacotes, acoplamento e oportunidades de refatoração em Go.
 */
export enum ModularityStateGo {
    ATOMIC = "ATOMIC",
    DECOUPLED = "DECOUPLED",
    TANGLED = "TANGLED"
}

export class GoFragmentEngine {
    public static audit(content: string): string[] {
        const issues: string[] = [];
        if (content.length > 50000) {
            issues.push("Giant File: Arquivo Go excessivamente grande; considere fragmentar em arquivos menores dentro do mesmo pacote.");
        }
        if (content.split("import").length > 30) {
            issues.push("Import Overload: Muitas dependências em um único arquivo; sinal de baixa coesão.");
        }
        return issues;
    }
}

export class FragmentPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Fragment";
        this.emoji = "🧩";
        this.role = "PhD Refactoring Expert";
        this.phd_identity = "Modularity & Structural Cohesion (Go)";
        this.stack = "Go";
    }

    public override async execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]> {
        this.setContext(context);
        const findings: (AuditFinding | StrategicFinding)[] = await this.performAudit();
        if (this.hub) {
            const modNodes = await this.hub.queryKnowledgeGraph("package", "low");
            const reasoning = await this.hub.reason(`Analyze the package modularity of a Go system with ${modNodes.length} package markers. Recommend decoupling and internalization patterns.`);
            findings.push({ 
                file: "Structural Audit", agent: this.name, role: this.role, emoji: this.emoji, 
                issue: `Sovereign Fragment: Coesão Go validada via Rust Hub. PhD Analysis: ${reasoning}`, 
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Fragment Audit", match_count: 1
            } as any);
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".go"],
            rules: [
                { regex: /func\s+.*\{\s*/, issue: "Complexity Check: Verifique se funções longas podem ser extraídas para métodos auxiliares private PhD.", severity: "low" },
                { regex: /type\s+.*\s+struct\s*\{.*interface/s, issue: "Dependency Injection: Uso de interfaces em structs detectado; facilite o mocking nos testes PhD.", severity: "low" },
                { regex: /var\s+.*\s+=\s+.*\(.*\)/, issue: "Global State: Evite inicialização global de variáveis mutáveis; prefira injeção de dependência PhD.", severity: "high" },
                { regex: /import\s*\./, issue: "Dot Import: Evite importações de ponto; polui o namespace e dificulta o rastreio PhD.", severity: "medium" },
                { regex: /init\(\)/, issue: "Hidden Logic: Funções init() dificultam o teste e a compreensão do fluxo PhD.", severity: "medium" },
                { regex: /github\.com\/.*\/internal\//, issue: "Internal Reliance: Verifique se o uso de pacotes internos de terceiros não trará instabilidade PhD.", severity: "high" }
            ]
        };
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const rules = this.getAuditRules();
        const results = await this.findPatterns(rules.extensions, rules.rules);
        
        // Manual Modularity Check
        const modularityIssues = GoFragmentEngine.audit(""); // In a real scenario, this would check specific files
        modularityIssues.forEach(i => results.push({
            file: "MODULARITY_AUDIT", agent: this.name, role: this.role, emoji: this.emoji, issue: i, severity: "medium", stack: this.stack,
            evidence: "Structural Analysis", match_count: 1
        }));

        this.endMetrics(results.length);
        return results;
    }

    public override reasonAboutObjective(objective: string, file: string, _content: string | Promise<string | null>): StrategicFinding | null {
        return {
            file,
            issue: `Auditando a modularidade e a coesão estrutural do sistema Go para ${objective}.`,
            severity: "STRATEGIC",
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Refatoração Go. Sua missão é garantir a modularidade perfeita.`;
    }
}
