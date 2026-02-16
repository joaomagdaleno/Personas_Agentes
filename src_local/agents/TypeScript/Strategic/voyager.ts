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

        const auditRules = [
            { regex: '\\bvar\\s+\\w+', issue: 'Legado: "var" — use "const" ou "let" para escopo seguro.', severity: 'high' },
            { regex: '\\brequire\\s*\\(', issue: 'CommonJS: require() — use ESM "import" para compatibilidade TypeScript.', severity: 'high' },
            { regex: 'module\\.exports', issue: 'CommonJS: module.exports — use "export" ESM.', severity: 'high' },
            { regex: 'arguments\\b', issue: 'Legado: "arguments" — use rest parameters (...args).', severity: 'medium' },
            { regex: '\\.apply\\(|\\bcall\\(', issue: 'Legado: .apply()/.call() — use spread operator ou arrow functions.', severity: 'low' },
            { regex: 'new\\s+Promise\\(.*resolve.*reject', issue: 'Verboso: Promise constructor manual — prefira async/await.', severity: 'low' },
        ];

        const results: any[] = [];
        for (const rule of auditRules) {
            const regex = new RegExp(rule.regex, 'g');
            for (const [filePath, content] of Object.entries(this.contextData)) {
                if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
                    for (const match of (content as string).matchAll(regex)) {
                        results.push({ file: filePath, issue: rule.issue, severity: rule.severity, evidence: match[0], persona: this.name });
                    }
                }
            }
        }

        const duration = (Date.now() - start) / 1000;
        logger.info(`[${this.name}] Auditoria concluída em ${duration.toFixed(4)}s. Achados: ${results.length}`);
        return results;
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
            try {
                const fullPath = this.getAbsolutePath(spot);
                const fs = require('fs');
                if (!fs.existsSync(fullPath)) continue;

                const content = fs.readFileSync(fullPath, 'utf-8');
                const lines = content.split('\n');
                let changed = false;
                const newLines: string[] = [];

                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i];
                    const trimmed = line.trim();

                    // Detecta catch { /* empty */ } ou try/catch sem log
                    if (trimmed === "catch (e) {}" || trimmed === "catch {}" || (trimmed === "catch (error) {}")) {
                        const indent = line.split('catch')[0];
                        newLines.push(`${indent}catch (e) {`);
                        newLines.push(`${indent}    logger.error(\`🚨 [Cura Ativa] Falha crítica silenciada detectada em ${spot}\`, e);`);
                        newLines.push(`${indent}}`);
                        changed = true;
                    } else {
                        newLines.push(line);
                    }
                }

                if (changed) {
                    fs.writeFileSync(fullPath, newLines.join('\n'), 'utf-8');
                    logger.info(`✨ [Voyager] Arquivo ${spot} curado com sucesso.`);
                    healedCount++;
                }
            } catch (e) {
                logger.error(`❌ [Voyager] Falha ao curar ${spot}: ${e}`);
            }
        }
        return healedCount;
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
