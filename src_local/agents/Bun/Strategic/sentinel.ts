import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding } from "../../base.ts";
import type { ProjectContext } from "../../../core/types.ts";

/**
 * 🛡️ Dr. Sentinel — PhD in Bun Transport Security & Bun.serve Safety
 * Especialista em segurança de Bun.serve, HTTPS, TLS e CORS.
 */
export class SentinelPersona extends BaseActivePersona {
    constructor(projectRoot: string | undefined = undefined) {
        super(projectRoot);
        this.name = "Sentinel";
        this.emoji = "🛡️";
        this.role = "Sovereign Security Architect";
        this.phd_identity = "System Protection & Transport Layer Shielding";
        this.stack = "Bun";
    }

    override async execute(context: ProjectContext): Promise<StrategicFinding[]> {
        this.setContext(context);
        const findings = this.performStrategicAudit() as StrategicFinding[];

        if (this.hub) {
            // Knowledge Graph: Security Surface
            await this.hub.getKnowledgeGraph("src_local/core/types.ts", 1);
            
            // Security Query: Tls/Https
            const securityQuery = await this.hub.queryKnowledgeGraph("tls", "high");

            // PhD Security Reasoning
            const reasoning = await this.hub.reason(`Analyze Bun transport security given ${securityQuery.length} TLS findings and graph connectivity.`);

            findings.push({
                file: "Core Shield",
                severity: "INFO",
                issue: `Sovereign Bun Shield: Integridade verificada. PhD Analysis: ${reasoning}`,
                context: "Knowledge Graph Integration"
            });
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.ts', '.tsx'],
            rules: [
                { regex: /http:\/\/(?!localhost|127\.0\.0\.1)/, issue: 'Inseguro: URL HTTP sem TLS no Bun.', severity: 'high' },
                { regex: /Bun\.serve\([^)]*\)(?![\s\S]{0,200}tls|cert)/, issue: 'Sem TLS: Bun.serve sem configuração de TLS/certificado.', severity: 'high' },
                { regex: /rejectUnauthorized:\s*false/, issue: 'Crítico: Verificação TLS desativada no Bun.', severity: 'critical' },
                { regex: /Access-Control-Allow-Origin.*[\*]/, issue: 'Permissivo: CORS wildcard no Bun.serve.', severity: 'high' },
            ]
        };
    }

    reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        if (!/http:\/\/(?!localhost|127\.0\.0\.1)/.test(content)) return null;

        return {
            file, severity: "HIGH",
            issue: `Vulnerabilidade: O objetivo '${objective}' exige segurança. Em '${file}', HTTP sem TLS expõe o Bun.serve a ataques MITM.`,
            context: "Insecure HTTP URL detected"
        };
    }

    override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em segurança de transporte e TLS Bun.`;
    }
}
