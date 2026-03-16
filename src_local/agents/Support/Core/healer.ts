import winston from 'winston';
import * as fs from 'fs';
import { Path } from "../../../core/path_utils.ts";
import type { AuditFinding, IAgent, ProjectContext } from "../../../core/types.ts";
import { CognitiveEngine } from "../../../utils/cognitive_engine.ts";
import { Orchestrator } from "../../../core/orchestrator.ts";
import { ObfuscationCleanerEngine } from "../Security/obfuscation_cleaner_engine.ts";
import { HealerPromptBuilder } from "./healer_prompt_builder.ts";
import { PatchManager } from "./patch_manager.ts";
import { HubManagerGRPC } from "../../../core/hub_manager_grpc.ts";

/**
 * 🩹 Agente Healer (PhD in Software Reparation).
 */
export class HealerPersona implements IAgent {
    public readonly id: string = "healer";
    public readonly role: string = "PhD Software Healer";
    public readonly stack: string = "TypeScript";
    public readonly name: string = "Healer";
    public readonly emoji: string = "🩹";
    public readonly category: string = "Security";
    private projectRoot: string;
    private brain: CognitiveEngine;
    private cleaner: ObfuscationCleanerEngine;
    private patcher: PatchManager;

    constructor(projectRoot?: string, private hubManager?: HubManagerGRPC) {
        this.projectRoot = projectRoot || process.cwd();
        this.brain = new CognitiveEngine();
        this.cleaner = new ObfuscationCleanerEngine(this.hubManager);
        this.patcher = new PatchManager(this.projectRoot);
    }

    async execute(context: ProjectContext): Promise<any> {
        // Implementação padrão se chamado como agente autônomo
        return [];
    }

    getSystemPrompt(): string {
        return "Você é o Dr. Healer, focado em correções de código seguras e minimalistas.";
    }

    async healFinding(finding: AuditFinding, orchestrator: Orchestrator): Promise<boolean> {
        if (!this.isValidForHealing(finding)) return false;

        const filePath = finding.file || finding.path;
        if (!filePath) {
            winston.warn("🩹 [Healer] Finding sem arquivo ou caminho associado. Ignorando.");
            return false;
        }
        winston.info(`🩹 [Healer] Iniciando protocolo de cura em: ${filePath}`);

        // Phase 7: Sovereign Brain TF-IDF Context injection
        let architecturalContext = "";
        try {
            const ctxArgs = await orchestrator.hubManager.getContext(filePath);
            if (ctxArgs && ctxArgs.length > 0) {
                architecturalContext = `\n[SOVEREIGN BRAIN TF-IDF GUIDANCE]\nDependencies & Referencers around this file in the knowledge graph:\n${ctxArgs.join('\n')}\n`;
                winston.info(`🧠 [Brain] Injetou ${ctxArgs.length} insights arquiteturais no Healer Prompt.`);
            }
        } catch (e) {
            // Ignore if brain fails
        }

        const plan = {
            issueDescription: finding.issue,
            filePath: filePath,
            fileContent: this.getCurrentContent(filePath!),
            context: this.getContextPrompt(finding) + "\n" + architecturalContext,
            failureContext: finding.evidence || ""
        };

        const suggestion = await orchestrator.hubManager.executeHealing(plan);
        return this.processSuggestion(suggestion as string | null, filePath, finding.issue, orchestrator);
    }

    private isValidForHealing(finding: AuditFinding): boolean {
        if (!finding.file || !finding.issue || !this.projectRoot) return false;
        return this.checkFileExistence(finding);
    }

    private checkFileExistence(finding: AuditFinding): boolean {
        const fullPath = new Path(this.projectRoot!).join(finding.file!).toString();
        if (fs.existsSync(fullPath) || finding.type === "DISPARITY") return true;

        winston.error(`🩹 [Healer] Arquivo não encontrado para cura: ${finding.file}`);
        return false;
    }

    private getCurrentContent(filePath: string): string {
        const fullPath = new Path(this.projectRoot!).join(filePath).toString();
        return fs.existsSync(fullPath) ? fs.readFileSync(fullPath, 'utf-8') : "// Novo arquivo migrado\n";
    }

    private getContextPrompt(finding: AuditFinding): string {
        const meta = finding.meta as Record<string, any> || {};
        if (finding.type !== "DISPARITY" || !meta.legacyPath) return "";
        return this.getLegacyContext(meta.legacyPath as string, meta.unit);
    }

    private getLegacyContext(legacyPath: string, unit: any): string {
        const fullPath = new Path(this.projectRoot!).join(legacyPath).toString();
        if (!fs.existsSync(fullPath)) return "";

        const content = fs.readFileSync(fullPath, 'utf-8');
        return HealerPromptBuilder.buildDisparityContext(content, unit.name, unit.type);
    }

    private async processSuggestion(suggestion: string | null, filePath: string, issue: string, orchestrator: Orchestrator): Promise<boolean> {
        if (!suggestion) return false;
        const codeMatch = suggestion.match(/```(?:typescript|ts|javascript|js|python)?\n([\s\S]*?)\n```/);
        return (codeMatch && codeMatch[1]) ? this.patcher.applyAndValidate(filePath, codeMatch[1], issue, orchestrator) : false;
    }

    async cleanFile(filePath: string): Promise<boolean> {
        if (!this.projectRoot) return false;
        const fullPath = new Path(this.projectRoot).join(filePath).toString();
        if (!fs.existsSync(fullPath)) return false;

        const content = fs.readFileSync(fullPath, 'utf-8');
        const replacements = await this.cleaner.collectReplacementsDeep(filePath, content);

        if (replacements.length > 0) {
            winston.info(`🩹 [Healer] Limpando ${replacements.length} ofuscações profundas em ${filePath}`);
            fs.writeFileSync(fullPath, this.cleaner.applyClean(content, replacements), 'utf-8');
            return true;
        }
        return false;
    }
}
