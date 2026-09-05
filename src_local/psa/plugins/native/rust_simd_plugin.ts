import type { PsaPlugin } from "../../kernel/psa_plugin.ts";
import type { PsaContext } from "../../kernel/psa_context.ts";
import * as path from "node:path";
import * as fs from "node:fs";

/**
 * 🦀 RustSimdPlugin
 *
 * Plugin nativo que encapsula o binário/DLL Rust (`analyzer_lib.dll` / `analyzer.exe`)
 * via Bun:FFI para aceleração de AST, cálculo de complexidade ciclomática e hashing SIMD.
 */
export class RustSimdPlugin implements PsaPlugin {
    public name = "native-rust-simd";
    public version = "2.0.0";
    public description = "Acelerador Nativo Rust: Análise de complexidade AST e Hashing SIMD de 64-bits via Bun:FFI.";

    private ffiLib: any = null;
    private isAvailable = false;
    private resolvedLibPath: string | null = null;

    public apply(ctx: PsaContext): void {
        const workspace = ctx.workspaceRoot;
        const isWin = process.platform === "win32";
        const suffix = isWin ? "dll" : process.platform === "darwin" ? "dylib" : "so";
        const libName = `analyzer_lib.${suffix}`;

        const searchPaths = [
            path.join(workspace, "src_native", "analyzer", "target", "release", libName),
            path.join(workspace, "src_native", "analyzer", "target", "debug", libName),
            path.join(workspace, "bin", libName)
        ];

        this.resolvedLibPath = searchPaths.find(p => fs.existsSync(p)) || null;

        // Tentativa de carregar via Bun:FFI
        try {
            if (this.resolvedLibPath && typeof (globalThis as any).Bun?.dlopen === "function") {
                const { dlopen, FFIType } = (globalThis as any).Bun;
                this.ffiLib = dlopen(this.resolvedLibPath, {
                    calculate_complexity: {
                        args: [FFIType.cstring],
                        returns: FFIType.i32
                    },
                    fast_hash: {
                        args: [FFIType.cstring],
                        returns: FFIType.u64
                    }
                });
                this.isAvailable = true;
            }
        } catch {
            this.ffiLib = null;
            this.isAvailable = false;
        }

        // 1. Ferramenta de cálculo de complexidade via Rust
        ctx.tools.register({
            name: "native.rust_complexity",
            description: "Calcula a complexidade ciclomática de um código fonte usando o motor nativo compilado em Rust.",
            schema: {
                type: "object",
                properties: {
                    content: { type: "string", description: "Código-fonte a analisar" },
                    filePath: { type: "string", description: "Caminho do arquivo (opcional)" }
                }
            },
            isExclusive: false,
            execute: async (args: { content?: string; filePath?: string }) => {
                let code = args.content || "";
                if (!code && args.filePath) {
                    const full = path.resolve(workspace, args.filePath);
                    if (fs.existsSync(full)) {
                        code = await fs.promises.readFile(full, "utf-8");
                    }
                }

                if (!code) {
                    return { success: false, error: "Nenhum código ou arquivo fornecido." };
                }

                if (this.isAvailable && this.ffiLib) {
                    try {
                        const strBuf = Buffer.from(code + "\0", "utf8");
                        const complexity = this.ffiLib.symbols.calculate_complexity(strBuf);
                        return {
                            success: true,
                            complexity: Number(complexity),
                            engine: "rust_simd_native",
                            libPath: this.resolvedLibPath
                        };
                    } catch (e: any) {
                        return { success: false, error: e.message, fallbackComplexity: this.fallbackComplexity(code) };
                    }
                }

                // Fallback heurístico em TS se Rust FFI não estiver disponível
                return {
                    success: true,
                    complexity: this.fallbackComplexity(code),
                    engine: "typescript_heuristic_fallback"
                };
            }
        });

        // 2. Ferramenta de hashing ultra-rápido de 64-bits
        ctx.tools.register({
            name: "native.rust_hash",
            description: "Gera um hash não-criptográfico de 64-bits ultra-rápido via SIMD em Rust.",
            schema: {
                type: "object",
                properties: {
                    content: { type: "string", description: "Texto a hashear" }
                },
                required: ["content"]
            },
            isExclusive: false,
            execute: async (args: { content: string }) => {
                const text = args.content || "";
                if (this.isAvailable && this.ffiLib) {
                    try {
                        const strBuf = Buffer.from(text + "\0", "utf8");
                        const hash64 = this.ffiLib.symbols.fast_hash(strBuf);
                        return {
                            success: true,
                            hash: hash64.toString(16),
                            engine: "rust_simd_native"
                        };
                    } catch {
                        // fallback
                    }
                }

                // Fallback FNV-1a 64-bit em TypeScript
                let h = 0xcbf29ce484222325n;
                const prime = 0x100000001b3n;
                const buf = Buffer.from(text, "utf8");
                for (let i = 0; i < buf.length; i++) {
                    h ^= BigInt(buf[i]);
                    h = (h * prime) & 0xffffffffffffffffn;
                }
                return {
                    success: true,
                    hash: h.toString(16),
                    engine: "typescript_fnv1a_fallback"
                };
            }
        });

        // 3. Ferramenta de status do subsistema Rust
        ctx.tools.register({
            name: "native.rust_status",
            description: "Retorna o status do bridge nativo Rust SIMD (disponibilidade FFI, caminho da DLL).",
            schema: { type: "object", properties: {} },
            isExclusive: false,
            execute: async () => {
                return {
                    available: this.isAvailable,
                    libPath: this.resolvedLibPath,
                    engine: this.isAvailable ? "Rust SIMD native library (Bun:FFI)" : "TypeScript Fallback Engine",
                    version: this.version
                };
            }
        });
    }

    private fallbackComplexity(code: string): number {
        const patterns = [
            /\bif\b/g, /\belse\b/g, /\bfor\b/g, /\bwhile\b/g,
            /\bcase\b/g, /\bcatch\b/g, /\b&&/g, /\|\|/g, /\?/g
        ];
        let c = 1;
        for (const p of patterns) {
            const m = code.match(p);
            if (m) c += m.length;
        }
        return c;
    }
}
