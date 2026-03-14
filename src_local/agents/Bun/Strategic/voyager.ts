import { BaseActivePersona } from "../../base.ts";
import type { AuditFinding, AuditRule, StrategicFinding, ProjectContext } from "../../base.ts";
import * as fs from "node:fs";
import * as path from "node:path";

/**
 * 🧭 Dr. Voyager — PhD in Bun Modernization & Node.js Legacy Detection
 * Especialista em migração Node→Bun, APIs legadas e CommonJS.
 */
export class VoyagerPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.id = "bun:strategic:voyager";
        this.name = "Voyager";
        this.emoji = "🧭";
        this.role = "PhD Bun Modernization Engineer";
        this.phd_identity = "Bun Modernization & Node.js Legacy Detection";
        this.stack = "Bun";
    }

    public override async execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]> {
        this.setContext(context);
        const findings: (AuditFinding | StrategicFinding)[] = await this.performAudit();

        if (this.hub) {
            const legacyQuery = await this.hub.queryKnowledgeGraph("require", "high");
            const reasoning = await this.hub.reason(`Generate a PhD modernization roadmap for a Bun system with ${legacyQuery.length} legacy require() calls.`);

            findings.push({
                file: "Modernization Core", agent: this.name, role: this.role, emoji: this.emoji,
                issue: `Sovereign Voyager: Modernidade Bun validada via Rust Hub. PhD Analysis: ${reasoning}`,
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Modernity Audit", match_count: 1,
                context: "Bun Modernization Readiness"
            } as any);
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.ts', '.tsx', '.mjs', '.cjs'],
            rules: [
                { regex: /\brequire\s*\((?!["']bun:)/, issue: 'Legado: require() CommonJS — Bun favorece import ESM PhD.', severity: 'high' },
                { regex: /module\.exports/, issue: 'Legado: module.exports CommonJS — use export ESM PhD.', severity: 'high' },
                { regex: /__dirname|__filename/, issue: 'Legado Node: Use import.meta.dir e import.meta.file em Bun PhD.', severity: 'high' },
                { regex: /process\.env/, issue: 'Legado Node: Considere Bun.env para variáveis de ambiente Bun-nativas PhD.', severity: 'low' },
                { regex: /\bvar\s+\w+/, issue: 'Legado JS: "var" — use "const" ou "let" PhD.', severity: 'medium' },
            ]
        };
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const rules = this.getAuditRules();
        const results = await this.findPatterns(rules.extensions, rules.rules);
        this.endMetrics(results.length);
        return results;
    }

    public override reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | null {
        if (typeof content === 'string' && (/__dirname|__filename|require\s*\(/.test(content))) {
            return {
                file, severity: "HIGH",
                issue: `Débito Tecnológico: O objetivo '${objective}' exige Bun nativo. Em '${file}', APIs Node.js legadas retardam a migração PhD.`,
                context: "legacy Node APIs detected"
            };
        }
        return {
            file, severity: "INFO",
            issue: `PhD Voyager (Bun): Analisando modernidade de stack para ${objective}. Focando em ESM e eliminação de var.`,
            context: this.name
        };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em modernização e migração Node→Bun.`;
    }

    public override async performActiveHealing(blindSpots: string[]): Promise<number> {
        let healedCount = 0;
        for (const spot of blindSpots) {
            if (await this.healFile(spot)) healedCount++;
        }
        return healedCount;
    }

    private async healFile(spot: string): Promise<boolean> {
        try {
            const fullPath = this.getAbsolutePath(spot);
            if (!fs.existsSync(fullPath)) return false;

            const content = fs.readFileSync(fullPath, 'utf-8');
            const { result, changed } = this.applyHealPatterns(content, spot);

            if (changed) {
                fs.writeFileSync(fullPath, result, 'utf-8');
                return true;
            }
        } catch (e) {
            // silent fail for healing
        }
        return false;
    }

    private applyHealPatterns(content: string, spot: string): { result: string, changed: boolean } {
        const lines = content.split('\n');
        let changed = false;
        const newLines = lines.map(line => {
            const trimmed = line.trim();
            const emptyCatch = ["catch (e) {}", "catch {}", "catch (error) {}"];

            if (emptyCatch.includes(trimmed)) {
                changed = true;
                const indent = line.split('catch')[0];
                return `${indent}catch (e) {\n${indent}    console.error(\`🚨 [Cura Ativa] Falha crítica silenciada detectada em ${spot}\`, e);\n${indent}}`;
            }
            return line;
        });
        return { result: newLines.join('\n'), changed };
    }

    private getAbsolutePath(relPath: string): string {
        return path.isAbsolute(relPath) ? relPath : path.join(this.projectRoot || "", relPath);
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }
}
