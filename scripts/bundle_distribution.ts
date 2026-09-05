import * as fs from "node:fs";
import * as path from "node:path";
import { execSync } from "node:child_process";

console.log("📦 [Distribution Bundle] Iniciando empacotamento para distribuição soberana...");

const root = process.cwd();
const distDir = path.join(root, "dist");

// 1. Limpar e recriar diretório dist
if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(path.join(distDir, "bin"), { recursive: true });
fs.mkdirSync(path.join(distDir, "winui"), { recursive: true });

// 2. Compilar standalone personas-engine.exe e model-downloader.exe com Bun
console.log("🔨 [1/5] Compilando binários executáveis autônomos...");
try {
    execSync(`bun build --compile --minify --external node-llama-cpp --external "@node-llama-cpp/*" ./src_local/cli/sovereign.ts --outfile ./dist/bin/personas-engine.exe`, {
        cwd: root,
        stdio: "inherit"
    });
    execSync(`bun build --compile --minify ./scripts/download_model.ts --outfile ./dist/bin/model-downloader.exe`, {
        cwd: root,
        stdio: "inherit"
    });
    console.log("   ✅ Compilados: personas-engine.exe e model-downloader.exe");
} catch (err: any) {
    console.error("❌ Falha ao compilar binários autônomos:", err.message);
}

// Cria diretório para modelos na distribuição
fs.mkdirSync(path.join(distDir, "models"), { recursive: true });
fs.writeFileSync(path.join(distDir, "models", "README.txt"), 
    "Diretório reservado para pesos locais do modelo de IA (SLM) em formato .gguf.\r\n" +
    "Execute bin\\model-downloader.exe para baixar automaticamente o modelo recomendado.\r\n"
);

// 3. Copiar aceleradores nativos e runtime Llama.cpp (Go Hub, Rust SIMD, Zig FFI, Llama-Server)
console.log("⚙️ [2/5] Copiando aceleradores nativos e runtime Llama.cpp...");
const nativeFiles = [
    { src: "bin/hub.exe", fallback: "src_native/hub/hub.exe", dest: "dist/bin/hub.exe" },
    { src: "bin/cert_gen.exe", fallback: "src_native/hub/tls_certs/cert_gen.exe", dest: "dist/bin/cert_gen.exe" },
    { src: "bin/analyzer_lib.dll", fallback: "src_native/analyzer/target/release/analyzer_lib.dll", dest: "dist/bin/analyzer_lib.dll" },
    { src: "bin/analyzer.dll", fallback: "src_native/zig_analyzer/analyzer.dll", dest: "dist/bin/analyzer.dll" }
];

for (const item of nativeFiles) {
    let sourcePath = path.join(root, item.src);
    if (!fs.existsSync(sourcePath) && item.fallback) {
        sourcePath = path.join(root, item.fallback);
    }
    if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, path.join(root, item.dest));
        console.log(`   ✅ Copiado: ${path.basename(sourcePath)} -> ${item.dest}`);
    } else {
        console.warn(`   ⚠️ Binário não encontrado: ${item.src}`);
    }
}

// Copia binários do Llama.cpp (llama-server.exe, llama-cli.exe e DLLs de aceleração CPU Zen/AVX)
const binDir = path.join(root, "bin");
if (fs.existsSync(binDir)) {
    const binFiles = fs.readdirSync(binDir);
    let llamaCount = 0;
    for (const f of binFiles) {
        if ((f.startsWith("llama") || f.startsWith("ggml")) && (f.endsWith(".exe") || f.endsWith(".dll"))) {
            fs.copyFileSync(path.join(binDir, f), path.join(distDir, "bin", f));
            llamaCount++;
        }
    }
    console.log(`   ✅ Copiados ${llamaCount} arquivos do motor Llama.cpp para dist/bin/`);
}

// 4. Copiar certificados mTLS
console.log("🔐 [3/5] Copiando certificados mTLS de canal seguro...");
const tlsSourceDir = path.join(root, "src_native/hub/tls_certs");
const tlsDestDir = path.join(distDir, "bin/tls_certs");
fs.mkdirSync(tlsDestDir, { recursive: true });
if (fs.existsSync(tlsSourceDir)) {
    const certFiles = ["ca.crt", "ca.key", "server.crt", "server.key", "client.crt", "client.key"];
    for (const cf of certFiles) {
        const cp = path.join(tlsSourceDir, cf);
        if (fs.existsSync(cp)) {
            fs.copyFileSync(cp, path.join(tlsDestDir, cf));
        }
    }
    console.log("   ✅ Certificados mTLS incluídos no pacote de distribuição.");
}

// 5. Copiar binários da UI Desktop WinUI 3
console.log("🖥️ [4/5] Copiando interface nativa WinUI 3...");
const winuiSrc = path.join(root, "src_native/winui/bin/x64/Release/net8.0-windows10.0.19041.0");
if (fs.existsSync(winuiSrc)) {
    fs.cpSync(winuiSrc, path.join(distDir, "winui"), { recursive: true });
    console.log("   ✅ Binários WinUI 3 copiados para dist/winui/");
} else {
    console.warn("   ⚠️ WinUI 3 Release não encontrado em " + winuiSrc);
}

// 6. Copiar Censo de Identidade e Catálogo de Agentes
console.log("🏛️ [5/5] Copiando registros de agentes e manifesto soberano...");
if (fs.existsSync(path.join(root, "identity_census.json"))) {
    fs.copyFileSync(path.join(root, "identity_census.json"), path.join(distDir, "identity_census.json"));
}
if (fs.existsSync(path.join(root, "agents_registry"))) {
    fs.cpSync(path.join(root, "agents_registry"), path.join(distDir, "agents_registry"), { recursive: true });
}

// 7. Criar README de distribuição
const readmeContent = `# 🏛️ Personas & Agentes (PSA) — Pacote Autônomo de Distribuição

Este pacote contém o ecossistema completo do **Personas & Agentes** compilado e pronto para execução autônoma em qualquer máquina Windows (x64) com arquitetura AMD Ryzen / Intel.

## 🚀 Como Executar

### 1. Linha de Comando Soberana (CLI Headless)
\`\`\`powershell
# Verificar status do hardware, binários nativos e plugins
.\\bin\\personas-engine.exe status

# Executar diagnóstico 360° do sistema
.\\bin\\personas-engine.exe audit
\`\`\`

### 2. Interface Desktop Nativa WinUI 3
\`\`\`powershell
# Executar a aplicação gráfica com suporte a Fluent Design e streaming em tempo real:
.\\winui\\PersonasAgentes.WinUI.exe
\`\`\`

### 3. Comunicação Segura mTLS
O Go Hub e os clientes de comunicação utilizam certificados locais incluídos em \`bin/tls_certs/\`.

---
*Construído com Bun, C# / WinUI 3, Rust SIMD, Zig e Go Hub.*
`;

fs.writeFileSync(path.join(distDir, "README.md"), readmeContent, "utf-8");

console.log("\n🎉 Pacote de distribuição criado com sucesso em ./dist!");
