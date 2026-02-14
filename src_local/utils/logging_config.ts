import winston from "winston";

/**
 * 🛰️ Configura o sistema de logging Bun resiliente.
 */
export function configureLogging(level: string = "info") {
    const logger = winston.createLogger({
        level: level,
        format: winston.format.combine(
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            winston.format.printf(({ timestamp, level, message, module }) => {
                return `${timestamp} - ${module || 'System'} - ${level.toUpperCase()} - ${message}`;
            })
        ),
        transports: [
            new winston.transports.Console()
        ],
    });

    // Globally set the logger for the system if needed, or just return it.
    winston.configure({
        level: level,
        format: winston.format.combine(
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            winston.format.printf(({ timestamp, level, message, module }) => {
                return `${timestamp} - ${module || 'System'} - ${level.toUpperCase()} - ${message}`;
            })
        ),
        transports: [
            new winston.transports.Console()
        ],
    });
}

export function logPerformance(logger: any, startTime: number, message: string, level: string = "info") {
    const duration = (Date.now() - startTime) / 1000;
    logger.log(level, `${message} in ${duration.toFixed(4)}s.`);
}
