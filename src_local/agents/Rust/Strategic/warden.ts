import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding, AuditFinding } from "../../base.ts";
import type { ProjectContext } from "../../../core/types.ts";

/**
 * ⚖️ Warden Persona (Rust Stack) - PhD Governance & FFI Ethics
 * Especialista em governança de memória, segurança FFI e ética de sistemas nativos.
 */
export class WardenRustAgent extends BaseActivePersona {
    constructor(projectRoot: string | undefined = undefined) {
        super(projectRoot);
        this.id = "rust:strategic:warden";
        this.name = "Warden";
        this.emoji = "⚖️";
        this.role = "PhD Data Governance & Ethics Engineer";
        this.phd_identity = "Rust Memory Governance & FFI Ethics";
        this.stack = "Rust";
    }

    override async execute(context: ProjectContext): Promise<AuditFinding[]> {
        this.setContext(context);
        const findings = await this.performAudit();

        if (this.hub) {
            // Governance Intelligence via Knowledge Graph
            const unsafeQuery = await this.hub.queryKnowledgeGraph("unsafe", "critical");
            
            // PhD Ethical Reasoning
            const reasoning = await this.hub.reason(`Analyze the safety and ethics of a Rust system with ${unsafeQuery.length} unsafe blocks and FFI boundaries.`);

            findings.push({
                file: "Rust Core", agent: this.name, role: this.role, emoji: this.emoji,
                issue: `Sovereign Warden: Governança nativa validada via Rust Hub. PhD Analysis: ${reasoning}`,
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Safety Audit", match_count: 1
            } as any);
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.rs', 'Cargo.toml'],
            rules: [
                { regex: /unsafe\s*{/, issue: 'Memory Governance: Uso de unsafe detectado. Verifique se a invariante é garantida e documentada.', severity: 'high' },
                { regex: /extern\s+"C"/, issue: 'FFI Boundary: Interface com código externo. Risco de corrupção de memória e quebra de tipos.', severity: 'medium' },
                { regex: /ptr::read|ptr::write/, issue: 'Raw Pointer: Manipulação direta de ponteiros. Risco de undefined behavior.', severity: 'critical' },
                { regex: /Box::leak/, issue: 'Resource Leak: Box::leak usado; verifique se a memória é recuperada ou se é realmente estática.', severity: 'medium' },
            ]
        };
    }

    override reasonAboutObjective(objective: string, file: string, _content: string | Promise<string | null>): StrategicFinding | null {
        return {
            file,
            issue: `Sovereignty Strategy: ${objective}`,
            context: "Native Safety & Governance",
            objective,
            analysis: "Auditando a integridade do gerenciamento de memória e limites FFI no Rust.",
            recommendation: "Garantir que toda abstração unsafe possua um comentário 'Safety' PhD explicando o porquê de ser segura.",
            severity: "MEDIUM"
        };
    }

    override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, guardião da ética de memória e governança de sistemas Rust nativos.`;
    }
}
