import { BaseActivePersona } from "../../base_persona.ts";
import winston from "winston";

const logger = winston.child({ module: "Bun_Sentinel" });

/**
 * 🛡️ Dr. Sentinel — PhD in Bun Transport Security & Bun.serve Safety
 * Especialista em segurança de Bun.serve, HTTPS, TLS e CORS.
 */
export class SentinelPersona extends BaseActivePersona {
    constructor(projectRoot: string | null = null) {
        super(projectRoot);
        this.name = "Sentinel";
        this.emoji = "🛡️";
        this.role = "PhD Bun Security Architect";
        this.stack = "Bun";
    }

    async performAudit(): Promise<any[]> {
        const start = Date.now();
        logger.info(`[${this.name}] Analisando Segurança de Transporte Bun...`);

        const auditRules = [
            { regex: 'http:\\/\\/(?!localhost|127\\.0\\.0\\.1)', issue: 'Inseguro: URL HTTP sem TLS no Bun.', severity: 'high' },
            { regex: 'Bun\\.serve\\([^)]*\\)(?![\\s\\S]{0,200}tls|cert)', issue: 'Sem TLS: Bun.serve sem configuração de TLS/certificado.', severity: 'high' },
            { regex: 'rejectUnauthorized:\\s*false', issue: 'Crítico: Verificação TLS desativada no Bun.', severity: 'critical' },
            { regex: 'Access-Control-Allow-Origin.*\\*', issue: 'Permissivo: CORS wildcard no Bun.serve.', severity: 'high' },
        ];

        const results: any[] = [];
        for (const rule of auditRules) {
            const regex = new RegExp(rule.regex, 'gs');
            for (const [filePath, content] of Object.entries(this.contextData)) {
                if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
                    for (const match of (content as string).matchAll(regex)) {
                        results.push({ file: filePath, issue: rule.issue, severity: rule.severity, evidence: match[0].substring(0, 60), persona: this.name });
                    }
                }
            }
        }

        const duration = (Date.now() - start) / 1000;
        logger.info(`[${this.name}] Auditoria concluída em ${duration.toFixed(4)}s. Achados: ${results.length}`);
        return results;
    }

    async reasonAboutObjective(objective: string, file: string, content: string): Promise<any | null> {
        if (/http:\/\/(?!localhost|127\.0\.0\.1)/.test(content)) {
            return {
                file, severity: "HIGH", persona: this.name,
                issue: `Vulnerabilidade: O objetivo '${objective}' exige segurança. Em '${file}', HTTP sem TLS expõe o Bun.serve a ataques MITM.`
            };
        }
        return null;
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em segurança de transporte e TLS Bun.`;
    }
}
