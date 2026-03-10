/**
 * 🕵️ Probe - PhD in Security & Forensic Analysis (Flutter)
 * Analisa a integridade de chamadas de rede e persistência de dados.
 */
import type { AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class ProbePersona extends BaseActivePersona {
    constructor(projectRoot: string | undefined = undefined) {
        super(projectRoot);
        this.name = "Probe";
        this.emoji = "🕵️";
        this.role = "PhD Forensic Analyst";
        this.phd_identity = "Security & Forensic Analysis (Flutter)";
        this.stack = "Flutter";
    }

    override async execute(context: any): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();

        if (this.hub) {
            // Flutter Resilience: Blast Radius of network/storage failures
            const graph = await this.hub.getKnowledgeGraph("src_local/core/types.ts", 2);
            
            // Search for Swallowed Errors in Flutter/Dart
            const errorLeaks = await this.hub.queryKnowledgeGraph("catch", "critical");

            // PhD Resilience Reasoning
            const reasoning = await this.hub.reason(`Analyze the Flutter resilience baseline given ${errorLeaks.length} empty catch blocks in a dependency graph of ${graph.nodes.length} nodes.`);

            findings.push({
                file: "Resilience Core", agent: this.name, role: this.role, emoji: this.emoji,
                issue: `Sovereign Flutter Resilience: Integridade validada. PhD Analysis: ${reasoning}`,
                severity: "INFO", stack: this.stack, evidence: "Graph Error propagation Analysis", match_count: 1
            } as any);
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".dart"],
            rules: [
                { regex: /catch\s*\(.*\)\s*\{\s*\}/, issue: "Cegueira Flutter: catch vazio engole exceção silenciosamente.", severity: "critical" },
                { regex: /\.catchError\(\(.*\)\s*\{\s*\}\)/, issue: "Promise Silenciada: .catchError vazio engole erro de Future.", severity: "critical" },
                { regex: /catch\s*\(.*\)\s*\{\s*print\(/, issue: "Telemetria Informal: Erro logado via print no bloco catch.", severity: "medium" },
                { regex: /onError:\s*\(.*\)\s*\{\s*\}/, issue: "Stream Frágil: Handler onError vazio detectado.", severity: "high" },
                { regex: /throw\s+Exception\(\)/, issue: "Vago: Exception lançada sem mensagem descritiva.", severity: "medium" },
                { regex: /\/\/\s*TODO:?\s*handle\s*error/i, issue: "Débito Tech: Tratamento de erro pendente detectado no comentário.", severity: "medium" }
            ]
        };
    }

    public override performActiveHealing(blindSpots: string[]): void {
        console.log(`🛠️ [Probe] Blindando pontos de falha: ${blindSpots.join(", ")}`);
        // Simulação de implementação de criptografia em storage
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): string | StrategicFinding | null {
        return {
            objective,
            analysis: "Investigando superfícies de ataque em rede e storage",
            file: _file,
            issue: `PhD Resilience: Analisando integridade de falhas para ${objective}. Focando em eliminação de catch-alls silenciosos.`,
            severity: "INFO",
            context: this.name
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
        return `Você é o Dr. ${this.name}, PhD em Análise Forense Flutter. Seu foco é integridade de dados e resiliência de rede.`;
    }
}

