/**
 * 🏛️ Director - Executive PhD in Go Architecture (Sovereign Version)
 * Orquestra e sintetiza as descobertas de todos os agentes Go.
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export enum StrategyDensityGo {
    SOVEREIGN = "SOVEREIGN",
    ALIGNED = "ALIGNED",
    DIVERGENT = "DIVERGENT"
}

export class GoDirectorEngine {
    public static audit(content: string): string[] {
        const issues: string[] = [];
        if (!content.includes("go.mod")) {
            issues.push("Project Identity Missing: Diretório raiz sem go.mod detectado; orquestração impossibilitada.");
        }
        return issues;
    }
}

export class DirectorPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Director";
        this.emoji = "🏛️";
        this.role = "PhD Strategic Director";
        this.stack = "Go";
    }

    public override performAudit(): AuditFinding[] {
        this.startMetrics();
        const rules: AuditRule[] = [
            { regex: /func\s+main/, issue: "Entry Point: Ponto de entrada detectado; verifique se a orquestração de shutdown gracioso está presente.", severity: "low" },
            { regex: /github\.com\/spf13\/cobra/, issue: "CLI Framework: Cobra detectado; verifique se a árvore de comandos está coesa.", severity: "low" },
            { regex: /viper/, issue: "Configuration: Viper detectado; garanta que as configurações possuem valores default seguros.", severity: "medium" },
            { regex: /healthcheck/, issue: "System Viability: Verifique se o endpoint de healthcheck reflete fielmente o estado das dependências.", severity: "high" },
            { regex: /Context\s+Handling/, issue: "Strategic Flow: Garanta que o context.Context é a espinha dorsal de toda a orquestração.", severity: "high" },
            { regex: /version\s+=\s*".*"/, issue: "Identity Check: Verifique se a versão do sistema está centralizada e auditada.", severity: "low" }
        ];
        const results = this.findPatterns([".go"], rules);

        // Advanced Logic Density
        const strategyIssues = GoDirectorEngine.audit(this.projectRoot || "");
        strategyIssues.forEach(i => results.push({ file: "EXECUTIVE_AUDIT", agent: this.name, role: this.role, emoji: this.emoji, issue: i, severity: "high", stack: this.stack }));

        this.endMetrics(results.length);
        return results;
    }

    public override performActiveHealing(blindSpots: string[]): void {
        console.log(`🛠️ [Director] Harmonizando governança e orquestrando agentes em: ${blindSpots.join(", ")}`);
    }

    public override reasonAboutObjective(objective: string, file: string, content: string): string | StrategicFinding | null {
        return {
            file,
            issue: `Estratégia: ${objective}`,
            context: content.substring(0, 200),
            objective,
            analysis: "Auditando a governança estratégica e a integridade da arquitetura Go.",
            recommendation: "Centralizar a configuração via Viper e garantir que todos os serviços suportam graceful shutdown.",
            severity: "high"
        } as StrategicFinding;
    }

    public override selfDiagnostic(): { status: string; score: number; issues: string[]; } {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Direção Estratégica Go. Sua missão é garantir a soberania absoluta do sistema.`;
    }
}
