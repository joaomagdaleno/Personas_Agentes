# 🏛️ Guia de Desenvolvimento de Plugins — Personas & Agentes (PSA)

O ecossistema **Personas & Agentes (PSA)** é 100% orientado a plugins. No PSA, **todas as personas, aceleradores nativos (Zig, Rust, Go), ferramentas de auditoria e integrações MCP operam como plugins desacoplados** sob a regência do Micro-Kernel [`PsaContext`](file:///src_local/psa/kernel/psa_context.ts).

---

## 🔌 1. Anatomia Básica de um Plugin

Qualquer módulo que implemente a interface `PsaPlugin` pode ser carregado estaticamente ou descoberto dinamicamente em runtime.

```typescript
import type { PsaPlugin } from "./psa_plugin.ts";
import type { PsaContext } from "./psa_context.ts";

export class MeuNovoPlugin implements PsaPlugin {
    public readonly name = "meu-novo-plugin";
    public readonly version = "1.0.0";
    public readonly description = "Plugin personalizado de exemplo";

    public apply(ctx: PsaContext): void {
        // Registra ferramentas, serviços ou escuta eventos
        ctx.tools.register({
            name: "meu_plugin.executar",
            description: "Executa uma ação personalizada",
            schema: {
                type: "object",
                properties: {
                    parametro: { type: "string", description: "Valor de entrada" }
                },
                required: ["parametro"]
            },
            isExclusive: false,
            execute: async (args: { parametro: string }) => {
                return {
                    status: "success",
                    mensagem: `Recebido: ${args.parametro}`
                };
            }
        });
    }

    public teardown?(ctx: PsaContext): void {
        // Limpeza opcional na desmontagem do plugin
    }
}
```

---

## 🛠️ 2. Registro e Execução de Ferramentas (`PsaToolService`)

Ferramentas registradas por plugins ficam imediatamente disponíveis para a CLI (`psa`, `sovereign`), Servidor HTTP/SSE (`psa_server`) e para a interface desktop nativa **WinUI 3**:

```typescript
// Registrando uma ferramenta
ctx.tools.register({
    name: "seguranca.scan",
    description: "Analisa vulnerabilidades de arquivo",
    schema: {
        type: "object",
        properties: {
            caminho: { type: "string" }
        }
    },
    execute: async (args) => {
        return { vulnerabilidades: [] };
    }
});

// Executando programaticamente
const resultado = await ctx.tools.executeTool("seguranca.scan", { caminho: "main.ts" });
```

---

## 🧠 3. Inversão de Controle (IoC) & Provedores de Serviço

O `PsaContext` inclui um container de injeção de dependências universal:

```typescript
// 1. Injetando um serviço a partir de um plugin
ctx.registerService("meuServico", new MeuServico());

// 2. Consumindo um serviço em qualquer outro plugin ou no Orchestrator
const servico = ctx.getService<MeuServico>("meuServico");
if (servico) {
    servico.processar();
}
```

Serviços registrados por padrão pelo `Orchestrator`:
- `"orchestrator"`: O despachante mestre do sistema.
- `"cache"`: `CacheManager` com hash incremental de arquivos.
- `"contextEngine"`: Motor de compreensão semântica e DNA do projeto.
- `"memoryEngine"`: Memória episódica de longo prazo e busca de padrões.
- `"testEngine"`: Executor poliglota de suítes de testes.

---

## 📡 4. Barramento de Eventos e Hooks (`PsaEventBus`)

Permite a comunicação reativa entre plugins e interceptações waterfall:

```typescript
// Escutando eventos
ctx.events.on("tool:after_call", async (payload) => {
    console.log(`Ferramenta ${payload.toolName} executada.`);
});

// Disparando eventos customizados
ctx.events.emit("alerta:critico", { motivo: "Falha de integridade" });
```

---

## 🚀 5. Autodescoberta Dinâmica e Hot-Reloading (`PsaPluginLoader`)

Qualquer arquivo `.ts` colocado dentro de um diretório de plugins pode ser descoberto e instanciado em runtime sem reiniciar a aplicação:

```typescript
// Carrega automaticamente todos os plugins contidos em uma pasta:
await ctx.loader.loadFromDirectory("./plugins_externos");

// Ou carregar um arquivo específico:
await ctx.loader.loadFromFile("./plugins/meu_plugin.ts");

// Hot-Reload de um plugin modificado:
await ctx.loader.reloadPlugin("./plugins/meu_plugin.ts");
```

---

## ⚡ 6. Aceleradores Nativos (FFI & gRPC)

Para criar plugins que exigem alta performance nativa:

- **Bun:FFI (C / Zig / Rust dlls)**:
  Exemplo em [`src_local/psa/plugins/native/zig_analyzer_plugin.ts`](file:///src_local/psa/plugins/native/zig_analyzer_plugin.ts).
- **gRPC (Go Hub)**:
  Exemplo em [`src_local/psa/plugins/native/go_hub_plugin.ts`](file:///src_local/psa/plugins/native/go_hub_plugin.ts) com circuit breaker e buffers de até 128MB.
- **Rust SIMD**:
  Exemplo em [`src_local/psa/plugins/native/rust_simd_plugin.ts`](file:///src_local/psa/plugins/native/rust_simd_plugin.ts) com fallback gracioso em TypeScript.

---

## 🧪 7. Testando seu Plugin

Basta usar a suíte nativa `bun:test`:

```typescript
import { describe, it, expect } from "bun:test";
import { PsaContext } from "../src_local/psa/kernel/psa_context.ts";
import { MeuNovoPlugin } from "./meu_novo_plugin.ts";

describe("MeuNovoPlugin Tests", () => {
    it("deve registrar e executar com sucesso", async () => {
        const ctx = new PsaContext();
        await ctx.use(new MeuNovoPlugin());

        expect(ctx.plugins.has("meu-novo-plugin")).toBe(true);
        expect(ctx.tools.has("meu_plugin.executar")).toBe(true);

        const res = await ctx.tools.executeTool("meu_plugin.executar", { parametro: "teste" });
        expect(res.status).toBe("success");
    });
});
```

Execute os testes com:
```bash
bun test
```
