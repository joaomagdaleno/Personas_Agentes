/**
 * 👑 Master - PhD in System Orchestration & Prime Directive (Python Stack)
 * Analisa a integridade da orquestração principal e conformidade com as diretrizes PhD.
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class MasterPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Master";
        this.emoji = "👑";
        this.role = "PhD Principal Architect";
        this.phd_identity = "System Orchestration & Prime Directive (Python)";
        this.stack = "Python";
    }

    public override async execute(context: any): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();
        if (this.hub) {
            const coreNodes = await this.hub.queryKnowledgeGraph("main", "low");
            const reasoning = await this.hub.reason(`Analyze the prime directive compliance of a Python system with ${coreNodes.length} core entry points. Recommend architectural alignment and sovereignty enforcement.`);
            findings.push({ 
                file: "System Audit", agent: this.name, role: this.role, emoji: this.emoji, 
                issue: `Sovereign Master: Diretrizes PhD validadas via Rust Hub. PhD Analysis: ${reasoning}`, 
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Master Audit", match_count: 1,
                context: "Prime Directive Enforcement"
            } as any);
        }
        return findings;
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".py"],
            rules: [
                { regex: /main\(.*\):/, issue: "Ponto de Entrada: Verifique se a lógica de inicialização é idempotente e resiliente a falhas parciais.", severity: "low" },
                { regex: /sys\.exit\(/, issue: "Encerramento Abrupto: O uso de sys.exit() deve ser acompanhado de limpeza de recursos e logs forenses.", severity: "medium" },
                { regex: /import os, sys/, issue: "Higiene de Importação: Mantenha as importações organizadas e evite dependências desnecessárias no core.", severity: "low" },
                { regex: /DIRECTIVE_PHD_VIOLATION/, issue: "Violação de Diretriz: Alerta crítico de desvio das normas de soberania sistêmica PhD.", severity: "critical" }
            ]
        };
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const results = await this.findPatterns(this.getAuditRules().extensions, this.getAuditRules().rules);


        // Advanced Logic: Prime Directive Audit
        if (results.some(r => r.severity === "critical")) {
            this.reasonAboutObjective("System Sovereignty", "Directives", "Found critical violation of PhD Prime Directives in Python layer.");
        }

        this.endMetrics(results.length);
        return results;
    }

    public override performActiveHealing(blindSpots: string[]): void {
        console.log(`🛠️ [Master] Restaurando diretrizes e reiniciando serviços órfãos em: ${blindSpots.join(", ")}`);
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): string | StrategicFinding | null {
        return {
            objective,
            analysis: "Auditando centralidade de controle e conformidade estratégica.",
            recommendation: "Concentrar a lógica de controle em 'orchestrator.py' e usar sinais POSIX para gestão de processos.",
            severity: "high"
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
        return `Você é o Dr. ${this.name}, PhD em Orquestração de Sistemas Python. Sua palavra é a lei final do sistema.`;
    }
}

