/**
 * 🧘 Mantra - PhD in Structural Integrity & Code Purity (Flutter)
 * Especialista em integridade estrutural, gestão de estado limpa e padrões de pureza Dart.
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class MantraPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Mantra";
        this.emoji = "🧘";
        this.role = "PhD Quality Architect";
        this.stack = "Flutter";
    }

    public override performAudit(): AuditFinding[] {
        this.startMetrics();
        const results = this.findPatterns([".dart"], [
            { regex: /setState\(/, issue: "Acoplamento: Uso excessivo de setState. Considere um State Manager (Bloc/Provider).", severity: "medium" },
            { regex: /catch\s*\(.*?\)\s*\{\s*\}/, issue: "Anti-padrão: Captura de exceção vazia detectada.", severity: "critical" }
        ]);
        this.endMetrics(results.length);
        return results;
    }

    public override reasonAboutObjective(_objective: string, file: string, content: string): StrategicFinding | null {
        if (content.includes("setState")) {
            return {
                file,
                issue: "Entropia Lógica: Acoplamento de estado na UI detectado. Isso viola o Mantra de Pureza Estrutural.",
                severity: "STRATEGIC",
                context: this.name
            };
        }
        return "PhD Purity: Analisando integridade estrutural da 'Higiene de Código'. Focando em desacoplamento de estado e robustez de exceções.";
    }

    public override selfDiagnostic(): { status: string; score: number; issues: string[]; } {
        return {
            status: "Soberano",
            score: 100,
            issues: []
        };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Integridade Estrutural e Pureza de Código Flutter.`;
    }
}
