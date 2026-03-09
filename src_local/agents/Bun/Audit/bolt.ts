import { BaseActivePersona, AuditRule, StrategicFinding } from "../../base.ts";
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

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.ts', '.tsx'],
            rules: [
                { regex: /while\s*\(\s*true\s*\)/, issue: 'Gargalo: Loop infinito sem break condicional (Busy-waiting).', severity: 'critical' },
                { regex: /readFileSync|writeFileSync|require\(["']fs["']\)|from\s+["']fs["']/, issue: 'Bloqueio: Operação síncrona ou Node "fs" — use Bun.file() para I/O nativo.', severity: 'critical' },
                { regex: /for\s*\(.*;.*;.*\)\s*\{[^}]*await/, issue: 'Serialização: await dentro de for-loop sequencializa operações paralelas.', severity: 'high' },
                { regex: /JSON\.parse\(JSON\.stringify|Buffer\.from\(/, issue: 'Ineficiência: Deep clone ou Buffer legado — use structuredClone ou Uint8Array.', severity: 'medium' },
                { regex: /\.forEach\(async/, issue: 'Armadilha: forEach com async não aguarda — use for...of ou Promise.all.', severity: 'high' },
            ]
        };
    }

    reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        if (/require\(['"]fs['"]|from\s+['"]fs['"]/.test(content)) {
            return {
                file, severity: "HIGH",
                issue: `Desperdício de Performance: O objetivo '${objective}' exige velocidade nativa. Em '${file}', usar Node.js "fs" em vez de Bun.file() desperdiça o potencial da 'Orquestração de Inteligência Artificial'.`,
                context: "Node.js 'fs' module detected"
            };
        }
        return null;
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em performance nativa do Bun runtime.`;
    }
}
