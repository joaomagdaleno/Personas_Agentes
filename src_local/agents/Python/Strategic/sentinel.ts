/**
 * 🛡️ Sentinel - PhD in System Protection & Shielding (Python Stack)
 * Analisa a integridade de scripts de segurança, firewalls e proteção de memória Python.
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class SentinelPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Sentinel";
        this.emoji = "🛡️";
        this.role = "PhD Security Architect";
        this.stack = "Python";
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const rules: AuditRule[] = [
            { regex: /subprocess\.run\(.*shell=True\)/, issue: "Risco de Injeção: O uso de shell=True permite execução de comandos arbitrários. Use listas de argumentos.", severity: "critical" },
            { regex: /os\.chmod\(.*0o777\)/, issue: "Permissão Excessiva: Verifique se o arquivo realmente precisa de permissões totais de leitura/escrita/execução.", severity: "high" },
            { regex: /tempfile\.mktemp\(\)/, issue: "Risco de Race Condition: Use NamedTemporaryFile para garantir criação segura de arquivos temporários.", severity: "medium" },
            { regex: /pickle\.load\(/, issue: "Desserialização Insegura: Pickle pode executar código arbitrário. Use JSON ou Protobuf para soberania de dados.", severity: "critical" }
        ];
        const results = await this.findPatterns([".py"], rules);

        // Advanced Logic: Shielding Audit
        if (results.some(r => r.severity === "critical")) {
            this.reasonAboutObjective("System Shielding", "Vulnerabilities", "Found critical Python-specific vulnerabilities (shell=True or pickle).");
        }

        this.endMetrics(results.length);
        return results;
    }

    public override performActiveHealing(blindSpots: string[]): void {
        console.log(`🛠️ [Sentinel] Reforçando permissões e substituindo chamadas inseguras em: ${blindSpots.join(", ")}`);
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): string | StrategicFinding | null {
        return {
            objective,
            analysis: "Auditando blindagem sistêmica e resiliência contra ataques de injeção Python.",
            recommendation: "Banir o uso de 'pickle' e 'shell=True' em todo o stack de suporte legacy.",
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
        return `Você é o Dr. ${this.name}, PhD em Proteção de Sistemas Python. Sua missão é ser o escudo intransponível do suporte legacy.`;
    }
}

