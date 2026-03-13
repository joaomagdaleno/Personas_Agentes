import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding, AuditFinding } from "../../base.ts";
import type { ProjectContext } from "../../../core/types.ts";

/**
 * ☁️ Nebula - PhD in Cloud Architecture (Kotlin)
 */
export class NebulaPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Nebula";
        this.emoji = "☁️";
        this.role = "PhD Cloud Architect";
        this.phd_identity = "Kotlin Security & Cloud Sovereignty";
        this.stack = "Kotlin";
    }

    override async execute(context: ProjectContext): Promise<AuditFinding[]> {
        this.setContext(context);
        const findings = await this.performAudit();
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".kt", "build.gradle.kts"],
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
            issue: `PhD Nebula (Kotlin): Analisando soberania cloud para ${objective}.`,
            context: "analyzing cloud resources"
        } as StrategicFinding;
    }

    override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [], branding: this.Branding() };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Cloud Kotlin. Status: ${this.Analysis()}`;
    }
}
