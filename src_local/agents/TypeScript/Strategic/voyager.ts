import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding } from "../../base.ts";
import type { ProjectContext } from "../../../core/types.ts";

/**
 * 🧭 Dr. Voyager — PhD in TypeScript Modernization & Innovation
 * Especialista em detecção de padrões legados, var, require() e CommonJS.
 */
export class VoyagerPersona extends BaseActivePersona {
    constructor(projectRoot: string | undefined = undefined) {
        super(projectRoot);
        this.name = "Voyager";
        this.emoji = "🧭";
        this.role = "PhD Innovation & Modernization Engineer";
        this.phd_identity = "TypeScript Modernization & Innovation";
        this.stack = "TypeScript";
    }

    override async execute(context: ProjectContext): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();

        if (this.hub) {
            // Modernity Intelligence: Find legacy patterns in the graph
            const legacyQuery = await this.hub.queryKnowledgeGraph("var", "high");
            
            // PhD Modernization Reasoning
            const reasoning = await this.hub.reason(`Generate a PhD modernization roadmap for a TypeScript system with ${legacyQuery.length} legacy patterns and current ESM status.`);

            findings.push({
                file: "Innovation Core", agent: this.name, role: this.role, emoji: this.emoji,
                issue: `Sovereign Voyager: Modernidade validada via Rust Hub. PhD Analysis: ${reasoning}`,
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Modernity Audit", match_count: 1
            } as any);
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.ts', '.tsx'],
            rules: [
                { regex: /\bvar\s+\w+/, issue: 'Legado: "var" — use "const" ou "let" para escopo seguro.', severity: 'high' },
                { regex: /\brequire\s*\(/, issue: 'CommonJS: require() — use ESM "import" para compatibilidade TypeScript.', severity: 'high' },
                { regex: /module\.exports/, issue: 'CommonJS: module.exports — use "export" ESM.', severity: 'high' },
                { regex: /arguments\b/, issue: 'Legado: "arguments" — use rest parameters (...args).', severity: 'medium' },
                { regex: /\.apply\(|\bcall\(/, issue: 'Legado: .apply()/.call() — use spread operator ou arrow functions.', severity: 'low' },
                { regex: /new\s+Promise\(.*resolve.*reject/, issue: 'Verboso: Promise constructor manual — prefira async/await.', severity: 'low' },
            ]
        };
    }

    reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        if (/\bvar\s+\w+|\brequire\s*\(/.test(content)) {
            return {
                file, severity: "HIGH",
                issue: `Débito Tecnológico: O objetivo '${objective}' exige modernidade. Em '${file}', padrões legados retardam a evolução da 'Orquestração de Inteligência Artificial'.`,
                context: "legacy patterns detected"
            };
        }
        return {
            file, severity: "INFO",
            issue: `PhD Voyager: Analisando modernidade de stack para ${objective}. Focando em ESM e eliminação de var.`,
            context: "analyzing stack modernity"
        };
    }

    /**
     * Cura Física Determinística (Legacy perform_active_healing logic).
     * Corrige padrões de silenciamento crítico em produção.
     */
    public override async performActiveHealing(blindSpots: string[]): Promise<number> {
        let healedCount = 0;
        // console used as fallback for legacy logger
        console.log(`✨ [Voyager] Iniciando Cura Ativa em ${blindSpots.length} pontos cegos...`);

        for (const spot of blindSpots) {
            if (await this.healFile(spot)) healedCount++;
        }
        return healedCount;
    }

    private async healFile(spot: string): Promise<boolean> {
        try {
            const fullPath = this.getAbsolutePath(spot);
            const fs = require('fs');
            if (!fs.existsSync(fullPath)) return false;

            const content = fs.readFileSync(fullPath, 'utf-8');
            const { result, changed } = this.applyHealPatterns(content, spot);

            if (changed) {
                fs.writeFileSync(fullPath, result, 'utf-8');
                console.log(`✨ [Voyager] Arquivo ${spot} curado com sucesso.`);
                return true;
            }
        } catch (e) {
            console.error(`❌ [Voyager] Falha ao curar ${spot}: ${e}`);
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
        const path = require('path');
        return path.isAbsolute(relPath) ? relPath : path.join(this.projectRoot || "", relPath);
    }

    override selfDiagnostic(): any {
        return {
            status: "Soberano",
            score: 100,
            details: "Navegador de inovação TS operando na fronteira PhD."
        };
    }

    override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em inovação e modernização de código TypeScript.`;
    }
}
