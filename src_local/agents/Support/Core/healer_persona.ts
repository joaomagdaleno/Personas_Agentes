
import { join } from "path";
import { existsSync, readFileSync } from "fs";
import winston from "winston";
import { CognitiveEngine } from "../../../../utils/cognitive_engine";
import { CoreValidator } from "../../../../core/validator";

const logger = winston.child({ module: "HealerPersona" });

/**
 * 🩹 Agente Healer (PhD in Software Reparation).
 * Usa o CognitiveEngine para gerar patches de correção e validar a cura.
 */
export class HealerPersona {
    private brain: CognitiveEngine;
    private projectRoot: string;
    private validator: CoreValidator;

    constructor(projectRoot: string) {
        this.projectRoot = projectRoot;
        this.brain = new CognitiveEngine();
        this.validator = new CoreValidator(); // Direct instantiation instead of Assembler to avoid circular dep
    }

    /**
     * Tenta curar uma fragilidade específica.
     */
    async healFinding(finding: any): Promise<boolean> {
        const filePath = finding.file;
        const issue = finding.issue || finding.message;

        if (!filePath || !issue) return false;

        const fullPath = join(this.projectRoot, filePath);
        if (!existsSync(fullPath)) {
            logger.error(`🩹 [Healer] Arquivo não encontrado para cura: ${filePath}`);
            return false;
        }

        logger.info(`🩹 [Healer] Iniciando protocolo de cura em: ${filePath}`);
        const content = readFileSync(fullPath, "utf-8"); // Bun can use readFileSync or await Bun.file().text()

        const prompt = `Você é o Dr. Healer, PhD em Reparação de Software.
Analise a seguinte fragilidade e forneça o código CORRIGIDO.

ARQUIVO: ${filePath}
CÓDIGO ATUAL:
\`\`\`typescript
${content}
\`\`\`

PROBLEMA: ${issue}

REQUISITO: Forneça APENAS o código completo corrigido, sem explicações, rodeado por triplos backticks.`;

        try {
            const suggestion = await this.brain.reason(prompt);
            if (!suggestion) return false;

            // Extract code logic
            const match = suggestion.match(/```(?:typescript|python|js|ts)?\n([\s\S]*?)\n```/);

            if (match && match[1]) {
                const newContent = match[1];
                const backupPath = fullPath + ".bak";

                // Backup
                await Bun.write(backupPath, content);

                // Apply
                await Bun.write(fullPath, newContent);
                logger.info(`✨ [Healer] Remendo aplicado em ${filePath}. Validando...`);

                // Validate
                const res = await this.validator.verifyCoreHealth(this.projectRoot, [filePath]);

                if (res && res.success) {
                    logger.info(`✅ [Healer] Cura CONFIRMADA em ${filePath}.`);
                    await Bun.spawn(["rm", backupPath]).exited; // simple rm
                    return true;
                } else {
                    logger.warn(`❌ [Healer] Cura REPROVADA. Revertendo ${filePath}...`);
                    await Bun.write(fullPath, content); // Revert
                    return false;
                }
            }
        } catch (error) {
            logger.error(`❌ [Healer] Falha fatal no processo: ${error}`);
            // Attempt revert if backup exists? Logic simplified safely above (revert explicit)
            return false;
        }

        return false;
    }

    /**
     * 🧹 Remove arquivos legacy que já possuem paridade 100% no novo sistema.
     */
    async safelyRemoveRedundantFiles(files: string[]): Promise<{ deleted: number, failed: number }> {
        let deleted = 0;
        let failed = 0;

        for (const relPath of files) {
            const fullPath = join(this.projectRoot, relPath);
            if (!existsSync(fullPath)) continue;

            try {
                // Regra de Ouro: Só deleta se houver correspondente TS (verificação simplificada aqui)
                const tsPath = relPath.replace(".py", ".ts").replace("Python", "TypeScript");
                const fullTsPath = join(this.projectRoot, tsPath);

                if (existsSync(fullTsPath)) {
                    await Bun.spawn(["rm", fullPath]).exited;
                    logger.info(`✅ [Healer] Removido arquivo redundante: ${relPath}`);
                    deleted++;
                } else {
                    logger.warn(`⚠️ [Healer] Pulando removal: Correspondente TS não encontrado para ${relPath}`);
                    failed++;
                }
            } catch (e: any) {
                logger.error(`❌ [Healer] Falha ao remover ${relPath}: ${e.message}`);
                failed++;
            }
        }

        return { deleted, failed };
    }
}
