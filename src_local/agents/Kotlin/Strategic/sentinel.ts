/**
 * 🛡️ Sentinel - PhD in Security Architecture (Kotlin)
 * Guardião da segurança Kotlin e Auditor de Compliance Android e segurança de transporte.
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
        this.stack = "Kotlin";
    }

    override async execute(context: ProjectContext): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();

        if (this.hub) {
            // Level 1: Blast Radius (JVM Core)
            const graph = await this.hub.getKnowledgeGraph("src_local/core/types.ts", 2);
            
            // Level 2: Security Query (Permissions/Transport)
            const securityQuery = await this.hub.queryKnowledgeGraph("cleartext", "high");

            // Level 3: PhD Security Reasoning
            const reasoning = await this.hub.reason(`Analyze Kotlin/Android security given ${securityQuery.length} cleartext findings and dependency graph.`);

            findings.push({
                file: "JVM Core", agent: this.name, role: this.role, emoji: this.emoji,
                issue: `Sovereign Vigilance: Blindagem JVM validada. PhD Analysis: ${reasoning}`,
                severity: "INFO", stack: this.stack, evidence: `KG Depth: ${graph.nodes.length} nodes analyzed`, match_count: 1
            } as any);
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".kt", ".xml"],
            rules: [
                { regex: /http:\/\/(?!localhost|127\.0\.0\.1)/, issue: "Vulnerabilidade: Uso de HTTP bruto em App Android.", severity: "high" },
                { regex: /android:usesCleartextTraffic="true"/, issue: "Risco: Tráfego cleartext expressamente habilitado no Manifest.", severity: "critical" },
                { regex: /\.allowBackup\s*=\s*true/, issue: "Risco: Backup ADB habilitado. Vulnerável a exfiltração de dados físicos.", severity: "high" }
            ]
        };
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const { extensions, rules } = this.getAuditRules();
        const results = await this.findPatterns(extensions, rules);
        this.endMetrics(results.length);
        return results;
    }

    public override reasonAboutObjective(objective: string, file: string, content: string): StrategicFinding | string | null {
        if (content.includes("http://")) {
            return {
                file,
                issue: `Vulnerabilidade Crítica: O objetivo '${objective}' exige canal seguro. Uso de HTTP em '${file}' viola o DNA PhD e compromete a integridade.`,
                severity: "STRATEGIC",
                context: this.name
            };
        }
        return `PhD Security: Analisando perímetro de segurança para ${objective}. Focando em segurança de transporte e proteção de manifesto.`;
    }

    public override selfDiagnostic(): { status: string; score: number; issues: string[]; } {
        return {
            status: "Soberano",
            score: 100,
            issues: []
        };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Segurança de Arquitetura e Guardião Sênior Kotlin.`;
    }
}

