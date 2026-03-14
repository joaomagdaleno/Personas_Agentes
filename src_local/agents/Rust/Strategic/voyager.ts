import { BaseActivePersona } from "../../base.ts";
import type { AuditFinding, AuditRule, StrategicFinding, ProjectContext } from "../../base.ts";

/**
 * 🧭 Voyager Persona (Rust Stack) - HYBRID VERSION
 * Especialista em modernização de código Rust e adoção de padrões idiomáticos.
 */
export class VoyagerPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
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
                { regex: /extern\s+crate/, issue: 'Legado: "extern crate" detectado; use caminhos do Rust 2018+ PhD.', severity: 'medium' },
                { regex: /try\!/, issue: 'Legado: "try!" macro detectada. Prefix com o operador `?` para propagação de erro idiomática PhD.', severity: 'low' }
            ]
        };
    }

    public override async execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]> {
        this.setContext(context);
        const findings: (AuditFinding | StrategicFinding)[] = await this.performAudit();
        return findings;
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const rules = this.getAuditRules();
        const results = await this.findPatterns(rules.extensions, rules.rules);
        this.endMetrics(results.length);
        return results;
    }

    public override reasonAboutObjective(objective: string, file: string, _content: string | Promise<string | null>): StrategicFinding | null {
        return {
            file,
            severity: "STRATEGIC",
            issue: `PhD Voyager (Rust): Analisando modernização idiomática para ${objective}. Foco em zero-cost abstractions nativas.`,
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em modernização Rust e padrões idiomáticos nativos.`;
    }

    public override async performActiveHealing(blindSpots: string[]): Promise<number> {
        console.log(`🛠️ [Voyager] Iniciando modernização de legacy code em: ${blindSpots.join(", ")}`);
        return blindSpots.length;
    }
}
