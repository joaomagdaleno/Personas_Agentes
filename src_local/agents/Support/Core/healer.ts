import winston from 'winston';
import * as fs from 'fs';
import { Path } from "../../../core/path_utils.ts";
import { BaseActivePersona } from "../../base_active_persona.ts";
import { CognitiveEngine } from "../../../utils/cognitive_engine.ts";
import { Orchestrator } from "../../../core/orchestrator.ts";
import { ObfuscationCleanerEngine } from "../Security/obfuscation_cleaner_engine.ts";
import * as ts from 'typescript';

/**
 * 🩹 Agente Healer (PhD in Software Reparation).
 * Usa o CognitiveEngine para gerar patches de correção e validar a cura.
 */
export class HealerPersona extends BaseActivePersona {
    private brain: CognitiveEngine;
    private cleaner: ObfuscationCleanerEngine;

    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Healer";
        this.role = "PhD Software Healer";
        this.emoji = "🩹";
        this.stack = "Correction";
        this.brain = new CognitiveEngine();
        this.cleaner = new ObfuscationCleanerEngine();
    }

    async performAudit(): Promise<any[]> {
        // Healer não audita proativamente, ele é invocado para cura.
        return [];
    }

    getSystemPrompt(): string {
        return "Você é o Dr. Healer, focado em correções de código seguras e minimalistas.";
    }

    async reasonAboutObjective(objective: string, filePath: string, content: string): Promise<string | null> {
        return null;
    }

    /**
     * Tenta curar uma fragilidade específica.
     */
    async healFinding(finding: any, orchestrator: Orchestrator): Promise<boolean> {
        const filePath = finding.file;
        const issue = finding.issue;

        if (!filePath || !issue || !this.projectRoot) return false;

        const fullPath = new Path(this.projectRoot).join(filePath);
        if (!fs.existsSync(fullPath.toString()) && finding.type !== "DISPARITY") {
            winston.error(`🩹 [Healer] Arquivo não encontrado para cura: ${filePath}`);
            return false;
        }

        winston.info(`🩹 [Healer] Iniciando protocolo de cura em: ${filePath}`);

        // Se o arquivo atual não existir (DISPARITY crítico), tentamos criar
        const content = fs.existsSync(fullPath.toString()) ? fs.readFileSync(fullPath.toString(), 'utf-8') : "// Novo arquivo migrado\n";

        let contextPrompt = "";
        if (finding.type === "DISPARITY" && finding.meta?.legacyPath) {
            const legacyFullPath = new Path(this.projectRoot).join(finding.meta.legacyPath);
            if (fs.existsSync(legacyFullPath.toString())) {
                const legacyContent = fs.readFileSync(legacyFullPath.toString(), 'utf-8');
                contextPrompt = `
                CONTEXTO DO LEGADO (Código original que deve ser migrado):
                \`\`\`
                ${legacyContent}
                \`\`\`
                FOCO NA UNIDADE: ${finding.meta.unit.name} (${finding.meta.unit.type})
                `;
            }
        }

        const prompt = `
        Você é o Dr. Healer, PhD em Reparação e Migração de Software.
        Sua missão é integrar a lógica que falta ou corrigir a fragilidade.
        
        ARQUIVO ALVO: ${filePath}
        CÓDIGO ATUAL NO PROJETO:
        \`\`\`typescript
        ${content}
        \`\`\`
        
        PROBLEMA IDENTIFICADO: ${issue}
        ${contextPrompt}
        
        REQUISITO: Forneça o código completo (merged) do arquivo alvo, garantindo que a lógica do legado seja implementada com as melhores práticas de TypeScript.
        Forneça APENAS o código completo rodeado por triplos backticks.
        `;

        const suggestion = await this.brain.reason(prompt);
        if (!suggestion) return false;

        const codeMatch = suggestion.match(/```(?:typescript|ts|javascript|js|python)?\n([\s\S]*?)\n```/);
        if (codeMatch && codeMatch[1]) {
            const newContent = codeMatch[1];
            const backupPath = fullPath.toString() + ".bak";

            // Backup
            if (fs.existsSync(fullPath.toString())) fs.renameSync(fullPath.toString(), backupPath);

            try {
                fs.writeFileSync(fullPath.toString(), newContent, 'utf-8');
                winston.info(`✨ [Healer] Remendo aplicado em ${filePath}. Validando...`);

                // Validação Cruzada
                const auditResults = await orchestrator.auditEngine.runStrategicAudit(orchestrator, `Cura de arquivo: ${filePath}`);

                const stillBroken = auditResults[0].some((f: any) => f.file === filePath && f.issue === issue);

                if (!stillBroken) {
                    winston.info(`✅ [Healer] Cura CONFIRMADA em ${filePath}.`);
                    if (fs.existsSync(backupPath)) fs.unlinkSync(backupPath);
                    return true;
                } else {
                    winston.warn(`❌ [Healer] Cura REPROVADA (problema persiste). Revertendo...`);
                    if (fs.existsSync(backupPath)) fs.renameSync(backupPath, fullPath.toString());
                    return false;
                }
            } catch (err) {
                winston.error(`❌ [Healer] Erro fatal durante a aplicação da cura: ${err}`);
                if (fs.existsSync(backupPath)) fs.renameSync(backupPath, fullPath.toString());
                return false;
            }
        }

        return false;
    }

    /**
     * Limpa ofuscações em um arquivo.
     */
    async cleanFile(filePath: string): Promise<boolean> {
        if (!this.projectRoot) return false;
        const fullPath = new Path(this.projectRoot).join(filePath).toString();
        if (!fs.existsSync(fullPath)) return false;

        const content = fs.readFileSync(fullPath, 'utf-8');
        const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);
        const replacements = this.cleaner.collectReplacements(sourceFile);

        if (replacements.length > 0) {
            winston.info(`🩹 [Healer] Limpando ${replacements.length} ofuscações em ${filePath}`);
            const cleaned = this.cleaner.applyClean(content, replacements);
            fs.writeFileSync(fullPath, cleaned, 'utf-8');
            return true;
        }
        return false;
    }
}
