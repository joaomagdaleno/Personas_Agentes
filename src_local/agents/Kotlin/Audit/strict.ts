import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding } from "../../base.ts";

/**
 * 🔒 Strict - PhD in Compiler Rigor & Type Purity (Kotlin)
 */
export class StrictPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Strict";
        this.emoji = "🔒";
        this.role = "PhD Memory Safety Guardian";
        this.phd_identity = "Type Safety & Android Rigor (Kotlin)";
        this.stack = "Kotlin";
    }

    public override async execute(context: any): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();
        return findings;
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".kt", ".kts"],
            rules: [
                { regex: /!!/, issue: "Fragilidade PhD: Operador '!!' detectado. Violência contra o sistema de tipos de Kotlin. Use ?. ou !! com cautela extrema.", severity: "high" },
                { regex: /:\s*Any\??/, issue: "Laxidade: Uso de 'Any' ou 'Any?' detectado. Utilize tipos concretos ou generics rigorosos PhD.", severity: "high" },
                { regex: /\w+ as \w+/, issue: "Risco de Cast: Cast inseguro detectado. Prefira 'as?' para evitar ClassCastException.", severity: "medium" }
            ]
        };
    }

    public override async performAudit(): Promise<any[]> {
        this.startMetrics();
        const rules = this.getAuditRules();
        const results = await this.findPatterns(rules.extensions, rules.rules);
        this.endMetrics(results.length);
        return results;
    }

    public override reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | null {
        if (typeof content !== 'string') return null;
        if (content.includes('!!')) {
            return {
                file, severity: "HIGH",
                issue: `Risco de NPE: O objetivo '${objective}' exige segurança Kotlin. Em '${file}', o uso de '!!' viola a 'Orquestração de Inteligência Artificial'.`,
                context: "non-null assertions detected"
            };
        }
        return {
            file, severity: "INFO",
            issue: `PhD Strict (Kotlin): Analisando rigor para ${objective}. Focando em Null-Safety e Purity.`,
            context: "analyzing strictness"
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, details: "Módulo Kotlin em conformidade rigorosa PhD." };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. Strict, PhD em arquiteturas Android e Backend seguras em Kotlin. Sua missão é garantir Null-Safety absoluto.`;
    }
}
