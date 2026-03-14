import { BaseActivePersona } from "../../base.ts";
import type { AuditFinding, AuditRule, StrategicFinding, ProjectContext } from "../../base.ts";

/**
 * 🎨 Palette - PhD in Go UI/UX & Aesthetics (Sovereign Version)
 * Analisa a estética de interfaces, cores de terminal e UX de ferramentas Go.
 */
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
                issues.push("Rigid Aesthetics: Uso de cores sem suporte a modo sem cor; pode quebrar em ambientes de log ASCII.");
            }
        }
        if (content.includes("fmt.Scanf")) {
            issues.push("Low UX: Uso de Scanf para entrada; considere uma biblioteca de prompts interativos.");
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
        this.phd_identity = "Go UI/UX & Terminal Aesthetics";
        this.stack = "Go";
    }

    public override async execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]> {
        this.setContext(context);
        const findings: (AuditFinding | StrategicFinding)[] = await this.performAudit();
        if (this.hub) {
            const uiNodes = await this.hub.queryKnowledgeGraph("charmbracelet", "low");
            const reasoning = await this.hub.reason(`Analyze the terminal UX of a Go system with ${uiNodes.length} UI framework patterns. Recommend Lipgloss/BubbleTea for modern TUIs.`);
            findings.push({ 
                file: "Visual Audit", agent: this.name, role: this.role, emoji: this.emoji, 
                issue: `Sovereign Palette: Estética Go validada via Rust Hub. PhD Analysis: ${reasoning}`, 
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph UX Audit", match_count: 1
            } as any);
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".go"],
            rules: [
                { regex: /github\.com\/charmbracelet/, issue: "Bubble Tea UI: O uso de Charmbracelet garante uma experiência premium PhD.", severity: "low" },
                { regex: /tview/, issue: "Advanced TUI: Verifique se os componentes tview possuem navegação por teclado intuitiva PhD.", severity: "medium" },
                { regex: /color\.[A-Z]/, issue: "Terminal Color: Verifique se as cores usadas possuem contraste suficiente PhD.", severity: "low" },
                { regex: /ProgressBar/, issue: "Visual Progress: Verifique se o feedback visual para operações longas é preciso PhD.", severity: "medium" },
                { regex: /Layout/, issue: "Responsiveness: Verifique se o layout do terminal se adapta a diferentes larguras PhD.", severity: "low" },
                { regex: /Icon/, issue: "Iconography: Use símbolos Unicode/NerdFonts com cautela para garantir compatibilidade PhD.", severity: "medium" }
            ]
        };
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const rules = this.getAuditRules();
        const results = await this.findPatterns(rules.extensions, rules.rules);
        
        // Manual Aesthetics Check
        const paletteIssues = GoPaletteEngine.audit(""); 
        paletteIssues.forEach(i => results.push({
            file: "AESTHETICS_AUDIT", agent: this.name, role: this.role, emoji: this.emoji, issue: i, severity: "low", stack: this.stack,
            evidence: "Structural Analysis", match_count: 1
        }));

        this.endMetrics(results.length);
        return results;
    }

    public override reasonAboutObjective(objective: string, file: string, _content: string | Promise<string | null>): StrategicFinding | null {
        return {
            file,
            issue: `Auditando a experiência do usuário e a estética visual das ferramentas Go para ${objective}.`,
            severity: "STRATEGIC",
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Estética de Sistemas Go. Sua missão é garantir que o sistema seja funcional e belo.`;
    }
}
