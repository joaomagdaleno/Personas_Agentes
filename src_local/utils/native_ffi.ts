import { dlopen, FFIType, suffix } from "bun:ffi";
import winston from "winston";
import * as path from "path";
import * as fs from "fs";

const logger = winston.child({ module: "NativeFFI" });

/**
 * ⚡ NativeFFIBridge (Bun FFI High-Fidelity Bridge).
 * Carrega dinamicamente a biblioteca nativa C/Rust (.dll/.so) diretamente na memória do Bun,
 * permitindo chamadas de função com latência zero (sub-milissegundo) sem overhead gRPC/HTTP.
 */
export class NativeFFIBridge {
    private static instance: NativeFFIBridge | null = null;
    private lib: any = null;
    private isAvailable: boolean = false;

    private constructor(projectRoot: string = process.cwd()) {
        this.initLibrary(projectRoot);
    }

    public static getInstance(projectRoot?: string): NativeFFIBridge {
        if (!NativeFFIBridge.instance) {
            NativeFFIBridge.instance = new NativeFFIBridge(projectRoot);
        }
        return NativeFFIBridge.instance;
    }

    private initLibrary(projectRoot: string) {
        try {
            const libName = `analyzer_lib.${suffix}`;
            const searchPaths = [
                path.join(projectRoot, "src_native", "analyzer", "target", "release", libName),
                path.join(projectRoot, "src_native", "analyzer", "target", "debug", libName),
                path.join(projectRoot, "bin", libName)
            ];

            const libPath = searchPaths.find(p => fs.existsSync(p));

            if (!libPath) {
                logger.info("ℹ️ [Bun:FFI] Biblioteca nativa não encontrada em disco. Usando fallback estático TS.");
                return;
            }

            this.lib = dlopen(libPath, {
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
            logger.info(`⚡ [Bun:FFI] Biblioteca nativa carregada com sucesso: ${libPath}`);
        } catch (err: any) {
            logger.warn(`⚠️ [Bun:FFI] Não foi possível inicializar FFI nativo: ${err.message}. Ativando modo fallback.`);
            this.isAvailable = false;
        }
    }

    public isNativeAvailable(): boolean {
        return this.isAvailable;
    }

    /**
     * Calcula complexidade ciclomática nativa via Rust/C FFI com latência sub-milissegundo.
     * Fallback para contagem JS se FFI indisponível.
     */
    public calculateComplexityNative(codeContent: string): number {
        if (!this.isAvailable || !this.lib) {
            // Fallback TS: mesma lógica que o Rust para consistência
            const keywords = ["if ", "if(", "for ", "for(", "while ", "while(", "catch ", "catch(", "case "];
            let count = 1;
            for (const kw of keywords) {
                let idx = -1;
                while ((idx = codeContent.indexOf(kw, idx + 1)) !== -1) count++;
            }
            return count;
        }
        try {
            const buffer = Buffer.from(codeContent + "\0", "utf-8");
            return this.lib.symbols.calculate_complexity(buffer);
        } catch (e: any) {
            logger.error(`❌ [Bun:FFI] Erro na execução FFI (complexity): ${e.message}`);
            return 1;
        }
    }

    /**
     * ⚡ Calcula hash FNV1a de 64-bit nativo via Rust/C FFI.
     * Ideal para fingerprinting ultrarrápido de código-fonte.
     */
    public fastHashNative(codeContent: string): bigint {
        if (!this.isAvailable || !this.lib) {
            // Fallback TS: FNV1a 64-bit em JS
            let hasher = 0xcbf29ce484222325n;
            const encoder = new TextEncoder();
            const bytes = encoder.encode(codeContent);
            for (const b of bytes) {
                hasher ^= BigInt(b);
                hasher = (hasher * 0x100000001b3n) & 0xFFFFFFFFFFFFFFFFn;
            }
            return hasher;
        }
        try {
            const buffer = Buffer.from(codeContent + "\0", "utf-8");
            return this.lib.symbols.fast_hash(buffer);
        } catch (e: any) {
            logger.error(`❌ [Bun:FFI] Erro na execução FFI (hash): ${e.message}`);
            return 0n;
        }
    }

    /**
     * Limpeza do handle de biblioteca nativa FFI.
     */
    public close() {
        if (this.lib && typeof this.lib.close === "function") {
            this.lib.close();
            this.lib = null;
            this.isAvailable = false;
            logger.info("🔌 [Bun:FFI] Biblioteca nativa descarregada da memória.");
        }
    }

    /**
     * 🧹 Suporte ao operador 'using' / 'await using' (Explicit Resource Management).
     */
    public [Symbol.dispose](): void {
        this.close();
    }

    public async [Symbol.asyncDispose](): Promise<void> {
        this.close();
    }
}
