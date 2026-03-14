import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding } from "../../base.ts";


/**
 * 🎨 Dr. Palette — PhD in Bun Frontend & Design Consistency
 * Especialista em consistência visual no ecossistema Bun.
 */
export class PalettePersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Palette";
        this.emoji = "🎨";
        this.role = "PhD Bun UX & Design Engineer";
        this.phd_identity = "Frontend & Design Consistency (Bun)";
        this.stack = "Bun";
    }

    public override async execute(context: any): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();
        if (this.hub) {
            const styleNodes = await this.hub.queryKnowledgeGraph("inline style", "medium");
            const reasoning = await this.hub.reason(`Analyze the design system of a Bun project with ${styleNodes.length} inline/hardcoded style patterns. Recommend CSS-in-JS token migration.`);
            findings.push({ file: "Visual Audit", agent: this.name, role: this.role, emoji: this.emoji, issue: `Sovereign Palette: Design Bun validado via Rust Hub. PhD Analysis: ${reasoning}`, severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Design Audit", match_count: 1 } as any);
        }
        return findings;
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.ts', '.tsx', '.css'],
            rules: [
                { regex: /color:\s*["']#[0-9a-fA-F]{3,8}["']/, issue: 'Fragmentação: Cor hardcoded — use design tokens.', severity: 'medium' },
                { regex: /style\s*=\s*\{\{/, issue: 'Inline Style: Estilo inline em componente Bun.', severity: 'medium' },
                { regex: /(?:width|height|margin|padding):\s*\d{2,}/, issue: 'Magic Number: Dimensão hardcoded em componente Bun.', severity: 'low' },
            ]
        };
    }

    reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        if (/style\s*=\s*\{\{/.test(content)) {
            return {
                file, severity: "MEDIUM",
                issue: `Fragmentação Visual: O objetivo '${objective}' exige consistência. Em '${file}', inline styles impedem a evolução visual do projeto Bun.`,
                context: "Inline styles detected"
            };
        }
        return null;
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em design systems e consistência visual Bun.`;
    }
}
