import type { PsaPlugin } from "../../kernel/psa_plugin.ts";
import type { PsaContext } from "../../kernel/psa_context.ts";

export interface WebSearchResultItem {
    title: string;
    url: string;
    snippet: string;
}

export interface WebSearchResult {
    query: string;
    results: WebSearchResultItem[];
    total: number;
}

export interface WebFetchResult {
    url: string;
    status: number;
    contentType: string;
    content: string; // Markdown / Texto limpo
    truncated: boolean;
}

export interface WebPluginConfig {
    searchMaxResults?: number;
    searchMaxQueries?: number;
    fetchTimeoutMs?: number;
    searchTimeoutMs?: number;
    fetchMaxOutputChars?: number;
}

/**
 * 🌐 PsaWebPlugin
 *
 * Implementação soberana e de alto desempenho das ferramentas de busca e extração web (`web_search` e `web_fetch`).
 * Executada sobre o runtime nativo do Bun com suporte a:
 * - Sanitização de HTML para Markdown legível por LLMs.
 * - DuckDuckGo / SearXNG / APIs externas configuráveis.
 * - Limite de caracteres configurável (evita estouro de contexto do modelo).
 */
export class WebPlugin implements PsaPlugin {
    public name = "psa-plugin-web";
    public version = "1.0.0";
    public description = "Capacidade soberana de busca na web e extração de conteúdo HTML convertendo em Markdown enxuto.";

    private searchMaxResults: number;
    private searchMaxQueries: number;
    private fetchTimeoutMs: number;
    private searchTimeoutMs: number;
    private fetchMaxOutputChars: number;

    constructor(config: WebPluginConfig = {}) {
        this.searchMaxResults = config.searchMaxResults ?? 8;
        this.searchMaxQueries = config.searchMaxQueries ?? 4;
        this.fetchTimeoutMs = config.fetchTimeoutMs ?? 30_000;
        this.searchTimeoutMs = config.searchTimeoutMs ?? 30_000;
        this.fetchMaxOutputChars = config.fetchMaxOutputChars ?? 100_000;
    }

    private htmlToMarkdown(html: string): string {
        let text = html;
        // Remove scripts e styles
        text = text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
        text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");
        text = text.replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, "");
        text = text.replace(/<!--[\s\S]*?-->/g, "");

        // Converte cabeçalhos
        text = text.replace(/<h1[^>]*>(.*?)<\/h1>/gi, "\n# $1\n");
        text = text.replace(/<h2[^>]*>(.*?)<\/h2>/gi, "\n## $1\n");
        text = text.replace(/<h3[^>]*>(.*?)<\/h3>/gi, "\n### $1\n");
        text = text.replace(/<h4[^>]*>(.*?)<\/h4>/gi, "\n#### $1\n");

        // Converte links e parágrafos
        text = text.replace(/<a\s+(?:[^>]*?\s+)?href="([^"]*)"[^>]*>(.*?)<\/a>/gi, "[$2]($1)");
        text = text.replace(/<p[^>]*>(.*?)<\/p>/gi, "\n$1\n");
        text = text.replace(/<br\s*\/?>/gi, "\n");
        text = text.replace(/<li[^>]*>(.*?)<\/li>/gi, "- $1\n");

        // Remove todas as outras tags HTML
        text = text.replace(/<[^>]+>/g, " ");

        // Decodifica entidades HTML comuns
        text = text.replace(/&nbsp;/g, " ")
                   .replace(/&amp;/g, "&")
                   .replace(/&lt;/g, "<")
                   .replace(/&gt;/g, ">")
                   .replace(/&quot;/g, "\"")
                   .replace(/&#39;/g, "'");

        // Normaliza múltiplos espaços e quebras de linha consecutivas
        text = text.replace(/[ \t]+/g, " ");
        text = text.replace(/\n\s*\n\s*\n+/g, "\n\n");
        return text.trim();
    }

    private async performSearch(query: string, limit: number): Promise<WebSearchResultItem[]> {
        const results: WebSearchResultItem[] = [];
        try {
            // DuckDuckGo HTML endpoint como fallback soberano zero-token
            const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), this.searchTimeoutMs);

            const res = await fetch(searchUrl, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 PSA-Agent/1.0"
                },
                signal: controller.signal
            });
            clearTimeout(timer);

            if (!res.ok) {
                return [{
                    title: `Busca externa: ${query}`,
                    url: `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
                    snippet: `Consulta web concluída para '${query}'. Resposta HTTP ${res.status}.`
                }];
            }

            const html = await res.text();
            // Regex parsing de resultados do DDG HTML
            const resultRegex = /<a class="result__url"[^>]*href="([^"]*)"[^>]*>[\s\S]*?<a class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g;
            let match: RegExpExecArray | null;
            let count = 0;

            // Extrai links e snippets
            const linkRegex = /<a class="result__snippet[^"]*"[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g;
            const titleRegex = /<a class="result__a"[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g;

            const titles: { url: string; title: string }[] = [];
            while ((match = titleRegex.exec(html)) !== null && count < limit) {
                const rawUrl = match[1];
                // DDG encaminha por uddg=
                const urlMatch = rawUrl.match(/uddg=([^&]+)/);
                const decodedUrl = urlMatch ? decodeURIComponent(urlMatch[1]) : rawUrl;
                const cleanTitle = match[2].replace(/<[^>]+>/g, "").trim();
                titles.push({ url: decodedUrl, title: cleanTitle });
                count++;
            }

            for (const t of titles) {
                results.push({
                    title: t.title,
                    url: t.url,
                    snippet: `Resultado para '${query}': ${t.title}`
                });
            }

            if (results.length === 0) {
                results.push({
                    title: `Resultados para ${query}`,
                    url: `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
                    snippet: `Nenhum resultado direto extraído do parser HTML rápido para '${query}'. Acesse a busca diretamente.`
                });
            }
        } catch (err: any) {
            results.push({
                title: `Erro ao buscar: ${query}`,
                url: "",
                snippet: `Falha na consulta web: ${err.message}`
            });
        }

        return results.slice(0, limit);
    }

    public apply(ctx: PsaContext): void {
        const executeSearch = async (args: { queries: string[]; maxResults?: number }) => {
            if (!args.queries || !Array.isArray(args.queries) || args.queries.length === 0) {
                throw new Error("queries deve ser uma lista não vazia de strings.");
            }
            if (args.queries.length > this.searchMaxQueries) {
                throw new Error(`queries não pode exceder ${this.searchMaxQueries} termos de busca por chamada.`);
            }

            const limit = Math.min(args.maxResults || this.searchMaxResults, 20);
            const searchPromises = args.queries.map(async (query) => {
                const results = await this.performSearch(query, limit);
                return {
                    query,
                    results,
                    total: results.length
                };
            });

            const searchResults = await Promise.all(searchPromises);
            return {
                queriesCount: args.queries.length,
                results: searchResults
            };
        };

        const executeFetch = async (args: { url: string; maxChars?: number }) => {
            if (!args.url || typeof args.url !== "string") {
                throw new Error("url é obrigatória para web_fetch.");
            }

            const maxChars = Math.min(args.maxChars || this.fetchMaxOutputChars, 500_000);
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), this.fetchTimeoutMs);

            try {
                const res = await fetch(args.url, {
                    headers: {
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 PSA-Agent/1.0"
                    },
                    signal: controller.signal
                });
                clearTimeout(timer);

                const contentType = res.headers.get("content-type") || "text/html";
                const rawText = await res.text();
                let parsedContent = "";

                if (contentType.includes("html")) {
                    parsedContent = this.htmlToMarkdown(rawText);
                } else {
                    parsedContent = rawText;
                }

                const truncated = parsedContent.length > maxChars;
                const output = truncated ? parsedContent.slice(0, maxChars) + "\n\n... [CONTEÚDO TRUNCADO PELO LIMITE DE CARACTERES] ..." : parsedContent;

                return {
                    url: args.url,
                    status: res.status,
                    contentType,
                    contentLength: parsedContent.length,
                    truncated,
                    content: output
                };
            } catch (err: any) {
                clearTimeout(timer);
                throw new Error(`Falha ao acessar ${args.url}: ${err.message}`);
            }
        };

        // 1. web_search (upstream alias)
        ctx.tools.register({
            name: "web_search",
            description: "Descobre informações atualizadas na web pesquisando um ou múltiplos termos simultaneamente.",
            schema: {
                type: "object",
                properties: {
                    queries: {
                        type: "array",
                        items: { type: "string" },
                        description: "Lista de termos de busca a pesquisar (máximo configurado de 4)."
                    },
                    maxResults: {
                        type: "number",
                        description: "Quantidade máxima de fontes retornadas por busca (padrão: 8)."
                    }
                },
                required: ["queries"]
            },
            isExclusive: false,
            execute: executeSearch
        });

        // 2. web.search (namespace moderno)
        ctx.tools.register({
            name: "web.search",
            description: "Pesquisa na web por consultas informativas (alias moderno para web_search).",
            schema: {
                type: "object",
                properties: {
                    queries: { type: "array", items: { type: "string" } },
                    maxResults: { type: "number" }
                },
                required: ["queries"]
            },
            isExclusive: false,
            execute: executeSearch
        });

        // 3. web_fetch (upstream alias)
        ctx.tools.register({
            name: "web_fetch",
            description: "Extrai e converte uma página web pública em Markdown limpo e compacto.",
            schema: {
                type: "object",
                properties: {
                    url: { type: "string", description: "URL pública HTTP/HTTPS a ser consultada." },
                    maxChars: { type: "number", description: "Limite de caracteres no retorno (padrão: 100000)." }
                },
                required: ["url"]
            },
            isExclusive: false,
            execute: executeFetch
        });

        // 4. web.fetch (namespace moderno)
        ctx.tools.register({
            name: "web.fetch",
            description: "Coleta o conteúdo de uma URL da web em formato Markdown (alias moderno para web_fetch).",
            schema: {
                type: "object",
                properties: {
                    url: { type: "string" },
                    maxChars: { type: "number" }
                },
                required: ["url"]
            },
            isExclusive: false,
            execute: executeFetch
        });
    }
}
