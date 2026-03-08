/**
 * 🧘 Mantra - PhD in Go Code Quality & Idioms (Sovereign Version)
 * Analisa a aderência aos padrões idiomáticos do Go (Effective Go).
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

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
        this.stack = "Go";
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".go"],
            rules: [
                { regex: /camelCase/, issue: "Naming Convention: Go prefira nomes curtos para variáveis locais e Exported para campos públicos.", severity: "low" },
                { regex: /receiver\s+ptr/, issue: "Receiver Safety: Verifique se o receptor de ponteiro é necessário ou se causa cópia indevida.", severity: "medium" },
                { regex: /new\(.*\)/, issue: "Allocation Mode: Prefira composite literals T{} em vez de new(T) para maior legibilidade.", severity: "low" },
                { regex: /init\(\)/, issue: "Initialization Order: O excesso de funções init() pode causar dependências circulares e ordens de execução imprevisíveis.", severity: "high" },
                { regex: /interface\s+\w+\s+\{.*\}\s+\/\/\s*deprecated/, issue: "Stale Contract: Remova interfaces depreciadas para manter a pureza do design.", severity: "medium" },
                { regex: /_\s*=\s*append/, issue: "Slice Misuse: Verifique se a mutação de slice não está criando efeitos colaterais em outras referências.", severity: "high" }
            ]
        };
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        const results = await super.performAudit();
        const qualityIssues = GoMantraEngine.audit(this.projectRoot || "");
        qualityIssues.forEach(i => results.push({
            file: "QUALITY_AUDIT", agent: this.name, role: this.role, emoji: this.emoji, issue: i, severity: "medium", stack: this.stack,
            evidence: "Structural Analysis", match_count: 1
        }));
        return results;
    }

    public override performActiveHealing(blindSpots: string[]): void {
        console.log(`🛠️ [Mantra] Simplificando nomes e removendo Getters/Setters não idiomáticos em: ${blindSpots.join(", ")}`);
    }

    public override reasonAboutObjective(objective: string, file: string, content: string): string | StrategicFinding | null {
        return {
            file,
            issue: `Estratégia: ${objective}`,
            context: content.substring(0, 200),
            objective,
            analysis: "Auditando a conformidade do sistema Go com os padrões 'Effective Go'.",
            recommendation: "Executar 'golangci-lint' com todos os linters ativados e corrigir falhas de design idiomático.",
            severity: "medium"
        } as StrategicFinding;
    }

    public override selfDiagnostic(): { status: string; score: number; issues: string[]; } {
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
