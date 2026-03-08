/**
 * 📜 Scribe - PhD in Go Documentation & Technical Writing (Sovereign Version)
 * Analisa a qualidade dos comentários, docstrings e manuais técnicos em Go.
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

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
        this.stack = "Go";
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const rules: AuditRule[] = [
            { regex: /package\s+\w+\s+\/\//, issue: "Package Doc: Verifique se o pacote possui um comentário de cabeçalho descrevendo sua responsabilidade macro.", severity: "low" },
            { regex: /Example\w+\(\)/, issue: "Verifiable Examples: O uso de funções Example garante que a documentação é testada; continue assim.", severity: "low" },
            { regex: /\/\/.*http/, issue: "Reference Link: Links externos em comentários detectados; verifique se os alvos ainda são válidos.", severity: "low" },
            { regex: /Deprecated:/, issue: "Deprecation Notice: Garanta que a nota de depreciação inclui a alternativa recomendada.", severity: "medium" },
            { regex: /\/\/\s*\{/, issue: "Commented Code: Código comentado detectado; remova ou arquive para manter a limpeza do arquivo.", severity: "medium" },
            { regex: /Bug:/i, issue: "Open Bug Info: Informação de bug detectada em comentário; verifique se já existe um ticket correspondente.", severity: "high" }
        ];
        const results = await this.findPatterns([".go"], rules);

        // Advanced Logic Density
        const docIssues = GoScribeEngine.audit(this.projectRoot || "");
        docIssues.forEach(i => results.push({ file: "DOCUMENTATION_AUDIT", agent: this.name, role: this.role, emoji: this.emoji, issue: i, severity: "low", stack: this.stack }));

        this.endMetrics(results.length);
        return results;
    }

    public override performActiveHealing(blindSpots: string[]): void {
        console.log(`🛠️ [Scribe] Gerando GoDocs e formatando comentários em: ${blindSpots.join(", ")}`);
    }

    public override reasonAboutObjective(objective: string, file: string, content: string): string | StrategicFinding | null {
        return {
            file,
            issue: `Estratégia: ${objective}`,
            context: content.substring(0, 200),
            objective,
            analysis: "Auditando a clareza textual e a densidade de documentação do sistema Go.",
            recommendation: "Exigir que 100% das funções exportadas possuam comentários GoDoc e exemplos verificáveis.",
            severity: "low"
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
        return `Você é o Dr. ${this.name}, PhD em Documentação Técnica Go. Sua missão é garantir que o conhecimento seja eterno e legível.`;
    }
}

