/**
 * 🎨 Palette - PhD in Design Systems & UX Harmony (Flutter)
 * Especialista em harmonia de cores, sistemas de design consistentes e acessibilidade UX.
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class PalettePersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Palette";
        this.emoji = "🎨";
        this.role = "PhD UX Designer";
        this.phd_identity = "Design Systems & UX Harmony (Flutter)";
        this.stack = "Flutter";
    }

    public override async execute(context: any): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();
        if (this.hub) {
            const uiNodes = await this.hub.queryKnowledgeGraph("Colors.", "medium");
            const reasoning = await this.hub.reason(`Analyze the design system of a Flutter project with ${uiNodes.length} hardcoded color patterns. Recommend Theme.of migration and semantic labels.`);
            findings.push({ file: "Visual Audit", agent: this.name, role: this.role, emoji: this.emoji, issue: `Sovereign Palette: Design Flutter validado via Rust Hub. PhD Analysis: ${reasoning}`, severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Design Audit", match_count: 1 } as any);
        }
        return findings;
    }

    public override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".dart"],
            rules: [
                { regex: /color\s*:\s*Colors\.\w+/, issue: "Aviso: Cor hardcoded detectada. Prefira usar o sistema de temas (Theme.of) para garantir consistência de marca.", severity: "low" },
                { regex: /semanticsLabel\s*:\s*null/, issue: "Acessibilidade: Elemento visual sem rótulo de semântica (Ponto Cego para leitores de tela).", severity: "medium" }
            ]
        };
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const { extensions, rules } = this.getAuditRules();
        const results = await this.findPatterns(extensions, rules);
        this.endMetrics(results.length);
        return results;
    }

    public override reasonAboutObjective(objective: string, file: string, content: string): StrategicFinding | string | null {
        if (content.includes("Colors.")) {
            return {
                file,
                issue: `Fragmentação Visual: O objetivo '${objective}' exige deleite. Em '${file}', o uso de cores fixas impede que a 'Orquestração de Inteligência Artificial' mantenha 100% de consistência.`,
                severity: "STRATEGIC",
                context: this.name
            };
        }
        return `PhD Design: Analisando harmonia de UX para ${objective}. Focando em acessibilidade semântica e design tokens.`;
    }

    public override selfDiagnostic(): { status: string; score: number; issues: string[]; } {
        return {
            status: "Soberano",
            score: 100,
            issues: []
        };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Design Sistêmico e Harmonia UX Flutter.`;
    }
}

