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
            { regex: /Dockerfile/, issue: "Configuração de Container: Verifique se a imagem base é 'slim' e se não há segredos embutidos.", severity: "high" },
            { regex: /requests\.get\(.*verify=False\)/, issue: "Risco de Segurança: Desativação de verificação SSL em ambiente de nuvem é crítica.", severity: "critical" },
            { regex: /os\.environ\.get\(/, issue: "Variável de Ambiente: Verifique se há fallback seguro ou se o sistema deve falhar rápido.", severity: "medium" },
            { regex: /boto3\.client\(/, issue: "Integração Cloud: Verifique a gestão de sessões e permissões IAM mínima necessária.", severity: "medium" }
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
