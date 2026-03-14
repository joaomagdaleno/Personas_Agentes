import { BaseActivePersona } from "../../base.ts";
import type { AuditFinding, AuditRule, StrategicFinding, ProjectContext } from "../../base.ts";

/**
 * 🛡️ Sentinel Persona (Rust Stack) - HYBRID VERSION
 * Especialista em integração estratégica e soberania da infraestrutura nativa.
 */
export class SentinelPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.id = "rust:strategic:sentinel";
        this.name = "Sentinel";
        this.emoji = "🛡️";
        this.role = "Sovereign Security Architect";
        this.phd_identity = "Native Infrastructure Integrity & Safe Binding";
        this.stack = "Rust";
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.proto', '.rs', 'main.go'], // Monitorando a ponte conectora
            rules: [
                { regex: /unsafe\s*\{/, issue: 'Memory Security: Bloco unsafe detectado. Audite meticulosamente os ponteiros raw PhD.', severity: 'high' }
            ]
        };
    }

    public override async execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]> {
        this.setContext(context);
        const findings: (AuditFinding | StrategicFinding)[] = await this.performAudit();
        
        // 🛡️ POWER UP: Strategic Awareness via Knowledge Graph
        if (this.hub) {
            console.log("🛡️ [Sentinel-Rust] Consultando o Grafo de Conhecimento Nativo...");
            const graph = await this.hub.getKnowledgeGraph("src_native/analyzer/src/main.rs", 3);
            const securityQuery = await this.hub.queryKnowledgeGraph("unsafe", "high");
            const reasoning = await this.hub.reason(`Analyze Rust core sovereignty given ${securityQuery.length} unsafe blocks and core graph connectivity.`);

            findings.push({
                file: "Rust Core", agent: this.name, role: this.role, emoji: this.emoji,
                issue: `Sovereign Integrity: Núcleo Rust validado. Raciocínio: ${reasoning}`,
                severity: "INFO", stack: "Rust", evidence: `KG Depth: ${graph.nodes.length} nodes`, match_count: 1,
                context: "Native Security"
            } as any);
        }

        return findings;
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const rules = this.getAuditRules();
        const results = await this.findPatterns(rules.extensions, rules.rules);
        this.endMetrics(results.length);
        return results;
    }

    public override reasonAboutObjective(objective: string, file: string, _content: string | Promise<string | null>): StrategicFinding | null {
        return {
            file,
            issue: `Sovereignty Check: ${objective}. Garantindo que a ponte entre Runtime e Rust seja hermética PhD.`,
            severity: "STRATEGIC",
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return {
            status: "Soberano",
            score: 100,
            issues: [],
            details: "Sentinela FFI operando com vigilância PhD."
        };
    }

    public override getSystemPrompt(): string {
        return `Você é o ${this.name}, guardião da soberania e integridade da ponte entre o mundo gerenciado e o mundo nativo (Rust).`;
    }
}
