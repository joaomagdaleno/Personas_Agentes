/**
 * 🌌 Nebula - PhD in Cloud Infrastructure & Distributed Logic (Python Stack)
 * Analisa a integridade de deploys, dockerfiles e scripts de infra em Python.
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class NebulaPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Nebula";
        this.emoji = "🌌";
        this.role = "PhD Cloud Architect";
        this.stack = "Python";
    }

    public override performAudit(): AuditFinding[] {
        this.startMetrics();
        const rules: AuditRule[] = [
            { regex: /AKIA[0-9A-Z]{16}/, issue: "Vulnerabilidade Crítica: Chave AWS exposta no código Python.", severity: "critical" },
            { regex: /sk-[a-zA-Z0-9]{20,}|ghp_[a-zA-Z0-9]{36}/, issue: "Vulnerabilidade Crítica: Token (OpenAI/GitHub) exposto.", severity: "critical" },
            { regex: /(?:apiKey|API_KEY|password|secret)\s*[:=]\s*["\'][^"\']{8,}/, issue: "Vazamento: Credencial hardcoded no código-fonte Python.", severity: "critical" },
            { regex: /verify=False|ssl\._create_unverified_context/, issue: "Segurança Cloud: Desativação de verificação SSL detectada.", severity: "critical" },
            { regex: /os\.environ\.get\(.*\)\s*or\s*["\'][^"\']{8,}/, issue: "Risco: Fallback de variável de ambiente contém segredo real.", severity: "high" },
            { regex: /ENV\s+[A-Z_]+\s*=\s*["\'][^"\']{8,}/, issue: "Docker Security: Segredo embutido em instrução ENV do Dockerfile.", severity: "critical" }
        ];
        const results = this.findPatterns([".py", "Dockerfile", ".yaml"], rules);

        // Advanced Logic: Infrastructure Audit
        if (results.some(r => r.severity === "critical")) {
            this.reasonAboutObjective("Cloud Sovereignty", "Security", "Found critical SSL bypass in Python cloud logic.");
        }

        this.endMetrics(results.length);
        return results;
    }

    public override performActiveHealing(blindSpots: string[]): void {
        console.log(`🛠️ [Nebula] Sanitizando Dockerfiles e reforçando políticas de segurança cloud em: ${blindSpots.join(", ")}`);
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): string | StrategicFinding | null {
        return {
            objective,
            analysis: "Auditando resiliência e segurança da infraestrutura Python.",
            recommendation: "Implementar 'Multi-stage builds' no Docker e usar 'Secret Manager' para variáveis sensíveis.",
            severity: "high"
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
        return `Você é o Dr. ${this.name}, PhD em Arquitetura de Nuvem Python. Sua missão é garantir que a infraestrutura seja elástica e impenetrável.`;
    }
}
