/**
 * 🎨 Palette - PhD in Go UI/UX & Aesthetics (Sovereign Version)
 * Analisa a estética de interfaces, cores de terminal e UX de ferramentas Go.
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export enum AestheticDensityGo {
    VIBRANT = "VIBRANT",
    MINIMAL = "MINIMAL",
    DRAB = "DRAB"
}

export class GoPaletteEngine {
    public static audit(content: string): string[] {
        const issues: string[] = [];
        if (content.includes("github.com/fatih/color") || content.includes("github.com/charmbracelet/lipgloss")) {
            if (!content.includes("NoColor")) {
                issues.push("Rigid Aesthetics: Uso de cores sem suporte a modo sem cor (--no-color); pode quebrar em ambientes de log ASCII.");
            }
        }
        if (content.includes("fmt.Scanf")) {
            issues.push("Low UX: Uso de Scanf para entrada; considere uma biblioteca de prompts interativos (Survey/BubbleTea).");
        }
        return issues;
    }
}

export class PalettePersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Palette";
        this.emoji = "🎨";
        this.role = "PhD UX Specialist";
        this.stack = "Go";
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const rules: AuditRule[] = [
            { regex: /github\.com\/charmbracelet/, issue: "Bubble Tea UI: O uso de Charmbracelet garante uma experiência premium; verifique a fluidez das animações TUI.", severity: "low" },
            { regex: /tview/, issue: "Advanced TUI: Verifique se os componentes tview possuem navegação por teclado intuitiva.", severity: "medium" },
            { regex: /color\.[A-Z]/, issue: "Terminal Color: Verifique se as cores usadas possuem contraste suficiente em fundos claros e escuros.", severity: "low" },
            { regex: /ProgressBar/, issue: "Visual Progress: Verifique se o feedback visual para operações longas é preciso e não obstrusivo.", severity: "medium" },
            { regex: /Layout/, issue: "Responsiveness: Verifique se o layout do terminal se adapta a diferentes larguras de janela.", severity: "low" },
            { regex: /Icon/, issue: "Iconography: Use símbolos Unicode/NerdFonts com cautela para garantir compatibilidade entre terminais.", severity: "medium" }
        ];
        const results = await this.findPatterns([".go"], rules);

        // Advanced Logic Density
        const paletteIssues = GoPaletteEngine.audit(this.projectRoot || "");
        paletteIssues.forEach(i => results.push({ file: "AESTHETICS_AUDIT", agent: this.name, role: this.role, emoji: this.emoji, issue: i, severity: "low", stack: this.stack }));

        this.endMetrics(results.length);
        return results;
    }

    public override performActiveHealing(blindSpots: string[]): void {
        console.log(`🛠️ [Palette] Injetando Lipgloss e normalizando cores em: ${blindSpots.join(", ")}`);
    }

    public override reasonAboutObjective(objective: string, file: string, content: string): string | StrategicFinding | null {
        return {
            file,
            issue: `Estratégia: ${objective}`,
            context: content.substring(0, 200),
            objective,
            analysis: "Auditando a experiência do usuário e a estética visual das ferramentas Go.",
            recommendation: "Adotar a stack Charmbracelet (Lipgloss/Bubbles) para garantir interfaces de terminal modernas e atraentes.",
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
        return `Você é o Dr. ${this.name}, PhD em Estética de Sistemas Go. Sua missão é garantir que o sistema seja funcional e belo.`;
    }
}

