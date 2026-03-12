import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding, AuditFinding } from "../../base.ts";
import type { ProjectContext } from "../../../core/types.ts";

/**
 * ⚡ Dr. Bolt — PhD in Bun Runtime Performance & Native APIs
 * Especialista em uso de APIs nativas do Bun vs polyfills Node.js.
 */
export class BoltPersona extends BaseActivePersona {
    constructor(projectRoot: string | undefined = undefined) {
        super(projectRoot);
        this.name = "Bolt";
        this.emoji = "⚡";
        this.role = "Sovereign Performance Architect";
        this.phd_identity = "Computational Efficiency & Runtime Optimization";
        this.stack = "Bun";
    }

    override async execute(context: ProjectContext): Promise<AuditFinding[]> {
        this.setContext(context);
        const findings = await this.performAudit();

        if (this.hub) {
            for (const file of Object.keys(this.contextData)) {
                if (file.endsWith(".ts") || file.endsWith(".js")) {
                    const res = await this.hub.analyzeFile(file);
                    if (res && res.complexity > 15) {
                        // Analise PhD
                        const neighbors = await this.hub.getContext(file);
                        const reasonPrompt = `Analyze the performance of high complexity (${res.complexity}) in the Bun file ${file}. Context: ${neighbors.join(", ")}`;
                        const reasoning = await this.hub.reason(reasonPrompt);

                        findings.push({
                            file, agent: this.name, role: this.role, emoji: this.emoji,
                            issue: `Sovereign Alert: Nivel de complexidade: ${res.complexity}. Raciocinio PhD: ${reasoning}`,
                            severity: "HIGH", stack: this.stack, evidence: "Local AI reasoning", match_count: 1
                        });
                    }
                }
            }
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.ts', '.tsx'],
            rules: [
                { regex: /while\s*\(\s*true\s*\)/, issue: 'Gargalo: Loop infinito sem break condicional (Busy-waiting).', severity: 'critical' },
                { regex: /readFileSync|writeFileSync|execSync|require\(["']fs["']\)|from\s+["']fs["']/, issue: 'Bloqueio: Operação síncrona ou Node "fs" — use Bun.file() para I/O nativo.', severity: 'critical' },
                { regex: /for\s*\(.*;.*;.*\)\s*\{[^}]*await/, issue: 'Serialização: await dentro de for-loop sequencializa operações paralelas.', severity: 'high' },
                { regex: /JSON\.parse\(JSON\.stringify|Buffer\.from\(/, issue: 'Ineficiência: Deep clone ou Buffer legado — use structuredClone ou Uint8Array.', severity: 'medium' },
                { regex: /\.forEach\(async/, issue: 'Armadilha: forEach com async não aguarda — use for...of or Promise.all.', severity: 'high' },
            ]
        };
    }

    reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        if (content["match"](/require\(['"]fs['"]|from\s+['"]fs['"]/)) {
            return {
                file, severity: "HIGH",
                issue: `Desperdício de Performance: O objetivo '${objective}' exige velocidade nativa. Em '${file}', usar Node.js "fs" em vez de Bun.file() desperdiça o potencial da 'Orquestração de Inteligência Artificial'.`,
                context: "Node.js 'fs' module detected"
            };
        }
        return null;
    }

    override selfDiagnostic(): any {
        return {
            status: "Soberano",
            score: 100,
            details: "Motor de performance Bun operando com consciência PhD plena."
        };
    }

    override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em performance nativa do Bun runtime.`;
    }
}
