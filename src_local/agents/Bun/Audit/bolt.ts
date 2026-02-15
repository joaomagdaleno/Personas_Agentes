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
            { regex: 'require\\(["\']fs["\']\\)|from\\s+["\']fs["\']', issue: 'Polyfill: Usando Node "fs" — use Bun.file() e Bun.write() para I/O nativo.', severity: 'high' },
            { regex: 'require\\(["\']path["\']\\)|from\\s+["\']path["\']', issue: 'Polyfill: Usando Node "path" — Bun suporta import.meta.dir nativamente.', severity: 'medium' },
            { regex: 'require\\(["\']child_process["\']\\)|from\\s+["\']child_process["\']', issue: 'Polyfill: Usando Node "child_process" — use Bun.spawn() ou Bun.$.', severity: 'high' },
            { regex: 'require\\(["\']crypto["\']\\)|from\\s+["\']crypto["\']', issue: 'Polyfill: Usando Node "crypto" — use Bun.password e Bun.CryptoHasher.', severity: 'medium' },
            { regex: 'Buffer\\.from\\(', issue: 'Legado: Buffer.from() — Bun favorece Uint8Array e Blob nativos.', severity: 'low' },
            { regex: 'readFileSync|writeFileSync', issue: 'Bloqueio: Sync I/O — use Bun.file().text() e Bun.write() assíncronos.', severity: 'high' },
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
