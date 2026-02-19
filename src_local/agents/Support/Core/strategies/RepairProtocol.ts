import * as fs from 'node:fs';
import winston from 'winston';

export class RepairProtocol {
    static async validate(p: string, b: string, i: string, e: any, o: any): Promise<boolean> {
        const res = await o.auditEngine.runStrategicAudit(o, `Cura: ${p}`);
        if (!res[0].some((f: any) => f.file === p && f.issue === i)) {
            if (fs.existsSync(b)) fs.unlinkSync(b); return true;
        }
        if (fs.existsSync(b)) fs.renameSync(b, p); return false;
    }
}
