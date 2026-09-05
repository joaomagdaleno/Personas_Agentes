import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { PsaServer } from "../src_local/server/psa_server.ts";

describe("PSA End-to-End (E2E) Server & Streaming Integration Suite", () => {
    let server: PsaServer;
    const testPort = 3991;
    const baseUrl = `http://127.0.0.1:${testPort}`;

    beforeAll(async () => {
        server = new PsaServer({ port: testPort, hostname: "127.0.0.1" });
        server.start();
        // Give server 50ms to bind
        await new Promise(resolve => setTimeout(resolve, 50));
    });

    afterAll(() => {
        if (server) {
            server.stop();
        }
    });

    test("should respond to /health with healthy status and active plugins", async () => {
        const res = await fetch(`${baseUrl}/health`);
        expect(res.status).toBe(200);
        const data = await res.json() as any;
        expect(data.status.toUpperCase()).toBe("HEALTHY");
        expect(data.pluginsCount).toBeGreaterThan(0);
        expect(data.toolsCount).toBeGreaterThan(0);
    });

    test("should list all available PSA models and personas on /v1/models", async () => {
        const res = await fetch(`${baseUrl}/v1/models`);
        expect(res.status).toBe(200);
        const data = await res.json() as any;
        expect(data.object).toBe("list");
        expect(Array.isArray(data.data)).toBe(true);

        const modelIds = data.data.map((m: any) => m.id);
        expect(modelIds).toContain("qwen2.5-coder-1.5b");
        expect(modelIds).toContain("qwen3-8b-thinking");
        expect(modelIds).toContain("qwen2.5-coder-7b");
    });

    test("should stream turn events via SSE on /v1/stream exactly as WinUI 3 expects", async () => {
        const payload = {
            messages: [{ role: "user", content: "Ping: Verificar integridade E2E do sistema" }],
            model: "qwen2.5-coder-1.5b",
            persona: "strategic_cognitive_architect",
            mode: "Standard",
            deepthink: false
        };

        const res = await fetch(`${baseUrl}/v1/stream`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        expect(res.status).toBe(200);
        expect(res.headers.get("content-type")).toContain("text/event-stream");

        const reader = res.body?.getReader();
        expect(reader).toBeDefined();

        const decoder = new TextDecoder();
        const receivedChunks: any[] = [];
        let doneReceived = false;

        while (true) {
            const { done, value } = await reader!.read();
            if (done) break;

            const text = decoder.decode(value);
            const lines = text.split("\n");
            for (const line of lines) {
                if (line.startsWith("data: ")) {
                    const raw = line.replace("data: ", "").trim();
                    if (raw === "[DONE]") {
                        doneReceived = true;
                    } else if (raw.startsWith("{")) {
                        try {
                            const parsed = JSON.parse(raw);
                            receivedChunks.push(parsed);
                        } catch {}
                    }
                }
            }
        }

        expect(doneReceived).toBe(true);
        expect(receivedChunks.length).toBeGreaterThan(0);

        const types = receivedChunks.map(c => c.type);
        expect(types).toContain("turn_start");
        expect(types).toContain("turn_end");
    }, 25000);

    test("should stream reasoning trace when deepthink is enabled", async () => {
        const payload = {
            prompt: "Arquitetura: planejar modelo cognitivo com reflexão",
            model: "qwen3-8b-thinking",
            persona: "strategic_cognitive_architect",
            mode: "Standard",
            deepthink: true
        };

        const res = await fetch(`${baseUrl}/v1/stream`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        expect(res.status).toBe(200);
        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        const types: string[] = [];

        while (true) {
            const { done, value } = await reader!.read();
            if (done) break;
            const text = decoder.decode(value);
            for (const line of text.split("\n")) {
                if (line.startsWith("data: ") && !line.includes("[DONE]")) {
                    try {
                        const parsed = JSON.parse(line.replace("data: ", ""));
                        types.push(parsed.type);
                    } catch {}
                }
            }
        }

        expect(types).toContain("reasoning");
    }, 25000);

    test("should handle abrupt client disconnect gracefully without crashing server", async () => {
        const controller = new AbortController();

        const payload = {
            prompt: "Teste de cancelamento abrupto do cliente WinUI 3",
            model: "qwen2.5-coder-1.5b",
            persona: "strategic_cognitive_architect"
        };

        // Start request and abort almost immediately
        const fetchPromise = fetch(`${baseUrl}/v1/stream`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            signal: controller.signal
        });

        setTimeout(() => {
            controller.abort();
        }, 10);

        try {
            await fetchPromise;
        } catch {
            // Expected abort error
        }

        // Verify server is still alive and responds to subsequent health requests
        const healthRes = await fetch(`${baseUrl}/health`);
        expect(healthRes.status).toBe(200);
    });
});
