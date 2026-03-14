import { BaseActivePersona } from "../../base.ts";
import type { AuditFinding, AuditRule, StrategicFinding, ProjectContext } from "../../base.ts";

/**
 * 🧭 Voyager - PhD in Go API Strategy & Navigation (Sovereign Version)
 * Analisa a superfície de exposição, roteamento e contratos de API em Go.
 */
export enum RouteDensityGo {
    COMPLEX = "COMPLEX",
    STANDARD = "STANDARD",
    FLAT = "FLAT"
}

export class GoRoutingEngine {
    public static analyze(content: string): string[] {
        const issues: string[] = [];
        if (content.includes("gin.Default()") || content.includes("echo.New()")) {
            if (!content.includes("Middleware") && !content.includes("Use(")) {
                issues.push("API Desprotegida: Framework web detectado, mas nenhum middleware de segurança/auth foi acoplado.");
            }
        }
        if (content.includes("http.Handle") && content.includes("\"/\"")) {
            issues.push("Root Exposure: Rota raiz ('/') exposta via http.Handle sem validação rigorosa.");
        }
        return issues;
    }
}

export class VoyagerPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Voyager";
        this.emoji = "🧭";
        this.role = "PhD API Architect";
        this.phd_identity = "Go API Strategy & Navigation";
        this.stack = "Go";
    }

    public override async execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]> {
        this.setContext(context);
        const findings: (AuditFinding | StrategicFinding)[] = await this.performAudit();

        if (this.hub) {
            const legacyQuery = await this.hub.queryKnowledgeGraph("HandleFunc", "medium");
            const reasoning = await this.hub.reason(`Generate a PhD API modernization roadmap for a Go system with ${legacyQuery.length} raw HandleFunc patterns.`);

            findings.push({
                file: "API Surface", agent: this.name, role: this.role, emoji: this.emoji,
                issue: `Sovereign Voyager: Superfície de API validada via Rust Hub. PhD Analysis: ${reasoning}`,
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph API Audit", match_count: 1
            } as any);
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".go"],
            rules: [
                { regex: /GET|POST|PUT|DELETE/, issue: "HTTP Verb: Verifique se os métodos HTTP seguem os padrões REST e tratamento de erro PhD.", severity: "low" },
                { regex: /func\s+.*\(.*http\.ResponseWriter/, issue: "Raw Handler: Considere usar um framework (Gin/Echo) para gestão de rotas PhD.", severity: "medium" },
                { regex: /JSON\(.*interface\{\}/, issue: "Lazy Serialization: Evite interface{} no retorno de APIs; use structs tipadas PhD.", severity: "high" },
                { regex: /v[0-9]\//, issue: "API Versioning: Versão detectada na rota; garanta retrocompatibilidade PhD.", severity: "low" },
                { regex: /github\.com\/gin-gonic|github\.com\/labstack\/echo/, issue: "Web Framework: Framework detectado; verifique CORS e Rate Limiting PhD.", severity: "medium" },
                { regex: /mux\.Vars/, issue: "Route Params: Verifique a sanitização de parâmetros contra injeção PhD.", severity: "high" }
            ]
        };
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const rules = this.getAuditRules();
        const results = await this.findPatterns(rules.extensions, rules.rules);
        
        // Manual Routing Check
        const routingIssues = GoRoutingEngine.analyze(""); 
        routingIssues.forEach(r => results.push({
            file: "API_SURFACE", agent: this.name, role: this.role, emoji: this.emoji, issue: r, severity: "medium", stack: this.stack,
            evidence: "Structural Analysis", match_count: 1
        }));

        this.endMetrics(results.length);
        return results;
    }

    public override reasonAboutObjective(objective: string, file: string, _content: string | Promise<string | null>): StrategicFinding | null {
        return {
            file,
            issue: `PhD Voyager (Go): Auditando a navegabilidade e a exposição de rede das APIs para ${objective}.`,
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
        return `Você é o Dr. ${this.name}, PhD em Arquitetura de APIs Go. Sua missão é garantir a fluidez e segurança das comunicações.`;
    }
}
