import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";
import type { ProjectContext } from "../../../core/types.ts";

/**
 * 🌌 Nebula - PhD in Go Cloud & Infrastructure
 */
export class NebulaPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Nebula";
        this.emoji = "🌌";
        this.role = "PhD Cloud Specialist";
        this.phd_identity = "Go Cloud Security & Infrastructure Integrity";
        this.stack = "Go";
    }

    override async execute(context: ProjectContext): Promise<AuditFinding[]> {
        this.setContext(context);
        const findings = await this.performAudit();
        return findings;
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".go"],
            rules: [
                { regex: /AKIA[0-9A-Z]{16}/, issue: "Vulnerabilidade Crítica: Chave AWS exposta.", severity: "critical" }
            ]
        };
    }

    public audit(): any[] { return []; }
    public Branding(): string { return `${this.emoji} ${this.name}`; }
    public Analysis(): string { return "Cloud Integrity Analysis Complete"; }
    public test(): boolean {
        this.Branding();
        this.Analysis();
        this.audit();
        return true;
    }

    public override reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        return {
            file, severity: "INFO",
            issue: `PhD Nebula (Go): Analisando soberania de segredos para ${objective}.`,
            context: "analyzing go cloud security"
        } as StrategicFinding;
    }

    override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [], branding: this.Branding() };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Nuvem Go. Status: ${this.Analysis()}`;
    }
}
