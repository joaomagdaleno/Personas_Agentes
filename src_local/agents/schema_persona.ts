import { BaseActivePersona } from "./base.ts";
import type { AuditRule, StrategicFinding } from "./base.ts";;
import winston from "winston";

const logger = winston.loggers.get('default_logger') || winston;

/**
 * 🎭 SchemaPersona (PhD-on-Demand).
 * Instancia personas a partir do PersonaManifest sem precisar de arquivos individuais.
 */
export class SchemaPersona extends BaseActivePersona {
    private personaRules: any[];
    private reasonTemplate: string | null;

    constructor(metadata: any, projectRoot: string | null = null) {
        super(projectRoot || undefined);
        this.name = metadata.name;
        this.emoji = metadata.emoji;
        this.role = metadata.role;
        this.stack = metadata.stack;
        this.personaRules = metadata.rules || [];
        this.reasonTemplate = metadata.reasonTemplate;
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        const extMap: Record<string, string[]> = {
            "Flutter": [".dart"],
            "Kotlin": [".kt"],
            "TypeScript": [".ts", ".tsx"],
            "Bun": [".ts", ".tsx", ".toml"],
            "Python": [".py"],
            "Go": [".go"],
        };
        const extensions = extMap[this.stack] || [".ts", ".tsx", ".py", ".js"];

        return {
            extensions,
            rules: this.personaRules.map(r => ({
                regex: typeof r.regex === 'string' ? new RegExp(r.regex, 'i') : r.regex,
                issue: r.issue,
                severity: r.severity
            }))
        };
    }

    reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (!this.reasonTemplate || typeof content !== 'string') return null;

        const regex = new RegExp(this.personaRules[0]?.regex || '.*', 'i');
        if (regex.test(content)) {
            const reason = this.reasonTemplate
                .replace('{objective}', objective)
                .replace('{file}', file);

            return {
                file: file,
                issue: reason,
                severity: "HIGH",
                context: `Dynamic rule match: ${regex.source}`
            };
        }

        return null;
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, ${this.role} especializado em ${this.stack}.`;
    }
}
