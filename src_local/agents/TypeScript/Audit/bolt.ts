import { BaseActivePersona } from "../../base_persona.ts";
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

    async performAudit(): Promise<any[]> {
        const start = Date.now();
        logger.info(`[${this.name}] Analisando Eficiência Computacional TypeScript...`);

        const auditRules = [
            { regex: 'while\\s*\\(\\s*true\\s*\\)', issue: 'Gargalo: Loop infinito sem break condicional.', severity: 'critical' },
            { regex: 'readFileSync|writeFileSync|execSync', issue: 'Bloqueio: Operação síncrona de I/O em código TypeScript.', severity: 'critical' },
            { regex: 'for\\s*\\(.*;.*;.*\\)\\s*\\{[^}]*await', issue: 'Serialização: await dentro de for-loop sequencializa operações paralelas.', severity: 'high' },
            { regex: 'JSON\\.parse\\(JSON\\.stringify', issue: 'Ineficiência: Deep clone via JSON roundtrip em vez de structuredClone.', severity: 'medium' },
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
        if (/readFileSync|writeFileSync|execSync/.test(content)) {
            return {
                file, severity: "HIGH", persona: this.name,
                issue: `Gargalo de Runtime: O objetivo '${objective}' exige alta performance. Operações síncronas em '${file}' paralisam o event loop da 'Orquestração de Inteligência Artificial'.`
            };
        }
        if (/while\s*\(\s*true\s*\)/.test(content)) {
            return {
                file, severity: "CRITICAL", persona: this.name,
                issue: `Busy-Waiting: O objetivo '${objective}' exige eficiência. Loops infinitos em '${file}' consomem 100% da CPU na 'Orquestração de Inteligência Artificial'.`
            };
        }
        return {
            file, severity: "INFO", persona: this.name,
            issue: `PhD Performance: Analisando eficiência computacional para ${objective}. Focando em eliminação de gargalos e concorrência ativa.`
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
