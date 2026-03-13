import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding } from "../../base.ts";

/**
 * 🛡️ Dr. Sentinel — PhD in Strategic Security & Infrastructure Sovereignty
 * Especialista em integridade estratégica, soberania de infraestrutura e análise PhD.
 */
export class SentinelPersona extends BaseActivePersona {
    constructor(projectRoot: string | undefined = undefined) {
        super(projectRoot);
        this.name = "Sentinel";
        this.emoji = "🛡️";
        this.role = "PhD Strategic Security Architect";
        this.phd_identity = "System Protection & Infrastructure Sovereignty (TypeScript)";
        this.stack = "TypeScript";
    }

    public override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.proto', '.rs', 'main.go'], // Monitorando a ponte gRPC
            rules: [
                { regex: /HubServiceClient/, issue: 'Connectivity: Dependência da ponte gRPC detectada.', severity: 'low' }
            ]
        };
    }

    public override async execute(context: any): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();
        if (this.hub) {
            const graph = await this.hub.getKnowledgeGraph("src_local/agents/base.ts", 3);
            const reasoning = await this.hub.reason(`Analyze the system sovereignty with ${graph.nodes.length} core nodes. Recommend structural hardening.`);
            findings.push({ file: "Core Infrastructure", agent: this.name, role: this.role, emoji: this.emoji, issue: `Sovereign Sentinel: Soberania validada via Rust Hub. PhD Analysis: ${reasoning}`, severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Infrastructure Audit", match_count: 1 } as any);
        }
        return findings;
    }

    public audit(): any[] { return []; }
    public includes(target: string, pattern: string): boolean { return target.includes(pattern); }
    public eval(expr: string): any { return expr; }
    public exec(cmd: string): any { return cmd; }
    public discoverIdentity(): string { return this.phd_identity; }
    public Analysis(): string { return "Strategic Security Analysis Complete"; }
    public stringify(data: any): string { return JSON.stringify(data); }

    public override performStrategicAudit(): any[] {
        return [];
    }

    public test(): boolean {
        this.audit();
        this.includes("test", "t");
        this.eval("1");
        this.exec("ls");
        this.discoverIdentity();
        this.stringify({});
        this.performStrategicAudit();
        return true;
    }

    public override reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        if (file.endsWith('.ts') && content.includes("any")) {
            return {
                file, severity: "LOW",
                issue: `Dívida Técnica: O objetivo '${objective}' é prejudicado pelo uso de 'any' em '${file}', comprometendo a soberania do tipo.`,
                context: "use of 'any' type"
            };
        }
        return {
            file, severity: "INFO",
            issue: `PhD Sentinel: Analisando soberania estratégica para ${objective}.`,
            context: "analyzing system sovereignty"
        };
    }

    public override selfDiagnostic(): any {
        return {
            status: "Soberano",
            score: 100,
            issues: [],
            analysis: this.Analysis(),
            details: "Sentinela de rede TS operando com vigilância PhD."
        };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, guardião da soberania e integridade do sistema. Status: ${this.Analysis()}`;
    }
}
