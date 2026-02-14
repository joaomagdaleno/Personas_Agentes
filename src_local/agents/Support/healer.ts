import winston from 'winston';
import * as fs from 'fs';
import { DANGEROUS_KEYWORDS } from "./safety_definitions";
import { Path } from '../../core/path_utils';
import { BaseActivePersona } from '../base_persona';
import { CognitiveEngine } from '../../utils/cognitive_engine';
import { Orchestrator } from '../../core/orchestrator';

/**
 * 🩹 Agente Healer (PhD in Software Reparation).
 * Usa o CognitiveEngine para gerar patches de correção e validar a cura.
 */
export class HealerPersona extends BaseActivePersona {
    private brain: CognitiveEngine;

    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Healer";
        this.role = "PhD Software Healer";
        this.emoji = "🩹";
        this.stack = "Correction";
        this.brain = new CognitiveEngine();
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
        if (!fs.existsSync(fullPath.toString())) {
            winston.error(`🩹 [Healer] Arquivo não encontrado para cura: ${filePath}`);
            return false;
        }

        winston.info(`🩹 [Healer] Iniciando protocolo de cura em: ${filePath}`);
        const content = fs.readFileSync(fullPath.toString(), 'utf-8');

        const prompt = `
        Você é o Dr. Healer, PhD em Reparação de Software.
        Analise a seguinte fragilidade e forneça o código CORRIGIDO.
        
        ARQUIVO: ${filePath}
        CÓDIGO ATUAL:
        \`\`\`typescript
        ${content}
        \`\`\`
        
        PROBLEMA: ${issue}
        
        REQUISITO: Forneça APENAS o código completo corrigido, sem explicações, rodeado por triplos backticks.
        `;

        const suggestion = await this.brain.reason(prompt);
        if (!suggestion) return false;

        const codeMatch = suggestion.match(/```(?:typescript|ts|javascript|js|python)?\n([\s\S]*?)\n```/);
        if (codeMatch) {
            const newContent = codeMatch[1];
            const backupPath = fullPath.toString() + ".bak";

            // Backup
            fs.renameSync(fullPath.toString(), backupPath);

            try {
                fs.writeFileSync(fullPath.toString(), newContent, 'utf-8');
                winston.info(`✨ [Healer] Remendo aplicado em ${filePath}. Validando...`);

                // Validação Cruzada (Usa o StructuralAnalyst e IntegrityGuardian do Orquestrador)
                const auditResults = await orchestrator.auditEngine.runStrategicAudit(orchestrator, `Cura de arquivo: ${filePath}`);

                const stillBroken = auditResults[0].some((f: any) => f.file === filePath && f.issue === issue);

                if (!stillBroken) {
                    winston.info(`✅ [Healer] Cura CONFIRMADA em ${filePath}.`);
                    fs.unlinkSync(backupPath);
                    return true;
                } else {
                    winston.warn(`❌ [Healer] Cura REPROVADA (problema persiste). Revertendo...`);
                    fs.renameSync(backupPath, fullPath.toString());
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
}
