import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding, AuditFinding } from "../../base.ts";
import winston from "winston";
import { StrictAuditHelpers } from "./StrictAuditHelpers.ts";

const logger = winston.child({ module: "TS_Strict" });

/**
 * 🔒 Dr. Strict — PhD in TypeScript Compiler Strictness
 */
export class StrictPersona extends BaseActivePersona {
    constructor(projectRoot: string | undefined = undefined) {
        super(projectRoot);
        this.name = "Strict";
        this.emoji = "🔒";
        this.role = "PhD TypeScript Compiler Guardian";
        this.phd_identity = "Compiler Rigor & Type Purity (TypeScript)";
        this.stack = "TypeScript";
    }

    public override async execute(context: any): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();
        if (this.hub) {
            const configNodes = await this.hub.queryKnowledgeGraph("tsconfig", "low");
            const reasoning = await this.hub.reason(`Analyze the compiler strictness of a TypeScript system with ${configNodes.length} configuration markers. Recommend hardening for production-grade type safety.`);
            findings.push({ 
                file: "Rigor Audit", agent: this.name, role: this.role, emoji: this.emoji, 
                issue: `Sovereign Strict: Rigor TS validado via Rust Hub. PhD Analysis: ${reasoning}`, 
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Strict Audit", match_count: 1,
                context: "Type Purity & Rigor"
            } as any);
        }
        return findings;
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.ts', '.tsx', 'tsconfig.json'],
            rules: [
                { regex: /"strict":\s*false/, issue: 'Compilador Desarmado: Modo strict desativado no tsconfig.', severity: 'critical' },
                { regex: /@ts-ignore|@ts-nocheck/, issue: 'Supressão detectada.', severity: 'high' },
            ]
        };
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const results = await this.findPatterns(this.getAuditRules().extensions, this.getAuditRules().rules);
        Object.entries(this.contextData).forEach(([f, c]) => {
            if (f.endsWith('tsconfig.json')) StrictAuditHelpers.auditTSConfig((c as any).content as string, results, f, this.name);
        });
        return results;
    }

    public override reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | null {
        if (typeof content !== 'string') return null;
        if (file.endsWith('tsconfig.json') && !content.includes('"strict": true') && !content.includes('"strict":true')) {
            return { file, severity: "CRITICAL", issue: `Compilador Desarmado para ${objective}.`, context: "tsconfig strict false" } as any;
        }
        return { file, severity: "INFO", issue: `PhD Strictness: Analisando ${objective}.`, context: "analyzing strictness" } as any;
    }

    selfDiagnostic(): any { return { status: "Soberano", score: 100, details: "OK" }; }
    getSystemPrompt(): string { return `Você é o Dr. ${this.name}, guardião TS.`; }
}
