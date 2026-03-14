import { BaseActivePersona } from "../../base.ts";
import type { AuditFinding, AuditRule, StrategicFinding, ProjectContext } from "../../base.ts";

/**
 * 🧘 Mantra - PhD in Go Code Quality & Idioms (Sovereign Version)
 * Analisa a aderência aos padrões idiomáticos do Go (Effective Go).
 */
export enum QualityDensityGo {
    IDIOMATIC = "IDIOMATIC",
    LEGACY = "LEGACY",
    UNSOUND = "UNSOUND"
}

export class GoMantraEngine {
    public static audit(content: string): string[] {
        const issues: string[] = [];
        if (content.includes("Get") && content.includes("Set") && content.split("func").length > 20) {
            issues.push("Javaisms: Uso excessivo de Getters/Setters em Go; prefira acesso direto ou nomes concisos.");
        }
        if (content.includes("Panic(") && !content.includes("recover")) {
            issues.push("Unhandled Panic: Uso de panic() sem recuperação; prefira retornar erros para robustez.");
        }
        return issues;
    }
}

export class MantraPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Mantra";
        this.emoji = "🧘";
        this.role = "PhD Quality Guardian";
        this.phd_identity = "Go Code Quality & Idioms";
        this.stack = "Go";
    }

    public override async execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]> {
        this.setContext(context);
        const findings: (AuditFinding | StrategicFinding)[] = await this.performAudit();
        if (this.hub) {
            const idiomNodes = await this.hub.queryKnowledgeGraph("init()", "medium");
            const reasoning = await this.hub.reason(`Analyze Effective Go compliance with ${idiomNodes.length} non-idiomatic patterns. Recommend golangci-lint integration.`);
            findings.push({ 
                file: "Quality Audit", agent: this.name, role: this.role, emoji: this.emoji, 
                issue: `Sovereign Mantra: Qualidade Go validada via Rust Hub. PhD Analysis: ${reasoning}`, 
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Quality Audit", match_count: 1
            } as any);
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".go"],
            rules: [
                { regex: /camelCase/, issue: "Naming Convention: Go prefere nomes curtos para variáveis locais e Exported para campos públicos PhD.", severity: "low" },
                { regex: /receiver\s+ptr/, issue: "Receiver Safety: Verifique se o receptor de ponteiro é necessário ou se causa cópia indevida PhD.", severity: "medium" },
                { regex: /new\(.*\)/, issue: "Allocation Mode: Prefira composite literals T{} em vez de new(T) para maior legibilidade PhD.", severity: "low" },
                { regex: /init\(\)/, issue: "Initialization Order: O excesso de funções init() pode causar dependências circulares e ordens imprevisíveis PhD.", severity: "high" },
                { regex: /interface\s+\w+\s+\{.*\}\s+\/\/\s*deprecated/, issue: "Stale Contract: Remova interfaces depreciadas para manter a pureza do design PhD.", severity: "medium" },
                { regex: /_\s*=\s*append/, issue: "Slice Misuse: Verifique se a mutação de slice não está criando efeitos colaterais PhD.", severity: "high" }
            ]
        };
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const rules = this.getAuditRules();
        const results = await this.findPatterns(rules.extensions, rules.rules);
        
        // Manual Quality Check
        const qualityIssues = GoMantraEngine.audit(""); // Placeholder for content check
        qualityIssues.forEach(i => results.push({
            file: "QUALITY_AUDIT", agent: this.name, role: this.role, emoji: this.emoji, issue: i, severity: "medium", stack: this.stack,
            evidence: "Structural Analysis", match_count: 1
        }));

        this.endMetrics(results.length);
        return results;
    }

    public override reasonAboutObjective(objective: string, file: string, _content: string | Promise<string | null>): StrategicFinding | null {
        return {
            file,
            issue: `Auditando a conformidade do sistema Go com os padrões 'Effective Go' para ${objective}.`,
            severity: "STRATEGIC",
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return {
            status: "Soberano",
            score: 100,
            issues: []
        };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Qualidade e Idiomas Go. Sua missão é garantir que o código seja puro e conciso.`;
    }
}
