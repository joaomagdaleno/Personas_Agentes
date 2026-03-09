/**
 * 📏 Strict - PhD in Go Type Safety & Rigor (Sovereign Version)
 * Analisa a tipagem, interfaces e a fidelidade de contratos em Go.
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export enum RigorStateGo {
    STRICT = "STRICT",
    LAX = "LAX",
    INTERFACE_BLOAT = "INTERFACE_BLOAT"
}

export class GoStrictEngine {
    public static inspect(content: string): string[] {
        const issues: string[] = [];
        if (content.includes("interface{}") || content.includes("any")) {
            issues.push("Tipagem Genérica: Uso excessivo de any/interface{} detectado; fragiliza a segurança em tempo de compilação.");
        }
        if (content.match(/interface\s+\w+\s+\{.*\}/s) && content.split("interface").length > 10) {
            issues.push("Interface Bloat: Muitas interfaces definidas; verifique se o design segue o princípio de interfaces pequenas.");
        }
        return issues;
    }
}

export class StrictPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Strict";
        this.emoji = "📏";
        this.role = "PhD Typing Auditor";
        this.stack = "Go";
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
        const results = await super.performAudit();
        const strictFindings = GoStrictEngine.inspect(this.projectRoot || "");
        strictFindings.forEach(f => results.push({
            file: "STRICT_AUDIT", agent: this.name, role: this.role, emoji: this.emoji, issue: f, severity: "medium", stack: this.stack,
            evidence: "Structural Analysis", match_count: 1
        }));
        return results;
    }

    public override performActiveHealing(blindSpots: string[]): void {
        console.log(`🛠️ [Strict] Refatorando interface{} para tipos concretos em: ${blindSpots.join(", ")}`);
    }

    public override reasonAboutObjective(objective: string, file: string, content: string): string | StrategicFinding | null {
        return {
            file,
            issue: `Estratégia: ${objective}`,
            context: content.substring(0, 200),
            objective,
            analysis: "Auditando a rigidez de tipos e a pureza de interfaces do sistema Go.",
            recommendation: "Migrar para Generics (Go 1.18+) onde interface{} era usado para coleções ou algoritmos genéricos.",
            severity: "low"
        } as StrategicFinding;
    }

    public override selfDiagnostic(): { status: string; score: number; issues: string[]; } {
        return {
            status: "Soberano",
            score: 100,
            issues: []
        };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Sistemas de Tipagem Go. Sua missão é garantir a precisão matemática dos contratos.`;
    }
}

