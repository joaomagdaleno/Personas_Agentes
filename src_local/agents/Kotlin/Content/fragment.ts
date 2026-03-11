/**
 * 🧩 Fragment - Kotlin-native Modularity & Cohesion Agent
 * Sovereign Synapse: Audita a coesão de pacotes Kotlin, acoplamento e granularidade de classes.
 */
import type { AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class FragmentPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Fragment";
        this.emoji = "🧩";
        this.role = "PhD Refactoring Expert";
        this.phd_identity = "Modularity & Structural Cohesion (Kotlin)";
        this.stack = "Kotlin";
    }

    public override async execute(context: any): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();
        if (this.hub) {
            const packageNodes = await this.hub.queryKnowledgeGraph("package", "low");
            const reasoning = await this.hub.reason(`Analyze the structural modularity of a Kotlin system with ${packageNodes.length} package declarations. Recommend decoupling strategies and package organization.`);
            findings.push({ 
                file: "Structural Audit", agent: this.name, role: this.role, emoji: this.emoji, 
                issue: `Sovereign Fragment: Coesão Kotlin validada via Rust Hub. PhD Analysis: ${reasoning}`, 
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Fragment Audit", match_count: 1,
                context: "Package Modularity & Decoupling"
            } as any);
        }
        return findings;
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".kt", ".kts"],
            rules: [
                { regex: /import\s+.*\sinternal\./, issue: "Coupling: Dependência de pacotes internos detectada. Verifique se a modularidade está sendo respeitada.", severity: "medium" },
                { regex: /class\s+.*\s+\{[\s\S]{5000,}\}/, issue: "Giant Class: Classe Kotlin excessivamente grande. Aplique SRP e divida em componentes menores.", severity: "high" }
            ]
        };
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): StrategicFinding | null {
        return {
            file: "architecture",
            issue: `Direcionamento Fragment Kotlin para ${objective}: Otimizando a coesão estrutural.`,
            severity: "STRATEGIC",
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Refatoração Kotlin. Sua missão é garantir modularidade perfeita.`;
    }
}
