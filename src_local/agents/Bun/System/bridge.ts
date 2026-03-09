import { BaseActivePersona, AuditRule, StrategicFinding } from "../../base.ts";
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

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.ts', '.tsx'],
            rules: [
                { regex: /bun:ffi/, issue: 'FFI: Uso de bun:ffi para integração nativa — verifique memory safety.', severity: 'medium' },
                { regex: /dlopen\(/, issue: 'FFI: dlopen carregando biblioteca nativa — verifique origem e permissões.', severity: 'high' },
                { regex: /fetch\s*\([^)]*\)\.then\([^)]*as\s+any/, issue: 'Contrato Quebrado: Resposta fetch tipada como "any" no Bun.', severity: 'high' },
                { regex: /Bun\.file\([^)]+\)\.json\(\)(?!\s*as\b)/, issue: 'Contrato Vago: Bun.file().json() sem tipagem.', severity: 'medium' },
            ]
        };
    }

    reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        if (/bun:ffi|dlopen/.test(content)) {
            return {
                file, severity: "HIGH",
                issue: `Risco de Integração: O objetivo '${objective}' exige safety. Em '${file}', FFI nativo requer verificação de memory safety no Bun.`,
                context: "FFI usage detected"
            };
        }
        return null;
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em integração nativa e FFI Bun.`;
    }
}
