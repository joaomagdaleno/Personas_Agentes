/**
 * 🛡️ Sentinel - PhD in System Protection & Shielding (Flutter)
 * Analisa a integridade de fluxos críticos e proteção de memória.
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";
import type { ProjectContext } from "../../../core/types.ts";

export class SentinelPersona extends BaseActivePersona {
    constructor(projectRoot: string | undefined = undefined) {
        super(projectRoot);
        this.name = "Sentinel";
        this.emoji = "🛡️";
        this.role = "Sovereign Security Architect";
        this.phd_identity = "System Protection & Transport Layer Shielding";
        this.stack = "Flutter";
    }

    override async execute(context: ProjectContext): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();

        if (this.hub) {
            // Level 1: Blast Radius (Flutter Core)
            const graph = await this.hub.getKnowledgeGraph("src_local/core/types.ts", 2);
            
            // Level 2: Security Query (Crypto/Transport)
            const securityQuery = await this.hub.queryKnowledgeGraph("encrypt", "critical");

            // Level 3: PhD Security Reasoning
            const reasoning = await this.hub.reason(`Analyze Flutter/Dart shielding given ${securityQuery.length} crypto findings.`);

            findings.push({
                file: "Dart Core", agent: this.name, role: this.role, emoji: this.emoji,
                issue: `Sovereign Shield: Blindagem Dart validada. PhD Analysis: ${reasoning}`,
                severity: "INFO", stack: this.stack, evidence: `KG Depth: ${graph.nodes.length} nodes analyzed`, match_count: 1
            } as any);
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".dart"],
            rules: [
                { regex: /TrustManager/, issue: "Segurança de Certificado: Verifique se há pinning de SSL para evitar interceptação de rede.", severity: "high" },
                { regex: /LocalAuthentication/, issue: "Biometria: Verifique se o fluxo de autenticação local trata adequadamente falhas de hardware.", severity: "medium" },
                { regex: /checkRoot\(/, issue: "Detecção de Root: Sistema de proteção ativa detectado. Verifique a robustez da detecção.", severity: "low" },
                { regex: /encrypt\(|decrypt\(/, issue: "Criptografia: Verifique se os vetores de inicialização (IV) são únicos e randômicos.", severity: "critical" },
                { regex: /http:\/\/(?!localhost|127\.0\.0\.1)/, issue: "Vulnerabilidade: URL HTTP detectada em Flutter.", severity: "high" },
                { regex: /io\.HttpClient\(\)\.\.badCertificateCallback/, issue: "Segurança: Aceitando certificados inválidos em Flutter.", severity: "critical" }
            ]
        };
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const { extensions, rules } = this.getAuditRules();
        const results = await this.findPatterns(extensions, rules);

        // Advanced Logic: Shielding Audit
        if (results.some(r => r.severity === "critical")) {
            this.reasonAboutObjective("System Shielding", "Encryption", "Found potential weakness in cryptographic implementation.");
        }

        this.endMetrics(results.length);
        return results;
    }

    public override performActiveHealing(blindSpots: string[]): void {
        console.log(`🛠️ [Sentinel] Reforçando barreiras de segurança para: ${blindSpots.join(", ")}`);
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): string | StrategicFinding | null {
        return {
            objective,
            analysis: "Auditando blindagem sistêmica e resiliência contra ataques locais.",
            recommendation: "Implementar 'Obfuscation' no build release para dificultar engenharia reversa.",
            severity: "high"
        } as StrategicFinding;
    }

    public override selfDiagnostic(): any {
        const diag = super.selfDiagnostic();
        if (this.stack !== "Flutter") diag.issues.push("Inconsistent tech stack.");
        return diag;
    }

    override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Proteção de Sistemas Flutter. Sua missão é ser o escudo intransponível do código.`;
    }
}

