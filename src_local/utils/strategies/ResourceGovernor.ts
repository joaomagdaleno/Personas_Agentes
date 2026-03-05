import winston from "winston";
import * as os from "node:os";

const logger = winston.child({ module: "ResourceGovernor" });

export class ResourceGovernor {
    static enforce(pid: number) {
        try { os.setPriority(pid, os.constants.priority.PRIORITY_LOW); logger.info("⚖️ [Gov] Priority adjusted to 'LOW'."); }
        catch (e) { logger.warn(`⚠️ Failed to adjust priority: ${e}`); }
    }

    static shouldThrottle(h: any, cpuLimit: number = 85, memLimit: number = 95): boolean {
        const cpu = parseFloat(h.cpu_usage.toString()), mem = parseFloat(h.memory_usage);
        if (cpu > cpuLimit || mem > memLimit) { logger.warn(`🌡️ [Gov] High load (CPU: ${cpu.toFixed(1)}%, MEM: ${mem.toFixed(1)}%). Throttling.`); return true; }
        return false;
    }

    static async yield(checkFn: () => boolean | Promise<boolean>) {
        while (await checkFn()) await new Promise(res => setTimeout(res, 5000));
    }
}
