import * as fs from "node:fs";
import * as path from "node:path";
import { createHash } from "node:crypto";
import type { PsaContext } from "../kernel/psa_context.ts";

export interface PsaSessionRecord {
    id: string;
    createdAt: string;
    persona: string;
    model: string;
    workspace: string;
    parentSessionId?: string;
    forkStepIndex?: number;
}

export interface PsaSessionEvent {
    index: number;
    sessionId: string;
    timestamp: string;
    turnIndex: number;
    type: "turn_start" | "reasoning" | "tool_call" | "tool_result" | "verification" | "approval_prompt" | "compaction" | "text" | "turn_end";
    payload: any;
    sha256: string;
}

export class PsaSessionService {
    private storageDir: string;
    private activeSessions: Map<string, PsaSessionRecord> = new Map();
    private eventCounts: Map<string, number> = new Map();

    constructor(ctx: PsaContext, storageRoot?: string) {
        this.storageDir = storageRoot || path.join(process.cwd(), ".psa_sessions");
        if (!fs.existsSync(this.storageDir)) {
            fs.mkdirSync(this.storageDir, { recursive: true });
        }
    }

    /**
     * Cria uma nova sessão append-only
     */
    public create(params: { sessionId?: string; persona: string; model: string; workspace?: string; parentSessionId?: string; forkStepIndex?: number }): PsaSessionRecord {
        const id = params.sessionId || `psa_ses_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
        const record: PsaSessionRecord = {
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

    public has(sessionId: string): boolean {
        return this.activeSessions.has(sessionId) || fs.existsSync(this.getSessionFilePath(sessionId));
    }

    public appendEvent(sessionId: string, event: { type: any; data: any }): void {
        this.append(sessionId, 0, (event.type === "todo/write" ? "tool_result" : "text") as any, event.data);
    }

    /**
     * Grava um evento no log append-only com carimbo criptográfico SHA-256
     */
    public append(sessionId: string, turnIndex: number, type: PsaSessionEvent["type"], payload: any): PsaSessionEvent {
        const currentCount = (this.eventCounts.get(sessionId) || 0) + 1;
        this.eventCounts.set(sessionId, currentCount);

        const sha256 = createHash("sha256")
            .update(`${sessionId}:${currentCount}:${type}:${JSON.stringify(payload)}`)
            .digest("hex");

        const event: PsaSessionEvent = {
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
    public getHistory(sessionId: string): PsaSessionEvent[] {
        const filePath = this.getSessionFilePath(sessionId);
        if (!fs.existsSync(filePath)) return [];

        const content = fs.readFileSync(filePath, "utf-8");
        const lines = content.trim().split("\n");
        const events: PsaSessionEvent[] = [];

        for (const line of lines) {
            try {
                const parsed = JSON.parse(line);
                if (parsed.type !== "session_init") {
                    events.push(parsed as PsaSessionEvent);
                }
            } catch {}
        }

        return events;
    }

    public getTrajectory(sessionId: string): PsaSessionEvent[] {
        return this.getHistory(sessionId);
    }

    /**
     * Realiza o Fork de uma sessão a partir de um step específico (gera sub-sessão)
     */
    public fork(originalSessionId: string, fromStepIndex: number, newPersona?: string): PsaSessionRecord {
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
     * Gera o carimbo criptográfico SHA-256 do histórico completo da sessão
     */
    public computeDigest(sessionId: string): string {
        const filePath = this.getSessionFilePath(sessionId);
        if (!fs.existsSync(filePath)) return "0".repeat(64);

        const content = fs.readFileSync(filePath);
        return createHash("sha256").update(content).digest("hex");
    }

    /**
     * Lista todas as sessões existentes no diretório de persistência
     */
    public listSessions(): Array<{ id: string; lastUpdated: string; eventsCount: number; parentSessionId?: string }> {
        if (!fs.existsSync(this.storageDir)) return [];
        const files = fs.readdirSync(this.storageDir).filter(f => f.endsWith(".jsonl"));

        return files.map(file => {
            const id = file.replace(/\.jsonl$/, "");
            const stat = fs.statSync(path.join(this.storageDir, file));
            const history = this.getHistory(id);

            // Tenta obter metadados da sessão a partir da primeira linha
            let parentSessionId: string | undefined;
            try {
                const firstLine = fs.readFileSync(path.join(this.storageDir, file), "utf-8").split("\n")[0];
                const parsed = JSON.parse(firstLine);
                if (parsed.metadata?.parentSessionId) {
                    parentSessionId = parsed.metadata.parentSessionId;
                }
            } catch {}

            return {
                id,
                lastUpdated: stat.mtime.toISOString(),
                eventsCount: history.length,
                parentSessionId
            };
        });
    }

    private getSessionFilePath(sessionId: string): string {
        return path.join(this.storageDir, `${sessionId}.jsonl`);
    }
}

// Compatibilidade
export type DshSessionRecord = PsaSessionRecord;
export type DshSessionEvent = PsaSessionEvent;
export { PsaSessionService as DshSessionService };
