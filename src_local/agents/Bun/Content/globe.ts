import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding } from "../../base.ts";


/**
 * 🌍 Dr. Globe — PhD in Bun i18n & Cross-Platform Compatibility
 * Especialista em compatibilidade cross-platform e internacionalização Bun.
 */
export class GlobePersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Globe";
        this.emoji = "🌍";
        this.role = "PhD Bun i18n Engineer";
        this.phd_identity = "i18n & Cross-Platform Compatibility (Bun)";
        this.stack = "Bun";
    }

    public override async execute(context: any): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();
        if (this.hub) {
            const i18nNodes = await this.hub.queryKnowledgeGraph("import.meta", "low");
            const reasoning = await this.hub.reason(`Analyze cross-platform portability of a Bun system with ${i18nNodes.length} Bun-only API patterns. Recommend Node.js compatibility layer.`);
            findings.push({ file: "i18n Audit", agent: this.name, role: this.role, emoji: this.emoji, issue: `Sovereign Globe: Portabilidade Bun validada via Rust Hub. PhD Analysis: ${reasoning}`, severity: "INFO", stack: this.stack, evidence: "Knowledge Graph i18n Audit", match_count: 1 } as any);
        }
        return findings;
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.ts', '.tsx'],
            rules: [
                { regex: /(?:message|label|title|text)\s*[:=]\s*["'][A-Z][a-zÀ-ú]/, issue: 'Hardcoded: Texto de interface no código Bun.', severity: 'medium' },
                { regex: /import\.meta\.dir/, issue: 'Cross-Platform: import.meta.dir é Bun-only — pode quebrar em Node.', severity: 'low' },
                { regex: /Bun\.which\(/, issue: 'Cross-Platform: Bun.which() é Bun-only — verifique portabilidade.', severity: 'low' },
            ]
        };
    }

    reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        if (/import\.meta\.dir|Bun\.which/.test(content)) {
            return {
                file, severity: "LOW",
                issue: `Portabilidade: O objetivo '${objective}' pode exigir cross-runtime. Em '${file}', APIs Bun-only limitam a portabilidade.`,
                context: "Bun-only API detected"
            };
        }
        return null;
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em internacionalização e portabilidade Bun.`;
    }
}
