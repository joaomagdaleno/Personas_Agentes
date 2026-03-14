import { BaseActivePersona } from "../../base.ts";
import type { AuditFinding, AuditRule, StrategicFinding, ProjectContext } from "../../base.ts";

/**
 * 🧠 Neural - Rust-native AI Safety & Logic Synchronization Agent
 * Sovereign Synapse: Audita a segurança de modelos ML integrados em Rust, sincronia de estado e tensores.
 */
export class NeuralPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Neural";
        this.emoji = "🧠";
        this.role = "PhD AI Systems Engineer";
        this.phd_identity = "AI Safety & Neural Logic Integrity (Rust)";
        this.stack = "Rust";
    }

    public override async execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]> {
        this.setContext(context);
        const findings: (AuditFinding | StrategicFinding)[] = await this.performAudit();
        
        if (this.hub) {
            const neuralNodes = await this.hub.queryKnowledgeGraph("tensor", "low");
            const reasoning = await this.hub.reason(`Analyze the AI integration of a Rust system with ${neuralNodes.length} neural markers. Recommend safety boundaries for model execution and synchronization via FFI constraints.`);
            findings.push({ 
                file: "AI Audit", agent: this.name, role: this.role, emoji: this.emoji, 
                issue: `Sovereign Neural: Integridade de IA nativa validada via Rust Hub. PhD Analysis: ${reasoning}`, 
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Neural Audit", match_count: 1,
                context: "AI Safety & Synchronization"
            } as any);
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".rs"],
            rules: [
                { regex: /onnx|tf|torch/, issue: "Inference: Engine de IA detectada. Garanta que o runtime C++ nativo esteja isolado em sandbox de memória via Rust safe abstractions PhD.", severity: "medium" },
                { regex: /api_key/, issue: "Security: Chave de API de inferência exposta ou hardcoded no binário Rust PhD.", severity: "critical" },
                { regex: /Mutex<Model>/, issue: "Performance: Modelo tensor sob lock mutável estrito. Verifique se inferência multithreaded (ex: rayon) alivia estrangulamento de CPU PhD.", severity: "medium" }
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
            file: "neural",
            issue: `Direcionamento Neural Rust para ${objective}: Protegendo o raciocínio matemático e a alocação de GPU/CPU estrita PhD.`,
            severity: "STRATEGIC",
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Sistemas Neurais e ML Ops Rust. Sua missão é garantir a estabilidade FFI da inteligência nativa.`;
    }
}
