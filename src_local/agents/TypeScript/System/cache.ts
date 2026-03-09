import { BaseActivePersona, AuditRule, StrategicFinding } from "../../base.ts";
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

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.ts', '.tsx'],
            rules: [
                { regex: /readFileSync\(/, issue: 'Bloqueio de I/O: readFileSync trava o event loop.', severity: 'high' },
                { regex: /writeFileSync\(/, issue: 'Bloqueio de I/O: writeFileSync trava o event loop.', severity: 'high' },
                { regex: /fs\.(?:read|write|stat|access)(?!.*Sync)(?!.*await|promise)/, issue: 'Callback I/O: Operação de arquivo via callback — use fs/promises.', severity: 'medium' },
                { regex: /new Map\(\).*(?:set|get).*(?:set|get).*(?:set|get)/, issue: 'Cache Ingênuo: Map como cache sem TTL ou eviction — risco de memory leak.', severity: 'medium' },
            ]
        };
    }

    reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        if (/readFileSync|writeFileSync/.test(content)) {
            return {
                file, severity: "HIGH",
                issue: `Lentidão Sistêmica: O objetivo '${objective}' exige velocidade. Em '${file}', operações síncronas de arquivo prejudicam a 'Orquestração de Inteligência Artificial'.`,
                context: "Sync I/O detected"
            };
        }
        return {
            file, severity: "INFO",
            issue: `PhD Cache: Analisando performance de I/O para ${objective}. Focando em eliminação de bloqueios síncronos.`,
            context: "analyzing I/O performance"
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
