import * as fs from 'fs';
import winston from 'winston';
import { Path } from "../../core/path_utils.ts";
import { Orchestrator } from "../../core/orchestrator.ts";

export class PatchManager {
    constructor(private projectRoot: string) { }

    async applyAndValidate(filePath: string, newContent: string, issue: string, orchestrator: Orchestrator): Promise<boolean> {
        const fullPath = new Path(this.projectRoot).join(filePath).toString();
        const backupPath = fullPath + ".bak";

        // Backup
        if (fs.existsSync(fullPath)) {
            fs.renameSync(fullPath, backupPath);
        }

        try {
            fs.writeFileSync(fullPath, newContent, 'utf-8');
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
                this.revert(fullPath, backupPath);
                return false;
            }
        } catch (err) {
            winston.error(`❌ [Healer] Erro fatal durante a aplicação da cura: ${err}`);
            this.revert(fullPath, backupPath);
            return false;
        }
    }

    private revert(fullPath: string, backupPath: string) {
        if (fs.existsSync(backupPath)) {
            if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
            fs.renameSync(backupPath, fullPath);
        }
    }
}
