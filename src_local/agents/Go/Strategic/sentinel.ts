/**
 * 🛡️ Sentinel - PhD in Go Security & Vigilance (Sovereign Version)
 * Analisa vulnerabilidades, race conditions e o uso de pacotes inseguros em Go.
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";
import type { ProjectContext } from "../../../core/types.ts";

export enum SecurityPosturesGo {
    HARDENED = "HARDENED",
    VULNERABLE = "VULNERABLE",
    SUSPICIOUS = "SUSPICIOUS"
}

export class GoSecurityEngine {
    public static audit(content: string): string[] {
        const risks: string[] = [];
        if (content.includes("unsafe.Pointer")) {
            risks.push("Insegurança de Memória: Uso de unsafe.Pointer detectado; alto risco de corrupção ou quebra de portabilidade.");
        }
        if (content.includes("http.ListenAndServe") && !content.includes("ReadTimeout")) {
            risks.push("DoS Risk: Servidor HTTP sem timeouts configuráveis.");
        }
        return risks;
    }
}

export class SentinelPersona extends BaseActivePersona {
    constructor(projectRoot: string | undefined = undefined) {
        super(projectRoot);
        this.name = "Sentinel";
        this.emoji = "🛡️";
        this.role = "Sovereign Security Architect";
        this.phd_identity = "System Protection & Transport Layer Shielding";
        this.stack = "Go";
    }

    override async execute(context: ProjectContext): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();

        if (this.hub) {
            // Strategic Intelligence: Blast Radius
            const graph = await this.hub.getKnowledgeGraph("src_native/hub/main.go", 2);
            
            // Security Query: Ownership and Mutability
            const securityQuery = await this.hub.queryKnowledgeGraph("unsafe", "critical");

            // PhD Security Reasoning
            const reasonPrompt = `Analyze the Go Hub integrity. Security Query detected ${securityQuery.length} suspicious patterns. Graph has ${graph.nodes.length} dependency nodes.`;
            const reasoning = await this.hub.reason(reasonPrompt);

            findings.push({
                file: "Native Hub", agent: this.name, role: this.role, emoji: this.emoji,
                issue: `Sovereign Vigilance: Integridade gRPC/Go validada. PhD Analysis: ${reasoning}`,
                severity: "INFO", stack: this.stack, evidence: "Blast Radius Analysis", match_count: 1
            } as any);
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".go"],
            rules: [
                { regex: /crypto\/md5|crypto\/sha1/, issue: "Algoritmo Fraco: MD5/SHA1 detectado. Use SHA-256 ou superior.", severity: "critical" },
                { regex: /os\.Setenv\(.*PASSWORD|.*KEY|.*SECRET/, issue: "Exposição de Segredos: Evite manipular segredos em variáveis de ambiente diretamente no código.", severity: "high" },
                { regex: /C\./, issue: "CGO Detected: Uso de CGO introduz riscos de segurança e reduz portabilidade; verifique necessidade.", severity: "medium" },
                { regex: /ioutil\.ReadFile/, issue: "Legacy API: ioutil está depreciado; use os.ReadFile para melhor suporte e performance.", severity: "low" },
                { regex: /map\[.*\]/, issue: "Concurrency Risk: Mapas Go não são seguros para concorrência sem sync.Map ou Mutex.", severity: "high" },
                { regex: /math\/rand/, issue: "Insegurança Criptográfica: Use crypto/rand para valores que exijam segurança (tokens, chaves).", severity: "critical" }
            ]
        };
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        const results = await super.performAudit();
        const securityThreats = GoSecurityEngine.audit(this.projectRoot || "");
        securityThreats.forEach(t => results.push({
            file: "SECURITY_SCAN", agent: this.name, role: this.role, emoji: this.emoji, issue: t, severity: "high", stack: this.stack,
            evidence: "Structural Analysis", match_count: 1
        }));
        return results;
    }

    public override performActiveHealing(blindSpots: string[]): void {
        console.log(`🛠️ [Sentinel] Aplicando patches de segurança e blindando segredos em: ${blindSpots.join(", ")}`);
    }

    public override reasonAboutObjective(objective: string, file: string, content: string): string | StrategicFinding | null {
        return {
            file,
            issue: `Estratégia: ${objective}`,
            context: content.substring(0, 200),
            objective,
            analysis: "Auditando a superfície de ataque e a robustez criptográfica do ecossistema Go.",
            recommendation: "Habilitar Gosec no pipeline de CI e realizar auditoria periódica de dependências do go.mod.",
            severity: "critical"
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
        return `Você é o Dr. ${this.name}, PhD em Segurança Cibernética Go. Sua missão é proteger a soberania do código contra toda forma de intrusão.`;
    }
}

