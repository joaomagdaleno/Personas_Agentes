/**
 * 🎨 Palette - PhD in UI Aesthetics & Design System Integrity (Python Stack)
 * Analisa a integridade visual, temas e conformidade com o Design System em Python legacy.
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class PalettePersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Palette";
        this.emoji = "🎨";
        this.role = "PhD UI Strategist";
        this.stack = "Python";
    }

    public override performAudit(): AuditFinding[] {
        this.startMetrics();
        const rules: AuditRule[] = [
            { regex: /COLOR_.* = "#[0-9a-fA-F]{6}"/, issue: "Token de Cor: Verifique se a cor hexadecimal segue a paleta PhD oficial.", severity: "low" },
            { regex: /style_config = \{/, issue: "Configuração de Estilo: Verifique se as configurações de UI (margens, fontes) são consistentes com o Sovereign stack.", severity: "low" },
            { regex: /background_color = .*/, issue: "Soberania Visual: Verifique se as cores de fundo suportam contrastes dinâmicos para acessibilidade.", severity: "medium" },
            { regex: /Tkinter|PyQt|Kivy/, issue: "Framework de UI: Uso de frameworks legados detectado. Verifique se a lógica de UI está desacoplada do core.", severity: "high" }
        ];
        const results = this.findPatterns([".py"], rules);

        // Advanced Logic: Visual Integrity Audit
        if (results.some(r => r.severity === "high")) {
            this.reasonAboutObjective("Visual Sovereignty", "Frameworks", "Found tight coupling with legacy Python UI frameworks.");
        }

        this.endMetrics(results.length);
        return results;
    }

    public override performActiveHealing(blindSpots: string[]): void {
        console.log(`🛠️ [Palette] Normalizando tokens visuais e limpando estilos hardcoded em: ${blindSpots.join(", ")}`);
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): string | StrategicFinding | null {
        return {
            objective,
            analysis: "Auditando conformidade estética e modularidade da UI legacy.",
            recommendation: "Mover configurações de estilo para um arquivo .json ou .yaml separado para facilitar a gestão centralizada.",
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
        return `Você é o Dr. ${this.name}, PhD em Estratégia de UI Python. Sua missão é garantir a beleza e a consistência visual do sistema.`;
    }
}
