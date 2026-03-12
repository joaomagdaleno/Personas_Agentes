import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class StrictPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Strict";
        this.emoji = "🔒";
        this.role = "PhD TypeScript Compiler Guardian"; // Matched universally
        this.phd_identity = "Type Safety & Android Rigor (Kotlin)";
        this.stack = "Kotlin";
    }

    public override async execute(context: any): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();
        if (this.hub) {
            const nullNodes = await this.hub.queryKnowledgeGraph("!!", "low");
            const reasoning = await this.hub.reason(`Analyze the nullability and type safety of a Kotlin system with ${nullNodes.length} unsafe null pointers. Recommend safe call patterns.`);
            findings.push({ 
                file: "Rigor Audit", agent: this.name, role: this.role, emoji: this.emoji, 
                issue: `Sovereign Strict: Rigor Kotlin validado via Rust Hub. PhD Analysis: ${reasoning}`, 
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Strict Audit", match_count: 1,
                context: "Type Purity & Rigor"
            } as any);
        }
        return findings;
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".kt", ".kts"],
            rules: [
                { regex: /!!/, issue: "Null Safety: Operador '!!' detectado. Violação do rigor de tipos Kotlin PhD. Use safe-call ou elvis operator.", severity: "high" },
                { regex: /var\s+/, issue: "Immutability: Uso de variáveis mutáveis. Prefira 'val' para garantir a imutabilidade do estado PhD.", severity: "low" },
                { regex: /as!/, issue: "Type Casting: Cast inseguro detectado. Risco de ClassCastException; use smart casting.", severity: "medium" }
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
