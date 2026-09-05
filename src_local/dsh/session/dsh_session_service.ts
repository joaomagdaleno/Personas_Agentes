import * as fs from "node:fs";
import * as path from "node:path";
import { createHash } from "node:crypto";
import type { DshContext } from "../kernel/dsh_context.ts";

export interface DshSessionRecord {
    id: string;
    createdAt: string;
    persona: string;
    model: string;
    workspace: string;
    parentSessionId?: string;
    forkStepIndex?: number;
}

export interface DshSessionEvent {
    index: number;
    sessionId: string;
    timestamp: string;
    turnIndex: number;
    type: "turn_start" | "reasoning" | "tool_call" | "tool_result" | "verification" | "text" | "turn_end";
    payload: any;
    sha256: string;
}

export class DshSessionService {
    private storageDir: string;
    private activeSessions: Map<string, DshSessionRecord> = new Map();
    private eventCounts: Map<string, number> = new Map();

    constructor(ctx: DshContext, storageRoot?: string) {
        this.storageDir = storageRoot || path.join(process.cwd(), ".dsh_sessions");
        if (!fs.existsSync(this.storageDir)) {
            fs.mkdirSync(this.storageDir, { recursive: true });
        }
    }

    /**
     * Cria uma nova sessão append-only
     */
    public create(params: { sessionId?: string; persona: string; model: string; workspace?: string; parentSessionId?: string; forkStepIndex?: number }): DshSessionRecord {
        const id = params.sessionId || `dsh_ses_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
        const record: DshSessionRecord = {
            id,
            createdAt: new Date().toISOString(),
            persona: params.persona,
            model: params.model,
            workspace: params.workspace || process.cwd(),
            parentSessionId: params.parentSessionId,
            forkStepIndex: params.forkStepIndex
        };

        this.activeSessions.set(id, record);
        this.eventCounts.set(id, 0);

        const filePath = this.getSessionFilePath(id);
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, JSON.stringify({ type: "session_init", metadata: record }) + "\n");
        }

        return record;
    }

    /**
     * Grava um evento no log append-only (Regra DSH: "Model-visible means logged")
     */
    public append(sessionId: string, turnIndex: number, type: DshSessionEvent["type"], payload: any): DshSessionEvent {
        const currentCount = (this.eventCounts.get(sessionId) || 0) + 1;
        this.eventCounts.set(sessionId, currentCount);

        const sha256 = createHash("sha256")
            .update(`${sessionId}:${currentCount}:${type}:${JSON.stringify(payload)}`)
            .digest("hex");

        const event: DshSessionEvent = {
            index: currentCount,
            sessionId,
            timestamp: new Date().toISOString(),
            turnIndex,
            type,
            payload,
            sha256
        };

        const filePath = this.getSessionFilePath(sessionId);
        fs.appendFileSync(filePath, JSON.stringify(event) + "\n");

        return event;
    }

    /**
     * Recupera todos os eventos gravados da sessão
     */
    public getHistory(sessionId: string): DshSessionEvent[] {
        const filePath = this.getSessionFilePath(sessionId);
        if (!fs.existsSync(filePath)) return [];

        const content = fs.readFileSync(filePath, "utf-8");
        const lines = content.trim().split("\n");
        const events: DshSessionEvent[] = [];

        for (const line of lines) {
            try {
                const parsed = JSON.parse(line);
                if (parsed.type !== "session_init") {
                    events.push(parsed as DshSessionEvent);
                }
            } catch {}
        }

        return events;
    }

    /**
     * Realiza o Fork de uma sessão a partir de um step específico
     */
    public fork(originalSessionId: string, fromStepIndex: number, newPersona?: string): DshSessionRecord {
        const history = this.getHistory(originalSessionId);
        const sliced = history.slice(0, fromStepIndex);

        const original = this.activeSessions.get(originalSessionId);
        const forked = this.create({
            persona: newPersona || original?.persona || "strategic_cognitive_architect",
            model: original?.model || "deepseek-v4-flash",
            parentSessionId: originalSessionId,
            forkStepIndex: fromStepIndex
        });

        for (const ev of sliced) {
            this.append(forked.id, ev.turnIndex, ev.type, ev.payload);
        }

        return forked;
    }

    /**
     * Gera o carimbo criptográfico SHA-256 do histórico da sessão (padrão dsh-trajectory)
     */
    public computeDigest(sessionId: string): string {
        const filePath = this.getSessionFilePath(sessionId);
        if (!fs.existsSync(filePath)) return "0".repeat(64);

        const content = fs.readFileSync(filePath);
        return createHash("sha256").update(content).digest("hex");
    }

    /**
     * Retorna a trajetória de eventos gravados da sessão (alias para getHistory)
     */
    public getTrajectory(sessionId: string): DshSessionEvent[] {
        return this.getHistory(sessionId);
    }

    /**
     * Lista todas as sessões existentes no diretório de persistência
     */
    public listSessions(): Array<{ id: string; lastUpdated: string; eventsCount: number }> {
        if (!fs.existsSync(this.storageDir)) return [];
        const files = fs.readdirSync(this.storageDir).filter(f => f.endsWith(".jsonl"));

        return files.map(file => {
            const id = file.replace(/\.jsonl$/, "");
            const stat = fs.statSync(path.join(this.storageDir, file));
            const history = this.getHistory(id);
            return {
                id,
                lastUpdated: stat.mtime.toISOString(),
                eventsCount: history.length
            };
        });
    }

    private getSessionFilePath(sessionId: string): string {
        return path.join(this.storageDir, `${sessionId}.jsonl`);
    }
}
