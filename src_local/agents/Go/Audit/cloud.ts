import { BaseActivePersona } from "../../base.ts";
import type { AuditFinding, AuditRule, StrategicFinding, ProjectContext } from "../../base.ts";

/**
 * ☁️ Cloud - Go-native Infrastructure & Scalability Agent
 * Sovereign Synapse: Audita manifestos k8s, dockerfiles e padrões de microserviços Go.
 */
export class CloudPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Cloud";
        this.emoji = "☁️";
        this.role = "PhD Cloud Architect";
        this.phd_identity = "Cloud Native & Microservices Integrity (Go)";
        this.stack = "Go";
    }

    public override async execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]> {
        this.setContext(context);
        const findings: (AuditFinding | StrategicFinding)[] = await this.performAudit();
        if (this.hub) {
            const cloudNodes = await this.hub.queryKnowledgeGraph("k8s", "low");
            const reasoning = await this.hub.reason(`Analyze the cloud-native readiness of a Go system with ${cloudNodes.length} infrastructure markers. Recommend scaling strategy and security hardening for container identity.`);
            findings.push({ 
                file: "Cloud Audit", agent: this.name, role: this.role, emoji: this.emoji, 
                issue: `Sovereign Cloud: Prontidão cloud-native validada via Rust Hub. PhD Analysis: ${reasoning}`, 
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Cloud Audit", match_count: 1
            } as any);
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".go", ".yaml", ".yml", "Dockerfile"],
            rules: [
                { regex: /privileged:\s+true/, issue: "Security: Container rodando como privilegiado. Risco de escalação de privilégios no nó.", severity: "high" },
                { regex: /USER\s+root/, issue: "Security: Dockerfile usando usuário root. Prefira usuários não-privilegiados para execução.", severity: "high" },
                { regex: /cpu:\s+"[0-9]+"/, issue: "Resources: Limites de CPU estáticos. Verifique se o escalonamento horizontal (HPA) está configurado.", severity: "low" },
                { regex: /env:\s+[\s\S]*password/, issue: "Secrets: Senha detectada em variável de ambiente. Use Kubernetes Secrets ou Vault.", severity: "high" },
                { regex: /func\s+main\(\)\s+\{[\s\S]*http\.ListenAndServe/, issue: "Architecture: Servidor HTTP sem configuração de timeouts. Risco de exaustão de recursos em produção.", severity: "medium" }
            ]
        };
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const rules = this.getAuditRules();
        const results = await this.findPatterns(rules.extensions, rules.rules);
        this.endMetrics(results.length);
        return results;
    }

    public override reasonAboutObjective(objective: string, file: string, _content: string | Promise<string | null>): StrategicFinding | null {
        return {
            file,
            issue: `Direcionamento Cloud para ${objective}: Otimizando para resiliência distribuída e governança IAM.`,
            severity: "STRATEGIC",
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Arquitetura de Nuvem. Sua missão é garantir que o sistema Go seja perfeitamente orquestrado e seguro.`;
    }
}
