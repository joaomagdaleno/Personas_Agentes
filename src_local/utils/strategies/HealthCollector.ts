import * as os from "node:os";
import { MetricScanner } from "./MetricScanner.ts";

export class HealthCollector {
    static collect(isAdmin: boolean): any {
        return {
            cpu_usage: MetricScanner.getCpuAvg(), memory_usage: (((os.totalmem() - os.freemem()) / os.totalmem()) * 100).toFixed(2),
            memory_free_gb: (os.freemem() / (1024 ** 3)).toFixed(2), is_admin: isAdmin, platform: os.platform(),
            arch: os.arch(), uptime_hours: (os.uptime() / 3600).toFixed(2), heavy_processes: MetricScanner.scanProcesses()
        };
    }
}
