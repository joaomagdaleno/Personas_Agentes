import { BaseActivePersona } from "../../base_active_persona.ts";
import winston from "winston";

const logger = winston.child({ module: "TS_Cache" });

/**
 * 💾 Dr. Cache — PhD in TypeScript Data Layer & I/O Optimization
 * Especialista em otimização de I/O, leituras síncronas e gestão de cache.
 */
export class CachePersona extends BaseActivePersona {
    constructor(projectRoot: string | null = null) {
        super(projectRoot);
        this.name = "Cache";
        this.emoji = "💾";
        this.role = "PhD Data Layer Engineer";
        this.stack = "TypeScript";
    }

    async performAudit(): Promise<any[]> {
        const start = Date.now();
        logger.info(`[${this.name}] Analisando Camada de Dados TypeScript...`);

        const auditRules = [
            { regex: 'readFileSync\\(', issue: 'Bloqueio de I/O: readFileSync trava o event loop.', severity: 'high' },
            { regex: 'writeFileSync\\(', issue: 'Bloqueio de I/O: writeFileSync trava o event loop.', severity: 'high' },
            { regex: 'fs\\.(?:read|write|stat|access)(?!.*Sync)(?!.*await|promise)', issue: 'Callback I/O: Operação de arquivo via callback — use fs/promises.', severity: 'medium' },
            { regex: 'new Map\\(\\).*(?:set|get).*(?:set|get).*(?:set|get)', issue: 'Cache Ingênuo: Map como cache sem TTL ou eviction — risco de memory leak.', severity: 'medium' },
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
        if (/readFileSync|writeFileSync/.test(content)) {
            return {
                file, severity: "HIGH", persona: this.name,
                issue: `Lentidão Sistêmica: O objetivo '${objective}' exige velocidade. Em '${file}', operações síncronas de arquivo prejudicam a 'Orquestração de Inteligência Artificial'.`
            };
        }
        return {
            file, severity: "INFO", persona: this.name,
            issue: `PhD Cache: Analisando performance de I/O para ${objective}. Focando em eliminação de bloqueios síncronos.`
        };
    }

    selfDiagnostic(): any {
        return {
            status: "Soberano",
            score: 100,
            details: "Gerente de dados TS operando com eficiência PhD."
        };
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em dados e otimização de I/O TypeScript.`;
    }
}
