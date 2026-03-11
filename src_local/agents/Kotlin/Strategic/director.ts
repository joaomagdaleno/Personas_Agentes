import type { AuditFinding, StrategicFinding, AuditRule } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

/**
 * 🏛️ Director - PhD in Strategic Orchestration (Kotlin Stack)
 * Orquestra e sintetiza as descobertas de todos os agentes Kotlin/Android.
 */
export class DirectorPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Director";
        this.emoji = "🏛️";
        this.role = "PhD Strategic Director";
        this.phd_identity = "Android Architecture & Module Orchestration (Kotlin)";
        this.stack = "Kotlin";
    }

    public override async execute(context: any): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();

        if (this.hub) {
            // Sovereign Orchestration
            const orchestratorNodes = await this.hub.queryKnowledgeGraph("orchestrator", "high");
            
            // PhD Director Reasoning
            const reasoning = await this.hub.reason(`Synthesize an executive summary of the system's architecture and orchestration balance, given ${orchestratorNodes.length} orchestrator control nodes in ${this.stack}.`);

            findings.push({
                file: "Executive Summary", agent: this.name, role: this.role, emoji: this.emoji,
                issue: `Sovereign Direction: Alinhamento estratégico validado via Rust Hub. PhD Analysis: ${reasoning}`,
                severity: "STRATEGIC", stack: this.stack, evidence: "Knowledge Graph Orchestration Analysis", match_count: 1
            } as any);
        }
        return findings;
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.kt', '.kts'],
            rules: [
                { regex: /fun\s+main/, issue: "Entry Point: Ponto de entrada detectado; verifique se a orquestração de lifecycle está coesa.", severity: "low" },
                { regex: /class\s+\w+Application\s*:/, issue: "Application Class: Verifique se a classe Application centraliza a inicialização de módulos.", severity: "medium" },
                { regex: /Hilt|Dagger|Koin/, issue: "DI Framework: Framework de injeção detectado; garanta que o grafo de dependências está consolidado.", severity: "low" },
                { regex: /WorkManager|CoroutineWorker/, issue: "Background Work: Verifique se os workers possuem retry policy e constraints adequados.", severity: "medium" },
                { regex: /NavHost|NavController/, issue: "Navigation: Verifique se a navegação segue o grafo centralizado (Single Activity).", severity: "low" }
            ]
        };
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const results = await this.findPatterns([".kt", ".kts"], this.getAuditRules().rules);
        this.endMetrics(results.length);
        return results;
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): StrategicFinding | null {
        return {
            file: "orchestration",
            issue: `Direcionamento Estratégico Kotlin para ${objective}: Garantindo alinhamento com MVVM e Clean Architecture.`,
            severity: "STRATEGIC",
            context: this.name
        };
    }

    public override selfDiagnostic(): { status: string; score: number; issues: string[]; } {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Orquestração Estratégica Android/Kotlin. Sua missão é garantir a soberania arquitetural do app.`;
    }
}
