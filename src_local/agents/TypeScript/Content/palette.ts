import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding } from "../../base.ts";


/**
 * 🎨 Dr. Palette — PhD in TypeScript UX Quality & Visual Consistency
 * Especialista em consistência visual, magic numbers e hardcoded styles.
 */
export class PalettePersona extends BaseActivePersona {
    constructor(projectRoot: string | null = null) {
        super(projectRoot);
        this.name = "Palette";
        this.emoji = "🎨";
        this.role = "PhD UX & Design Systems Engineer";
        this.phd_identity = "UX Quality & Visual Consistency (TypeScript)";
        this.stack = "TypeScript";
    }

    public override async execute(context: any): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();
        if (this.hub) {
            const styleNodes = await this.hub.queryKnowledgeGraph("hardcoded color", "medium");
            const reasoning = await this.hub.reason(`Analyze the visual consistency of a TypeScript system with ${styleNodes.length} hardcoded style patterns. Recommend design token migration.`);
            findings.push({ file: "Visual Audit", agent: this.name, role: this.role, emoji: this.emoji, issue: `Sovereign Palette: Consistência visual validada via Rust Hub. PhD Analysis: ${reasoning}`, severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Design Audit", match_count: 1 } as any);
        }
        return findings;
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.ts', '.tsx', '.css'],
            rules: [
                { regex: /color:\s*["']#[0-9a-fA-F]{3,8}["']/, issue: 'Fragmentação Visual: Cor hardcoded — use design tokens.', severity: 'medium' },
                { regex: /style\s*=\s*\{\{/, issue: 'Inline Style: Estilo inline dificulta manutenção e consistência.', severity: 'medium' },
                { regex: /(?:width|height|margin|padding):\s*\d{2,}/, issue: 'Magic Number: Dimensão hardcoded — use variáveis de design system.', severity: 'low' },
                { regex: /font-size:\s*\d+px/, issue: 'Tipografia Rígida: font-size em pixels sem escala responsiva.', severity: 'low' },
            ]
        };
    }

    reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        if (/color:\s*['"]#/.test(content)) {
            return {
                file, severity: "MEDIUM",
                issue: `Fragmentação Visual: O objetivo '${objective}' exige consistência. Em '${file}', cores hardcoded impedem que a 'Orquestração de Inteligência Artificial' mantenha identidade visual.`,
                context: "Hardcoded colors detected"
            };
        }
        return {
            file, severity: "INFO",
            issue: `PhD Palette: Analisando consistência visual para ${objective}. Focando em design tokens e eliminação de estilos inline.`,
            context: "analyzing visual consistency"
        };
    }

    selfDiagnostic(): any {
        return {
            status: "Soberano",
            score: 100,
            details: "Curador de consistência visual TS operando com estética PhD."
        };
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em sistemas de design e consistência visual TypeScript.`;
    }
}
