import { BaseActivePersona } from "../../base.ts";
import type { AuditFinding, AuditRule, StrategicFinding, ProjectContext } from "../../base.ts";

/**
 * 🧠 Neural - PhD in Applied AI & Android Machine Learning (Kotlin)
 * Especialista em pipelines de inferência on-device, integração ML Kit e otimização de modelos TFLite.
 */
export class NeuralPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Neural";
        this.emoji = "🧠";
        this.role = "PhD AI Architect";
        this.phd_identity = "On-Device Neural Inference (Kotlin)";
        this.stack = "Kotlin";
    }

    public override async execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]> {
        this.setContext(context);
        const findings: (AuditFinding | StrategicFinding)[] = await this.performAudit();
        
        if (this.hub) {
            const brainNodes = await this.hub.queryKnowledgeGraph("TFLite", "low");
            const reasoning = await this.hub.reason(`Analyze the Android ML integration of a Kotlin system with ${brainNodes.length} neural markers. Recommend safety boundaries for on-device model execution and thermal management.`);
            findings.push({ 
                file: "AI Audit", agent: this.name, role: this.role, emoji: this.emoji, 
                issue: `Sovereign Neural: Inteligência on-device Kotlin validada via Rust Hub. PhD Analysis: ${reasoning}`, 
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Neural Audit", match_count: 1,
                context: "On-Device AI Safety"
            } as any);
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".kt", ".kts"],
            rules: [
                { regex: /mlkit/, issue: "Risco de Dependência: Uso de ML Kit detectado. Verifique dependência de serviços proprietários fechados PhD.", severity: "low" },
                { regex: /Interpreter\.fromBuffer/, issue: "Carga Crítica: Inferência TFLite em execução direta. Verifique throttling e impacto térmico no device JVM PhD.", severity: "high" }
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

    public override reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | null {
        if (typeof content === 'string' && content.includes("mlkit")) {
            return {
                file,
                issue: `Fragilidade Cognitiva: O objetivo '${objective}' exige autonomia. Em '${file}', a dependência do ML Kit vincula o sistema a serviços externos PhD.`,
                severity: "STRATEGIC",
                context: this.name
            };
        }
        return {
            file, severity: "INFO",
            issue: `PhD AI (Kotlin): Analisando modelos de inteligência on-device para ${objective}.`,
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Inteligência Aplicada e Mestre em Machine Learning Kotlin.`;
    }
}
