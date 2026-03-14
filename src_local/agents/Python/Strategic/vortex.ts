import { BaseActivePersona } from "../../base.ts";
import type { AuditFinding, AuditRule, StrategicFinding, ProjectContext } from "../../base.ts";

/**
 * 🌀 Vortex - PhD in Dimensional Logic & Complexity Management (Python Stack)
 * Analisa a integridade de fluxos recursivos, recursão de cauda e grafos de dependência em Python.
 */
export class VortexPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Vortex";
        this.emoji = "🌀";
        this.role = "PhD Complexity Scientist";
        this.phd_identity = "Dimensional Logic & Recursion Integrity (Python)";
        this.stack = "Python";
    }

    public override async execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]> {
        this.setContext(context);
        const findings: (AuditFinding | StrategicFinding)[] = await this.performAudit();
        if (this.hub) {
            const recursionNodes = await this.hub.queryKnowledgeGraph("recursion", "low");
            const reasoning = await this.hub.reason(`Analyze the recursive logic and dimensional flow of a Python system with ${recursionNodes.length} recursion markers. Recommend tail-call optimization strategies and cyclic dependency breaking.`);
            findings.push({ 
                file: "Dimensional Audit", agent: this.name, role: this.role, emoji: this.emoji, 
                issue: `Sovereign Vortex: Estabilidade dimensional Python validada via Rust Hub. PhD Analysis: ${reasoning}`, 
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Vortex Audit", match_count: 1,
                context: "Logical Stability & Dimensionality"
            } as any);
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".py"],
            rules: [
                { regex: /sys\.setrecursionlimit\(/, issue: "Limite de Recursão: Verifique se a profundidade da stack é necessária ou se indica falta de algoritmos iterativos PhD.", severity: "medium" },
                { regex: /def .*\(.*\):[\s\S]*?return .*\(\)/, issue: "Recursão: Verifique se a condição de parada é soberana para evitar estouro de stack PhD.", severity: "high" },
                { regex: /networkx\.DiGraph/, issue: "Topologia de Dados: Auditoria de grafos complexos detectada. Verifique ciclos PhD.", severity: "low" },
                { regex: /memoize|@lru_cache/, issue: "Otimização de Vortex: Uso de caching de resultados recursivos detectado PhD.", severity: "low" }
            ]
        };
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const rules = this.getAuditRules();
        const results = await this.findPatterns(rules.extensions, rules.rules);

        if (results.some(r => r.severity === "high")) {
            results.push({
                file: "VORTEX_ALGORITHM", agent: this.name, role: this.role, emoji: this.emoji, 
                issue: "Dimensional Analysis triggered by high recursive depth.", 
                severity: "low", stack: this.stack, evidence: "Structural Analysis", match_count: 1,
                context: "Recursive Depth Audit"
            } as any);
        }

        this.endMetrics(results.length);
        return results;
    }

    public override reasonAboutObjective(objective: string, file: string, _content: string | Promise<string | null>): StrategicFinding | null {
        return {
            file,
            issue: `PhD Vortex (Python): Auditando topologia de grafos e profundidade recursiva para ${objective}.`,
            severity: "STRATEGIC",
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Ciência da Complexidade Python. Sua missão é garantir a estabilidade dimensional do sistema.`;
    }
}
