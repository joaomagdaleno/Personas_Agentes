/**
 * 🎨 Palette - Rust-native UX & Terminal Aesthetics Agent
 * Sovereign Synapse: Audita a estética de TUIs e CLIs Rust (crossterm, ratatui, clap).
 */
import type { AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class PalettePersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Palette";
        this.emoji = "🎨";
        this.role = "PhD UX & Terminal Design Engineer";
        this.phd_identity = "Rust Terminal Aesthetics & CLI UX";
        this.stack = "Rust";
    }

    public override async execute(context: any): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();
        if (this.hub) {
            const uiNodes = await this.hub.queryKnowledgeGraph("ratatui", "low");
            const reasoning = await this.hub.reason(`Analyze the terminal UX of a Rust system with ${uiNodes.length} TUI/CLI patterns. Recommend ratatui for modern TUIs and clap for CLIs.`);
            findings.push({ file: "Visual Audit", agent: this.name, role: this.role, emoji: this.emoji, issue: `Sovereign Palette: Estética Rust auditada nativamente. PhD Analysis: ${reasoning}`, severity: "INFO", stack: this.stack, evidence: "Knowledge Graph UX Audit", match_count: 1 } as any);
        }
        return findings;
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".rs"],
            rules: [
                { regex: /println!\("/, issue: "Raw Output: println! sem formatação — considere colored ou crossterm para UX.", severity: "low" },
                { regex: /eprintln!\("/, issue: "Error Output: Verifique se mensagens de erro possuem contexto visual (cor, ícone).", severity: "low" },
                { regex: /clap::/, issue: "CLI Framework: Valide se o help/about possuem descrições claras e exemplos.", severity: "low" },
                { regex: /ratatui/, issue: "TUI Framework: Verifique se o layout se adapta a diferentes tamanhos de terminal.", severity: "medium" }
            ]
        };
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): StrategicFinding | null {
        return {
            file: "ux",
            issue: `Direcionamento Rust Palette para ${objective}: Garantindo estética terminal premium.`,
            severity: "STRATEGIC",
            context: this.name
        };
    }

    public override selfDiagnostic(): { status: string; score: number; issues: string[]; } {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Estética de Terminal Rust. Sua missão é garantir que todo output seja belo e informativo.`;
    }
}
