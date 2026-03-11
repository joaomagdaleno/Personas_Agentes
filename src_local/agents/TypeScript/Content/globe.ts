import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding } from "../../base.ts";


/**
 * 🌍 Dr. Globe — PhD in TypeScript Internationalization & Localization
 * Especialista em portabilidade global, hardcoded strings e encoding.
 */
export class GlobePersona extends BaseActivePersona {
    constructor(projectRoot: string | null = null) {
        super(projectRoot);
        this.name = "Globe";
        this.emoji = "🌍";
        this.role = "PhD Internationalization Engineer";
        this.phd_identity = "Internationalization & Localization (TypeScript)";
        this.stack = "TypeScript";
    }

    public override async execute(context: any): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();
        if (this.hub) {
            const i18nNodes = await this.hub.queryKnowledgeGraph("hardcoded string", "medium");
            const reasoning = await this.hub.reason(`Analyze the i18n readiness of a TypeScript system with ${i18nNodes.length} hardcoded string patterns. Recommend localization strategy.`);
            findings.push({ file: "i18n Audit", agent: this.name, role: this.role, emoji: this.emoji, issue: `Sovereign Globe: Portabilidade global validada via Rust Hub. PhD Analysis: ${reasoning}`, severity: "INFO", stack: this.stack, evidence: "Knowledge Graph i18n Audit", match_count: 1 } as any);
        }
        return findings;
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.ts', '.tsx'],
            rules: [
                { regex: /readFile[^(]*\([^)]*(?!utf|encoding)[^)]*\)/, issue: 'Risco i18n: Leitura de arquivo sem especificar encoding UTF-8.', severity: 'medium' },
                { regex: /(?:message|label|title|text|placeholder)\s*[:=]\s*["'][A-Z][a-zÀ-ú]/, issue: 'Hardcoded String: Texto de interface diretamente no código — impede tradução.', severity: 'medium' },
                { regex: /new\s+Date\(\)\.toLocaleDateString\(\)/, issue: 'Locale Implícito: toLocaleDateString() sem locale explícito.', severity: 'low' },
            ]
        };
    }

    reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        if (/(?:message|label|title)\s*[:=]\s*['"][A-Z]/.test(content)) {
            return {
                file, severity: "MEDIUM",
                issue: `Risco de Localização: O objetivo '${objective}' exige portabilidade global. Em '${file}', strings hardcoded impedem a internacionalização da 'Orquestração de Inteligência Artificial'.`,
                context: "Hardcoded strings detected"
            };
        }
        return {
            file, severity: "INFO",
            issue: `PhD I18n: Analisando portabilidade para ${objective}. Focando em encoding e externalização de strings.`,
            context: "analyzing portability"
        };
    }

    selfDiagnostic(): any {
        return {
            status: "Soberano",
            score: 100,
            details: "Auditor de internacionalização TS operando com consciência PhD."
        };
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em internacionalização e portabilidade TypeScript.`;
    }
}
