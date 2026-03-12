import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class StrictPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Strict";
        this.emoji = "🔒";
        this.role = "PhD TypeScript Compiler Guardian"; // Matched universally
        this.phd_identity = "Type Hints & Logic Rigor (Python)";
        this.stack = "Python";
    }

    public override async execute(context: any): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();
        if (this.hub) {
            const hintNodes = await this.hub.queryKnowledgeGraph("type hint", "low");
            const reasoning = await this.hub.reason(`Analyze the type hinting and logic safety of a Python system with ${hintNodes.length} hint markers. Recommend static analysis patterns and runtime validation.`);
            findings.push({ 
                file: "Rigor Audit", agent: this.name, role: this.role, emoji: this.emoji, 
                issue: `Sovereign Strict: Rigor Python validado via Rust Hub. PhD Analysis: ${reasoning}`, 
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Strict Audit", match_count: 1,
                context: "Type Safety & Logic Rigor"
            } as any);
        }
        return findings;
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".py"],
            rules: [
                { regex: /# noqa/, issue: "Suppress: Supressão de lint detectada (noqa). Resolva a violação estrutural PhD em vez de ocultá-la.", severity: "high" },
                { regex: /type: ignore/, issue: "Static Analysis: Type ignore detectado. Violação do rigor de análise estática.", severity: "medium" },
                { regex: /def .*\(\):/, issue: "Type Hints: Função sem anotação de tipos detectada. Use Type Hints para documentar a assinatura PhD.", severity: "low" }
            ]
        };
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        this["startMetrics"]();
        const results = await this["findPatterns"](this.getAuditRules().extensions, this.getAuditRules().rules);
        return results;
    }

    public override reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | null {
        if (typeof content !== 'string') return null;
        return { file, severity: "INFO", issue: `PhD Strictness: Analisando ${objective}.`, context: "analyzing strictness" } as any;
    }

    public override selfDiagnostic(): any { 
        return { status: "Soberano", score: 100, details: "OK" }; 
    }
    
    public override getSystemPrompt(): string { 
        return `Você é o Dr. ${this.name}, guardião TS.`; 
    }
}
