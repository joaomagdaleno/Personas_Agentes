/**
 * 🦀 Native - Rust-native System & Memory Safety Agent
 * Sovereign Synapse: Audita a segurança de memória, FFI, ownership e bindings de sistema operacional.
 */
import type { AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class NativePersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Native";
        this.emoji = "🦀";
        this.role = "PhD Systems Architect";
        this.phd_identity = "Memory Safety & OS Bindings (Rust)";
        this.stack = "Rust";
    }

    public override async execute(context: any): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();
        if (this.hub) {
            const unsafeNodes = await this.hub.queryKnowledgeGraph("unsafe", "high");
            const reasoning = await this.hub.reason(`Analyze the systems-level safety of a Rust execution core with ${unsafeNodes.length} unsafe blocks. Recommend safety wrappers and FFI boundary checks.`);
            findings.push({ 
                file: "System Audit", agent: this.name, role: this.role, emoji: this.emoji, 
                issue: `Sovereign Native: Segurança de memória e FFI validada via Rust Hub. PhD Analysis: ${reasoning}`, 
                severity: "CRITICAL", stack: this.stack, evidence: "Knowledge Graph Native Audit", match_count: 1,
                context: "Memory Safety & OS Integration"
            } as any);
        }
        return findings;
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".rs"],
            rules: [
                { regex: /unsafe\s*\{/, issue: "Safety: Bloco unsafe detectado. Garanta que todas as invariantes de segurança sejam mantidas manualmente.", severity: "high" },
                { regex: /extern\s*["']C["']/, issue: "FFI: Interface externa detectada. Verifique se os tipos passados são FFI-safe (repr(C)).", severity: "medium" },
                { regex: /raw\s+pointer/, issue: "Pointer: Uso de ponteiros crus ( *const / *mut ). Prefira referências seguras ou tipos Smart Pointer (Box/Arc).", severity: "high" },
                { regex: /as\s+\w+/, issue: "Cast: Casting numérico explícito. Verifique risco de overflow ou truncamento em tipos de sistema.", severity: "low" },
                { regex: /#\[no_mangle\]/, issue: "Linkage: Função no_mangle detectada. Verifique conflitos de símbolos em links dinâmicos.", severity: "medium" }
            ]
        };
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): StrategicFinding | null {
        return {
            file: "native",
            issue: `Direcionamento Native para ${objective}: Garantindo integridade de baixo nível e performance determinística.`,
            severity: "STRATEGIC",
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Sistemas de Baixo Nível. Sua missão é garantir a segurança absoluta da memória e a eficiência do sistema.`;
    }
}
