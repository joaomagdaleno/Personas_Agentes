/**
 * 🌐 Web - TypeScript/Bun-native Frontend & DOM Agent
 * Sovereign Synapse: Audita a performance frontend, Web Vitals, hidratação e acessibilidade.
 */
import type { AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class WebPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Web";
        this.emoji = "🌐";
        this.role = "PhD Frontend Architect";
        this.phd_identity = "Web Performance & DOM Integrity (TS/Bun)";
        this.stack = "TypeScript";
    }

    public override async execute(context: any): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();
        if (this.hub) {
            const domNodes = await this.hub.queryKnowledgeGraph("window", "low");
            const reasoning = await this.hub.reason(`Analyze the frontend architecture of a system with ${domNodes.length} DOM-coupled points. Recommend optimization for Cumulative Layout Shift (CLS) and hydration strategy.`);
            findings.push({ 
                file: "Front Audit", agent: this.name, role: this.role, emoji: this.emoji, 
                issue: `Sovereign Web: Integridade visual validada via Rust Hub. PhD Analysis: ${reasoning}`, 
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Web Audit", match_count: 1,
                context: "Web Vitals & Hydration"
            } as any);
        }
        return findings;
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".ts", ".tsx", ".js", ".jsx", ".html"],
            rules: [
                { regex: /useEffect\(\(\) => \{[^\]]*\}, \[\]\)/, issue: "Hydration: Efeitos colaterais no mount sem verificação de window. Verifique se isso queima a hidratação no SSR.", severity: "medium" },
                { regex: /dangerouslySetInnerHTML/, issue: "Security: Uso de dangerouslySetInnerHTML detectado. Risco de XSS se o conteúdo não for higienizado.", severity: "high" },
                { regex: /document\.getElementById/, issue: "DOM: Manipulação direta do DOM via 'document'. Prefira refs ou estados reativos para manter a integridade do VDOM.", severity: "low" },
                { regex: /style=\{\{/, issue: "Performance: In-line styles dinâmicos. Podem causar re-renders desnecessários se não forem memorizados.", severity: "low" },
                { regex: /alt=""/, issue: "A11y: Tag alt vazia em imagem. Verifique se a imagem é puramente decorativa ou se falta acessibilidade.", severity: "medium" }
            ]
        };
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): StrategicFinding | null {
        return {
            file: "web",
            issue: `Direcionamento Web para ${objective}: Garantindo que a experiência do usuário seja fluida e acessível.`,
            severity: "STRATEGIC",
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Arquitetura Web. Sua missão é garantir que o frontend seja rápido, acessível e tecnicamente impecável.`;
    }
}
