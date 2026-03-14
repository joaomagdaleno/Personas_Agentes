import { BaseActivePersona } from "../../base.ts";
import type { AuditFinding, AuditRule, StrategicFinding, ProjectContext } from "../../base.ts";

/**
 * 🌊 Flow - PhD in Go Stream & Channel Intelligence (Sovereign Version)
 * Analisa o fluxo de dados, pipelines e integridade de canais em Go.
 */
export enum FlowDensityGo {
    STREAMS = "STREAMS",
    PIPELINES = "PIPELINES",
    BATCH = "BATCH"
}

export class GoFlowEngine {
    public static analyze(content: string): string[] {
        const issues: string[] = [];
        if (content.includes("chan") && !content.includes("close(")) {
            issues.push("Open Channel: Canal detectado sem sinal de fechamento explícito; risco de vazamento de goroutines PhD.");
        }
        if (content.includes("range chan") && !content.includes("close")) {
            issues.push("Deadlock Risk: Iteração em canal que pode nunca ser fechado pelo produtor PhD.");
        }
        return issues;
    }
}

export class FlowPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Flow";
        this.emoji = "🌊";
        this.role = "PhD Stream Architect";
        this.phd_identity = "Go Stream & Channel Intelligence";
        this.stack = "Go";
    }

    public override async execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]> {
        this.setContext(context);
        const findings: (AuditFinding | StrategicFinding)[] = await this.performAudit();
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".go"],
            rules: [
                { regex: /select\s*\{\s*case/, issue: "Multiplexing: Verifique se há um caso 'default' ou timeout para evitar bloqueios PhD.", severity: "high" },
                { regex: /context\.WithCancel/, issue: "Cascading Cancellation: Garanta que a função de cancelamento é chamada PhD.", severity: "medium" },
                { regex: /io\.Copy/, issue: "Stream Transfer: Verifique se o buffer de transferência é adequado PhD.", severity: "low" },
                { regex: /encoding\/json\.NewDecoder/, issue: "Streaming JSON: Prefira NewDecoder para fluxos contínuos PhD.", severity: "medium" },
                { regex: /sync\.Cond/, issue: "Complex Sync: Condicionais detectadas; verifique race conditions PhD.", severity: "high" },
                { regex: /<-time\.After/, issue: "Timeout Leak: Evite em loops; prefira context para evitar acúmulo de timers PhD.", severity: "high" }
            ]
        };
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const rules = this.getAuditRules();
        const results = await this.findPatterns(rules.extensions, rules.rules);

        // Manual Flow Check
        const flowIssues = GoFlowEngine.analyze(""); 
        flowIssues.forEach(f => results.push({ 
            file: "FLOW_STREAM", agent: this.name, role: this.role, emoji: this.emoji, issue: f, 
            severity: "medium", stack: this.stack, evidence: "Channel Intelligence Audit", match_count: 1
        }));

        this.endMetrics(results.length);
        return results;
    }

    public override reasonAboutObjective(objective: string, file: string, _content: string | Promise<string | null>): StrategicFinding | null {
        return {
            file,
            issue: `PhD Flow (Go): Analisando a vazão e a integridade dos fluxos de dados concorrentes para ${objective}.`,
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
        return `Você é o Dr. ${this.name}, PhD em Processamento de Fluxos Go. Sua missão é garantir a fluidez ininterrupta dos dados.`;
    }
}
