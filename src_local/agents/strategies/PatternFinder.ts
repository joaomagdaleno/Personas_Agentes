import * as path from 'node:path';
import winston from 'winston';
import { HubManagerGRPC } from "../../core/hub_manager_grpc.ts";

const logger = winston.child({ module: "PatternFinder" });

/**
 * 🦀 PatternFinder - PhD in Structural Auditing (gRPC Proxy).
 */
export class PatternFinder {
    constructor(private hubManager?: HubManagerGRPC) { }

    private normalizeToRustRegex(regex: RegExp | string): string {
        if (regex instanceof RegExp) {
            const flags = regex.flags;
            let prefix = "";
            if (flags.includes("i")) prefix += "(?i)";
            if (flags.includes("s")) prefix += "(?s)";
            if (flags.includes("m")) prefix += "(?m)";
            return prefix + regex.source;
        }
        return regex;
    }

    async find(context: Record<string, any>, extensions: string[], rules: any[], ignored: string[], agent: any): Promise<any[]> {
        if (this.hubManager && Object.keys(context).length > 5) {
            try {
                return await this.findBulk(context, [{
                    agent: agent.name,
                    role: agent.role,
                    emoji: agent.emoji,
                    stack: agent.stack,
                    extensions,
                    rules: rules.map(r => ({
                        regex: this.normalizeToRustRegex(r.regex),
                        issue: r.issue,
                        severity: r.severity
                    }))
                }], agent.projectRoot);
            } catch (err) {
                logger.warn("gRPC patterns audit failed, falling back to TypeScript", { error: err });
            }
        }

        const entries = Object.entries(context);
        const analyzable = entries.filter(([f, data]) => this.isAnalyzable(f, data, extensions, ignored));

        return analyzable.reduce((acc, [file, data]) => {
            const matches = this.scanFile(file, data.content || "", rules, agent);
            return acc.concat(matches);
        }, [] as any[]);
    }

    /**
     * 🦀 Executa auditoria em lote via Go Hub Proxy (Rust Mmap + RegexSet).
     */
    async findBulk(context: Record<string, any>, personaRuleSets: any[], projectRoot: string): Promise<any[]> {
        if (!this.hubManager) return [];

        const request = {
            file_paths: Object.keys(context),
            project_root: projectRoot || process.cwd(),
            persona_rules: personaRuleSets
        };

        try {
            return await this.hubManager.patterns(request);
        } catch (err) {
            logger.error("❌ [PatternFinder] gRPC patterns call failed:", err);
            return [];
        }
    }

    private isAnalyzable(f: string, data: any, extensions: string[], ignored: string[]): boolean {
        const hasExt = extensions.some(e => f.endsWith(e));
        const isIgnored = ignored.includes(path.basename(f));
        const isTest = data.component_type === "TEST";
        return hasExt && !isIgnored && !isTest;
    }

    private scanFile(file: string, content: string, rules: any[], agent: any): any[] {
        if (!content) return [];
        const results: any[] = [];

        rules.forEach(rule => {
            let regex = rule.regex instanceof RegExp ? rule.regex : new RegExp(rule.regex, "g");

            // matchAll requires global flag. If not present, we must create a new RegExp with it.
            if (!regex.global) {
                regex = new RegExp(regex.source, regex.flags + "g");
            }

            const matches = Array.from(content.matchAll(regex));
            const firstMatch = matches[0];

            if (firstMatch) {
                const matchIndex = firstMatch.index ?? 0;
                const line = content.substring(0, matchIndex).split("\n").length;
                results.push({
                    file,
                    agent: agent.name,
                    role: agent.role,
                    emoji: agent.emoji,
                    issue: rule.issue,
                    severity: rule.severity,
                    stack: agent.stack,
                    evidence: (firstMatch[0] || "").substring(0, 100),
                    match_count: matches.length,
                    line_number: line
                });
            }
        });
        return results;
    }
}
