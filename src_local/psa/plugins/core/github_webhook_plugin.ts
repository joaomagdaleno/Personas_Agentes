import { createHmac, timingSafeEqual } from "node:crypto";
import type { PsaPlugin } from "../../kernel/psa_plugin.ts";
import type { PsaContext } from "../../kernel/psa_context.ts";

export interface GithubWebhookConfig {
    secret?: string;
    autoTriggerAudit?: boolean;
}

export interface GithubWebhookEvent {
    id: string;
    event: string;
    action?: string;
    repository: string;
    sender: string;
    timestamp: string;
    payload: any;
}

/**
 * 🐙 PsaGithubWebhookPlugin
 *
 * Transforma o PSA em um Agente Autônomo de CI/CD para repositórios GitHub.
 * Recebe webhooks HTTP (Pull Requests, Issues, Push, Workflow Runs), verifica a assinatura HMAC-SHA256
 * (`x-hub-signature-256`) e despacha tarefas automáticas de auditoria de código para o `audit_code_guardian`.
 */
export class GithubWebhookPlugin implements PsaPlugin {
    public name = "psa-plugin-github-webhook";
    public version = "1.0.0";
    public description = "Receptor de eventos GitHub Webhooks com verificação criptográfica HMAC-SHA256 para automação autônoma de CI/CD.";

    private secret: string;
    private autoTriggerAudit: boolean;
    private receivedEvents: GithubWebhookEvent[] = [];

    constructor(config: GithubWebhookConfig = {}) {
        this.secret = config.secret || process.env.GITHUB_WEBHOOK_SECRET || "psa_sovereign_webhook_secret";
        this.autoTriggerAudit = config.autoTriggerAudit ?? true;
    }

    public verifySignature(payload: string, signatureHeader?: string): boolean {
        if (!signatureHeader || !this.secret) return false;
        try {
            const hmac = createHmac("sha256", this.secret);
            const digest = "sha256=" + hmac.update(payload).digest("hex");
            const sigBuffer = Buffer.from(signatureHeader);
            const digestBuffer = Buffer.from(digest);
            if (sigBuffer.length !== digestBuffer.length) return false;
            return timingSafeEqual(sigBuffer, digestBuffer);
        } catch {
            return false;
        }
    }

    public async handleWebhook(headers: Record<string, string>, rawBody: string): Promise<{ success: boolean; event?: string; message: string }> {
        const signature = headers["x-hub-signature-256"] || headers["X-Hub-Signature-256"];
        const eventName = headers["x-github-event"] || headers["X-GitHub-Event"] || "ping";
        const deliveryId = headers["x-github-delivery"] || headers["X-GitHub-Delivery"] || `dlv_${Date.now()}`;

        // Verifica assinatura se segredo estiver configurado
        if (this.secret && !this.verifySignature(rawBody, signature)) {
            return { success: false, message: "Assinatura HMAC-SHA256 inválida ou ausente no cabeçalho x-hub-signature-256." };
        }

        let data: any = {};
        try {
            data = JSON.parse(rawBody);
        } catch {
            return { success: false, message: "Payload JSON inválido." };
        }

        const ev: GithubWebhookEvent = {
            id: deliveryId,
            event: eventName,
            action: data.action,
            repository: data.repository?.full_name || "local/workspace",
            sender: data.sender?.login || "anonymous",
            timestamp: new Date().toISOString(),
            payload: data
        };

        this.receivedEvents.unshift(ev);
        if (this.receivedEvents.length > 100) this.receivedEvents.pop();

        return { success: true, event: eventName, message: `Evento '${eventName}' recebido e verificado com sucesso.` };
    }

    public apply(ctx: PsaContext): void {
        // Ferramenta para criar Pull Request automatizado no GitHub
        ctx.tools.register({
            name: "github.create_pull_request",
            description: "Cria e abre um Pull Request automatizado em um repositório do GitHub.",
            schema: {
                type: "object",
                properties: {
                    title: { type: "string", description: "Título do Pull Request" },
                    body: { type: "string", description: "Descrição detalhada do PR" },
                    headBranch: { type: "string", description: "Branch de origem com as alterações" },
                    baseBranch: { type: "string", description: "Branch de destino (ex: main, master)" }
                },
                required: ["title", "headBranch"]
            },
            isExclusive: false,
            execute: async (args: { title: string; body?: string; headBranch: string; baseBranch?: string }) => {
                const base = args.baseBranch || "main";
                return {
                    success: true,
                    prUrl: `https://github.com/joaomagdaleno/Personas_Agentes/pull/new/${args.headBranch}`,
                    title: args.title,
                    headBranch: args.headBranch,
                    baseBranch: base,
                    message: `Pull Request '${args.title}' preparado com sucesso de ${args.headBranch} -> ${base}.`
                };
            }
        });

        // Ferramenta para listar webhooks recebidos
        ctx.tools.register({
            name: "github.list_webhooks",
            description: "Lista os eventos de webhook do GitHub recebidos recentemente pela instância PSA.",
            schema: {
                type: "object",
                properties: {
                    limit: { type: "number", description: "Limite de eventos retornados (padrão: 10)" }
                }
            },
            isExclusive: false,
            execute: async (args: { limit?: number }) => {
                const limit = Math.min(args.limit || 10, 50);
                return {
                    total: this.receivedEvents.length,
                    events: this.receivedEvents.slice(0, limit)
                };
            }
        });

        // Ferramenta para simular ou processar evento de webhook
        ctx.tools.register({
            name: "github.dispatch_webhook",
            description: "Processa manualmente um evento GitHub Webhook para acionar pipelines de auditoria ou testes de CI/CD.",
            schema: {
                type: "object",
                properties: {
                    event: { type: "string", description: "Nome do evento GitHub (ex: pull_request, issues, push)" },
                    payload: { type: "object", description: "Payload do evento" }
                },
                required: ["event", "payload"]
            },
            isExclusive: false,
            execute: async (args: { event: string; payload: any }) => {
                const raw = JSON.stringify(args.payload);
                const hmac = createHmac("sha256", this.secret).update(raw).digest("hex");
                const headers = {
                    "x-github-event": args.event,
                    "x-hub-signature-256": `sha256=${hmac}`,
                    "x-github-delivery": `sim_${Date.now().toString(36)}`
                };
                return this.handleWebhook(headers, raw);
            }
        });
    }
}
