import { BaseActivePersona } from "../../base_persona.ts";
import winston from "winston";

const logger = winston.child({ module: "Bun_Bolt" });

/**
 * ⚡ Dr. Bolt — PhD in Bun Runtime Performance & Native APIs
 * Especialista em uso de APIs nativas do Bun vs polyfills Node.js.
 */
export class BoltPersona extends BaseActivePersona {
    constructor(projectRoot: string | null = null) {
        super(projectRoot);
        this.name = "Bolt";
        this.emoji = "⚡";
        this.role = "PhD Bun Performance Engineer";
        this.stack = "Bun";
    }

    async performAudit(): Promise<any[]> {
        const start = Date.now();
        logger.info(`[${this.name}] Analisando Performance Bun...`);

        const auditRules = [
            { regex: 'while\\s*\\(\\s*true\\s*\\)', issue: 'Gargalo: Loop infinito sem break condicional (Busy-waiting).', severity: 'critical' },
            { regex: 'readFileSync|writeFileSync|require\\(["\']fs["\']\\)|from\\s+["\']fs["\']', issue: 'Bloqueio: Operação síncrona ou Node "fs" — use Bun.file() para I/O nativo.', severity: 'critical' },
            { regex: 'for\\s*\\(.*;.*;.*\\)\\s*\\{[^}]*await', issue: 'Serialização: await dentro de for-loop sequencializa operações paralelas.', severity: 'high' },
            { regex: 'JSON\\.parse\\(JSON\\.stringify|Buffer\\.from\\(', issue: 'Ineficiência: Deep clone ou Buffer legado — use structuredClone ou Uint8Array.', severity: 'medium' },
            { regex: '\\.forEach\\(async', issue: 'Armadilha: forEach com async não aguarda — use for...of ou Promise.all.', severity: 'high' },
        ];

        const results: any[] = [];
        for (const rule of auditRules) {
            const regex = new RegExp(rule.regex, 'g');
            for (const [filePath, content] of Object.entries(this.contextData)) {
                if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
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
        if (/require\(['"]fs['"]|from\s+['"]fs['"]/.test(content)) {
            return {
                file, severity: "HIGH", persona: this.name,
                issue: `Desperdício de Performance: O objetivo '${objective}' exige velocidade nativa. Em '${file}', usar Node.js "fs" em vez de Bun.file() desperdiça o potencial da 'Orquestração de Inteligência Artificial'.`
            };
        }
        return null;
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em performance nativa do Bun runtime.`;
    }
}
