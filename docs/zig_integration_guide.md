# Guia de Integração e Arquitetura Zig PhD ⚡

Este documento detalha o suporte completo ao ecossistema **Zig** implementado no projeto, cobrindo tanto a análise nativa de alta performance do próprio framework quanto a capacidade de auditoria e auto-cura (self-healing) para códigos escritos em Zig.

---

## 1. Por que Zig? (Qualidades e Benefícios Lógicos)

O Zig é uma linguagem de programação de sistemas moderna focada em robustez, legibilidade e ótimo desempenho. Ela traz vantagens ímpares para o nosso framework de agentes inteligentes:

1. **Ausência de Fluxo Oculto (No Hidden Control Flow):** No Zig, todo desvio, alocação ou erro é explícito. Não existem exceções implícitas ou macros que escondam a lógica real. Isso simplifica drasticamente a análise de código realizada pelos nossos agentes de IA e analisadores de integridade.
2. **Gerenciamento Seguro e Explícito de Memória:** O Zig exige a passagem explícita de um `Allocator` para qualquer estrutura que necessite de heap. Isso permite que nossos agentes monitorem vazamentos de recursos (memory leaks) em tempo de design de forma muito mais simples (por exemplo, auditando o uso do padrão `defer allocator.destroy(ptr)`).
3. **Execução em Tempo de Compilação (`comptime`):** Permite resolver tipos e gerar estruturas estáticas sem overhead de runtime e sem complexidade de macros.
4. **Interoperabilidade C Nativa (Zero Overhead FFI):** O Zig expõe uma compatibilidade perfeita com a ABI de C, facilitando a criação de bibliotecas compartilhadas carregáveis pelo Bun de forma direta e ultrarrápida.
5. **Compilação Cruzada out-of-the-box:** O compilador Zig possui suporte integrado para gerar binários de qualquer SO e arquitetura instantaneamente.

---

## 2. Estrutura da Integração Zig no Projeto

Nossa integração cobre dois aspectos cruciais do sistema:

### A. Infraestrutura Nativa (FFI com Bun)

Aproveitamos o compilador portátil do Zig para construir uma biblioteca dinâmica de alta performance carregada diretamente pelo Bun via FFI (`dlopen`).

*   **Código-Fonte Nativo:** `src_native/zig_analyzer/analyzer.zig`
    *   `calculate_entropy`: Calcula a entropia de Shannon de uma string de código em tempo recorde (escala de microssegundos), usada para detectar chaves criptográficas, segredos expostos ou código propositalmente ofuscado.
    *   `check_unsafe_patterns`: Um scanner linear ultrarrápido para identificar padrões de cegueira operacional ou inseguros (como `eval(`, `system(`, `catch unreachable`).
*   **Ponte no Core:** `src_local/engines/healing/resilience_healing_architect_service.ts` (`NativeFFIBridge`)
    *   Carrega a biblioteca `libzig_analyzer.so` em tempo de inicialização.
    *   Expõe métodos estáticos de fallback em TypeScript puro caso a biblioteca nativa esteja indisponível em determinados ambientes, garantindo resiliência operacional total.

### B. Ciclo de Auditoria e Auto-Cura (Self-Healing) de Zig

O projeto agora tem a capacidade de atuar ativamente sobre projetos escritos em Zig:

1. **Agente Especialista Zig (`agents_registry/zig.json`):**
   *   Define o papel e as capacidades dos agentes responsáveis por auditar e corrigir problemas em projetos Zig (como `bolt` de auditoria, `metric` de complexidade, `scribe` de documentação/código).
2. **Template de Geração de Projetos Zig (`src_local/metadata/templates/zig.template`):**
   *   Estrutura base para a criação idiomática de novos módulos ou agentes Zig do zero utilizando padrões robustos.
3. **Execução Cirúrgica de Testes (`TestRunner`):**
   *   `src_local/engines/automation/test_runner.ts` estendido com métodos específicos de execução Zig.
   *   **Selective Testing:** Ao alterar arquivos `.zig`, o `TestRunner` dispara cirurgicamente `zig test <arquivo>` para obter feedback instantâneo do compilador e de testes unitários.
   *   **Suite Discovery:** Se houver um arquivo `build.zig` no diretório alvo, ele executa automaticamente `zig build test` integrando a suíte nativa inteira ao ecossistema do orquestrador.

---

## 3. Como Compilar a Biblioteca Nativa Zig

O ambiente já vem configurado com o compilador portátil do Zig. Se você precisar recompilar a biblioteca nativa manual ou automaticamente, utilize o seguinte comando na raiz do projeto:

```bash
/home/jules/zig-0.13.0/zig build-lib -dynamic -O ReleaseFast -femit-bin=src_native/zig_analyzer/libzig_analyzer.so src_native/zig_analyzer/analyzer.zig
```

---

## 4. Testes do Ecossistema Zig

Criamos uma suíte completa de verificação para garantir o funcionamento estável de toda a engrenagem Zig:

```bash
bun test tests/zig_native_ffi.test.ts
```

Esta suíte valida de ponta a ponta:
*   O carregamento dinâmico FFI do `libzig_analyzer.so`.
*   A exatidão do cálculo de entropia Shannon contra fallbacks de TypeScript.
*   A eficácia do casamento de padrões de segurança e integridade do Zig.
*   O ciclo de feedback do `TestRunner` escrevendo, compilando e testando dinamicamente um arquivo Zig temporário.
