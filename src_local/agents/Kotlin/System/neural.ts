/**
 * 🧠 Neural - PhD in Applied AI & Android Machine Learning (Kotlin)
 * Especialista em pipelines de inferência on-device, integração ML Kit e otimização de modelos TFLite.
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class NeuralPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Neural";
        this.emoji = "🧠";
        this.role = "PhD AI Architect";
        this.phd_identity = "On-Device Neural Inference (Kotlin)";
        this.stack = "Kotlin";
    }

    public override async execute(context: any): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();
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

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".kt", ".kts"],
            rules: [
                { regex: /mlkit/, issue: "Risco de Dependência: Uso de ML Kit detectado. Verifique dependência de serviços proprietários.", severity: "low" },
                { regex: /Interpreter\.fromBuffer/, issue: "Carga Crítica: Inferência TFLite em execução direta. Verifique throttling e impacto térmico.", severity: "high" }
            ]
        };
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const results = await this.findPatterns(this.getAuditRules().extensions, this.getAuditRules().rules);
        return results;
    }

    public override reasonAboutObjective(objective: string, file: string, content: string): StrategicFinding | null {
        if (content.includes("mlkit")) {
            return {
                file,
                issue: `Fragilidade Cognitiva: O objetivo '${objective}' exige autonomia. Em '${file}', a dependência do ML Kit vincula o sistema a serviços externos.`,
                severity: "STRATEGIC",
                context: this.name
            };
        }
        return {
            file,
            issue: `PhD AI: Analisando modelos de inteligência JVM para ${objective}.`,
            severity: "STRATEGIC",
            context: this.name
        };
    }

    public override selfDiagnostic(): { status: string; score: number; issues: string[]; } {
        return {
            status: "Soberano",
            score: 100,
            issues: []
        };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Inteligência Aplicada e Mestre em Machine Learning Kotlin.`;
    }
}

