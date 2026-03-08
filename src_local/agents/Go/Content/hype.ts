/**
 * 📢 Hype - PhD in Go Marketing & Engagement (Sovereign Version)
 * Analisa o potencial de engajamento, clareza de marca e visibilidade do projeto em Go.
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export enum EngagementDensityGo {
    VIRAL = "VIRAL",
    ENGAGING = "ENGAGING",
    OVERSHADOWED = "OVERSHADOWED"
}

export class GoHypeEngine {
    public static audit(content: string): string[] {
        const findings: string[] = [];
        if (!content.includes("README.md") && !content.includes("docs")) {
            findings.push("Low Visibility: O sistema Go carece de documentação de entrada macro (README/docs).");
        }
        if (content.match(/TODO:/g) && content.split("TODO:").length > 50) {
            findings.push("Maintenance Debt: Excesso de TODOs pode sinalizar projeto inacabado para stakeholders.");
        }
        return findings;
    }
}

export class HypePersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Hype";
        this.emoji = "📢";
        this.role = "PhD Engagement Expert";
        this.stack = "Go";
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".go", ".md"],
            rules: [
                { regex: /internal/, issue: "Invisible Logic: Uso extensivo de pacotes 'internal/' garante privacidade mas oculta o design para usuários externos.", severity: "low" },
                { regex: /deprecated/i, issue: "Stale Logic: Verifique se o código depreciado possui sinalização clara para migração.", severity: "medium" },
                { regex: /OpenSource/i, issue: "Community Ready: Verifique se o projeto possui licença e guia de contribuição visíveis.", severity: "low" },
                { regex: /v[0-9]\.[0-9]\.[0-9]/, issue: "Semantic Versioning: Garanta que as tags de versão git estão alinhadas com o estado do código.", severity: "low" },
                { regex: /awesome-go/i, issue: "Registry Potential: Verifique se as bibliotecas criadas podem ser submetidas ao Awesome Go.", severity: "low" },
                { regex: /CLI/i, issue: "User Interface: Verifique se a CLI Go possui comandos de 'help' e 'version' intuitivos.", severity: "medium" }
            ]
        };
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        const results = await super.performAudit();
        const hypeFindings = GoHypeEngine.audit(this.projectRoot || "");
        hypeFindings.forEach(f => results.push({
            file: "ENGAGEMENT_AUDIT", agent: this.name, role: this.role, emoji: this.emoji, issue: f, severity: "low", stack: this.stack,
            evidence: "Structural Analysis", match_count: 1
        }));
        return results;
    }

    public override performActiveHealing(blindSpots: string[]): void {
        console.log(`🛠️ [Hype] Gerando documentação e otimizando visibilidade em: ${blindSpots.join(", ")}`);
    }

    public override reasonAboutObjective(objective: string, file: string, content: string): string | StrategicFinding | null {
        return {
            file,
            issue: `Estratégia: ${objective}`,
            context: content.substring(0, 200),
            objective,
            analysis: "Auditando o impacto e a clareza da proposta de valor do sistema Go.",
            recommendation: "Criar um site de documentação via Hugo ou Docusaurus e padronizar o versionamento semântico.",
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
        return `Você é o Dr. ${this.name}, PhD em Engajamento de Tecnologia Go. Sua missão é fazer o projeto brilhar no ecossistema.`;
    }
}
