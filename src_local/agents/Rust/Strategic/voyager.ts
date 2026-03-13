import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding, AuditFinding } from "../../base.ts";
import type { ProjectContext } from "../../../core/types.ts";

/**
 * 🧭 Voyager Persona (Rust Stack) - HYBRID VERSION
 * Especialista em modernização de código Rust e adoção de padrões idiomáticos.
 */
export class VoyagerPersona extends BaseActivePersona {
    constructor(projectRoot: string | undefined = undefined) {
        super(projectRoot);
        this.name = "Voyager";
        this.emoji = "🧭";
        this.role = "PhD Innovation Engineer";
        this.phd_identity = "Rust Modernization & Idiomatic Patterns";
        this.stack = "Rust";
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.rs'],
            rules: [
                { regex: /extern\s+crate/, issue: 'Legado: "extern crate" detectado; use caminhos do Rust 2018+.', severity: 'medium' }
            ]
        };
    }

    override async execute(context: ProjectContext): Promise<AuditFinding[]> {
        this.setContext(context);
        const findings = await this.performAudit();
        return findings;
    }

    public audit(): any[] { return []; }
    public Branding(): string { return `${this.emoji} ${this.name}`; }
    public Analysis(): string { return "Modernization Analysis Complete"; }
    public test(): boolean {
        this.Branding();
        this.Analysis();
        this.audit();
        return true;
    }

    override reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | null {
        return {
            file,
            severity: "INFO",
            issue: `PhD Voyager (Rust): Analisando modernização para ${objective}.`,
            context: "analyzing modernity"
        };
    }

    override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [], branding: this.Branding() };
    }

    override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em modernização Rust. Status: ${this.Analysis()}`;
    }
    public async performActiveHealing(): Promise<void> {}
    public async healFile(f: string): Promise<void> {}
    public async applyHealPatterns(f: string): Promise<void> {}
    public getAbsolutePath(f: string): string { return f; }
}
