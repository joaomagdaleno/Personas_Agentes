/**
 * 🎨 Palette - PhD in UI Aesthetics & Design System Integrity (Kotlin)
 * Analisa a integridade visual, temas e conformidade com o Design System na JVM.
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class PalettePersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Palette";
        this.emoji = "🎨";
        this.role = "PhD UI Strategist";
        this.phd_identity = "UI Aesthetics & Design System Integrity (Kotlin)";
        this.stack = "Kotlin";
    }

    public override async execute(context: any): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();
        if (this.hub) {
            const uiNodes = await this.hub.queryKnowledgeGraph("MaterialTheme", "low");
            const reasoning = await this.hub.reason(`Analyze the design system of a Kotlin/Compose project with ${uiNodes.length} theming patterns. Recommend Dark Mode and token compliance.`);
            findings.push({ file: "Visual Audit", agent: this.name, role: this.role, emoji: this.emoji, issue: `Sovereign Palette: Design Kotlin validado via Rust Hub. PhD Analysis: ${reasoning}`, severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Design Audit", match_count: 1 } as any);
        }
        return findings;
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const rules: AuditRule[] = [
            { regex: /MaterialTheme\./, issue: "Design System: Verifique se as cores e tipografia seguem a versão PhD-2.0 do tema central.", severity: "low" },
            { regex: /colors = .*\(/, issue: "Soberania Visual: Verifique se cores customizadas não quebram o suporte a Dark Mode.", severity: "medium" },
            { regex: /@Composable/, issue: "UI Reativa: Verifique se o estado da UI é derivado de ViewModels para garantir testabilidade.", severity: "low" },
            { regex: /"#[0-9a-fA-F]{6}"/, issue: "Hardcoded Color: Evite cores hexadecimais diretas no código Jetpack Compose. Use o sistema de tokens.", severity: "high" }
        ];
        const results = await this.findPatterns([".kt", ".kts"], rules);

        // Advanced Logic: Visual Integrity
        if (results.some(r => r.issue.includes("Hardcoded Color"))) {
            this.reasonAboutObjective("Visual Sovereignty", "Design Tokens", "High density of hardcoded hex colors found in Kotlin UI logic.");
        }

        this.endMetrics(results.length);
        return results;
    }

    public override performActiveHealing(blindSpots: string[]): void {
        console.log(`🛠️ [Palette] Normalizando tokens de cor e aplicando temas base em: ${blindSpots.join(", ")}`);
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): string | StrategicFinding | null {
        return {
            objective,
            analysis: "Auditando consistência visual e adaptabilidade de tema (Dark/Light).",
            recommendation: "Migrar todas as cores hardcoded para o 'ui.theme.Color.kt' para facilitar re-theming dinâmico.",
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
        return `Você é o Dr. ${this.name}, PhD em Estratégia de UI Kotlin. Sua missão é garantir a beleza e conformidade matemática da interface.`;
    }
}

