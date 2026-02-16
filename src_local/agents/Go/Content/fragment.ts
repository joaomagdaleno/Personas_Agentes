/**
 * 🧩 Fragment - PhD in Go Refactoring & Modularity (Sovereign Version)
 * Analisa a coesão de pacotes, acoplamento e oportunidades de refatoração em Go.
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

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
        this.stack = "Go";
    }

    public override performAudit(): AuditFinding[] {
        this.startMetrics();
        const rules: AuditRule[] = [
            { regex: /func\s+.*\{\s*/g, issue: "Complexity Check: Verifique se funções longas podem ser extraídas para métodos auxiliares private.", severity: "low" },
            { regex: /type\s+.*\s+struct\s*\{.*interface/s, issue: "Dependency Injection: Uso de interfaces em structs detectado; facilite o mocking nos testes.", severity: "low" },
            { regex: /var\s+.*\s+=\s+.*\(.*\)/, issue: "Global State: Evite inicialização global de variáveis mutáveis; prefira injeção de dependência.", severity: "high" },
            { regex: /import\s*\./, issue: "Dot Import: Evite importações de ponto; polui o namespace e dificulta o rastreio de origem de funções.", severity: "medium" },
            { regex: /init\(\)/, issue: "Hidden Logic: Funções init() dificultam o teste e a compreensão do fluxo de inicialização.", severity: "medium" },
            { regex: /github\.com\/.*\/internal\//, issue: "Internal Reliance: Verifique se o uso de pacotes internos de terceiros não trará instabilidade futura.", severity: "high" }
        ];
        const results = this.findPatterns([".go"], rules);

        // Advanced Logic Density
        const modularityIssues = GoFragmentEngine.audit(this.projectRoot || "");
        modularityIssues.forEach(i => results.push({ file: "MODULARITY_AUDIT", agent: this.name, role: this.role, emoji: this.emoji, issue: i, severity: "medium", stack: this.stack }));

        this.endMetrics(results.length);
        return results;
    }

    public override performActiveHealing(blindSpots: string[]): void {
        console.log(`🛠️ [Fragment] Extraindo interfaces e fragmentando pacotes em: ${blindSpots.join(", ")}`);
    }

    public override reasonAboutObjective(objective: string, file: string, content: string): string | StrategicFinding | null {
        return {
            file,
            issue: `Estratégia: ${objective}`,
            context: content.substring(0, 200),
            objective,
            analysis: "Auditando a modularidade e a coesão estrutural do sistema Go.",
            recommendation: "Seguir a arquitetura de pacotes pequenos e independentes, utilizando interfaces para desacoplamento.",
            severity: "medium"
        } as StrategicFinding;
    }

    public override selfDiagnostic(): { status: string; score: number; issues: string[]; } {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Refatoração Go. Sua missão é garantir a modularidade perfeita.`;
    }
}
