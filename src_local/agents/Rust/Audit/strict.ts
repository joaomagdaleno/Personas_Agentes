import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding } from "../../base.ts";

/**
 * 🔒 Strict - PhD in Compiler Rigor & Type Purity (Rust)
 */
export class StrictPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Strict";
        this.emoji = "🔒";
        this.role = "PhD Memory Safety Guardian";
        this.phd_identity = "Type Checking & Borrow Checker Rigor (Rust)";
        this.stack = "Rust";
    }

    public override async execute(context: any): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();
        return findings;
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".rs"],
            rules: [
                { regex: /\.unwrap\(\)/, issue: "Risco de Pânico: unwrap() detectado. Use match ou if let para segurança PhD.", severity: "high" },
                { regex: /\.expect\(/, issue: "Fragilidade: expect() detectado. Prefira tratamento de erro idiomático.", severity: "medium" },
                { regex: /\bunsafe\s*\{/, issue: "Violência: Bloco unsafe detectado. Justifique cada byte violado PhD.", severity: "critical" }
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
        if (content.includes('.unwrap()') || content.includes('.expect(')) {
            return {
                file, severity: "HIGH",
                issue: `O objetivo '${objective}' exige robustez Rust. Em '${file}', o uso de panic-triggers (unwrap/expect) viola a 'Orquestração de Inteligência Artificial'.`,
                context: "panic triggers detected"
            };
        }
        return {
            file, severity: "INFO",
            issue: `PhD Strict (Rust): Analisando rigor para ${objective}. Focando em segurança de memória e ausência de unsafe.`,
            context: "analyzing strictness"
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, details: "Célula Rust operando em conformidade PhD." };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. Strict, PhD em sistemas de missão crítica em Rust. Sua missão é erradicar pânicos e blocos unsafe sem justificativa.`;
    }
}
