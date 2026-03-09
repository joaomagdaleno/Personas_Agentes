import { BaseActivePersona, AuditRule, StrategicFinding } from "../../base.ts";
import winston from "winston";

const logger = winston.child({ module: "TS_Bolt" });

/**
 * 🏎️ Dr. Bolt — PhD in TypeScript Computational Efficiency
 * Especialista em performance de runtime, loops bloqueantes e operações síncronas.
 */
export class BoltPersona extends BaseActivePersona {
    constructor(projectRoot: string | null = null) {
        super(projectRoot);
        this.name = "Bolt";
        this.emoji = "⚡";
        this.role = "PhD Performance Engineer";
        this.stack = "TypeScript";
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.ts', '.tsx'],
            rules: [
                { regex: /while\s*\(\s*true\s*\)/, issue: 'Gargalo: Loop infinito sem break condicional.', severity: 'critical' },
                { regex: /readFileSync|writeFileSync|execSync/, issue: 'Bloqueio: Operação síncrona de I/O em código TypeScript.', severity: 'critical' },
                { regex: /for\s*\(.*;.*;.*\)\s*\{[^}]*await/, issue: 'Serialização: await dentro de for-loop sequencializa operações paralelas.', severity: 'high' },
                { regex: /JSON\.parse\(JSON\.stringify/, issue: 'Ineficiência: Deep clone via JSON roundtrip em vez de structuredClone.', severity: 'medium' },
                { regex: /\.forEach\(async/, issue: 'Armadilha: forEach com async não aguarda — use for...of ou Promise.all.', severity: 'high' },
            ]
        };
    }

    reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        if (/readFileSync|writeFileSync|execSync/.test(content)) {
            return {
                file, severity: "HIGH",
                issue: `Gargalo de Runtime: O objetivo '${objective}' exige alta performance. Operações síncronas em '${file}' paralisam o event loop da 'Orquestração de Inteligência Artificial'.`,
                context: "Sync I/O detected"
            };
        }
        if (/while\s*\(\s*true\s*\)/.test(content)) {
            return {
                file, severity: "CRITICAL",
                issue: `Busy-Waiting: O objetivo '${objective}' exige eficiência. Loops infinitos em '${file}' consomem 100% da CPU na 'Orquestração de Inteligência Artificial'.`,
                context: "Infinite loop detected"
            };
        }
        return {
            file, severity: "INFO",
            issue: `PhD Performance: Analisando eficiência computacional para ${objective}. Focando em eliminação de gargalos e concorrência ativa.`,
            context: "analyzing efficiency"
        };
    }

    selfDiagnostic(): any {
        return {
            status: "Soberano",
            score: 100,
            details: "Motor de performance TS operando com consciência PhD plena."
        };
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em performance TypeScript e otimização de runtime.`;
    }
}
