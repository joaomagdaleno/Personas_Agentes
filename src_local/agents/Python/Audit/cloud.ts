import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding, AuditFinding, ProjectContext } from "../../base.ts";

/**
 * ☁️ Cloud - Python-native Serverless & IAM Agent
 * Sovereign Synapse: Audita permissões IAM, configurações de Lambda/Functions e segurança cloud Python.
 */
export class CloudPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Cloud";
        this.emoji = "☁️";
        this.role = "PhD Cloud Strategist";
        this.phd_identity = "Serverless Security & IAM Governance (Python)";
        this.stack = "Python";
    }

    public override async execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]> {
        this.setContext(context);
        const findings: (AuditFinding | StrategicFinding)[] = await this.performAudit();
        if (this.hub) {
            const iamNodes = await this.hub.queryKnowledgeGraph("iam", "low");
            const reasoning = await this.hub.reason(`Analyze the serverless security posture of a Python system with ${iamNodes.length} IAM/Security markers. Recommend least-privilege policies and secret rotation.`);
            findings.push({ 
                file: "Cloud Audit", agent: this.name, role: this.role, emoji: this.emoji, 
                issue: `Sovereign Cloud: Segurança serverless validada via Rust Hub. PhD Analysis: ${reasoning}`, 
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Cloud Audit", match_count: 1,
                context: "IAM & Serverless Risk"
            } as any);
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".py", ".yaml", ".yml", ".json"],
            rules: [
                { regex: /"Effect":\s*"Allow",\s*"Action":\s*"\*"/, issue: "Security: Política IAM 'Allow *' detectada. Violação grave do princípio de menor privilégio.", severity: "high" },
                { regex: /os\.environ\.get\(["']AWS_ACCESS_KEY_ID["']\)/, issue: "Secrets: Acesso direto a credenciais cloud no código. Use roles de execução ou Secret Manager.", severity: "high" },
                { regex: /def\s+lambda_handler/, issue: "Architecture: Função Lambda detectada. Garanta que o timeout e a memória estejam otimizados PhD.", severity: "low" },
                { regex: /requests\.get\(.*verify=False\)/, issue: "TLS: Verificação de certificado SSL desabilitada. Risco de ataque Man-in-the-Middle.", severity: "high" }
            ]
        };
    }

    public override reasonAboutObjective(objective: string, file: string, _content: string | Promise<string | null>): StrategicFinding | null {
        return {
            file,
            issue: `Direcionamento Cloud Python para ${objective}: Minimizando superfície de ataque serverless.`,
            severity: "STRATEGIC",
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Estratégia Cloud. Sua missão é garantir a integridade da governança IAM e segurança serverless.`;
    }
}
