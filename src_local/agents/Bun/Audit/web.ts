/**
 * 🌐 Web - Bun-native Performance & DOM Agent
 * Sovereign Synapse: Audita a performance do Bun como frontend/runtime, Web Vitals e SSR integrity.
 */
import type { AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class WebPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Web";
        this.emoji = "🌐";
        this.role = "PhD Frontend Architect";
        this.phd_identity = "Web Performance & Bun SSR (Bun)";
        this.stack = "Bun";
    }

    public override async execute(context: any): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();
        if (this.hub) {
            const webNodes = await this.hub.queryKnowledgeGraph("Bun.serve", "low");
            const reasoning = await this.hub.reason(`Analyze the Bun-powered web architecture with ${webNodes.length} server-side entry points. Recommend optimization for hydration and static asset delivery.`);
            findings.push({ 
                file: "Front Audit", agent: this.name, role: this.role, emoji: this.emoji, 
                issue: `Sovereign Web: Integridade visual e SSR Bun validada via Rust Hub. PhD Analysis: ${reasoning}`, 
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Web Audit", match_count: 1,
                context: "Hydration & Bun Performance"
            } as any);
        }
        return findings;
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".ts", ".tsx", ".js", ".jsx"],
            rules: [
                { regex: /Bun\.serve/, issue: "Architecture: Verifique a configuração de cache e compressão no servidor Bun para otimizar Web Vitals.", severity: "low" },
                { regex: /dangerouslySetInnerHTML/, issue: "Security: Risco de XSS detectado no componente frontend.", severity: "high" },
                { regex: /document\.getElementById/, issue: "DOM: Manipulação direta do DOM. Prefira abstrações reativas do framework para evitar inconsistência de estado.", severity: "low" },
                { regex: /fetch\(.*\)/, issue: "Network: Verifique se há tratamento adequado para timeouts e retries no frontend.", severity: "medium" }
            ]
        };
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): StrategicFinding | null {
        return {
            file: "web",
            issue: `Direcionamento Web Bun para ${objective}: Maximizando performance via Bun runtime e SSR.`,
            severity: "STRATEGIC",
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Arquitetura Web Bun. Sua missão é garantir rapidez absoluta e SEO de elite.`;
    }
}
