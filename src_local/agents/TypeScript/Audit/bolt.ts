import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding, AuditFinding } from "../../base.ts";
import type { ProjectContext } from "../../../core/types.ts";

/**
 * 🏎️ Dr. Bolt — PhD in TypeScript Computational Efficiency
 * Especialista em performance de runtime, loops bloqueantes e operações síncronas.
 */
export class BoltPersona extends BaseActivePersona {
    constructor(projectRoot: string | undefined = undefined) {
        super(projectRoot);
        this.name = "Bolt";
        this.emoji = "⚡";
        this.role = "Sovereign Performance Architect";
        this.phd_identity = "Computational Efficiency & Runtime Optimization";
        this.stack = "TypeScript";
    }

    override async execute(context: ProjectContext): Promise<AuditFinding[]> {
        this.setContext(context);
        const findings = await this.performAudit();

        if (this.hub) {
            // Enhanced Native Audit for TS files
            for (const file of Object.keys(this.contextData)) {
                if (file.endsWith(".ts")) {
                    const res = await this.hub.analyzeFile(file);
                    if (res && res.complexity > 15) {
                        // Level 1: Contextual Impact
                        const neighbors = await this.hub.getContext(file);
                        
                        // Analise PhD
                        const reasonPrompt = `Analyze the architectural impact of high complexity (${res.complexity}) in ${file}. Neighbors: ${neighbors.join(", ")}`;
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

    override reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        if (content["match"](/readFileSync|writeFileSync|execSync/)) {
            return {
                file, severity: "HIGH",
                issue: `Gargalo de Runtime: O objetivo '${objective}' exige alta performance. Operações síncronas em '${file}' paralisam o event loop da 'Orquestração de Inteligência Artificial'.`,
                context: "Sync I/O detected"
            };
        }
        if (content["match"](/while\s*\(\s*true\s*\)/)) {
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

    override selfDiagnostic(): any {
        return {
            status: "Soberano",
            score: 100,
            details: "Motor de performance TS operando com consciência PhD plena."
        };
    }

    override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em performance TypeScript e otimização de runtime.`;
    }
}
