import { BaseActivePersona } from "../../base.ts";
import type { AuditFinding, AuditRule, StrategicFinding, ProjectContext } from "../../base.ts";

/**
 * 🎨 Palette - PhD in UI Aesthetics & Design System Integrity (Python Stack)
 * Analisa a integridade visual, temas e conformidade com o Design System em Python legacy.
 */
export class PalettePersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Palette";
        this.emoji = "🎨";
        this.role = "PhD UI Strategist";
        this.phd_identity = "UI Aesthetics & Design System Integrity (Python)";
        this.stack = "Python";
    }

    public override async execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]> {
        this.setContext(context);
        const findings: (AuditFinding | StrategicFinding)[] = await this.performAudit();
        if (this.hub) {
            const uiNodes = await this.hub.queryKnowledgeGraph("Tkinter", "high");
            const reasoning = await this.hub.reason(`Analyze the visual ecosystem of a Python system with ${uiNodes.length} legacy UI framework patterns. Recommend design token centralization.`);
            findings.push({ 
                file: "Visual Audit", agent: this.name, role: this.role, emoji: this.emoji, 
                issue: `Sovereign Palette: Estética Python validada via Rust Hub. PhD Analysis: ${reasoning}`, 
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Design Audit", match_count: 1,
                context: "Visual Aesthetics Analysis"
            } as any);
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".py"],
            rules: [
                { regex: /COLOR_.* = "#[0-9a-fA-F]{6}"/, issue: "Token de Cor: Verifique se a cor hexadecimal segue a paleta PhD oficial.", severity: "low" },
                { regex: /style_config = \{/, issue: "Configuração de Estilo: Verifique se as configurações de UI (margens, fontes) são consistentes com o Sovereign stack.", severity: "low" },
                { regex: /background_color = .*/, issue: "Soberania Visual: Verifique se as cores de fundo suportam contrastes dinâmicos para acessibilidade.", severity: "medium" },
                { regex: /Tkinter|PyQt|Kivy/, issue: "Framework de UI: Uso de frameworks legados detectado. Verifique se a lógica de UI está desacoplada do core.", severity: "high" }
            ]
        };
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const rules = this.getAuditRules();
        const results = await this.findPatterns(rules.extensions, rules.rules);

        // Advanced Logic: Visual Integrity Audit
        if (results.some(r => r.severity === "high")) {
            this.reasonAboutObjective("Visual Sovereignty", "Frameworks", "Found tight coupling with legacy Python UI frameworks.");
        }

        this.endMetrics(results.length);
        return results;
    }

    public override reasonAboutObjective(objective: string, file: string, _content: string | Promise<string | null>): StrategicFinding | null {
        return {
            file,
            issue: `Auditando conformidade estética e modularidade da UI legacy para ${objective}.`,
            severity: "STRATEGIC",
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
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

