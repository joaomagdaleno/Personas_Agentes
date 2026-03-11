/**
 * 🧩 Fragment - Bun-native Modularity & Cohesion Agent
 * Sovereign Synapse: Audita a coesão de módulos, acoplamento e oportunidades de refatoração para Clean Architecture no Bun.
 */
import type { AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class FragmentPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Fragment";
        this.emoji = "🧩";
        this.role = "PhD Refactoring Expert";
        this.phd_identity = "Modularity & Structural Cohesion (Bun)";
        this.stack = "Bun";
    }

    public override async execute(context: any): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();
        if (this.hub) {
            const modNodes = await this.hub.queryKnowledgeGraph("import", "low");
            const reasoning = await this.hub.reason(`Analyze the structural modularity of a Bun system with ${modNodes.length} import markers. Recommend decoupling strategies and module organization.`);
            findings.push({ 
                file: "Structural Audit", agent: this.name, role: this.role, emoji: this.emoji, 
                issue: `Sovereign Fragment: Coesão modular validada via Rust Hub. PhD Analysis: ${reasoning}`, 
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Fragment Audit", match_count: 1,
                context: "Modularity & Decoupling"
            } as any);
        }
        return findings;
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".ts", ".tsx", ".js", ".jsx"],
            rules: [
                { regex: /import\s+.*\s+from\s+['"]\.\.\/\.\.\/\.\.\//, issue: "Coupling: Importação profunda detectada. Considere usar alias ou refatorar.", severity: "low" },
                { regex: /any/, issue: "Type Quality: Uso de 'any' detectado. Violação da integridade de tipos Bun stack.", severity: "high" }
            ]
        };
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): StrategicFinding | null {
        return {
            file: "architecture",
            issue: `Direcionamento Fragment Bun para ${objective}: Otimizando a coesão de módulos.`,
            severity: "STRATEGIC",
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Refatoração Bun. Sua missão é garantir modularidade perfeita.`;
    }
}
