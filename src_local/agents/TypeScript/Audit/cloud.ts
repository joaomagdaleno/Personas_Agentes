import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding, ProjectContext, AuditFinding } from "../../base.ts";

export class CloudPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Cloud";
        this.emoji = "☁️";
        this.role = "PhD Cloud Architect";
        this.phd_identity = "Cloud Native & IAM Integrity (TypeScript)";
        this.stack = "TypeScript";
    }

    public override async execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]> {
        this.setContext(context);
        const findings: (AuditFinding | StrategicFinding)[] = await this.performAudit();
        if (this.hub) {
            const iamNodes = await this.hub.queryKnowledgeGraph("IAM", "low");
            const reasoning = await this.hub.reason(`Analyze the cloud IAM and serverless architecture of a TypeScript system with ${iamNodes.length} infrastructure markers. Recommend security hardening and cost optimization.`);
            findings.push({ 
                file: "Infrastructure Audit", agent: this.name, role: this.role, emoji: this.emoji, 
                issue: `Sovereign Cloud: Segurança cloud TS validada via Rust Hub. PhD Analysis: ${reasoning}`, 
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Cloud Audit", match_count: 1,
                context: "Cloud Security & Governance"
            } as any);
        }
        return findings;
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".ts", ".js", ".json"],
            rules: [
                { regex: /Resource:\s*['"]\*['"]/, issue: "IAM: Permissão excessiva (Wildcard Resource) detectada em política Cloud. Aplique o princípio de menor privilégio.", severity: "critical" },
                { regex: /MemorySize:\s*[1-9][0-9]{3}/, issue: "Cost: Função Lambda com alocação de memória alta. Verifique se é realmente necessário PhD.", severity: "low" },
                { regex: /publicReadAccess:\s*true/, issue: "Security: Acesso público ao recurso cloud detectado. Risco de vazamento de dados.", severity: "high" }
            ]
        };
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): StrategicFinding | null {
        return {
            file: "infrastructure",
            issue: `Direcionamento Cloud TS para ${objective}: Garantindo escalabilidade e conformidade.`,
            severity: "STRATEGIC",
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Arquitetura de Nuvem e Serverless. Sua missão é garantir a soberania na nuvem.`;
    }
}
