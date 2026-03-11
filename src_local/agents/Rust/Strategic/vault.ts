import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding, AuditFinding } from "../../base.ts";
import type { ProjectContext } from "../../../core/types.ts";

/**
 * 💰 Vault Persona (Rust Stack) - PhD Financial Integrity & Crypto
 * Especialista em integridade financeira determinística e criptografia nativa.
 */
export class VaultRustAgent extends BaseActivePersona {
    constructor(projectRoot: string | undefined = undefined) {
        super(projectRoot);
        this.id = "rust:strategic:vault";
        this.name = "Vault";
        this.emoji = "💰";
        this.role = "PhD Cryptographer";
        this.phd_identity = "Rust Financial Precision & Deterministic Crypto";
        this.stack = "Rust";
    }

    override async execute(context: ProjectContext): Promise<AuditFinding[]> {
        this.setContext(context);
        const findings = await this.performAudit();

        if (this.hub) {
            // Financial Intelligence via Knowledge Graph
            const cryptoQuery = await this.hub.queryKnowledgeGraph("crypto", "high");
            
            // PhD Financial Reasoning
            const reasoning = await this.hub.reason(`Analyze the cryptographic and financial precision of a Rust system with ${cryptoQuery.length} sensitive calculation sites.`);

            findings.push({
                file: "Financial Core", agent: this.name, role: this.role, emoji: this.emoji,
                issue: `Sovereign Vault: Integridade financeira nativa validada via Rust Hub. PhD Analysis: ${reasoning}`,
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Crypto Audit", match_count: 1
            } as any);
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.rs'],
            rules: [
                { regex: /f32|f64/, issue: 'Precision Risk: Uso de floating-point para dados financeiros. Use rust_decimal ou equivalentes PhD.', severity: 'high' },
                { regex: /rand::thread_rng/, issue: 'Entropia: Verifique se o RNG é adequado para contextos criptográficos ou se é apenas para estatística.', severity: 'medium' },
                { regex: /md5::|sha1::/, issue: 'Weak Hashing: Uso de algoritmos obsoletos detectado. Rust exige SHA-256 ou superior.', severity: 'critical' },
                { regex: /zeroize/, issue: 'Data Sanitation: Verifique se segredos na memória estão sendo limpos via trait Zeroize após o uso.', severity: 'medium' },
            ]
        };
    }

    override reasonAboutObjective(objective: string, file: string, _content: string | Promise<string | null>): StrategicFinding | null {
        return {
            file,
            issue: `Security Strategy: ${objective}`,
            context: "Native Financial Integrity",
            objective,
            analysis: "Auditando precisão numérica e higiene de segredos em memória nativa Rust.",
            recommendation: "Banir tipos 'primitive float' de estruturas de dados que lidam com moeda ou tokens.",
            severity: "HIGH"
        };
    }

    override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Criptografia e Precisão Financeira Rust.`;
    }
}
