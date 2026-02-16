/**
 * 📝 Logging Config - PhD in Forensic Traceability
 * Configuração centralizada de logs com suporte a rotação e output estruturado.
 */

import winston from 'winston';
import { formatDate } from './date_utils.ts'; // We'll create this

function formatDate(date: Date): string {
    const pad = (num: number) => num.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
        `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.${date.getMilliseconds().toString().padStart(3, '0')}`;
}

export function configureLogging(level: string = "info") {
    // Configure Winston logging
    const transports: winston.transport[] = [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.timestamp(),
                winston.format.printf(({ timestamp, level, message, metadata }) => {
                    const timeStr = formatDate(new Date(timestamp));
                    return `[${timeStr}] [${level}] ${message}${metadata ? ` ${JSON.stringify(metadata)}` : ''}`;
                })
            ),
            level: level
        })
    ];

    // Add file transport if running in production
    if (process.env.NODE_ENV === 'production') {
        transports.push(
            new winston.transports.File({
                filename: `logs/forensic_${Date.now()}.log`,
                format: winston.format.combine(
                    winston.format.timestamp(),
                    winston.format.json()
                ),
                level: 'error'
            })
        );
    }

    winston.configure({
        level: level,
        transports: transports
    });

    console.log(`[Config] Logging level set to: ${level}`);
}

export interface LogEntry {
    timestamp: string;
    level: "INFO" | "WARN" | "ERROR" | "CRITICAL";
    persona: string;
    message: string;
    metadata?: Record<string, unknown>;
}

export class SovereigntyLogger {
    private static instance: SovereigntyLogger;
    private logBuffer: LogEntry[] = [];
    private readonly MAX_BUFFER = 100;

    private constructor() { }

    public static getInstance(): SovereigntyLogger {
        if (!SovereigntyLogger.instance) {
            SovereigntyLogger.instance = new SovereigntyLogger();
        }
        return SovereigntyLogger.instance;
    }

    public log(entry: Omit<LogEntry, "timestamp">): void {
        const fullEntry: LogEntry = {
            ...entry,
            timestamp: formatDate(new Date()),
        };

        // Use Winston for logging
        const logger = winston.child({ persona: entry.persona });
        logger.log(entry.level.toLowerCase(), entry.message, entry.metadata);

        this.logBuffer.push(fullEntry);
        if (this.logBuffer.length > this.MAX_BUFFER) {
            this.flushToForensicStorage();
        }
    }

    private flushToForensicStorage(): void {
        // Ported from rotate_logs.py: Rotação forense de 100 entries por dump
        const dump = JSON.stringify(this.logBuffer, null, 2);
        this.logBuffer = [];
        // Simulated rotation: No Bun, we'd append to a file here.
        // Deno.writeTextFileSync(`./logs/forensic_${Date.now()}.json`, dump);
    }
}

export const logger = SovereigntyLogger.getInstance();
