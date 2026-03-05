import { BaseActivePersona } from "../../base_persona.ts";
import winston from "winston";

const logger = winston.child({ module: "TS_Nebula" });

/**
 * ☁️ Dr. Nebula — PhD in TypeScript Cloud Security & Secrets Management
 * Especialista em segurança de credenciais, chaves expostas e vazamento de segredos.
 */
export class NebulaPersona extends BaseActivePersona {
    constructor(projectRoot: string | null = null) {
        super(projectRoot);
        this.name = "Nebula";
        this.emoji = "☁️";
        this.role = "PhD Cloud Security Architect";
        this.stack = "TypeScript";
    }

    async performAudit(): Promise<any[]> {
        const start = Date.now();
        logger.info(`[${this.name}] Analisando Segurança Cloud TypeScript...`);

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
            { regex: 'AKIA[0-9A-Z]{16}', issue: 'Vulnerabilidade Crítica: Chave AWS exposta no código TypeScript.', severity: 'critical' },
            { regex: '(?:api[_-]?key|apiKey|API_KEY)\\s*[:=]\\s*["\'][^"\']{8,}', issue: 'Vazamento: API Key hardcoded no código-fonte.', severity: 'critical' },
            { regex: '(?:password|passwd|secret)\\s*[:=]\\s*["\'][^"\']+["\']', issue: 'Vazamento: Credencial hardcoded no código-fonte.', severity: 'critical' },
            { regex: 'sk-[a-zA-Z0-9]{20,}', issue: 'Vulnerabilidade Crítica: Chave OpenAI exposta.', severity: 'critical' },
            { regex: 'ghp_[a-zA-Z0-9]{36}', issue: 'Vulnerabilidade Crítica: Token GitHub exposto.', severity: 'critical' },
            { regex: 'process\\.env\\.[A-Z_]+\\s*\\|\\|\\s*["\'][^"\']{8,}', issue: 'Risco: Fallback de variável de ambiente contém segredo real.', severity: 'high' },
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
        const isInternal = filePath.includes('persona_manifest') || filePath.includes('rules');
        return validExt && !isInternal;
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
        return {
            file, severity: "INFO", persona: this.name,
            issue: `PhD Cloud Security: Analisando soberania de segredos para ${objective}. Focando em eliminação de hardcoded tokens.`
        };
    }

    selfDiagnostic(): any {
        return {
            status: "Soberano",
            score: 100,
            details: "Cinturão de segurança cloud TS operando com integridade PhD."
        };
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em soberania cloud e segurança de segredos TypeScript.`;
    }
}
