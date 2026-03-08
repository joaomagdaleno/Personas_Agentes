import * as path from 'node:path';
import * as cp from 'node:child_process';
import * as fs from 'node:fs';
import winston from 'winston';

const logger = winston.child({ module: "PatternFinder" });

export class PatternFinder {
    private static BINARY_PATH = path.resolve(process.cwd(), "src_native/analyzer/target/release/analyzer.exe");

    static find(context: Record<string, any>, extensions: string[], rules: any[], ignored: string[], agent: any): any[] {
        if (Object.keys(context).length > 5 && fs.existsSync(this.BINARY_PATH)) {
            try {
                return this.findBulk(context, [{
                    agent: agent.name,
                    role: agent.role,
                    emoji: agent.emoji,
                    stack: agent.stack,
                    extensions,
                    rules: rules.map(r => ({
                        regex: r.regex instanceof RegExp ? r.regex.source : r.regex,
                        issue: r.issue,
                        severity: r.severity
                    }))
                }], agent.projectRoot);
            } catch (err) {
                logger.warn("Rust audit failed, falling back to TypeScript", { error: err });
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
     * 🦀 Executa auditoria em lote para MÚLTIPLAS personas e TODOS os arquivos em UMA única passada via Mmap no Rust.
     */
    static findBulk(context: Record<string, any>, personaRuleSets: any[], projectRoot: string): any[] {
        if (!fs.existsSync(this.BINARY_PATH)) return [];

        const request = {
            file_paths: Object.keys(context),
            project_root: projectRoot || process.cwd(),
            persona_rules: personaRuleSets
        };

        const tmpFile = path.join(process.cwd(), `tmp_audit_${Date.now()}.json`);
        fs.writeFileSync(tmpFile, JSON.stringify(request));

        try {
            const output = cp.execSync(`${this.BINARY_PATH} patterns ${tmpFile}`, {
                encoding: 'utf8',
                maxBuffer: 100 * 1024 * 1024
            });
            return JSON.parse(output);
        } finally {
            if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
        }
    }

    private static isAnalyzable(f: string, data: any, extensions: string[], ignored: string[]): boolean {
        const hasExt = extensions.some(e => f.endsWith(e));
        const isIgnored = ignored.includes(path.basename(f));
        const isTest = data.component_type === "TEST";
        return hasExt && !isIgnored && !isTest;
    }

    private static scanFile(file: string, content: string, rules: any[], agent: any): any[] {
        if (!content) return [];
        const results: any[] = [];

        rules.forEach(rule => {
            const regex = rule.regex instanceof RegExp ? rule.regex : new RegExp(rule.regex, 'g');
            const matches = content.matchAll(regex);
            for (const match of matches) {
                results.push({
                    file,
                    agent: agent.name,
                    role: agent.role,
                    emoji: agent.emoji,
                    issue: rule.issue,
                    severity: rule.severity,
                    stack: agent.stack,
                    evidence: match[0].substring(0, 100)
                });
            }
        });
        return results;
    }
}
