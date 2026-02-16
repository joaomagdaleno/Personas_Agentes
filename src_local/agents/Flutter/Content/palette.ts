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
        this.stack = "Flutter";
    }

    public override performAudit(): AuditFinding[] {
        this.startMetrics();
        const results = this.findPatterns([".dart"], [
            { regex: /color\s*:\s*Colors\.\w+/, issue: "Aviso: Cor hardcoded detectada. Prefira usar o sistema de temas (Theme.of) para garantir consistência de marca.", severity: "low" },
            { regex: /semanticsLabel\s*:\s*null/, issue: "Acessibilidade: Elemento visual sem rótulo de semântica (Ponto Cego para leitores de tela).", severity: "medium" }
        ]);
        this.endMetrics(results.length);
        return results;
    }

    public override reasonAboutObjective(objective: string, file: string, content: string): StrategicFinding | null {
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
