import winston from "winston";
import { HubManagerGRPC } from "../core/hub_manager_grpc.ts";

const logger = winston.child({ module: "HubWatcher" });

/**
 * 📡 HubWatcher — Cliente gRPC PhD para o Native Sovereign Hub.
 * O único ponto de entrada para eventos do sistema de arquivos e saúde via gRPC.
 */
export class HubWatcher {
    private manager: HubManagerGRPC;
    private onChangeCallbacks: ((path: string) => void)[] = [];

    constructor(host: string = "localhost:50051", manager?: HubManagerGRPC) {
        this.manager = manager || new HubManagerGRPC(host);
    }

    start() {
        logger.info(`📡 [HubWatcher] Conectando ao gRPC Hub...`);
        this.listen();
    }

    private listen() {
        const call = this.manager.watchEvents((event) => {
            if (event.type === "FILE_EVENT") {
                this.notify(event.path);
            }
        });

        const healthCall = this.manager.watchHealth((update) => {
            // Emite para o sistema se necessário, ou loga
            if (update.cpuUsage > 80 || update.memoryUsage > 80) {
                logger.warn(`⚠️ [HubWatcher] ALERTA DE SAÚDE: CPU ${update.cpuUsage}%, MEM ${update.memoryUsage}%`);
            }
        });
    }


    onChange(callback: (path: string) => void) {
        this.onChangeCallbacks.push(callback);
    }

    private notify(path: string) {
        // Debounce or filter internal files if needed
        if (path.includes(".git") || path.includes("node_modules")) return;

        logger.info(`✨ [HubWatcher] Mudança detectada: ${path}`);
        this.onChangeCallbacks.forEach(cb => cb(path));
    }
}
