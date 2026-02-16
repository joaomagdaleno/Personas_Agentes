import { BaseActivePersona } from "../../base_persona.ts";
import winston from "winston";

const logger = winston.child({ module: "TS_Sentinel" });

/**
 * 🛡️ Dr. Sentinel — PhD in TypeScript Transport Security & HTTPS
 * Especialista em segurança de transporte, CORS, HTTP vs HTTPS.
 */
export class SentinelPersona extends BaseActivePersona {
    constructor(projectRoot: string | null = null) {
        super(projectRoot);
        this.name = "Sentinel";
        this.emoji = "🛡️";
        this.role = "PhD Security Architect";
        this.stack = "TypeScript";
    }

    async performAudit(): Promise<any[]> {
        const start = Date.now();
        logger.info(`[${this.name}] Analisando Segurança de Transporte TypeScript...`);

        const auditRules = [
            { regex: 'http:\\/\\/(?!localhost|127\\.0\\.0\\.1|0\\.0\\.0\\.0)', issue: 'Vulnerabilidade: URL HTTP sem criptografia — use HTTPS.', severity: 'high' },
            { regex: 'rejectUnauthorized:\\s*false', issue: 'Crítico: Verificação TLS desativada — vulnerável a MITM.', severity: 'critical' },
            { regex: 'NODE_TLS_REJECT_UNAUTHORIZED\\s*=\\s*["\']?0', issue: 'Crítico: Validação TLS global desativada.', severity: 'critical' },
            { regex: 'cors\\(\\)', issue: 'Permissivo: CORS aberto para todas as origens.', severity: 'high' },
            { regex: 'Access-Control-Allow-Origin.*\\*', issue: 'Permissivo: CORS wildcard permite qualquer origem.', severity: 'high' },
        ];

        const results: any[] = [];
        for (const rule of auditRules) {
            const regex = new RegExp(rule.regex, 'g');
            for (const [filePath, content] of Object.entries(this.contextData)) {
                if (filePath.endsWith('.ts') || filePath.endsWith('.tsx') || filePath.endsWith('.json')) {
                    for (const match of (content as string).matchAll(regex)) {
                        results.push({ file: filePath, issue: rule.issue, severity: rule.severity, evidence: match[0], persona: this.name });
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
                issue: `Vulnerabilidade de Transporte: O objetivo '${objective}' exige segurança. Em '${file}', o uso de HTTP permite ataques MITM contra a 'Orquestração de Inteligência Artificial'.`
            };
        }
        return {
            file, severity: "INFO", persona: this.name,
            issue: `PhD Sentinel: Analisando blindagem de transporte para ${objective}. Focando em HTTPS e CORS restrito.`
        };
    }

    selfDiagnostic(): any {
        return {
            status: "Soberano",
            score: 100,
            details: "Sentinela de rede TS operando com vigilância PhD."
        };
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em segurança de transporte e criptografia TypeScript.`;
    }
}
