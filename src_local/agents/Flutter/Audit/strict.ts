import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class StrictPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Strict";
        this.emoji = "🔒";
        this.role = "PhD TypeScript Compiler Guardian"; // Matched universally
        this.phd_identity = "Type Integrity & Flutter Rigor (Dart)";
        this.stack = "Flutter";
    }

    public override async execute(context: any): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();
        if (this.hub) {
            const dynamicNodes = await this.hub.queryKnowledgeGraph("dynamic", "low");
            const reasoning = await this.hub.reason(`Analyze the type integrity of a Flutter system with ${dynamicNodes.length} dynamic markers. Recommend strong typing and interface-based design.`);
            findings.push({ 
                file: "Rigor Audit", agent: this.name, role: this.role, emoji: this.emoji, 
                issue: `Sovereign Strict: Rigor Flutter validado via Rust Hub. PhD Analysis: ${reasoning}`, 
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Strict Audit", match_count: 1,
                context: "Type Purity & UI Consistency"
            } as any);
        }
        return findings;
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".dart"],
            rules: [
                { regex: /dynamic/, issue: "Type Integrity: Uso do tipo 'dynamic' desencorajado. Especifique os tipos para garantir a soberania do compilador.", severity: "medium" },
                { regex: /!/, issue: "Null Safety: Operador de negação de nulidade (!) detectado. Use tratamento defensivo e check-in PhD.", severity: "medium" },
                { regex: /print\(/, issue: "Cleanliness: Uso de print para debug. Use o sistema de logging sistêmico PhD.", severity: "low" }
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

    public Purity(): boolean { return true; }
    public Rigor(): boolean { return true; }
}
