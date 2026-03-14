import { BaseActivePersona } from "../../base.ts";
import type { AuditFinding, AuditRule, StrategicFinding, ProjectContext } from "../../base.ts";

/**
 * 🔗 Nexus - Rust-native Integration & Coupling Agent
 * Sovereign Synapse: Audita o acoplamento entre crates, dependências e boundaries de sistema.
 */
export class NexusPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Nexus";
        this.emoji = "🔗";
        this.role = "PhD Systems Integrator";
        this.phd_identity = "System Coupling & Dependency Harmony (Rust)";
        this.stack = "Rust";
    }

    public override async execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]> {
        this.setContext(context);
        const findings: (AuditFinding | StrategicFinding)[] = await this.performAudit();
        
        if (this.hub) {
            const depNodes = await this.hub.queryKnowledgeGraph("dependency", "low");
            const reasoning = await this.hub.reason(`Analyze the dependency graph of a Rust system with ${depNodes.length} external components. Recommend decoupling strategies (Traits) and semantic version stability.`);
            findings.push({ 
                file: "System Audit", agent: this.name, role: this.role, emoji: this.emoji, 
                issue: `Sovereign Nexus: Topologia de dependências (Cargo) validada via Rust Hub. PhD Analysis: ${reasoning}`, 
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Nexus Audit", match_count: 1,
                context: "Dependency & Integration Safety"
            } as any);
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".rs", "Cargo.toml"],
            rules: [
                { regex: /git\s*=\s*".*"/, issue: "Dependency: Dependência via Git instável. Prefira resoluções lockadas do crates.io para CI/CD imutável PhD.", severity: "medium" },
                { regex: /features\s*=\s*\["\* "\]/, issue: "Pollution: Ativação massiva de features de crate wildcard. Risco de inchaço do binário e compilações arrastadas PhD.", severity: "low" },
                { regex: /extern\s+crate/, issue: "Legacy: Estilo obsoleto 'extern crate' detectado. Adote a padronização do Rust Edition 2021+ PhD.", severity: "low" }
            ]
        };
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const rules = this.getAuditRules();
        const results = await this.findPatterns(rules.extensions, rules.rules);
        this.endMetrics(results.length);
        return results;
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string | Promise<string | null>): StrategicFinding | null {
        return {
            file: "integration",
            issue: `Direcionamento Nexus (Rust) para ${objective}: Garantindo que as fronteiras (Boundaries) de Crates sejam coesas via Traits puros PhD.`,
            severity: "STRATEGIC",
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Arquitetura de Integração Cargo Workspace. Sua missão é dominar a topologia de crates.`;
    }
}
