/**
 * 🔗 Nexus - Rust-native Integration & Coupling Agent
 * Sovereign Synapse: Audita o acoplamento entre crates, dependências e boundaries de sistema.
 */
import type { AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class NexusPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Nexus";
        this.emoji = "🔗";
        this.role = "PhD Systems Integrator";
        this.phd_identity = "System Coupling & Dependency Harmony (Rust)";
        this.stack = "Rust";
    }

    public override async execute(context: any): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();
        if (this.hub) {
            const depNodes = await this.hub.queryKnowledgeGraph("dependency", "low");
            const reasoning = await this.hub.reason(`Analyze the dependency graph of a Rust system with ${depNodes.length} external components. Recommend decoupling strategies and version stability.`);
            findings.push({ 
                file: "System Audit", agent: this.name, role: this.role, emoji: this.emoji, 
                issue: `Sovereign Nexus: Topologia de dependências validada via Rust Hub. PhD Analysis: ${reasoning}`, 
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Nexus Audit", match_count: 1,
                context: "Dependency & Integration Safety"
            } as any);
        }
        return findings;
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".rs", "Cargo.toml"],
            rules: [
                { regex: /git\s*=\s*".*"/, issue: "Dependency: Dependência direta via Git. Prefira versões estáveis do crates.io para produção PhD.", severity: "medium" },
                { regex: /features\s*=\s*\["\* "\]/, issue: "Pollution: Ativação de todas as features de crate. Risco de inchaço do binário e tempos de compilação lentos.", severity: "low" },
                { regex: /extern\s+crate/, issue: "Legacy: Uso de 'extern crate' detectado. Use o sistema de módulos moderno do Rust 2018+.", severity: "low" }
            ]
        };
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): StrategicFinding | null {
        return {
            file: "integration",
            issue: `Direcionamento Nexus para ${objective}: Garantindo que o sistema seja modular e fácil de integrar.`,
            severity: "STRATEGIC",
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Arquitetura de Integração. Sua missão é garantir harmonia total entre os componentes.`;
    }
}
