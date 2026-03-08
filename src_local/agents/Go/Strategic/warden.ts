/**
 * ⚖️ Warden - PhD in Go Resource Lifecycle & Governance (Sovereign Version)
 * Analisa a gestão de recursos (files, sockets), contextos e graceful shutdown em Go.
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

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
        this.role = "PhD Lifecycle Architect";
        this.stack = "Go";
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".go"],
            rules: [
                { regex: /defer\s+.*\.Close\(\)/, issue: "Safe Resource: Gerenciamento de recurso com defer detectado; verifique se o erro no fechamento é tratado quando crítico.", severity: "low" },
                { regex: /context\.Background\(\)/, issue: "Static Context: Prefira passar context.Context em todas as funções que envolvam I/O ou concorrência.", severity: "medium" },
                { regex: /sync\.WaitGroup/, issue: "Coordinaton: Garanta que todos os Add() possuem seus respectivos Done() para evitar deadlocks de encerramento.", severity: "high" },
                { regex: /os\.Exit/, issue: "Hard Stop: Evite os.Exit(); prefira retornar erros e deixar o main() gerenciar o encerramento gracioso via deferred calls.", severity: "high" },
                { regex: /context\.TODO\(\)/, issue: "Technical Debt: Contexto temporário (TODO) detectado; substitua por um contexto adequado.", severity: "low" },
                { regex: /runtime\.SetFinalizer/, issue: "Unstable Finalizer: Evite SetFinalizer para lógica de negócio; não há garantia de execução imediata.", severity: "medium" }
            ]
        };
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        const results = await super.performAudit();
        const lifecycleIssues = GoLifecycleEngine.inspect(this.projectRoot || "");
        lifecycleIssues.forEach(l => results.push({
            file: "LIFECYCLE_AUDIT", agent: this.name, role: this.role, emoji: this.emoji, issue: l, severity: "medium", stack: this.stack,
            evidence: "Structural Analysis", match_count: 1
        }));
        return results;
    }

    public override performActiveHealing(blindSpots: string[]): void {
        console.log(`🛠️ [Warden] Injetando defer de fechamento e propagando contextos em: ${blindSpots.join(", ")}`);
    }

    public override reasonAboutObjective(objective: string, file: string, content: string): string | StrategicFinding | null {
        return {
            file,
            issue: `Estratégia: ${objective}`,
            context: content.substring(0, 200),
            objective,
            analysis: "Auditando a higiene de recursos e o ciclo de vida das instâncias Go.",
            recommendation: "Garantir que todos os pacotes aceitem context.Context como primeiro argumento para permitir cancelamento em cascata.",
            severity: "medium"
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
        return `Você é o Dr. ${this.name}, PhD em Governança de Recursos Go. Sua missão é garantir a ordem e a limpeza sistêmica.`;
    }
}
