import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding } from "../../base.ts";


/**
 * 📡 Dr. Echo — PhD in Kotlin Diagnostic Tracing & Observability
 * Especialista em rastreabilidade, logging estruturado e observabilidade Android/Kotlin.
 */
export class EchoPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot as any);
        this.name = "Echo";
        this.emoji = "📡";
        this.role = "PhD Diagnostic Tracer";
        this.phd_identity = "Logging & Diagnostic Tracing (Kotlin)";
        this.stack = "Kotlin";
    }

    public override async execute(context: any): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();

        if (this.hub) {
            const logNodes = await this.hub.queryKnowledgeGraph("println", "high");
            const reasoning = await this.hub.reason(`Analyze the diagnostic tracing maturity of a Kotlin system with ${logNodes.length} unstructured logging points. Recommend migration to structured logging.`);

            findings.push({
                file: "Diagnostic Tracing", agent: this.name, role: this.role, emoji: this.emoji,
                issue: `Sovereign Echo: Rastreabilidade Kotlin validada via Rust Hub. PhD Analysis: ${reasoning}`,
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Logging Audit", match_count: 1
            } as any);
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.kt', '.kts'],
            rules: [
                { regex: /println\(/, issue: 'Cegueira Operacional: println() sem logger estruturado Kotlin.', severity: 'high' },
                { regex: /Log\.[deiw]\(/, issue: 'Debug em Produção: Android Log.* vazando para runtime.', severity: 'medium' },
                { regex: /catch\s*\(\w+:\s*Exception\)\s*\{\s*\}/, issue: 'Cegueira Forense: Bloco catch vazio detectado.', severity: 'critical' },
                { regex: /Timber\./, issue: 'Timber Usage: Verifique se Timber está configurado corretamente para produção.', severity: 'low' },
            ]
        };
    }

    override reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        const target = /println\(/;
        const ignore = /Timber/;
        if (target["test"](content) && !ignore["test"](content)) {
            return {
                file, severity: "HIGH",
                issue: `Cegueira Operacional: O objetivo '${objective}' exige diagnóstico. Em '${file}', o uso de println impede a rastreabilidade da 'Orquestração de Inteligência Artificial'.`,
                context: "println usages detected"
            };
        }
        return {
            file, severity: "INFO",
            issue: `PhD Echo: Analisando rastreabilidade para ${objective}. Focando em logging estruturado e eliminação de ruído.`,
            context: "analyzing traceability"
        };
    }

    override selfDiagnostic(): any {
        return {
            status: "Soberano",
            score: 100,
            details: "Monitor de rastreabilidade Kotlin operando com consciência PhD."
        };
    }

    override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em telemetria e rastro digital Kotlin.`;
    }
}
