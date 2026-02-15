import { BaseActivePersona } from "./base_persona";
import winston from "winston";

const logger = winston.loggers.get('default_logger') || winston;

/**
 * 🎭 SchemaPersona (PhD-on-Demand).
 * Instancia personas a partir do PersonaManifest sem precisar de arquivos individuais.
 */
export class SchemaPersona extends BaseActivePersona {
    private rules: any[];
    private reasonTemplate: string | null;

    constructor(metadata: any, projectRoot: string | null = null) {
        super(projectRoot);
        this.name = metadata.name;
        this.emoji = metadata.emoji;
        this.role = metadata.role;
        this.stack = metadata.stack;
        this.rules = metadata.rules || [];
        this.reasonTemplate = metadata.reasonTemplate;
    }

    async performAudit(): Promise<any[]> {
        const startT = Date.now();
        logger.info(`🎭 [${this.name}] Iniciando auditoria dinâmica (${this.stack})...`);

        const results: any[] = [];
        const extMap: Record<string, string[]> = {
            "Flutter": [".dart"],
            "Kotlin": [".kt"],
            "TypeScript": [".ts", ".tsx"],
            "Bun": [".ts", ".tsx", ".toml"],
        };
        const extensions = extMap[this.stack] || [".ts", ".py"];

        for (const rule of this.rules) {
            const ruleResults = await this.findPatternsSimple(extensions, rule);
            results.push(...ruleResults);
        }

        const duration = (Date.now() - startT) / 1000;
        logger.info(`🎭 [${this.name}] Auditoria concluída em ${duration.toFixed(4)}s. Achados: ${results.length}`);
        return results;
    }

    private async findPatternsSimple(extensions: string[], rule: any): Promise<any[]> {
        const findings: any[] = [];
        const regex = new RegExp(rule.regex, 'g');

        for (const [filePath, content] of Object.entries(this.contextData)) {
            if (extensions.some(ext => filePath.endsWith(ext))) {
                const matches = content.matchAll(regex);
                for (const match of (matches as any)) {
                    findings.push({
                        file: filePath,
                        issue: rule.issue,
                        severity: rule.severity,
                        evidence: match[0],
                        persona: this.name
                    });
                }
            }
        }
        return findings;
    }

    async reasonAboutObjective(objective: string, file: string, content: string): Promise<any | null> {
        if (!this.reasonTemplate) return null;

        const regex = new RegExp(this.rules[0]?.regex || '.*');
        if (regex.test(content)) {
            const reason = this.reasonTemplate
                .replace('{objective}', objective)
                .replace('{file}', file);

            return {
                file: file,
                issue: reason,
                severity: "HIGH",
                persona: this.name
            };
        }

        return null;
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, ${this.role} especializado em ${this.stack}.`;
    }
}
