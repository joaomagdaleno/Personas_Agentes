import * as fs from "node:fs";
import * as path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();
const wasmSrcDir = path.join(root, "src_native", "wasm_agents");
const wasmOutDir = path.join(root, "bin", "wasm");

export function buildWasmAgents(): boolean {
    console.log("🛠️ [WASM Builder] Verificando compilador Zig para WASI WebAssembly...");

    try {
        const versionOut = execSync("zig version", { stdio: "pipe" }).toString().trim();
        console.log(`✅ [WASM Builder] Compilador Zig v${versionOut} detectado.`);
    } catch {
        console.log("ℹ️ [WASM Builder] Compilador Zig não disponível no PATH. O runtime utilizará a sandbox WASI otimizada em TypeScript.");
        return false;
    }

    if (!fs.existsSync(wasmOutDir)) {
        fs.mkdirSync(wasmOutDir, { recursive: true });
    }

    if (!fs.existsSync(wasmSrcDir)) {
        console.warn(`⚠️ [WASM Builder] Diretório de fontes WASM não encontrado: ${wasmSrcDir}`);
        return false;
    }

    const files = fs.readdirSync(wasmSrcDir).filter(f => f.endsWith(".zig"));
    let compiledCount = 0;

    for (const file of files) {
        const agentName = path.basename(file, ".zig") + ".wasm";
        const srcPath = path.join(wasmSrcDir, file);
        const outPath = path.join(wasmOutDir, agentName);

        try {
            console.log(`🔨 [WASM Builder] Compilando ${file} -> bin/wasm/${agentName}...`);
            execSync(`zig build-exe -O ReleaseSmall -target wasm32-wasi -fno-entry -rdynamic "${srcPath}" -femit-bin="${outPath}"`, {
                cwd: root,
                stdio: "inherit"
            });
            if (fs.existsSync(outPath)) {
                const sizeKb = (fs.statSync(outPath).size / 1024).toFixed(1);
                console.log(`   ✅ Bytecode WASI gerado: ${agentName} (${sizeKb} KB)`);
                compiledCount++;
            }
        } catch (err: any) {
            console.warn(`   ⚠️ Falha ao compilar ${file}: ${err.message}`);
        }
    }

    console.log(`✨ [WASM Builder] ${compiledCount}/${files.length} micro-agentes WASM compilados com sucesso.`);
    return compiledCount > 0;
}

if (import.meta.main || process.argv[1]?.includes("build_wasm.ts")) {
    buildWasmAgents();
}
