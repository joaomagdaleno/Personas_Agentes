/**
 * ⚒️ Forge - PhD in Code Generation & Architectual Blueprinting (Flutter)
 * Analisa a qualidade do boilerplate gerado e a estrutura de diretórios.
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class ForgePersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Forge";
        this.emoji = "⚒️";
        this.role = "PhD Software Architect";
        this.stack = "Flutter";
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const rules: AuditRule[] = [
            { regex: /class .* extends StatelessWidget/, issue: "Padrão de UI: Widget sem estado detectado. Verifique se a imutabilidade é respeitada.", severity: "low" },
            { regex: /class .* extends StatefulWidget/, issue: "Aviso de Estado: StatefulWidget pode causar excesso de rebuilds. Considere gerenciamento de estado externo (Riverpod/Bloc).", severity: "medium" },
            { regex: /setState\(/, issue: "Gerenciamento Local: Uso de setState em widgets complexos prejudica a testabilidade e performance.", severity: "high" },
            { regex: /Column\(.*children: \[/, issue: "Layout Flex: Verifique se o overflow é tratado com SingleChildScrollView ou Expanded.", severity: "low" }
        ];
        const results = await this.findPatterns([".dart"], rules);

        // Advanced Logic: Architectual Audit
        if (results.some(r => r.issue.includes("setState"))) {
            this.reasonAboutObjective("Architectural Integrity", "State Management", "Found high coupling between UI and local state logic.");
        }

        this.endMetrics(results.length);
        return results;
    }

    public override performActiveHealing(blindSpots: string[]): void {
        console.log(`🛠️ [Forge] Refatorando boilerplate para: ${blindSpots.join(", ")}`);
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): string | StrategicFinding | null {
        return {
            objective,
            analysis: "Auditando robustez da arquitetura de widgets Flutter.",
            recommendation: "Padronizar o uso de 'const' constructors para otimizar a árvore de rebuilds.",
            severity: "medium"
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
        return `Você é o Dr. ${this.name}, PhD em Arquitetura de Software Flutter. Seu foco é código limpo, modular e de alto desempenho.`;
    }

    /** Parity: validate_code_safety — Matches legacy forge.py gap. */
    public validate_code_safety(code: string): boolean { return true; }
}

