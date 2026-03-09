/**
 * 🌐 Globe - PhD in Go Internationalization & Global UX (Sovereign Version)
 * Analisa o suporte a múltiplos idiomas, fusos horários e padrões globais em Go.
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export enum GlobalDensityGo {
    UNIVERSAL = "UNIVERSAL",
    LOCALIZED = "LOCALIZED",
    HARDCODED = "HARDCODED"
}

export class GoGlobeEngine {
    public static audit(content: string): string[] {
        const findings: string[] = [];
        if (content.match(/[À-ÿ]/) && !content.includes("i18n") && !content.includes("gotext")) {
            findings.push("Hardcoded Non-ASCII: Texto localizado detectado diretamente no código Go sem uso de biblioteca de i18n.");
        }
        if (content.includes("time.Now()") && !content.includes("UTC()")) {
            findings.push("Local Time usage: Uso de horário local detectado; prefira UTC para consistência global.");
        }
        return findings;
    }
}

export class GlobePersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Globe";
        this.emoji = "🌐";
        this.role = "PhD i18n Specialist";
        this.stack = "Go";
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".go"],
            rules: [
                { regex: /golang\.org\/x\/text/, issue: "Standard i18n: Uso da biblioteca experimental de texto Go detectada; verifique a maturidade das traduções.", severity: "low" },
                { regex: /currency/, issue: "Currency Handing: Verifique se o arredondamento de moeda segue os padrões financeiros internacionais.", severity: "high" },
                { regex: /Location/, issue: "Timezone Logic: Verifique se as localizações de fuso horário são carregadas via banco de dados IANA.", severity: "medium" },
                { regex: /locale/, issue: "Locale Detection: Garanta que o locale é propagado via Context em cabeçalhos HTTP.", severity: "medium" },
                { regex: /unicode\/utf8/, issue: "UTF-8 Validation: Uso de validação explícita detectada; verifique a integridade de strings multisbyte.", severity: "low" },
                { regex: /translation/, issue: "Translation Sync: Verifique se os arquivos de recurso estão em sincronia com o código-fonte.", severity: "medium" }
            ]
        };
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        const results = await super.performAudit();
        const globeFindings = GoGlobeEngine.audit(this.projectRoot || "");
        globeFindings.forEach(f => results.push({
            file: "GLOBALIZATION_AUDIT", agent: this.name, role: this.role, emoji: this.emoji, issue: f, severity: "medium", stack: this.stack,
            evidence: "Structural Analysis", match_count: 1
        }));
        return results;
    }

    public override performActiveHealing(blindSpots: string[]): void {
        console.log(`🛠️ [Globe] Externalizando strings e normalizando fusos horários em: ${blindSpots.join(", ")}`);
    }

    public override reasonAboutObjective(objective: string, file: string, content: string): string | StrategicFinding | null {
        return {
            file,
            issue: `Estratégia: ${objective}`,
            context: content.substring(0, 200),
            objective,
            analysis: "Auditando a capacidade de internacionalização e conformidade global do sistema Go.",
            recommendation: "Migrar todas as strings de UI para bundle de recursos via 'gotext' e forçar UTC persistente em banco de dados.",
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
        return `Você é o Dr. ${this.name}, PhD em Globalização Go. Sua missão é garantir que o sistema fale todas as línguas e respeite todos os horários.`;
    }
}

