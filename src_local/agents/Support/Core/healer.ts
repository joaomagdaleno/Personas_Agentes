import winston from 'winston';
import * as fs from 'fs';
import { Path } from "../../../core/path_utils.ts";
import { BaseActivePersona } from "../../base_active_persona.ts";
import { CognitiveEngine } from "../../../utils/cognitive_engine.ts";
import { Orchestrator } from "../../../core/orchestrator.ts";
import { ObfuscationCleanerEngine } from "../Security/obfuscation_cleaner_engine.ts";
import * as ts from 'typescript';
import { HealerPromptBuilder } from "./healer_prompt_builder.ts";
import { PatchManager } from "./patch_manager.ts";

/**
 * 🩹 Agente Healer (PhD in Software Reparation).
 * Usa o CognitiveEngine para gerar patches de correção e validar a cura.
 */
export class HealerPersona extends BaseActivePersona {
    private brain: CognitiveEngine;
    private cleaner: ObfuscationCleanerEngine;
    private patcher: PatchManager;

    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Healer";
        this.role = "PhD Software Healer";
        this.emoji = "🩹";
        this.stack = "Correction";
        this.brain = new CognitiveEngine();
        this.cleaner = new ObfuscationCleanerEngine();
        this.patcher = new PatchManager(projectRoot || process.cwd());
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

        if (!this.isValidForHealing(finding)) return false;

        winston.info(`🩹 [Healer] Iniciando protocolo de cura em: ${filePath}`);

        const currentContent = this.getCurrentContent(filePath);
        const contextPrompt = this.getContextPrompt(finding);
        const prompt = HealerPromptBuilder.buildHealPrompt(filePath, currentContent, issue, contextPrompt);

        const suggestion = await this.brain.reason(prompt);
        return this.processSuggestion(suggestion, filePath, issue, orchestrator);
    }

    private isValidForHealing(finding: any): boolean {
        const filePath = finding.file;
        if (!filePath || !finding.issue || !this.projectRoot) return false;

        const fullPath = new Path(this.projectRoot).join(filePath);
        if (!fs.existsSync(fullPath.toString()) && finding.type !== "DISPARITY") {
            winston.error(`🩹 [Healer] Arquivo não encontrado para cura: ${filePath}`);
            return false;
        }
        return true;
    }

    private getCurrentContent(filePath: string): string {
        const fullPath = new Path(this.projectRoot!).join(filePath);
        return fs.existsSync(fullPath.toString()) ? fs.readFileSync(fullPath.toString(), 'utf-8') : "// Novo arquivo migrado\n";
    }

    private getContextPrompt(finding: any): string {
        if (finding.type === "DISPARITY" && finding.meta?.legacyPath) {
            const legacyFullPath = new Path(this.projectRoot!).join(finding.meta.legacyPath);
            if (fs.existsSync(legacyFullPath.toString())) {
                const legacyContent = fs.readFileSync(legacyFullPath.toString(), 'utf-8');
                return HealerPromptBuilder.buildDisparityContext(legacyContent, finding.meta.unit.name, finding.meta.unit.type);
            }
        }
        return "";
    }

    private async processSuggestion(suggestion: string | null, filePath: string, issue: string, orchestrator: Orchestrator): Promise<boolean> {
        if (!suggestion) return false;
        const codeMatch = suggestion.match(/```(?:typescript|ts|javascript|js|python)?\n([\s\S]*?)\n```/);
        if (codeMatch && codeMatch[1]) {
            return this.patcher.applyAndValidate(filePath, codeMatch[1], issue, orchestrator);
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
