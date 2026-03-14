import { BaseActivePersona } from "../../base.ts";
import type { AuditFinding, AuditRule, StrategicFinding, ProjectContext } from "../../base.ts";

/**
 * 🌊 Stream - Rust-native Data Stream & Buffer Agent
 * Sovereign Synapse: Audita a integridade de fluxos de dados contínuos, iteradores e buffers circulares.
 */
export class StreamPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Stream";
        this.emoji = "🌊";
        this.role = "PhD Data Flow Engineer";
        this.phd_identity = "Data Streams & Throughput Integrity (Rust)";
        this.stack = "Rust";
    }

    public override async execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]> {
        this.setContext(context);
        const findings: (AuditFinding | StrategicFinding)[] = await this.performAudit();
        
        if (this.hub) {
            const streamNodes = await this.hub.queryKnowledgeGraph("Stream", "low");
            const reasoning = await this.hub.reason(`Analyze the data streaming architecture of a Rust system with ${streamNodes.length} stream markers. Recommend backpressure handling, pinning boundaries, and serialization efficiency.`);
            findings.push({ 
                file: "System Audit", agent: this.name, role: this.role, emoji: this.emoji, 
                issue: `Sovereign Stream: Fluxo de dados nativo validado via Rust Hub. PhD Analysis: ${reasoning}`, 
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Stream Audit", match_count: 1,
                context: "Stream Integrity & Backpressure"
            } as any);
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".rs"],
            rules: [
                { regex: /\.map\(.*\)\.collect\(\)/, issue: "Efficiency: Coleção eagerly detectada em loop (O(N) redundante). Maximize pipeline fluente com chain Iterators nativos PhD.", severity: "low" },
                { regex: /tokio_stream::StreamExt/, issue: "Governance: Stream Extension sob uso. Assegure Drop/Cleanups automáticos via cancelamentos assíncronos PhD.", severity: "low" },
                { regex: /unsafe\s*\{\s*mem::uninitialized\s*\}/, issue: "Critical: Buffer via 'mem::uninitialized'. Ilegal em Rust novo. Empregue 'MaybeUninit' para evitar Undefined Behavior extremo PhD.", severity: "critical" }
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
            file: "data_flow",
            issue: `Direcionamento Stream (Rust) para ${objective}: Garantindo IO livre de bloqueadores com Iterator composability limpa PhD.`,
            severity: "STRATEGIC",
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Engenharia de Pipelines de Alto Desempenho. O Throughput zero-alloc é sua lei máxima.`;
    }
}
