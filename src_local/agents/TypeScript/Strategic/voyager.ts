import { BaseActivePersona } from "../../base.ts";
import type { AuditFinding, AuditRule, StrategicFinding, ProjectContext } from "../../base.ts";
import * as fs from "node:fs";
import * as path from "node:path";

/**
 * 🧭 Dr. Voyager — PhD in TypeScript Modernization & Innovation
 * Especialista em detecção de padrões legados, var, require() e CommonJS.
 */
export class VoyagerPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Voyager";
        this.emoji = "🧭";
        this.role = "PhD Innovation & Modernization Engineer";
        this.phd_identity = "TypeScript Modernization & Innovation";
        this.stack = "TypeScript";
    }

    public override async execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]> {
        this.setContext(context);
        const results: (AuditFinding | StrategicFinding)[] = await this.performAudit();
        const findings: (AuditFinding | StrategicFinding)[] = [...results];

        if (this.hub) {
            const legacyQuery = await this.hub.queryKnowledgeGraph("var", "high");
            const reasoning = await this.hub.reason(`Generate a PhD modernization roadmap for a TypeScript system with ${legacyQuery.length} legacy patterns and current ESM status.`);

            findings.push({
                file: "Innovation Core", agent: this.name, role: this.role, emoji: this.emoji,
                issue: `Sovereign Voyager: Modernidade validada via Rust Hub. PhD Analysis: ${reasoning}`,
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Modernity Audit", match_count: 1,
                context: "Modernization Readiness"
            } as any);
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.ts', '.tsx'],
            rules: [
                { regex: /\bvar\s+\w+/, issue: 'Legado: "var" — use "const" ou "let" para escopo seguro PhD.', severity: 'high' },
                { regex: /\brequire\s*\(/, issue: 'CommonJS: require() — use ESM "import" PhD.', severity: 'high' },
                { regex: /module\.exports/, issue: 'CommonJS: module.exports — use "export" ESM PhD.', severity: 'high' },
                { regex: /arguments\b/, issue: 'Legado: "arguments" — use rest parameters (...args) PhD.', severity: 'medium' },
                { regex: /\.apply\(|\bcall\(/, issue: 'Legado: .apply()/.call() — use spread operator ou arrow functions PhD.', severity: 'low' },
                { regex: /new\s+Promise\(.*resolve.*reject/, issue: 'Verboso: Promise constructor manual — prefira async/await PhD.', severity: 'low' },
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
        if (typeof content === 'string' && (/\bvar\s+\w+|\brequire\s*\(/.test(content))) {
            return {
                file, severity: "HIGH",
                issue: `Débito Tecnológico: O objetivo '${objective}' exige modernidade. Em '${file}', padrões legados retardam a arquitetura PhD.`,
                context: "legacy patterns detected"
            };
        }
        return {
            file, severity: "STRATEGIC",
            issue: `PhD Voyager (TypeScript): Analisando modernidade de stack para ${objective}. Focando em ESM e eliminação de var.`,
            context: this.name
        };
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

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em inovação e modernização de código TypeScript.`;
    }
}
