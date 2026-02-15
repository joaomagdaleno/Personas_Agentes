import { BaseActivePersona } from "../../base_persona.ts";
import winston from "winston";

const logger = winston.child({ module: "Bun_Bridge" });

/**
 * 🌉 Dr. Bridge — PhD in Bun FFI & Native Integration
 * Especialista em Bun FFI, integração nativa e contratos de API.
 */
export class BridgePersona extends BaseActivePersona {
    constructor(projectRoot: string | null = null) {
        super(projectRoot);
        this.name = "Bridge";
        this.emoji = "🌉";
        this.role = "PhD Bun Integration Architect";
        this.stack = "Bun";
    }

    async performAudit(): Promise<any[]> {
        const start = Date.now();
        logger.info(`[${this.name}] Analisando Integrações Bun...`);

        const auditRules = [
            { regex: 'bun:ffi', issue: 'FFI: Uso de bun:ffi para integração nativa — verifique memory safety.', severity: 'medium' },
            { regex: 'dlopen\\(', issue: 'FFI: dlopen carregando biblioteca nativa — verifique origem e permissões.', severity: 'high' },
            { regex: 'fetch\\s*\\([^)]*\\)\\.then\\([^)]*as\\s+any', issue: 'Contrato Quebrado: Resposta fetch tipada como "any" no Bun.', severity: 'high' },
            { regex: 'Bun\\.file\\([^)]+\\)\\.json\\(\\)(?!\\s*as\\b)', issue: 'Contrato Vago: Bun.file().json() sem tipagem.', severity: 'medium' },
        ];

        const results: any[] = [];
        for (const rule of auditRules) {
            const regex = new RegExp(rule.regex, 'g');
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
        if (/bun:ffi|dlopen/.test(content)) {
            return {
                file, severity: "HIGH", persona: this.name,
                issue: `Risco de Integração: O objetivo '${objective}' exige safety. Em '${file}', FFI nativo requer verificação de memory safety no Bun.`
            };
        }
        return null;
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em integração nativa e FFI Bun.`;
    }
}
