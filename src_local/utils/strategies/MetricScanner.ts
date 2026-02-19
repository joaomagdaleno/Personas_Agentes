import { execSync } from "node:child_process";
import * as os from "node:os";

export class MetricScanner {
    static scanProcesses(): any[] {
        try {
            const lines = execSync('tasklist /V /FO CSV', { encoding: 'utf8' }).split('\n').slice(1);
            return lines.map(l => {
                const p = l.split('","').map(x => x.replace(/"/g, '')); if (p.length < 5) return null;
                const mKb = parseInt((p[4] || "").replace(/[^\d]/g, '') || "0");
                return mKb > 200000 ? { name: p[0] || "U", pid: parseInt(p[1] || "0") || 0, mem_mb: (mKb / 1024).toFixed(2) } : null;
            }).filter((x): x is any => x !== null).sort((a, b) => parseFloat(b.mem_mb) - parseFloat(a.mem_mb));
        } catch { return []; }
    }

    static getCpuAvg(): number {
        const cpus = os.cpus(); let tIdle = 0, tTick = 0;
        cpus.forEach(c => { Object.values(c.times).forEach(v => tTick += v); tIdle += c.times.idle; });
        return 100 - (100 * tIdle / Math.max(1, tTick));
    }
}
