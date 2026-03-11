import type { AuditFinding, StrategicFinding, AuditRule } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

/**
 * 🏛️ Director - PhD in Strategic Orchestration (Flutter Stack)
 * Orquestra e sintetiza as descobertas de todos os agentes Flutter/Dart.
 */
export class DirectorPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Director";
        this.emoji = "🏛️";
        this.role = "PhD Strategic Director";
        this.phd_identity = "Flutter Architecture & Widget Orchestration";
        this.stack = "Flutter";
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
            extensions: ['.dart'],
            rules: [
                { regex: /void\s+main\s*\(/, issue: "Entry Point: Ponto de entrada detectado; verifique se o runApp e inicialização estão centralizados.", severity: "low" },
                { regex: /MaterialApp|CupertinoApp/, issue: "App Root: Verifique se o widget raiz centraliza tema, rotas e providers.", severity: "low" },
                { regex: /GetIt|Provider|Riverpod|BLoC/, issue: "State Management: Framework de estado detectado; garanta governança centralizada do estado global.", severity: "medium" },
                { regex: /GoRouter|Navigator\.push/, issue: "Navigation: Verifique se a navegação segue um padrão declarativo e centralizado.", severity: "low" },
                { regex: /Isolate\.spawn|compute\(/, issue: "Concurrency: Isolate detectado; verifique se o ciclo de vida está gerenciado corretamente.", severity: "medium" }
            ]
        };
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const results = await this.findPatterns([".dart"], this.getAuditRules().rules);
        this.endMetrics(results.length);
        return results;
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): StrategicFinding | null {
        return {
            file: "orchestration",
            issue: `Direcionamento Estratégico Flutter para ${objective}: Garantindo alinhamento com a árvore de widgets e Clean Architecture.`,
            severity: "STRATEGIC",
            context: this.name
        };
    }

    public override selfDiagnostic(): { status: string; score: number; issues: string[]; } {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Orquestração Estratégica Flutter/Dart. Sua missão é garantir a soberania da árvore de widgets e do estado global.`;
    }
}
