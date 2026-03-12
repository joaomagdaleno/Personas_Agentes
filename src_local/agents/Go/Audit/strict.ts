import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class StrictPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Strict";
        this.emoji = "🔒";
        this.role = "PhD TypeScript Compiler Guardian"; // Matched universally
        this.phd_identity = "Compiler Rigor & Type Purity (Go)";
        this.stack = "Go";
    }

    public override async execute(context: any): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();
        if (this.hub) {
            const typeNodes = await this.hub.queryKnowledgeGraph("interface{}", "low");
            const reasoning = await this.hub.reason(`Analyze the type system and interface contracts of a Go system with ${typeNodes.length} generic points. Recommend concrete typing and generic constraints for safer IPC.`);
            findings.push({ 
                file: "Rigor Audit", agent: this.name, role: this.role, emoji: this.emoji, 
                issue: `Sovereign Strict: Rigor Go validado via Rust Hub. PhD Analysis: ${reasoning}`, 
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Strict Audit", match_count: 1,
                context: "Type Purity & Rigor"
            } as any);
        }
        return findings;
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".go"],
            rules: [
                { regex: /type\s+.*\s+struct\s*\{\s*\}/, issue: "Empty Struct: Struct sem campos detectada; considere se é necessária ou se um sinal de canal basta.", severity: "low" },
                { regex: /func\s+.*\(.*interface\{\}/, issue: "Parameter Laxity: Uso de interface{} como argumento de função; prefira generics ou interfaces específicas.", severity: "high" },
                { regex: /type\s+.*\s+alias/, issue: "Type Alias: Verifique se o alias é necessário ou se introduz confusão semântica.", severity: "low" },
                { regex: /const\s+.*\s+=\s+iota/, issue: "Iota Usage: Verifique se o iota possui um valor zero inválido para evitar estados não inicializados.", severity: "medium" },
                { regex: /ptr\s+:=\s+&/, issue: "Pointer Inflation: Verifique se o uso de ponteiros é necessário ou se causa pressão indevida no GC via escape analysis.", severity: "medium" },
                { regex: /\w+:.*interface\{\}/, issue: "Map Generic: Mapas com valor interface{} impedem otimizações de tipagem estática.", severity: "high" }
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

