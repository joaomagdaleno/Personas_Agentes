import { BaseActivePersona } from "../../base_persona.ts";
import winston from "winston";

const logger = winston.child({ module: "TS_Voyager" });

/**
 * 🧭 Dr. Voyager — PhD in TypeScript Modernization & Innovation
 * Especialista em detecção de padrões legados, var, require() e CommonJS.
 */
export class VoyagerPersona extends BaseActivePersona {
    constructor(projectRoot: string | null = null) {
        super(projectRoot);
        this.name = "Voyager";
        this.emoji = "🧭";
        this.role = "PhD Innovation & Modernization Engineer";
        this.stack = "TypeScript";
    }

    async performAudit(): Promise<any[]> {
        const start = Date.now();
        logger.info(`[${this.name}] Analisando Modernidade TypeScript...`);

        const results: any[] = [];
        Object.entries(this.contextData).forEach(([file, content]) => {
            if (file.endsWith('.ts') || file.endsWith('.tsx')) {
                results.push(...this.auditSingleFile(file, content));
            }
        });

        const duration = (Date.now() - start) / 1000;
        logger.info(`[${this.name}] Auditoria concluída em ${duration.toFixed(4)}s. Achados: ${results.length}`);
        return results;
    }

    private auditSingleFile(file: string, content: string): any[] {
        const rules = [
            { regex: '\\bvar\\s+\\w+', issue: 'Legado: "var" — use "const" ou "let" para escopo seguro.', severity: 'high' },
            { regex: '\\brequire\\s*\\(', issue: 'CommonJS: require() — use ESM "import" para compatibilidade TypeScript.', severity: 'high' },
            { regex: 'module\\.exports', issue: 'CommonJS: module.exports — use "export" ESM.', severity: 'high' },
            { regex: 'arguments\\b', issue: 'Legado: "arguments" — use rest parameters (...args).', severity: 'medium' },
            { regex: '\\.apply\\(|\\bcall\\(', issue: 'Legado: .apply()/.call() — use spread operator ou arrow functions.', severity: 'low' },
            { regex: 'new\\s+Promise\\(.*resolve.*reject', issue: 'Verboso: Promise constructor manual — prefira async/await.', severity: 'low' },
        ];

        return rules.flatMap(rule => {
            const matches = [...content.matchAll(new RegExp(rule.regex, 'g'))];
            return matches.map(m => ({ file, issue: rule.issue, severity: rule.severity, evidence: m[0], persona: this.name }));
        });
    }

    async reasonAboutObjective(objective: string, file: string, content: string): Promise<any | null> {
        if (/\bvar\s+\w+|\brequire\s*\(/.test(content)) {
            return {
                file, severity: "HIGH", persona: this.name,
                issue: `Débito Tecnológico: O objetivo '${objective}' exige modernidade. Em '${file}', padrões legados retardam a evolução da 'Orquestração de Inteligência Artificial'.`
            };
        }
        return {
            file, severity: "INFO", persona: this.name,
            issue: `PhD Voyager: Analisando modernidade de stack para ${objective}. Focando em ESM e eliminação de var.`
        };
    }

    /**
     * Cura Física Determinística (Legacy perform_active_healing logic).
     * Corrige padrões de silenciamento crítico em produção.
     */
    public async performActiveHealing(blindSpots: string[]): Promise<number> {
        let healedCount = 0;
        logger.info(`✨ [Voyager] Iniciando Cura Ativa em ${blindSpots.length} pontos cegos...`);

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
                logger.info(`✨ [Voyager] Arquivo ${spot} curado com sucesso.`);
                return true;
            }
        } catch (e) {
            logger.error(`❌ [Voyager] Falha ao curar ${spot}: ${e}`);
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
                return `${indent}catch (e) {\n${indent}    logger.error(\`🚨 [Cura Ativa] Falha crítica silenciada detectada em ${spot}\`, e);\n${indent}}`;
            }
            return line;
        });
        return { result: newLines.join('\n'), changed };
    }

    private getAbsolutePath(relPath: string): string {
        const path = require('path');
        return path.isAbsolute(relPath) ? relPath : path.join(this.projectRoot || "", relPath);
    }

    selfDiagnostic(): any {
        return {
            status: "Soberano",
            score: 100,
            details: "Navegador de inovação TS operando na fronteira PhD."
        };
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em inovação e modernização de código TypeScript.`;
    }
}
