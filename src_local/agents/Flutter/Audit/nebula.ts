/**
 * ☁️ Nebula - PhD in Cloud Architecture & Mobile Backend (Flutter)
 * Especialista em segurança de chaves, integração Firebase e isolamento de ambiente.
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class NebulaPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Nebula";
        this.emoji = "☁️";
        this.role = "PhD Cloud Architect";
        this.stack = "Flutter";
    }

    public override performAudit(): AuditFinding[] {
        this.startMetrics();
        const rules: AuditRule[] = [
            { regex: /AKIA[0-9A-Z]{16}/, issue: "Vulnerabilidade Crítica: Chave AWS exposta no código Flutter.", severity: "critical" },
            { regex: /(?:api[_-]?key|apiKey|API_KEY)\s*[:=]\s*["\'][^"\']{8,}/, issue: "Vazamento: API Key hardcoded no código Flutter.", severity: "critical" },
            { regex: /(?:password|passwd|secret)\s*[:=]\s*["\'][^"\']+["\']/, issue: "Vazamento: Credencial hardcoded no código Flutter.", severity: "critical" },
            { regex: /sk-[a-zA-Z0-9]{20,}/, issue: "Vulnerabilidade Crítica: Chave OpenAI exposta.", severity: "critical" },
            { regex: /ghp_[a-zA-Z0-9]{36}/, issue: "Vulnerabilidade Crítica: Token GitHub exposto.", severity: "critical" },
            { regex: /String\.fromEnvironment\(.*,\s*defaultValue:\s*["\'][^"\']{8,}/, issue: "Risco: Fallback de ambiente contém segredo real.", severity: "high" }
        ];
        const results = this.findPatterns([".dart", ".json", ".yaml"], rules);
        this.endMetrics(results.length);
        return results;
    }

    public override reasonAboutObjective(objective: string, file: string, content: string): StrategicFinding | null {
        if (content.includes("AKIA") && !content.includes("rules =")) {
            return {
                file,
                issue: `Catástrofe de Segurança: O objetivo '${objective}' exige proteção total. Credenciais expostas em '${file}' permitem o sequestro da 'Orquestração de Inteligência Artificial' via nuvem.`,
                severity: "STRATEGIC",
                context: this.name
            };
        }
        return {
            file,
            issue: `PhD Cloud Security: Analisando soberania de segredos para ${objective}. Focando em eliminação de hardcoded tokens.`,
            severity: "INFO",
            context: this.name
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
        return `Você é o Dr. ${this.name}, PhD em Arquitetura de Nuvem e Backend Mobile Flutter.`;
    }
}
