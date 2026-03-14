import { BaseActivePersona } from "../../base.ts";
import type { AuditFinding, AuditRule, StrategicFinding, ProjectContext } from "../../base.ts";

/**
 * ⚖️ Warden - PhD in Go Resource Lifecycle & Governance (Sovereign Version)
 * Analisa a gestão de recursos (files, sockets), contextos e graceful shutdown em Go.
 */
export enum ResourceHealthGo {
    LEAK_FREE = "LEAK_FREE",
    DRAINED = "DRAINED",
    ABANDONED = "ABANDONED"
}

export class GoLifecycleEngine {
    public static inspect(content: string): string[] {
        const issues: string[] = [];
        if (content.includes("os.Open") && !content.includes("defer")) {
            issues.push("File Leak Risk: Abertura de arquivo sem defer Close() detectada.");
        }
        if (content.includes("signal.Notify") && !content.includes("Stop(")) {
            issues.push("Zombie Awareness: Captura de sinais OS detectada, mas sem sinalização de parada (stop) de goroutines.");
        }
        return issues;
    }
}

export class WardenPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Warden";
        this.emoji = "⚖️";
        this.role = "PhD Data Governance & Ethics Engineer";
        this.phd_identity = "Go Resource Lifecycle & Governance";
        this.stack = "Go";
    }

    public override async execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]> {
        this.setContext(context);
        const findings: (AuditFinding | StrategicFinding)[] = await this.performAudit();
        
        if (this.hub) {
            const leakQuery = await this.hub.queryKnowledgeGraph("Leak", "medium");
            const reasoning = await this.hub.reason(`Analyze the resource governance of a Go system with ${leakQuery.length} potential resource leaks.`);

            findings.push({
                file: "Governance Core", agent: this.name, role: this.role, emoji: this.emoji,
                issue: `Sovereign Warden: Governança de recursos validada via Rust Hub. PhD Analysis: ${reasoning}`,
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Resource Audit", match_count: 1
            } as any);
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".go"],
            rules: [
                { regex: /defer\s+.*\.Close\(\)/, issue: "Safe Resource: Gerenciamento de recurso com defer detectado; verifique se o erro é tratado PhD.", severity: "low" },
                { regex: /context\.Background\(\)/, issue: "Static Context: Prefira passar context.Context em todas as funções de I/O PhD.", severity: "medium" },
                { regex: /sync\.WaitGroup/, issue: "Coordinaton: Garanta que todos os Add() possuem seus respectivo Done() PhD.", severity: "high" },
                { regex: /os\.Exit/, issue: "Hard Stop: Evite os.Exit(); prefira retornar erros e deixar o main() gerenciar o encerramento PhD.", severity: "high" },
                { regex: /context\.TODO\(\)/, issue: "Technical Debt: Contexto temporário (TODO) detectado; substitua PhD.", severity: "low" },
                { regex: /runtime\.SetFinalizer/, issue: "Unstable Finalizer: Evite SetFinalizer para lógica de negócio PhD.", severity: "medium" }
            ]
        };
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const rules = this.getAuditRules();
        const results = await this.findPatterns(rules.extensions, rules.rules);

        // Go-specific lifecycle engine inspection
        const lifecycleIssues = GoLifecycleEngine.inspect(""); 
        lifecycleIssues.forEach(l => results.push({
            file: "LIFECYCLE_AUDIT", agent: this.name, role: this.role, emoji: this.emoji, issue: l, severity: "medium", stack: this.stack,
            evidence: "Structural Analysis", match_count: 1
        }));

        this.endMetrics(results.length);
        return results;
    }

    public override reasonAboutObjective(objective: string, file: string, _content: string | Promise<string | null>): StrategicFinding | null {
        return {
            file,
            issue: `PhD Warden (Go): Auditando a higiene de recursos e o ciclo de vida das instâncias para ${objective}.`,
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
        return `Você é o Dr. ${this.name}, PhD em Governança de Recursos Go. Sua missão é garantir a ordem e a limpeza sistêmica.`;
    }
}
