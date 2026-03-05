import { BaseActivePersona } from "../../base_persona.ts";
import winston from "winston";

const logger = winston.child({ module: "Bun_Nebula" });

/**
 * ☁️ Dr. Nebula — PhD in Bun Security & Secrets Management
 * Especialista em Bun.password, segurança de hashing e proteção de credenciais.
 */
export class NebulaPersona extends BaseActivePersona {
    constructor(projectRoot: string | null = null) {
        super(projectRoot);
        this.name = "Nebula";
        this.emoji = "☁️";
        this.role = "PhD Bun Security Architect";
        this.stack = "Bun";
    }

    async performAudit(): Promise<any[]> {
        const start = Date.now();
        logger.info(`[${this.name}] Analisando Segurança Bun...`);

        const auditRules = this.getSecurityRules();
        const results: any[] = [];

        for (const rule of auditRules) {
            this.auditWithRule(rule, results);
        }

        const duration = (Date.now() - start) / 1000;
        logger.info(`[${this.name}] Auditoria concluída em ${duration.toFixed(4)}s. Achados: ${results.length}`);
        return results;
    }

    private getSecurityRules() {
        return [
            { regex: 'AKIA[0-9A-Z]{16}', issue: 'Crítico: Chave AWS exposta no código Bun.', severity: 'critical' },
            { regex: 'sk-[a-zA-Z0-9]{20,}', issue: 'Crítico: Chave OpenAI exposta no código Bun.', severity: 'critical' },
            { regex: 'ghp_[a-zA-Z0-9]{36}', issue: 'Crítico: Token GitHub exposto no código Bun.', severity: 'critical' },
            { regex: '(?:password|secret)\\s*[:=]\\s*["\'][^"\']+', issue: 'Vazamento: Credencial hardcoded — use Bun.env com validação.', severity: 'critical' },
            { regex: 'bcrypt|crypto\\.createHash', issue: 'Polyfill: Use Bun.password.hash() e Bun.CryptoHasher nativos.', severity: 'medium' },
            { regex: 'Bun\\.env\\.[A-Z_]+(?!.*\\?\\?|.*\\|\\||.*throw)', issue: 'Frágil: Bun.env sem fallback ou validação.', severity: 'medium' },
        ];
    }

    private auditWithRule(rule: any, results: any[]) {
        const regex = new RegExp(rule.regex, 'g');
        for (const [filePath, content] of Object.entries(this.contextData)) {
            if (this.shouldAuditFile(filePath)) {
                this.scanContent(filePath, content as string, regex, rule, results);
            }
        }
    }

    private shouldAuditFile(filePath: string): boolean {
        const validExt = filePath.endsWith('.ts') || filePath.endsWith('.tsx') || filePath.endsWith('.json');
        const isManifest = filePath.includes('persona_manifest');
        return validExt && !isManifest;
    }

    private scanContent(filePath: string, content: string, regex: RegExp, rule: any, results: any[]) {
        for (const match of content.matchAll(regex)) {
            results.push({
                file: filePath,
                issue: rule.issue,
                severity: rule.severity,
                evidence: match[0].substring(0, 30) + '...',
                persona: this.name
            });
        }
    }

    async reasonAboutObjective(objective: string, file: string, content: string): Promise<any | null> {
        if (/AKIA|sk-[a-zA-Z0-9]{20}|ghp_/.test(content) && !/rules\s*=/.test(content)) {
            return {
                file, severity: "CRITICAL", persona: this.name,
                issue: `Catástrofe de Segurança: O objetivo '${objective}' exige proteção total. Credenciais expostas em '${file}' permitem o sequestro da 'Orquestração de Inteligência Artificial'.`
            };
        }
        return null;
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em segurança e proteção de segredos Bun.`;
    }
}
