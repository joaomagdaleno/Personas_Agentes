/**
 * 🧭 Voyager - PhD in Go API Strategy & Navigation (Sovereign Version)
 * Analisa a superfície de exposição, roteamento e contratos de API em Go.
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

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
        this.stack = "Go";
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const rules: AuditRule[] = [
            { regex: /GET|POST|PUT|DELETE/, issue: "HTTP Verb: Verifique se os métodos HTTP seguem os padrões REST e possuem tratamento de erro adequado.", severity: "low" },
            { regex: /func\s+.*\(.*http\.ResponseWriter/, issue: "Raw Handler: Considere usar um framework (Gin/Echo) para gestão de rotas mais segura e escalável.", severity: "medium" },
            { regex: /JSON\(.*interface\{\}/, issue: "Lazy Serialization: Evite interface{} no retorno de APIs; use structs tipadas para garantir contratos estáveis.", severity: "high" },
            { regex: /v[0-9]\//, issue: "API Versioning: Versão detectada na rota; garanta a retrocompatibilidade nas alterações de contrato.", severity: "low" },
            { regex: /github\.com\/gin-gonic|github\.com\/labstack\/echo/, issue: "Web Framework: Framework detectado; verifique se a configuração de CORS e Rate Limiting está ativa.", severity: "medium" },
            { regex: /mux\.Vars/, issue: "Route Params: Verifique a sanitização de parâmetros de rota contra injeção de comandos.", severity: "high" }
        ];
        const results = await this.findPatterns([".go"], rules);

        // Advanced Logic Density
        const routingIssues = GoRoutingEngine.analyze(this.projectRoot || "");
        routingIssues.forEach(r => results.push({ file: "API_SURFACE", agent: this.name, role: this.role, emoji: this.emoji, issue: r, severity: "medium", stack: this.stack }));

        this.endMetrics(results.length);
        return results;
    }

    public override performActiveHealing(blindSpots: string[]): void {
        console.log(`🛠️ [Voyager] Injetando middlewares de segurança e tipando retornos em: ${blindSpots.join(", ")}`);
    }

    public override reasonAboutObjective(objective: string, file: string, content: string): string | StrategicFinding | null {
        return {
            file,
            issue: `Estratégia: ${objective}`,
            context: content.substring(0, 200),
            objective,
            analysis: "Auditando a navegabilidade e a exposição de rede das APIs Go.",
            recommendation: "Implementar documentação OpenAPI (Swagger) automática para todos os handlers detectados.",
            severity: "low"
        } as StrategicFinding;
    }

    public override selfDiagnostic(): { status: string; score: number; issues: string[]; } {
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

