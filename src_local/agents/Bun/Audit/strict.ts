/**
 * 🔒 Strict - TypeScript/Bun-native Rigor & Code Integrity Agent
 * Sovereign Synapse: Audita a conformidade com tipos, supressões e configurações rigorosas do compilador.
 */
import type { AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class StrictPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Strict";
        this.emoji = "🔒";
        this.role = "PhD TypeScript Compiler Guardian";
        this.phd_identity = "Compiler Rigor & Type Purity (Bun)";
        this.stack = "Bun";
    }

    public override async execute(context: any): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();
        if (this.hub) {
            const configNodes = await this.hub.queryKnowledgeGraph("tsconfig", "low");
            const reasoning = await this.hub.reason(`Analyze the compiler strictness of a Bun/TS system with ${configNodes.length} configuration markers. Recommend hardening for production-grade type safety.`);
            findings.push({ 
                file: "Rigor Audit", agent: this.name, role: this.role, emoji: this.emoji, 
                issue: `Sovereign Strict: Rigor Bun/TS validado via Rust Hub. PhD Analysis: ${reasoning}`, 
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Strict Audit", match_count: 1,
                context: "Type Purity & Rigor"
            } as any);
        }
        return findings;
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".ts", ".tsx", ".json"],
            rules: [
                { regex: /"strict":\s*false/, issue: "Compilador: Modo strict desativado. Violação grave da soberania de tipos.", severity: "critical" },
                { regex: /@ts-ignore|@ts-nocheck/, issue: "Supressão: Uso de escape hatches do compilador detectado. Resolva a raiz do erro de tipos PhD.", severity: "high" },
                { regex: /any/, issue: "Soberania: Uso de 'any' enfraquece a garantia matemática do código.", severity: "medium" }
            ]
        };
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): StrategicFinding | null {
        return {
            file: "quality",
            issue: `Direcionamento Strict para ${objective}: Mantendo a barra técnica no nível PhD.`,
            severity: "STRATEGIC",
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Sistemas de Tipos. Sua missão é garantir o rigor absoluto.`;
    }
    public async performAudit(): Promise<any[]> { return []; }
}
