import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding, AuditFinding } from "../../base.ts";
import type { ProjectContext } from "../../../core/types.ts";

/**
 * ⚡ BOLT Persona (Rust Stack) - HYBRID VERSION
 * @dna bolt.json
 */
export class BoltRustAgent extends BaseActivePersona {
    constructor(projectRoot: string | undefined = undefined) {
        super(projectRoot);
        this.id = "rust:audit:bolt";
        this.name = "Bolt";
        this.emoji = "⚡";
        this.role = "Sovereign Performance Architect";
        this.stack = "Rust";
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.rs', 'Cargo.toml'],
            rules: [
                { regex: /unsafe\s*\{/, issue: 'Native Risk: Uso de bloco unsafe detectado.', severity: 'medium' },
                { regex: /unwrap\(\)/, issue: 'Panic Risk: Uso de unwrap() pode causar pânico no Cérebro.', severity: 'high' },
                { regex: /expect\(/, issue: 'Panic Risk: Uso de expect() — verifique se o erro é recuperável.', severity: 'medium' }
            ]
        };
    }

    override async execute(context: ProjectContext): Promise<AuditFinding[]> {
        this.setContext(context);
        const findings = await this.performAudit();

        // 🧠 POWER UP: Análise AST Nativa via Rust Hub
        if (this.hub) {
            console.log("🚀 [Bolt-Rust] Acionando análise AST Nativa...");
            for (const file of Object.keys(this.contextData)) {
                if (file.endsWith(".rs")) {
                    const nativeResult = await this.hub.analyzeFile(file);
                    if (nativeResult && nativeResult.complexity > 10) {
                        const neighbors = await this.hub.getContext(file);
                        const reasonPrompt = `Analyze the borrow-checker and performance impact of complexity (${nativeResult.complexity}) in the Rust file ${file}. Neighbors: ${neighbors.join(", ")}`;
                        const reasoning = await this.hub.reason(reasonPrompt);

                        findings.push({
                            file,
                            agent: this.name,
                            role: this.role,
                            emoji: this.emoji,
                            issue: `Sovereign Alert: Complexidade crítica em Rust (${nativeResult.complexity}). Raciocínio PhD: ${reasoning}`,
                            severity: "HIGH",
                            stack: "Rust",
                            evidence: `Local AI reasoning via Hub Rust`,
                            match_count: 1
                        });
                    }
                }
            }
        }

        return findings;
    }

    override reasonAboutObjective(_obj: string, _f: string, _c: string | Promise<string | null>): StrategicFinding | null {
        return null; // Audit focus
    }

    override getSystemPrompt(): string {
        return `Você é ${this.name}, o auditor mais veloz do sistema, especializado em prevenir pânicos e vazamentos de memória no núcleo Rust.`;
    }
}
