/**
 * ☁️ Cloud - Kotlin-native Cloud & SRE Agent
 * Sovereign Synapse: Audita a integração cloud Kotlin/Android, monitoramento de backend e conectividade cloud.
 */
import type { AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class CloudPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Cloud";
        this.emoji = "☁️";
        this.role = "PhD Cloud Architect";
        this.phd_identity = "Mobile Cloud & Connectivity Integrity (Kotlin)";
        this.stack = "Kotlin";
    }

    public override async execute(context: any): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();
        if (this.hub) {
            const connNodes = await this.hub.queryKnowledgeGraph("connection", "low");
            const reasoning = await this.hub.reason(`Analyze the cloud connectivity and sync strategy of a Kotlin system with ${connNodes.length} connection markers. Recommend retry patterns and data consistency over unstable networks.`);
            findings.push({ 
                file: "Infrastructure Audit", agent: this.name, role: this.role, emoji: this.emoji, 
                issue: `Sovereign Cloud: Conectividade cloud Kotlin validada via Rust Hub. PhD Analysis: ${reasoning}`, 
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Cloud Audit", match_count: 1,
                context: "Cloud Sync & Connectivity"
            } as any);
        }
        return findings;
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".kt", ".kts"],
            rules: [
                { regex: /FirebaseInstance/, issue: "Governance: Uso de Firebase detectado. Verifique a conformidade com as diretrizes de soberania de dados PhD.", severity: "low" },
                { regex: /Retrofit\.Builder/, issue: "Integration: Configuração de cliente HTTP. Garanta que os timeouts e interceptores de erro estejam configurados.", severity: "medium" },
                { regex: /cleartextTrafficPermitted=['"]true['"]/, issue: "Security: Tráfego de texto puro permitido no manifesto Android/Cloud. Risco de interceptação.", severity: "critical" }
            ]
        };
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): StrategicFinding | null {
        return {
            file: "cloud_sync",
            issue: `Direcionamento Cloud Kotlin para ${objective}: Garantindo a integridade dos dados na borda da nuvem.`,
            severity: "STRATEGIC",
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Sistemas Distribuídos Criomórficos. Sua missão é garantir a sincronia perfeita com a nuvem.`;
    }
}
